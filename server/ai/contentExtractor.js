/**
 * Content Extractor (Tavily-inspired)
 * Fetches and parses full page text from search result URLs to provide detailed context.
 * 
 * Why this improves accuracy:
 * - Fetches the full content of a webpage (up to 3000 chars) instead of relying on a 150-char Google snippet.
 * - Rotates User-Agents and implements retries to maximize fetching success rate.
 * - Strips scripts, styling, navigation menus, and footers to isolate the core customer feedback/article content.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

class ContentExtractor {
    constructor(options = {}) {
        this.timeout = options.timeout || 5000; // 5 seconds timeout
        this.maxRetries = options.maxRetries || 2;
        this.maxChars = options.maxChars || 3000;
        this.minChars = options.minChars || 100;
    }

    /**
     * Get a random User Agent string
     */
    getRandomUserAgent() {
        return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    }

    /**
     * Fetch HTML from URL with timeout and retries
     * @param {string} url 
     * @param {number} [attempt=1] 
     * @returns {Promise<string>} The raw HTML content
     */
    async fetchHtml(url, attempt = 1) {
        try {
            const response = await axios.get(url, {
                timeout: this.timeout,
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                }
            });
            return response.data;
        } catch (error) {
            if (attempt < this.maxRetries) {
                logger.info(`ContentExtractor: Retry fetch for ${url} (Attempt ${attempt + 1}/${this.maxRetries})`);
                return this.fetchHtml(url, attempt + 1);
            }
            logger.warn(`ContentExtractor: Failed to fetch ${url} - ${error.message}`);
            throw error;
        }
    }

    /**
     * Clean and extract readable text from raw HTML
     * @param {string} html 
     * @returns {string} Cleaned text
     */
    extractText(html) {
        if (!html || typeof html !== 'string') return '';

        const $ = cheerio.load(html);

        // Remove elements that don't contain content
        $('script, style, noscript, iframe, svg, nav, footer, header, aside').remove();
        $('.sidebar, #sidebar, .footer, #footer, .menu, #menu, .nav, #nav, .header, #header, .cookie-banner, .cookie-consent').remove();
        $('form, button, input, select, textarea').remove();

        // Get text and format whitespace
        let text = $('body').text();
        
        // Remove excessive empty lines, tabs, and spaces
        text = text
            .replace(/[\t\r]/g, ' ')
            .replace(/\n\s*\n/g, '\n') // Remove multiple consecutive newlines
            .replace(/\s+/g, ' ')       // Normalize spaces
            .trim();

        // Truncate to maximum characters
        return text.substring(0, this.maxChars);
    }

    /**
     * Main extract method: Fetches and cleans a URL
     * @param {string} url 
     * @returns {Promise<object>} Result containing content and meta
     */
    async extract(url) {
        if (!url) return { content: '', success: false, error: 'No URL provided' };

        try {
            logger.info(`ContentExtractor: Extracting content from ${url}`);
            const html = await this.fetchHtml(url);
            const cleanedText = this.extractText(html);

            const isQuality = cleanedText.length >= this.minChars;

            return {
                url,
                content: cleanedText,
                length: cleanedText.length,
                success: true,
                isQuality
            };
        } catch (error) {
            return {
                url,
                content: '',
                length: 0,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Batch extract a list of URLs with concurrency limit
     * @param {Array<string>} urls 
     * @param {number} [concurrency=5] 
     * @returns {Promise<Array<object>>} Array of extraction results
     */
    async extractBatch(urls, concurrency = 5) {
        if (!Array.isArray(urls) || urls.length === 0) return [];

        const results = [];
        const limitUrls = urls.slice(0, 20); // Safety limit to top 20 URLs

        // Process in chunks/batches to control concurrency without external libraries
        for (let i = 0; i < limitUrls.length; i += concurrency) {
            const chunk = limitUrls.slice(i, i + concurrency);
            const chunkPromises = chunk.map(url => this.extract(url));
            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
        }

        return results;
    }
}

module.exports = ContentExtractor;
