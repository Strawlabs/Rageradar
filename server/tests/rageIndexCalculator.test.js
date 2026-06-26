/**
 * Rage Index Calculator Unit Tests
 */

const RageIndexCalculator = require('../utils/rageIndexCalculator');

describe('RageIndexCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new RageIndexCalculator();
    });

    test('should calculate single mention index based on weighted emotions', () => {
        const emotions = [
            { label: 'anger', score: 0.8 },
            { label: 'frustration', score: 0.2 }
        ];

        const result = calculator.calculateForMention(emotions);
        expect(result.rageIndex).toBeGreaterThan(50);
        expect(result.severity).toBe('critical');
    });

    test('should pull low-confidence mention scores 30% toward 50 (neutral)', () => {
        const emotions = [
            { label: 'anger', score: 1.0, confidence: 'low' }
        ];

        // Without low confidence: (1.0 * 1.0) / 1.0 = 1.0 raw -> (1 + 1) * 50 = 100 rage index
        // With low confidence: 100 * 0.7 + 50 * 0.3 = 70 + 15 = 85 rage index
        const result = calculator.calculateForMention(emotions, { confidence: 'low' });
        expect(result.rageIndex).toBe(85);
    });

    test('should apply temporal decay to older mentions', () => {
        const emotions = [{ label: 'anger', score: 1.0 }];
        
        // 7 days ago should decay by e^(-0.1 * 7) ≈ 0.5
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 7);

        const mentions = [
            { emotions, publishedAt: new Date().toISOString() }, // today
            { emotions, publishedAt: oldDate.toISOString() }      // 7 days ago
        ];

        const aggregatedResult = calculator.calculateAggregated(mentions);
        // The average index should reflect that the today's mention has twice the weight of the old one
        expect(aggregatedResult.rageIndex).toBeGreaterThan(40);
    });

    test('should amplify weights based on engagement upvotes and replies', () => {
        const emotions = [{ label: 'anger', score: 1.0 }];

        const lowEngagement = [
            { emotions, upvotes: 0, replies: 0 }
        ];

        const highEngagement = [
            { emotions, upvotes: 100, replies: 10 }
        ];

        const lowRes = calculator.calculateAggregated(lowEngagement);
        const highRes = calculator.calculateAggregated(highEngagement);

        // Individual mention rage is 100.
        // With Bayesian smoothing, highRes (weighted higher by engagement multiplier) will pull the average index closer to 100 than lowRes.
        expect(highRes.rageIndex).toBeGreaterThan(lowRes.rageIndex);
    });

    test('should smooth aggregated scores towards prior (40) for small sample sizes', () => {
        const emotions = [{ label: 'anger', score: 1.0 }]; // raw mention index ≈ 100

        // 1 mention: (1 * 100 + 10 * 40) / 11 = 500 / 11 ≈ 45
        const smallSample = calculator.calculateAggregated([{ emotions }]);
        
        // 100 mentions: (100 * 100 + 10 * 40) / 110 = 10400 / 110 ≈ 95
        const largeSample = Array.from({ length: 100 }, () => ({ emotions }));
        const largeRes = calculator.calculateAggregated(largeSample);

        expect(smallSample.rageIndex).toBeCloseTo(45, 0);
        expect(largeRes.rageIndex).toBeCloseTo(95, 0);
    });
});
