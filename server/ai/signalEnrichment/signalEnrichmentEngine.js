/**
 * Signal Enrichment Engine
 * Orchestrates the full enrichment pipeline: normalization, deduplication, entity extraction, and relevance scoring.
 * 
 * Why this improves accuracy:
 * - Pipelines raw unstructured data into clean, formatted, standardized schemas
 * - Discards off-topic mentions early to avoid skewing sentiment/rage indexes
 * - Pre-computes structural metadata (hashes, entities, quality) to optimize downstream analysis
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');
const ContentNormalizer = require('./contentNormalizer');
const DuplicateDetector = require('./duplicateDetector');
const EntityExtractor = require('./entityExtractor');
const RelevanceScorer = require('./relevanceScorer');

class SignalEnrichmentEngine {
    constructor(options = {}) {
        this.normalizer = new ContentNormalizer();
        this.duplicateDetector = new DuplicateDetector(options.duplicateOptions);
        this.entityExtractor = new EntityExtractor(options.entityOptions);
        this.relevanceScorer = new RelevanceScorer(options.relevanceOptions);
    }

    /**
     * Run the full enrichment pipeline on a batch of raw mentions
     * @param {Array<object>} rawMentions - List of raw scraped mentions
     * @param {object} brandConfig - Current brand configurations
     * @param {Array<object>} [existingSignals=[]] - Optional historical signals for deduplication
     * @returns {Array<object>} Enriched, cleaned, and filtered signal objects
     */
    enrich(rawMentions, brandConfig = {}, existingSignals = []) {
        if (!Array.isArray(rawMentions) || rawMentions.length === 0) {
            logger.info('SignalEnrichmentEngine: No raw mentions to enrich');
            return [];
        }

        logger.info(`SignalEnrichmentEngine: Starting enrichment pipeline for ${rawMentions.length} mentions`);

        // Step 1: Normalize content
        const normalized = rawMentions.map((mention, idx) => {
            const rawText = mention.text || mention.content || '';
            const normResult = this.normalizer.normalize(rawText, { platform: mention.platform });

            return {
                id: mention.id || `sig_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
                title: mention.title || '',
                url: mention.url || mention.link || '',
                platform: mention.platform || 'web',
                publishedAt: mention.publishedAt || mention.timestamp || mention.date || new Date().toISOString(),
                collectedAt: new Date().toISOString(),
                author: mention.author || 'Anonymous',
                authorUrl: mention.authorUrl || '',
                verified: mention.verified || false,
                location: mention.location || '',
                engagement: mention.engagement || {
                    upvotes: mention.upvotes || 0,
                    downvotes: mention.downvotes || 0,
                    comments: mention.comments || 0,
                    ratio: mention.ratio || null,
                    rating: mention.rating || null
                },
                platformMeta: mention.platformMeta || {
                    upvotes: mention.upvotes || (mention.engagement && mention.engagement.upvotes) || 0,
                    likes: mention.likes || (mention.engagement && mention.engagement.likes) || 0,
                    replies: mention.replies || (mention.engagement && mention.engagement.replies) || 0,
                    commentCount: mention.commentCount || (mention.engagement && mention.engagement.comments) || 0
                },
                content: normResult.content,
                qualityScore: normResult.qualityScore
            };
        });

        // Step 2: Relevance scoring and filtering (removes off-topic mentions)
        const relevantSignals = this.relevanceScorer.filter(normalized, brandConfig);
        logger.info(`SignalEnrichmentEngine: Relevance scorer kept ${relevantSignals.length}/${rawMentions.length} mentions`);

        // Step 3: Entity extraction (runs only on on-topic, cleaned data)
        const enrichedWithEntities = relevantSignals.map(signal => {
            const entities = this.entityExtractor.extract(signal.content);
            return {
                ...signal,
                entities: entities.features.concat(entities.complaints), // key topics/issues
                extractedEntities: entities
            };
        });

        // Step 4: Deduplicate (exact hashes and Jaccard token similarity)
        const deduplicated = this.duplicateDetector.deduplicate(enrichedWithEntities, existingSignals);
        logger.info(`SignalEnrichmentEngine: Deduplication finished. Outputting ${deduplicated.length} signal objects.`);

        return deduplicated;
    }
}

module.exports = SignalEnrichmentEngine;
