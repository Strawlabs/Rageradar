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

    test('should permit partial content / snippets without blocking analysis when relevance threshold is met', () => {
        const partialSignals = [
            { content: 'Stripe API checkout has failed...', isPartialContent: true }
        ];
        const filtered = scorer.filter(partialSignals, brandConfig);
        expect(filtered.length).toBe(1);
        expect(filtered[0].relevanceScore).toBeGreaterThanOrEqual(0.3);
    });
});

describe('Partial Content and Cross-Post Detection Features', () => {
    test('ContentNormalizer should flag partial content and record partialReason', () => {
        const normalizer = new ContentNormalizer();
        const snippetText = 'We noticed that the Stripe checkout process is taking over 30 seconds to respond Read more...';
        const res = normalizer.normalize(snippetText, { platform: 'web' });

        expect(res.isPartialContent).toBe(true);
        expect(res.partialReason).toBe('snippet_truncation');
        expect(res.content).not.toContain('Read more');
    });

    test('DuplicateDetector should track duplicateSources and flag isCrossPosted across platforms', () => {
        const detector = new DuplicateDetector({ jaccardThreshold: 0.70 });
        const signals = [
            {
                id: '1',
                url: 'https://twitter.com/post/123',
                platform: 'twitter',
                content: 'Stripe checkout server is currently returning 500 errors across Europe.',
                qualityScore: 0.8,
                platformMeta: { likes: 50, replies: 10 }
            },
            {
                id: '2',
                url: 'https://reddit.com/r/webdev/comments/abc',
                platform: 'reddit',
                content: 'Stripe checkout server is currently returning 500 errors across Europe.',
                qualityScore: 0.9,
                platformMeta: { upvotes: 120, commentCount: 30 }
            }
        ];

        const deduplicated = detector.deduplicate(signals);
        expect(deduplicated.length).toBe(1);

        const canonical = deduplicated[0];
        expect(canonical.isDuplicate).toBe(true);
        expect(canonical.isCrossPosted).toBe(true);
        expect(canonical.duplicateCount).toBe(2);
        expect(canonical.duplicateSources.length).toBe(2);
        expect(canonical.duplicateSources[0].platform).toBe('twitter');
        expect(canonical.duplicateSources[1].platform).toBe('reddit');
        expect(canonical.platformMeta.likes).toBe(50);
        expect(canonical.platformMeta.upvotes).toBe(120);
    });
});

describe('SignalEnrichmentEngine Pipeline (End-to-End)', () => {
    let engine;
    const brandConfig = {
        name: 'Stripe',
        website: 'stripe.com',
        competitors: ['PayPal', 'Adyen']
    };

    beforeEach(() => {
        engine = new SignalEnrichmentEngine();
    });

    test('should produce normalized signal objects with source, url, content, originalContent, metadata, entities, and tags (AC 1 & AC 4)', () => {
        const rawMentions = [
            {
                id: 'raw_101',
                source: 'reddit_api',
                platform: 'reddit',
                url: 'https://reddit.com/r/stripe/123',
                text: 'Checkout failed on June 15th when switching from Stripe to PayPal! So frustrated.',
                author: 'dev_user',
                upvotes: 45
            }
        ];

        const enriched = engine.enrich(rawMentions, brandConfig);
        expect(enriched.length).toBe(1);

        const signal = enriched[0];
        // Check core fields
        expect(signal.id).toBe('raw_101');
        expect(signal.source).toBe('reddit_api');
        expect(signal.platform).toBe('reddit');
        expect(signal.url).toBe('https://reddit.com/r/stripe/123');
        expect(signal.content).toBe('Checkout failed on June 15th when switching from Stripe to PayPal! So frustrated.');
        expect(signal.originalContent).toBe('Checkout failed on June 15th when switching from Stripe to PayPal! So frustrated.');
        expect(signal.author).toBe('dev_user');
        expect(signal.qualityScore).toBeGreaterThan(0);

        // Check entities
        expect(signal.entities).toContain('checkout');
        expect(signal.extractedEntities.competitors).toContain('PayPal');
        expect(signal.extractedEntities.dates).toContain('June 15th');

        // Check automated context tags
        expect(signal.tags).toContain('platform:reddit');
        expect(signal.tags).toContain('source:reddit_api');
        expect(signal.tags).toContain('feature:checkout');
        expect(signal.tags).toContain('competitor:paypal');

        // Check metadata
        expect(signal.metadata.platformMeta.upvotes).toBe(45);
        expect(signal.metadata.qualityScore).toBeDefined();
    });

    test('should mark partial content and merge duplicates cleanly across the pipeline (AC 2 & AC 3)', () => {
        const rawMentions = [
            {
                id: 'raw_201',
                platform: 'web',
                url: 'https://news.ycombinator.com/item?id=999',
                text: 'Stripe billing API gateway has crashed globally causing outages...',
                isPartialContent: true
            },
            {
                id: 'raw_202',
                platform: 'twitter',
                url: 'https://twitter.com/user/status/888',
                text: 'Stripe billing API gateway has crashed globally causing outages across multiple regions.',
                likes: 80
            }
        ];

        const enriched = engine.enrich(rawMentions, brandConfig);
        expect(enriched.length).toBe(1); // Merged near-duplicate

        const canonical = enriched[0];
        expect(canonical.duplicateCount).toBe(2);
        expect(canonical.isCrossPosted).toBe(true);
        expect(canonical.tags).toContain('context:crossposted');
        expect(canonical.duplicateSources).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ platform: 'web' }),
                expect.objectContaining({ platform: 'twitter' })
            ])
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// QA §5 – SIG-06: Empty/whitespace-only content
// ─────────────────────────────────────────────────────────────────────────────
describe('SIG-06: Empty/whitespace-only content (edge)', () => {
    test('ContentNormalizer handles empty string without error', () => {
        const normalizer = new ContentNormalizer();
        const result = normalizer.normalize('');
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
    });

    test('ContentNormalizer handles whitespace-only content', () => {
        const normalizer = new ContentNormalizer();
        const result = normalizer.normalize('   \n\t  ');
        expect(result).toBeDefined();
        expect(result.content.trim()).toBe('');
    });

    test('SignalEnrichmentEngine handles blank mentions without pipeline crash', () => {
        const engine = new SignalEnrichmentEngine();
        const rawMentions = [
            { id: 'blank_1', platform: 'web', url: 'https://example.com', text: '' },
            { id: 'blank_2', platform: 'reddit', url: 'https://reddit.com/r/test', text: '   ' }
        ];

        // Should not throw
        expect(() => {
            engine.enrich(rawMentions, { name: 'TestBrand', website: 'test.com' });
        }).not.toThrow();
    });
});
