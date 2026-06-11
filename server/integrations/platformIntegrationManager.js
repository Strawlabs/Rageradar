/**
 * Platform Integration Manager
 * Unified interface for all platform integrations
 */

const RedditIntegration = require('./redditIntegration');
const YouTubeIntegration = require('./youtubeIntegration');
const ProductHuntIntegration = require('./productHuntIntegration');
const AppStoreIntegration = require('./appStoreIntegration');
const logger = require('../utils/logger');

class PlatformIntegrationManager {
    constructor() {
        // Initialize all integrations
        this.integrations = {
            reddit: new RedditIntegration(),
            youtube: new YouTubeIntegration(),
            producthunt: new ProductHuntIntegration(),
            appstore: new AppStoreIntegration()
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

            logger.info('Searching all platforms', {
                brandName,
                platforms,
                limit
            });

            const results = {};
            const errors = {};

            // Search each platform in parallel
            const searchPromises = platforms.map(async (platform) => {
                try {
                    const integration = this.integrations[platform];

                    if (!integration || !integration.isConfigured()) {
                        logger.warn(`Platform ${platform} not configured, skipping`);
                        return;
                    }

                    let mentions = [];

                    switch (platform) {
                        case 'reddit':
                            mentions = await integration.searchBrand(brandName, {
                                timeFilter: options.timeFilter || 'week',
                                limit,
                                includeComments
                            });
                            break;

                        case 'youtube':
                            mentions = await integration.searchBrand(brandName, {
                                maxVideos: Math.floor(limit / 2),
                                maxCommentsPerVideo: 100
                            });
                            break;

                        case 'producthunt':
                            mentions = await integration.searchProduct(brandName, {
                                limit: Math.floor(limit / 5),
                                daysAgo: 30
                            });
                            break;

                        case 'appstore':
                            mentions = await integration.searchApp(brandName, {
                                platform: 'both',
                                limit
                            });
                            break;

                        default:
                            logger.warn(`Unknown platform: ${platform}`);
                    }

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
                platformsSearched: platforms.length,
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

        switch (platform) {
            case 'reddit':
                return await integration.searchBrand(brandName, options);

            case 'youtube':
                return await integration.searchBrand(brandName, options);

            case 'producthunt':
                return await integration.searchProduct(brandName, options);

            case 'appstore':
                return await integration.searchApp(brandName, options);

            default:
                throw new Error(`Unknown platform: ${platform}`);
        }
    }

    /**
     * Get status of all integrations
     * @returns {object} Status of all platforms
     */
    getAllStatus() {
        const status = {};

        Object.entries(this.integrations).forEach(([name, integration]) => {
            status[name] = integration.getStatus();
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
