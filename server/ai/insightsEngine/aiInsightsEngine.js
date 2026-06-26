/**
 * AI Insights Engine
 * Orchestrates LLM-powered root cause analysis, executive summaries, and action recommendations.
 * Uses direct Axios API calls to OpenAI or Gemini, with a robust rule-based fallback.
 */

const axios = require('axios');
const ExecutiveSummaryGenerator = require('./executiveSummaryGenerator');
const RecommendationEngine = require('./recommendationEngine');
const logger = require('../../utils/logger');

class AIInsightsEngine {
    constructor() {
        this.summaryGenerator = new ExecutiveSummaryGenerator();
        this.recommendationEngine = new RecommendationEngine();
    }

    /**
     * Generate LLM-powered insights, summary, and recommendations
     * @param {object} data - Brand analysis data
     * @returns {Promise<object>} Combined insights structure
     */
    async generateLLMInsights(data) {
        const { currentAnalysis, themes = [], trendline = null } = data;
        if (!currentAnalysis) {
            throw new Error('Missing current analysis data for insights');
        }

        const brandName = currentAnalysis.brand_name || 'the brand';
        const rageIndex = currentAnalysis.rageIndex || 50;
        const severity = currentAnalysis.severity || 'moderate';
        const totalMentions = currentAnalysis.totalMentions || currentAnalysis.search_results?.length || 0;
        const platformBreakdown = currentAnalysis.platformBreakdown || {};

        const openAiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        const hasRealOpenAiKey = openAiKey && openAiKey !== 'your_openai_api_key' && !openAiKey.startsWith('your_');
        const hasRealGeminiKey = geminiKey && geminiKey !== 'your_gemini_api_key' && !geminiKey.startsWith('your_');

        if (hasRealOpenAiKey || hasRealGeminiKey) {
            try {
                // Construct structured prompt
                const prompt = `You are RageRadar Brand AI, a brand reputation and sentiment intelligence assistant.
Analyze the following feedback data for a brand and generate:
1. An Executive Summary (3-4 sentences, natural language briefing for C-level).
2. Recommendations (Priority [high/medium/low], recommendation, evidence/reasoning).
3. Insights (Title, description, category [alert/positive/trend/platform/theme/volume], priority [high/medium/low], recommendation, score [1-100]).

Brand Name: ${brandName}
Current Rage Index: ${rageIndex} (${severity} severity)
Total Mentions: ${totalMentions}
Top Themes: ${JSON.stringify(themes.slice(0, 5))}
Platform Breakdown: ${JSON.stringify(platformBreakdown)}
Trendline Summary: ${trendline ? JSON.stringify(trendline.summary) : 'Not enough data'}

Return ONLY a valid JSON object matching this structure:
{
  "executiveSummary": "A concise natural language paragraph explaining the key takeaways.",
  "recommendations": [
    {
      "priority": "high",
      "recommendation": "Specific action to take",
      "evidence": "Evidence or reasoning based on the data"
    }
  ],
  "insights": [
    {
      "title": "Clear Insight Title",
      "description": "Elaborate description of the finding",
      "recommendation": "Actionable advice",
      "category": "alert",
      "priority": "high",
      "score": 85
    }
  ]
}
Do not include any backticks or additional text. Just output the JSON.`;

                let parsedResult = null;

                if (hasRealOpenAiKey) {
                    logger.info('Calling OpenAI API for brand insights', { brandName });
                    const model = process.env.AI_INSIGHTS_MODEL || 'gpt-4o-mini';
                    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                        model,
                        messages: [
                            { role: 'system', content: 'You must respond strictly with valid JSON.' },
                            { role: 'user', content: prompt }
                        ],
                        response_format: { type: 'json_object' }
                    }, {
                        headers: {
                            'Authorization': `Bearer ${openAiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    });

                    parsedResult = JSON.parse(response.data.choices[0].message.content);
                } else if (hasRealGeminiKey) {
                    logger.info('Calling Gemini API for brand insights', { brandName });
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                        contents: [
                            { parts: [{ text: prompt }] }
                        ],
                        generationConfig: {
                            responseMimeType: 'application/json'
                        }
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    });

                    const text = response.data.candidates[0].content.parts[0].text;
                    parsedResult = JSON.parse(text);
                }

                if (parsedResult && parsedResult.executiveSummary && parsedResult.insights) {
                    return {
                        executiveSummary: parsedResult.executiveSummary,
                        recommendations: parsedResult.recommendations || [],
                        insights: parsedResult.insights.map((insight, idx) => ({
                            ...insight,
                            id: `ai_insight_${idx}`,
                            icon: this.getIconForCategory(insight.category)
                        }))
                    };
                }
            } catch (apiError) {
                logger.error('LLM API Call failed, falling back to local generators', { error: apiError.message });
            }
        }

        // Rule-based local fallback synthesis
        logger.info('Using rule-based fallback for insights synthesis', { brandName });

        const insights = [];

        // 1. Rage index level insight
        if (rageIndex >= 60) {
            insights.push({
                id: 'ai_insight_rage_level',
                icon: '🔴',
                category: 'alert',
                priority: 'high',
                title: 'Elevated Frustration Detected',
                description: `Customer dissatisfaction has pushed the Rage Index to ${rageIndex} (${severity} severity), indicating negative brand friction.`,
                recommendation: 'Review negative comments on top platforms to identify specific product or support failures.',
                score: rageIndex
            });
        } else {
            insights.push({
                id: 'ai_insight_rage_level',
                icon: '🟢',
                category: 'positive',
                priority: 'low',
                title: 'Stable Customer Sentiment',
                description: `The brand is maintaining a low Rage Index of ${rageIndex} (${severity} severity), indicating healthy public reception.`,
                recommendation: 'Continue monitoring for any sudden sentiment drops or emerging issues.',
                score: 100 - rageIndex
            });
        }

        // 2. Theme hotspot insight
        if (themes && themes.length > 0) {
            const topTheme = themes[0];
            insights.push({
                id: 'ai_insight_theme_hotspot',
                icon: '🔍',
                category: 'theme',
                priority: topTheme.intensityScore > 60 ? 'high' : 'medium',
                title: `Primary Focus: "${topTheme.theme}"`,
                description: `Feedback frequently references "${topTheme.theme}" (${topTheme.percentage}% of high-rage mentions), generating concentrated frustration.`,
                recommendation: `Audit user experiences and workflows related to ${topTheme.theme.toLowerCase()}.`,
                score: Math.round(topTheme.intensityScore || 50)
            });
        }

        // 3. Platform hotspot insight
        const worstPlatform = Object.entries(platformBreakdown)
            .sort((a, b) => b[1].rageIndex - a[1].rageIndex)[0];
        if (worstPlatform && worstPlatform[1].rageIndex > 60) {
            insights.push({
                id: 'ai_insight_platform_hotspot',
                icon: '💬',
                category: 'platform',
                priority: worstPlatform[1].rageIndex > 75 ? 'high' : 'medium',
                title: `Platform Disruption on ${worstPlatform[0]}`,
                description: `The Rage Index has spiked to ${worstPlatform[1].rageIndex} on ${worstPlatform[0]} across ${worstPlatform[1].mentionCount} mentions.`,
                recommendation: `Deploy customer service agents or community managers to respond directly to users on ${worstPlatform[0]}.`,
                score: worstPlatform[1].rageIndex
            });
        }

        // Generate the fallback summary and recommendations
        const executiveSummary = await this.summaryGenerator.generateSummary(data);
        const recommendations = await this.recommendationEngine.generateRecommendations(data);

        return {
            executiveSummary,
            recommendations,
            insights
        };
    }

    getIconForCategory(category) {
        const icons = {
            alert: '🔴',
            positive: '🟢',
            trend: '📈',
            platform: '💬',
            theme: '🔍',
            volume: '📊'
        };
        return icons[category] || '🔍';
    }
}

module.exports = AIInsightsEngine;
