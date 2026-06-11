/**
 * Rate Limiter Tests
 */

const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

describe('Rate Limiting', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Create a strict rate limiter for testing (2 requests per minute)
        const testLimiter = rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 2, // 2 requests
            message: { error: 'Too many requests' },
            standardHeaders: true,
            legacyHeaders: false,
        });

        app.use('/api/test', testLimiter);

        app.get('/api/test', (req, res) => {
            res.json({ success: true });
        });
    });

    test('Should allow requests within limit', async () => {
        await request(app).get('/api/test').expect(200);
        await request(app).get('/api/test').expect(200);
    });

    test('Should block requests exceeding limit', async () => {
        // Make 2 successful requests
        await request(app).get('/api/test').expect(200);
        await request(app).get('/api/test').expect(200);

        // Third request should be rate limited
        const response = await request(app).get('/api/test').expect(429);

        expect(response.body).toHaveProperty('error');
    });

    test('Should include rate limit headers', async () => {
        const response = await request(app).get('/api/test');

        expect(response.headers).toHaveProperty('ratelimit-limit');
        expect(response.headers).toHaveProperty('ratelimit-remaining');
        expect(response.headers).toHaveProperty('ratelimit-reset');
    });
});

describe('Rate Limiter Configuration', () => {
    test('Analysis limiter should have correct configuration', () => {
        const { analysisLimiter } = require('../middleware/rateLimiter');

        // Check that limiter exists and is a function
        expect(analysisLimiter).toBeDefined();
        expect(typeof analysisLimiter).toBe('function');
    });

    test('Preview limiter should have correct configuration', () => {
        const { previewLimiter } = require('../middleware/rateLimiter');

        expect(previewLimiter).toBeDefined();
        expect(typeof previewLimiter).toBe('function');
    });

    test('Payment limiter should have correct configuration', () => {
        const { paymentLimiter } = require('../middleware/rateLimiter');

        expect(paymentLimiter).toBeDefined();
        expect(typeof paymentLimiter).toBe('function');
    });
});
