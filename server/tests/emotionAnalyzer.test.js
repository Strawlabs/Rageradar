/**
 * Emotion Analyzer Unit Tests
 */

const EmotionAnalyzer = require('../emotionAnalyzer');

describe('EmotionAnalyzer', () => {
    let analyzer;

    beforeEach(() => {
        analyzer = new EmotionAnalyzer();
    });

    test('should chunk long texts into sentence-aware blocks', () => {
        const longText = 'This is the first sentence. It has some text. Here is a second sentence that is also quite long and should be grouped correctly. Lastly, we have a final sentence to finish the chunking test.';
        const chunks = analyzer.chunkText(longText, 60);
        
        expect(chunks.length).toBeGreaterThan(1);
        expect(chunks.length).toBeLessThanOrEqual(3); // Cap at 3 chunks
        expect(chunks[0]).toContain('This is the first sentence.');
    });

    test('should detect direct sarcasm patterns', () => {
        const sarcasticText = 'Oh great, another payment failure. Just perfect.';
        const isSarcastic = analyzer.detectSarcasm(sarcasticText);
        expect(isSarcastic).toBe(true);
    });

    test('should detect emoji-based sarcasm', () => {
        const sarcasticEmojiText = 'Our checkout page is broken again 😂 support is so helpful';
        const isSarcastic = analyzer.detectSarcasm(sarcasticEmojiText);
        expect(isSarcastic).toBe(true);
    });

    test('should not trigger sarcasm on normal negative complaints', () => {
        const plainNegative = 'I am extremely frustrated with this billing issue. Please fix it.';
        const isSarcastic = analyzer.detectSarcasm(plainNegative);
        expect(isSarcastic).toBe(false);
    });

    test('should fall back to local rule-based SentimentAnalyzer when Hugging Face is not available', async () => {
        // Since process.env.HUGGING_FACE_API_KEY is a placeholder, it falls back
        const result = await analyzer.analyzeEmotions('This tool is amazing and simple to use!');
        
        expect(result.fallback).toBe(true);
        expect(result.primaryEmotion).toBe('joy');
        expect(result.confidence).toBe('fallback');
        expect(result.emotions[0].weight).toBeLessThan(0); // Positive emotions have negative rage weight
    });

    test('should calibrate weights based on App Store ratings', () => {
        const emotions = [
            { label: 'anger', score: 0.6, weight: 1.0 },
            { label: 'joy', score: 0.1, weight: -0.5 }
        ];

        analyzer.calibrateEmotions(emotions, 'appstore', 1);
        expect(emotions[0].weight).toBe(1.0); // Anger boosted or capped at 1.0

        analyzer.calibrateEmotions(emotions, 'appstore', 5);
        expect(emotions[1].weight).toBe(-0.75); // Positive emotion weight boosted by 1.5x

        // Reset weights
        emotions[0].weight = 1.0;
        emotions[1].weight = -0.5;

        // Test app_store
        analyzer.calibrateEmotions(emotions, 'app_store', 1);
        expect(emotions[0].weight).toBe(1.0);
        analyzer.calibrateEmotions(emotions, 'app_store', 5);
        expect(emotions[1].weight).toBe(-0.75);

        // Reset weights
        emotions[0].weight = 1.0;
        emotions[1].weight = -0.5;

        // Test play_store
        analyzer.calibrateEmotions(emotions, 'play_store', 1);
        expect(emotions[0].weight).toBe(1.0);
        analyzer.calibrateEmotions(emotions, 'play_store', 5);
        expect(emotions[1].weight).toBe(-0.75);
    });

    test('should classify very short texts as low confidence and flag isShortText', async () => {
        const shortText = 'Ok.';
        const result = await analyzer.analyzeEmotions(shortText);
        expect(result.isShortText).toBe(true);
        expect(result.confidence).toBe('low');
    });

    // ── QA §6 – EMO-07: Duplicate mentions processed independently ──
    test('EMO-07: identical texts each produce classification results', async () => {
        const text = 'This product is absolutely terrible and broken!';
        const result1 = await analyzer.analyzeEmotions(text);
        const result2 = await analyzer.analyzeEmotions(text);

        // Both should return valid results independently
        expect(result1.primaryEmotion).toBeDefined();
        expect(result2.primaryEmotion).toBeDefined();
        expect(result1.emotions.length).toBeGreaterThan(0);
        expect(result2.emotions.length).toBeGreaterThan(0);
    });

    // ── QA §6 – EMO-08: Multiple emotion labels per mention ──
    test('EMO-08: fallback returns multiple emotion labels when applicable', async () => {
        const mixedText = 'I am angry about the outage but grateful for the quick response from support';
        const result = await analyzer.analyzeEmotions(mixedText);

        // Fallback mode should still produce multi-label output
        expect(result.emotions.length).toBeGreaterThanOrEqual(1);
        // Verify it has label and score structure
        result.emotions.forEach(e => {
            expect(e).toHaveProperty('label');
            expect(e).toHaveProperty('score');
        });
    });

    // ── QA §6 – EMO-09: Model fallback mode ──
    test('EMO-09: fallback mode returns valid labels mapped to primary taxonomy', async () => {
        // In test env, HF API key is a placeholder so fallback is used
        const result = await analyzer.analyzeEmotions('I love this service, it works perfectly!');

        expect(result.fallback).toBe(true);
        // Labels should be from the known emotion taxonomy
        const validLabels = [
            'anger', 'rage', 'fury', 'frustration', 'annoyance', 'disgust',
            'disappointment', 'sadness', 'fear', 'confusion', 'surprise',
            'nervousness', 'embarrassment', 'neutral', 'joy', 'admiration',
            'excitement', 'love', 'gratitude', 'optimism', 'pride',
            'amusement', 'approval', 'caring', 'desire', 'relief', 'disapproval', 'realization'
        ];
        expect(validLabels).toContain(result.primaryEmotion);
    });
});
