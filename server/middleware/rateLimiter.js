/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and manages API quota usage
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter - applies to all API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Lift limit in dev to prevent developer lockout
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/api/health',
});

// Strict rate limiter for analysis endpoint (expensive operation)
const analysisLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'development' ? 1000 : 10, // High limit in dev to prevent lockout
    message: {
        error: 'Analysis rate limit exceeded. Please wait before analyzing more brands.',
        retryAfter: '1 hour',
        suggestion: 'Consider upgrading to a higher tier plan for more analyses.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Authentication rate limiter (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Payment endpoint rate limiter
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit payment attempts
    message: {
        error: 'Too many payment attempts, please contact support if you need assistance.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Preview analysis limiter (for unauthenticated users)
const previewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Very limited for previews
    message: {
        error: 'Preview limit reached. Please sign up for unlimited analyses.',
        retryAfter: '1 hour',
        suggestion: 'Create a free account to get 3 days of unlimited access.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    analysisLimiter,
    authLimiter,
    paymentLimiter,
    previewLimiter,
};
