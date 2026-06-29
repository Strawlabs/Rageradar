/**
 * Reddit Integration
 * Fetch brand mentions from Reddit using official API.
 * Includes retry with backoff, circuit breaker, deleted content filtering,
 * and normalized mention output.
 */

const snoowrap = require('snoowrap');
const logger = require('../utils/logger');
const { retryWithBackoff, CircuitBreaker, isDeletedContent, isRetriableError } = require('./integrationUtils');
const { normalize } = require('./mentionNormalizer');

class RedditIntegration {
    constructor() {
        this.name = 'reddit';
        this.circuitBreaker = new CircuitBreaker({ name: 'reddit', failureThreshold: 5, cooldownMs: 60000 });

        // Initialize Reddit client
        if (this.isConfigured()) {
            const authConfig = {
                userAgent: process.env.REDDIT_USER_AGENT || 'RageRadar/1.0',
                clientId: process.env.REDDIT_CLIENT_ID,
                clientSecret: process.env.REDDIT_CLIENT_SECRET
            };

            if (process.env.REDDIT_REFRESH_TOKEN) {
                authConfig.refreshToken = process.env.REDDIT_REFRESH_TOKEN;
            } else {
                authConfig.username = process.env.REDDIT_USERNAME;
                authConfig.password = process.env.REDDIT_PASSWORD;
            }

            this.client = new snoowrap(authConfig);

            // Configure request delay to respect rate limits
            this.client.config({ requestDelay: 1000, warnings: false });
        }
    }

    /**
     * Check if Reddit is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!(
            process.env.REDDIT_CLIENT_ID &&
            process.env.REDDIT_CLIENT_SECRET &&
            (process.env.REDDIT_REFRESH_TOKEN || (process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD))
        );
    }

    /**
     * Search for brand mentions on Reddit
     * @param {string} brandName - Brand name to search
     * @param {object} options - Search options
     * @returns {Promise<Array>} Normalized Reddit mentions
     */
    async searchBrand(brandName, options = {}) {
        if (!this.isConfigured()) {
            logger.warn('Reddit integration not configured');
            return [];
        }

        return this.circuitBreaker.exec(async () => {
            return retryWithBackoff(
                () => this._doSearch(brandName, options),
                {
                    maxRetries: 3,
                    baseDelay: 1000,
                    shouldRetry: isRetriableError,
                    label: 'Reddit.searchBrand'
                }
            );
        });
    }

    /**
     * Internal search implementation (called by retry/circuit breaker wrappers)
     */
    async _doSearch(brandName, options = {}) {
        try {
            const {
                subreddits = ['all'],
                timeFilter = 'week', // hour, day, week, month, year, all
                limit = 100,
                sort = 'relevance' // relevance, hot, top, new, comments
            } = options;

            logger.info('Searching Reddit', {
                brandName,
                subreddits,
                timeFilter,
                limit
            });

            // Search Reddit
            const results = await this.client.search({
                query: brandName,
                subreddit: subreddits.join('+'),
                time: timeFilter,
                sort: sort,
                limit: limit
            });

            // Process results
            const mentions = [];

            for (const post of results) {
                // Skip deleted/removed posts
                const postText = post.selftext || post.title;
                if (isDeletedContent(postText) && isDeletedContent(post.title)) {
                    continue;
                }

                // Build raw mention and normalize
                const rawPost = {
                    type: 'post',
                    id: post.id,
                    title: post.title,
                    text: postText,
                    author: this._safeAuthorName(post.author),
                    subreddit: post.subreddit?.display_name || '',
                    score: post.score,
                    upvoteRatio: post.upvote_ratio,
                    numComments: post.num_comments,
                    url: `https://reddit.com${post.permalink}`,
                    timestamp: new Date(post.created_utc * 1000),
                    metadata: {
                        awards: post.total_awards_received,
                        gilded: post.gilded,
                        stickied: post.stickied,
                        over18: post.over_18
                    }
                };

                mentions.push(normalize('reddit', rawPost));

                // Fetch top comments if requested
                if (options.includeComments && post.num_comments > 0) {
                    try {
                        const comments = await this.getTopComments(post, options.commentLimit || 10);
                        mentions.push(...comments);
                    } catch (error) {
                        logger.warn('Failed to fetch comments', {
                            postId: post.id,
                            error: error.message
                        });
                    }
                }
            }

            logger.info('Reddit search complete', {
                brandName,
                postsFound: results.length,
                totalMentions: mentions.length
            });

            return mentions;

        } catch (error) {
            logger.error('Reddit search failed', {
                error: error.message,
                brandName
            });

            if (error.statusCode === 401) {
                throw new Error('Reddit authentication failed. Check credentials.');
            }

            if (error.statusCode === 403) {
                throw new Error('Reddit access forbidden. Subreddit may be private or banned.');
            }

            if (error.statusCode === 404) {
                logger.warn('Reddit resource not found (may be deleted)', { brandName });
                return [];
            }

            if (error.statusCode === 429) {
                throw new Error('Reddit rate limit exceeded. Try again later.');
            }

            if (error.statusCode === 503) {
                throw new Error('Reddit is temporarily unavailable. Try again later.');
            }

            throw error;
        }
    }

    /**
     * Safely extract author name (handles deleted accounts)
     * @param {*} author
     * @returns {string}
     */
    _safeAuthorName(author) {
        if (!author) return '[unknown]';
        if (typeof author === 'string') return author;
        return author.name || '[deleted]';
    }

    /**
     * Get top comments from a post
     * @param {object} post - Reddit post
     * @param {number} limit - Number of comments to fetch
     * @returns {Promise<Array>} Normalized comments
     */
    async getTopComments(post, limit = 10) {
        try {
            const comments = await post.comments.fetchMore({ amount: limit });

            return comments
                .filter(comment => comment.body && !isDeletedContent(comment.body))
                .map(comment => normalize('reddit', {
                    type: 'comment',
                    id: comment.id,
                    text: comment.body,
                    author: this._safeAuthorName(comment.author),
                    subreddit: post.subreddit?.display_name || '',
                    score: comment.score,
                    url: `https://reddit.com${comment.permalink}`,
                    timestamp: new Date(comment.created_utc * 1000),
                    metadata: {
                        parentId: post.id,
                        parentTitle: post.title,
                        depth: comment.depth,
                        awards: comment.total_awards_received,
                        gilded: comment.gilded
                    }
                }));
        } catch (error) {
            logger.error('Failed to fetch comments', { error: error.message });
            return [];
        }
    }

    /**
     * Get posts from specific subreddit
     * @param {string} subreddit - Subreddit name
     * @param {object} options - Options
     * @returns {Promise<Array>} Normalized posts
     */
    async getSubredditPosts(subreddit, options = {}) {
        if (!this.isConfigured()) {
            return [];
        }

        try {
            const {
                sort = 'hot', // hot, new, top, rising
                timeFilter = 'week',
                limit = 25
            } = options;

            const posts = await this.client.getSubreddit(subreddit).getHot({ time: timeFilter, limit });

            return posts
                .filter(post => !isDeletedContent(post.selftext || post.title))
                .map(post => normalize('reddit', {
                    type: 'post',
                    id: post.id,
                    title: post.title,
                    text: post.selftext || post.title,
                    author: this._safeAuthorName(post.author),
                    subreddit: post.subreddit?.display_name || '',
                    score: post.score,
                    upvoteRatio: post.upvote_ratio,
                    numComments: post.num_comments,
                    url: `https://reddit.com${post.permalink}`,
                    timestamp: new Date(post.created_utc * 1000)
                }));
        } catch (error) {
            logger.error('Failed to get subreddit posts', { error: error.message, subreddit });
            return [];
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
            cost: 'Free',
            rateLimit: '60 requests per minute',
            features: 'Posts, comments, subreddit search',
            circuitBreaker: this.circuitBreaker.getStatus()
        };
    }
}

module.exports = RedditIntegration;
