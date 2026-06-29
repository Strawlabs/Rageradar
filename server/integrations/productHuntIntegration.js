/**
 * Product Hunt Integration
 * Fetch product reviews and comments via GraphQL API.
 * Includes retry with backoff, circuit breaker, rate-limit handling,
 * and normalized mention output.
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { retryWithBackoff, CircuitBreaker, isDeletedContent, isRetriableError } = require('./integrationUtils');
const { normalize } = require('./mentionNormalizer');

class ProductHuntIntegration {
    constructor() {
        this.name = 'producthunt';
        this.token = process.env.PRODUCT_HUNT_TOKEN;
        this.baseUrl = 'https://api.producthunt.com/v2/api/graphql';
        this.circuitBreaker = new CircuitBreaker({ name: 'producthunt', failureThreshold: 5, cooldownMs: 60000 });
    }

    /**
     * Check if Product Hunt is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!(this.token && this.token !== 'your_product_hunt_token');
    }

    /**
     * Search for product mentions
     * @param {string} productName - Product name
     * @param {object} options - Search options
     * @returns {Promise<Array>} Normalized mentions
     */
    async searchProduct(productName, options = {}) {
        if (!this.isConfigured()) {
            logger.warn('Product Hunt integration not configured');
            return [];
        }

        return this.circuitBreaker.exec(async () => {
            return retryWithBackoff(
                () => this._doSearch(productName, options),
                {
                    maxRetries: 3,
                    baseDelay: 1000,
                    shouldRetry: (error) => {
                        // Retry on rate limits (with longer delay handled by backoff)
                        if (error.response?.status === 429) return true;
                        return isRetriableError(error);
                    },
                    label: 'ProductHunt.searchProduct'
                }
            );
        });
    }

    /**
     * Internal search implementation
     */
    async _doSearch(productName, options = {}) {
        try {
            const {
                limit = 20,
                daysAgo = 30
            } = options;

            const postedAfter = this.getDateDaysAgo(daysAgo);

            logger.info('Searching Product Hunt', {
                productName,
                limit,
                daysAgo
            });

            // GraphQL query to search posts (without comments to keep complexity low)
            const query = `
        query SearchPosts($postedAfter: DateTime!, $first: Int!) {
          posts(postedAfter: $postedAfter, first: $first, order: VOTES) {
            edges {
              node {
                id
                name
                tagline
                description
                votesCount
                commentsCount
                url
                createdAt
                website
                topics(first: 5) {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;

            // GraphQL query to fetch comments for a specific post
            const commentsQuery = `
        query GetPostComments($id: ID!, $first: Int!) {
          post(id: $id) {
            comments(first: $first, order: VOTES_COUNT) {
              edges {
                node {
                  id
                  body
                  votesCount
                  createdAt
                  user {
                    name
                    username
                  }
                }
              }
            }
          }
        }
      `;

            // Query more posts to have a better chance of finding the target brand (low complexity without comments)
            const fetchCount = Math.max(limit * 5, 100);

            const response = await axios.post(
                this.baseUrl,
                {
                    query,
                    variables: {
                        postedAfter,
                        first: fetchCount
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            // Handle GraphQL-level errors (may coexist with partial data)
            if (response.data.errors) {
                const errors = response.data.errors;
                const hasData = !!response.data.data?.posts?.edges?.length;

                if (!hasData) {
                    // No data at all — treat as failure
                    throw new Error(`Product Hunt GraphQL error: ${errors[0].message}`);
                }

                // Partial data available — log errors but continue
                logger.warn('Product Hunt GraphQL partial errors', {
                    errors: errors.map(e => e.message),
                    productName
                });
            }

            const posts = response.data.data?.posts?.edges || [];
            const mentions = [];
            const lowerBrand = productName.toLowerCase();

            // Process posts and comments
            for (const { node: post } of posts) {
                if (!post) continue;

                // Client-side brand name check
                const matchesBrand = 
                    post.name?.toLowerCase().includes(lowerBrand) ||
                    post.tagline?.toLowerCase().includes(lowerBrand) ||
                    post.description?.toLowerCase().includes(lowerBrand);

                if (!matchesBrand) continue;

                // Add post as mention
                const postText = `${post.tagline || ''}\n\n${post.description || ''}`.trim();
                if (!isDeletedContent(postText)) {
                    mentions.push(normalize('producthunt', {
                        type: 'post',
                        id: post.id,
                        title: post.name,
                        text: postText,
                        author: 'Product Hunt',
                        votesCount: post.votesCount,
                        commentsCount: post.commentsCount,
                        url: post.url,
                        website: post.website,
                        timestamp: new Date(post.createdAt),
                        metadata: {
                            topics: (post.topics?.edges || []).map(t => t.node?.name).filter(Boolean)
                        }
                    }));
                }

                // Add comments if available
                if (post.commentsCount > 0) {
                    try {
                        const commentsResponse = await axios.post(
                            this.baseUrl,
                            {
                                query: commentsQuery,
                                variables: {
                                    id: post.id,
                                    first: 30
                                }
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${this.token}`,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 10000
                            }
                        );

                        const comments = commentsResponse.data.data?.post?.comments?.edges || [];
                        comments.forEach(({ node: comment }) => {
                            if (!comment || isDeletedContent(comment.body)) return;

                            mentions.push(normalize('producthunt', {
                                type: 'comment',
                                id: comment.id,
                                text: comment.body,
                                author: comment.user?.name || '',
                                username: comment.user?.username || '',
                                votesCount: comment.votesCount,
                                url: `${post.url}#comment-${comment.id}`,
                                timestamp: new Date(comment.createdAt),
                                metadata: {
                                    productId: post.id,
                                    productName: post.name
                                }
                            }));
                        });
                    } catch (commentError) {
                        logger.warn('Failed to fetch comments for Product Hunt post', {
                            postId: post.id,
                            error: commentError.message
                        });
                    }
                }
            }

            logger.info('Product Hunt search complete', {
                productName,
                postsFound: posts.length,
                totalMentions: mentions.length
            });

            return mentions;

        } catch (error) {
            logger.error('Product Hunt search failed', {
                error: error.message,
                productName
            });

            if (error.response?.status === 401) {
                throw new Error('Product Hunt authentication failed. Check token.');
            }

            if (error.response?.status === 429) {
                // Parse retry-after header if available
                const retryAfter = error.response.headers?.['retry-after'];
                if (retryAfter) {
                    logger.warn(`Product Hunt rate limited. Retry after ${retryAfter}s`);
                }
                throw new Error('Product Hunt rate limit exceeded.');
            }

            throw error;
        }
    }

    /**
     * Get trending products
     * @param {object} options - Options
     * @returns {Promise<Array>} Products
     */
    async getTrendingProducts(options = {}) {
        if (!this.isConfigured()) {
            return [];
        }

        try {
            const query = `
        query GetPosts($first: Int!) {
          posts(first: $first, order: VOTES) {
            edges {
              node {
                id
                name
                tagline
                votesCount
                commentsCount
                url
                createdAt
              }
            }
          }
        }
      `;

            const response = await axios.post(
                this.baseUrl,
                {
                    query,
                    variables: {
                        first: options.limit || 20
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            return response.data.data?.posts?.edges.map(({ node }) => node) || [];
        } catch (error) {
            logger.error('Failed to get trending products', { error: error.message });
            return [];
        }
    }

    /**
     * Get date N days ago
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
            rateLimit: 'Varies by plan',
            features: 'Product search, comments, trending products',
            circuitBreaker: this.circuitBreaker.getStatus()
        };
    }
}

module.exports = ProductHuntIntegration;
