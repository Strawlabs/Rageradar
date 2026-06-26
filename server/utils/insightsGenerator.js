/**
 * Automated Insights Generator
 * Generate actionable insights from brand analysis data
 */

const logger = require('./logger');
const RageIndexCalculator = require('./rageIndexCalculator');
const ThemeExtractor = require('./themeExtractor');

class InsightsGenerator {
    constructor() {
        this.rageCalculator = new RageIndexCalculator();
        this.themeExtractor = new ThemeExtractor();

        // Insight templates
        this.templates = {
            spike: {
                icon: '🔴',
                category: 'alert',
                priority: 'high'
            },
            improvement: {
                icon: '🟢',
                category: 'positive',
                priority: 'medium'
            },
            trend: {
                icon: '📈',
                category: 'trend',
                priority: 'medium'
            },
            platform: {
                icon: '💬',
                category: 'platform',
                priority: 'low'
            },
            theme: {
                icon: '🔍',
                category: 'theme',
                priority: 'medium'
            },
            volume: {
                icon: '📊',
                category: 'volume',
                priority: 'low'
            }
        };
    }

    /**
     * Generate insights from analysis data
     * @param {object} data - Analysis data
     * @returns {Promise<object>} Generated insights, executive summary, and recommendations
     */
    async generateInsights(data) {
        // Delegate to LLM-powered AI Insights Engine if configured
        const hasOpenAi = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key';
        const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key';
        const enableLLM = process.env.ENABLE_LLM_INSIGHTS === 'true';

        if (hasOpenAi || hasGemini || enableLLM) {
            try {
                const AIInsightsEngine = require('../ai/insightsEngine/aiInsightsEngine');
                const engine = new AIInsightsEngine();
                return await engine.generateLLMInsights(data);
            } catch (error) {
                logger.error('AI Insights Engine failed, falling back to legacy templates', { error: error.message });
            }
        }

        try {
            const {
                currentAnalysis,
                previousAnalysis,
                trendline,
                themes
            } = data;

            logger.info('Generating legacy template insights', {
                hasCurrent: !!currentAnalysis,
                hasPrevious: !!previousAnalysis,
                hasTrendline: !!trendline,
                hasThemes: !!themes
            });

            const insights = [];

            // 1. Rage Index insights
            if (currentAnalysis && previousAnalysis) {
                insights.push(...this.generateRageIndexInsights(currentAnalysis, previousAnalysis));
            }

            // 2. Trend insights
            if (trendline && trendline.trends) {
                insights.push(...this.generateTrendInsights(trendline));
            }

            // 3. Spike detection insights
            if (trendline && trendline.spikes) {
                insights.push(...this.generateSpikeInsights(trendline.spikes));
            }

            // 4. Theme insights
            if (themes && themes.length > 0) {
                insights.push(...this.generateThemeInsights(themes));
            }

            // 5. Platform insights
            if (currentAnalysis && currentAnalysis.platformBreakdown) {
                insights.push(...this.generatePlatformInsights(currentAnalysis.platformBreakdown));
            }

            // 6. Volume insights
            if (currentAnalysis && previousAnalysis) {
                insights.push(...this.generateVolumeInsights(currentAnalysis, previousAnalysis));
            }

            // 7. Emotion shift insights
            if (currentAnalysis && previousAnalysis) {
                insights.push(...this.generateEmotionInsights(currentAnalysis, previousAnalysis));
            }

            // Sort by priority and score
            const sortedInsights = insights
                .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                    if (priorityDiff !== 0) return priorityDiff;
                    return (b.score || 0) - (a.score || 0);
                })
                .slice(0, 10); // Top 10 insights

            logger.info('Legacy insights generated', {
                totalInsights: insights.length,
                topInsights: sortedInsights.length
            });

            const summaryObj = this.generateSummary(sortedInsights);
            const recommendations = sortedInsights
                .filter(i => i.recommendation)
                .map((i, idx) => ({
                    priority: i.priority || 'medium',
                    recommendation: i.recommendation,
                    evidence: i.description || i.title
                }));

            return {
                executiveSummary: summaryObj.text,
                recommendations,
                insights: sortedInsights
            };

        } catch (error) {
            logger.error('Insight generation failed', { error: error.message });
            return {
                executiveSummary: 'Sentiment data analysis is temporarily unavailable.',
                recommendations: [],
                insights: []
            };
        }
    }

    /**
     * Generate Rage Index insights
     * @param {object} current - Current analysis
     * @param {object} previous - Previous analysis
     * @returns {Array} Insights
     */
    generateRageIndexInsights(current, previous) {
        const insights = [];
        const change = current.rageIndex - previous.rageIndex;
        const percentChange = previous.rageIndex > 0
            ? Math.round((change / previous.rageIndex) * 100)
            : 0;

        // Critical spike
        if (change > 30) {
            insights.push({
                ...this.templates.spike,
                type: 'rage_spike_critical',
                title: 'Critical Rage Spike Detected',
                description: `Rage Index increased by ${change} points (${percentChange}%) from ${previous.rageIndex} to ${current.rageIndex}`,
                recommendation: 'Immediate action required. Review recent changes, announcements, or incidents. Consider issuing a statement or addressing concerns publicly.',
                score: 100,
                data: { change, percentChange, current: current.rageIndex, previous: previous.rageIndex }
            });
        }
        // Significant increase
        else if (change > 15) {
            insights.push({
                ...this.templates.spike,
                type: 'rage_spike',
                title: 'Significant Rage Increase',
                description: `Rage Index increased by ${change} points (${percentChange}%)`,
                recommendation: 'Monitor closely. Investigate potential causes and prepare response if trend continues.',
                score: 75,
                data: { change, percentChange }
            });
        }
        // Significant improvement
        else if (change < -15) {
            insights.push({
                ...this.templates.improvement,
                type: 'rage_improvement',
                title: 'Positive Sentiment Improvement',
                description: `Rage Index decreased by ${Math.abs(change)} points (${Math.abs(percentChange)}%)`,
                recommendation: 'Great progress! Analyze what worked well and continue these practices.',
                score: 80,
                data: { change, percentChange }
            });
        }

        // Severity change
        if (current.severity !== previous.severity) {
            const worsened = this.getSeverityLevel(current.severity) > this.getSeverityLevel(previous.severity);

            insights.push({
                icon: worsened ? '⚠️' : '✅',
                category: worsened ? 'alert' : 'positive',
                priority: worsened ? 'high' : 'medium',
                type: 'severity_change',
                title: `Severity Level ${worsened ? 'Increased' : 'Decreased'}`,
                description: `Changed from ${previous.severity} to ${current.severity}`,
                recommendation: worsened
                    ? 'Escalate monitoring and prepare response strategies.'
                    : 'Continue current approach, situation improving.',
                score: worsened ? 70 : 60,
                data: { from: previous.severity, to: current.severity }
            });
        }

        return insights;
    }

    /**
     * Generate trend insights
     * @param {object} trendline - Trendline data
     * @returns {Array} Insights
     */
    generateTrendInsights(trendline) {
        const insights = [];
        const { trends } = trendline;

        if (trends.direction === 'increasing' && Math.abs(trends.percentChange) > 10) {
            insights.push({
                ...this.templates.trend,
                type: 'trend_increasing',
                title: 'Upward Rage Trend Detected',
                description: `Rage Index trending upward by ${trends.percentChange}% over recent period`,
                recommendation: 'Identify root causes. Review recent product changes, customer support issues, or market events.',
                score: 65,
                data: trends
            });
        } else if (trends.direction === 'decreasing' && Math.abs(trends.percentChange) > 10) {
            insights.push({
                ...this.templates.improvement,
                type: 'trend_decreasing',
                title: 'Positive Downward Trend',
                description: `Rage Index trending downward by ${Math.abs(trends.percentChange)}% over recent period`,
                recommendation: 'Positive momentum! Document successful strategies for future reference.',
                score: 60,
                data: trends
            });
        }

        // Volatility insight
        if (trendline.summary && trendline.summary.volatility === 'very high') {
            insights.push({
                icon: '⚡',
                category: 'alert',
                priority: 'high',
                type: 'high_volatility',
                title: 'High Sentiment Volatility',
                description: 'Rage Index showing significant daily fluctuations',
                recommendation: 'Unstable sentiment indicates ongoing issues. Establish consistent communication and address concerns systematically.',
                score: 70,
                data: { volatility: trendline.summary.volatility }
            });
        }

        return insights;
    }

    /**
     * Generate spike insights
     * @param {Array} spikes - Detected spikes
     * @returns {Array} Insights
     */
    generateSpikeInsights(spikes) {
        const insights = [];

        if (spikes.length > 0) {
            const recentSpikes = spikes.filter(s => {
                const daysSince = (new Date() - new Date(s.date)) / (1000 * 60 * 60 * 24);
                return daysSince <= 7;
            });

            if (recentSpikes.length > 0) {
                const latestSpike = recentSpikes[recentSpikes.length - 1];

                insights.push({
                    ...this.templates.spike,
                    type: 'recent_spike',
                    title: `Rage Spike on ${new Date(latestSpike.date).toLocaleDateString()}`,
                    description: `Rage Index reached ${latestSpike.rageIndex} (${latestSpike.deviation} points above average)`,
                    recommendation: 'Investigate what happened on this date. Check for product issues, announcements, or external events.',
                    score: 85,
                    data: latestSpike
                });
            }

            // Multiple spikes
            if (spikes.length >= 3) {
                insights.push({
                    icon: '🔥',
                    category: 'alert',
                    priority: 'high',
                    type: 'multiple_spikes',
                    title: 'Recurring Rage Spikes',
                    description: `${spikes.length} rage spikes detected in the analysis period`,
                    recommendation: 'Pattern of recurring issues. Conduct root cause analysis to identify and fix systemic problems.',
                    score: 80,
                    data: { spikeCount: spikes.length, spikes: spikes.slice(-3) }
                });
            }
        }

        return insights;
    }

    /**
     * Generate theme insights
     * @param {Array} themes - Extracted themes
     * @returns {Array} Insights
     */
    generateThemeInsights(themes) {
        const insights = [];

        if (themes.length > 0) {
            const topTheme = themes[0];

            insights.push({
                ...this.templates.theme,
                type: 'top_rage_theme',
                title: `Top Rage Topic: "${topTheme.theme}"`,
                description: `Mentioned in ${topTheme.percentage}% of high-rage mentions (${topTheme.mentionCount} times)`,
                recommendation: `Address concerns about "${topTheme.theme}". Review related features, communications, or support issues.`,
                score: 55,
                data: topTheme
            });

            // Multiple high-intensity themes
            const highIntensityThemes = themes.filter(t => t.intensityScore > 50);
            if (highIntensityThemes.length >= 3) {
                insights.push({
                    ...this.templates.theme,
                    type: 'multiple_themes',
                    title: 'Multiple High-Intensity Topics',
                    description: `${highIntensityThemes.length} topics generating significant rage: ${highIntensityThemes.slice(0, 3).map(t => t.theme).join(', ')}`,
                    recommendation: 'Prioritize addressing these topics. Consider creating a comprehensive response plan.',
                    score: 65,
                    data: { themes: highIntensityThemes.slice(0, 5) }
                });
            }
        }

        return insights;
    }

    /**
     * Generate platform insights
     * @param {object} platformBreakdown - Platform breakdown data
     * @returns {Array} Insights
     */
    generatePlatformInsights(platformBreakdown) {
        const insights = [];

        if (!platformBreakdown) return insights;

        const platforms = Object.entries(platformBreakdown)
            .sort((a, b) => b[1].rageIndex - a[1].rageIndex);

        if (platforms.length > 0) {
            const [worstPlatform, worstData] = platforms[0];

            if (worstData.rageIndex >= 70) {
                insights.push({
                    ...this.templates.platform,
                    type: 'platform_hotspot',
                    title: `${worstPlatform} is a Rage Hotspot`,
                    description: `Rage Index on ${worstPlatform}: ${worstData.rageIndex} (${worstData.percentage}% of mentions)`,
                    recommendation: `Focus on ${worstPlatform} community. Engage directly, address concerns, and improve presence on this platform.`,
                    score: 60,
                    data: { platform: worstPlatform, ...worstData }
                });
            }

            // Platform disparity
            if (platforms.length >= 2) {
                const [best, bestData] = platforms[platforms.length - 1];
                const disparity = worstData.rageIndex - bestData.rageIndex;

                if (disparity > 30) {
                    insights.push({
                        ...this.templates.platform,
                        type: 'platform_disparity',
                        title: 'Large Platform Sentiment Gap',
                        description: `${worstPlatform} (${worstData.rageIndex}) vs ${best} (${bestData.rageIndex}) - ${disparity} point difference`,
                        recommendation: `Analyze why sentiment differs across platforms. Apply successful strategies from ${best} to ${worstPlatform}.`,
                        score: 50,
                        data: { worst: worstPlatform, best, disparity }
                    });
                }
            }
        }

        return insights;
    }

    /**
     * Generate volume insights
     * @param {object} current - Current analysis
     * @param {object} previous - Previous analysis
     * @returns {Array} Insights
     */
    generateVolumeInsights(current, previous) {
        const insights = [];

        const volumeChange = current.totalMentions - previous.totalMentions;
        const percentChange = previous.totalMentions > 0
            ? Math.round((volumeChange / previous.totalMentions) * 100)
            : 0;

        // Significant volume increase
        if (percentChange > 100) {
            insights.push({
                ...this.templates.volume,
                type: 'volume_spike',
                title: 'Mention Volume Surge',
                description: `Mentions increased by ${percentChange}% (${volumeChange} more mentions)`,
                recommendation: 'High engagement detected. Monitor for both positive and negative sentiment drivers.',
                score: 55,
                data: { volumeChange, percentChange }
            });
        }
        // Significant volume decrease
        else if (percentChange < -50) {
            insights.push({
                ...this.templates.volume,
                type: 'volume_drop',
                title: 'Mention Volume Declined',
                description: `Mentions decreased by ${Math.abs(percentChange)}%`,
                recommendation: 'Reduced visibility. Consider increasing marketing efforts or community engagement.',
                score: 45,
                data: { volumeChange, percentChange }
            });
        }

        return insights;
    }

    /**
     * Generate emotion insights
     * @param {object} current - Current analysis
     * @param {object} previous - Previous analysis
     * @returns {Array} Insights
     */
    generateEmotionInsights(current, previous) {
        const insights = [];

        if (!current.topEmotions || !previous.topEmotions) return insights;

        const currentTop = current.topEmotions[0]?.emotion;
        const previousTop = previous.topEmotions[0]?.emotion;

        if (currentTop && previousTop && currentTop !== previousTop) {
            insights.push({
                icon: '🔄',
                category: 'trend',
                priority: 'medium',
                type: 'emotion_shift',
                title: 'Primary Emotion Changed',
                description: `Dominant emotion shifted from ${previousTop} to ${currentTop}`,
                recommendation: 'Analyze what triggered this emotional shift. Adjust communication strategy accordingly.',
                score: 50,
                data: { from: previousTop, to: currentTop }
            });
        }

        return insights;
    }

    /**
     * Get severity level as number
     * @param {string} severity - Severity string
     * @returns {number} Severity level
     */
    getSeverityLevel(severity) {
        const levels = { minimal: 1, low: 2, moderate: 3, high: 4, critical: 5 };
        return levels[severity] || 0;
    }

    /**
     * Generate summary insight
     * @param {Array} insights - All insights
     * @returns {object} Summary insight
     */
    generateSummary(insights) {
        const highPriority = insights.filter(i => i.priority === 'high').length;
        const alerts = insights.filter(i => i.category === 'alert').length;
        const positive = insights.filter(i => i.category === 'positive').length;

        let summaryText = '';
        let summaryIcon = '📊';

        if (highPriority > 0) {
            summaryText = `${highPriority} critical issue${highPriority > 1 ? 's' : ''} requiring immediate attention`;
            summaryIcon = '🚨';
        } else if (alerts > 0) {
            summaryText = `${alerts} alert${alerts > 1 ? 's' : ''} to monitor`;
            summaryIcon = '⚠️';
        } else if (positive > 0) {
            summaryText = `${positive} positive trend${positive > 1 ? 's' : ''} detected`;
            summaryIcon = '✅';
        } else {
            summaryText = 'Sentiment stable, no major concerns';
            summaryIcon = '📊';
        }

        return {
            icon: summaryIcon,
            text: summaryText,
            breakdown: {
                highPriority,
                alerts,
                positive,
                total: insights.length
            }
        };
    }
}

module.exports = InsightsGenerator;
