/**
 * App Store Integration
 * Scrape reviews from iOS App Store and Google Play Store.
 * Uses shared retry/circuit breaker from integrationUtils,
 * and normalizes all mentions through mentionNormalizer.
 */

const appStore = require('app-store-scraper');
const gplay = require('google-play-scraper').default || require('google-play-scraper');
const logger = require('../utils/logger');
const { retryWithBackoff, CircuitBreaker, isDeletedContent, isRetriableError } = require('./integrationUtils');
const { normalize } = require('./mentionNormalizer');

class AppStoreIntegration {
    constructor() {
        this.name = 'appstore';
        this.circuitBreaker = new CircuitBreaker({ name: 'appstore', failureThreshold: 5, cooldownMs: 60000 });

        // Simple in-memory cache to avoid hammering stores during analysis (5 min TTL)
        this._cache = new Map();
        this._cacheTTL = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get from cache or execute and cache
     */
    async _cached(key, fn) {
        const cached = this._cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this._cacheTTL)) {
            logger.debug('App Store cache hit', { key });
            return cached.data;
        }
        const data = await fn();
        this._cache.set(key, { data, timestamp: Date.now() });
        return data;
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
     * @returns {Promise<Array>} Normalized reviews
     */
    async searchApp(appName, options = {}) {
        return this.circuitBreaker.exec(async () => {
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

                // Search iOS App Store (with retry + cache)
                if (platform === 'ios' || platform === 'both') {
                    try {
                        const iosReviews = await this._cached(
                            `ios_${appName}_${country}`,
                            () => retryWithBackoff(
                                () => this.getIOSReviews(appName, { country, limit }),
                                {
                                    maxRetries: 3,
                                    baseDelay: 1000,
                                    shouldRetry: isRetriableError,
                                    label: 'AppStore.iOS'
                                }
                            )
                        );
                        mentions.push(...iosReviews);
                    } catch (error) {
                        logger.warn('iOS App Store search failed after retries', { error: error.message });
                    }
                }

                // Search Google Play Store (with retry + cache)
                if (platform === 'android' || platform === 'both') {
                    try {
                        const androidReviews = await this._cached(
                            `android_${appName}_${country}`,
                            () => retryWithBackoff(
                                () => this.getAndroidReviews(appName, { country, limit }),
                                {
                                    maxRetries: 3,
                                    baseDelay: 1000,
                                    shouldRetry: isRetriableError,
                                    label: 'AppStore.Android'
                                }
                            )
                        );
                        mentions.push(...androidReviews);
                    } catch (error) {
                        logger.warn('Google Play Store search failed after retries', { error: error.message });
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
        });
    }

    /**
     * Get iOS App Store reviews
     * @param {string} appName - App name or ID
     * @param {object} options - Options
     * @returns {Promise<Array>} Normalized reviews
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

            return reviews
                .filter(review => !isDeletedContent(review.text))
                .map(review => normalize('app_store', {
                    id: review.id,
                    title: review.title,
                    text: review.text,
                    author: review.userName,
                    rating: review.score,
                    url: app.url,
                    timestamp: new Date(review.updated || review.date || Date.now()),
                    metadata: {
                        appId: app.id,
                        appName: app.title,
                        appVersion: review.version,
                        voteSum: review.voteSum,
                        voteCount: review.voteCount
                    }
                }));
        } catch (error) {
            if (this._isAppNotFoundError(error)) {
                logger.warn('iOS app not found in store', { appName });
                return [];
            }
            logger.error('Failed to get iOS reviews', { error: error.message, appName });
            throw error;
        }
    }

    /**
     * Get Android Google Play Store reviews
     * @param {string} appName - App name or package ID
     * @param {object} options - Options
     * @returns {Promise<Array>} Normalized reviews
     */
    async getAndroidReviews(appName, options = {}) {
        try {
            let app = null;

            // 1. If appName looks like a package ID (contains dots), try direct lookup first
            if (appName.includes('.')) {
                try {
                    app = await gplay.app({ appId: appName });
                } catch (e) {
                    logger.debug('Direct Play Store lookup by appId failed', { appId: appName });
                }
            }

            // 2. Fallback to search if direct lookup wasn't done or failed
            if (!app) {
                try {
                    const searchResults = await gplay.search({
                        term: appName,
                        num: 1,
                        country: options.country || 'us',
                        lang: 'en'
                    });
                    if (searchResults && searchResults.length > 0) {
                        app = searchResults[0];
                    }
                } catch (e) {
                    logger.debug('Play Store search failed', { error: e.message });
                }
            }

            // 3. Smart fallbacks for common brand names if search failed (due to Play Store changes)
            if (!app) {
                const commonGuesses = [
                    `com.${appName}`,
                    `com.${appName.toLowerCase()}`,
                    `com.${appName}.android`,
                    `com.${appName.toLowerCase()}.android`,
                    `com.meta.${appName}`,
                    `com.meta.${appName.toLowerCase()}`
                ];
                for (const appId of commonGuesses) {
                    try {
                        app = await gplay.app({ appId });
                        if (app) {
                            logger.info('Found Android app via smart fallback ID guess', { appId });
                            break;
                        }
                    } catch (e) {
                        // ignore and try next
                    }
                }
            }

            if (!app) {
                logger.warn('No Android app found', { appName });
                return [];
            }

            // Get reviews
            const reviews = await gplay.reviews({
                appId: app.appId,
                sort: gplay.sort.NEWEST,
                num: options.limit || 100,
                lang: 'en',
                country: options.country || 'us'
            });

            return reviews.data
                .filter(review => !isDeletedContent(review.text))
                .map(review => normalize('play_store', {
                    id: review.id,
                    text: review.text,
                    author: review.userName,
                    rating: review.score,
                    url: app.url,
                    timestamp: new Date(review.date || Date.now()),
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
            if (this._isAppNotFoundError(error)) {
                logger.warn('Android app not found in Play Store', { appName });
                return [];
            }
            logger.error('Failed to get Android reviews', { error: error.message, appName });
            throw error;
        }
    }

    /**
     * Detect "app not found" vs "store unavailable" errors
     * @param {Error} error
     * @returns {boolean}
     */
    _isAppNotFoundError(error) {
        const msg = (error.message || '').toLowerCase();
        return msg.includes('not found') || msg.includes('no results') ||
               msg.includes('app not found') || msg.includes('404');
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
            note: 'No API key required - uses web scraping',
            circuitBreaker: this.circuitBreaker.getStatus()
        };
    }
}

module.exports = AppStoreIntegration;
