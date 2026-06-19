/**
 * Rage Index 2.0 Calculator
 * Advanced emotion-weighted scoring system
 */

const logger = require('./logger');

class RageIndexCalculator {
    constructor() {
        // Emotion weights for Rage Index calculation
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
    }

    /**
     * Calculate Rage Index for a single mention
     * @param {Array} emotions - Array of emotion objects with label and score
     * @param {object} mention - The mention object (optional, for confidence adjustment)
     * @returns {object} Rage Index data
     */
    calculateForMention(emotions, mention = {}) {
        if (!emotions || emotions.length === 0) {
            return {
                rageIndex: 0,
                severity: 'minimal',
                category: 'neutral',
                dominantEmotions: []
            };
        }

        // Calculate weighted score
        let totalWeightedScore = 0;
        let totalAbsoluteWeight = 0;

        emotions.forEach(emotion => {
            const weight = this.emotionWeights[emotion.label] || 0;
            const weightedScore = emotion.score * weight;
            totalWeightedScore += weightedScore;
            totalAbsoluteWeight += Math.abs(weight) * emotion.score;
        });

        // Normalize to 0-100 scale
        // Formula: ((weighted_score / max_possible_score) + 1) * 50
        // This maps -1 to 1 range into 0 to 100
        const normalizedScore = totalAbsoluteWeight > 0
            ? totalWeightedScore / totalAbsoluteWeight
            : 0;

        let rageIndex = Math.max(0, Math.min(100, (normalizedScore + 1) * 50));

        // Confidence adjustment: pull 30% toward neutral (50) if confidence is 'low'
        const hasLowConfidence = mention.confidence === 'low' || 
                                 emotions.some(e => e.confidence === 'low') ||
                                 mention.isAmbiguous ||
                                 mention.isSarcastic; // sarcasm flips polarity but also reduces confidence

        if (hasLowConfidence) {
            rageIndex = (rageIndex * 0.7) + (50 * 0.3);
        }

        return {
            rageIndex: Math.round(rageIndex),
            severity: this.getSeverity(rageIndex),
            category: this.getCategory(emotions),
            dominantEmotions: emotions
                .slice(0, 3)
                .map(e => ({ emotion: e.label, score: e.score })),
            rawScore: normalizedScore
        };
    }

    /**
     * Calculate aggregated Rage Index for multiple mentions
     * @param {Array} mentions - Array of mention objects with emotions
     * @param {object} options - Calculation options
     * @returns {object} Aggregated Rage Index data
     */
    calculateAggregated(mentions, options = {}) {
        if (!mentions || mentions.length === 0) {
            return {
                rageIndex: 0,
                severity: 'minimal',
                totalMentions: 0,
                breakdown: {}
            };
        }

        let totalWeightedRageIndex = 0;
        let totalWeight = 0;
        const emotionCounts = {};
        const emotionScores = {};
        const emotionWeightSums = {};
        const severityCounts = {
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0,
            minimal: 0
        };

        const now = new Date();

        // Calculate rage index for each mention
        mentions.forEach(mention => {
            if (mention.emotions && mention.emotions.length > 0) {
                // 1. Temporal Decay Weighting: exp(-0.1 * days)
                let temporalWeight = 1.0;
                const publishedDate = mention.publishedAt || mention.timestamp || mention.createdAt;
                if (publishedDate) {
                    const daysSincePublished = Math.max(0, (now - new Date(publishedDate)) / (1000 * 60 * 60 * 24));
                    if (!isNaN(daysSincePublished)) {
                        temporalWeight = Math.exp(-0.1 * daysSincePublished);
                    }
                }

                // 2. Engagement Amplification: 1 + log10(1 + upvotes + replies * 2)
                const upvotes = mention.upvotes || mention.platformMeta?.upvotes || mention.engagement?.upvotes || 0;
                const replies = mention.replies || mention.platformMeta?.commentCount || mention.platformMeta?.replies || mention.engagement?.replies || 0;
                const engagementMultiplier = 1 + Math.log10(1 + upvotes + replies * 2);

                const weight = temporalWeight * engagementMultiplier;

                // Calculate mention rage index (includes confidence-adjusted scoring)
                const mentionRage = this.calculateForMention(mention.emotions, mention);
                
                totalWeightedRageIndex += mentionRage.rageIndex * weight;
                totalWeight += weight;
                
                severityCounts[mentionRage.severity]++;

                // Aggregate emotion data weighted
                mention.emotions.forEach(emotion => {
                    emotionCounts[emotion.label] = (emotionCounts[emotion.label] || 0) + 1;
                    emotionScores[emotion.label] = (emotionScores[emotion.label] || 0) + (emotion.score * weight);
                    emotionWeightSums[emotion.label] = (emotionWeightSums[emotion.label] || 0) + weight;
                });
            }
        });

        // 3. Bayesian Smoothing: (sampleSize * rawRageIndex + priorWeight * prior) / (sampleSize + priorWeight)
        const rawRageIndex = totalWeight > 0 ? (totalWeightedRageIndex / totalWeight) : 40;
        const sampleSize = totalWeight; // Use total weight as effective sample size for smoothing
        const prior = 40;
        const priorWeight = 10;
        const avgRageIndex = Math.round((sampleSize * rawRageIndex + priorWeight * prior) / (sampleSize + priorWeight));

        // Calculate top emotions by frequency and intensity
        const topEmotions = Object.entries(emotionCounts)
            .map(([emotion, count]) => ({
                emotion,
                count,
                avgScore: parseFloat((emotionScores[emotion] / (emotionWeightSums[emotion] || 1)).toFixed(4)),
                percentage: Math.round((count / mentions.length) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Calculate emotion distribution
        const totalEmotionScore = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
        const emotionDistribution = {};

        Object.entries(emotionScores).forEach(([emotion, score]) => {
            emotionDistribution[emotion] = Math.round((score / (totalEmotionScore || 1)) * 100);
        });

        // Platform breakdown if provided
        const platformBreakdown = options.byPlatform
            ? this.calculateByPlatform(mentions)
            : null;

        // Time-based breakdown if provided
        const timeBreakdown = options.byTime
            ? this.calculateByTime(mentions, options.timeGranularity || 'day')
            : null;

        return {
            rageIndex: avgRageIndex,
            severity: this.getSeverity(avgRageIndex),
            totalMentions: mentions.length,
            topEmotions,
            emotionDistribution,
            severityBreakdown: severityCounts,
            platformBreakdown,
            timeBreakdown,
            metadata: {
                calculatedAt: new Date(),
                mentionsAnalyzed: mentions.length,
                avgEmotionsPerMention: (Object.values(emotionCounts).reduce((a, b) => a + b, 0) / mentions.length).toFixed(2)
            }
        };
    }

    /**
     * Calculate Rage Index by platform
     * @param {Array} mentions - Mentions with platform data
     * @returns {object} Platform breakdown
     */
    calculateByPlatform(mentions) {
        const platformData = {};

        mentions.forEach(mention => {
            const platform = mention.platform || 'unknown';

            if (!platformData[platform]) {
                platformData[platform] = {
                    mentions: [],
                    count: 0
                };
            }

            platformData[platform].mentions.push(mention);
            platformData[platform].count++;
        });

        const breakdown = {};
        Object.entries(platformData).forEach(([platform, data]) => {
            const platformRage = this.calculateAggregated(data.mentions);
            breakdown[platform] = {
                rageIndex: platformRage.rageIndex,
                severity: platformRage.severity,
                mentionCount: data.count,
                percentage: Math.round((data.count / mentions.length) * 100),
                topEmotions: platformRage.topEmotions.slice(0, 3)
            };
        });

        return breakdown;
    }

    /**
     * Calculate Rage Index over time
     * @param {Array} mentions - Mentions with timestamps
     * @param {string} granularity - 'hour', 'day', 'week', 'month'
     * @returns {Array} Time-series data
     */
    calculateByTime(mentions, granularity = 'day') {
        const timeData = {};

        mentions.forEach(mention => {
            const timestamp = mention.timestamp || mention.createdAt || new Date();
            const timeKey = this.getTimeKey(timestamp, granularity);

            if (!timeData[timeKey]) {
                timeData[timeKey] = [];
            }

            timeData[timeKey].push(mention);
        });

        return Object.entries(timeData)
            .map(([timeKey, timeMentions]) => {
                const rageData = this.calculateAggregated(timeMentions);
                return {
                    timestamp: timeKey,
                    rageIndex: rageData.rageIndex,
                    severity: rageData.severity,
                    mentionCount: timeMentions.length,
                    topEmotions: rageData.topEmotions.slice(0, 3)
                };
            })
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Calculate trend between two time periods
     * @param {number} currentRageIndex - Current period rage index
     * @param {number} previousRageIndex - Previous period rage index
     * @returns {object} Trend data
     */
    calculateTrend(currentRageIndex, previousRageIndex) {
        const change = currentRageIndex - previousRageIndex;
        const percentChange = previousRageIndex > 0
            ? Math.round((change / previousRageIndex) * 100)
            : 0;

        return {
            change,
            percentChange,
            direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
            significance: this.getTrendSignificance(Math.abs(percentChange))
        };
    }

    /**
     * Get severity level from rage index
     * @param {number} rageIndex - Rage index (0-100)
     * @returns {string} Severity level
     */
    getSeverity(rageIndex) {
        if (rageIndex >= 80) return 'critical';
        if (rageIndex >= 60) return 'high';
        if (rageIndex >= 40) return 'moderate';
        if (rageIndex >= 20) return 'low';
        return 'minimal';
    }

    /**
     * Get category from emotions
     * @param {Array} emotions - Array of emotions
     * @returns {string} Category
     */
    getCategory(emotions) {
        if (!emotions || emotions.length === 0) return 'neutral';

        const primaryEmotion = emotions[0].label;
        const weight = this.emotionWeights[primaryEmotion] || 0;

        if (weight >= 0.8) return 'rage';
        if (weight >= 0.3) return 'negative';
        if (weight <= -0.3) return 'positive';
        return 'neutral';
    }

    /**
     * Get trend significance
     * @param {number} percentChange - Absolute percent change
     * @returns {string} Significance level
     */
    getTrendSignificance(percentChange) {
        if (percentChange >= 50) return 'major';
        if (percentChange >= 20) return 'significant';
        if (percentChange >= 10) return 'moderate';
        if (percentChange >= 5) return 'minor';
        return 'negligible';
    }

    /**
     * Get time key for grouping
     * @param {Date} timestamp - Timestamp
     * @param {string} granularity - Time granularity
     * @returns {string} Time key
     */
    getTimeKey(timestamp, granularity) {
        const date = new Date(timestamp);

        switch (granularity) {
            case 'hour':
                return date.toISOString().slice(0, 13) + ':00:00';
            case 'day':
                return date.toISOString().slice(0, 10);
            case 'week':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                return weekStart.toISOString().slice(0, 10);
            case 'month':
                return date.toISOString().slice(0, 7);
            default:
                return date.toISOString().slice(0, 10);
        }
    }

    /**
     * Get severity color for UI
     * @param {string} severity - Severity level
     * @returns {string} Color code
     */
    getSeverityColor(severity) {
        const colors = {
            critical: '#DC2626', // red-600
            high: '#EA580C',     // orange-600
            moderate: '#F59E0B', // amber-500
            low: '#10B981',      // green-500
            minimal: '#6B7280'   // gray-500
        };
        return colors[severity] || colors.minimal;
    }

    /**
     * Get severity icon for UI
     * @param {string} severity - Severity level
     * @returns {string} Icon name
     */
    getSeverityIcon(severity) {
        const icons = {
            critical: 'alert-circle',
            high: 'alert-triangle',
            moderate: 'info',
            low: 'check-circle',
            minimal: 'minus-circle'
        };
        return icons[severity] || icons.minimal;
    }
}

module.exports = RageIndexCalculator;
