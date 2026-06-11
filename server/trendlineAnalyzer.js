/**
 * Trendline Analyzer
 * Track emotions and Rage Index over time
 */

const admin = require('firebase-admin');
const logger = require('./utils/logger');
const RageIndexCalculator = require('./utils/rageIndexCalculator');

class TrendlineAnalyzer {
    constructor() {
        this.db = admin.firestore();
        this.rageCalculator = new RageIndexCalculator();
    }

    /**
     * Calculate trendline for a brand
     * @param {string} brandId - Brand ID
     * @param {object} options - Options
     * @returns {Promise<object>} Trendline data
     */
    async calculateTrendline(brandId, options = {}) {
        try {
            const {
                granularity = 'day', // hour, day, week, month
                period = 30, // days
                includeEmotions = true,
                includePlatforms = true
            } = options;

            logger.info('Calculating trendline', {
                brandId,
                granularity,
                period
            });

            // Get date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - period);

            // Get all mentions in period
            const mentions = await this.getMentionsInPeriod(brandId, startDate, endDate);

            if (mentions.length === 0) {
                logger.warn('No mentions found for trendline', { brandId, period });
                return this.getEmptyTrendline();
            }

            // Group mentions by time bucket
            const timeBuckets = this.groupByTime(mentions, granularity);

            // Calculate metrics for each bucket
            const timeline = Object.entries(timeBuckets).map(([timestamp, bucketMentions]) => {
                const rageData = this.rageCalculator.calculateAggregated(bucketMentions, {
                    byPlatform: includePlatforms
                });

                const dataPoint = {
                    timestamp,
                    date: new Date(timestamp),
                    mentionCount: bucketMentions.length,
                    rageIndex: rageData.rageIndex,
                    severity: rageData.severity
                };

                if (includeEmotions) {
                    dataPoint.topEmotions = rageData.topEmotions.slice(0, 3);
                    dataPoint.emotionDistribution = rageData.emotionDistribution;
                }

                if (includePlatforms) {
                    dataPoint.platformBreakdown = rageData.platformBreakdown;
                }

                return dataPoint;
            }).sort((a, b) => a.date - b.date);

            // Calculate trends
            const trends = this.calculateTrends(timeline);

            // Detect spikes and anomalies
            const spikes = this.detectSpikes(timeline);

            // Calculate moving averages
            const movingAverage = this.calculateMovingAverage(timeline, 7);

            logger.info('Trendline calculation complete', {
                brandId,
                dataPoints: timeline.length,
                spikesDetected: spikes.length
            });

            return {
                timeline,
                trends,
                spikes,
                movingAverage,
                summary: {
                    totalMentions: mentions.length,
                    avgRageIndex: Math.round(timeline.reduce((sum, t) => sum + t.rageIndex, 0) / timeline.length),
                    peakRageIndex: Math.max(...timeline.map(t => t.rageIndex)),
                    lowestRageIndex: Math.min(...timeline.map(t => t.rageIndex)),
                    volatility: this.calculateVolatility(timeline)
                },
                metadata: {
                    brandId,
                    granularity,
                    period,
                    startDate,
                    endDate,
                    calculatedAt: new Date()
                }
            };

        } catch (error) {
            logger.error('Trendline calculation failed', { error: error.message, brandId });
            throw error;
        }
    }

    /**
     * Get mentions in time period
     * @param {string} brandId - Brand ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array>} Mentions
     */
    async getMentionsInPeriod(brandId, startDate, endDate) {
        const snapshot = await this.db.collection('analyses')
            .where('brandId', '==', brandId)
            .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
            .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(endDate))
            .get();

        const mentions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.mentions && Array.isArray(data.mentions)) {
                mentions.push(...data.mentions.map(m => ({
                    ...m,
                    timestamp: data.createdAt.toDate()
                })));
            }
        });

        return mentions;
    }

    /**
     * Group mentions by time bucket
     * @param {Array} mentions - Mentions
     * @param {string} granularity - Time granularity
     * @returns {object} Grouped mentions
     */
    groupByTime(mentions, granularity) {
        const buckets = {};

        mentions.forEach(mention => {
            const timestamp = mention.timestamp || new Date();
            const key = this.getTimeKey(timestamp, granularity);

            if (!buckets[key]) {
                buckets[key] = [];
            }
            buckets[key].push(mention);
        });

        return buckets;
    }

    /**
     * Get time key for grouping
     * @param {Date} date - Date
     * @param {string} granularity - Granularity
     * @returns {string} Time key
     */
    getTimeKey(date, granularity) {
        const d = new Date(date);

        switch (granularity) {
            case 'hour':
                return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).toISOString();
            case 'day':
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
            case 'week':
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay());
                return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).toISOString();
            case 'month':
                return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
            default:
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
        }
    }

    /**
     * Calculate trends
     * @param {Array} timeline - Timeline data
     * @returns {object} Trend data
     */
    calculateTrends(timeline) {
        if (timeline.length < 2) {
            return { direction: 'stable', change: 0, percentChange: 0 };
        }

        const recent = timeline.slice(-7); // Last 7 data points
        const previous = timeline.slice(-14, -7); // Previous 7 data points

        if (previous.length === 0) {
            return { direction: 'stable', change: 0, percentChange: 0 };
        }

        const recentAvg = recent.reduce((sum, t) => sum + t.rageIndex, 0) / recent.length;
        const previousAvg = previous.reduce((sum, t) => sum + t.rageIndex, 0) / previous.length;

        const change = recentAvg - previousAvg;
        const percentChange = previousAvg > 0 ? Math.round((change / previousAvg) * 100) : 0;

        return {
            direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
            change: Math.round(change),
            percentChange,
            recentAvg: Math.round(recentAvg),
            previousAvg: Math.round(previousAvg),
            significance: Math.abs(percentChange) > 20 ? 'significant' : 'minor'
        };
    }

    /**
     * Detect spikes in timeline
     * @param {Array} timeline - Timeline data
     * @returns {Array} Detected spikes
     */
    detectSpikes(timeline) {
        if (timeline.length < 3) return [];

        const avgRageIndex = timeline.reduce((sum, t) => sum + t.rageIndex, 0) / timeline.length;
        const stdDev = this.calculateStdDev(timeline.map(t => t.rageIndex));

        const spikes = [];

        timeline.forEach((point, index) => {
            // Spike if > 2 standard deviations above mean
            if (point.rageIndex > avgRageIndex + (2 * stdDev)) {
                spikes.push({
                    timestamp: point.timestamp,
                    date: point.date,
                    rageIndex: point.rageIndex,
                    deviation: Math.round(point.rageIndex - avgRageIndex),
                    severity: point.rageIndex > avgRageIndex + (3 * stdDev) ? 'critical' : 'high',
                    mentionCount: point.mentionCount
                });
            }
        });

        return spikes;
    }

    /**
     * Calculate moving average
     * @param {Array} timeline - Timeline data
     * @param {number} window - Window size
     * @returns {Array} Moving average
     */
    calculateMovingAverage(timeline, window = 7) {
        const movingAvg = [];

        for (let i = 0; i < timeline.length; i++) {
            const start = Math.max(0, i - window + 1);
            const windowData = timeline.slice(start, i + 1);
            const avg = windowData.reduce((sum, t) => sum + t.rageIndex, 0) / windowData.length;

            movingAvg.push({
                timestamp: timeline[i].timestamp,
                value: Math.round(avg)
            });
        }

        return movingAvg;
    }

    /**
     * Calculate standard deviation
     * @param {Array} values - Values
     * @returns {number} Standard deviation
     */
    calculateStdDev(values) {
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calculate volatility
     * @param {Array} timeline - Timeline data
     * @returns {string} Volatility level
     */
    calculateVolatility(timeline) {
        if (timeline.length < 2) return 'stable';

        const changes = [];
        for (let i = 1; i < timeline.length; i++) {
            changes.push(Math.abs(timeline[i].rageIndex - timeline[i - 1].rageIndex));
        }

        const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

        if (avgChange > 20) return 'very high';
        if (avgChange > 10) return 'high';
        if (avgChange > 5) return 'moderate';
        return 'low';
    }

    /**
     * Get empty trendline
     * @returns {object} Empty trendline
     */
    getEmptyTrendline() {
        return {
            timeline: [],
            trends: { direction: 'stable', change: 0, percentChange: 0 },
            spikes: [],
            movingAverage: [],
            summary: {
                totalMentions: 0,
                avgRageIndex: 0,
                peakRageIndex: 0,
                lowestRageIndex: 0,
                volatility: 'stable'
            }
        };
    }

    /**
     * Compare two time periods
     * @param {string} brandId - Brand ID
     * @param {object} period1 - First period
     * @param {object} period2 - Second period
     * @returns {Promise<object>} Comparison
     */
    async comparePeriods(brandId, period1, period2) {
        const trendline1 = await this.calculateTrendline(brandId, period1);
        const trendline2 = await this.calculateTrendline(brandId, period2);

        return {
            period1: trendline1.summary,
            period2: trendline2.summary,
            comparison: {
                rageIndexChange: trendline2.summary.avgRageIndex - trendline1.summary.avgRageIndex,
                mentionVolumeChange: trendline2.summary.totalMentions - trendline1.summary.totalMentions,
                volatilityChange: `${trendline1.summary.volatility} → ${trendline2.summary.volatility}`
            }
        };
    }
}

module.exports = TrendlineAnalyzer;
