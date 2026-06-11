/**
 * Enhanced Sentiment Analyzer Wrapper
 * Maintains backward compatibility while adding multi-emotion detection
 */

const EmotionAnalyzer = require('./emotionAnalyzer');
const RageIndexCalculator = require('./utils/rageIndexCalculator');
const logger = require('./utils/logger');

class EnhancedSentimentAnalyzer {
    constructor() {
        this.emotionAnalyzer = new EmotionAnalyzer();
        this.rageCalculator = new RageIndexCalculator();

        // Feature flag for gradual rollout
        this.useMultiEmotion = process.env.ENABLE_MULTI_EMOTION === 'true';

        logger.info('Enhanced Sentiment Analyzer initialized', {
            multiEmotionEnabled: this.useMultiEmotion
        });
    }

    /**
     * Analyze sentiment/emotions for a single text
     * @param {string} text - Text to analyze
     * @param {object} options - Analysis options
     * @returns {Promise<object>} Analysis results
     */
    async analyze(text, options = {}) {
        try {
            if (this.useMultiEmotion) {
                // Use new multi-emotion detection
                const emotionResult = await this.emotionAnalyzer.analyzeEmotions(text, options);
                const rageData = this.rageCalculator.calculateForMention(emotionResult.emotions);

                return {
                    // New format
                    emotions: emotionResult.emotions,
                    primaryEmotion: emotionResult.primaryEmotion,
                    emotionDistribution: emotionResult.emotionDistribution,
                    emotionCategory: emotionResult.emotionCategory,

                    // Rage Index 2.0
                    rageIndex: rageData.rageIndex,
                    rageSeverity: rageData.severity,
                    rageCategory: rageData.category,
                    dominantEmotions: rageData.dominantEmotions,

                    // Backward compatibility
                    sentiment: this.mapEmotionToSentiment(emotionResult.primaryEmotion),
                    score: this.mapRageIndexToScore(rageData.rageIndex),

                    metadata: {
                        model: 'multi-emotion',
                        timestamp: new Date(),
                        confidence: emotionResult.emotions[0]?.confidence || 'medium'
                    }
                };
            } else {
                // Fallback to basic sentiment
                return this.basicSentimentAnalysis(text);
            }
        } catch (error) {
            logger.error('Sentiment analysis failed', { error: error.message, text: text.substring(0, 100) });
            return this.basicSentimentAnalysis(text);
        }
    }

    /**
     * Analyze multiple texts in batch
     * @param {Array<string>} texts - Array of texts
     * @returns {Promise<Array>} Array of results
     */
    async analyzeBatch(texts) {
        if (this.useMultiEmotion) {
            const emotionResults = await this.emotionAnalyzer.analyzeBatch(texts);

            return emotionResults.map(emotionResult => {
                const rageData = this.rageCalculator.calculateForMention(emotionResult.emotions);

                return {
                    emotions: emotionResult.emotions,
                    primaryEmotion: emotionResult.primaryEmotion,
                    emotionDistribution: emotionResult.emotionDistribution,
                    rageIndex: rageData.rageIndex,
                    rageSeverity: rageData.severity,
                    sentiment: this.mapEmotionToSentiment(emotionResult.primaryEmotion),
                    score: this.mapRageIndexToScore(rageData.rageIndex)
                };
            });
        } else {
            return texts.map(text => this.basicSentimentAnalysis(text));
        }
    }

    /**
     * Calculate aggregated analysis for brand mentions
     * @param {Array} mentions - Array of mention objects
     * @param {object} options - Aggregation options
     * @returns {object} Aggregated results
     */
    async analyzeAggregated(mentions, options = {}) {
        if (!mentions || mentions.length === 0) {
            return this.getEmptyAggregation();
        }

        if (this.useMultiEmotion) {
            // Calculate aggregated rage index
            const aggregatedRage = this.rageCalculator.calculateAggregated(mentions, {
                byPlatform: options.byPlatform !== false,
                byTime: options.byTime !== false,
                timeGranularity: options.timeGranularity || 'day'
            });

            return {
                // Rage Index 2.0 data
                rageIndex: aggregatedRage.rageIndex,
                rageSeverity: aggregatedRage.severity,
                topEmotions: aggregatedRage.topEmotions,
                emotionDistribution: aggregatedRage.emotionDistribution,
                severityBreakdown: aggregatedRage.severityBreakdown,

                // Platform breakdown
                platformBreakdown: aggregatedRage.platformBreakdown,

                // Time-series data
                trendline: aggregatedRage.timeBreakdown,

                // Backward compatibility
                sentiment: this.mapRageIndexToSentiment(aggregatedRage.rageIndex),
                totalMentions: aggregatedRage.totalMentions,

                metadata: aggregatedRage.metadata
            };
        } else {
            return this.basicAggregatedAnalysis(mentions);
        }
    }

    /**
     * Calculate trend between two time periods
     * @param {object} currentData - Current period data
     * @param {object} previousData - Previous period data
     * @returns {object} Trend analysis
     */
    calculateTrend(currentData, previousData) {
        if (!currentData || !previousData) {
            return { trend: 'stable', change: 0, percentChange: 0 };
        }

        return this.rageCalculator.calculateTrend(
            currentData.rageIndex || 0,
            previousData.rageIndex || 0
        );
    }

    /**
     * Map emotion to basic sentiment for backward compatibility
     * @param {string} emotion - Primary emotion
     * @returns {string} Sentiment (positive/negative/neutral)
     */
    mapEmotionToSentiment(emotion) {
        const positiveEmotions = ['joy', 'love', 'admiration', 'excitement', 'gratitude', 'optimism', 'pride'];
        const negativeEmotions = ['anger', 'disgust', 'fear', 'sadness', 'annoyance', 'frustration', 'disappointment'];

        if (positiveEmotions.includes(emotion)) return 'positive';
        if (negativeEmotions.includes(emotion)) return 'negative';
        return 'neutral';
    }

    /**
     * Map Rage Index to sentiment score for backward compatibility
     * @param {number} rageIndex - Rage Index (0-100)
     * @returns {number} Score (-1 to 1)
     */
    mapRageIndexToScore(rageIndex) {
        // Convert 0-100 to -1 to 1 scale
        return ((100 - rageIndex) / 50) - 1;
    }

    /**
     * Map Rage Index to sentiment category
     * @param {number} rageIndex - Rage Index (0-100)
     * @returns {string} Sentiment category
     */
    mapRageIndexToSentiment(rageIndex) {
        if (rageIndex >= 60) return 'negative';
        if (rageIndex >= 40) return 'mixed';
        return 'positive';
    }

    /**
     * Basic sentiment analysis fallback
     * @param {string} text - Text to analyze
     * @returns {object} Basic sentiment result
     */
    basicSentimentAnalysis(text) {
        const lowerText = text.toLowerCase();
        const positiveWords = ['good', 'great', 'love', 'excellent', 'amazing', 'awesome', 'fantastic'];
        const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'worst', 'horrible', 'disgusting'];

        let positiveCount = 0;
        let negativeCount = 0;

        positiveWords.forEach(word => {
            if (lowerText.includes(word)) positiveCount++;
        });

        negativeWords.forEach(word => {
            if (lowerText.includes(word)) negativeCount++;
        });

        const sentiment = positiveCount > negativeCount ? 'positive' :
            negativeCount > positiveCount ? 'negative' : 'neutral';

        const score = positiveCount > 0 || negativeCount > 0
            ? (positiveCount - negativeCount) / (positiveCount + negativeCount)
            : 0;

        return {
            sentiment,
            score,
            emotions: [{ label: sentiment, score: Math.abs(score), confidence: 'low' }],
            primaryEmotion: sentiment,
            rageIndex: sentiment === 'negative' ? 70 : sentiment === 'positive' ? 20 : 40,
            rageSeverity: sentiment === 'negative' ? 'high' : 'low',
            metadata: {
                model: 'basic',
                fallback: true,
                timestamp: new Date()
            }
        };
    }

    /**
     * Basic aggregated analysis fallback
     * @param {Array} mentions - Mentions to analyze
     * @returns {object} Basic aggregated result
     */
    basicAggregatedAnalysis(mentions) {
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        mentions.forEach(mention => {
            if (mention.sentiment === 'positive') positiveCount++;
            else if (mention.sentiment === 'negative') negativeCount++;
            else neutralCount++;
        });

        const total = mentions.length;
        const rageIndex = Math.round((negativeCount / total) * 100);

        return {
            rageIndex,
            rageSeverity: this.rageCalculator.getSeverity(rageIndex),
            sentiment: negativeCount > positiveCount ? 'negative' : 'positive',
            totalMentions: total,
            emotionDistribution: {
                positive: Math.round((positiveCount / total) * 100),
                negative: Math.round((negativeCount / total) * 100),
                neutral: Math.round((neutralCount / total) * 100)
            },
            metadata: {
                model: 'basic',
                timestamp: new Date()
            }
        };
    }

    /**
     * Get empty aggregation result
     * @returns {object} Empty result
     */
    getEmptyAggregation() {
        return {
            rageIndex: 0,
            rageSeverity: 'minimal',
            sentiment: 'neutral',
            totalMentions: 0,
            emotionDistribution: {},
            topEmotions: [],
            platformBreakdown: {},
            trendline: [],
            metadata: {
                timestamp: new Date()
            }
        };
    }

    /**
     * Enable or disable multi-emotion detection
     * @param {boolean} enabled - Enable multi-emotion
     */
    setMultiEmotionEnabled(enabled) {
        this.useMultiEmotion = enabled;
        logger.info('Multi-emotion detection toggled', { enabled });
    }

    /**
     * Get current configuration
     * @returns {object} Configuration
     */
    getConfig() {
        return {
            multiEmotionEnabled: this.useMultiEmotion,
            emotionModel: this.emotionAnalyzer.emotionModel,
            emotionWeights: this.rageCalculator.emotionWeights
        };
    }
}

module.exports = EnhancedSentimentAnalyzer;
