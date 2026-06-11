/**
 * SerpAPI Provider (Aggregator for multiple search engines)
 */

const axios = require('axios');
const logger = require('../utils/logger');

class SerpAPIProvider {
    constructor() {
        this.name = 'serpapi';
        this.apiKey = process.env.SERPAPI_KEY;
        this.baseUrl = 'https://serpapi.com/search';

        if (!this.apiKey) {
            throw new Error('SerpAPI key not configured');
        }
    }

    /**
     * Search using SerpAPI
     * @param {string} query - Search query
     * @param {object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async search(query, options = {}) {
        try {
            const params = {
                q: query,
                api_key: this.apiKey,
                engine: options.engine || 'google', // google, bing, yahoo, etc.
                num: options.count || 10,
                start: options.start || 0,
                location: options.location || 'United States',
                hl: options.language || 'en'
            };

            // Add time range if specified
            if (options.timeRange) {
                params.tbs = `qdr:${options.timeRange}`; // d (day), w (week), m (month), y (year)
            }

            const response = await axios.get(this.baseUrl, {
                params,
                timeout: 15000 // SerpAPI can be slower
            });

            if (!response.data.organic_results) {
                logger.warn('SerpAPI returned no results', { query });
                return [];
            }

            return response.data.organic_results.map(item => ({
                title: item.title,
                snippet: item.snippet,
                link: item.link,
                displayLink: item.displayed_link || item.link,
                source: item.source || this.extractDomain(item.link),
                date: item.date || null,
                position: item.position
            }));

        } catch (error) {
            logger.error('SerpAPI search failed', {
                error: error.message,
                query,
                status: error.response?.status
            });

            // Handle specific errors
            if (error.response?.status === 429) {
                throw new Error('SerpAPI rate limit exceeded');
            }

            if (error.response?.status === 401) {
                throw new Error('SerpAPI key invalid');
            }

            if (error.response?.data?.error) {
                throw new Error(`SerpAPI error: ${error.response.data.error}`);
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
            cost: '$50 per 5000 queries',
            quota: 'Depends on plan',
            features: 'Supports multiple engines (Google, Bing, Yahoo, etc.)'
        };
    }
}

module.exports = SerpAPIProvider;
