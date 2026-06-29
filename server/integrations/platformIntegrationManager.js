/**
 * Platform Integration Manager
 * Unified interface for all platform integrations.
 * Runs integrations in parallel with per-integration timeout ceilings,
 * tracks health via circuit breakers, and exposes `playstore` as a distinct scan key.
 */

const RedditIntegration = require('./redditIntegration');
const YouTubeIntegration = require('./youtubeIntegration');
const ProductHuntIntegration = require('./productHuntIntegration');
const AppStoreIntegration = require('./appStoreIntegration');
const HackerNewsIntegration = require('./hackerNewsIntegration');
const logger = require('../utils/logger');

/** Per-integration timeout ceiling (ms) to prevent one slow platform from blocking the scan */
const INTEGRATION_TIMEOUT_MS = 30000;

class PlatformIntegrationManager {
    constructor() {
        // Shared AppStoreIntegration instance for both 'appstore' and 'playstore'
        this._appStoreInstance = new AppStoreIntegration();

        // Initialize all integrations
        this.integrations = {
            reddit: new RedditIntegration(),
            youtube: new YouTubeIntegration(),
            producthunt: new ProductHuntIntegration(),
            appstore: this._appStoreInstance,
            playstore: this._appStoreInstance,   // same instance, called with platform: 'android'
            hackernews: new HackerNewsIntegration()
        };

        // Track which integrations are configured
        this.availableIntegrations = this.getAvailableIntegrations();

        logger.info('Platform Integration Manager initialized', {
            totalIntegrations: Object.keys(this.integrations).length,
            availableIntegrations: this.availableIntegrations.length,
            platforms: this.availableIntegrations
        });
    }

    /**
     * Get list of configured integrations
     * @returns {Array} Available integration names
     */
    getAvailableIntegrations() {
        return Object.entries(this.integrations)
            .filter(([name, integration]) => integration.isConfigured())
            .map(([name]) => name);
    }

    /**
     * Search across all configured platforms
     * @param {string} brandName - Brand name to search
     * @param {object} options - Search options
     * @returns {Promise<object>} Results from all platforms
     */
    async searchAllPlatforms(brandName, options = {}) {
        try {
            const {
                platforms = this.availableIntegrations,
                includeComments = true,
                limit = 100
            } = options;

            // De-duplicate: if both 'appstore' and 'playstore' are requested, run only 'appstore' (both)
            const deduped = this._deduplicateAppStorePlatforms(platforms);

            logger.info('Searching all platforms', {
                brandName,
                platforms: deduped,
                limit
            });

            const results = {};
            const errors = {};

            // Search each platform in parallel with timeout ceiling
            const searchPromises = deduped.map(async (platform) => {
                try {
                    const integration = this.integrations[platform];

                    if (!integration || !integration.isConfigured()) {
                        logger.warn(`Platform ${platform} not configured, skipping`);
                        return;
                    }

                    // Race between the actual search and a timeout
                    const mentions = await Promise.race([
                        this._searchPlatform(platform, integration, brandName, {
                            ...options,
                            includeComments,
                            limit
                        }),
                        this._timeoutPromise(platform)
                    ]);

                    results[platform] = mentions;

                    logger.info(`${platform} search complete`, {
                        brandName,
                        mentionsFound: mentions.length
                    });

                } catch (error) {
                    logger.error(`${platform} search failed`, {
                        error: error.message,
                        brandName
                    });
                    errors[platform] = error.message;
                    results[platform] = [];
                }
            });

            await Promise.all(searchPromises);

            // Aggregate results
            const allMentions = Object.values(results).flat();

            const summary = {
                totalMentions: allMentions.length,
                byPlatform: Object.entries(results).reduce((acc, [platform, mentions]) => {
                    acc[platform] = mentions.length;
                    return acc;
                }, {}),
                errors: Object.keys(errors).length > 0 ? errors : null
            };

            logger.info('Multi-platform search complete', {
                brandName,
                totalMentions: allMentions.length,
                platformsSearched: deduped.length,
                platformsSucceeded: Object.keys(results).length,
                platformsFailed: Object.keys(errors).length
            });

            return {
                mentions: allMentions,
                byPlatform: results,
                summary,
                timestamp: new Date()
            };

        } catch (error) {
            logger.error('Multi-platform search failed', {
                error: error.message,
                brandName
            });
            throw error;
        }
    }

    /**
     * Dispatch a search to the appropriate integration method.
     * @param {string} platform - Platform key
     * @param {object} integration - Integration instance
     * @param {string} brandName - Brand name
     * @param {object} options - Options
     * @returns {Promise<Array>} Mentions
     */
    async _searchPlatform(platform, integration, brandName, options) {
        switch (platform) {
            case 'reddit':
                return await integration.searchBrand(brandName, {
                    timeFilter: options.timeFilter || 'week',
                    limit: options.limit,
                    includeComments: options.includeComments
                });

            case 'hackernews':
                return await integration.searchBrand(brandName, {
                    limit: options.limit
                });

            case 'youtube':
                return await integration.searchBrand(brandName, {
                    maxVideos: Math.floor(options.limit / 2),
                    maxCommentsPerVideo: 100
                });

            case 'producthunt':
                return await integration.searchProduct(brandName, {
                    limit: Math.floor(options.limit / 5),
                    daysAgo: 30
                });

            case 'appstore':
                return await integration.searchApp(brandName, {
                    platform: 'both',
                    limit: options.limit
                });

            case 'playstore':
                return await integration.searchApp(brandName, {
                    platform: 'android',
                    limit: options.limit
                });

            default:
                logger.warn(`Unknown platform: ${platform}`);
                return [];
        }
    }

    /**
     * Create a timeout promise that rejects after INTEGRATION_TIMEOUT_MS.
     * @param {string} platform
     * @returns {Promise}
     */
    _timeoutPromise(platform) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`${platform} integration timed out after ${INTEGRATION_TIMEOUT_MS}ms`));
            }, INTEGRATION_TIMEOUT_MS);
        });
    }

    /**
     * If both 'appstore' and 'playstore' are in the list, keep only 'appstore' (covers both).
     * @param {string[]} platforms
     * @returns {string[]}
     */
    _deduplicateAppStorePlatforms(platforms) {
        if (platforms.includes('appstore') && platforms.includes('playstore')) {
            return platforms.filter(p => p !== 'playstore');
        }
        return platforms;
    }

    /**
     * Search specific platform
     * @param {string} platform - Platform name
     * @param {string} brandName - Brand name
     * @param {object} options - Options
     * @returns {Promise<Array>} Mentions
     */
    async searchPlatform(platform, brandName, options = {}) {
        const integration = this.integrations[platform];

        if (!integration) {
            throw new Error(`Platform ${platform} not found`);
        }

        if (!integration.isConfigured()) {
            throw new Error(`Platform ${platform} not configured`);
        }

        logger.info(`Searching ${platform}`, { brandName });

        return this._searchPlatform(platform, integration, brandName, {
            ...options,
            limit: options.limit || 100
        });
    }

    /**
     * Get status of all integrations (includes circuit breaker health)
     * @returns {object} Status of all platforms
     */
    getAllStatus() {
        const status = {};

        Object.entries(this.integrations).forEach(([name, integration]) => {
            // Avoid duplicate reporting for appstore/playstore (same instance)
            if (name === 'playstore') {
                status[name] = {
                    ...integration.getStatus(),
                    name: 'playstore',
                    note: 'Uses same engine as appstore, scoped to Android only'
                };
            } else {
                status[name] = integration.getStatus();
            }
        });

        return {
            platforms: status,
            summary: {
                total: Object.keys(this.integrations).length,
                configured: this.availableIntegrations.length,
                available: this.availableIntegrations
            }
        };
    }

    /**
     * Get circuit breaker health for all integrations
     * @returns {object} Health status per platform
     */
    getIntegrationHealth() {
        const health = {};

        Object.entries(this.integrations).forEach(([name, integration]) => {
            health[name] = {
                configured: integration.isConfigured(),
                circuitBreaker: integration.circuitBreaker
                    ? integration.circuitBreaker.getStatus()
                    : { state: 'N/A' }
            };
        });

        return health;
    }

    /**
     * Get specific integration
     * @param {string} platform - Platform name
     * @returns {object} Integration instance
     */
    getIntegration(platform) {
        return this.integrations[platform];
    }

    /**
     * Check if platform is available
     * @param {string} platform - Platform name
     * @returns {boolean}
     */
    isPlatformAvailable(platform) {
        return this.availableIntegrations.includes(platform);
    }
}

module.exports = PlatformIntegrationManager;
