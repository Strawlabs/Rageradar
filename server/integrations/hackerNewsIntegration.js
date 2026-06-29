/**
 * Hacker News Integration
 * Fetch brand mentions from Hacker News using the Algolia Search API.
 * Includes retry with backoff, circuit breaker, and normalized mention output.
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { retryWithBackoff, CircuitBreaker, isRetriableError } = require('./integrationUtils');
const { normalize } = require('./mentionNormalizer');

class HackerNewsIntegration {
    constructor() {
        this.name = 'hackernews';
        this.circuitBreaker = new CircuitBreaker({ name: 'hackernews', failureThreshold: 5, cooldownMs: 60000 });
    }

    /**
     * Check if Hacker News is configured (Hacker News API is open, so always returns true)
     * @returns {boolean}
     */
    isConfigured() {
        return true;
    }

    /**
     * Search for brand mentions on Hacker News
     * @param {string} brandName - Brand name to search
     * @param {object} options - Search options
     * @returns {Promise<Array>} Normalized HN mentions
     */
    async searchBrand(brandName, options = {}) {
        return this.circuitBreaker.exec(async () => {
            return retryWithBackoff(
                () => this._doSearch(brandName, options),
                {
                    maxRetries: 3,
                    baseDelay: 1000,
                    shouldRetry: isRetriableError,
                    label: 'HackerNews.searchBrand'
                }
            );
        });
    }

    /**
     * Internal search implementation
     */
    async _doSearch(brandName, options = {}) {
        try {
            const limit = options.limit || 100;
            logger.info('Searching Hacker News', { brandName, limit });

            // Call the Algolia HN Search API for stories and comments
            const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(brandName)}&tags=(story,comment)&hitsPerPage=${limit}`;
            const response = await axios.get(url, { timeout: 10000 });

            if (!response.data || !Array.isArray(response.data.hits)) {
                logger.warn('Hacker News integration received invalid response structure');
                return [];
            }

            const hits = response.data.hits;
            const mentions = [];

            for (const hit of hits) {
                const isComment = hit._tags && hit._tags.includes('comment');
                const rawText = isComment ? hit.comment_text : (hit.story_text || hit.title || '');
                const cleanTextContent = this._cleanText(rawText);

                if (!cleanTextContent) continue;

                // Build raw mention structure
                const rawMention = {
                    type: isComment ? 'comment' : 'post',
                    id: hit.objectID,
                    title: hit.title || hit.story_title || '',
                    text: cleanTextContent,
                    author: hit.author || '[unknown]',
                    score: hit.points || 0,
                    numComments: hit.num_comments || 0,
                    url: isComment 
                        ? `https://news.ycombinator.com/item?id=${hit.objectID}` 
                        : (hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`),
                    timestamp: hit.created_at ? new Date(hit.created_at) : new Date(),
                    metadata: {
                        storyId: hit.story_id || null,
                        parentId: hit.parent_id || null,
                        points: hit.points || 0
                    }
                };

                mentions.push(normalize('hackernews', rawMention));
            }

            logger.info('Hacker News search complete', {
                brandName,
                hitsFound: hits.length,
                totalMentions: mentions.length
            });

            return mentions;
        } catch (error) {
            logger.error('Hacker News search failed', {
                error: error.message,
                brandName
            });
            throw error;
        }
    }

    _cleanText(html) {
        if (!html) return '';
        return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Get status
     */
    getStatus() {
        return {
            name: this.name,
            configured: this.isConfigured(),
            cost: 'Free',
            rateLimit: 'Algolia Search API rate limits apply',
            features: 'Stories, comments search',
            circuitBreaker: this.circuitBreaker.getStatus()
        };
    }
}

module.exports = HackerNewsIntegration;
