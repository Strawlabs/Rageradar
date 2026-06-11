/**
 * App Store Integration
 * Scrape reviews from iOS App Store and Google Play Store
 */

const appStore = require('app-store-scraper');
const gplay = require('google-play-scraper');
const logger = require('../utils/logger');

class AppStoreIntegration {
    constructor() {
        this.name = 'appstore';
    }

    /**
     * Check if configured (no API key needed for scraping)
     * @returns {boolean}
     */
    isConfigured() {
        return true; // No API key required
    }

    /**
     * Search for app and get reviews
     * @param {string} appName - App name or ID
     * @param {object} options - Search options
     * @returns {Promise<Array>} Reviews
     */
    async searchApp(appName, options = {}) {
        try {
            const {
                platform = 'both', // ios, android, both
                country = 'us',
                limit = 100
            } = options;

            logger.info('Searching app stores', {
                appName,
                platform,
                country,
                limit
            });

            const mentions = [];

            // Search iOS App Store
            if (platform === 'ios' || platform === 'both') {
                try {
                    const iosReviews = await this.getIOSReviews(appName, { country, limit });
                    mentions.push(...iosReviews);
                } catch (error) {
                    logger.warn('iOS App Store search failed', { error: error.message });
                }
            }

            // Search Google Play Store
            if (platform === 'android' || platform === 'both') {
                try {
                    const androidReviews = await this.getAndroidReviews(appName, { country, limit });
                    mentions.push(...androidReviews);
                } catch (error) {
                    logger.warn('Google Play Store search failed', { error: error.message });
                }
            }

            logger.info('App store search complete', {
                appName,
                reviewsFound: mentions.length
            });

            return mentions;

        } catch (error) {
            logger.error('App store search failed', {
                error: error.message,
                appName
            });
            throw error;
        }
    }

    /**
     * Get iOS App Store reviews
     * @param {string} appName - App name or ID
     * @param {object} options - Options
     * @returns {Promise<Array>} Reviews
     */
    async getIOSReviews(appName, options = {}) {
        try {
            // First, search for the app
            const searchResults = await appStore.search({
                term: appName,
                num: 1,
                country: options.country || 'us'
            });

            if (searchResults.length === 0) {
                logger.warn('No iOS app found', { appName });
                return [];
            }

            const app = searchResults[0];

            // Get reviews
            const reviews = await appStore.reviews({
                id: app.id,
                country: options.country || 'us',
                page: 1,
                sort: appStore.sort.RECENT
            });

            return reviews.map(review => ({
                platform: 'app_store',
                type: 'review',
                id: review.id,
                title: review.title,
                text: review.text,
                author: review.userName,
                rating: review.score,
                url: app.url,
                timestamp: new Date(review.date),

                metadata: {
                    appId: app.id,
                    appName: app.title,
                    appVersion: review.version,
                    voteSum: review.voteSum,
                    voteCount: review.voteCount
                }
            }));
        } catch (error) {
            logger.error('Failed to get iOS reviews', { error: error.message, appName });
            return [];
        }
    }

    /**
     * Get Android Google Play Store reviews
     * @param {string} appName - App name or package ID
     * @param {object} options - Options
     * @returns {Promise<Array>} Reviews
     */
    async getAndroidReviews(appName, options = {}) {
        try {
            // First, search for the app
            const searchResults = await gplay.search({
                term: appName,
                num: 1,
                country: options.country || 'us',
                lang: 'en'
            });

            if (searchResults.length === 0) {
                logger.warn('No Android app found', { appName });
                return [];
            }

            const app = searchResults[0];

            // Get reviews
            const reviews = await gplay.reviews({
                appId: app.appId,
                sort: gplay.sort.NEWEST,
                num: options.limit || 100,
                lang: 'en',
                country: options.country || 'us'
            });

            return reviews.data.map(review => ({
                platform: 'play_store',
                type: 'review',
                id: review.id,
                text: review.text,
                author: review.userName,
                rating: review.score,
                url: app.url,
                timestamp: new Date(review.date),

                metadata: {
                    appId: app.appId,
                    appName: app.title,
                    appVersion: review.version,
                    thumbsUp: review.thumbsUp,
                    replyDate: review.replyDate,
                    replyText: review.replyText
                }
            }));
        } catch (error) {
            logger.error('Failed to get Android reviews', { error: error.message, appName });
            return [];
        }
    }

    /**
     * Get app details
     * @param {string} appId - App ID
     * @param {string} platform - Platform (ios/android)
     * @returns {Promise<object>} App details
     */
    async getAppDetails(appId, platform = 'ios') {
        try {
            if (platform === 'ios') {
                return await appStore.app({ id: appId });
            } else {
                return await gplay.app({ appId });
            }
        } catch (error) {
            logger.error('Failed to get app details', { error: error.message, appId, platform });
            return null;
        }
    }

    /**
     * Get status
     * @returns {object} Status
     */
    getStatus() {
        return {
            name: this.name,
            configured: this.isConfigured(),
            cost: 'Free (scraping)',
            rateLimit: 'None (but use responsibly)',
            features: 'iOS App Store and Google Play Store reviews',
            note: 'No API key required - uses web scraping'
        };
    }
}

module.exports = AppStoreIntegration;
