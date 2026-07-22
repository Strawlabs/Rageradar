/**
 * Plan Enforcement Middleware
 * Enforce feature access based on user's subscription plan
 */

const { supabase } = require('../supabase');
const logger = require('../utils/logger');

// Plan feature definitions
const PLAN_FEATURES = {
    trial: {
        maxAnalyses: 1,
        multiEmotion: false,
        platforms: ['google'],
        integrations: [],
        eventTracking: false,
        themeExtraction: false,
        trendlineDays: 0,
        insights: [],
        dataRetentionDays: 3,
        apiAccess: false,
        exportFormats: [],
        trialDurationDays: 3
    },

    free: {
        maxAnalyses: 5,
        multiEmotion: false,
        platforms: ['google'],
        integrations: [],
        eventTracking: false,
        themeExtraction: false,
        trendlineDays: 0,
        insights: [],
        dataRetentionDays: 7,
        apiAccess: false,
        exportFormats: []
    },

    starter: {
        maxAnalyses: 50,
        multiEmotion: true,
        platforms: ['google', 'bing'],
        integrations: ['reddit'],
        eventTracking: false,
        themeExtraction: false,
        trendlineDays: 0,
        insights: ['spike', 'trend', 'volume', 'platform', 'emotion'],
        dataRetentionDays: 30,
        apiAccess: false,
        exportFormats: ['csv']
    },

    pro: {
        maxAnalyses: -1, // unlimited
        multiEmotion: true,
        platforms: ['google', 'bing', 'serpapi'],
        integrations: ['reddit', 'youtube', 'producthunt', 'appstore'],
        eventTracking: true,
        themeExtraction: true,
        trendlineDays: 30,
        insights: 'all',
        dataRetentionDays: 90,
        apiAccess: true,
        apiQuota: 100000,
        exportFormats: ['csv', 'pdf']
    },

    enterprise: {
        maxAnalyses: -1,
        multiEmotion: true,
        customModels: true,
        platforms: 'all',
        integrations: 'all',
        eventTracking: true,
        themeExtraction: true,
        trendlineDays: 365,
        insights: 'all',
        dataRetentionDays: 365,
        apiAccess: true,
        apiQuota: -1,
        exportFormats: ['csv', 'pdf', 'json', 'xlsx'],
        whiteLabel: true,
        sso: true,
        teamMembers: -1
    }
};

/**
 * Get user's plan from database
 * @param {string} userId - User ID
 * @returns {Promise<string>} Plan name
 */
async function getUserPlan(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('plan')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return 'free';
        }

        return data.plan || 'free';
    } catch (error) {
        logger.error('Failed to get user plan', { error: error.message, userId });
        return 'free'; // Default to free on error
    }
}

/**
 * Get plan features
 * @param {string} plan - Plan name
 * @returns {object} Plan features
 */
function getPlanFeatures(plan) {
    return PLAN_FEATURES[plan] || PLAN_FEATURES.free;
}

/**
 * Check if user has access to a feature
 * @param {string} userId - User ID
 * @param {string} feature - Feature name
 * @returns {Promise<boolean>} Has access
 */
async function hasFeatureAccess(userId, feature) {
    const plan = await getUserPlan(userId);
    const features = getPlanFeatures(plan);

    // Check specific features
    switch (feature) {
        case 'multiEmotion':
            return features.multiEmotion === true;

        case 'eventTracking':
            return features.eventTracking === true;

        case 'themeExtraction':
            return features.themeExtraction === true;

        case 'apiAccess':
            return features.apiAccess === true;

        default:
            return false;
    }
}

/**
 * Check if user can perform analysis
 * @param {string} userId - User ID
 * @returns {Promise<object>} Can analyze and remaining count
 */
async function canPerformAnalysis(userId) {
    const plan = await getUserPlan(userId);
    const features = getPlanFeatures(plan);

    // Unlimited for pro/enterprise
    if (features.maxAnalyses === -1) {
        return { allowed: true, remaining: -1 };
    }

    // Check usage for free/starter
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usageRows, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startOfMonth);

    const currentUsage = usageRows ? usageRows.length : 0;
    const remaining = features.maxAnalyses - currentUsage;

    return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        limit: features.maxAnalyses,
        used: currentUsage
    };
}

/**
 * Middleware to enforce plan limits
 */
const enforcePlanLimits = async (req, res, next) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        // Check analysis limit
        const analysisCheck = await canPerformAnalysis(userId);

        if (!analysisCheck.allowed) {
            return res.status(403).json({
                error: 'Analysis limit exceeded',
                message: `You have used all ${analysisCheck.limit} analyses for this month. Upgrade to continue.`,
                upgrade: true,
                usage: {
                    used: analysisCheck.used,
                    limit: analysisCheck.limit
                }
            });
        }

        // Attach plan info to request
        req.userPlan = await getUserPlan(userId);
        req.planFeatures = getPlanFeatures(req.userPlan);
        req.analysisRemaining = analysisCheck.remaining;

        next();
    } catch (error) {
        logger.error('Plan enforcement failed', { error: error.message });
        next(error);
    }
};

/**
 * Middleware to check specific feature access
 * @param {string} feature - Feature name
 */
const requireFeature = (feature) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.uid;

            if (!userId) {
                return res.status(401).json({
                    error: 'Authentication required'
                });
            }

            const hasAccess = await hasFeatureAccess(userId, feature);

            if (!hasAccess) {
                const plan = await getUserPlan(userId);

                return res.status(403).json({
                    error: 'Feature not available',
                    message: `${feature} is not available on your current plan (${plan}). Upgrade to access this feature.`,
                    upgrade: true,
                    feature,
                    currentPlan: plan
                });
            }

            next();
        } catch (error) {
            logger.error('Feature check failed', { error: error.message, feature });
            next(error);
        }
    };
};

/**
 * Record usage
 * @param {string} userId - User ID
 * @param {string} type - Usage type
 */
async function recordUsage(userId, type = 'analysis') {
    try {
        await supabase
            .from('usage')
            .insert({
                user_id: userId,
                type,
                timestamp: new Date().toISOString()
            });

        logger.info('Usage recorded', { userId, type });
    } catch (error) {
        logger.error('Failed to record usage', { error: error.message, userId, type });
    }
}

module.exports = {
    PLAN_FEATURES,
    getUserPlan,
    getPlanFeatures,
    hasFeatureAccess,
    canPerformAnalysis,
    enforcePlanLimits,
    requireFeature,
    recordUsage
};
