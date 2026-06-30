/**
 * Mention Normalizer
 * Converts raw platform-specific mention objects into a canonical NormalizedMention shape.
 * Every integration should call normalize() before returning mentions to the pipeline.
 *
 * Canonical shape:
 * {
 *   id, platform, type, title, text, author, authorUrl, url, timestamp,
 *   engagement: { upvotes, downvotes, comments, ratio, rating },
 *   metadata, source
 * }
 */

const logger = require('../utils/logger');

/**
 * Normalize a raw mention from any platform into the canonical shape.
 * @param {string} platform - 'reddit' | 'youtube' | 'producthunt' | 'app_store' | 'play_store'
 * @param {object} raw - Raw mention object from the integration
 * @returns {object} NormalizedMention
 */
function normalize(platform, raw) {
    if (!raw || typeof raw !== 'object') {
        logger.warn('MentionNormalizer: received invalid raw mention', { platform });
        return null;
    }

    try {
        switch (platform) {
            case 'reddit':
                return normalizeReddit(raw);
            case 'youtube':
                return normalizeYouTube(raw);
            case 'producthunt':
                return normalizeProductHunt(raw);
            case 'app_store':
                return normalizeAppStore(raw);
            case 'play_store':
                return normalizePlayStore(raw);
            case 'hackernews':
                return normalizeHackerNews(raw);
            default:
                return normalizeGeneric(platform, raw);
        }
    } catch (error) {
        logger.warn('MentionNormalizer: normalization failed', {
            platform,
            error: error.message
        });
        return normalizeGeneric(platform, raw);
    }
}

/**
 * Build the base mention shape with safe defaults.
 */
function baseMention(overrides = {}) {
    return {
        id: '',
        platform: '',
        type: 'post',
        title: '',
        text: '',
        author: '',
        authorUrl: '',
        url: '',
        timestamp: new Date().toISOString(),
        engagement: {
            upvotes: 0,
            downvotes: 0,
            comments: 0,
            ratio: null,
            rating: null
        },
        metadata: {},
        source: '',
        ...overrides
    };
}

/**
 * Safely converts a timestamp to ISO string format.
 */
function safeISOString(timestamp) {
    if (timestamp instanceof Date) {
        return !isNaN(timestamp.getTime()) ? timestamp.toISOString() : new Date().toISOString();
    }
    if (typeof timestamp === 'string') {
        return timestamp;
    }
    if (typeof timestamp === 'number') {
        const d = new Date(timestamp);
        return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
    }
    return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Platform-Specific Normalizers
// ---------------------------------------------------------------------------

function normalizeReddit(raw) {
    const isComment = raw.type === 'comment';

    return baseMention({
        id: String(raw.id || ''),
        platform: 'reddit',
        type: isComment ? 'comment' : 'post',
        title: raw.title || '',
        text: raw.text || raw.body || '',
        author: raw.author || '',
        authorUrl: raw.author ? `https://reddit.com/user/${raw.author}` : '',
        url: raw.url || '',
        timestamp: safeISOString(raw.timestamp),
        engagement: {
            upvotes: raw.score || 0,
            downvotes: 0,
            comments: raw.numComments || 0,
            ratio: raw.upvoteRatio || null,
            rating: null
        },
        metadata: {
            subreddit: raw.subreddit || '',
            awards: raw.metadata?.awards || 0,
            gilded: raw.metadata?.gilded || 0,
            stickied: raw.metadata?.stickied || false,
            over18: raw.metadata?.over18 || false,
            ...(isComment ? {
                parentId: raw.metadata?.parentId || '',
                parentTitle: raw.metadata?.parentTitle || '',
                depth: raw.metadata?.depth || 0
            } : {})
        },
        source: 'platform_api_reddit'
    });
}

function normalizeYouTube(raw) {
    return baseMention({
        id: String(raw.id || ''),
        platform: 'youtube',
        type: 'comment',
        title: raw.videoTitle || '',
        text: raw.text || '',
        author: raw.author || '',
        authorUrl: raw.authorChannelUrl || '',
        url: raw.url || '',
        timestamp: safeISOString(raw.timestamp),
        engagement: {
            upvotes: raw.likeCount || 0,
            downvotes: 0,
            comments: raw.metadata?.replyCount || 0,
            ratio: null,
            rating: null
        },
        metadata: {
            videoId: raw.videoId || '',
            videoTitle: raw.videoTitle || '',
            videoChannel: raw.videoChannel || '',
            videoPublishedAt: raw.videoPublishedAt || ''
        },
        source: 'platform_api_youtube'
    });
}

function normalizeProductHunt(raw) {
    const isComment = raw.type === 'comment';

    return baseMention({
        id: String(raw.id || ''),
        platform: 'producthunt',
        type: isComment ? 'comment' : 'post',
        title: raw.title || '',
        text: raw.text || raw.body || '',
        author: raw.author || '',
        authorUrl: raw.username ? `https://producthunt.com/@${raw.username}` : '',
        url: raw.url || '',
        timestamp: safeISOString(raw.timestamp),
        engagement: {
            upvotes: raw.votesCount || 0,
            downvotes: 0,
            comments: raw.commentsCount || 0,
            ratio: null,
            rating: null
        },
        metadata: {
            website: raw.website || '',
            topics: raw.metadata?.topics || [],
            ...(isComment ? {
                productId: raw.metadata?.productId || '',
                productName: raw.metadata?.productName || ''
            } : {})
        },
        source: 'platform_api_producthunt'
    });
}

function normalizeAppStore(raw) {
    return baseMention({
        id: String(raw.id || ''),
        platform: 'app_store',
        type: 'review',
        title: raw.title || '',
        text: raw.text || '',
        author: raw.author || '',
        authorUrl: '',
        url: raw.url || '',
        timestamp: safeISOString(raw.timestamp),
        engagement: {
            upvotes: raw.metadata?.voteSum || raw.metadata?.voteCount || 0,
            downvotes: 0,
            comments: 0,
            ratio: null,
            rating: raw.rating || null
        },
        metadata: {
            appId: raw.metadata?.appId || '',
            appName: raw.metadata?.appName || '',
            appVersion: raw.metadata?.appVersion || ''
        },
        source: 'platform_api_app_store'
    });
}

function normalizePlayStore(raw) {
    return baseMention({
        id: String(raw.id || ''),
        platform: 'play_store',
        type: 'review',
        title: '',
        text: raw.text || '',
        author: raw.author || '',
        authorUrl: '',
        url: raw.url || '',
        timestamp: safeISOString(raw.timestamp),
        engagement: {
            upvotes: raw.metadata?.thumbsUp || 0,
            downvotes: 0,
            comments: 0,
            ratio: null,
            rating: raw.rating || null
        },
        metadata: {
            appId: raw.metadata?.appId || '',
            appName: raw.metadata?.appName || '',
            appVersion: raw.metadata?.appVersion || '',
            replyDate: raw.metadata?.replyDate || null,
            replyText: raw.metadata?.replyText || ''
        },
        source: 'platform_api_play_store'
    });
}

function normalizeHackerNews(raw) {
    const isComment = raw.type === 'comment';

    return baseMention({
        id: String(raw.id || ''),
        platform: 'hackernews',
        type: isComment ? 'comment' : 'post',
        title: raw.title || '',
        text: raw.text || '',
        author: raw.author || '',
        authorUrl: raw.author ? `https://news.ycombinator.com/user?id=${raw.author}` : '',
        url: raw.url || '',
        timestamp: safeISOString(raw.timestamp),
        engagement: {
            upvotes: raw.score || 0,
            downvotes: 0,
            comments: raw.numComments || 0,
            ratio: null,
            rating: null
        },
        metadata: {
            storyId: raw.metadata?.storyId || null,
            parentId: raw.metadata?.parentId || null,
            points: raw.metadata?.points || 0
        },
        source: 'platform_api_hackernews'
    });
}

function normalizeGeneric(platform, raw) {
    return baseMention({
        id: String(raw.id || ''),
        platform: platform || 'unknown',
        type: raw.type || 'post',
        title: raw.title || '',
        text: raw.text || raw.body || '',
        author: raw.author || '',
        authorUrl: '',
        url: raw.url || '',
        timestamp: safeISOString(raw.timestamp),
        engagement: {
            upvotes: raw.score || raw.votesCount || raw.likeCount || 0,
            downvotes: 0,
            comments: raw.numComments || raw.commentsCount || 0,
            ratio: null,
            rating: raw.rating || null
        },
        metadata: raw.metadata || {},
        source: `platform_api_${platform || 'unknown'}`
    });
}

module.exports = {
    normalize,
    baseMention
};
