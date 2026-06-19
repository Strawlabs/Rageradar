/**
 * Query Classifier
 * Classifies conversational questions into intent objects for structured data retrieval.
 */

class QueryClassifier {
    constructor() {}

    /**
     * Classifies query text
     * @param {string} text - User prompt
     * @returns {object} Classified intent and details
     */
    classifyQuery(text) {
        if (!text || typeof text !== 'string') {
            return { intent: 'general_help', text: '' };
        }

        const normalized = text.toLowerCase().trim();

        // 1. Recommendations / Actionable Fixes
        if (normalized.includes('fix') || normalized.includes('recommend') || normalized.includes('action') || normalized.includes('do first') || normalized.includes('solve')) {
            return { intent: 'get_recommendations', text };
        }

        // 2. Platform Breakdown/Disparity
        if (normalized.includes('platform') || normalized.includes('channel') || normalized.includes('reddit') || normalized.includes('app store') || normalized.includes('youtube')) {
            let platform = null;
            if (normalized.includes('reddit')) platform = 'reddit';
            if (normalized.includes('youtube')) platform = 'youtube';
            if (normalized.includes('app store') || normalized.includes('appstore')) platform = 'appstore';
            return { intent: 'platform_comparison', platform, text };
        }

        // 3. Temporal Analysis / Trends
        if (normalized.includes('change') || normalized.includes('trend') || normalized.includes('compared') || normalized.includes('week') || normalized.includes('month') || normalized.includes('history')) {
            return { intent: 'temporal_analysis', text };
        }

        // 4. Specific themes/topics
        const themeKeywords = {
            payment: ['payment', 'checkout', 'billing', 'stripe', 'card', 'refund', 'charge'],
            support: ['support', 'help', 'ticket', 'customer service', 'chat', 'response'],
            login: ['login', 'auth', 'account', 'password', 'sign in', 'signup'],
            pricing: ['price', 'pricing', 'cost', 'expensive', 'subscription', 'plan']
        };

        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            if (keywords.some(k => normalized.includes(k))) {
                return { intent: 'theme_dive', theme, text };
            }
        }

        // 5. Why is rage high / Explain Change
        if (normalized.includes('why') || normalized.includes('reason') || normalized.includes('cause') || normalized.includes('driver') || normalized.includes('rage') || normalized.includes('high')) {
            return { intent: 'explain_rage', text };
        }

        // Default fallback
        return { intent: 'general_help', text };
    }
}

module.exports = QueryClassifier;
