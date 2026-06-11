/**
 * Event Analysis API Routes
 */

const express = require('express');
const router = express.Router();
const EventAnalyzer = require('../eventAnalyzer');
const logger = require('../utils/logger');

const eventAnalyzer = new EventAnalyzer();

/**
 * Create a new event
 * POST /api/events
 */
router.post('/', async (req, res) => {
    try {
        const {
            brandId,
            userId,
            eventName,
            eventDate,
            eventType,
            preEventDays,
            postEventDays,
            description
        } = req.body;

        // Validate required fields
        if (!brandId || !userId || !eventName || !eventDate) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['brandId', 'userId', 'eventName', 'eventDate']
            });
        }

        const event = await eventAnalyzer.createEvent({
            brandId,
            userId,
            eventName,
            eventDate,
            eventType,
            preEventDays,
            postEventDays,
            description
        });

        logger.info('Event created via API', { eventId: event.eventId, eventName });

        res.status(201).json({
            success: true,
            event
        });
    } catch (error) {
        logger.error('Failed to create event', { error: error.message });
        res.status(500).json({
            error: 'Failed to create event',
            message: error.message
        });
    }
});

/**
 * Get event by ID
 * GET /api/events/:eventId
 */
router.get('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await eventAnalyzer.getEvent(eventId);

        res.json({
            success: true,
            event
        });
    } catch (error) {
        logger.error('Failed to get event', { error: error.message, eventId: req.params.eventId });

        if (error.message === 'Event not found') {
            return res.status(404).json({
                error: 'Event not found'
            });
        }

        res.status(500).json({
            error: 'Failed to get event',
            message: error.message
        });
    }
});

/**
 * List events for a brand
 * GET /api/brands/:brandId/events
 */
router.get('/brands/:brandId', async (req, res) => {
    try {
        const { brandId } = req.params;
        const { limit } = req.query;

        const events = await eventAnalyzer.listBrandEvents(brandId, {
            limit: limit ? parseInt(limit) : undefined
        });

        res.json({
            success: true,
            events,
            count: events.length
        });
    } catch (error) {
        logger.error('Failed to list events', { error: error.message, brandId: req.params.brandId });
        res.status(500).json({
            error: 'Failed to list events',
            message: error.message
        });
    }
});

/**
 * Trigger event analysis
 * POST /api/events/:eventId/analyze
 */
router.post('/:eventId/analyze', async (req, res) => {
    try {
        const { eventId } = req.params;
        const analysis = await eventAnalyzer.analyzeEvent(eventId);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        logger.error('Failed to analyze event', { error: error.message, eventId: req.params.eventId });
        res.status(500).json({
            error: 'Failed to analyze event',
            message: error.message
        });
    }
});

/**
 * Compare multiple events
 * GET /api/events/compare?eventIds=id1,id2,id3
 */
router.get('/compare', async (req, res) => {
    try {
        const { eventIds } = req.query;

        if (!eventIds) {
            return res.status(400).json({
                error: 'Missing eventIds parameter',
                example: '/api/events/compare?eventIds=id1,id2,id3'
            });
        }

        const eventIdArray = eventIds.split(',').map(id => id.trim());

        if (eventIdArray.length < 2) {
            return res.status(400).json({
                error: 'At least 2 event IDs required for comparison'
            });
        }

        const comparison = await eventAnalyzer.compareEvents(eventIdArray);

        res.json({
            success: true,
            comparison
        });
    } catch (error) {
        logger.error('Failed to compare events', { error: error.message });
        res.status(500).json({
            error: 'Failed to compare events',
            message: error.message
        });
    }
});

/**
 * Delete an event
 * DELETE /api/events/:eventId
 */
router.delete('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        await eventAnalyzer.deleteEvent(eventId);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        logger.error('Failed to delete event', { error: error.message, eventId: req.params.eventId });
        res.status(500).json({
            error: 'Failed to delete event',
            message: error.message
        });
    }
});

module.exports = router;
