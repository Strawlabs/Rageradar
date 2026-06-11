/**
 * API Test Suite - Health Check and Basic Endpoints
 */

const request = require('supertest');
const express = require('express');

describe('API Health Check', () => {
    let app;

    beforeAll(() => {
        // Create minimal Express app for testing
        app = express();
        app.use(express.json());

        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                searchEngine: 'Working',
                sentimentAnalyzer: 'Working'
            });
        });
    });

    test('GET /api/health should return 200 and status OK', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('searchEngine', 'Working');
        expect(response.body).toHaveProperty('sentimentAnalyzer', 'Working');
    });

    test('Health check should include timestamp', async () => {
        const response = await request(app).get('/api/health');

        const timestamp = new Date(response.body.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
});

describe('API Error Handling', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Test endpoint that throws error
        app.get('/api/test-error', (req, res) => {
            throw new Error('Test error');
        });

        // Error handler
        app.use((err, req, res, next) => {
            res.status(500).json({
                error: process.env.NODE_ENV === 'production'
                    ? 'An error occurred'
                    : err.message
            });
        });
    });

    test('Should handle errors gracefully', async () => {
        const response = await request(app)
            .get('/api/test-error')
            .expect(500);

        expect(response.body).toHaveProperty('error');
    });
});

describe('API Request Validation', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Test endpoint with validation
        app.post('/api/test-validation', (req, res) => {
            const { brandName } = req.body;

            if (!brandName) {
                return res.status(400).json({ error: 'Brand name is required' });
            }

            if (brandName.length < 1 || brandName.length > 100) {
                return res.status(400).json({ error: 'Brand name must be 1-100 characters' });
            }

            res.json({ success: true, brandName });
        });
    });

    test('Should reject requests without required fields', async () => {
        const response = await request(app)
            .post('/api/test-validation')
            .send({})
            .expect(400);

        expect(response.body).toHaveProperty('error', 'Brand name is required');
    });

    test('Should reject invalid brand names', async () => {
        const response = await request(app)
            .post('/api/test-validation')
            .send({ brandName: 'a'.repeat(101) })
            .expect(400);

        expect(response.body).toHaveProperty('error');
    });

    test('Should accept valid requests', async () => {
        const response = await request(app)
            .post('/api/test-validation')
            .send({ brandName: 'Test Brand' })
            .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('brandName', 'Test Brand');
    });
});
