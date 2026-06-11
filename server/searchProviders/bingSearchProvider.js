/**
 * Bing Search API Provider
 */

const axios = require('axios');
const logger = require('../utils/logger');

class BingSearchProvider {
    constructor() {
        this.name = 'bing';
        this.apiKey = process.env.BING_API_KEY;
        this.baseUrl = 'https://api.bing.microsoft.com/v7.0/search';

        if (!this.apiKey) {
            throw new Error('Bing API key not configured');
        }
    }

    /**
     * Search using Bing Search API
     * @param {string} query - Search query
     * @param {object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async search(query, options = {}) {
        try {
            const params = {
                q: query,
                count: options.count || 10,
                offset: options.start ? (options.start - 1) : 0,
                mkt: options.market || 'en-US',
                safeSearch: options.safeSearch || 'Moderate'
            };

            // Add freshness filter if specified
            if (options.freshness) {
                params.freshness = options.freshness; // 'Day', 'Week', 'Month'
            }

            const response = await axios.get(this.baseUrl, {
                params,
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKey
                },
                timeout: 10000
            });

            if (!response.data.webPages?.value) {
                logger.warn('Bing Search returned no results', { query });
                return [];
            }

            return response.data.webPages.value.map(item => ({
                title: item.name,
                snippet: item.snippet,
                link: item.url,
                displayLink: item.displayUrl,
                source: this.extractDomain(item.url),
                date: item.dateLastCrawled || null
            }));

        } catch (error) {
            logger.error('Bing Search failed', {
                error: error.message,
                query,
                status: error.response?.status
            });

            // Handle specific errors
            if (error.response?.status === 429) {
                throw new Error('Bing Search rate limit exceeded');
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('Bing Search API key invalid');
            }

            throw error;
        }
    }

    /**
     * Extract domain from URL
     * @param {string} url - URL
     * @returns {string} Domain
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }

    /**
     * Get provider status
     * @returns {object} Provider status
     */
    getStatus() {
        return {
            name: this.name,
            configured: !!this.apiKey,
            cost: '$7 per 1000 queries',
            quota: 'Depends on subscription tier'
        };
    }
}

module.exports = BingSearchProvider;
