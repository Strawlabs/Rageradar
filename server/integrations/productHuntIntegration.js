/**
 * Product Hunt Integration
 * Fetch product reviews and comments
 */

const axios = require('axios');
const logger = require('../utils/logger');

class ProductHuntIntegration {
    constructor() {
        this.name = 'producthunt';
        this.token = process.env.PRODUCT_HUNT_TOKEN;
        this.baseUrl = 'https://api.producthunt.com/v2/api/graphql';
    }

    /**
     * Check if Product Hunt is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.token;
    }

    /**
     * Search for product mentions
     * @param {string} productName - Product name
     * @param {object} options - Search options
     * @returns {Promise<Array>} Mentions
     */
    async searchProduct(productName, options = {}) {
        if (!this.isConfigured()) {
            logger.warn('Product Hunt integration not configured');
            return [];
        }

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

            // GraphQL query to search posts
            const query = `
        query SearchPosts($query: String!, $postedAfter: DateTime!, $first: Int!) {
          posts(query: $query, postedAfter: $postedAfter, first: $first, order: VOTES) {
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
                topics {
                  edges {
                    node {
                      name
                    }
                  }
                }
                comments(first: 50, order: VOTES) {
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
          }
        }
      `;

            const response = await axios.post(
                this.baseUrl,
                {
                    query,
                    variables: {
                        query: productName,
                        postedAfter,
                        first: limit
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

            if (response.data.errors) {
                throw new Error(`Product Hunt API error: ${response.data.errors[0].message}`);
            }

            const posts = response.data.data?.posts?.edges || [];
            const mentions = [];

            // Process posts and comments
            posts.forEach(({ node: post }) => {
                // Add post as mention
                mentions.push({
                    platform: 'producthunt',
                    type: 'post',
                    id: post.id,
                    title: post.name,
                    text: `${post.tagline}\n\n${post.description}`,
                    author: 'Product Hunt',
                    votesCount: post.votesCount,
                    commentsCount: post.commentsCount,
                    url: post.url,
                    website: post.website,
                    timestamp: new Date(post.createdAt),

                    metadata: {
                        topics: post.topics.edges.map(t => t.node.name)
                    }
                });

                // Add comments
                post.comments.edges.forEach(({ node: comment }) => {
                    mentions.push({
                        platform: 'producthunt',
                        type: 'comment',
                        id: comment.id,
                        text: comment.body,
                        author: comment.user.name,
                        username: comment.user.username,
                        votesCount: comment.votesCount,
                        url: `${post.url}#comment-${comment.id}`,
                        timestamp: new Date(comment.createdAt),

                        metadata: {
                            productId: post.id,
                            productName: post.name
                        }
                    });
                });
            });

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
                    }
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
            features: 'Product search, comments, trending products'
        };
    }
}

module.exports = ProductHuntIntegration;
