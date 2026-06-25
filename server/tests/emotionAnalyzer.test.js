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
});
