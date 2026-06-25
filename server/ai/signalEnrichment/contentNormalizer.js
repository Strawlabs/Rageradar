/**
 * Content Normalizer
 * Cleans raw web content into AI-ready text for accurate emotion analysis.
 * 
 * Why this improves accuracy:
 * - Removes HTML/boilerplate that confuses emotion models
 * - Normalizes platform-specific formatting (Reddit markdown, YouTube timestamps)
 * - Fixes encoding issues that cause token corruption
 * - Extracts meaningful content only (no nav menus, cookie banners, footers)
 */

const logger = require('../../utils/logger');

class ContentNormalizer {
    constructor() {
        // Boilerplate patterns to strip (common across web pages)
        this.boilerplatePatterns = [
            // Cookie/privacy banners
            /we use cookies[^.]*\./gi,
            /by continuing[^.]*you agree[^.]*\./gi,
            /accept all cookies/gi,
            /privacy policy/gi,
            /terms of service/gi,
            /cookie settings/gi,

            // Social sharing
            /share on (twitter|facebook|linkedin|reddit)/gi,
            /follow us on/gi,
            /subscribe to our newsletter/gi,

            // Navigation/UI elements
            /sign (in|up|out)/gi,
            /log (in|out)/gi,
            /home\s*>\s*/gi,
            /breadcrumb/gi,

            // Comment metadata noise
            /\d+ (upvotes?|downvotes?|points?)/gi,
            /posted \d+ (hours?|days?|weeks?|months?) ago/gi,
            /\d+ comments?/gi,
            /reply to this/gi,

            // Ads/promotions
            /sponsored content/gi,
            /advertisement/gi,
            /promoted/gi,

            // Footer boilerplate
            /all rights reserved/gi,
            /copyright ©?\s*\d{4}/gi,
            /powered by \w+/gi
        ];

        // Platform-specific content patterns
        this.platformNormalizers = {
            reddit: this.normalizeReddit.bind(this),
            youtube: this.normalizeYouTube.bind(this),
            producthunt: this.normalizeProductHunt.bind(this),
            appstore: this.normalizeAppStore.bind(this),
            app_store: this.normalizeAppStore.bind(this),
            playstore: this.normalizeAppStore.bind(this),
            play_store: this.normalizeAppStore.bind(this)
        };
    }

    /**
     * Decode common HTML entities
     * @param {string} text 
     * @returns {string} decoded text
     */
    decodeEntities(text) {
        if (!text) return '';
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
    }

    /**
     * Strip basic HTML tags
     * @param {string} html 
     * @returns {string} plain text
     */
    stripHtml(html) {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, ' ');
    }

    /**
     * Clean Reddit specific markdown/text
     * @param {string} text 
     * @returns {string} cleaned text
     */
    normalizeReddit(text) {
        if (!text) return '';
        return text
            .replace(/\s*r\/\w+/gi, '') // Strip r/subreddit references
            .replace(/\s*u\/\w+/gi, '') // Strip u/user references
            .replace(/\*\*|__|\*|_/g, '') // Strip markdown bold/italic tags
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Strip links, keep text
            .replace(/\b(edit|update):.*$/gi, '') // Remove Edit: block completely
            .trim();
    }

    /**
     * Clean YouTube specific comments/descriptions
     * @param {string} text 
     * @returns {string} cleaned text
     */
    normalizeYouTube(text) {
        if (!text) return '';
        return text
            .replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, '') // Strip timestamps (e.g. 03:45)
            .replace(/subscribe|channel|bell icon|video/gi, '') // Strip promo words
            .trim();
    }

    /**
     * Clean Product Hunt posts/reviews
     * @param {string} text 
     * @returns {string} cleaned text
     */
    normalizeProductHunt(text) {
        if (!text) return '';
        return text
            .replace(/hunting|hunter|maker|makers|launch/gi, '')
            .trim();
    }

    /**
     * Clean App Store reviews
     * @param {string} text 
     * @returns {string} cleaned text
     */
    normalizeAppStore(text) {
        if (!text) return '';
        return text
            .replace(/app|developer|update|version/gi, '')
            .trim();
    }

    /**
     * Normalize general raw text or HTML
     * @param {string} rawText 
     * @param {object} options 
     * @param {string} [options.platform] - 'reddit', 'youtube', etc.
     * @returns {object} Normalized result: { content: string, qualityScore: number }
     */
    normalize(rawText, options = {}) {
        if (!rawText || typeof rawText !== 'string') {
            return { content: '', qualityScore: 0 };
        }

        // 1. Strip HTML tags
        let cleaned = this.stripHtml(rawText);

        // 2. Decode entities
        cleaned = this.decodeEntities(cleaned);

        // 3. Platform-specific normalization
        const platform = (options.platform || '').toLowerCase();
        if (this.platformNormalizers[platform]) {
            cleaned = this.platformNormalizers[platform](cleaned);
        }

        // 4. Strip general boilerplate patterns
        this.boilerplatePatterns.forEach(pattern => {
            cleaned = cleaned.replace(pattern, ' ');
        });

        // 5. Clean up whitespace
        cleaned = cleaned
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\s+\./g, '') // Strip boilerplate dots leftover
            .replace(/\s+([.,!?;:])/g, '$1') // Normalize spaces before punctuation
            .trim();

        // 6. Calculate content quality score (0-1)
        const qualityScore = this.calculateQualityScore(cleaned, rawText);

        return {
            content: cleaned,
            qualityScore
        };
    }

    /**
     * Calculate a quality score (0-1) based on information density and readability
     */
    calculateQualityScore(cleanedText, rawText) {
        if (!cleanedText) return 0;

        const cleanLen = cleanedText.length;
        const rawLen = rawText.length;

        // Penalty for excessive boilerplate stripping (e.g. if we stripped 90% of page, it was probably all nav/footer)
        const retentionRate = rawLen > 0 ? cleanLen / rawLen : 0;
        let score = 0.5;

        // Word count check
        const words = cleanedText.split(/\s+/).filter(Boolean);
        const wordCount = words.length;

        if (wordCount < 5) {
            score -= 0.3; // Very short text is low quality
        } else if (wordCount >= 5 && wordCount < 15) {
            score += 0.1;
        } else if (wordCount >= 15 && wordCount < 100) {
            score += 0.3; // Optimal length for sentiment analysis
        } else {
            score += 0.4; // Rich text
        }

        // Penalty for excessively high retention if raw text had tons of HTML, or very low retention
        if (retentionRate < 0.1) {
            score -= 0.2; // Mostly noise stripped
        } else if (retentionRate > 0.95 && rawLen > 200) {
            score += 0.1; // Genuine long-form raw content
        }

        // Clamp score between 0 and 1
        return Math.max(0, Math.min(1, score));
    }
}

module.exports = ContentNormalizer;
