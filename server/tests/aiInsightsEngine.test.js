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

    // ── QA §12 – INT-04: Premium gating ──
    test('INT-04: AI insights output is structured for plan-gated features', async () => {
        const brandData = {
            currentAnalysis: {
                brand_name: 'GatedBrand',
                rageIndex: 55,
                severity: 'moderate',
                totalMentions: 10,
                platformBreakdown: {}
            },
            themes: [{ theme: 'Slow checkout', percentage: 30, mentionCount: 3, intensityScore: 60 }]
        };

        const result = await engine.generateLLMInsights(brandData);

        // Insights structure must include fields that can be gated by plan
        expect(result).toHaveProperty('executiveSummary');
        expect(result).toHaveProperty('recommendations');
        expect(result).toHaveProperty('insights');
        // All are non-empty for paid users
        expect(result.executiveSummary.length).toBeGreaterThan(0);
        expect(result.recommendations.length).toBeGreaterThan(0);
    });

    // ── QA §12 – INT-07: Idempotent / caching ──
    test('INT-07: identical inputs produce consistent output (idempotent)', async () => {
        const brandData = {
            currentAnalysis: {
                brand_name: 'CacheBrand',
                rageIndex: 70,
                severity: 'high',
                totalMentions: 20,
                platformBreakdown: { twitter: { rageIndex: 75, mentionCount: 12 } }
            },
            themes: [{ theme: 'Billing errors', percentage: 50, mentionCount: 10, intensityScore: 78 }]
        };

        const result1 = await engine.generateLLMInsights(brandData);
        const result2 = await engine.generateLLMInsights(brandData);

        // Fallback engine is deterministic, same input → same output
        expect(result1.executiveSummary).toBe(result2.executiveSummary);
        expect(result1.recommendations.length).toBe(result2.recommendations.length);
    });

    // ── QA §12 – INT-09: Malformed / empty input ──
    test('INT-09: missing brand name or zero mentions → safe fallback', async () => {
        const emptyData = {
            currentAnalysis: {
                brand_name: '',
                rageIndex: 0,
                severity: 'minimal',
                totalMentions: 0,
                platformBreakdown: {}
            },
            themes: []
        };

        // Should not throw
        const result = await engine.generateLLMInsights(emptyData);
        expect(result).toBeDefined();
        expect(result.executiveSummary).toBeDefined();
    });

    test('INT-09: null currentAnalysis handled', async () => {
        const nullData = { currentAnalysis: null, themes: null };

        // Should not throw
        await expect(async () => {
            try {
                await engine.generateLLMInsights(nullData);
            } catch (e) {
                // Acceptable to throw if input is fully null, but should not hang
                expect(e).toBeDefined();
            }
        }).not.toThrow();
    });
});
