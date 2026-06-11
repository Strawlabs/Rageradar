/**
 * Theme Extractor
 * Extract and group recurring themes from emotional mentions
 */

const natural = require('natural');
const nlp = require('compromise');
const stopword = require('stopword');
const logger = require('./logger');

class ThemeExtractor {
    constructor() {
        this.tfidf = new natural.TfIdf();

        // Common tech/brand-related stop words to remove
        this.customStopWords = new Set([
            'app', 'product', 'service', 'company', 'brand', 'website', 'platform',
            'thing', 'stuff', 'really', 'just', 'like', 'get', 'got', 'make', 'made',
            'use', 'used', 'using', 'work', 'works', 'working', 'need', 'needs',
            'want', 'wants', 'try', 'tried', 'trying', 'think', 'thought', 'know',
            'https', 'http', 'www', 'com', 'org', 'net'
        ]);
    }

    /**
     * Extract themes from mentions
     * @param {Array} mentions - Array of mention objects
     * @param {object} options - Extraction options
     * @returns {Promise<Array>} Extracted themes
     */
    async extractThemes(mentions, options = {}) {
        try {
            const {
                minRageIndex = 60, // Only analyze high-rage mentions
                topN = 10,
                minFrequency = 2
            } = options;

            logger.info('Extracting themes', {
                totalMentions: mentions.length,
                minRageIndex,
                topN
            });

            // Filter to high-rage mentions
            const rageMentions = mentions.filter(m => {
                if (m.rageIndex) return m.rageIndex >= minRageIndex;
                if (m.emotions) {
                    const hasRageEmotion = m.emotions.some(e =>
                        ['anger', 'frustration', 'disgust', 'disappointment'].includes(e.label) &&
                        e.score > 0.5
                    );
                    return hasRageEmotion;
                }
                return false;
            });

            if (rageMentions.length === 0) {
                logger.warn('No high-rage mentions found for theme extraction');
                return [];
            }

            // Extract keywords using multiple methods
            const keywords = this.extractKeywords(rageMentions);

            // Extract noun phrases
            const nounPhrases = this.extractNounPhrases(rageMentions);

            // Combine and rank
            const allTerms = [...keywords, ...nounPhrases];
            const termFrequency = this.calculateFrequency(allTerms);

            // Group similar terms
            const themes = this.groupSimilarTerms(termFrequency, minFrequency);

            // Rank themes by intensity and frequency
            const rankedThemes = this.rankThemes(themes, rageMentions);

            // Get top N themes
            const topThemes = rankedThemes.slice(0, topN);

            // Add examples for each theme
            const themesWithExamples = topThemes.map(theme => ({
                ...theme,
                examples: this.getExamplesForTheme(theme, rageMentions, 3)
            }));

            logger.info('Theme extraction complete', {
                rageMentionsAnalyzed: rageMentions.length,
                themesFound: themesWithExamples.length
            });

            return themesWithExamples;

        } catch (error) {
            logger.error('Theme extraction failed', { error: error.message });
            return [];
        }
    }

    /**
     * Extract keywords using TF-IDF
     * @param {Array} mentions - Mentions
     * @returns {Array} Keywords
     */
    extractKeywords(mentions) {
        // Add documents to TF-IDF
        this.tfidf = new natural.TfIdf(); // Reset
        mentions.forEach(mention => {
            if (mention.text) {
                this.tfidf.addDocument(mention.text.toLowerCase());
            }
        });

        // Extract top terms from each document
        const allTerms = [];
        mentions.forEach((mention, index) => {
            const terms = [];
            this.tfidf.listTerms(index).forEach(item => {
                if (item.term.length > 3 && !this.customStopWords.has(item.term)) {
                    terms.push(item.term);
                }
            });
            allTerms.push(...terms.slice(0, 5)); // Top 5 per mention
        });

        return allTerms;
    }

    /**
     * Extract noun phrases using NLP
     * @param {Array} mentions - Mentions
     * @returns {Array} Noun phrases
     */
    extractNounPhrases(mentions) {
        const phrases = [];

        mentions.forEach(mention => {
            if (!mention.text) return;

            const doc = nlp(mention.text);

            // Extract nouns
            const nouns = doc.nouns().out('array');
            phrases.push(...nouns);

            // Extract adjective-noun combinations
            const adjNouns = doc.match('#Adjective #Noun').out('array');
            phrases.push(...adjNouns);
        });

        // Clean and filter
        return phrases
            .map(p => p.toLowerCase().trim())
            .filter(p => p.length > 3 && !this.customStopWords.has(p));
    }

    /**
     * Calculate term frequency
     * @param {Array} terms - Terms
     * @returns {Map} Frequency map
     */
    calculateFrequency(terms) {
        const frequency = new Map();

        terms.forEach(term => {
            const cleaned = this.cleanTerm(term);
            if (cleaned) {
                frequency.set(cleaned, (frequency.get(cleaned) || 0) + 1);
            }
        });

        return frequency;
    }

    /**
     * Clean term
     * @param {string} term - Term to clean
     * @returns {string} Cleaned term
     */
    cleanTerm(term) {
        // Remove special characters, numbers
        let cleaned = term.replace(/[^a-z\s]/g, '').trim();

        // Remove stop words
        const words = cleaned.split(/\s+/);
        const filtered = stopword.removeStopwords(words);
        cleaned = filtered.join(' ');

        // Filter out if too short or in custom stop words
        if (cleaned.length < 3 || this.customStopWords.has(cleaned)) {
            return null;
        }

        return cleaned;
    }

    /**
     * Group similar terms
     * @param {Map} termFrequency - Term frequency map
     * @param {number} minFrequency - Minimum frequency
     * @returns {Array} Grouped themes
     */
    groupSimilarTerms(termFrequency, minFrequency) {
        const themes = [];
        const processed = new Set();

        // Sort by frequency
        const sortedTerms = Array.from(termFrequency.entries())
            .filter(([term, freq]) => freq >= minFrequency)
            .sort((a, b) => b[1] - a[1]);

        sortedTerms.forEach(([term, frequency]) => {
            if (processed.has(term)) return;

            // Find similar terms
            const similar = sortedTerms
                .filter(([t, f]) => !processed.has(t) && this.areSimilar(term, t))
                .map(([t, f]) => ({ term: t, frequency: f }));

            // Create theme
            themes.push({
                primary: term,
                frequency: frequency,
                related: similar.slice(0, 5), // Top 5 related
                totalFrequency: similar.reduce((sum, s) => sum + s.frequency, frequency)
            });

            // Mark as processed
            processed.add(term);
            similar.forEach(s => processed.add(s.term));
        });

        return themes;
    }

    /**
     * Check if two terms are similar
     * @param {string} term1 - First term
     * @param {string} term2 - Second term
     * @returns {boolean} Are similar
     */
    areSimilar(term1, term2) {
        if (term1 === term2) return true;

        // Check if one contains the other
        if (term1.includes(term2) || term2.includes(term1)) return true;

        // Check Levenshtein distance for short terms
        if (term1.length <= 6 && term2.length <= 6) {
            const distance = natural.LevenshteinDistance(term1, term2);
            return distance <= 2;
        }

        return false;
    }

    /**
     * Rank themes by intensity and frequency
     * @param {Array} themes - Themes
     * @param {Array} mentions - Mentions
     * @returns {Array} Ranked themes
     */
    rankThemes(themes, mentions) {
        return themes.map(theme => {
            // Calculate average rage index for mentions containing this theme
            const themeMentions = mentions.filter(m =>
                m.text && m.text.toLowerCase().includes(theme.primary)
            );

            const avgRageIndex = themeMentions.length > 0
                ? themeMentions.reduce((sum, m) => sum + (m.rageIndex || 50), 0) / themeMentions.length
                : 50;

            // Calculate intensity score (frequency × rage index)
            const intensityScore = theme.totalFrequency * (avgRageIndex / 100);

            return {
                theme: theme.primary,
                keywords: [theme.primary, ...theme.related.map(r => r.term)],
                frequency: theme.totalFrequency,
                avgRageIndex: Math.round(avgRageIndex),
                intensityScore: Math.round(intensityScore * 10) / 10,
                mentionCount: themeMentions.length,
                percentage: Math.round((themeMentions.length / mentions.length) * 100)
            };
        }).sort((a, b) => b.intensityScore - a.intensityScore);
    }

    /**
     * Get example mentions for a theme
     * @param {object} theme - Theme
     * @param {Array} mentions - All mentions
     * @param {number} count - Number of examples
     * @returns {Array} Example mentions
     */
    getExamplesForTheme(theme, mentions, count = 3) {
        const themeMentions = mentions
            .filter(m => m.text && m.text.toLowerCase().includes(theme.theme))
            .sort((a, b) => (b.rageIndex || 0) - (a.rageIndex || 0))
            .slice(0, count);

        return themeMentions.map(m => ({
            text: m.text.substring(0, 200) + (m.text.length > 200 ? '...' : ''),
            rageIndex: m.rageIndex,
            platform: m.platform,
            timestamp: m.timestamp
        }));
    }

    /**
     * Extract themes for specific emotion
     * @param {Array} mentions - Mentions
     * @param {string} emotion - Emotion to filter by
     * @returns {Promise<Array>} Themes
     */
    async extractThemesForEmotion(mentions, emotion) {
        const emotionMentions = mentions.filter(m =>
            m.emotions && m.emotions.some(e => e.label === emotion && e.score > 0.5)
        );

        return this.extractThemes(emotionMentions, { minRageIndex: 0 });
    }
}

module.exports = ThemeExtractor;
