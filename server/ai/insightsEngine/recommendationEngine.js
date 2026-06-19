/**
 * Recommendation Engine
 * Generates actionable items with priority, recommendation details, and evidence.
 */

const logger = require('../../utils/logger');

class RecommendationEngine {
    constructor() {}

    /**
     * Generate recommendations
     * @param {object} data - Brand analysis data
     * @param {Array} rawLlmRecommendations - Optional LLM generated recommendations
     * @returns {Promise<Array>} List of recommendations
     */
    async generateRecommendations(data, rawLlmRecommendations = null) {
        if (rawLlmRecommendations && Array.isArray(rawLlmRecommendations)) {
            return rawLlmRecommendations;
        }

        // Fallback rule-based generation
        try {
            const { currentAnalysis, themes = [] } = data;
            const recommendations = [];

            if (!currentAnalysis) {
                return [];
            }

            const rageIndex = currentAnalysis.rageIndex || 50;
            const platformBreakdown = currentAnalysis.platformBreakdown || {};

            // 1. Theme-based recommendations
            if (themes && themes.length > 0) {
                const topTheme = themes[0];
                const cleanThemeName = topTheme.theme.toLowerCase();
                
                let action = `Investigate concerns surrounding "${topTheme.theme}"`;
                let priority = 'medium';
                
                if (cleanThemeName.includes('payment') || cleanThemeName.includes('checkout') || cleanThemeName.includes('billing')) {
                    action = 'Investigate payment gateway errors and checkout confirmation delays';
                    priority = rageIndex > 60 ? 'high' : 'medium';
                } else if (cleanThemeName.includes('support') || cleanThemeName.includes('help') || cleanThemeName.includes('customer service')) {
                    action = 'Address bottlenecks in customer support ticketing and response times';
                    priority = 'high';
                } else if (cleanThemeName.includes('login') || cleanThemeName.includes('auth') || cleanThemeName.includes('account')) {
                    action = 'Verify authentication service uptime and login flow errors';
                    priority = 'high';
                } else if (cleanThemeName.includes('pricing') || cleanThemeName.includes('cost') || cleanThemeName.includes('expensive')) {
                    action = 'Review communication strategy for pricing tiers and feature packages';
                    priority = 'low';
                }

                recommendations.push({
                    priority,
                    recommendation: action,
                    evidence: `Mentioned in ${topTheme.percentage}% of high-rage customer complaints (${topTheme.mentionCount} mentions)`
                });
            }

            // 2. Platform-based recommendations
            Object.entries(platformBreakdown).forEach(([platform, pData]) => {
                if (pData.rageIndex >= 70) {
                    recommendations.push({
                        priority: pData.rageIndex >= 85 ? 'high' : 'medium',
                        recommendation: `Deploy support presence or publish official communication on ${platform}`,
                        evidence: `Elevated Rage Index of ${pData.rageIndex} on ${platform} (${pData.mentionCount} mentions)`
                    });
                }
            });

            // 3. Volatility or general rage levels
            if (rageIndex >= 75) {
                recommendations.push({
                    priority: 'high',
                    recommendation: 'Coordinate an emergency team review of recent product deployment or service outage',
                    evidence: `Overall brand Rage Index is at a critical severity level (${rageIndex})`
                });
            } else if (rageIndex < 40) {
                recommendations.push({
                    priority: 'low',
                    recommendation: 'Monitor social channels for positive brand sentiments to use in future marketing materials',
                    evidence: `Stable customer sentiment with a low Rage Index of ${rageIndex}`
                });
            }

            // Fallback default recommendations if empty
            if (recommendations.length === 0) {
                recommendations.push({
                    priority: 'medium',
                    recommendation: 'Establish continuous sentiment monitoring pipeline across social providers',
                    evidence: 'Analysis completed with baseline metrics.'
                });
            }

            // Sort: high -> medium -> low
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

        } catch (error) {
            logger.error('Failed to generate fallback recommendations', { error: error.message });
            return [
                {
                    priority: 'medium',
                    recommendation: 'Monitor sentiment indicators and check logs',
                    evidence: 'Default system recommendation'
                }
            ];
        }
    }
}

module.exports = RecommendationEngine;
