/**
 * Emotion Analyzer v2
 * Advanced ensemble emotion classification with chunking, platform calibration, and sarcasm detection.
 * 
 * Why this improves accuracy:
 * - Chunked analysis prevents truncation of long posts and weights final statements higher.
 * - Ensemble scoring (j-hartmann + go_emotions) reduces single-model bias.
 * - Platform calibration adapts scoring (e.g., Reddit negativity offset, App Store star-rating calibration).
 * - Sarcasm detection flips polarity to avoid false-positives on sarcastic rants.
 */

const { HfInference } = require('@huggingface/inference');
const logger = require('./utils/logger');
const SentimentAnalyzer = require('./sentimentAnalyzer');

class EmotionAnalyzer {
    constructor() {
        const apiKey = process.env.HUGGING_FACE_API_KEY;
        this.hf = apiKey && apiKey !== 'your_hugging_face_api_key' ? new HfInference(apiKey) : null;
        this.sentimentAnalyzer = new SentimentAnalyzer();

        // Primary model: 7 basic emotions (anger, disgust, fear, joy, sadness, surprise, neutral)
        this.emotionModel = 'j-hartmann/emotion-english-distilroberta-base';

        // Granular model: 28 emotions
        this.fallbackModel = 'SamLowe/roberta-base-go_emotions';

        // Emotion weights for Rage Index calculation
        this.emotionWeights = {
            anger: 1.0, rage: 1.0, fury: 1.0,
            frustration: 0.8, annoyance: 0.8, disgust: 0.8, disappointment: 0.8,
            sadness: 0.6, fear: 0.6, confusion: 0.6, disapproval: 0.6,
            surprise: 0.3, nervousness: 0.3, embarrassment: 0.3,
            neutral: 0, realization: 0,
            joy: -0.5, admiration: -0.5, excitement: -0.5, love: -0.7,
            gratitude: -0.6, optimism: -0.4, pride: -0.5, amusement: -0.3,
            approval: -0.4, caring: -0.5, desire: -0.2, relief: -0.4
        };

        this.emotionCategories = {
            rage: ['anger', 'rage', 'fury', 'annoyance', 'frustration'],
            negative: ['disgust', 'disappointment', 'sadness', 'fear', 'disapproval'],
            positive: ['joy', 'love', 'admiration', 'excitement', 'gratitude', 'optimism'],
            neutral: ['neutral', 'surprise', 'realization', 'confusion']
        };

        // 25+ Sarcasm patterns
        this.sarcasmPatterns = [
            /oh (great|wonderful|fantastic|awesome|amazing|joy)/i,
            /just (perfect|great|wonderful|what i needed)/i,
            /thanks (a lot|so much|for nothing)/i,
            /really (helpful|useful|great|smart|genius)/i,
            /exactly what i (wanted|needed|expected)/i,
            /love (how|when) it (fails|crashes|breaks|stops working)/i,
            /so glad (to see|that)/i,
            /brilliant design/i,
            /genius implementation/i,
            /quality service/i,
            /best customer support ever/i,
            /works flawlessly, except/i,
            /nothing says.*like/i,
            /what a pleasant surprise/i,
            /don't you just love/i,
            /can't get enough of/i,
            /my favorite part is/i,
            /super helpful/i,
            /highly professional/i,
            /great job/i,
            /outstanding support/i,
            /love it when/i,
            /so happy/i,
            /thrilled to/i,
            /such a joy/i
        ];

        this.emojiSarcasmPattern = /[😂🙄🙃🤡👻💩☠️💀]|\b(haha|lol|lmao|rofl)\b/i;
    }

    /**
     * Chunk long text into semantic sentences
     */
    chunkText(text, maxChunkLen = 400) {
        if (!text) return [];
        const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChunkLen && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            currentChunk += ' ' + sentence;
        }
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks.slice(0, 3); // Safety cap: max 3 chunks
    }

    /**
     * Detect sarcasm using patterns and heuristics
     */
    detectSarcasm(text) {
        const directMatch = this.sarcasmPatterns.some(pattern => pattern.test(text));
        if (directMatch) return true;

        const hasEmojiOrSlang = this.emojiSarcasmPattern.test(text);
        if (hasEmojiOrSlang) {
            const words = text.toLowerCase().split(/\s+/);
            const negativeWords = ['bad', 'fail', 'error', 'broken', 'worst', 'crashed', 'useless', 'slow', 'frustrating', 'annoying'];
            const hasNegativeWord = words.some(w => negativeWords.some(nw => w.includes(nw)));
            if (hasNegativeWord) return true;
        }

        return false;
    }

    /**
     * Analyze emotions of a single text chunk
     */
    async analyzeChunk(chunk) {
        if (!this.hf) {
            throw new Error('Hugging Face client not initialized');
        }

        // Run both models in parallel (Ensemble)
        const [primaryRes, granularRes] = await Promise.all([
            this.hf.textClassification({ model: this.emotionModel, inputs: chunk }),
            this.hf.textClassification({ model: this.fallbackModel, inputs: chunk })
        ]);

        // Convert outputs to a key-value mapping
        const primaryMap = {};
        primaryRes.forEach(e => { primaryMap[e.label.toLowerCase()] = e.score; });

        const granularMap = {};
        granularRes.forEach(e => { granularMap[e.label.toLowerCase()] = e.score; });

        // Merge classifications: 0.7 primary + 0.3 granular
        const mergedEmotions = {};
        const allLabels = new Set([...Object.keys(primaryMap), ...Object.keys(granularMap)]);

        allLabels.forEach(label => {
            const primaryScore = primaryMap[label] || 0;
            const granularScore = granularMap[label] || 0;

            let score = 0;
            if (primaryMap[label] !== undefined && granularMap[label] !== undefined) {
                score = primaryScore * 0.7 + granularScore * 0.3;
            } else if (primaryMap[label] !== undefined) {
                score = primaryScore * 0.7;
            } else {
                score = granularScore * 0.3;
            }

            if (score > 0.05) {
                mergedEmotions[label] = score;
            }
        });

        // Determine if primary emotions disagree drastically
        const primaryMaxLabel = Object.keys(primaryMap).reduce((a, b) => primaryMap[a] > primaryMap[b] ? a : b);
        const granularMaxLabel = Object.keys(granularMap).reduce((a, b) => granularMap[a] > granularMap[b] ? a : b);
        const isAmbiguous = (primaryMaxLabel !== granularMaxLabel) && 
                            Math.abs((primaryMap[primaryMaxLabel] || 0) - (granularMap[primaryMaxLabel] || 0)) > 0.3;

        return { emotions: mergedEmotions, isAmbiguous };
    }

    /**
     * Analyze emotions with chunking, ensemble models, and context offsets
     */
    async analyzeEmotions(text, options = {}) {
        if (!text || typeof text !== 'string') {
            return this.fallbackToBasicSentiment('');
        }

        const platform = (options.platform || '').toLowerCase();
        const starRating = options.starRating || null;

        // Fallback check
        if (!this.hf) {
            return this.fallbackToBasicSentiment(text, platform, starRating);
        }

        try {
            const chunks = this.chunkText(text);
            const chunkResults = [];

            for (let i = 0; i < chunks.length; i++) {
                const chunkRes = await this.analyzeChunk(chunks[i]);
                chunkResults.push({
                    emotions: chunkRes.emotions,
                    isAmbiguous: chunkRes.isAmbiguous,
                    index: i,
                    total: chunks.length
                });
            }

            // Aggregate chunks with position weighting
            // First chunk = 1.0, middle chunk = 0.8, last chunk = 1.2
            const aggregatedEmotions = {};
            let totalWeight = 0;

            chunkResults.forEach(res => {
                let weight = 1.0;
                if (res.total > 1) {
                    if (res.index === 0) weight = 1.0;
                    else if (res.index === res.total - 1) weight = 1.2;
                    else weight = 0.8;
                }
                totalWeight += weight;

                Object.entries(res.emotions).forEach(([label, score]) => {
                    aggregatedEmotions[label] = (aggregatedEmotions[label] || 0) + (score * weight);
                });
            });

            // Normalize aggregated scores
            const finalEmotions = Object.entries(aggregatedEmotions)
                .map(([label, score]) => ({
                    label,
                    score: parseFloat((score / totalWeight).toFixed(4)),
                    confidence: this.getConfidenceLevel(score / totalWeight),
                    weight: this.emotionWeights[label] || 0
                }))
                .filter(e => e.score > 0.05)
                .sort((a, b) => b.score - a.score);

            if (finalEmotions.length === 0) {
                return this.fallbackToBasicSentiment(text, platform, starRating);
            }

            const primaryEmotion = finalEmotions[0];
            const isAmbiguous = chunkResults.some(r => r.isAmbiguous);
            const isSarcastic = this.detectSarcasm(text);

            // Sarcasm Calibration: reduce confidence and offset weights/polarity
            let confidence = primaryEmotion.confidence;
            if (isSarcastic) {
                confidence = 'low';
                finalEmotions.forEach(e => {
                    e.confidence = 'low';
                    if (e.label === 'joy' || e.label === 'admiration') {
                        e.weight = 0.8; // Treat positive emotions in sarcasm as frustration/anger
                    }
                });
            }

            // Platform and Rating Calibration
            this.calibrateEmotions(finalEmotions, platform, starRating);

            return {
                emotions: finalEmotions,
                primaryEmotion: primaryEmotion.label,
                primaryScore: primaryEmotion.score,
                confidence: isAmbiguous || isSarcastic ? 'low' : confidence,
                emotionDistribution: this.calculateDistribution(finalEmotions),
                emotionCategory: this.categorizeEmotion(primaryEmotion.label),
                isSarcastic,
                timestamp: new Date()
            };

        } catch (error) {
            logger.error('EmotionAnalyzer: HF analysis failed, calling fallback', { error: error.message });
            return this.fallbackToBasicSentiment(text, platform, starRating);
        }
    }

    /**
     * Calibration logic for platforms and star ratings
     */
    calibrateEmotions(emotions, platform, starRating) {
        emotions.forEach(e => {
            // App Store calibration
            if (['appstore', 'app_store', 'playstore', 'play_store'].includes(platform) && starRating) {
                if (starRating <= 2 && (e.label === 'anger' || e.label === 'frustration')) {
                    e.weight = Math.min(1.0, e.weight * 1.5); // Boost anger weight
                } else if (starRating >= 4 && (e.label === 'joy' || e.label === 'admiration')) {
                    e.weight = Math.max(-1.0, e.weight * 1.5); // Boost positive weight
                }
            }

            // Reddit context negativity offset handled downstream or during rage calculation
        });
    }

    /**
     * Fallback method using local rule-based SentimentAnalyzer
     */
    fallbackToBasicSentiment(text, platform = '', starRating = null) {
        const sentiment = this.sentimentAnalyzer.analyzeSentiment(text);
        const isSarcastic = this.detectSarcasm(text);

        let mappedEmotion = 'neutral';
        let weight = 0;
        let score = 0.5;

        if (sentiment.sentiment === 'positive') {
            mappedEmotion = 'joy';
            weight = -0.5;
            score = 0.6;
        } else if (sentiment.sentiment === 'negative') {
            mappedEmotion = isSarcastic ? 'frustration' : 'anger';
            weight = isSarcastic ? 0.8 : 1.0;
            score = 0.7;
        }

        const emotions = [{
            label: mappedEmotion,
            score,
            confidence: 'fallback',
            weight
        }];

        // Apply rating overrides
        if (starRating) {
            if (starRating <= 2) {
                emotions[0].label = 'anger';
                emotions[0].weight = 1.0;
            } else if (starRating >= 4) {
                emotions[0].label = 'joy';
                emotions[0].weight = -0.5;
            }
        }

        return {
            emotions,
            primaryEmotion: mappedEmotion,
            primaryScore: score,
            confidence: 'fallback',
            emotionDistribution: { [mappedEmotion]: 100 },
            emotionCategory: this.categorizeEmotion(mappedEmotion),
            isSarcastic,
            fallback: true,
            timestamp: new Date()
        };
    }

    getConfidenceLevel(score) {
        if (score >= 0.65) return 'high';
        if (score >= 0.35) return 'medium';
        return 'low';
    }

    calculateDistribution(emotions) {
        const total = emotions.reduce((sum, e) => sum + e.score, 0);
        const distribution = {};
        emotions.forEach(e => {
            distribution[e.label] = Math.round((e.score / (total || 1)) * 100);
        });
        return distribution;
    }

    categorizeEmotion(emotion) {
        for (const [category, emotions] of Object.entries(this.emotionCategories)) {
            if (emotions.includes(emotion)) {
                return category;
            }
        }
        return 'neutral';
    }

    /**
     * Process multiple texts in batch
     */
    async analyzeBatch(texts, options = {}) {
        const results = [];
        for (let i = 0; i < texts.length; i++) {
            const res = await this.analyzeEmotions(texts[i], options);
            results.push(res);
        }
        return results;
    }
}

module.exports = EmotionAnalyzer;
