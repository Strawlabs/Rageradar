/**
 * Research Orchestrator
 * Coordinates the full 10-step AI brand intelligence research pipeline.
 * plans queries -> crawls platforms -> extracts content -> normalizes & dedups -> 
 * runs emotion ensemble -> calculates Rage Index 2.0 -> extracts themes -> generates AI briefings.
 */

const QueryPlanner = require('./queryPlanner');
const ContentExtractor = require('./contentExtractor');
const SignalEnrichmentEngine = require('./signalEnrichment/signalEnrichmentEngine');
const EmotionAnalyzer = require('../emotionAnalyzer');
const RageIndexCalculator = require('../utils/rageIndexCalculator');
const ThemeExtractor = require('../utils/themeExtractor');
const AIInsightsEngine = require('./insightsEngine/aiInsightsEngine');
const SearchEngine = require('../searchEngine');
const TrendlineAnalyzer = require('../trendlineAnalyzer');
const { supabase } = require('../supabase');
const logger = require('../utils/logger');

class ResearchOrchestrator {
    constructor() {
        this.queryPlanner = new QueryPlanner();
        this.contentExtractor = new ContentExtractor();
        this.enrichmentEngine = new SignalEnrichmentEngine();
        this.emotionAnalyzer = new EmotionAnalyzer();
        this.rageCalculator = new RageIndexCalculator();
        this.themeExtractor = new ThemeExtractor();
        this.insightsEngine = new AIInsightsEngine();
        this.searchEngine = new SearchEngine();
        this.trendlineAnalyzer = new TrendlineAnalyzer();
    }

    /**
     * Runs the end-to-end research and intelligence pipeline for a brand
     * @param {string} brandName - Name of the brand
     * @param {object} options - Options (platforms, userId, website, competitors)
     * @returns {Promise<object>} Final brand analysis result
     */
    async conductResearch(brandName, options = {}) {
        const {
            userId,
            website = '',
            competitors = [],
            platforms = []
        } = options;

        if (!brandName) {
            throw new Error('Brand name is required to run research orchestrator');
        }

        const brandId = `${userId}_${brandName.toLowerCase().replace(/\s+/g, '_')}`;
        logger.info(`ResearchOrchestrator: Starting brand intelligence run for ${brandName}`, { brandId });

        // Step 1: Query Planning
        const queryPlan = this.queryPlanner.planQueries({ brandName, website, competitors });

        // Step 2 & 3: Gather Raw Mentions
        // Fetch raw mentions using expanded queries or the fallback SearchEngine
        logger.info(`ResearchOrchestrator: Querying search engines and platform APIs...`);
        let rawMentions = [];
        
        // Execute main query & first 2 expanded web queries to respect rate limits
        const targetQueries = [brandName].concat(queryPlan.web.slice(1, 3));
        
        for (const query of targetQueries) {
            try {
                const results = await this.searchEngine.searchAllPlatforms(query, brandName);
                rawMentions = rawMentions.concat(results);
            } catch (err) {
                logger.error(`ResearchOrchestrator: Search failed for query: "${query}"`, { error: err.message });
            }
        }

        // De-duplicate raw results by URL before fetching content
        const uniqueUrls = new Set();
        rawMentions = rawMentions.filter(m => {
            if (!m.url) return true;
            if (uniqueUrls.has(m.url)) return false;
            uniqueUrls.add(m.url);
            return true;
        });

        if (rawMentions.length === 0) {
            throw new Error(`No mentions found for brand: ${brandName}`);
        }

        // Step 4: Content Extraction (fetch full page content for top web search results)
        logger.info(`ResearchOrchestrator: Extracting full content for web search results...`);
        const webUrls = rawMentions
            .filter(m => m.url && (m.platform === 'web' || !m.platform || m.platform === 'google'))
            .map(m => m.url)
            .slice(0, 10); // Extract top 10 URLs to keep latency down

        if (webUrls.length > 0) {
            try {
                const extractions = await this.contentExtractor.extractBatch(webUrls);
                rawMentions.forEach(mention => {
                    const ext = extractions.find(e => e.url === mention.url);
                    if (ext && ext.success && ext.content) {
                        mention.text = ext.content;
                        mention.fullContentExtracted = true;
                    }
                });
            } catch (err) {
                logger.error('ResearchOrchestrator: Content extraction failed', { error: err.message });
            }
        }

        // Step 5: Signal Enrichment (normalization, entity extraction, duplicate detector, relevance scorer)
        logger.info(`ResearchOrchestrator: Running signal enrichment engine...`);
        const brandConfig = { brandName, name: brandName, website, competitors };
        const enrichedSignals = this.enrichmentEngine.enrich(rawMentions, brandConfig);

        if (enrichedSignals.length === 0) {
            throw new Error(`No relevant, quality mentions remained after signal enrichment for: ${brandName}`);
        }

        // Step 6: Emotion Ensemble Engine v2 (chunking, sarcasm, platform Context)
        logger.info(`ResearchOrchestrator: running Emotion Ensemble Classifier on ${enrichedSignals.length} signals...`);
        for (const signal of enrichedSignals) {
            try {
                const emotionRes = await this.emotionAnalyzer.analyzeEmotions(signal.content, {
                    platform: signal.platform,
                    starRating: signal.platformMeta?.rating || null
                });
                
                signal.emotions = emotionRes.emotions;
                signal.primaryEmotion = emotionRes.primaryEmotion;
                signal.primaryScore = emotionRes.primaryScore;
                signal.confidence = emotionRes.confidence;
                signal.isAmbiguous = emotionRes.isAmbiguous;
                signal.isSarcastic = emotionRes.isSarcastic;

                // Pre-calculate individual mention rage index
                const mentionRage = this.rageCalculator.calculateForMention(signal.emotions, signal);
                signal.rageIndex = mentionRage.rageIndex;
            } catch (err) {
                logger.error(`ResearchOrchestrator: Emotion analysis failed for signal ${signal.id}`, { error: err.message });
                signal.emotions = [];
                signal.confidence = 'low';
                signal.rageIndex = 40;
            }
        }

        // Step 7: Rage Index 2.0 Calculation (temporal decay, engagement scaling, smoothing)
        logger.info(`ResearchOrchestrator: Computing Rage Index 2.0...`);
        const rageData = this.rageCalculator.calculateAggregated(enrichedSignals, {
            byPlatform: true,
            byTime: true
        });

        // Step 8: Theme Extraction
        logger.info(`ResearchOrchestrator: Extracting complaint theme clusters...`);
        let themes = [];
        try {
            const themeMentions = enrichedSignals.map(s => ({
                text: s.content,
                rageIndex: s.rageIndex || 50,
                platform: s.platform,
                timestamp: s.publishedAt,
                emotions: s.emotions
            }));
            themes = await this.themeExtractor.extractThemes(themeMentions, {
                minRageIndex: 50,
                topN: 5
            });
        } catch (err) {
            logger.error('ResearchOrchestrator: Theme extraction failed', { error: err.message });
        }

        // Step 9: AI Insights Engine (LLM executive summary, recommendations card, and insights list)
        logger.info(`ResearchOrchestrator: Generating AI insights, summary, and action center...`);
        
        // Check if there is historical data for calculating a trendline
        let trendlineSummary = null;
        try {
            const { data: historicalRows } = await supabase
                .from('analyses')
                .select('*')
                .eq('brand_id', brandId)
                .order('created_at', { ascending: false })
                .limit(30);

            if (historicalRows && historicalRows.length >= 2) {
                const trendline = await this.trendlineAnalyzer.calculateTrendline(brandId, {
                    period: 30,
                    granularity: 'day'
                });
                trendlineSummary = trendline.summary;
            }
        } catch (trendError) {
            logger.warn('ResearchOrchestrator: Failed to fetch historical trendline data', { error: trendError.message });
        }

        const insightsPayload = await this.insightsEngine.generateLLMInsights({
            currentAnalysis: {
                brand_name: brandName,
                rageIndex: rageData.rageIndex,
                severity: rageData.severity,
                totalMentions: enrichedSignals.length,
                platformBreakdown: rageData.platformBreakdown
            },
            themes,
            trendline: trendlineSummary ? { summary: trendlineSummary } : null
        });

        // Sort positive/negative posts for client dashboard
        const sortedSignals = [...enrichedSignals].sort((a, b) => {
            const scoreA = a.primaryScore || 0;
            const scoreB = b.primaryScore || 0;
            return scoreB - scoreA;
        });

        const topPositive = sortedSignals
            .filter(s => s.primaryEmotion === 'joy' || s.primaryEmotion === 'love' || s.primaryEmotion === 'admiration')
            .slice(0, 3)
            .map(s => ({
                text: s.content,
                platform: s.platform,
                score: s.primaryScore,
                url: s.url
            }));

        const topNegative = sortedSignals
            .filter(s => s.primaryEmotion === 'anger' || s.primaryEmotion === 'frustration' || s.primaryEmotion === 'disgust')
            .slice(0, 3)
            .map(s => ({
                text: s.content,
                platform: s.platform,
                score: s.primaryScore,
                url: s.url
            }));

        // Format final response object
        const analysis = {
            brandName,
            brandId,
            totalMentions: enrichedSignals.length,
            positivePercentage: rageData.emotionDistribution?.joy || 20, // default if missing
            negativePercentage: rageData.emotionDistribution?.anger || 30,
            neutralPercentage: rageData.emotionDistribution?.neutral || 50,
            weightedSentimentScore: 100 - rageData.rageIndex, // derived
            confidenceScore: enrichedSignals.filter(s => s.confidence === 'high').length / enrichedSignals.length * 100,
            rageIndex: rageData.rageIndex,
            rageAlert: rageData.rageIndex > 70,
            cautionAlert: rageData.rageIndex > 50,
            emotions: Object.entries(rageData.emotionDistribution || {}).map(([label, percentage]) => ({
                label,
                percentage
            })),
            platformStats: Object.entries(rageData.platformBreakdown || {}).reduce((acc, [plat, data]) => {
                acc[plat] = data.mentionCount;
                return acc;
            }, {}),
            topPositivePosts: topPositive,
            topNegativePosts: topNegative,
            searchResults: enrichedSignals.slice(0, 10).map(s => ({
                text: s.content,
                url: s.url,
                platform: s.platform,
                timestamp: s.publishedAt
            })),
            analysisDate: new Date().toISOString(),
            isDemo: false,
            themes,
            executiveSummary: insightsPayload.executiveSummary,
            recommendations: insightsPayload.recommendations || [],
            insights: insightsPayload.insights || [],
            trendlineSummary,
            enhancedFeatures: {
                temporalWeighting: true,
                contextDetection: true,
                sarcasmDetection: true,
                themeExtraction: themes.length > 0
            }
        };

        // Step 10: Store Results in Supabase
        logger.info(`ResearchOrchestrator: Storing results in database...`);
        try {
            const analysisToSave = {
                user_id: userId,
                brand_id: brandId,
                brand_name: brandName,
                total_mentions: analysis.totalMentions,
                positive_percentage: analysis.positivePercentage,
                negative_percentage: analysis.negativePercentage,
                neutral_percentage: analysis.neutralPercentage,
                weighted_sentiment_score: analysis.weightedSentimentScore,
                confidence_score: Math.round(analysis.confidenceScore),
                rage_index: analysis.rageIndex,
                rage_alert: analysis.rageAlert,
                caution_alert: analysis.cautionAlert,
                emotions: analysis.emotions || [],
                platform_stats: analysis.platformStats || {},
                top_positive_posts: analysis.topPositivePosts || [],
                top_negative_posts: analysis.topNegativePosts || [],
                search_results: analysis.searchResults || [],
                themes: analysis.themes || [],
                insights: {
                    insights: analysis.insights,
                    executiveSummary: analysis.executiveSummary,
                    recommendations: analysis.recommendations
                },
                trendline_summary: trendlineSummary,
                analysis_date: analysis.analysisDate,
                is_demo: analysis.isDemo
            };

            await supabase
                .from('analyses')
                .insert(analysisToSave);

        } catch (dbError) {
            logger.error('ResearchOrchestrator: Database save failed', { error: dbError.message });
        }

        logger.info(`ResearchOrchestrator: Research completed successfully for ${brandName}`);
        return analysis;
    }
}

module.exports = ResearchOrchestrator;
