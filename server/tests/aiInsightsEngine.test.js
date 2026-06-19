/**
 * AI Insights Engine Unit Tests
 */

const AIInsightsEngine = require('../ai/insightsEngine/aiInsightsEngine');

describe('AIInsightsEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new AIInsightsEngine();
    });

    test('should generate structured insights, summary, and recommendations using local fallbacks', async () => {
        const brandData = {
            currentAnalysis: {
                brand_name: 'Stripe',
                rageIndex: 78,
                severity: 'high',
                totalMentions: 15,
                platformBreakdown: {
                    reddit: { rageIndex: 85, mentionCount: 10 }
                }
            },
            themes: [
                { theme: 'Payment confirmation delays', percentage: 40, mentionCount: 6, intensityScore: 82 }
            ]
        };

        const result = await engine.generateLLMInsights(brandData);

        expect(result).toHaveProperty('executiveSummary');
        expect(result).toHaveProperty('recommendations');
        expect(result).toHaveProperty('insights');

        // Check summary format and content
        expect(typeof result.executiveSummary).toBe('string');
        expect(result.executiveSummary).toContain('Stripe');
        expect(result.executiveSummary).toContain('Payment confirmation delays');

        // Check recommendations
        expect(Array.isArray(result.recommendations)).toBe(true);
        expect(result.recommendations.length).toBeGreaterThan(0);
        expect(result.recommendations[0].priority).toBe('high');
        expect(result.recommendations[0].recommendation).toContain('payment');

        // Check insights list
        expect(Array.isArray(result.insights)).toBe(true);
        expect(result.insights.length).toBeGreaterThan(1);
        expect(result.insights[0].category).toBe('alert');
        expect(result.insights[1].category).toBe('theme');
    });

    test('should gracefully handle empty or baseline inputs in fallback mode', async () => {
        const baselineData = {
            currentAnalysis: {
                brand_name: 'Acme Corp',
                rageIndex: 20,
                severity: 'low',
                totalMentions: 2,
                platformBreakdown: {}
            },
            themes: []
        };

        const result = await engine.generateLLMInsights(baselineData);

        expect(result.executiveSummary).toContain('Acme Corp');
        expect(result.recommendations[0].priority).toBe('low');
        expect(result.insights[0].category).toBe('positive');
    });
});
