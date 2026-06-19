/**
 * Relevance Scorer
 * Scores and filters signals based on their relevance and quality to eliminate noise.
 * 
 * Why this improves accuracy:
 * - Discards off-topic mentions (e.g., mentioning "stripe" as a pattern vs Stripe the company)
 * - Prioritizes high-engagement, fresh, and content-rich signals
 * - Uses statistical thresholds to filter out low-value feedback
 */

const logger = require('../../utils/logger');

class RelevanceScorer {
    constructor(options = {}) {
        this.threshold = options.threshold !== undefined ? options.threshold : 0.3;
        this.decayHalfLifeDays = options.decayHalfLifeDays || 7;
    }

    /**
     * Escape special regex characters
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Calculate relevance score (0-1) for a signal
     * @param {object} signal - The signal object (with normalized content)
     * @param {object} brandConfig - Configuration for the brand
     * @param {string} brandConfig.name - Brand name (e.g., "Stripe")
     * @param {string} [brandConfig.website] - Brand website (e.g., "stripe.com")
     * @param {Array<string>} [brandConfig.keywords] - Brand-specific keywords
     * @returns {number} Relevance score clamped between 0 and 1
     */
    calculateScore(signal, brandConfig = {}) {
        if (!signal || !signal.content) {
            return 0;
        }

        const brandName = (brandConfig.name || brandConfig.brandName || '').toLowerCase();
        const content = (signal.content || '').toLowerCase();
        const website = (brandConfig.website || '').toLowerCase();
        const keywords = (brandConfig.keywords || []).map(k => k.toLowerCase());

        if (!brandName) {
            logger.warn('RelevanceScorer: called without a brand name');
            return 0.5; // Neutral fallback
        }

        let score = 0;

        // 1. Direct Brand Name Mentions (Max +0.6)
        const brandRegex = new RegExp(`\\b${this.escapeRegExp(brandName)}\\b`, 'gi');
        const brandMentions = (content.match(brandRegex) || []).length;
        
        if (brandMentions > 0) {
            score += Math.min(0.6, 0.4 + (brandMentions - 1) * 0.1);
        }

        // 2. Website/Domain Mentions (Max +0.2)
        if (website) {
            const domain = website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
            if (content.includes(domain)) {
                score += 0.2;
            }
        }

        // 3. Brand Keyword Matches (Max +0.2)
        if (keywords.length > 0) {
            let keywordMatches = 0;
            keywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    keywordMatches++;
                }
            });
            if (keywordMatches > 0) {
                score += Math.min(0.2, keywordMatches * 0.05);
            }
        }

        // 4. Content length/quality (Max +0.1)
        const wordCount = content.split(/\s+/).length;
        if (wordCount > 15) {
            score += 0.1;
        } else if (wordCount > 5) {
            score += 0.05;
        }

        // 5. Engagement Amplification (Max +0.1)
        const meta = signal.platformMeta || {};
        const engagement = (meta.upvotes || 0) + (meta.likes || 0) + (meta.replies || 0) * 2;
        if (engagement > 100) {
            score += 0.1;
        } else if (engagement > 10) {
            score += 0.05;
        }

        // 6. Age Decay Factor (Multiplicative - decays relevance over time)
        let decayFactor = 1;
        if (signal.publishedAt) {
            const published = new Date(signal.publishedAt);
            const now = new Date();
            const ageInMs = now - published;
            const ageInDays = Math.max(0, ageInMs / (1000 * 60 * 60 * 24));
            
            // Half-life decay: decayFactor = 0.5 ^ (days / halfLife)
            decayFactor = Math.pow(0.5, ageInDays / this.decayHalfLifeDays);
        }

        // Apply decay
        const finalScore = score * decayFactor;

        // Clamp final score between 0 and 1
        return Math.max(0, Math.min(1, finalScore));
    }

    /**
     * Filter signals that meet the relevance threshold
     * @param {Array<object>} signals 
     * @param {object} brandConfig 
     * @returns {Array<object>} Filtered signals
     */
    filter(signals, brandConfig = {}) {
        if (!Array.isArray(signals)) return [];

        return signals
            .map(sig => {
                const score = this.calculateScore(sig, brandConfig);
                return { ...sig, relevanceScore: parseFloat(score.toFixed(3)) };
            })
            .filter(sig => sig.relevanceScore >= this.threshold);
    }
}

module.exports = RelevanceScorer;
