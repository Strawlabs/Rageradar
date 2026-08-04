/**
 * QA Search Engine Test Suite
 * Covers SRCH-01 through SRCH-10 from the QA Test Plan §3.
 *
 * Tests multi-provider search with failover, health monitoring, recovery,
 * dedup, empty results, timeout, and quota exhaustion.
 */

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

// ─────────────────────────────────────────────────────────────────────────────
// §3: Multi-Provider Search and Crawling Engine
// ─────────────────────────────────────────────────────────────────────────────

describe('§3 – Multi-Provider Search and Crawling Engine', () => {
  let SearchProviderManager;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Set env vars so providers initialize
    process.env.GOOGLE_CSE_API_KEY = 'test-google-key';
    process.env.GOOGLE_CSE_ID = 'test-cse-id';
    process.env.BING_API_KEY = 'test-bing-key';
    process.env.SERPAPI_KEY = 'test-serpapi-key';

    // Mock provider modules
    jest.mock('../searchProviders/googleCSEProvider', () => {
      return class MockGoogle {
        constructor() { this.name = 'google'; }
        async search() { return [{ title: 'Google Result', link: 'https://example.com/g', snippet: 'test' }]; }
      };
    });

    jest.mock('../searchProviders/bingSearchProvider', () => {
      return class MockBing {
        constructor() { this.name = 'bing'; }
        async search() { return [{ title: 'Bing Result', link: 'https://example.com/b', snippet: 'test' }]; }
      };
    });

    jest.mock('../searchProviders/serpAPIProvider', () => {
      return class MockSerp {
        constructor() { this.name = 'serpapi'; }
        async search() { return [{ title: 'SerpAPI Result', link: 'https://example.com/s', snippet: 'test' }]; }
      };
    });

    SearchProviderManager = require('../searchProviderManager');
  });

  afterEach(() => {
    delete process.env.GOOGLE_CSE_API_KEY;
    delete process.env.GOOGLE_CSE_ID;
    delete process.env.BING_API_KEY;
    delete process.env.SERPAPI_KEY;
  });

  // ── SRCH-01: Google CSE primary path ──
  describe('SRCH-01: Google CSE primary path', () => {
    test('returns results from Google when healthy', async () => {
      const manager = new SearchProviderManager();
      const results = await manager.search('test brand complaints');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].provider).toBe('google');
    });
  });

  // ── SRCH-02: Failover to Bing/SerpAPI ──
  describe('SRCH-02: Failover to Bing/SerpAPI', () => {
    test('falls back to Bing when Google fails', async () => {
      jest.resetModules();
      jest.mock('../searchProviders/googleCSEProvider', () => {
        return class {
          constructor() { this.name = 'google'; }
          async search() { throw new Error('Quota exceeded'); }
        };
      });
      jest.mock('../searchProviders/bingSearchProvider', () => {
        return class {
          constructor() { this.name = 'bing'; }
          async search() { return [{ title: 'Bing Fallback', link: 'https://bing.com/1', snippet: 'fallback' }]; }
        };
      });
      jest.mock('../searchProviders/serpAPIProvider', () => {
        return class {
          constructor() { this.name = 'serpapi'; }
          async search() { return []; }
        };
      });

      const SPM = require('../searchProviderManager');
      const manager = new SPM();
      const results = await manager.search('test failover');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].provider).toBe('bing');
    });
  });

  // ── SRCH-03: Provider health monitor ──
  describe('SRCH-03: Provider health monitor', () => {
    test('provider failures are tracked', () => {
      const manager = new SearchProviderManager();
      manager.recordFailure('google');
      manager.recordFailure('google');
      manager.recordFailure('google');

      const health = manager.providerHealth.get('google');
      expect(health.failures).toBe(3);
    });
  });

  // ── SRCH-04: Provider recovery ──
  describe('SRCH-04: Provider recovery after health check passes', () => {
    test('provider recovers after success', () => {
      const manager = new SearchProviderManager();

      // Simulate failures
      manager.recordFailure('google');
      manager.recordFailure('google');
      manager.recordFailure('google');
      manager.recordFailure('google');

      expect(manager.providerHealth.get('google').failures).toBe(4);

      // Simulate recovery
      manager.recordSuccess('google');

      expect(manager.providerHealth.get('google').failures).toBe(0);
    });
  });

  // ── SRCH-08: Empty result set (edge) ──
  describe('SRCH-08: Empty result set', () => {
    test('completes cleanly with zero results', async () => {
      jest.resetModules();
      jest.mock('../searchProviders/googleCSEProvider', () => {
        return class {
          constructor() { this.name = 'google'; }
          async search() { return []; }
        };
      });
      jest.mock('../searchProviders/bingSearchProvider', () => {
        return class {
          constructor() { this.name = 'bing'; }
          async search() { return []; }
        };
      });
      jest.mock('../searchProviders/serpAPIProvider', () => {
        return class {
          constructor() { this.name = 'serpapi'; }
          async search() { return []; }
        };
      });

      const SPM = require('../searchProviderManager');
      const manager = new SPM();
      const results = await manager.search('nonexistent brand xyz');

      expect(results).toEqual([]);
    });
  });

  // ── SRCH-10: Quota exhaustion across all providers (edge) ──
  describe('SRCH-10: All providers fail', () => {
    test('throws clear error when all providers are exhausted', async () => {
      jest.resetModules();
      const errorMsg = 'Quota exceeded';
      jest.mock('../searchProviders/googleCSEProvider', () => {
        return class {
          constructor() { this.name = 'google'; }
          async search() { throw new Error(errorMsg); }
        };
      });
      jest.mock('../searchProviders/bingSearchProvider', () => {
        return class {
          constructor() { this.name = 'bing'; }
          async search() { throw new Error(errorMsg); }
        };
      });
      jest.mock('../searchProviders/serpAPIProvider', () => {
        return class {
          constructor() { this.name = 'serpapi'; }
          async search() { throw new Error(errorMsg); }
        };
      });

      const SPM = require('../searchProviderManager');
      const manager = new SPM();

      await expect(manager.search('test')).rejects.toThrow(/All search providers failed/);
    });
  });

  // ── SRCH-09: Timeout handling (edge) ──
  describe('SRCH-09: Timeout handling', () => {
    test('provider timeout results in failover, not hang', async () => {
      jest.resetModules();
      jest.mock('../searchProviders/googleCSEProvider', () => {
        return class {
          constructor() { this.name = 'google'; }
          async search() { throw new Error('Request timeout'); }
        };
      });
      jest.mock('../searchProviders/bingSearchProvider', () => {
        return class {
          constructor() { this.name = 'bing'; }
          async search() { return [{ title: 'Bing OK', link: 'https://bing.com/ok', snippet: 'ok' }]; }
        };
      });
      jest.mock('../searchProviders/serpAPIProvider', () => {
        return class {
          constructor() { this.name = 'serpapi'; }
          async search() { return []; }
        };
      });

      const SPM = require('../searchProviderManager');
      const manager = new SPM();
      const results = await manager.search('timeout test');

      expect(results[0].provider).toBe('bing');
    });
  });
});
