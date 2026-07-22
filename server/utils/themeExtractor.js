/**
 * Theme Extractor v2
 * Extract and group recurring themes from emotional mentions using:
 *  - TF-IDF keyword extraction
 *  - Noun phrase detection (compromise NLP)
 *  - Synonym clustering (domain-specific map)
 *  - Rage-weighted ranking (frequency x avgRageIndex)
 *  - Intensity band labelling (Minimal -> Critical)
 *  - Per-mention theme back-propagation
 */

const natural = require('natural');
const nlp = require('compromise');
const stopword = require('stopword');
const logger = require('./logger');

// ---------------------------------------------------------------------------
// Severity band helper (mirrors the Rage Index 2.0 bands)
// ---------------------------------------------------------------------------
const SEVERITY_BANDS = [
    { label: 'Critical', min: 80, max: 100 },
    { label: 'High',     min: 60, max: 79  },
    { label: 'Moderate', min: 40, max: 59  },
    { label: 'Low',      min: 20, max: 39  },
    { label: 'Minimal',  min: 0,  max: 19  },
];

function getSeverityBand(rageIndex) {
    return (SEVERITY_BANDS.find(b => rageIndex >= b.min && rageIndex <= b.max) || SEVERITY_BANDS[4]).label;
}

// ---------------------------------------------------------------------------
// Domain-specific synonym clusters
// Key = canonical label, Value = synonyms to collapse into the key
// ---------------------------------------------------------------------------
const SYNONYM_CLUSTERS = {
    'slow performance': ['slow', 'lag', 'lagging', 'latency', 'sluggish', 'unresponsive', 'freeze', 'freezing', 'frozen', 'timeout', 'hang', 'hanging', 'buffer', 'buffering', 'delay', 'delays', 'loading', 'stutter'],
    'crash / error':    ['crash', 'crashed', 'crashing', 'error', 'bug', 'bugs', 'glitch', 'glitches', 'broken', 'fail', 'fails', 'failure', 'outage', 'down', 'offline', 'issue', 'issues'],
    'pricing':          ['expensive', 'price', 'pricing', 'fee', 'fees', 'charge', 'charges', 'cost', 'costs', 'billing', 'overpriced', 'overcharge', 'subscription', 'payment', 'money', 'refund'],
    'customer support': ['support', 'helpdesk', 'help', 'response', 'reply', 'contact', 'team', 'ticket', 'wait', 'waiting', 'ignored', 'useless'],
    'login / auth':     ['login', 'signin', 'auth', 'authentication', 'password', 'account', 'access', 'session', 'logout', 'locked', 'otp', 'verification'],
    'data loss':        ['data', 'lost', 'loss', 'deleted', 'missing', 'gone', 'wiped', 'corrupt', 'corrupted', 'backup', 'sync', 'syncing'],
    'ui / ux':          ['ui', 'ux', 'interface', 'design', 'confusing', 'complicated', 'difficult', 'navigation', 'button', 'screen', 'layout', 'usability'],
    'reliability':      ['unreliable', 'unstable', 'inconsistent', 'random', 'keeps', 'always', 'never', 'stopped'],
};

// Pre-build reverse lookup: synonym -> canonical label
const SYNONYM_REVERSE = new Map();
for (const [canonical, synonyms] of Object.entries(SYNONYM_CLUSTERS)) {
    SYNONYM_REVERSE.set(canonical, canonical);
    for (const syn of synonyms) {
        SYNONYM_REVERSE.set(syn, canonical);
    }
}

class ThemeExtractor {
    constructor() {
        this.tfidf = new natural.TfIdf();

        this.customStopWords = new Set([
            'app', 'product', 'service', 'company', 'brand', 'website', 'platform',
            'thing', 'stuff', 'really', 'just', 'like', 'get', 'got', 'make', 'made',
            'use', 'used', 'using', 'work', 'works', 'working', 'need', 'needs',
            'want', 'wants', 'try', 'tried', 'trying', 'think', 'thought', 'know',
            'https', 'http', 'www', 'com', 'org', 'net', 'one', 'two', 'time',
            'will', 'also', 'even', 'much', 'very', 'still', 'back', 'well', 'good',
        ]);
    }

    // -------------------------------------------------------------------------
    // Public: extractThemes
    // -------------------------------------------------------------------------
    async extractThemes(mentions, options = {}) {
        try {
            const { minRageIndex = 60, topN = 10, minFrequency = 2 } = options;

            logger.info('ThemeExtractor: Extracting themes', {
                totalMentions: mentions.length, minRageIndex, topN
            });

            // Filter to high-intensity mentions for PRIMARY clusters
            const primaryMentions = mentions.filter(m => {
                if (typeof m.rageIndex === 'number') return m.rageIndex >= minRageIndex;
                if (m.emotions) {
                    return m.emotions.some(e =>
                        ['anger', 'frustration', 'disgust', 'disappointment'].includes(e.label) &&
                        e.score > 0.5
                    );
                }
                return false;
            });

            if (primaryMentions.length === 0) {
                logger.warn('ThemeExtractor: No high-intensity mentions — falling back to all mentions');
                return this._runExtraction(mentions, mentions, { topN, minFrequency, isPrimary: false });
            }

            return this._runExtraction(primaryMentions, mentions, { topN, minFrequency, isPrimary: true });

        } catch (error) {
            logger.error('ThemeExtractor: extractThemes failed', { error: error.message });
            return [];
        }
    }

    // -------------------------------------------------------------------------
    // Public: tagMentionsWithThemes — back-propagate theme tags onto signals
    // -------------------------------------------------------------------------
    tagMentionsWithThemes(mentions, themes) {
        if (!Array.isArray(themes) || themes.length === 0) return mentions;

        for (const mention of mentions) {
            const text = (mention.content || mention.text || '').toLowerCase();
            if (!text) { mention.themes = []; continue; }

            const matched = [];
            for (const theme of themes) {
                const themeTerms = [theme.theme, ...(theme.keywords || [])];
                const hits = themeTerms.filter(t => t && text.includes(t.toLowerCase()));
                if (hits.length > 0) matched.push(theme.theme);
            }
            mention.themes = [...new Set(matched)];
        }

        return mentions;
    }

    // -------------------------------------------------------------------------
    // Public: extractThemesForEmotion
    // -------------------------------------------------------------------------
    async extractThemesForEmotion(mentions, emotion) {
        const emotionMentions = mentions.filter(m =>
            m.emotions && m.emotions.some(e => e.label === emotion && e.score > 0.5)
        );
        return this.extractThemes(emotionMentions, { minRageIndex: 0 });
    }

    // -------------------------------------------------------------------------
    // Internal pipeline
    // -------------------------------------------------------------------------
    _runExtraction(primaryMentions, allMentions, { topN, minFrequency, isPrimary }) {
        const keywords    = this._extractKeywords(primaryMentions);
        const nounPhrases = this._extractNounPhrases(primaryMentions);

        const allRawTerms    = [...keywords, ...nounPhrases];
        const normalisedTerms = allRawTerms.map(t => this._normaliseTerm(t)).filter(Boolean);

        const termFrequency = this._calculateFrequency(normalisedTerms);
        const themes        = this._groupSimilarTerms(termFrequency, minFrequency);
        const rankedThemes  = this._rankThemes(themes, primaryMentions, allMentions, isPrimary);

        return rankedThemes.slice(0, topN).map(theme => ({
            ...theme,
            examples: this._getExamplesForTheme(theme, primaryMentions, 3)
        }));
    }

    _extractKeywords(mentions) {
        this.tfidf = new natural.TfIdf();
        mentions.forEach(m => { if (m.text) this.tfidf.addDocument(m.text.toLowerCase()); });

        const allTerms = [];
        mentions.forEach((_, index) => {
            this.tfidf.listTerms(index).forEach(item => {
                if (item.term.length > 3 && !this.customStopWords.has(item.term)) {
                    allTerms.push(item.term);
                }
            });
        });
        return allTerms;
    }

    _extractNounPhrases(mentions) {
        const phrases = [];
        mentions.forEach(m => {
            if (!m.text) return;
            const doc = nlp(m.text);
            phrases.push(...doc.nouns().out('array'));
            phrases.push(...doc.match('#Adjective #Noun').out('array'));
        });
        return phrases
            .map(p => p.toLowerCase().trim())
            .filter(p => p.length > 3 && !this.customStopWords.has(p));
    }

    _normaliseTerm(term) {
        const lower = term.toLowerCase().trim();
        if (SYNONYM_REVERSE.has(lower)) return SYNONYM_REVERSE.get(lower);
        const words = lower.split(/\s+/);
        for (const word of words) {
            if (SYNONYM_REVERSE.has(word)) return SYNONYM_REVERSE.get(word);
        }
        return this._cleanTerm(lower);
    }

    _cleanTerm(term) {
        let cleaned = term.replace(/[^a-z\s/]/g, '').trim();
        const words = cleaned.split(/\s+/);
        const filtered = stopword.removeStopwords(words);
        cleaned = filtered.join(' ').trim();
        if (cleaned.length < 3 || this.customStopWords.has(cleaned)) return null;
        return cleaned;
    }

    _calculateFrequency(terms) {
        const frequency = new Map();
        terms.forEach(term => {
            if (term) frequency.set(term, (frequency.get(term) || 0) + 1);
        });
        return frequency;
    }

    _groupSimilarTerms(termFrequency, minFrequency) {
        const themes    = [];
        const processed = new Set();

        const sortedTerms = Array.from(termFrequency.entries())
            .filter(([, freq]) => freq >= minFrequency)
            .sort((a, b) => b[1] - a[1]);

        for (const [term, frequency] of sortedTerms) {
            if (processed.has(term)) continue;

            const similar = sortedTerms
                .filter(([t]) => !processed.has(t) && t !== term && this._areSimilar(term, t))
                .map(([t, f]) => ({ term: t, frequency: f }));

            themes.push({
                primary: term,
                frequency,
                related: similar.slice(0, 5),
                totalFrequency: similar.reduce((sum, s) => sum + s.frequency, frequency)
            });

            processed.add(term);
            similar.forEach(s => processed.add(s.term));
        }

        return themes;
    }

    _areSimilar(t1, t2) {
        if (t1 === t2) return true;
        if (t1.includes(t2) || t2.includes(t1)) return true;
        if (t1.length <= 6 && t2.length <= 6) {
            return natural.LevenshteinDistance(t1, t2) <= 2;
        }
        return false;
    }

    _rankThemes(themes, primaryMentions, allMentions, isPrimary) {
        return themes.map(theme => {
            const termMentions = allMentions.filter(m =>
                m.text && m.text.toLowerCase().includes(theme.primary)
            );

            const avgRageIndex = termMentions.length > 0
                ? termMentions.reduce((sum, m) => sum + (m.rageIndex || 50), 0) / termMentions.length
                : 50;

            const intensityScore = Math.round(theme.totalFrequency * (avgRageIndex / 100) * 10) / 10;

            return {
                theme:            theme.primary,
                keywords:         [theme.primary, ...theme.related.map(r => r.term)],
                frequency:        theme.totalFrequency,
                avgRageIndex:     Math.round(avgRageIndex),
                intensityScore,
                intensityBand:    getSeverityBand(Math.round(avgRageIndex)),
                isPrimaryCluster: isPrimary,
                mentionCount:     termMentions.length,
                percentage:       allMentions.length > 0
                    ? Math.round((termMentions.length / allMentions.length) * 100)
                    : 0
            };
        }).sort((a, b) => b.intensityScore - a.intensityScore);
    }

    _getExamplesForTheme(theme, mentions, count = 3) {
        return mentions
            .filter(m => m.text && m.text.toLowerCase().includes(theme.theme))
            .sort((a, b) => (b.rageIndex || 0) - (a.rageIndex || 0))
            .slice(0, count)
            .map(m => ({
                text:      m.text.length > 200 ? m.text.substring(0, 200) + '...' : m.text,
                rageIndex: m.rageIndex,
                platform:  m.platform,
                timestamp: m.timestamp
            }));
    }

    // Backwards-compat aliases for any callers using the old public names
    extractKeywords(mentions)                        { return this._extractKeywords(mentions); }
    extractNounPhrases(mentions)                     { return this._extractNounPhrases(mentions); }
    calculateFrequency(terms)                        { return this._calculateFrequency(terms); }
    groupSimilarTerms(termFrequency, minFrequency)   { return this._groupSimilarTerms(termFrequency, minFrequency); }
    rankThemes(themes, mentions)                     { return this._rankThemes(themes, mentions, mentions, false); }
    getExamplesForTheme(theme, mentions, count)      { return this._getExamplesForTheme(theme, mentions, count); }
    cleanTerm(term)                                  { return this._cleanTerm(term); }
    areSimilar(t1, t2)                               { return this._areSimilar(t1, t2); }
}

module.exports = ThemeExtractor;
