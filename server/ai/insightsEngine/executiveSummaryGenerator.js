/**
 * Executive Summary Generator
 * Generates natural language briefing summaries for the brand dashboard.
 */

const logger = require('../../utils/logger');

class ExecutiveSummaryGenerator {
    constructor() {}

    /**
     * Generate executive summary
     * @param {object} data - Brand analysis data
     * @param {string} rawLlmResponse - Optional LLM generated text
     * @returns {Promise<string>} Natural language summary
     */
    async generateSummary(data, rawLlmResponse = null) {
        if (rawLlmResponse) {
            return rawLlmResponse;
        }

        // Fallback rule-based generation
        try {
            const { currentAnalysis, themes = [] } = data;
            if (!currentAnalysis) {
                return 'No current brand analysis data is available to generate a summary.';
            }

            const brandName = currentAnalysis.brand_name || 'the brand';
            const rageIndex = currentAnalysis.rageIndex || 50;
            const severity = currentAnalysis.severity || 'moderate';
            const totalMentions = currentAnalysis.totalMentions || currentAnalysis.search_results?.length || 0;

            let topThemeText = '';
            if (themes && themes.length > 0) {
                topThemeText = ` The primary driver of conversation is related to "${themes[0].theme}".`;
            }

            // Find platform with highest rage
            let hotspotText = '';
            if (currentAnalysis.platformBreakdown) {
                const worstPlatform = Object.entries(currentAnalysis.platformBreakdown)
                    .sort((a, b) => b[1].rageIndex - a[1].rageIndex)[0];
                if (worstPlatform && worstPlatform[1].rageIndex > 60) {
                    hotspotText = ` Direct attention to customer feedback on ${worstPlatform[0]}, which exhibits the highest concentration of frustration.`;
                }
            }

            let sentimentDescription = '';
            if (rageIndex >= 75) {
                sentimentDescription = `Customer frustration for ${brandName} is critically elevated at a Rage Index of ${rageIndex} (${severity} severity), based on ${totalMentions} analyzed mentions. Urgent investigation is recommended to mitigate churn risk.`;
            } else if (rageIndex >= 50) {
                sentimentDescription = `Sentiment for ${brandName} shows moderate levels of friction, with a Rage Index of ${rageIndex} (${severity} severity) from ${totalMentions} mentions. Ongoing monitoring is recommended.`;
            } else {
                sentimentDescription = `Customer sentiment for ${brandName} is stable and generally positive, with a minimal Rage Index of ${rageIndex} (${severity} severity) across ${totalMentions} mentions. No immediate response is needed.`;
            }

            return `${sentimentDescription}${topThemeText}${hotspotText}`;
        } catch (error) {
            logger.error('Failed to generate fallback executive summary', { error: error.message });
            return 'Failed to generate summary. Sentiment data is currently undergoing calculation.';
        }
    }
}

module.exports = ExecutiveSummaryGenerator;
