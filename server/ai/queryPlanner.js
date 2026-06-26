/**
 * AI Query Planner (Tavily-inspired)
 * Generates platform-aware, intent-specific search queries to maximize mention coverage.
 * 
 * Why this improves accuracy:
 * - Expands a single brand name into 5-8 targeted search queries.
 * - Targets specific negative intents (complaints, outages, bugs).
 * - Generates platform-specific queries tailored for Reddit, YouTube, App Stores, etc.
 * - Dynamically includes competitor comparison queries to capture migration discussions.
 */

const logger = require('../utils/logger');

class QueryPlanner {
    constructor() {
        // Common subreddits where tech/SaaS discussions happen
        this.targetSubreddits = ['webdev', 'startups', 'SaaS', 'technology', 'sysadmin'];
    }

    /**
     * Generate expanded queries for a brand
     * @param {object} params
     * @param {string} params.brandName - The brand to analyze (e.g. "Stripe")
     * @param {string} [params.website] - The website URL (e.g. "stripe.com")
     * @param {Array<string>} [params.competitors=[]] - List of competitors (e.g. ["Square"])
     * @returns {object} Platform-specific expanded queries
     */
    planQueries({ brandName, website = '', competitors = [] }) {
        if (!brandName) {
            logger.warn('QueryPlanner: Brand name is missing. Returning empty query plan.');
            return { web: [], reddit: [], youtube: [], appstore: [] };
        }

        const currentYear = new Date().getFullYear();
        const queries = {
            web: [],
            reddit: [],
            youtube: [],
            appstore: []
        };

        const cleanBrand = brandName.trim();

        // 1. Web Queries (Google CSE/Bing)
        // Primary brand query
        queries.web.push(cleanBrand);
        
        // Intent: Complaints & Issues
        queries.web.push(`"${cleanBrand}" complaints ${currentYear}`);
        queries.web.push(`"${cleanBrand}" problem OR issue OR broken OR frustrated`);
        queries.web.push(`"${cleanBrand}" payment issues problems`);
        
        // Intent: Reviews & Customer Experience
        queries.web.push(`"${cleanBrand}" review customer experience`);

        // Intent: Competitor Comparisons (if competitors provided)
        if (Array.isArray(competitors) && competitors.length > 0) {
            competitors.slice(0, 2).forEach(comp => {
                queries.web.push(`"${cleanBrand}" vs "${comp.trim()}" comparison`);
            });
        } else {
            // Default general comparison
            queries.web.push(`"${cleanBrand}" alternatives`);
        }

        // 2. Reddit Queries
        // Simple search
        queries.reddit.push(cleanBrand);
        // Reddit negative sentiment search
        queries.reddit.push(`"${cleanBrand}" down OR fail OR bug OR error`);
        
        // Target subreddits queries (e.g., "Stripe subreddit:webdev")
        this.targetSubreddits.slice(0, 3).forEach(sub => {
            queries.reddit.push(`"${cleanBrand}" subreddit:${sub}`);
        });

        // 3. YouTube Queries
        queries.youtube.push(`"${cleanBrand}" review ${currentYear}`);
        queries.youtube.push(`"${cleanBrand}" tutorial problems`);
        queries.youtube.push(`"${cleanBrand}" issues`);

        // 4. App Store Queries (dashboard/app specific)
        queries.appstore.push(`${cleanBrand} Dashboard`);
        queries.appstore.push(`${cleanBrand} Mobile`);

        logger.info(`QueryPlanner: Generated query plan for "${cleanBrand}"`, {
            webCount: queries.web.length,
            redditCount: queries.reddit.length,
            youtubeCount: queries.youtube.length,
            appStoreCount: queries.appstore.length
        });

        return queries;
    }
}

module.exports = QueryPlanner;
