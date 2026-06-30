/**
 * Platform Integrations Routes
 * API endpoints for managing and triggering platform-specific scans
 */

const express = require('express');
const router = express.Router();
const PlatformIntegrationManager = require('../integrations/platformIntegrationManager');
const { supabase } = require('../supabase');
const logger = require('../utils/logger');

// Initialize integration manager (singleton)
let integrationManager;
try {
    integrationManager = new PlatformIntegrationManager();
} catch (error) {
    logger.error('Failed to initialize PlatformIntegrationManager', { error: error.message });
    integrationManager = null;
}

/**
 * GET /api/integrations/status
 * Returns configuration status of all platform integrations + search providers
 */
router.get('/status', async (req, res) => {
    try {
        const status = {
            searchProviders: {
                googleCSE: {
                    configured: !!(process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID &&
                        process.env.GOOGLE_CSE_API_KEY !== 'your_google_cse_api_key'),
                    type: 'primary',
                    cost: '$5 per 1000 queries',
                    quota: '100/day (free) or 10,000/day (paid)'
                },
                bing: {
                    configured: !!(process.env.BING_API_KEY && process.env.BING_API_KEY !== 'your_bing_api_key'),
                    type: 'fallback',
                    cost: '$7 per 1000 queries'
                },
                serpapi: {
                    configured: !!(process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key'),
                    type: 'fallback',
                    cost: '$50 per 5000 queries'
                }
            },
            platformIntegrations: integrationManager ? integrationManager.getAllStatus() : {
                error: 'Platform Integration Manager failed to initialize'
            },
            summary: {
                searchProvidersConfigured: [
                    process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_API_KEY !== 'your_google_cse_api_key' ? 'google' : null,
                    process.env.BING_API_KEY && process.env.BING_API_KEY !== 'your_bing_api_key' ? 'bing' : null,
                    process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key' ? 'serpapi' : null,
                ].filter(Boolean),
                platformsConfigured: integrationManager ? integrationManager.getAvailableIntegrations() : [],
                usingMockData: !(process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_API_KEY !== 'your_google_cse_api_key')
            }
        };

        res.json({ success: true, ...status });
    } catch (error) {
        logger.error('Error fetching integration status', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch integration status' });
    }
});

/**
 * GET /api/integrations/health
 * Combined health of search providers + platform integrations
 */
router.get('/health', async (req, res) => {
    try {
        const SearchProviderManager = require('../searchProviderManager');
        let providerHealth = {};
        try {
            const providerManager = new SearchProviderManager();
            providerHealth = providerManager.getProviderHealth();
        } catch (e) {
            providerHealth = { error: 'No search providers configured' };
        }

        const platformStatus = integrationManager ? integrationManager.getAllStatus() : {};
        const circuitBreakerHealth = integrationManager ? integrationManager.getIntegrationHealth() : {};

        res.json({
            success: true,
            searchProviders: providerHealth,
            platforms: platformStatus,
            circuitBreakers: circuitBreakerHealth,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error fetching health', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch health status' });
    }
});

/**
 * POST /api/integrations/scan/:platform
 * Trigger a scan on a specific platform
 * Body: { brandName: string, options?: object }
 */
router.post('/scan/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        const { brandName, options = {} } = req.body;

        if (!brandName) {
            return res.status(400).json({ error: 'brandName is required' });
        }

        if (!integrationManager) {
            return res.status(503).json({ error: 'Platform Integration Manager not initialized' });
        }

        const validPlatforms = ['reddit', 'youtube', 'producthunt', 'appstore', 'playstore', 'hackernews'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                error: `Invalid platform: ${platform}`,
                validPlatforms
            });
        }

        // Check if platform is configured
        if (!integrationManager.isPlatformAvailable(platform) && platform !== 'appstore') {
            return res.status(400).json({
                error: `Platform ${platform} is not configured. Add the required API keys to server/.env`,
                requiredKeys: getRequiredKeys(platform)
            });
        }

        logger.info(`Manual scan triggered for ${platform}`, { brandName, userId: req.user?.uid });

        // Create scan job record
        const scanJobId = await createScanJob(req.user?.uid, brandName, platform);

        // Update status to running
        await updateScanJob(scanJobId, { status: 'running', started_at: new Date().toISOString() });

        const startTime = Date.now();

        // Execute platform scan
        const mentions = await integrationManager.searchPlatform(platform, brandName, options);

        const duration = Date.now() - startTime;

        // Update scan job with results
        await updateScanJob(scanJobId, {
            status: 'completed',
            results_count: mentions.length,
            platforms_scanned: [platform],
            duration_ms: duration,
            completed_at: new Date().toISOString()
        });

        res.json({
            success: true,
            scanJobId,
            platform,
            brandName,
            mentionsFound: mentions.length,
            durationMs: duration,
            mentions: mentions.slice(0, 20), // Return first 20 for preview
            totalAvailable: mentions.length
        });

    } catch (error) {
        logger.error('Platform scan failed', { error: error.message, platform: req.params.platform });
        res.status(500).json({
            error: 'Platform scan failed',
            details: error.message,
            platform: req.params.platform
        });
    }
});

/**
 * POST /api/integrations/scan-all
 * Trigger scans across all configured platforms
 * Body: { brandName: string, platforms?: string[] }
 */
router.post('/scan-all', async (req, res) => {
    try {
        const { brandName, platforms } = req.body;

        if (!brandName) {
            return res.status(400).json({ error: 'brandName is required' });
        }

        if (!integrationManager) {
            return res.status(503).json({ error: 'Platform Integration Manager not initialized' });
        }

        logger.info('Multi-platform scan triggered', { brandName, platforms, userId: req.user?.uid });

        // Create scan job record
        const scanJobId = await createScanJob(req.user?.uid, brandName, 'full');
        await updateScanJob(scanJobId, { status: 'running', started_at: new Date().toISOString() });

        const startTime = Date.now();

        // Execute scan across all or specified platforms
        const results = await integrationManager.searchAllPlatforms(brandName, {
            platforms: platforms || undefined,
            includeComments: true,
            limit: 100
        });

        const duration = Date.now() - startTime;

        // Update scan job
        await updateScanJob(scanJobId, {
            status: 'completed',
            results_count: results.summary.totalMentions,
            platforms_scanned: Object.keys(results.byPlatform),
            errors: results.summary.errors || {},
            duration_ms: duration,
            completed_at: new Date().toISOString()
        });

        res.json({
            success: true,
            scanJobId,
            brandName,
            summary: results.summary,
            durationMs: duration,
            mentions: results.mentions.slice(0, 30), // Preview
            totalAvailable: results.mentions.length
        });

    } catch (error) {
        logger.error('Multi-platform scan failed', { error: error.message });
        res.status(500).json({
            error: 'Multi-platform scan failed',
            details: error.message
        });
    }
});

/**
 * GET /api/integrations/scan-history
 * Get recent scan job history for the current user
 */
router.get('/scan-history', async (req, res) => {
    try {
        const userId = req.user?.uid;
        const limit = parseInt(req.query.limit) || 20;

        const { data: jobs, error } = await supabase
            .from('scan_jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            // Table might not exist yet — return empty
            logger.warn('scan_jobs query failed (table may not exist)', { error: error.message });
            return res.json({ success: true, jobs: [], message: 'Scan history not available yet' });
        }

        res.json({ success: true, jobs: jobs || [] });
    } catch (error) {
        logger.error('Error fetching scan history', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch scan history' });
    }
});

// --- Helper Functions ---

/**
 * Create a scan job record in Supabase
 */
async function createScanJob(userId, brandName, scanType) {
    try {
        const { data, error } = await supabase
            .from('scan_jobs')
            .insert({
                user_id: userId,
                brand_name: brandName,
                scan_type: scanType,
                status: 'pending'
            })
            .select('id')
            .single();

        if (error) {
            logger.warn('Failed to create scan job record', { error: error.message });
            return null;
        }
        return data.id;
    } catch (err) {
        logger.warn('scan_jobs table may not exist yet', { error: err.message });
        return null;
    }
}

/**
 * Update a scan job record
 */
async function updateScanJob(jobId, updates) {
    if (!jobId) return;
    try {
        await supabase
            .from('scan_jobs')
            .update(updates)
            .eq('id', jobId);
    } catch (err) {
        logger.warn('Failed to update scan job', { error: err.message });
    }
}

/**
 * Get required API keys for a platform
 */
function getRequiredKeys(platform) {
    const keyMap = {
        reddit: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_REFRESH_TOKEN'],
        youtube: ['YOUTUBE_API_KEY'],
        producthunt: ['PRODUCT_HUNT_TOKEN'],
        appstore: [], // No keys needed
        playstore: [], // No keys needed — uses web scraping
        hackernews: [] // No keys needed
    };
    return keyMap[platform] || [];
}

module.exports = router;
