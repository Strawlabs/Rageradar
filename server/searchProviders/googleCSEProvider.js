/**
 * Google Custom Search Engine Provider
 */

const axios = require('axios');
const logger = require('../utils/logger');

class GoogleCSEProvider {
    constructor() {
        this.name = 'google';
        this.apiKey = process.env.GOOGLE_CSE_API_KEY;
        this.searchEngineId = process.env.GOOGLE_CSE_ID;
        this.baseUrl = 'https://www.googleapis.com/customsearch/v1';

        if (!this.apiKey || !this.searchEngineId) {
            throw new Error('Google CSE API key or Search Engine ID not configured');
        }
    }

    /**
     * Search using Google Custom Search API
     * @param {string} query - Search query
     * @param {object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async search(query, options = {}) {
        try {
            const params = {
                key: this.apiKey,
                cx: this.searchEngineId,
                q: query,
                num: options.count || 10,
                start: options.start || 1
            };

            // Add date range if specified
            if (options.dateRestrict) {
                params.dateRestrict = options.dateRestrict; // e.g., 'd7' for last 7 days
            }

            // Add language if specified
            if (options.language) {
                params.lr = `lang_${options.language}`;
            }

            const response = await axios.get(this.baseUrl, {
                params,
                timeout: 10000
            });

            if (!response.data.items) {
                logger.warn('Google CSE returned no results', { query });
                return [];
            }

            return response.data.items.map(item => ({
                title: item.title,
                snippet: item.snippet,
                link: item.link,
                displayLink: item.displayLink,
                source: item.displayLink,
                image: item.pagemap?.cse_image?.[0]?.src || null,
                date: item.pagemap?.metatags?.[0]?.['article:published_time'] || null
            }));

        } catch (error) {
            logger.error('Google CSE search failed', {
                error: error.message,
                query,
                status: error.response?.status
            });

            // Handle specific errors
            if (error.response?.status === 429) {
                throw new Error('Google CSE rate limit exceeded');
            }

            if (error.response?.status === 403) {
                throw new Error('Google CSE API key invalid or quota exceeded');
            }

            throw error;
        }
    }

    /**
     * Get provider status
     * @returns {object} Provider status
     */
    getStatus() {
        return {
            name: this.name,
            configured: !!(this.apiKey && this.searchEngineId),
            cost: '$5 per 1000 queries',
            quota: '10,000 queries/day (paid tier)'
        };
    }
}

module.exports = GoogleCSEProvider;
