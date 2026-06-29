/**
 * Integration Utilities
 * Shared resilience patterns for all platform integrations:
 * - Retry with exponential backoff + jitter
 * - Circuit breaker to avoid hammering dead APIs
 * - Deleted/removed content detection
 * - Per-platform rate-limit delay
 */

const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Retry with Exponential Backoff
// ---------------------------------------------------------------------------

/**
 * Retry a function with exponential backoff and jitter.
 * @param {Function} fn - Async function to execute
 * @param {object} opts
 * @param {number} [opts.maxRetries=3]
 * @param {number} [opts.baseDelay=1000] - Base delay in ms
 * @param {number} [opts.maxDelay=15000] - Cap per-attempt delay
 * @param {Function} [opts.shouldRetry] - Optional predicate (error) => bool
 * @param {string} [opts.label='operation'] - Label for log messages
 * @returns {Promise<*>}
 */
async function retryWithBackoff(fn, opts = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 15000,
        shouldRetry = () => true,
        label = 'operation'
    } = opts;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries || !shouldRetry(error)) {
                throw error;
            }

            // Exponential backoff with jitter (±25%)
            const expDelay = baseDelay * Math.pow(2, attempt);
            const jitter = expDelay * 0.25 * (Math.random() * 2 - 1);
            const delay = Math.min(expDelay + jitter, maxDelay);

            logger.warn(`${label}: retry ${attempt + 1}/${maxRetries}, waiting ${Math.round(delay)}ms`, {
                error: error.message
            });

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// ---------------------------------------------------------------------------
// Circuit Breaker
// ---------------------------------------------------------------------------

/**
 * Simple circuit breaker that tracks consecutive failures.
 * States: CLOSED (normal) → OPEN (blocking) → HALF_OPEN (testing)
 */
class CircuitBreaker {
    /**
     * @param {object} opts
     * @param {string} [opts.name='unknown'] - Integration name for logging
     * @param {number} [opts.failureThreshold=5] - Consecutive failures before opening
     * @param {number} [opts.cooldownMs=60000] - Time in ms before trying again
     */
    constructor(opts = {}) {
        this.name = opts.name || 'unknown';
        this.failureThreshold = opts.failureThreshold || 5;
        this.cooldownMs = opts.cooldownMs || 60000;

        this.state = 'CLOSED';
        this.failures = 0;
        this.lastFailureTime = 0;
    }

    /**
     * Check if the circuit allows a request.
     * @returns {boolean}
     */
    isOpen() {
        if (this.state === 'CLOSED') return false;

        // Check if cooldown has passed → transition to HALF_OPEN
        if (Date.now() - this.lastFailureTime >= this.cooldownMs) {
            this.state = 'HALF_OPEN';
            logger.info(`CircuitBreaker [${this.name}]: transitioning to HALF_OPEN`);
            return false; // allow one probe request
        }

        return true; // still OPEN
    }

    /**
     * Record a successful call.
     */
    onSuccess() {
        this.failures = 0;
        if (this.state !== 'CLOSED') {
            logger.info(`CircuitBreaker [${this.name}]: closing circuit (recovery)`);
        }
        this.state = 'CLOSED';
    }

    /**
     * Record a failed call.
     */
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            logger.warn(`CircuitBreaker [${this.name}]: circuit OPEN after ${this.failures} consecutive failures`);
        }
    }

    /**
     * Execute a function through the circuit breaker.
     * @param {Function} fn - Async function
     * @returns {Promise<*>}
     */
    async exec(fn) {
        if (this.isOpen()) {
            throw new Error(`CircuitBreaker [${this.name}]: circuit is OPEN — request blocked`);
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    /**
     * Get current status for health reporting.
     * @returns {object}
     */
    getStatus() {
        return {
            state: this.state,
            consecutiveFailures: this.failures,
            failureThreshold: this.failureThreshold,
            cooldownMs: this.cooldownMs,
            lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null
        };
    }
}

// ---------------------------------------------------------------------------
// Deleted / Removed Content Detection
// ---------------------------------------------------------------------------

/** Patterns that indicate a deleted or removed piece of content */
const DELETED_PATTERNS = [
    /^\[deleted\]$/i,
    /^\[removed\]$/i,
    /^\[unavailable\]$/i,
    /^Comment removed by moderator$/i,
    /^This comment has been removed$/i,
    /^This post has been removed$/i,
    /^Sorry, this post was deleted$/i,
    /^This video is unavailable$/i,
    /^This video has been removed$/i,
    /^Video unavailable$/i
];

/**
 * Check if content text represents a deleted/removed/unavailable item.
 * @param {string} text
 * @returns {boolean}
 */
function isDeletedContent(text) {
    if (!text || typeof text !== 'string') return true;

    const trimmed = text.trim();
    if (trimmed.length === 0) return true;

    return DELETED_PATTERNS.some(pattern => pattern.test(trimmed));
}

// ---------------------------------------------------------------------------
// Rate-Limit Delay
// ---------------------------------------------------------------------------

/** Default per-platform delays (ms) between requests */
const PLATFORM_DELAYS = {
    reddit: 1000,
    youtube: 200,
    producthunt: 500,
    appstore: 300,
    playstore: 300
};

/**
 * Wait the platform-appropriate delay.
 * @param {string} platform
 * @returns {Promise<void>}
 */
async function rateLimitDelay(platform) {
    const delay = PLATFORM_DELAYS[platform] || 500;
    await new Promise(resolve => setTimeout(resolve, delay));
}

// ---------------------------------------------------------------------------
// Retriable Error Classification
// ---------------------------------------------------------------------------

/**
 * Determine whether an HTTP/API error is retriable.
 * @param {Error} error
 * @returns {boolean}
 */
function isRetriableError(error) {
    const status = error.statusCode || error.status || error.code || error.response?.status;

    // Rate limited — should retry after delay
    if (status === 429) return true;
    // Server errors — transient
    if (status >= 500 && status < 600) return true;
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') return true;
    // Axios timeout
    if (error.message?.includes('timeout')) return true;

    return false;
}

module.exports = {
    retryWithBackoff,
    CircuitBreaker,
    isDeletedContent,
    rateLimitDelay,
    isRetriableError,
    PLATFORM_DELAYS
};
