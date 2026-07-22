/**
 * Duplicate Detector
 * Detects exact and near-duplicate signals to prevent noise from inflating the Rage Index.
 * 
 * Why this improves accuracy:
 * - Prevents duplicate posts/crossposts/syndicated news from double-counting rage
 * - Detects cross-platform duplication (e.g., same text copied from Twitter to Reddit)
 * - Retains the version with the highest engagement/reach and merges metadata
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');

class DuplicateDetector {
    constructor(options = {}) {
        this.jaccardThreshold = options.jaccardThreshold || 0.70;
        // Jaccard token size minimum to avoid short phrases getting flagged (e.g. "it failed", "it crashed")
        this.minTokenLengthForSimilarity = options.minTokenLengthForSimilarity || 5;
    }

    /**
     * Compute SHA-256 hash of normalized text
     * @param {string} text - Cleaned content
     * @returns {string} SHA-256 hex string
     */
    computeHash(text) {
        return crypto
            .createHash('sha256')
            .update(text.toLowerCase().trim())
            .digest('hex');
    }

    /**
     * Extract token set for similarity checking (ignoring short/empty tokens)
     * @param {string} text - Cleaned content
     * @returns {Set<string>} Set of lowercase tokens
     */
    getTokens(text) {
        if (!text) return new Set();
        return new Set(
            text.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(token => token.length > 2)
        );
    }

    /**
     * Compute Jaccard Similarity between two token sets
     * @param {Set<string>} setA 
     * @param {Set<string>} setB 
     * @returns {number} Jaccard index (0 to 1)
     */
    calculateJaccardSimilarity(setA, setB) {
        if (setA.size === 0 || setB.size === 0) return 0;
        
        let intersectionCount = 0;
        for (const token of setA) {
            if (setB.has(token)) {
                intersectionCount++;
            }
        }
        
        const unionSize = setA.size + setB.size - intersectionCount;
        return intersectionCount / unionSize;
    }

    /**
     * Detect duplicates in a batch of signals, merging stats
     * @param {Array<object>} signals - Clean signals
     * @param {Array<object>} [historicalSignals=[]] - Existing signals to check against
     * @returns {Array<object>} Deduplicated signals
     */
    deduplicate(signals, historicalSignals = []) {
        if (!Array.isArray(signals) || signals.length === 0) {
            return [];
        }

        const uniqueSignals = [];
        const allReferenceSignals = [...historicalSignals];

        signals.forEach(signal => {
            // Compute hash for exact duplicate detection
            const hash = this.computeHash(signal.content);
            signal.contentHash = hash;

            const tokens = this.getTokens(signal.content);
            signal.tokenSet = tokens;

            // Initialize tracking metadata for cross-posting and duplicate sources
            signal.duplicateSources = signal.duplicateSources || [{
                url: signal.url || '',
                platform: signal.platform || 'web',
                publishedAt: signal.publishedAt || new Date().toISOString(),
                engagement: signal.engagement || signal.platformMeta || {}
            }];
            signal.duplicateCount = signal.duplicateCount || signal.duplicateSources.length;
            signal.isCrossPosted = signal.isCrossPosted || false;

            let isDuplicate = false;
            let matchingSignal = null;

            // Check against both current unique batch and historical signals
            for (const ref of [...uniqueSignals, ...allReferenceSignals]) {
                // 1. Exact match via Hash
                if (ref.contentHash === hash) {
                    isDuplicate = true;
                    matchingSignal = ref;
                    break;
                }

                // 2. Near-duplicate via Jaccard token similarity
                if (tokens.size >= this.minTokenLengthForSimilarity && ref.tokenSet && ref.tokenSet.size >= this.minTokenLengthForSimilarity) {
                    const similarity = this.calculateJaccardSimilarity(tokens, ref.tokenSet);
                    if (similarity >= this.jaccardThreshold) {
                        isDuplicate = true;
                        matchingSignal = ref;
                        break;
                    }
                }
            }

            if (isDuplicate && matchingSignal) {
                logger.info(`DuplicateDetector: Found duplicate. Merging engagement stats and sources.`);
                
                // Ensure matchingSignal has tracking fields initialized
                matchingSignal.duplicateSources = matchingSignal.duplicateSources || [{
                    url: matchingSignal.url || '',
                    platform: matchingSignal.platform || 'web',
                    publishedAt: matchingSignal.publishedAt || new Date().toISOString(),
                    engagement: matchingSignal.engagement || matchingSignal.platformMeta || {}
                }];

                // Record the incoming duplicate source
                const newSource = {
                    url: signal.url || '',
                    platform: signal.platform || 'web',
                    publishedAt: signal.publishedAt || new Date().toISOString(),
                    engagement: signal.engagement || signal.platformMeta || {}
                };
                matchingSignal.duplicateSources.push(newSource);
                matchingSignal.duplicateCount = matchingSignal.duplicateSources.length;

                // Check if cross-posted across different platforms or domains/URLs
                if (matchingSignal.duplicateSources.some(s => s.platform !== matchingSignal.platform || (s.url && matchingSignal.url && s.url !== matchingSignal.url))) {
                    matchingSignal.isCrossPosted = true;
                }

                // Merge engagement statistics
                const refMeta = matchingSignal.platformMeta || {};
                const sigMeta = signal.platformMeta || {};

                // Aggregate likes/replies/upvotes/comments
                const mergedMeta = {
                    ...refMeta,
                    ...sigMeta,
                    upvotes: (refMeta.upvotes || 0) + (sigMeta.upvotes || 0),
                    likes: (refMeta.likes || 0) + (sigMeta.likes || 0),
                    replies: (refMeta.replies || 0) + (sigMeta.replies || 0),
                    commentCount: (refMeta.commentCount || 0) + (sigMeta.commentCount || 0)
                };

                // Keep the one with better content (or just update the reference)
                if ((signal.qualityScore || 0) > (matchingSignal.qualityScore || 0)) {
                    matchingSignal.content = signal.content;
                    matchingSignal.title = signal.title;
                    matchingSignal.url = signal.url;
                    if (signal.originalContent) {
                        matchingSignal.originalContent = signal.originalContent;
                    }
                }
                
                matchingSignal.platformMeta = mergedMeta;
                if (matchingSignal.engagement) {
                    matchingSignal.engagement = { ...matchingSignal.engagement, ...mergedMeta };
                }
                if (matchingSignal.metadata) {
                    matchingSignal.metadata.isCrossPosted = matchingSignal.isCrossPosted;
                    matchingSignal.metadata.duplicateCount = matchingSignal.duplicateCount;
                }
                matchingSignal.isDuplicate = true;
            } else {
                signal.isDuplicate = false;
                uniqueSignals.push(signal);
            }
        });

        // Clean up temporary tokenSet before returning
        uniqueSignals.forEach(sig => {
            delete sig.tokenSet;
        });

        return uniqueSignals;
    }
}

module.exports = DuplicateDetector;
