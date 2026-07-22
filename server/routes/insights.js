/**
 * Insights API Routes
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const InsightsGenerator = require('../utils/insightsGenerator');
const TrendlineAnalyzer = require('../trendlineAnalyzer');
const ThemeExtractor = require('../utils/themeExtractor');
const logger = require('../utils/logger');

const insightsGenerator = new InsightsGenerator();
const trendlineAnalyzer = new TrendlineAnalyzer();
const themeExtractor = new ThemeExtractor();

// Authentication middleware (reuse from main server)
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = {
            uid: data.user.id,
            email: data.user.email,
            role: data.user.role || 'user',
            ...data.user
        };
        next();
    } catch (error) {
        logger.error('Authentication error:', { error: error.message });
        res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Generate insights for a brand
 * POST /api/insights/generate
 */
router.post('/generate', authenticateUser, async (req, res) => {
    try {
        const {
            brandId,
            currentAnalysisId,
            previousAnalysisId,
            includeTrendline = true,
            includeThemes = true,
            trendlinePeriod = 30
        } = req.body;

        if (!brandId) {
            return res.status(400).json({
                error: 'Missing required field: brandId'
            });
        }

        logger.info('Generating insights', { brandId });

        // Gather data for insight generation
        const data = {};

        // Get current and previous analyses if provided
        if (currentAnalysisId) {
            data.currentAnalysis = await getAnalysisById(currentAnalysisId);
        }

        if (previousAnalysisId) {
            data.previousAnalysis = await getAnalysisById(previousAnalysisId);
        }

        // Calculate trendline
        if (includeTrendline) {
            data.trendline = await trendlineAnalyzer.calculateTrendline(brandId, {
                period: trendlinePeriod,
                granularity: req.query.granularity || 'day'
            });
        }

        // Extract themes
        const mentionsList = data.currentAnalysis ? (data.currentAnalysis.search_results || data.currentAnalysis.mentions) : null;
        if (includeThemes && data.currentAnalysis && mentionsList) {
            data.themes = await themeExtractor.extractThemes(mentionsList);
        }

        // Generate insights
        const insights = await insightsGenerator.generateInsights(data);
        const summary = insightsGenerator.generateSummary(insights);

        res.json({
            success: true,
            insights,
            summary,
            metadata: {
                brandId,
                generatedAt: new Date(),
                dataIncluded: {
                    currentAnalysis: !!data.currentAnalysis,
                    previousAnalysis: !!data.previousAnalysis,
                    trendline: !!data.trendline,
                    themes: !!data.themes
                }
            }
        });

    } catch (error) {
        logger.error('Failed to generate insights', { error: error.message });
        res.status(500).json({
            error: 'Failed to generate insights',
            message: error.message
        });
    }
});

/**
 * Get trendline for a brand
 * GET /api/insights/trendline/:brandId
 */
router.get('/trendline/:brandId', authenticateUser, async (req, res) => {
    try {
        const { brandId } = req.params;
        const { period = 30, granularity = 'day', rollingWindow, minSampleThreshold, minDeviationJump } = req.query;

        const trendline = await trendlineAnalyzer.calculateTrendline(brandId, {
            period: parseInt(period) || 30,
            granularity,
            rollingWindow: rollingWindow ? parseInt(rollingWindow) : undefined,
            minSampleThreshold: minSampleThreshold ? parseInt(minSampleThreshold) : undefined,
            minDeviationJump: minDeviationJump ? parseInt(minDeviationJump) : undefined
        });

        res.json({
            success: true,
            trendline
        });

    } catch (error) {
        logger.error('Failed to get trendline', { error: error.message });
        res.status(500).json({
            error: 'Failed to get trendline',
            message: error.message
        });
    }
});

/**
 * Extract themes from mentions
 * POST /api/insights/themes
 */
router.post('/themes', authenticateUser, async (req, res) => {
    try {
        const { mentions, minRageIndex = 60, topN = 10 } = req.body;

        if (!mentions || !Array.isArray(mentions)) {
            return res.status(400).json({
                error: 'Missing or invalid mentions array'
            });
        }

        const themes = await themeExtractor.extractThemes(mentions, {
            minRageIndex,
            topN
        });

        res.json({
            success: true,
            themes,
            count: themes.length
        });

    } catch (error) {
        logger.error('Failed to extract themes', { error: error.message });
        res.status(500).json({
            error: 'Failed to extract themes',
            message: error.message
        });
    }
});

/**
 * Get all insights for a brand
 * GET /api/insights/brands/:brandId
 */
router.get('/brands/:brandId', authenticateUser, async (req, res) => {
    try {
        const { brandId } = req.params;
        const userId = req.user.uid;

        // Get latest analysis for this brand
        const { data: analyses, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', userId)
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error || !analyses || analyses.length === 0) {
            return res.status(404).json({
                error: 'No analysis found for this brand'
            });
        }

        const analysis = analyses[0];

        res.json({
            success: true,
            insights: analysis.insights || [],
            themes: analysis.themes || [],
            trendlineSummary: analysis.trendline_summary || null,
            brandName: analysis.brand_name,
            lastUpdated: analysis.created_at
        });

    } catch (error) {
        logger.error('Failed to get brand insights', { error: error.message });
        res.status(500).json({
            error: 'Failed to get brand insights',
            message: error.message
        });
    }
});

/**
 * Get themes for a brand
 * GET /api/insights/brands/:brandId/themes
 */
router.get('/brands/:brandId/themes', authenticateUser, async (req, res) => {
    try {
        const { brandId } = req.params;
        const userId = req.user.uid;

        // Get all analyses for this brand
        const { data: analyses, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', userId)
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error || !analyses || analyses.length === 0) {
            return res.status(404).json({
                error: 'No analysis found for this brand'
            });
        }

        // Aggregate themes from all analyses
        const allThemes = [];
        analyses.forEach(row => {
            if (row.themes && Array.isArray(row.themes)) {
                allThemes.push(...row.themes);
            }
        });

        // Deduplicate and sort by frequency
        const themeMap = new Map();
        allThemes.forEach(theme => {
            const key = theme.theme;
            if (themeMap.has(key)) {
                const existing = themeMap.get(key);
                existing.frequency += theme.frequency;
                existing.mentionCount += theme.mentionCount;
            } else {
                themeMap.set(key, { ...theme });
            }
        });

        const themes = Array.from(themeMap.values())
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);

        res.json({
            success: true,
            themes,
            count: themes.length
        });

    } catch (error) {
        logger.error('Failed to get brand themes', { error: error.message });
        res.status(500).json({
            error: 'Failed to get brand themes',
            message: error.message
        });
    }
});

// Helper function to get analysis by ID
async function getAnalysisById(analysisId) {
    try {
        const { data, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('id', analysisId)
            .single();

        if (error || !data) {
            return null;
        }
        return data;
    } catch (error) {
        logger.error('Failed to get analysis by ID', { error: error.message, analysisId });
        return null;
    }
}

module.exports = router;
