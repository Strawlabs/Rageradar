/**
 * Research Orchestrator Unit Tests
 */

const ResearchOrchestrator = require('../ai/researchOrchestrator');

describe('ResearchOrchestrator', () => {
    let orchestrator;

    beforeEach(() => {
        orchestrator = new ResearchOrchestrator();
    });

    test('should execute the full 10-step brand intelligence research pipeline in mock mode', async () => {
        // Run end-to-end research on Stripe
        const result = await orchestrator.conductResearch('Stripe', {
            userId: 'mock-user-123',
            website: 'stripe.com',
            competitors: ['Square']
        });

        // Verify top-level structure
        expect(result).toHaveProperty('brandName', 'Stripe');
        expect(result).toHaveProperty('brandId', 'mock-user-123_stripe');
        expect(result).toHaveProperty('totalMentions');
        expect(result.totalMentions).toBeGreaterThan(0);

        // Verify Rage Index 2.0 calculations
        expect(result).toHaveProperty('rageIndex');
        expect(result).toHaveProperty('emotions');
        expect(result.emotions.length).toBeGreaterThan(0);
        expect(result).toHaveProperty('platformStats');

        // Verify themes and AI insights outputs
        expect(result).toHaveProperty('themes');
        expect(result).toHaveProperty('executiveSummary');
        expect(result).toHaveProperty('recommendations');
        expect(result.recommendations.length).toBeGreaterThan(0);
        expect(result).toHaveProperty('insights');
        expect(result.insights.length).toBeGreaterThan(0);

        // Verify enhanced features flags are set
        expect(result.enhancedFeatures).toEqual({
            temporalWeighting: true,
            contextDetection: true,
            sarcasmDetection: true,
            themeExtraction: true
        });
    });
});
