/**
 * Entity Extractor
 * Extracts products, features, competitors, metadata, and complaint-related terms from signals.
 * 
 * Why this improves accuracy:
 * - Structured entity tagging enables precise root cause aggregation (e.g., grouping all "checkout" issues)
 * - Detects competitor mentions to allow comparative brand analysis
 * - Extracts monetary/version/temporal context for detailed incident reporting
 */

const nlp = require('compromise');
const logger = require('../../utils/logger');

class EntityExtractor {
    constructor(options = {}) {
        // Known competitor mapping
        this.competitorsList = options.competitors || [
            'Square', 'PayPal', 'Adyen', 'Stripe', 'Shopify', 'Braintree', 'Revolut', 'Wise'
        ];

        // Custom features or components of the brand to track
        this.featuresList = options.features || [
            'checkout', 'api', 'dashboard', 'login', 'billing', 'subscription', 'invoice', 'gateway', 'terminal', 'payout'
        ];
    }

    /**
     * Clean punctuation from extracted strings
     * @param {string} text 
     * @returns {string} cleaned string
     */
    cleanPunctuation(text) {
        if (!text) return '';
        return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();
    }

    /**
     * Extract entities from text
     * @param {string} text - Cleaned content
     * @returns {object} Extracted entities object
     */
    extract(text) {
        if (!text) {
            return {
                people: [],
                organizations: [],
                dates: [],
                money: [],
                versions: [],
                features: [],
                competitors: [],
                complaints: []
            };
        }

        try {
            const doc = nlp(text);

            // 1. Basic compromise extractions
            const people = doc.people().out('array').map(p => this.cleanPunctuation(p)).filter(Boolean);
            const organizations = doc.organizations().out('array').map(o => this.cleanPunctuation(o)).filter(Boolean);

            // 2. Tag-based matches for dates and money (to avoid compromise dates() or money() missing crashes)
            const dates = doc.match('#Date+').out('array').map(d => this.cleanPunctuation(d)).filter(Boolean);
            const money = doc.match('#Money+').out('array').map(m => this.cleanPunctuation(m)).filter(Boolean);

            // 3. Regular Expression extractions for technical features (like software versions)
            const versionRegex = /\bv?(?:\d+\.){1,3}\d+\b/g;
            const versions = text.match(versionRegex) || [];

            // 4. Feature and Competitor Matching
            const features = [];
            const competitors = [];
            const complaints = [];

            const words = text.toLowerCase().split(/\s+/).map(w => this.cleanPunctuation(w));

            // Extract competitors
            this.competitorsList.forEach(comp => {
                if (words.includes(comp.toLowerCase())) {
                    competitors.push(comp);
                }
            });

            // Extract features
            this.featuresList.forEach(feat => {
                if (words.includes(feat.toLowerCase())) {
                    features.push(feat);
                }
            });

            // Tag complaint terms (bug, lag, crash, slow, error, refund, cancel)
            const complaintTerms = ['bug', 'glitch', 'crash', 'freeze', 'broken', 'error', 'fail', 'failure', 'down', 'outage', 'offline', 'slow', 'delay', 'timeout', 'refund', 'chargeback', 'cancel', 'expensive', 'fee', 'charge', 'stolen', 'hacked', 'scam', 'unresponsive', 'terrible', 'worst'];
            complaintTerms.forEach(term => {
                if (words.some(w => w.startsWith(term))) {
                    complaints.push(term);
                }
            });

            return {
                people: [...new Set(people)],
                organizations: [...new Set(organizations)],
                dates: [...new Set(dates)],
                money: [...new Set(money)],
                versions: [...new Set(versions)],
                features: [...new Set(features)],
                competitors: [...new Set(competitors)],
                complaints: [...new Set(complaints)]
            };

        } catch (error) {
            logger.error('EntityExtractor: compromise extraction failed', { error: error.message });
            return {
                people: [],
                organizations: [],
                dates: [],
                money: [],
                versions: [],
                features: [],
                competitors: [],
                complaints: []
            };
        }
    }
}

module.exports = EntityExtractor;
