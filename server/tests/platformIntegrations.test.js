/**
 * Platform Integrations — Unit Tests
 *
 * Covers:
 * - MentionNormalizer (all platforms)
 * - IntegrationUtils (retry, circuit breaker, deleted content detection)
 * - RedditIntegration (mock snoowrap)
 * - YouTubeIntegration (mock googleapis)
 * - ProductHuntIntegration (mock axios)
 * - AppStoreIntegration (mock scrapers)
 * - PlatformIntegrationManager (parallel execution, fault isolation)
 */

// ── Mocks (must be declared before require) ──────────────────────────────────

// Mock snoowrap
jest.mock('snoowrap', () => {
    return jest.fn().mockImplementation(() => ({
        config: jest.fn(),
        search: jest.fn().mockResolvedValue([]),
        getSubreddit: jest.fn().mockReturnValue({ getHot: jest.fn().mockResolvedValue([]) })
    }));
});

// Mock googleapis
jest.mock('googleapis', () => ({
    google: {
        youtube: jest.fn().mockReturnValue({
            search: { list: jest.fn().mockResolvedValue({ data: { items: [] } }) },
            commentThreads: { list: jest.fn().mockResolvedValue({ data: { items: [] } }) }
        })
    }
}));

// Mock app-store-scraper
jest.mock('app-store-scraper', () => ({
    search: jest.fn().mockResolvedValue([]),
    reviews: jest.fn().mockResolvedValue([]),
    app: jest.fn().mockResolvedValue(null),
    sort: { RECENT: 1 }
}));

// Mock google-play-scraper
jest.mock('google-play-scraper', () => ({
    search: jest.fn().mockResolvedValue([]),
    reviews: jest.fn().mockResolvedValue({ data: [] }),
    app: jest.fn().mockResolvedValue(null),
    sort: { NEWEST: 2 },
    default: null
}));

// Mock axios for Product Hunt GraphQL queries and Hacker News searches
jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn()
}));

// ── Imports ──────────────────────────────────────────────────────────────────

const { normalize, baseMention } = require('../integrations/mentionNormalizer');
const {
    retryWithBackoff,
    CircuitBreaker,
    isDeletedContent,
    isRetriableError,
    rateLimitDelay
} = require('../integrations/integrationUtils');

// ═══════════════════════════════════════════════════════════════════════════════
// MentionNormalizer Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('MentionNormalizer', () => {
    test('baseMention returns correct default shape', () => {
        const m = baseMention();
        expect(m).toHaveProperty('id', '');
        expect(m).toHaveProperty('platform', '');
        expect(m).toHaveProperty('type', 'post');
        expect(m).toHaveProperty('title', '');
        expect(m).toHaveProperty('text', '');
        expect(m).toHaveProperty('author', '');
        expect(m).toHaveProperty('authorUrl', '');
        expect(m).toHaveProperty('url', '');
        expect(m).toHaveProperty('timestamp');
        expect(m.engagement).toEqual({
            upvotes: 0, downvotes: 0, comments: 0, ratio: null, rating: null
        });
        expect(m).toHaveProperty('metadata');
        expect(m).toHaveProperty('source', '');
    });

    test('normalize returns null for invalid input', () => {
        expect(normalize('reddit', null)).toBeNull();
        expect(normalize('reddit', undefined)).toBeNull();
        expect(normalize('reddit', 'string')).toBeNull();
    });

    test('normalize Reddit post produces canonical shape', () => {
        const raw = {
            type: 'post',
            id: 'abc123',
            title: 'Test post',
            text: 'This is a test post body',
            author: 'testuser',
            subreddit: 'test',
            score: 42,
            upvoteRatio: 0.95,
            numComments: 10,
            url: 'https://reddit.com/r/test/abc123',
            timestamp: new Date('2025-06-01T00:00:00Z'),
            metadata: { awards: 2, gilded: 1, stickied: false, over18: false }
        };

        const result = normalize('reddit', raw);

        expect(result.id).toBe('abc123');
        expect(result.platform).toBe('reddit');
        expect(result.type).toBe('post');
        expect(result.title).toBe('Test post');
        expect(result.text).toBe('This is a test post body');
        expect(result.author).toBe('testuser');
        expect(result.authorUrl).toBe('https://reddit.com/user/testuser');
        expect(result.engagement.upvotes).toBe(42);
        expect(result.engagement.ratio).toBe(0.95);
        expect(result.engagement.comments).toBe(10);
        expect(result.metadata.subreddit).toBe('test');
        expect(result.source).toBe('platform_api_reddit');
    });

    test('normalize Reddit comment has parentId in metadata', () => {
        const raw = {
            type: 'comment',
            id: 'comment1',
            text: 'A comment',
            author: 'commenter',
            score: 5,
            url: 'https://reddit.com/r/test/abc/comment1',
            timestamp: new Date('2025-06-01'),
            metadata: { parentId: 'abc', parentTitle: 'Parent post', depth: 1 }
        };

        const result = normalize('reddit', raw);
        expect(result.type).toBe('comment');
        expect(result.metadata.parentId).toBe('abc');
        expect(result.metadata.parentTitle).toBe('Parent post');
    });

    test('normalize YouTube comment produces canonical shape', () => {
        const raw = {
            id: 'yt1',
            text: 'Great video',
            author: 'viewer',
            authorChannelUrl: 'https://youtube.com/channel/xyz',
            likeCount: 15,
            videoId: 'vid1',
            videoTitle: 'Test Video',
            videoChannel: 'TestChannel',
            url: 'https://youtube.com/watch?v=vid1&lc=yt1',
            timestamp: new Date('2025-06-01'),
            metadata: { replyCount: 3 }
        };

        const result = normalize('youtube', raw);
        expect(result.platform).toBe('youtube');
        expect(result.type).toBe('comment');
        expect(result.engagement.upvotes).toBe(15);
        expect(result.engagement.comments).toBe(3);
        expect(result.metadata.videoId).toBe('vid1');
        expect(result.source).toBe('platform_api_youtube');
    });

    test('normalize ProductHunt post includes topics', () => {
        const raw = {
            type: 'post',
            id: 'ph1',
            title: 'Cool Product',
            text: 'A tagline\n\nA description',
            author: 'Product Hunt',
            votesCount: 200,
            commentsCount: 30,
            url: 'https://producthunt.com/posts/cool-product',
            timestamp: new Date('2025-06-01'),
            metadata: { topics: ['AI', 'Productivity'] }
        };

        const result = normalize('producthunt', raw);
        expect(result.platform).toBe('producthunt');
        expect(result.engagement.upvotes).toBe(200);
        expect(result.engagement.comments).toBe(30);
        expect(result.metadata.topics).toEqual(['AI', 'Productivity']);
    });

    test('normalize App Store review includes rating', () => {
        const raw = {
            id: 'ios1',
            title: 'Great app',
            text: 'Love this app',
            author: 'user1',
            rating: 5,
            url: 'https://apps.apple.com/app/1234',
            timestamp: new Date('2025-06-01'),
            metadata: { appId: 1234, appName: 'TestApp', appVersion: '2.0', voteSum: 10, voteCount: 12 }
        };

        const result = normalize('app_store', raw);
        expect(result.platform).toBe('app_store');
        expect(result.type).toBe('review');
        expect(result.engagement.rating).toBe(5);
        expect(result.engagement.upvotes).toBe(10);
        expect(result.source).toBe('platform_api_app_store');
    });

    test('normalize Play Store review includes thumbsUp and developer reply', () => {
        const raw = {
            id: 'gp1',
            text: 'Crashes on startup',
            author: 'user2',
            rating: 1,
            url: 'https://play.google.com/store/apps/details?id=com.test',
            timestamp: new Date('2025-06-01'),
            metadata: { appId: 'com.test', appName: 'TestApp', thumbsUp: 5, replyText: 'Fixed in v3' }
        };

        const result = normalize('play_store', raw);
        expect(result.platform).toBe('play_store');
        expect(result.type).toBe('review');
        expect(result.engagement.rating).toBe(1);
        expect(result.engagement.upvotes).toBe(5);
        expect(result.metadata.replyText).toBe('Fixed in v3');
        expect(result.source).toBe('platform_api_play_store');
    });

    test('normalize Hacker News story and comment produces canonical shape', () => {
        const rawComment = {
            type: 'comment',
            id: 'hn1',
            title: 'Parent Story',
            text: 'This is a comment',
            author: 'author1',
            score: 5,
            numComments: 2,
            url: 'https://news.ycombinator.com/item?id=hn1',
            timestamp: new Date('2025-06-01'),
            metadata: { storyId: 100, parentId: 99, points: 5 }
        };

        const result = normalize('hackernews', rawComment);
        expect(result.platform).toBe('hackernews');
        expect(result.type).toBe('comment');
        expect(result.engagement.upvotes).toBe(5);
        expect(result.metadata.storyId).toBe(100);
        expect(result.source).toBe('platform_api_hackernews');
    });

    test('normalize unknown platform falls back to generic', () => {
        const raw = { id: 'x1', text: 'Something', score: 3 };
        const result = normalize('twitter', raw);
        expect(result.platform).toBe('twitter');
        expect(result.engagement.upvotes).toBe(3);
        expect(result.source).toBe('platform_api_twitter');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// IntegrationUtils Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('IntegrationUtils', () => {
    describe('isDeletedContent', () => {
        test('detects [deleted] and [removed]', () => {
            expect(isDeletedContent('[deleted]')).toBe(true);
            expect(isDeletedContent('[removed]')).toBe(true);
            expect(isDeletedContent('[Deleted]')).toBe(true);
            expect(isDeletedContent('[unavailable]')).toBe(true);
        });

        test('detects empty and null content', () => {
            expect(isDeletedContent('')).toBe(true);
            expect(isDeletedContent(null)).toBe(true);
            expect(isDeletedContent(undefined)).toBe(true);
            expect(isDeletedContent('   ')).toBe(true);
        });

        test('detects platform-specific deletion messages', () => {
            expect(isDeletedContent('Comment removed by moderator')).toBe(true);
            expect(isDeletedContent('This video is unavailable')).toBe(true);
            expect(isDeletedContent('Video unavailable')).toBe(true);
        });

        test('does not flag normal content', () => {
            expect(isDeletedContent('I really dislike this product')).toBe(false);
            expect(isDeletedContent('Great app, 5 stars!')).toBe(false);
            expect(isDeletedContent('The deleted scene was interesting')).toBe(false);
        });
    });

    describe('isRetriableError', () => {
        test('treats 429 as retriable', () => {
            expect(isRetriableError({ statusCode: 429 })).toBe(true);
            expect(isRetriableError({ response: { status: 429 } })).toBe(true);
        });

        test('treats 5xx as retriable', () => {
            expect(isRetriableError({ statusCode: 500 })).toBe(true);
            expect(isRetriableError({ statusCode: 503 })).toBe(true);
        });

        test('treats network errors as retriable', () => {
            expect(isRetriableError({ code: 'ECONNRESET' })).toBe(true);
            expect(isRetriableError({ code: 'ETIMEDOUT' })).toBe(true);
            expect(isRetriableError({ message: 'Request timeout' })).toBe(true);
        });

        test('does not retry 400/401/403', () => {
            expect(isRetriableError({ statusCode: 400 })).toBe(false);
            expect(isRetriableError({ statusCode: 401 })).toBe(false);
            expect(isRetriableError({ statusCode: 403 })).toBe(false);
        });
    });

    describe('retryWithBackoff', () => {
        test('succeeds on first attempt', async () => {
            const fn = jest.fn().mockResolvedValue('ok');
            const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });
            expect(result).toBe('ok');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('retries on failure then succeeds', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new Error('fail1'))
                .mockResolvedValue('ok');

            const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });
            expect(result).toBe('ok');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        test('throws after max retries', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('always fails'));

            await expect(
                retryWithBackoff(fn, { maxRetries: 2, baseDelay: 10 })
            ).rejects.toThrow('always fails');
            expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
        });

        test('respects shouldRetry predicate', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('non-retriable'));

            await expect(
                retryWithBackoff(fn, {
                    maxRetries: 3,
                    baseDelay: 10,
                    shouldRetry: () => false
                })
            ).rejects.toThrow('non-retriable');
            expect(fn).toHaveBeenCalledTimes(1); // no retries
        });
    });

    describe('CircuitBreaker', () => {
        test('starts in CLOSED state', () => {
            const cb = new CircuitBreaker({ name: 'test' });
            expect(cb.state).toBe('CLOSED');
            expect(cb.isOpen()).toBe(false);
        });

        test('opens after reaching failure threshold', () => {
            const cb = new CircuitBreaker({ name: 'test', failureThreshold: 3, cooldownMs: 60000 });

            cb.onFailure();
            cb.onFailure();
            expect(cb.state).toBe('CLOSED');

            cb.onFailure();
            expect(cb.state).toBe('OPEN');
            expect(cb.isOpen()).toBe(true);
        });

        test('success resets failure count', () => {
            const cb = new CircuitBreaker({ name: 'test', failureThreshold: 3 });

            cb.onFailure();
            cb.onFailure();
            cb.onSuccess();
            expect(cb.state).toBe('CLOSED');
            expect(cb.failures).toBe(0);
        });

        test('transitions to HALF_OPEN after cooldown', () => {
            const cb = new CircuitBreaker({ name: 'test', failureThreshold: 1, cooldownMs: 100 });

            cb.onFailure();
            expect(cb.state).toBe('OPEN');

            // Manually set lastFailureTime to the past
            cb.lastFailureTime = Date.now() - 200;
            expect(cb.isOpen()).toBe(false);
            expect(cb.state).toBe('HALF_OPEN');
        });

        test('exec blocks requests when circuit is OPEN', async () => {
            const cb = new CircuitBreaker({ name: 'test', failureThreshold: 1, cooldownMs: 60000 });
            cb.onFailure();

            await expect(
                cb.exec(() => Promise.resolve('ok'))
            ).rejects.toThrow('circuit is OPEN');
        });

        test('exec allows requests when CLOSED', async () => {
            const cb = new CircuitBreaker({ name: 'test' });
            const result = await cb.exec(() => Promise.resolve('ok'));
            expect(result).toBe('ok');
        });

        test('getStatus returns correct shape', () => {
            const cb = new CircuitBreaker({ name: 'test', failureThreshold: 5, cooldownMs: 60000 });
            const status = cb.getStatus();
            expect(status.state).toBe('CLOSED');
            expect(status.consecutiveFailures).toBe(0);
            expect(status.failureThreshold).toBe(5);
            expect(status.cooldownMs).toBe(60000);
        });
    });

    describe('rateLimitDelay', () => {
        test('completes without error', async () => {
            // Just verify it resolves (very short delay for test)
            await expect(rateLimitDelay('reddit')).resolves.toBeUndefined();
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Integration Tests (mocked APIs)
// ═══════════════════════════════════════════════════════════════════════════════

describe('RedditIntegration', () => {
    beforeEach(() => {
        // Set env vars for isConfigured()
        process.env.REDDIT_CLIENT_ID = 'test_id';
        process.env.REDDIT_CLIENT_SECRET = 'test_secret';
        process.env.REDDIT_REFRESH_TOKEN = 'test_token';
    });

    afterEach(() => {
        delete process.env.REDDIT_CLIENT_ID;
        delete process.env.REDDIT_CLIENT_SECRET;
        delete process.env.REDDIT_REFRESH_TOKEN;
    });

    test('isConfigured returns true when env vars are set', () => {
        const RedditIntegration = require('../integrations/redditIntegration');
        const reddit = new RedditIntegration();
        expect(reddit.isConfigured()).toBe(true);
    });

    test('isConfigured returns false when env vars missing', () => {
        delete process.env.REDDIT_CLIENT_ID;
        // Clear module cache so constructor re-checks env
        jest.resetModules();
        jest.mock('snoowrap', () => jest.fn().mockImplementation(() => ({
            config: jest.fn(),
            search: jest.fn().mockResolvedValue([])
        })));
        const RedditIntegration = require('../integrations/redditIntegration');
        const reddit = new RedditIntegration();
        expect(reddit.isConfigured()).toBe(false);
    });

    test('searchBrand returns empty array when not configured', async () => {
        delete process.env.REDDIT_CLIENT_ID;
        jest.resetModules();
        jest.mock('snoowrap', () => jest.fn().mockImplementation(() => ({
            config: jest.fn(),
            search: jest.fn().mockResolvedValue([])
        })));
        const RedditIntegration = require('../integrations/redditIntegration');
        const reddit = new RedditIntegration();
        const result = await reddit.searchBrand('TestBrand');
        expect(result).toEqual([]);
    });

    test('getStatus includes circuitBreaker field', () => {
        const RedditIntegration = require('../integrations/redditIntegration');
        const reddit = new RedditIntegration();
        const status = reddit.getStatus();
        expect(status).toHaveProperty('circuitBreaker');
        expect(status.circuitBreaker.state).toBe('CLOSED');
    });

    test('searchBrand successfully retrieves posts and comments', async () => {
        const RedditIntegration = require('../integrations/redditIntegration');
        const reddit = new RedditIntegration();
        
        const mockPost = {
            id: 'post123',
            title: 'Cool Brand Post',
            selftext: 'This is a brand description text',
            author: { name: 'redditUser1' },
            subreddit: { display_name: 'test_subreddit' },
            score: 15,
            upvote_ratio: 0.9,
            num_comments: 1,
            permalink: '/r/test_subreddit/comments/post123',
            created_utc: 1780000000,
            total_awards_received: 3,
            gilded: 0,
            stickied: false,
            over_18: false,
            comments: {
                fetchMore: jest.fn().mockResolvedValue([
                    {
                        id: 'comment456',
                        body: 'This brand is amazing!',
                        author: { name: 'commenter1' },
                        score: 5,
                        permalink: '/r/test_subreddit/comments/post123/comment456',
                        created_utc: 1780001000,
                        depth: 0,
                        total_awards_received: 0,
                        gilded: 0
                    }
                ])
            }
        };
        
        reddit.client.search = jest.fn().mockResolvedValue([mockPost]);

        const mentions = await reddit.searchBrand('Cool Brand', { includeComments: true });
        
        expect(mentions).toHaveLength(2); // 1 post + 1 comment
        
        const postMention = mentions.find(m => m.type === 'post');
        expect(postMention.title).toBe('Cool Brand Post');
        expect(postMention.text).toBe('This is a brand description text');
        expect(postMention.author).toBe('redditUser1');
        expect(postMention.engagement.upvotes).toBe(15);
        expect(postMention.engagement.comments).toBe(1);
        expect(postMention.metadata.subreddit).toBe('test_subreddit');
        
        const commentMention = mentions.find(m => m.type === 'comment');
        expect(commentMention.text).toBe('This brand is amazing!');
        expect(commentMention.author).toBe('commenter1');
        expect(commentMention.engagement.upvotes).toBe(5);
        expect(commentMention.metadata.parentId).toBe('post123');
    });
});

describe('YouTubeIntegration', () => {
    beforeEach(() => {
        process.env.YOUTUBE_API_KEY = 'test_key';
    });

    afterEach(() => {
        delete process.env.YOUTUBE_API_KEY;
    });

    test('isConfigured returns true when API key is set', () => {
        const YouTubeIntegration = require('../integrations/youtubeIntegration');
        const yt = new YouTubeIntegration();
        expect(yt.isConfigured()).toBe(true);
    });

    test('searchBrand returns empty when not configured', async () => {
        delete process.env.YOUTUBE_API_KEY;
        const YouTubeIntegration = require('../integrations/youtubeIntegration');
        const yt = new YouTubeIntegration();
        const result = await yt.searchBrand('TestBrand');
        expect(result).toEqual([]);
    });

    test('getStatus includes quotaExhausted and circuitBreaker', () => {
        const YouTubeIntegration = require('../integrations/youtubeIntegration');
        const yt = new YouTubeIntegration();
        const status = yt.getStatus();
        expect(status).toHaveProperty('quotaExhausted', false);
        expect(status).toHaveProperty('circuitBreaker');
    });

    test('searchBrand successfully retrieves videos and comments', async () => {
        const { google } = require('googleapis');
        const YouTubeIntegration = require('../integrations/youtubeIntegration');
        const yt = new YouTubeIntegration();
        
        google.youtube().search.list.mockResolvedValueOnce({
            data: {
                items: [
                    {
                        id: { videoId: 'video123' },
                        snippet: {
                            title: 'Best Brand Review',
                            channelTitle: 'TechReviewer',
                            publishedAt: '2025-06-01T00:00:00Z'
                        }
                    }
                ]
            }
        });
        
        google.youtube().commentThreads.list.mockResolvedValueOnce({
            data: {
                items: [
                    {
                        id: 'comment111',
                        snippet: {
                            totalReplyCount: 2,
                            topLevelComment: {
                                snippet: {
                                    textDisplay: 'I absolutely love this brand!',
                                    authorDisplayName: 'viewer1',
                                    authorChannelUrl: 'https://youtube.com/channel/viewer1_channel',
                                    likeCount: 50,
                                    publishedAt: '2025-06-02T00:00:00Z',
                                    canRate: true,
                                    viewerRating: 'none'
                                }
                            }
                        }
                    }
                ]
            }
        });

        const mentions = await yt.searchBrand('Cool Brand', { maxVideos: 1, maxCommentsPerVideo: 5 });
        expect(mentions).toHaveLength(1);
        
        const comment = mentions[0];
        expect(comment.platform).toBe('youtube');
        expect(comment.type).toBe('comment');
        expect(comment.id).toBe('comment111');
        expect(comment.text).toBe('I absolutely love this brand!');
        expect(comment.author).toBe('viewer1');
        expect(comment.engagement.upvotes).toBe(50);
        expect(comment.engagement.comments).toBe(2);
        expect(comment.metadata.videoId).toBe('video123');
        expect(comment.metadata.videoTitle).toBe('Best Brand Review');
    });
});

describe('ProductHuntIntegration', () => {
    beforeEach(() => {
        process.env.PRODUCT_HUNT_TOKEN = 'test_token';
    });

    afterEach(() => {
        delete process.env.PRODUCT_HUNT_TOKEN;
    });

    test('isConfigured returns true when token is set', () => {
        const ProductHuntIntegration = require('../integrations/productHuntIntegration');
        const ph = new ProductHuntIntegration();
        expect(ph.isConfigured()).toBe(true);
    });

    test('searchProduct returns empty when not configured', async () => {
        delete process.env.PRODUCT_HUNT_TOKEN;
        const ProductHuntIntegration = require('../integrations/productHuntIntegration');
        const ph = new ProductHuntIntegration();
        const result = await ph.searchProduct('TestProduct');
        expect(result).toEqual([]);
    });

    test('getStatus includes circuitBreaker field', () => {
        const ProductHuntIntegration = require('../integrations/productHuntIntegration');
        const ph = new ProductHuntIntegration();
        const status = ph.getStatus();
        expect(status).toHaveProperty('circuitBreaker');
    });

    test('searchProduct successfully retrieves posts and comments', async () => {
        const axios = require('axios');
        const ProductHuntIntegration = require('../integrations/productHuntIntegration');
        const ph = new ProductHuntIntegration();
        
        axios.post.mockResolvedValueOnce({
            data: {
                data: {
                    posts: {
                        edges: [
                            {
                                node: {
                                    id: 'post999',
                                    name: 'SuperTool',
                                    tagline: 'The ultimate tool for everything',
                                    description: 'A very cool description',
                                    votesCount: 100,
                                    commentsCount: 1,
                                    url: 'https://producthunt.com/posts/supertool',
                                    createdAt: '2025-06-01T00:00:00Z',
                                    website: 'https://supertool.com',
                                    topics: {
                                        edges: [
                                            { node: { name: 'Productivity' } }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        });
        
        axios.post.mockResolvedValueOnce({
            data: {
                data: {
                    post: {
                        comments: {
                            edges: [
                                {
                                    node: {
                                        id: 'comment888',
                                        body: 'Best tool I have used in years!',
                                        votesCount: 10,
                                        createdAt: '2025-06-02T00:00:00Z',
                                        user: {
                                            name: 'Hunter',
                                            username: 'hunter1'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        });

        const mentions = await ph.searchProduct('SuperTool', { limit: 1 });
        expect(mentions).toHaveLength(2); // 1 post + 1 comment
        
        const post = mentions.find(m => m.type === 'post');
        expect(post.title).toBe('SuperTool');
        expect(post.text).toContain('The ultimate tool for everything');
        expect(post.engagement.upvotes).toBe(100);
        expect(post.metadata.topics).toEqual(['Productivity']);
        
        const comment = mentions.find(m => m.type === 'comment');
        expect(comment.text).toBe('Best tool I have used in years!');
        expect(comment.author).toBe('Hunter');
        expect(comment.engagement.upvotes).toBe(10);
    });
});

describe('AppStoreIntegration', () => {
    test('isConfigured always returns true (no API key needed)', () => {
        const AppStoreIntegration = require('../integrations/appStoreIntegration');
        const as = new AppStoreIntegration();
        expect(as.isConfigured()).toBe(true);
    });

    test('getStatus includes circuitBreaker field', () => {
        const AppStoreIntegration = require('../integrations/appStoreIntegration');
        const as = new AppStoreIntegration();
        const status = as.getStatus();
        expect(status).toHaveProperty('circuitBreaker');
        expect(status.circuitBreaker.state).toBe('CLOSED');
    });

    test('getIOSReviews returns empty when no app found', async () => {
        const appStoreScraper = require('app-store-scraper');
        appStoreScraper.search.mockResolvedValue([]);

        const AppStoreIntegration = require('../integrations/appStoreIntegration');
        const as = new AppStoreIntegration();
        const result = await as.getIOSReviews('NonExistentApp');
        expect(result).toEqual([]);
    });

    test('getAndroidReviews returns empty when no app found', async () => {
        const gplayScraper = require('google-play-scraper');
        gplayScraper.search.mockResolvedValue([]);
        gplayScraper.app.mockRejectedValue(new Error('App not found'));

        const AppStoreIntegration = require('../integrations/appStoreIntegration');
        const as = new AppStoreIntegration();
        const result = await as.getAndroidReviews('NonExistentApp');
        expect(result).toEqual([]);
    });

    test('searchApp successfully retrieves iOS and Android reviews', async () => {
        const appStoreScraper = require('app-store-scraper');
        const gplayScraper = require('google-play-scraper');
        const AppStoreIntegration = require('../integrations/appStoreIntegration');
        const as = new AppStoreIntegration();
        
        appStoreScraper.search.mockResolvedValue([{ id: 1111, title: 'iOSApp', url: 'https://apps.apple.com/app/1111' }]);
        appStoreScraper.reviews.mockResolvedValue([
            {
                id: 'rev_ios',
                title: 'Great iOS app',
                text: 'Runs beautifully',
                userName: 'iosUser',
                score: 5,
                version: '1.2',
                voteSum: 3,
                voteCount: 4,
                date: '2025-06-01'
            }
        ]);
        
        gplayScraper.search.mockResolvedValue([{ appId: 'com.android.app', title: 'AndroidApp', url: 'https://play.google.com/store/apps/details?id=com.android.app' }]);
        gplayScraper.reviews.mockResolvedValue({
            data: [
                {
                    id: 'rev_and',
                    userName: 'androidUser',
                    text: 'Very fast',
                    score: 4,
                    version: '1.2',
                    thumbsUp: 8,
                    date: '2025-06-02',
                    replyText: 'Thanks',
                    replyDate: '2025-06-03'
                }
            ]
        });

        const mentions = await as.searchApp('TestApp', { platform: 'both' });
        expect(mentions).toHaveLength(2);
        
        const iosReview = mentions.find(m => m.platform === 'app_store');
        expect(iosReview.type).toBe('review');
        expect(iosReview.text).toBe('Runs beautifully');
        expect(iosReview.engagement.rating).toBe(5);
        expect(iosReview.engagement.upvotes).toBe(3);
        
        const androidReview = mentions.find(m => m.platform === 'play_store');
        expect(androidReview.type).toBe('review');
        expect(androidReview.text).toBe('Very fast');
        expect(androidReview.engagement.rating).toBe(4);
        expect(androidReview.engagement.upvotes).toBe(8);
        expect(androidReview.metadata.replyText).toBe('Thanks');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PlatformIntegrationManager Tests
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// HackerNewsIntegration Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('HackerNewsIntegration', () => {
    let integration;
    let axios;

    beforeEach(() => {
        axios = require('axios');
        const HackerNewsIntegration = require('../integrations/hackerNewsIntegration');
        integration = new HackerNewsIntegration();
        jest.clearAllMocks();
    });

    test('isConfigured is always true', () => {
        expect(integration.isConfigured()).toBe(true);
    });

    test('searchBrand fetches, cleans text, and normalizes hits', async () => {
        axios.get.mockResolvedValue({
            data: {
                hits: [
                    {
                        objectID: 'hn_story_1',
                        _tags: ['story'],
                        title: 'Zoho CEO on Bootstrapping',
                        story_text: 'Sridhar Vembu built Zoho without VC.',
                        author: 'coder1',
                        points: 42,
                        num_comments: 8,
                        url: 'https://techcrunch.com/zoho',
                        created_at: '2025-06-01T12:00:00Z'
                    },
                    {
                        objectID: 'hn_comment_1',
                        _tags: ['comment'],
                        story_title: 'Zoho CEO on Bootstrapping',
                        comment_text: 'Great product.<p>Highly recommend &#x27;Zoho&#x27;.</p>',
                        author: 'coder2',
                        points: 5,
                        created_at: '2025-06-01T13:00:00Z',
                        story_id: 123,
                        parent_id: 111
                    }
                ]
            }
        });

        const results = await integration.searchBrand('Zoho');
        expect(results).toHaveLength(2);
        
        const story = results.find(r => r.type === 'post');
        expect(story.id).toBe('hn_story_1');
        expect(story.title).toBe('Zoho CEO on Bootstrapping');
        expect(story.text).toBe('Sridhar Vembu built Zoho without VC.');
        expect(story.engagement.upvotes).toBe(42);
        expect(story.engagement.comments).toBe(8);
        expect(story.url).toBe('https://techcrunch.com/zoho');

        const comment = results.find(r => r.type === 'comment');
        expect(comment.id).toBe('hn_comment_1');
        expect(comment.title).toBe('Zoho CEO on Bootstrapping');
        // HTML should be stripped and HTML entities decoded
        expect(comment.text).toBe("Great product. Highly recommend 'Zoho'.");
        expect(comment.engagement.upvotes).toBe(5);
        expect(comment.url).toBe('https://news.ycombinator.com/item?id=hn_comment_1');
    });

    test('searchBrand returns empty array and logs warning if response structure invalid', async () => {
        axios.get.mockResolvedValue({ data: {} });
        const results = await integration.searchBrand('Zoho');
        expect(results).toEqual([]);
    });

    test('searchBrand propagates network error to circuit breaker', async () => {
        axios.get.mockRejectedValue(new Error('Network failure'));
        await expect(integration.searchBrand('Zoho')).rejects.toThrow('Network failure');
    });
});

describe('PlatformIntegrationManager', () => {
    test('initializes with all platform keys', () => {
        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();

        expect(manager.integrations).toHaveProperty('reddit');
        expect(manager.integrations).toHaveProperty('youtube');
        expect(manager.integrations).toHaveProperty('producthunt');
        expect(manager.integrations).toHaveProperty('appstore');
        expect(manager.integrations).toHaveProperty('playstore');
    });

    test('appstore and playstore share the same instance', () => {
        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();
        expect(manager.integrations.appstore).toBe(manager.integrations.playstore);
    });

    test('getAllStatus includes playstore', () => {
        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();
        const status = manager.getAllStatus();

        expect(status.platforms).toHaveProperty('playstore');
        expect(status.platforms.playstore.name).toBe('playstore');
    });

    test('getIntegrationHealth returns circuit breaker status for each platform', () => {
        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();
        const health = manager.getIntegrationHealth();

        expect(health).toHaveProperty('reddit');
        expect(health).toHaveProperty('youtube');
        expect(health).toHaveProperty('producthunt');
        expect(health).toHaveProperty('appstore');
        expect(health).toHaveProperty('playstore');

        // App store always configured
        expect(health.appstore.configured).toBe(true);
    });

    test('_deduplicateAppStorePlatforms removes playstore when appstore present', () => {
        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();

        const result = manager._deduplicateAppStorePlatforms(['reddit', 'appstore', 'playstore']);
        expect(result).toEqual(['reddit', 'appstore']);
    });

    test('_deduplicateAppStorePlatforms keeps playstore when appstore absent', () => {
        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();

        const result = manager._deduplicateAppStorePlatforms(['reddit', 'playstore']);
        expect(result).toEqual(['reddit', 'playstore']);
    });

    test('searchPlatform throws for unknown platform', async () => {
        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();

        await expect(
            manager.searchPlatform('tiktok', 'TestBrand')
        ).rejects.toThrow('not found');
    });

    test('searchAllPlatforms aggregates and handles partial errors gracefully', async () => {
        // Configure env BEFORE manager initialization
        process.env.REDDIT_CLIENT_ID = 'test_id';
        process.env.REDDIT_CLIENT_SECRET = 'test_secret';
        process.env.REDDIT_REFRESH_TOKEN = 'test_token';
        process.env.YOUTUBE_API_KEY = 'test_key';
        process.env.PRODUCT_HUNT_TOKEN = 'test_token';

        const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
        const manager = new PlatformIntegrationManager();
        
        // Mock individual search implementations
        manager.integrations.reddit.searchBrand = jest.fn().mockResolvedValue([
            { id: 'r1', platform: 'reddit', type: 'post', text: 'reddit text', timestamp: new Date() }
        ]);
        
        manager.integrations.youtube.searchBrand = jest.fn().mockResolvedValue([
            { id: 'y1', platform: 'youtube', type: 'comment', text: 'youtube text', timestamp: new Date() }
        ]);

        manager.integrations.hackernews.searchBrand = jest.fn().mockResolvedValue([
            { id: 'h1', platform: 'hackernews', type: 'post', text: 'hn text', timestamp: new Date() }
        ]);
        
        // Mock Product Hunt to fail/throw error (isolation check)
        manager.integrations.producthunt.searchProduct = jest.fn().mockRejectedValue(new Error('Product Hunt API error'));
        
        // Mock AppStore search
        manager.integrations.appstore.searchApp = jest.fn().mockResolvedValue([
            { id: 'a1', platform: 'app_store', type: 'review', text: 'app store text', timestamp: new Date() },
            { id: 'p1', platform: 'play_store', type: 'review', text: 'play store text', timestamp: new Date() }
        ]);

        const result = await manager.searchAllPlatforms('CoolBrand', { limit: 10 });
        
        expect(result.mentions).toHaveLength(5);
        expect(result.summary.byPlatform.reddit).toBe(1);
        expect(result.summary.byPlatform.youtube).toBe(1);
        expect(result.summary.byPlatform.hackernews).toBe(1);
        expect(result.summary.byPlatform.appstore).toBe(2);
        
        expect(result.summary.errors).toHaveProperty('producthunt', 'Product Hunt API error');
        expect(result.summary.errors).not.toHaveProperty('reddit');
        expect(result.summary.errors).not.toHaveProperty('youtube');

        // Cleanup env
        delete process.env.REDDIT_CLIENT_ID;
        delete process.env.REDDIT_CLIENT_SECRET;
        delete process.env.REDDIT_REFRESH_TOKEN;
        delete process.env.YOUTUBE_API_KEY;
        delete process.env.PRODUCT_HUNT_TOKEN;
    });
});
