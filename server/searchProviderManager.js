/**
 * Search Provider Manager
 * Manages multiple search providers with automatic failover
 */

const logger = require('./utils/logger');

class SearchProviderManager {
    constructor() {
        this.providers = [];
        this.currentProviderIndex = 0;
        this.providerHealth = new Map();

        // Initialize providers based on available API keys
        this.initializeProviders();

        logger.info('Search Provider Manager initialized', {
            providersAvailable: this.providers.length,
            providers: this.providers.map(p => p.name)
        });
    }

    /**
     * Initialize available search providers
     */
    initializeProviders() {
        // Google Custom Search (primary)
        if (process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID) {
            const GoogleCSEProvider = require('./searchProviders/googleCSEProvider');
            this.providers.push(new GoogleCSEProvider());
            this.providerHealth.set('google', { failures: 0, lastSuccess: new Date() });
        }

        // Bing Search API (fallback 1)
        if (process.env.BING_API_KEY) {
            const BingSearchProvider = require('./searchProviders/bingSearchProvider');
            this.providers.push(new BingSearchProvider());
            this.providerHealth.set('bing', { failures: 0, lastSuccess: new Date() });
        }

        // SerpAPI (fallback 2 - aggregator)
        if (process.env.SERPAPI_KEY) {
            const SerpAPIProvider = require('./searchProviders/serpAPIProvider');
            this.providers.push(new SerpAPIProvider());
            this.providerHealth.set('serpapi', { failures: 0, lastSuccess: new Date() });
        }

        if (this.providers.length === 0) {
            logger.warn('No search providers configured! Add API keys to .env');
        }
    }

    /**
     * Search using available providers with automatic failover
     * @param {string} query - Search query
     * @param {object} options - Search options
     * @returns {Promise<Array>} Normalized search results
     */
    async search(query, options = {}) {
        if (this.providers.length === 0) {
            throw new Error('No search providers available');
        }

        const now = new Date();
        const cooldownPeriodMs = 5 * 60 * 1000; // 5 minutes

        // Check health and apply cooldown reset
        const healthyProviders = this.providers.filter(provider => {
            const health = this.providerHealth.get(provider.name);
            if (!health) return true;

            if (health.failures > 3) {
                if (health.lastFailure && (now - new Date(health.lastFailure) > cooldownPeriodMs)) {
                    logger.info(`Re-enabling search provider ${provider.name} after 5-minute cooldown.`, { providerName: provider.name });
                    health.failures = 0;
                    this.providerHealth.set(provider.name, health);
                    return true;
                }
                return false;
            }
            return true;
        });

        // Fallback to all providers if all are unhealthy
        const targetProviders = healthyProviders.length > 0 ? healthyProviders : this.providers;
        const maxAttempts = targetProviders.length;
        let lastError = null;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Pick provider in order from the prioritized target list
            const provider = targetProviders[attempt];

            try {
                logger.info('Attempting search', {
                    provider: provider.name,
                    query: query.substring(0, 50),
                    attempt: attempt + 1
                });

                // Execute search
                const results = await provider.search(query, options);

                // Normalize results
                const normalizedResults = this.normalizeResults(results, provider.name);

                // Update health status (reset failures on success)
                this.recordSuccess(provider.name);

                logger.info('Search successful', {
                    provider: provider.name,
                    resultsCount: normalizedResults.length
                });

                return normalizedResults;

            } catch (error) {
                lastError = error;

                logger.warn('Search provider failed', {
                    provider: provider.name,
                    error: error.message,
                    attempt: attempt + 1
                });

                // Record failure
                this.recordFailure(provider.name);

                // Small delay before retry
                if (attempt < maxAttempts - 1) {
                    await this.delay(1000);
                }
            }
        }

        // All providers failed
        logger.error('All search providers failed', {
            query: query.substring(0, 50),
            attempts: maxAttempts,
            lastError: lastError?.message
        });

        throw new Error(`All search providers failed. Last error: ${lastError?.message}`);
    }

    /**
     * Normalize results from different providers to consistent format
     * @param {Array} results - Raw results from provider
     * @param {string} providerName - Provider name
     * @returns {Array} Normalized results
     */
    normalizeResults(results, providerName) {
        return results.map(result => ({
            // Standardized fields
            title: result.title || result.name || result.headline || '',
            snippet: result.snippet || result.description || result.text || '',
            link: result.link || result.url || result.href || '',
            source: result.source || result.displayLink || result.domain || this.extractDomain(result.link),

            // Metadata
            provider: providerName,
            timestamp: new Date(),

            // Optional fields
            image: result.image || result.thumbnail || null,
            date: result.date || result.publishedDate || null,

            // Raw data for debugging
            _raw: result
        })).filter(r => r.title && r.link); // Filter out invalid results
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
     * Record successful search
     * @param {string} providerName - Provider name
     */
    recordSuccess(providerName) {
        const health = this.providerHealth.get(providerName);
        if (health) {
            health.failures = 0;
            health.lastSuccess = new Date();
            this.providerHealth.set(providerName, health);
        }
    }

    /**
     * Record failed search
     * @param {string} providerName - Provider name
     */
    recordFailure(providerName) {
        const health = this.providerHealth.get(providerName);
        if (health) {
            health.failures++;
            health.lastFailure = new Date();
            this.providerHealth.set(providerName, health);
        }
    }

    /**
     * Get provider health status
     * @returns {object} Health status for all providers
     */
    getProviderHealth() {
        const health = {};
        this.providerHealth.forEach((status, name) => {
            health[name] = {
                ...status,
                status: status.failures > 3 ? 'unhealthy' : 'healthy'
            };
        });
        return health;
    }

    /**
     * Get current provider
     * @returns {object} Current provider
     */
    getCurrentProvider() {
        return this.providers[this.currentProviderIndex];
    }

    /**
     * Manually switch to specific provider
     * @param {string} providerName - Provider name
     */
    switchToProvider(providerName) {
        const index = this.providers.findIndex(p => p.name === providerName);
        if (index !== -1) {
            this.currentProviderIndex = index;
            logger.info('Switched to provider', { provider: providerName });
        } else {
            throw new Error(`Provider ${providerName} not found`);
        }
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = SearchProviderManager;
