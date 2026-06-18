/**
 * Test Setup and Global Configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5002'; // Different port for tests
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_service_role_key_test';
process.env.GOOGLE_CSE_API_KEY = 'test-api-key';
process.env.GOOGLE_CSE_ID = 'test-search-id';
process.env.HUGGING_FACE_API_KEY = 'test-hf-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_test123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
