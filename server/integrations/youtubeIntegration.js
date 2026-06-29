/**
 * YouTube Integration
 * Fetch video comments using YouTube Data API.
 * Includes retry with backoff, circuit breaker, quota handling,
 * disabled comments handling, and normalized mention output.
 */

const { google } = require('googleapis');
const logger = require('../utils/logger');
const { retryWithBackoff, CircuitBreaker, isDeletedContent, isRetriableError } = require('./integrationUtils');
const { normalize } = require('./mentionNormalizer');

class YouTubeIntegration {
    constructor() {
        this.name = 'youtube';
        this.apiKey = process.env.YOUTUBE_API_KEY;
        this.circuitBreaker = new CircuitBreaker({ name: 'youtube', failureThreshold: 5, cooldownMs: 60000 });

        // Track quota exhaustion so we can stop early within a single scan
        this._quotaExhausted = false;

        if (this.apiKey) {
            this.youtube = google.youtube({
                version: 'v3',
                auth: this.apiKey
            });
        }
    }

    /**
     * Check if YouTube is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!(this.apiKey && this.apiKey !== 'your_youtube_api_key');
    }

    /**
     * Search for brand mentions in YouTube videos and comments
     * @param {string} brandName - Brand name
     * @param {object} options - Search options
     * @returns {Promise<Array>} Normalized mentions
     */
    async searchBrand(brandName, options = {}) {
        if (!this.isConfigured()) {
            logger.warn('YouTube integration not configured');
            return [];
        }

        // Reset quota flag at start of each scan
        this._quotaExhausted = false;

        return this.circuitBreaker.exec(async () => {
            return retryWithBackoff(
                () => this._doSearch(brandName, options),
                {
                    maxRetries: 2,
                    baseDelay: 2000,
                    shouldRetry: (error) => {
                        // Don't retry quota errors
                        if (error.code === 403 || error.message?.includes('quota')) return false;
                        return isRetriableError(error);
                    },
                    label: 'YouTube.searchBrand'
                }
            );
        });
    }

    /**
     * Internal search implementation
     */
    async _doSearch(brandName, options = {}) {
        try {
            const {
                maxVideos = 50,
                maxCommentsPerVideo = 100,
                order = 'relevance', // relevance, date, rating, viewCount
                publishedAfter = this.getDateDaysAgo(7)
            } = options;

            logger.info('Searching YouTube', {
                brandName,
                maxVideos,
                maxCommentsPerVideo
            });

            // Search for videos
            const videoResponse = await this.youtube.search.list({
                part: 'id,snippet',
                q: brandName,
                type: 'video',
                maxResults: maxVideos,
                order: order,
                publishedAfter: publishedAfter,
                relevanceLanguage: 'en'
            });

            const videos = videoResponse.data.items || [];
            const mentions = [];

            // Get comments for each video (stop if quota exhausted)
            for (const video of videos) {
                if (this._quotaExhausted) {
                    logger.warn('YouTube quota exhausted, skipping remaining videos', {
                        processed: mentions.length,
                        remaining: videos.length - videos.indexOf(video)
                    });
                    break;
                }

                try {
                    const comments = await this.getVideoComments(video.id.videoId, maxCommentsPerVideo);
                    mentions.push(...comments.map(comment => ({
                        ...comment,
                        videoTitle: video.snippet.title,
                        videoChannel: video.snippet.channelTitle,
                        videoPublishedAt: video.snippet.publishedAt
                    })));
                } catch (error) {
                    if (this._isQuotaError(error)) {
                        this._quotaExhausted = true;
                        logger.warn('YouTube API quota exhausted', { brandName });
                        break;
                    }

                    logger.warn('Failed to fetch comments for video', {
                        videoId: video.id.videoId,
                        error: error.message
                    });
                }
            }

            // Normalize all mentions
            const normalized = mentions
                .filter(m => !isDeletedContent(m.text))
                .map(m => normalize('youtube', m));

            logger.info('YouTube search complete', {
                brandName,
                videosSearched: videos.length,
                commentsFound: normalized.length,
                quotaExhausted: this._quotaExhausted
            });

            return normalized;

        } catch (error) {
            logger.error('YouTube search failed', {
                error: error.message,
                brandName
            });

            if (this._isQuotaError(error)) {
                this._quotaExhausted = true;
                throw new Error('YouTube API quota exceeded. Daily limit reached.');
            }

            if (error.code === 400) {
                throw new Error('YouTube API bad request. Check search parameters.');
            }

            throw error;
        }
    }

    /**
     * Check if an error is a quota/permission error
     */
    _isQuotaError(error) {
        if (error.code === 403) return true;
        if (error.response?.status === 403) return true;
        const msg = error.message?.toLowerCase() || '';
        return msg.includes('quota') || msg.includes('exceeded') || msg.includes('limit');
    }

    /**
     * Get comments from a video
     * @param {string} videoId - Video ID
     * @param {number} maxResults - Max comments to fetch
     * @returns {Promise<Array>} Raw comments (normalized upstream)
     */
    async getVideoComments(videoId, maxResults = 100) {
        try {
            const response = await this.youtube.commentThreads.list({
                part: 'snippet',
                videoId: videoId,
                maxResults: Math.min(maxResults, 100),
                order: 'relevance',
                textFormat: 'plainText'
            });

            const comments = response.data.items || [];

            return comments
                .filter(item => {
                    const text = item.snippet?.topLevelComment?.snippet?.textDisplay;
                    return text && !isDeletedContent(text);
                })
                .map(item => {
                    const comment = item.snippet.topLevelComment.snippet;
                    return {
                        platform: 'youtube',
                        type: 'comment',
                        id: item.id,
                        text: comment.textDisplay,
                        author: comment.authorDisplayName,
                        authorChannelUrl: comment.authorChannelUrl || '',
                        likeCount: comment.likeCount,
                        videoId: videoId,
                        url: `https://youtube.com/watch?v=${videoId}&lc=${item.id}`,
                        timestamp: new Date(comment.publishedAt),
                        metadata: {
                            replyCount: item.snippet.totalReplyCount,
                            canRate: comment.canRate,
                            viewerRating: comment.viewerRating
                        }
                    };
                });
        } catch (error) {
            // Comments might be disabled
            if (error.code === 403 && error.message?.includes('disabled')) {
                logger.debug('Comments disabled for video', { videoId });
                return [];
            }

            // Private or unlisted video
            if (error.code === 404 || error.code === 403) {
                logger.debug('Video not accessible (private/unlisted/deleted)', { videoId });
                return [];
            }

            throw error;
        }
    }

    /**
     * Search videos by channel
     * @param {string} channelId - Channel ID
     * @param {object} options - Options
     * @returns {Promise<Array>} Videos
     */
    async getChannelVideos(channelId, options = {}) {
        if (!this.isConfigured()) {
            return [];
        }

        try {
            const response = await this.youtube.search.list({
                part: 'id,snippet',
                channelId: channelId,
                type: 'video',
                maxResults: options.maxResults || 50,
                order: options.order || 'date'
            });

            return response.data.items || [];
        } catch (error) {
            logger.error('Failed to get channel videos', { error: error.message, channelId });
            return [];
        }
    }

    /**
     * Get date N days ago in ISO format
     * @param {number} days - Number of days
     * @returns {string} ISO date string
     */
    getDateDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    }

    /**
     * Get status
     * @returns {object} Status
     */
    getStatus() {
        return {
            name: this.name,
            configured: this.isConfigured(),
            cost: 'Free',
            quota: '10,000 units per day',
            features: 'Video search, comment extraction',
            note: 'Comment search costs 100 units per video',
            quotaExhausted: this._quotaExhausted,
            circuitBreaker: this.circuitBreaker.getStatus()
        };
    }
}

module.exports = YouTubeIntegration;
