/**
 * Enhanced Sentiment Analyzer with Multi-Emotion Detection
 * Supports multiple emotions per mention with confidence scores
 * Uses Hugging Face emotion detection models
 */

const { HfInference } = require('@huggingface/inference');
const logger = require('./utils/logger');

class EmotionAnalyzer {
    constructor() {
        this.hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

        // Primary emotion detection model
        this.emotionModel = 'j-hartmann/emotion-english-distilroberta-base';

        // Fallback model for more granular emotions
        this.fallbackModel = 'SamLowe/roberta-base-go_emotions';

        // Emotion category weights for Rage Index calculation
        this.emotionWeights = {
            // High rage emotions (weight: 1.0)
            anger: 1.0,
            rage: 1.0,
            fury: 1.0,

            // Medium-high rage (weight: 0.8)
            frustration: 0.8,
            annoyance: 0.8,
            disgust: 0.8,
            disappointment: 0.8,

            // Medium rage (weight: 0.6)
            sadness: 0.6,
            fear: 0.6,
            confusion: 0.6,
            disapproval: 0.6,

            // Low rage (weight: 0.3)
            surprise: 0.3,
            nervousness: 0.3,
            embarrassment: 0.3,

            // Neutral (weight: 0)
            neutral: 0,
            realization: 0,

            // Positive emotions (negative weight - reduces rage)
            joy: -0.5,
            admiration: -0.5,
            excitement: -0.5,
            love: -0.7,
            gratitude: -0.6,
            optimism: -0.4,
            pride: -0.5,
            amusement: -0.3,
            approval: -0.4,
            caring: -0.5,
            desire: -0.2,
            relief: -0.4
        };

        // Emotion categories for grouping
        this.emotionCategories = {
            rage: ['anger', 'rage', 'fury', 'annoyance', 'frustration'],
            negative: ['disgust', 'disappointment', 'sadness', 'fear', 'disapproval'],
            positive: ['joy', 'love', 'admiration', 'excitement', 'gratitude', 'optimism'],
            neutral: ['neutral', 'surprise', 'realization', 'confusion']
        };
    }

    /**
     * Analyze emotions in text using Hugging Face model
     * @param {string} text - Text to analyze
     * @param {object} options - Analysis options
     * @returns {Promise<object>} Emotion analysis results
     */
    async analyzeEmotions(text, options = {}) {
        try {
            const useModel = options.granular ? this.fallbackModel : this.emotionModel;

            // Call Hugging Face API
            const response = await this.hf.textClassification({
                model: useModel,
                inputs: text,
                parameters: {
                    top_k: null // Get all emotions, not just top one
                }
            });

            // Process and enhance results
            const emotions = response
                .map(emotion => ({
                    label: emotion.label.toLowerCase(),
                    score: emotion.score,
                    confidence: this.getConfidenceLevel(emotion.score),
                    weight: this.emotionWeights[emotion.label.toLowerCase()] || 0
                }))
                .filter(e => e.score > 0.1) // Filter out very low scores
                .sort((a, b) => b.score - a.score); // Sort by score

            // Calculate primary emotion and distribution
            const primaryEmotion = emotions[0];
            const emotionDistribution = this.calculateDistribution(emotions);
            const emotionCategory = this.categorizeEmotion(primaryEmotion.label);

            logger.info('Emotion analysis complete', {
                textLength: text.length,
                emotionsDetected: emotions.length,
                primaryEmotion: primaryEmotion.label
            });

            return {
                emotions,
                primaryEmotion: primaryEmotion.label,
                primaryScore: primaryEmotion.score,
                emotionDistribution,
                emotionCategory,
                timestamp: new Date()
            };

        } catch (error) {
            logger.error('Emotion analysis failed', { error: error.message });

            // Fallback to basic sentiment if emotion detection fails
            return this.fallbackToBasicSentiment(text);
        }
    }

    /**
     * Analyze emotions for multiple texts in batch
     * @param {Array<string>} texts - Array of texts to analyze
     * @returns {Promise<Array>} Array of emotion analysis results
     */
    async analyzeBatch(texts) {
        const results = [];

        // Process in batches of 10 to avoid rate limits
        for (let i = 0; i < texts.length; i += 10) {
            const batch = texts.slice(i, i + 10);
            const batchResults = await Promise.all(
                batch.map(text => this.analyzeEmotions(text))
            );
            results.push(...batchResults);

            // Small delay between batches
            if (i + 10 < texts.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }

    /**
     * Calculate Rage Index from emotions
     * @param {Array} emotions - Array of emotion objects
     * @returns {object} Rage Index and metadata
     */
    calculateRageIndex(emotions) {
        if (!emotions || emotions.length === 0) {
            return { rageIndex: 0, severity: 'minimal', category: 'neutral' };
        }

        // Calculate weighted score
        let totalWeightedScore = 0;
        let totalWeight = 0;

        emotions.forEach(emotion => {
            const weight = this.emotionWeights[emotion.label] || 0;
            totalWeightedScore += emotion.score * weight;
            totalWeight += Math.abs(weight);
        });

        // Normalize to 0-100 scale
        // Positive emotions reduce the index, negative increase it
        const normalizedScore = totalWeightedScore / (totalWeight || 1);
        const rageIndex = Math.max(0, Math.min(100, (normalizedScore + 1) * 50));

        return {
            rageIndex: Math.round(rageIndex),
            severity: this.getRageSeverity(rageIndex),
            category: this.getRageCategory(emotions),
            dominantEmotions: emotions.slice(0, 3).map(e => e.label)
        };
    }

    /**
     * Calculate aggregated Rage Index for multiple mentions
     * @param {Array} mentions - Array of mention objects with emotions
     * @returns {object} Aggregated Rage Index
     */
    calculateAggregatedRageIndex(mentions) {
        if (!mentions || mentions.length === 0) {
            return { rageIndex: 0, severity: 'minimal', totalMentions: 0 };
        }

        let totalRageIndex = 0;
        const emotionCounts = {};

        mentions.forEach(mention => {
            if (mention.emotions && mention.emotions.length > 0) {
                const mentionRage = this.calculateRageIndex(mention.emotions);
                totalRageIndex += mentionRage.rageIndex;

                // Count emotions
                mention.emotions.forEach(emotion => {
                    emotionCounts[emotion.label] = (emotionCounts[emotion.label] || 0) + 1;
                });
            }
        });

        const avgRageIndex = Math.round(totalRageIndex / mentions.length);

        // Find most common emotions
        const topEmotions = Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([emotion, count]) => ({
                emotion,
                count,
                percentage: Math.round((count / mentions.length) * 100)
            }));

        return {
            rageIndex: avgRageIndex,
            severity: this.getRageSeverity(avgRageIndex),
            totalMentions: mentions.length,
            topEmotions,
            emotionDistribution: this.calculateAggregatedDistribution(mentions)
        };
    }

    /**
     * Get confidence level from score
     * @param {number} score - Emotion score (0-1)
     * @returns {string} Confidence level
     */
    getConfidenceLevel(score) {
        if (score >= 0.7) return 'high';
        if (score >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * Calculate emotion distribution
     * @param {Array} emotions - Array of emotions
     * @returns {object} Distribution percentages
     */
    calculateDistribution(emotions) {
        const total = emotions.reduce((sum, e) => sum + e.score, 0);
        const distribution = {};

        emotions.forEach(emotion => {
            distribution[emotion.label] = Math.round((emotion.score / total) * 100);
        });

        return distribution;
    }

    /**
     * Calculate aggregated distribution across mentions
     * @param {Array} mentions - Array of mentions
     * @returns {object} Aggregated distribution
     */
    calculateAggregatedDistribution(mentions) {
        const emotionTotals = {};
        let totalScore = 0;

        mentions.forEach(mention => {
            if (mention.emotions) {
                mention.emotions.forEach(emotion => {
                    emotionTotals[emotion.label] = (emotionTotals[emotion.label] || 0) + emotion.score;
                    totalScore += emotion.score;
                });
            }
        });

        const distribution = {};
        Object.entries(emotionTotals).forEach(([emotion, score]) => {
            distribution[emotion] = Math.round((score / totalScore) * 100);
        });

        return distribution;
    }

    /**
     * Categorize emotion into broader category
     * @param {string} emotion - Emotion label
     * @returns {string} Category
     */
    categorizeEmotion(emotion) {
        for (const [category, emotions] of Object.entries(this.emotionCategories)) {
            if (emotions.includes(emotion)) {
                return category;
            }
        }
        return 'neutral';
    }

    /**
     * Get rage severity level
     * @param {number} rageIndex - Rage Index (0-100)
     * @returns {string} Severity level
     */
    getRageSeverity(rageIndex) {
        if (rageIndex >= 80) return 'critical';
        if (rageIndex >= 60) return 'high';
        if (rageIndex >= 40) return 'moderate';
        if (rageIndex >= 20) return 'low';
        return 'minimal';
    }

    /**
     * Get rage category from emotions
     * @param {Array} emotions - Array of emotions
     * @returns {string} Rage category
     */
    getRageCategory(emotions) {
        const rageEmotions = emotions.filter(e =>
            this.emotionCategories.rage.includes(e.label)
        );

        if (rageEmotions.length > 0 && rageEmotions[0].score > 0.5) {
            return 'rage';
        }

        const negativeEmotions = emotions.filter(e =>
            this.emotionCategories.negative.includes(e.label)
        );

        if (negativeEmotions.length > 0 && negativeEmotions[0].score > 0.5) {
            return 'negative';
        }

        const positiveEmotions = emotions.filter(e =>
            this.emotionCategories.positive.includes(e.label)
        );

        if (positiveEmotions.length > 0 && positiveEmotions[0].score > 0.5) {
            return 'positive';
        }

        return 'neutral';
    }

    /**
     * Fallback to basic sentiment analysis
     * @param {string} text - Text to analyze
     * @returns {object} Basic sentiment result
     */
    fallbackToBasicSentiment(text) {
        // Simple keyword-based sentiment
        const lowerText = text.toLowerCase();
        const positiveWords = ['good', 'great', 'love', 'excellent', 'amazing'];
        const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'worst'];

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

        return {
            emotions: [{
                label: sentiment === 'positive' ? 'joy' : sentiment === 'negative' ? 'anger' : 'neutral',
                score: 0.5,
                confidence: 'low',
                weight: sentiment === 'positive' ? -0.5 : sentiment === 'negative' ? 1.0 : 0
            }],
            primaryEmotion: sentiment,
            primaryScore: 0.5,
            emotionDistribution: { [sentiment]: 100 },
            emotionCategory: sentiment,
            fallback: true,
            timestamp: new Date()
        };
    }
}

module.exports = EmotionAnalyzer;
