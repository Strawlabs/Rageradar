/**
 * YouTube Integration
 * Fetch video comments using YouTube Data API
 */

const { google } = require('googleapis');
const logger = require('../utils/logger');

class YouTubeIntegration {
    constructor() {
        this.name = 'youtube';
        this.apiKey = process.env.YOUTUBE_API_KEY;

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
        return !!this.apiKey;
    }

    /**
     * Search for brand mentions in YouTube videos and comments
     * @param {string} brandName - Brand name
     * @param {object} options - Search options
     * @returns {Promise<Array>} Mentions
     */
    async searchBrand(brandName, options = {}) {
        if (!this.isConfigured()) {
            logger.warn('YouTube integration not configured');
            return [];
        }

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

            // Get comments for each video
            for (const video of videos) {
                try {
                    const comments = await this.getVideoComments(video.id.videoId, maxCommentsPerVideo);
                    mentions.push(...comments.map(comment => ({
                        ...comment,
                        videoTitle: video.snippet.title,
                        videoChannel: video.snippet.channelTitle,
                        videoPublishedAt: video.snippet.publishedAt
                    })));
                } catch (error) {
                    logger.warn('Failed to fetch comments for video', {
                        videoId: video.id.videoId,
                        error: error.message
                    });
                }
            }

            logger.info('YouTube search complete', {
                brandName,
                videosSearched: videos.length,
                commentsFound: mentions.length
            });

            return mentions;

        } catch (error) {
            logger.error('YouTube search failed', {
                error: error.message,
                brandName
            });

            if (error.code === 403) {
                throw new Error('YouTube API quota exceeded or invalid API key');
            }

            throw error;
        }
    }

    /**
     * Get comments from a video
     * @param {string} videoId - Video ID
     * @param {number} maxResults - Max comments to fetch
     * @returns {Promise<Array>} Comments
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

            return comments.map(item => {
                const comment = item.snippet.topLevelComment.snippet;
                return {
                    platform: 'youtube',
                    type: 'comment',
                    id: item.id,
                    text: comment.textDisplay,
                    author: comment.authorDisplayName,
                    authorChannelUrl: comment.authorChannelUrl,
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
            if (error.code === 403 && error.message.includes('disabled')) {
                logger.debug('Comments disabled for video', { videoId });
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
            note: 'Comment search costs 100 units per video'
        };
    }
}

module.exports = YouTubeIntegration;
