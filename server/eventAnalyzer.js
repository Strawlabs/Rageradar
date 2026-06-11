/**
 * Event Analysis Module
 * Track emotional changes around specific events (launches, crises, announcements)
 */

const admin = require('firebase-admin');
const logger = require('./utils/logger');
const RageIndexCalculator = require('./utils/rageIndexCalculator');

class EventAnalyzer {
    constructor() {
        this.db = admin.firestore();
        this.rageCalculator = new RageIndexCalculator();

        // Event type configurations
        this.eventTypes = {
            launch: { defaultPreDays: 7, defaultPostDays: 7, color: '#3B82F6' },
            crisis: { defaultPreDays: 3, defaultPostDays: 14, color: '#DC2626' },
            announcement: { defaultPreDays: 7, defaultPostDays: 7, color: '#8B5CF6' },
            update: { defaultPreDays: 3, defaultPostDays: 7, color: '#10B981' },
            controversy: { defaultPreDays: 7, defaultPostDays: 14, color: '#F59E0B' },
            custom: { defaultPreDays: 7, defaultPostDays: 7, color: '#6B7280' }
        };
    }

    /**
     * Create a new event for tracking
     * @param {object} eventData - Event configuration
     * @returns {Promise<object>} Created event
     */
    async createEvent(eventData) {
        try {
            const {
                brandId,
                userId,
                eventName,
                eventDate,
                eventType = 'custom',
                preEventDays,
                postEventDays,
                description
            } = eventData;

            // Validate required fields
            if (!brandId || !userId || !eventName || !eventDate) {
                throw new Error('Missing required fields: brandId, userId, eventName, eventDate');
            }

            // Get event type config
            const typeConfig = this.eventTypes[eventType] || this.eventTypes.custom;

            // Calculate time windows
            const eventDateTime = new Date(eventDate);
            const preEventStart = new Date(eventDateTime);
            preEventStart.setDate(eventDateTime.getDate() - (preEventDays || typeConfig.defaultPreDays));

            const postEventEnd = new Date(eventDateTime);
            postEventEnd.setDate(eventDateTime.getDate() + (postEventDays || typeConfig.defaultPostDays));

            // Create event document
            const event = {
                brandId,
                userId,
                eventName,
                eventDate: admin.firestore.Timestamp.fromDate(eventDateTime),
                eventType,
                description: description || '',

                // Time windows
                preEventWindow: {
                    startDate: admin.firestore.Timestamp.fromDate(preEventStart),
                    endDate: admin.firestore.Timestamp.fromDate(eventDateTime),
                    days: preEventDays || typeConfig.defaultPreDays
                },

                postEventWindow: {
                    startDate: admin.firestore.Timestamp.fromDate(eventDateTime),
                    endDate: admin.firestore.Timestamp.fromDate(postEventEnd),
                    days: postEventDays || typeConfig.defaultPostDays
                },

                // Analysis status
                status: 'pending', // pending, analyzing, complete, failed

                // Metadata
                color: typeConfig.color,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            // Save to Firestore
            const eventRef = await this.db.collection('events').add(event);

            logger.info('Event created', {
                eventId: eventRef.id,
                eventName,
                brandId,
                eventType
            });

            // Trigger analysis
            await this.analyzeEvent(eventRef.id);

            return {
                eventId: eventRef.id,
                ...event,
                eventDate: eventDateTime,
                preEventWindow: {
                    ...event.preEventWindow,
                    startDate: preEventStart,
                    endDate: eventDateTime
                },
                postEventWindow: {
                    ...event.postEventWindow,
                    startDate: eventDateTime,
                    endDate: postEventEnd
                }
            };
        } catch (error) {
            logger.error('Failed to create event', { error: error.message, eventData });
            throw error;
        }
    }

    /**
     * Analyze an event by comparing pre/during/post periods
     * @param {string} eventId - Event ID
     * @returns {Promise<object>} Analysis results
     */
    async analyzeEvent(eventId) {
        try {
            // Get event
            const eventDoc = await this.db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                throw new Error('Event not found');
            }

            const event = { id: eventDoc.id, ...eventDoc.data() };

            // Update status
            await eventDoc.ref.update({ status: 'analyzing' });

            // Get brand mentions for each time period
            const preEventMentions = await this.getMentionsInWindow(
                event.brandId,
                event.preEventWindow.startDate.toDate(),
                event.preEventWindow.endDate.toDate()
            );

            const duringEventMentions = await this.getMentionsInWindow(
                event.brandId,
                event.eventDate.toDate(),
                new Date(event.eventDate.toDate().getTime() + 24 * 60 * 60 * 1000) // +1 day
            );

            const postEventMentions = await this.getMentionsInWindow(
                event.brandId,
                event.postEventWindow.startDate.toDate(),
                event.postEventWindow.endDate.toDate()
            );

            // Calculate rage index for each period
            const preEventAnalysis = this.rageCalculator.calculateAggregated(preEventMentions, {
                byPlatform: true,
                byTime: true,
                timeGranularity: 'day'
            });

            const duringEventAnalysis = this.rageCalculator.calculateAggregated(duringEventMentions, {
                byPlatform: true
            });

            const postEventAnalysis = this.rageCalculator.calculateAggregated(postEventMentions, {
                byPlatform: true,
                byTime: true,
                timeGranularity: 'day'
            });

            // Calculate changes
            const rageIndexChange = duringEventAnalysis.rageIndex - preEventAnalysis.rageIndex;
            const rageIndexChangePercent = preEventAnalysis.rageIndex > 0
                ? Math.round((rageIndexChange / preEventAnalysis.rageIndex) * 100)
                : 0;

            // Detect emotion shifts
            const emotionShift = this.detectEmotionShift(
                preEventAnalysis.topEmotions,
                duringEventAnalysis.topEmotions
            );

            // Extract themes from high-rage mentions
            const themes = await this.extractEventThemes(duringEventMentions);

            // Generate insights
            const insights = this.generateEventInsights({
                preEventAnalysis,
                duringEventAnalysis,
                postEventAnalysis,
                rageIndexChange,
                emotionShift,
                themes
            });

            // Save analysis results
            const analysisResults = {
                preEventWindow: {
                    startDate: event.preEventWindow.startDate,
                    endDate: event.preEventWindow.endDate,
                    mentions: preEventMentions.length,
                    rageIndex: preEventAnalysis.rageIndex,
                    severity: preEventAnalysis.severity,
                    topEmotions: preEventAnalysis.topEmotions.slice(0, 5),
                    emotionDistribution: preEventAnalysis.emotionDistribution
                },

                duringEventWindow: {
                    date: event.eventDate,
                    mentions: duringEventMentions.length,
                    rageIndex: duringEventAnalysis.rageIndex,
                    severity: duringEventAnalysis.severity,
                    topEmotions: duringEventAnalysis.topEmotions.slice(0, 5),
                    emotionDistribution: duringEventAnalysis.emotionDistribution
                },

                postEventWindow: {
                    startDate: event.postEventWindow.startDate,
                    endDate: event.postEventWindow.endDate,
                    mentions: postEventMentions.length,
                    rageIndex: postEventAnalysis.rageIndex,
                    severity: postEventAnalysis.severity,
                    topEmotions: postEventAnalysis.topEmotions.slice(0, 5),
                    emotionDistribution: postEventAnalysis.emotionDistribution,
                    trendline: postEventAnalysis.timeBreakdown
                },

                // Changes and insights
                changes: {
                    rageIndexChange,
                    rageIndexChangePercent,
                    mentionVolumeChange: duringEventMentions.length - preEventMentions.length,
                    emotionShift,
                    severityChange: `${preEventAnalysis.severity} → ${duringEventAnalysis.severity}`
                },

                themes,
                insights,

                // Metadata
                analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'complete'
            };

            // Update event with analysis
            await eventDoc.ref.update({
                analysis: analysisResults,
                status: 'complete',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            logger.info('Event analysis complete', {
                eventId,
                rageIndexChange,
                emotionShift: emotionShift.primary
            });

            return analysisResults;
        } catch (error) {
            logger.error('Event analysis failed', { error: error.message, eventId });

            // Update status to failed
            await this.db.collection('events').doc(eventId).update({
                status: 'failed',
                error: error.message,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            throw error;
        }
    }

    /**
     * Get mentions within a time window
     * @param {string} brandId - Brand ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array>} Mentions
     */
    async getMentionsInWindow(brandId, startDate, endDate) {
        try {
            const snapshot = await this.db.collection('analyses')
                .where('brandId', '==', brandId)
                .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
                .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(endDate))
                .get();

            const mentions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.mentions && Array.isArray(data.mentions)) {
                    mentions.push(...data.mentions.map(m => ({
                        ...m,
                        analysisId: doc.id,
                        timestamp: data.createdAt.toDate()
                    })));
                }
            });

            return mentions;
        } catch (error) {
            logger.error('Failed to get mentions', { error: error.message, brandId });
            return [];
        }
    }

    /**
     * Detect emotion shift between periods
     * @param {Array} preEmotions - Pre-event top emotions
     * @param {Array} duringEmotions - During-event top emotions
     * @returns {object} Emotion shift data
     */
    detectEmotionShift(preEmotions, duringEmotions) {
        const prePrimary = preEmotions[0]?.emotion || 'neutral';
        const duringPrimary = duringEmotions[0]?.emotion || 'neutral';

        const shift = {
            primary: `${prePrimary} → ${duringPrimary}`,
            changed: prePrimary !== duringPrimary,
            preEmotion: prePrimary,
            duringEmotion: duringPrimary,
            newEmotions: [],
            disappearedEmotions: []
        };

        // Find new emotions
        const preEmotionSet = new Set(preEmotions.map(e => e.emotion));
        const duringEmotionSet = new Set(duringEmotions.map(e => e.emotion));

        duringEmotions.forEach(e => {
            if (!preEmotionSet.has(e.emotion)) {
                shift.newEmotions.push(e.emotion);
            }
        });

        preEmotions.forEach(e => {
            if (!duringEmotionSet.has(e.emotion)) {
                shift.disappearedEmotions.push(e.emotion);
            }
        });

        return shift;
    }

    /**
     * Extract themes from event mentions
     * @param {Array} mentions - Event mentions
     * @returns {Promise<Array>} Extracted themes
     */
    async extractEventThemes(mentions) {
        // Simple keyword extraction (can be enhanced with NLP)
        const keywords = {};

        mentions.forEach(mention => {
            if (mention.text) {
                const words = mention.text.toLowerCase()
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter(w => w.length > 4); // Filter short words

                words.forEach(word => {
                    keywords[word] = (keywords[word] || 0) + 1;
                });
            }
        });

        // Get top keywords
        const themes = Object.entries(keywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({
                keyword,
                frequency: count,
                percentage: Math.round((count / mentions.length) * 100)
            }));

        return themes;
    }

    /**
     * Generate insights from event analysis
     * @param {object} data - Analysis data
     * @returns {Array} Generated insights
     */
    generateEventInsights(data) {
        const insights = [];
        const { preEventAnalysis, duringEventAnalysis, postEventAnalysis, rageIndexChange, emotionShift, themes } = data;

        // Rage spike insight
        if (rageIndexChange > 20) {
            insights.push({
                type: 'spike',
                severity: 'high',
                title: 'Significant Rage Increase During Event',
                description: `Rage Index increased by ${rageIndexChange} points (${Math.abs(data.rageIndexChange)}%) during the event`,
                recommendation: 'Immediate response recommended. Review event-related communications and address concerns.',
                icon: '🔴'
            });
        } else if (rageIndexChange < -20) {
            insights.push({
                type: 'improvement',
                severity: 'low',
                title: 'Positive Reception',
                description: `Rage Index decreased by ${Math.abs(rageIndexChange)} points during the event`,
                recommendation: 'Event was well-received. Consider similar approaches in future.',
                icon: '🟢'
            });
        }

        // Emotion shift insight
        if (emotionShift.changed) {
            insights.push({
                type: 'emotion_shift',
                severity: 'medium',
                title: 'Emotional Tone Changed',
                description: `Primary emotion shifted from ${emotionShift.preEmotion} to ${emotionShift.duringEmotion}`,
                recommendation: 'Analyze what triggered this emotional change.',
                icon: '🔄'
            });
        }

        // Volume insight
        const volumeChange = duringEventAnalysis.totalMentions - preEventAnalysis.totalMentions;
        if (volumeChange > preEventAnalysis.totalMentions * 0.5) {
            insights.push({
                type: 'volume',
                severity: 'medium',
                title: 'High Engagement',
                description: `Mention volume increased by ${Math.round((volumeChange / preEventAnalysis.totalMentions) * 100)}%`,
                recommendation: 'Event generated significant attention. Monitor ongoing conversations.',
                icon: '📈'
            });
        }

        // Theme insight
        if (themes.length > 0) {
            insights.push({
                type: 'themes',
                severity: 'low',
                title: 'Top Discussion Topics',
                description: `Most discussed: ${themes.slice(0, 3).map(t => t.keyword).join(', ')}`,
                recommendation: 'Review these topics for potential concerns or opportunities.',
                icon: '💬'
            });
        }

        return insights;
    }

    /**
     * Get event by ID
     * @param {string} eventId - Event ID
     * @returns {Promise<object>} Event data
     */
    async getEvent(eventId) {
        const doc = await this.db.collection('events').doc(eventId).get();
        if (!doc.exists) {
            throw new Error('Event not found');
        }
        return { id: doc.id, ...doc.data() };
    }

    /**
     * List events for a brand
     * @param {string} brandId - Brand ID
     * @param {object} options - Query options
     * @returns {Promise<Array>} Events
     */
    async listBrandEvents(brandId, options = {}) {
        let query = this.db.collection('events')
            .where('brandId', '==', brandId)
            .orderBy('eventDate', 'desc');

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    /**
     * Compare multiple events
     * @param {Array<string>} eventIds - Event IDs to compare
     * @returns {Promise<object>} Comparison data
     */
    async compareEvents(eventIds) {
        const events = await Promise.all(
            eventIds.map(id => this.getEvent(id))
        );

        return {
            events: events.map(event => ({
                eventId: event.id,
                eventName: event.eventName,
                eventDate: event.eventDate,
                rageIndex: event.analysis?.duringEventWindow?.rageIndex || 0,
                severity: event.analysis?.duringEventWindow?.severity || 'unknown',
                rageIndexChange: event.analysis?.changes?.rageIndexChange || 0,
                topEmotion: event.analysis?.duringEventWindow?.topEmotions?.[0]?.emotion || 'unknown'
            })),
            summary: {
                avgRageIndex: Math.round(
                    events.reduce((sum, e) => sum + (e.analysis?.duringEventWindow?.rageIndex || 0), 0) / events.length
                ),
                highestRage: Math.max(...events.map(e => e.analysis?.duringEventWindow?.rageIndex || 0)),
                lowestRage: Math.min(...events.map(e => e.analysis?.duringEventWindow?.rageIndex || 100))
            }
        };
    }

    /**
     * Delete an event
     * @param {string} eventId - Event ID
     * @returns {Promise<void>}
     */
    async deleteEvent(eventId) {
        await this.db.collection('events').doc(eventId).delete();
        logger.info('Event deleted', { eventId });
    }
}

module.exports = EventAnalyzer;
