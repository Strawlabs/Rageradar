/**
 * Logger Tests
 */

const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

describe('Logger', () => {
    const logsDir = path.join(__dirname, '../logs');

    test('Logger should be defined', () => {
        expect(logger).toBeDefined();
        expect(logger.info).toBeDefined();
        expect(logger.error).toBeDefined();
        expect(logger.warn).toBeDefined();
    });

    test('Logger should have helper methods', () => {
        expect(logger.logRequest).toBeDefined();
        expect(logger.logError).toBeDefined();
        expect(logger.logSecurity).toBeDefined();
        expect(logger.logAnalysis).toBeDefined();
        expect(logger.logPayment).toBeDefined();
    });

    test('Should log info messages', () => {
        expect(() => {
            logger.info('Test info message', { test: true });
        }).not.toThrow();
    });

    test('Should log error messages', () => {
        expect(() => {
            logger.error('Test error message', { error: 'test' });
        }).not.toThrow();
    });

    test('Should log warnings', () => {
        expect(() => {
            logger.warn('Test warning', { warning: true });
        }).not.toThrow();
    });

    test('logError helper should work', () => {
        const testError = new Error('Test error');

        expect(() => {
            logger.logError(testError, { context: 'test' });
        }).not.toThrow();
    });

    test('logSecurity helper should work', () => {
        expect(() => {
            logger.logSecurity('test_event', 'user123', { ip: '127.0.0.1' });
        }).not.toThrow();
    });

    test('logAnalysis helper should work', () => {
        const result = {
            totalMentions: 10,
            positivePercentage: 60,
            negativePercentage: 30,
            rageIndex: 25
        };

        expect(() => {
            logger.logAnalysis('TestBrand', 'user123', result);
        }).not.toThrow();
    });

    test('logPayment helper should work', () => {
        expect(() => {
            logger.logPayment('subscription_created', 'user123', { plan: 'pro' });
        }).not.toThrow();
    });
});

describe('Logger Configuration', () => {
    test('Should have correct log levels', () => {
        expect(logger.levels).toBeDefined();
    });

    test('Should have stream for HTTP logging', () => {
        expect(logger.stream).toBeDefined();
        expect(logger.stream.write).toBeDefined();
    });
});
