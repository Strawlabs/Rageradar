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

    // ── QA §7 – RIX-03 to RIX-07: Band mapping ──
    describe('RIX-03 to RIX-07: Band mapping', () => {
        test('RIX-03: score in 0-19 → Minimal', () => {
            expect(calculator.getSeverity(10)).toBe('minimal');
            expect(calculator.getSeverity(0)).toBe('minimal');
            expect(calculator.getSeverity(19)).toBe('minimal');
        });

        test('RIX-04: score in 20-39 → Low', () => {
            expect(calculator.getSeverity(20)).toBe('low');
            expect(calculator.getSeverity(30)).toBe('low');
            expect(calculator.getSeverity(39)).toBe('low');
        });

        test('RIX-05: score in 40-59 → Moderate', () => {
            expect(calculator.getSeverity(40)).toBe('moderate');
            expect(calculator.getSeverity(50)).toBe('moderate');
            expect(calculator.getSeverity(59)).toBe('moderate');
        });

        test('RIX-06: score in 60-79 → High', () => {
            expect(calculator.getSeverity(60)).toBe('high');
            expect(calculator.getSeverity(70)).toBe('high');
            expect(calculator.getSeverity(79)).toBe('high');
        });

        test('RIX-07: score in 80-100 → Critical', () => {
            expect(calculator.getSeverity(80)).toBe('critical');
            expect(calculator.getSeverity(90)).toBe('critical');
            expect(calculator.getSeverity(100)).toBe('critical');
        });
    });

    // ── QA §7 – RIX-08: Boundary values ──
    describe('RIX-08: Boundary values (no off-by-one)', () => {
        test('boundary at 19/20', () => {
            expect(calculator.getSeverity(19)).toBe('minimal');
            expect(calculator.getSeverity(20)).toBe('low');
        });

        test('boundary at 39/40', () => {
            expect(calculator.getSeverity(39)).toBe('low');
            expect(calculator.getSeverity(40)).toBe('moderate');
        });

        test('boundary at 59/60', () => {
            expect(calculator.getSeverity(59)).toBe('moderate');
            expect(calculator.getSeverity(60)).toBe('high');
        });

        test('boundary at 79/80', () => {
            expect(calculator.getSeverity(79)).toBe('high');
            expect(calculator.getSeverity(80)).toBe('critical');
        });
    });

    // ── QA §7 – RIX-09: Positive emotion offset ──
    test('RIX-09: positive emotions reduce net score vs anger-only baseline', () => {
        const angerOnly = [{ emotions: [{ label: 'anger', score: 0.9 }] }];
        const mixed = [
            { emotions: [{ label: 'anger', score: 0.9 }] },
            { emotions: [{ label: 'gratitude', score: 0.8 }] }
        ];

        const angerResult = calculator.calculateAggregated(angerOnly);
        const mixedResult = calculator.calculateAggregated(mixed);

        expect(mixedResult.rageIndex).toBeLessThan(angerResult.rageIndex);
    });

    // ── QA §7 – RIX-10: Confidence score available ──
    test('RIX-10: aggregated result includes metadata', () => {
        const mentions = [
            { emotions: [{ label: 'anger', score: 0.7 }] },
            { emotions: [{ label: 'frustration', score: 0.5 }] }
        ];

        const result = calculator.calculateAggregated(mentions);
        expect(result.metadata).toBeDefined();
        expect(result.metadata.mentionsAnalyzed).toBe(2);
        expect(result.severity).toBeDefined();
        expect(result.rageIndex).toBeDefined();
    });

    // ── QA §7 – RIX-11: Recalculation after each analysis run ──
    test('RIX-11: recalculation with new data changes the score', () => {
        const batch1 = [{ emotions: [{ label: 'neutral', score: 1.0 }] }];
        const result1 = calculator.calculateAggregated(batch1);

        const batch2 = [
            ...batch1,
            { emotions: [{ label: 'anger', score: 1.0 }] },
            { emotions: [{ label: 'rage', score: 0.9 }] }
        ];
        const result2 = calculator.calculateAggregated(batch2);

        // Adding angry mentions should increase the score
        expect(result2.rageIndex).toBeGreaterThan(result1.rageIndex);
    });
});
