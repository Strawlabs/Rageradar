/**
 * Event Analysis Module
 * Track emotional changes around specific events (launches, crises, announcements)
 */

const { supabase } = require('./supabase');
const logger = require('./utils/logger');
const RageIndexCalculator = require('./utils/rageIndexCalculator');

class EventAnalyzer {
    constructor() {
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
            const eventToSave = {
                brand_id: brandId,
                user_id: userId,
                event_name: eventName,
                event_date: eventDateTime.toISOString(),
                event_type: eventType,
                description: description || '',

                // Time windows
                pre_event_window: {
                    startDate: preEventStart.toISOString(),
                    endDate: eventDateTime.toISOString(),
                    days: preEventDays || typeConfig.defaultPreDays
                },

                post_event_window: {
                    startDate: eventDateTime.toISOString(),
                    endDate: postEventEnd.toISOString(),
                    days: postEventDays || typeConfig.defaultPostDays
                },

                // Analysis status
                status: 'pending', // pending, analyzing, complete, failed

                // Metadata
                color: typeConfig.color
            };

            // Save to Supabase
            const { data: savedEvent, error: insertError } = await supabase
                .from('events')
                .insert(eventToSave)
                .select()
                .single();

            if (insertError) throw insertError;

            logger.info('Event created', {
                eventId: savedEvent.id,
                eventName,
                brandId,
                eventType
            });

            // Trigger analysis
            await this.analyzeEvent(savedEvent.id);

            return {
                eventId: savedEvent.id,
                brandId: savedEvent.brand_id,
                userId: savedEvent.user_id,
                eventName: savedEvent.event_name,
                eventDate: eventDateTime,
                eventType: savedEvent.event_type,
                description: savedEvent.description,
                preEventWindow: {
                    startDate: preEventStart,
                    endDate: eventDateTime,
                    days: preEventDays || typeConfig.defaultPreDays
                },
                postEventWindow: {
                    startDate: eventDateTime,
                    endDate: postEventEnd,
                    days: postEventDays || typeConfig.defaultPostDays
                },
                status: savedEvent.status,
                color: savedEvent.color
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
            const { data: event, error: getError } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (getError || !event) {
                throw new Error('Event not found');
            }

            // Update status
            await supabase
                .from('events')
                .update({ status: 'analyzing' })
                .eq('id', eventId);

            const preEventWindow = event.pre_event_window;
            const postEventWindow = event.post_event_window;

            // Get brand mentions for each time period
            const preEventMentions = await this.getMentionsInWindow(
                event.brand_id,
                new Date(preEventWindow.startDate),
                new Date(preEventWindow.endDate)
            );

            const duringEventMentions = await this.getMentionsInWindow(
                event.brand_id,
                new Date(event.event_date),
                new Date(new Date(event.event_date).getTime() + 24 * 60 * 60 * 1000) // +1 day
            );

            const postEventMentions = await this.getMentionsInWindow(
                event.brand_id,
                new Date(postEventWindow.startDate),
                new Date(postEventWindow.endDate)
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
                    startDate: preEventWindow.startDate,
                    endDate: preEventWindow.endDate,
                    mentions: preEventMentions.length,
                    rageIndex: preEventAnalysis.rageIndex,
                    severity: preEventAnalysis.severity,
                    topEmotions: preEventAnalysis.topEmotions.slice(0, 5),
                    emotionDistribution: preEventAnalysis.emotionDistribution
                },

                duringEventWindow: {
                    date: event.event_date,
                    mentions: duringEventMentions.length,
                    rageIndex: duringEventAnalysis.rageIndex,
                    severity: duringEventAnalysis.severity,
                    topEmotions: duringEventAnalysis.topEmotions.slice(0, 5),
                    emotionDistribution: duringEventAnalysis.emotionDistribution
                },

                postEventWindow: {
                    startDate: postEventWindow.startDate,
                    endDate: postEventWindow.endDate,
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
                analyzedAt: new Date().toISOString(),
                status: 'complete'
            };

            // Update event with analysis
            await supabase
                .from('events')
                .update({
                    analysis: analysisResults,
                    status: 'complete',
                    updated_at: new Date().toISOString()
                })
                .eq('id', eventId);

            logger.info('Event analysis complete', {
                eventId,
                rageIndexChange,
                emotionShift: emotionShift.primary
            });

            return analysisResults;
        } catch (error) {
            logger.error('Event analysis failed', { error: error.message, eventId });

            // Update status to failed
            await supabase
                .from('events')
                .update({
                    status: 'failed',
                    error: error.message,
                    updated_at: new Date().toISOString()
                })
                .eq('id', eventId);

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
            const { data: analyses, error: queryError } = await supabase
                .from('analyses')
                .select('*')
                .eq('brand_id', brandId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (queryError || !analyses) {
                logger.error('Failed to get mentions', { error: queryError?.message, brandId });
                return [];
            }

            const mentions = [];
            analyses.forEach(row => {
                const list = row.search_results || row.mentions || [];
                if (Array.isArray(list)) {
                    mentions.push(...list.map(m => ({
                        ...m,
                        analysisId: row.id,
                        timestamp: row.created_at
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
        const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (error || !event) {
            throw new Error('Event not found');
        }

        return {
            id: event.id,
            brandId: event.brand_id,
            userId: event.user_id,
            eventName: event.event_name,
            eventDate: event.event_date,
            eventType: event.event_type,
            description: event.description,
            preEventWindow: event.pre_event_window,
            postEventWindow: event.post_event_window,
            status: event.status,
            color: event.color,
            analysis: event.analysis
        };
    }

    /**
     * List events for a brand
     * @param {string} brandId - Brand ID
     * @param {object} options - Query options
     * @returns {Promise<Array>} Events
     */
    async listBrandEvents(brandId, options = {}) {
        let q = supabase
            .from('events')
            .select('*')
            .eq('brand_id', brandId)
            .order('event_date', { ascending: false });

        if (options.limit) {
            q = q.limit(options.limit);
        }

        const { data: events, error } = await q;
        if (error || !events) return [];

        return events.map(event => ({
            id: event.id,
            brandId: event.brand_id,
            userId: event.user_id,
            eventName: event.event_name,
            eventDate: event.event_date,
            eventType: event.event_type,
            description: event.description,
            preEventWindow: event.pre_event_window,
            postEventWindow: event.post_event_window,
            status: event.status,
            color: event.color,
            analysis: event.analysis
        }));
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
        await supabase
            .from('events')
            .delete()
            .eq('id', eventId);
        logger.info('Event deleted', { eventId });
    }
}

module.exports = EventAnalyzer;
