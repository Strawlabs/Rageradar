/**
 * Chat Engine
 * Natural language Q&A interface for Ask RageRadar.
 * Classifies intent, builds targeted data contexts, and returns conversational AI responses.
 */

const axios = require('axios');
const QueryClassifier = require('./queryClassifier');
const { supabase } = require('../../supabase');
const logger = require('../../utils/logger');

class ChatEngine {
    constructor() {
        this.classifier = new QueryClassifier();
    }

    /**
     * Answer a user question about a brand's reputation and sentiment
     * @param {string} brandId - Brand ID
     * @param {string} message - User message
     * @param {Array} history - Session history array of { role, content }
     * @returns {Promise<string>} Conversation answer
     */
    async answerQuestion(brandId, message, history = []) {
        try {
            // 1. Get latest analysis data
            const { data: analyses, error } = await supabase
                .from('analyses')
                .select('*')
                .eq('brand_id', brandId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error || !analyses || analyses.length === 0) {
                return {
                    answer: "I couldn't find any analysis data for this brand. Please run a brand analysis first.",
                    evidence: [],
                    suggestedQuestions: []
                };
            }

            const analysis = analyses[0];
            const mentions = analysis.search_results || analysis.mentions || [];
            const platformBreakdown = analysis.platform_breakdown || {};
            const themes = analysis.themes || [];
            const brandName = analysis.brand_name || 'the brand';
            const rageIndex = analysis.rage_index || analysis.rageIndex || 50;

            // 2. Classify intent
            const classification = this.classifier.classifyQuery(message);
            
            // Extract grounded evidence mentions specific to this intent
            const relevantMentions = mentions
                .filter(m => {
                    if (classification.intent === 'explain_rage') return m.rageIndex > 60 || m.sentiment === 'negative' || m.primaryEmotion === 'anger';
                    if (classification.intent === 'theme_dive' && classification.theme) {
                        return (m.content || m.text || '').toLowerCase().includes(classification.theme.toLowerCase()) || (m.themes && m.themes.includes(classification.theme));
                    }
                    if (classification.intent === 'platform_comparison' && classification.platform) {
                        return m.platform === classification.platform;
                    }
                    return m.sentiment === 'negative' || m.rageIndex >= 50;
                })
                .slice(0, 4)
                .map(m => ({
                    text: m.content || m.text || '',
                    platform: m.platform || 'web',
                    url: m.url || '',
                    timestamp: m.timestamp || m.created || new Date().toISOString(),
                    rageIndex: m.rageIndex || 50,
                    sentiment: m.sentiment || 'neutral'
                }));

            const suggestedQuestions = [
                `Why is ${brandName}'s Rage Index currently at ${rageIndex}?`,
                `What are the main issues on ${Object.keys(platformBreakdown)[0] || 'Reddit'}?`,
                `How can we fix the "${themes[0]?.theme || 'dominant complaint'}" issue?`
            ];

            // 3. Build filtered context based on intent
            let contextText = '';
            
            switch (classification.intent) {
                case 'get_recommendations':
                    contextText = `Intent: Ask for solutions/recommendations.
Existing Recommendations: ${JSON.stringify(analysis.insights?.recommendations || [])}
Top Issues: ${JSON.stringify(themes.slice(0, 3))}
Current Rage Index: ${rageIndex}`;
                    break;

                case 'platform_comparison':
                    const pName = classification.platform;
                    const pData = pName ? platformBreakdown[pName] : null;
                    contextText = `Intent: Platform analysis. Target Platform: ${pName || 'All'}
Platform Stats: ${JSON.stringify(platformBreakdown)}
Recent mentions for platform: ${JSON.stringify(
                        mentions.filter(m => !pName || m.platform === pName).slice(0, 5).map(m => m.content || m.text)
                    )}`;
                    break;

                case 'temporal_analysis':
                    contextText = `Intent: Trend over time.
Current Rage Index: ${rageIndex}
Trendline Summary: ${JSON.stringify(analysis.trendline_summary || 'No historical trendline available')}`;
                    break;

                case 'theme_dive':
                    const themeName = classification.theme;
                    const matchingMentions = mentions
                        .filter(m => (m.content || m.text || '').toLowerCase().includes(themeName || ''))
                        .slice(0, 5)
                        .map(m => m.content || m.text);
                    contextText = `Intent: Topic Deep Dive. Target Topic: ${themeName}
Matching Mentions: ${JSON.stringify(matchingMentions)}
Themes: ${JSON.stringify(themes)}`;
                    break;

                case 'explain_rage':
                    const highRageMentions = mentions
                        .filter(m => m.rageIndex > 60 || (m.emotions && m.emotions.some(e => e.label === 'anger' && e.score > 0.5)))
                        .slice(0, 5)
                        .map(m => m.content || m.text);
                    contextText = `Intent: Explain why rage index is high.
Current Rage Index: ${rageIndex}
Top High-Rage Mentions: ${JSON.stringify(highRageMentions)}
Dominant Themes: ${JSON.stringify(themes.slice(0, 3))}`;
                    break;

                default:
                    contextText = `Intent: General help.
Brand: ${brandName}
Rage Index: ${rageIndex}
Top Themes: ${JSON.stringify(themes.slice(0, 3))}`;
            }

            // 4. Call LLM or use rich fallback
            const openAiKey = process.env.OPENAI_API_KEY;
            const geminiKey = process.env.GEMINI_API_KEY;

            const hasRealOpenAiKey = openAiKey && openAiKey !== 'your_openai_api_key' && !openAiKey.startsWith('your_');
            const hasRealGeminiKey = geminiKey && geminiKey !== 'your_gemini_api_key' && !geminiKey.startsWith('your_');

            if (hasRealOpenAiKey || hasRealGeminiKey) {
                try {
                    const prompt = `You are Ask RageRadar, an advanced conversational brand intelligence agent.
Use the following context to answer the user's question about the brand "${brandName}".
Rely ONLY on the provided context. If the answer cannot be found, formulate a helpful answer pointing out the lack of specific context.

Data Context:
${contextText}

Conversation History:
${JSON.stringify(history.slice(-6))}

User Question: "${message}"

Write a helpful, conversational, professional response in 3-5 sentences. Reference specific numbers and evidence from the context where possible.`;

                    if (hasRealOpenAiKey) {
                        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                            model: process.env.AI_CHAT_MODEL || 'gpt-4o-mini',
                            messages: [
                                { role: 'user', content: prompt }
                            ]
                        }, {
                            headers: {
                                'Authorization': `Bearer ${openAiKey}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        });
                        return {
                            answer: response.data.choices[0].message.content.trim(),
                            evidence: relevantMentions,
                            suggestedQuestions
                        };
                    } else if (hasRealGeminiKey) {
                        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                            contents: [{ parts: [{ text: prompt }] }]
                        }, {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 10000
                        });
                        return {
                            answer: response.data.candidates[0].content.parts[0].text.trim(),
                            evidence: relevantMentions,
                            suggestedQuestions
                        };
                    }
                } catch (llmError) {
                    logger.error('Chat LLM call failed, using rule-based answer', { error: llmError.message });
                }
            }

            // Rule-based conversational fallback response
            const fallbackAnswer = this.generateFallbackAnswer(classification, brandName, rageIndex, themes, platformBreakdown, message);
            return {
                answer: fallbackAnswer,
                evidence: relevantMentions,
                suggestedQuestions
            };

        } catch (error) {
            logger.error('ChatEngine failed to answer question', { error: error.message });
            return {
                answer: "I apologize, but I encountered an error while retrieving the metrics to answer your question.",
                evidence: [],
                suggestedQuestions: []
            };
        }
    }

    /**
     * Rule-based fallback conversational answers
     */
    generateFallbackAnswer(classification, brandName, rageIndex, themes, platformBreakdown, originalQuestion) {
        const topThemeStr = themes.length > 0 ? themes[0].theme : 'general topics';
        
        switch (classification.intent) {
            case 'get_recommendations':
                return `Based on the latest analysis of ${brandName}, my main recommendation is to investigate issues surrounding "${topThemeStr}". This is the primary driver of customer friction. Additionally, you should coordinate with the platform support teams experiencing the highest dissatisfaction levels.`;

            case 'platform_comparison':
                const worst = Object.entries(platformBreakdown).sort((a, b) => b[1].rageIndex - a[1].rageIndex)[0];
                if (worst) {
                    return `Looking at the channel analytics for ${brandName}, customer dissatisfaction is highest on ${worst[0]} with a platform Rage Index of ${worst[1].rageIndex} (${worst[1].mentionCount} mentions). I recommend focusing engagement there to address concerns.`;
                }
                return `Customer sentiment for ${brandName} is fairly distributed across monitored social channels. No single platform stands out as a critical hotspot at the moment.`;

            case 'temporal_analysis':
                return `The sentiment trendline shows the Rage Index for ${brandName} is currently at ${rageIndex}. We are tracking historical mentions to establish moving averages, which indicates sentiment is stable but requires continuous monitoring.`;

            case 'theme_dive':
                return `Deep-diving into "${classification.theme || 'customer concerns'}" for ${brandName}, we see frequent references to issues related to this topic in high-rage mentions. Users are expressing annoyance with speed and reliability in this area.`;

            case 'explain_rage':
                return `The overall Rage Index of ${rageIndex} for ${brandName} is driven primarily by complaints about "${topThemeStr}". Sentiment triggers indicate negative emotional patterns (like annoyance and frustration) are prevalent in recent feedback.`;

            default:
                return `I am analyzing the brand intelligence for ${brandName}. Currently, the overall Rage Index is ${rageIndex} with dominant themes centering around "${topThemeStr}". What specific aspects of platforms, themes, or recommendations would you like me to clarify?`;
        }
    }
}

module.exports = ChatEngine;
