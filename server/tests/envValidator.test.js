/**
 * Environment Validator Tests
 */

const { validateEnvironment } = require('../utils/envValidator');

describe('Environment Validator', () => {
    let originalEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    test('Should pass with all required variables set', () => {
        // All required vars are set in tests/setup.js
        expect(() => validateEnvironment()).not.toThrow();
    });

    test('Should fail when SUPABASE_URL is missing', () => {
        delete process.env.SUPABASE_URL;

        // Mock process.exit to prevent test from exiting
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });

        validateEnvironment();

        expect(mockExit).toHaveBeenCalledWith(1);
        mockExit.mockRestore();
    });

    test('Should fail when STRIPE_SECRET_KEY is missing in production', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.STRIPE_SECRET_KEY;

        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });

        validateEnvironment();

        expect(mockExit).toHaveBeenCalledWith(1);
        mockExit.mockRestore();
    });

    test('Should validate Stripe key format', () => {
        process.env.STRIPE_SECRET_KEY = 'invalid_key';

        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });

        validateEnvironment();

        expect(mockExit).toHaveBeenCalledWith(1);
        mockExit.mockRestore();
    });

    test('Should accept valid Stripe test key', () => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_validkey123';

        expect(() => validateEnvironment()).not.toThrow();
    });

    test('Should accept valid Stripe live key', () => {
        process.env.STRIPE_SECRET_KEY = 'sk_live_validkey123';

        expect(() => validateEnvironment()).not.toThrow();
    });
});
