/**
 * Trendline Analyzer
 * Track emotions and Rage Index over time
 */

const { supabase } = require('./supabase');
const logger = require('./utils/logger');
const RageIndexCalculator = require('./utils/rageIndexCalculator');

class TrendlineAnalyzer {
    constructor() {
        this.supabase = supabase;
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
            const spikes = this.detectSpikes(timeline, options);

            // Calculate moving averages
            const movingAverage7d = this.calculateMovingAverage(timeline, 7);
            const movingAverage30d = this.calculateMovingAverage(timeline, 30);

            logger.info('Trendline calculation complete', {
                brandId,
                dataPoints: timeline.length,
                spikesDetected: spikes.length
            });

            return {
                timeline,
                trends,
                spikes,
                movingAverage: movingAverage7d,
                movingAverages: {
                    '7d': movingAverage7d,
                    '30d': movingAverage30d
                },
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
        const { data: analyses, error } = await this.supabase
            .from('analyses')
            .select('*')
            .eq('brand_id', brandId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (error || !analyses) {
            logger.error('Failed to get mentions', { error: error?.message, brandId });
            return [];
        }

        const mentions = [];
        analyses.forEach(row => {
            const list = row.search_results || row.mentions || [];
            if (Array.isArray(list)) {
                mentions.push(...list.map(m => ({
                    ...m,
                    timestamp: new Date(row.created_at)
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
                d.setUTCMinutes(0, 0, 0);
                return d.toISOString();
            case 'day':
                d.setUTCHours(0, 0, 0, 0);
                return d.toISOString();
            case 'week':
                const weekStart = new Date(d);
                weekStart.setUTCDate(d.getUTCDate() - d.getUTCDay());
                weekStart.setUTCHours(0, 0, 0, 0);
                return weekStart.toISOString();
            case 'month':
                d.setUTCDate(1);
                d.setUTCHours(0, 0, 0, 0);
                return d.toISOString();
            default:
                d.setUTCHours(0, 0, 0, 0);
                return d.toISOString();
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
     * Detect spikes using statistical rolling threshold (rolling mean + 2*stdDev)
     * and minimum sample volume checks to eliminate noisy false positives.
     * @param {Array} timeline - Timeline data
     * @param {object} options - Options
     * @returns {Array} Detected spikes
     */
    detectSpikes(timeline, options = {}) {
        if (!timeline || timeline.length === 0) return [];

        const windowSize = options.rollingWindow || 14;
        const minSampleThreshold = options.minSampleThreshold || 5;
        const minDeviationJump = options.minDeviationJump || 10;

        const candidateSpikes = timeline.map((point, index) => {
            // For rolling baseline, take up to windowSize historical points prior to current point (or all points if early)
            const historyStart = Math.max(0, index - windowSize);
            const historicalPoints = index >= 2 
                ? timeline.slice(historyStart, index)
                : timeline.slice(0, Math.min(timeline.length, windowSize));

            const rollingMean = historicalPoints.length > 0
                ? historicalPoints.reduce((sum, p) => sum + p.rageIndex, 0) / historicalPoints.length
                : point.rageIndex;

            let rollingStdDev = this.calculateStdDev(historicalPoints.map(p => p.rageIndex));
            // Floor stdDev to prevent ultra-stable baselines from flagging minor 2-point jumps
            rollingStdDev = Math.max(rollingStdDev, 5);

            const threshold = rollingMean + (2 * rollingStdDev);
            const meetsThreshold = point.rageIndex > threshold;
            const meetsVolume = point.mentionCount >= minSampleThreshold;
            const meetsJump = (point.rageIndex - rollingMean) >= minDeviationJump;

            const isCandidate = meetsThreshold && meetsVolume && meetsJump;

            let severity = 'moderate';
            if (point.rageIndex > rollingMean + (3 * rollingStdDev) || point.rageIndex >= 80) {
                severity = 'critical';
            } else if (point.rageIndex > rollingMean + (2.5 * rollingStdDev) || point.rageIndex >= 65) {
                severity = 'high';
            }

            return {
                point,
                index,
                isCandidate,
                rollingMean: Math.round(rollingMean),
                rollingStdDev: Math.round(rollingStdDev),
                deviation: Math.round(point.rageIndex - rollingMean),
                severity
            };
        });

        const spikes = [];

        candidateSpikes.forEach((c, i) => {
            if (c.isCandidate) {
                // Check run length of consecutive candidate spikes
                let runStart = i;
                let runEnd = i;
                while (runStart > 0 && candidateSpikes[runStart - 1].isCandidate) {
                    runStart--;
                }
                while (runEnd < candidateSpikes.length - 1 && candidateSpikes[runEnd + 1].isCandidate) {
                    runEnd++;
                }
                const runLength = runEnd - runStart + 1;
                const point = c.point;

                spikes.push({
                    timestamp: point.timestamp,
                    date: point.date,
                    rageIndex: point.rageIndex,
                    rollingMean: c.rollingMean,
                    rollingStdDev: c.rollingStdDev,
                    deviation: c.deviation,
                    severity: c.severity,
                    mentionCount: point.mentionCount,
                    isSustained: runLength >= 2,
                    runLength
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
        if (!values || values.length === 0) return 0;
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
            movingAverages: {
                '7d': [],
                '30d': []
            },
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
