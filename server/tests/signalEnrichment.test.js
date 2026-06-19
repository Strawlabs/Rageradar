/**
 * Signal Enrichment Pipeline Test Suite
 */

const ContentNormalizer = require('../ai/signalEnrichment/contentNormalizer');
const DuplicateDetector = require('../ai/signalEnrichment/duplicateDetector');
const EntityExtractor = require('../ai/signalEnrichment/entityExtractor');
const RelevanceScorer = require('../ai/signalEnrichment/relevanceScorer');
const SignalEnrichmentEngine = require('../ai/signalEnrichment/signalEnrichmentEngine');

describe('ContentNormalizer', () => {
    let normalizer;

    beforeEach(() => {
        normalizer = new ContentNormalizer();
    });

    test('should strip HTML and decode entities', () => {
        const input = '<div>Hello &amp; welcome to <a href="#">RageRadar</a>!</div>';
        const result = normalizer.normalize(input);
        expect(result.content).toBe('Hello & welcome to RageRadar!');
    });

    test('should clean Reddit markdown', () => {
        const input = 'This is **bold** and *italic* content on r/webdev from u/username. Edit: typos.';
        const result = normalizer.normalize(input, { platform: 'reddit' });
        expect(result.content).toBe('This is bold and italic content on from.');
    });

    test('should remove common boilerplate patterns', () => {
        const input = 'Stripe is down. All rights reserved. Copyright © 2026. Accept all cookies.';
        const result = normalizer.normalize(input);
        expect(result.content).toBe('Stripe is down.');
    });

    test('should calculate a reasonable quality score', () => {
        const shortInput = 'bad app';
        const longInput = 'I am extremely disappointed. The payment failed twice, and checkout page is completely broken. Customer support is not responding to my tickets!';
        
        const shortResult = normalizer.normalize(shortInput);
        const longResult = normalizer.normalize(longInput);
        
        expect(longResult.qualityScore).toBeGreaterThan(shortResult.qualityScore);
    });
});

describe('DuplicateDetector', () => {
    let detector;

    beforeEach(() => {
        detector = new DuplicateDetector({ jaccardThreshold: 0.70 });
    });

    test('should detect exact duplicates by hash', () => {
        const signals = [
            { content: 'Stripe gateway checkout is down.', platformMeta: { upvotes: 10 } },
            { content: 'Stripe gateway checkout is down.', platformMeta: { upvotes: 5 } }
        ];

        const result = detector.deduplicate(signals);
        expect(result.length).toBe(1);
        expect(result[0].platformMeta.upvotes).toBe(15);
    });

    test('should detect near-duplicates by Jaccard similarity', () => {
        const signals = [
            { content: 'Stripe gateway is down, payments fail for checkout.', qualityScore: 0.8 },
            { content: 'Payments fail for checkout because Stripe gateway is down.', qualityScore: 0.9 }
        ];

        const result = detector.deduplicate(signals);
        expect(result.length).toBe(1);
        // Retains the one with the higher quality score
        expect(result[0].content).toBe('Payments fail for checkout because Stripe gateway is down.');
    });
});

describe('EntityExtractor', () => {
    let extractor;

    beforeEach(() => {
        extractor = new EntityExtractor();
    });

    test('should extract dates, versions, features, and complaints', () => {
        const text = 'Checkout failed on June 15th on API version 1.2.3 because the server is slow.';
        const entities = extractor.extract(text);

        expect(entities.dates).toContain('June 15th');
        expect(entities.versions).toContain('1.2.3');
        expect(entities.features).toContain('checkout');
        expect(entities.features).toContain('api');
        expect(entities.complaints).toContain('slow');
    });

    test('should detect competitors', () => {
        const text = 'We are thinking about switching from Stripe to PayPal or Square.';
        const entities = extractor.extract(text);

        expect(entities.competitors).toContain('Stripe');
        expect(entities.competitors).toContain('PayPal');
        expect(entities.competitors).toContain('Square');
    });
});

describe('RelevanceScorer', () => {
    let scorer;
    const brandConfig = {
        name: 'Stripe',
        website: 'stripe.com',
        keywords: ['payment gateway', 'checkout']
    };

    beforeEach(() => {
        scorer = new RelevanceScorer({ threshold: 0.3 });
    });

    test('should score on-topic content highly', () => {
        const signal = { content: 'Stripe payment gateway has failed me today. The API returns 500.' };
        const score = scorer.calculateScore(signal, brandConfig);
        expect(score).toBeGreaterThan(0.4);
    });

    test('should filter out low relevance noise', () => {
        const signals = [
            { content: 'Stripe payment gateway has failed.' },
            { content: 'A zebra has stripes.' }
        ];

        const filtered = scorer.filter(signals, brandConfig);
        expect(filtered.length).toBe(1);
        expect(filtered[0].content).toBe('Stripe payment gateway has failed.');
    });
});
