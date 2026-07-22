/**
 * AI Intelligence Route Handler
 * Implements conversational Ask RageRadar, AI recommendations, and executive summaries.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const ChatEngine = require('../ai/askRageRadar/chatEngine');
const AutonomousAnalyst = require('../ai/autonomousAnalyst/autonomousAnalyst');
const logger = require('../utils/logger');

const chatEngine = new ChatEngine();
const autonomousAnalyst = new AutonomousAnalyst();

// Authentication middleware (reused from insights)
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
 * Get LLM-powered insights for a brand
 * GET /api/ai/insights/:brandId
 */
router.get('/insights/:brandId', authenticateUser, async (req, res) => {
    try {
        const { brandId } = req.params;
        const userId = req.user.uid;

        const { data: analyses, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', userId)
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error || !analyses || analyses.length === 0) {
            return res.status(404).json({ error: 'No brand analysis found' });
        }

        const analysis = analyses[0];
        const rawInsights = analysis.insights;
        const insightsList = Array.isArray(rawInsights) ? rawInsights : (rawInsights?.insights || []);

        res.json({
            success: true,
            insights: insightsList,
            brandName: analysis.brand_name,
            lastUpdated: analysis.created_at
        });
    } catch (err) {
        logger.error('Failed to retrieve AI insights', { error: err.message });
        res.status(500).json({ error: 'Failed to retrieve AI insights', details: err.message });
    }
});

/**
 * Get C-level Executive Summary Card
 * GET /api/ai/executive-summary/:brandId
 */
router.get('/executive-summary/:brandId', authenticateUser, async (req, res) => {
    try {
        const { brandId } = req.params;
        const userId = req.user.uid;

        const { data: analyses, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', userId)
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error || !analyses || analyses.length === 0) {
            return res.status(404).json({ error: 'No brand analysis found' });
        }

        const analysis = analyses[0];
        const rawInsights = analysis.insights;
        const summary = Array.isArray(rawInsights) ? 'No summary available.' : (rawInsights?.executiveSummary || 'No summary available.');

        res.json({
            success: true,
            executiveSummary: summary,
            brandName: analysis.brand_name,
            lastUpdated: analysis.created_at
        });
    } catch (err) {
        logger.error('Failed to retrieve Executive Summary', { error: err.message });
        res.status(500).json({ error: 'Failed to retrieve Executive Summary', details: err.message });
    }
});

/**
 * Get Action Center Recommendations
 * GET /api/ai/recommendations/:brandId
 */
router.get('/recommendations/:brandId', authenticateUser, async (req, res) => {
    try {
        const { brandId } = req.params;
        const userId = req.user.uid;

        const { data: analyses, error } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', userId)
            .eq('brand_id', brandId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error || !analyses || analyses.length === 0) {
            return res.status(404).json({ error: 'No brand analysis found' });
        }

        const analysis = analyses[0];
        const rawInsights = analysis.insights;
        const recommendations = Array.isArray(rawInsights) ? [] : (rawInsights?.recommendations || []);

        res.json({
            success: true,
            recommendations,
            brandName: analysis.brand_name,
            lastUpdated: analysis.created_at
        });
    } catch (err) {
        logger.error('Failed to retrieve recommendations', { error: err.message });
        res.status(500).json({ error: 'Failed to retrieve recommendations', details: err.message });
    }
});

/**
 * Ask RageRadar Conversational Endpoint
 * POST /api/ai/ask
 */
router.post('/ask', authenticateUser, async (req, res) => {
    try {
        const { brandId, message, history = [] } = req.body;

        if (!brandId || !message) {
            return res.status(400).json({ error: 'Missing required parameters: brandId, message' });
        }

        logger.info(`AskRageRadar: Question received for brand: ${brandId}`);
        const result = await chatEngine.answerQuestion(brandId, message, history);

        if (typeof result === 'object' && result !== null && result.answer) {
            res.json({
                success: true,
                answer: result.answer,
                evidence: result.evidence || [],
                suggestedQuestions: result.suggestedQuestions || []
            });
        } else {
            res.json({
                success: true,
                answer: typeof result === 'string' ? result : 'Analysis complete.',
                evidence: [],
                suggestedQuestions: []
            });
        }
    } catch (err) {
        logger.error('Failed to process conversation question', { error: err.message });
        res.status(500).json({ error: 'Failed to process question', details: err.message });
    }
});

/**
 * Autonomous AI Brand Analyst Endpoint
 * POST /api/ai/autonomous/analyze
 */
router.post('/autonomous/analyze', authenticateUser, async (req, res) => {
    try {
        const { brandId, focusArea } = req.body;

        if (!brandId) {
            return res.status(400).json({ error: 'Missing required parameter: brandId' });
        }

        logger.info(`AutonomousAnalyst: Briefing requested for brand: ${brandId}`);
        const briefing = await autonomousAnalyst.runAutonomousBriefing(brandId, {
            focusArea,
            userId: req.user.uid
        });

        res.json({
            success: true,
            briefing
        });
    } catch (err) {
        logger.error('Failed to run autonomous briefing', { error: err.message });
        res.status(500).json({ error: 'Failed to run autonomous analyst', details: err.message });
    }
});

module.exports = router;
