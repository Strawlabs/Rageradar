/**
 * Core Cooper Testing Framework Tests
 * Tests the fundamental Cooper testing utilities without complex component dependencies
 */

import CooperTestingFramework from '../../utils/cooperTesting';
import CooperMonitoring from '../../utils/cooperMonitoring';
import CooperTestRunner, { CooperTestSuites } from '../../utils/cooperTestRunner';

// Mock DOM methods for testing environment
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    timing: {
      navigationStart: Date.now() - 1000,
      domContentLoadedEventEnd: Date.now() - 500,
      loadEventEnd: Date.now() - 200
    },
    getEntriesByType: jest.fn(() => [
      { name: 'first-paint', startTime: 100 },
      { name: 'first-contentful-paint', startTime: 150 }
    ])
  }
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn(() => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1'
  }))
});

// Mock DOM methods
Object.defineProperty(document, 'querySelectorAll', {
  value: jest.fn(() => []),
  writable: true
});

describe('Cooper Testing Framework Core', () => {
  let cooperTesting;
  let cooperMonitoring;

  beforeEach(() => {
    cooperTesting = new CooperTestingFramework();
    cooperMonitoring = new CooperMonitoring();
    
    // Reset performance mock
    window.performance.now.mockImplementation(() => Date.now());
    
    // Reset DOM mock
    document.querySelectorAll.mockImplementation(() => []);
  });

  afterEach(() => {
    cooperMonitoring.stopMonitoring();
    jest.clearAllMocks();
  });

  describe('Goal Achievement Testing', () => {
    test('should start and complete goal achievement test', () => {
      const testSession = cooperTesting.startGoalAchievementTest('test_goal');
      
      expect(testSession.goalType).toBe('test_goal');
      expect(testSession.startTime).toBeDefined();
      expect(testSession.testId).toBeDefined();
      
      const result = cooperTesting.completeGoalAchievementTest(true, 'Test completed successfully');
      
      expect(result.success).toBe(true);
      expect(result.goalType).toBe('test_goal');
      expect(result.duration).toBeDefined();
      expect(result.targetMet).toBe(true); // Should be true since test completes quickly
      expect(result.insights).toBe('Test completed successfully');
    });

    test('should track interaction count', () => {
      cooperTesting.startGoalAchievementTest('interaction_test');
      
      // Simulate interactions by directly incrementing counter
      cooperTesting.interactionCount = 5;
      
      const result = cooperTesting.completeGoalAchievementTest(true);
      
      expect(result.interactionCount).toBe(5);
    });

    test('should handle failed goal achievement', () => {
      cooperTesting.startGoalAchievementTest('failed_test');
      
      const result = cooperTesting.completeGoalAchievementTest(false, 'Test failed due to error');
      
      expect(result.success).toBe(false);
      expect(result.insights).toBe('Test failed due to error');
    });

    test('should validate 30-second target', () => {
      // Mock performance.now to simulate long duration
      let startTime = 1000;
      window.performance.now.mockImplementation(() => startTime);
      
      cooperTesting.startGoalAchievementTest('long_test');
      
      // Simulate 35 seconds passing
      startTime = 36000;
      
      const result = cooperTesting.completeGoalAchievementTest(true);
      
      expect(result.duration).toBeGreaterThan(30);
      expect(result.targetMet).toBe(false);
    });
  });

  describe('Cognitive Load Testing', () => {
    test('should measure cognitive load with no elements', () => {
      // Mock empty DOM
      document.querySelectorAll.mockImplementation(() => []);
      
      const result = cooperTesting.measureCognitiveLoad();
      
      expect(result.elementCount).toBe(0);
      expect(result.targetMet).toBe(true);
      expect(result.elements).toEqual([]);
    });

    test('should detect cognitive load violations', () => {
      // Mock DOM with many elements
      const mockElements = Array.from({ length: 8 }, (_, i) => ({
        tagName: 'BUTTON',
        className: `button-${i}`,
        textContent: `Button ${i}`,
        getBoundingClientRect: () => ({ width: 100, height: 30 }),
        style: { visibility: 'visible', opacity: '1', display: 'block' }
      }));
      
      document.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('button')) {
          return mockElements;
        }
        return [];
      });
      
      // Mock getComputedStyle
      window.getComputedStyle = jest.fn(() => ({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      }));
      
      const result = cooperTesting.measureCognitiveLoad();
      
      expect(result.elementCount).toBeGreaterThan(5);
      expect(result.targetMet).toBe(false);
    });

    test('should not count hidden elements', () => {
      // Mock DOM with hidden elements
      const visibleElements = [{ 
        getBoundingClientRect: () => ({ width: 100, height: 30 }),
        tagName: 'INPUT',
        className: 'visible-input'
      }];
      
      document.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('input')) {
          return visibleElements; // Only return visible elements
        }
        return [];
      });
      
      window.getComputedStyle.mockImplementation(() => ({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      }));
      
      const result = cooperTesting.measureCognitiveLoad();
      
      expect(result.elementCount).toBe(1); // Only visible elements counted
    });
  });

  describe('Error Recovery Testing', () => {
    test('should track error recovery attempts', () => {
      cooperTesting.startErrorRecoveryTest('network_error');
      
      // First attempt fails
      let result = cooperTesting.recordErrorRecoveryAttempt(false, 'retry');
      expect(result).toBeNull();
      
      // Second attempt succeeds
      result = cooperTesting.recordErrorRecoveryAttempt(true, 'alternative_method');
      
      expect(result.successful).toBe(true);
      expect(result.attempts).toBe(2);
      expect(result.recoveryMethod).toBe('alternative_method');
      expect(result.errorType).toBe('network_error');
    });

    test('should measure recovery time', () => {
      let currentTime = 1000;
      window.performance.now.mockImplementation(() => currentTime);
      
      cooperTesting.startErrorRecoveryTest('timeout_error');
      
      // Simulate 2 seconds passing
      currentTime = 3000;
      
      const result = cooperTesting.recordErrorRecoveryAttempt(true, 'user_retry');
      
      expect(result.recoveryTime).toBe(2); // 2 seconds
    });
  });

  describe('Perpetual Intermediate Testing', () => {
    test('should evaluate perpetual intermediate optimization', () => {
      // Mock DOM with minimal tutorial elements
      document.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('tutorial') || selector.includes('onboarding')) {
          return []; // No tutorial elements
        }
        if (selector.includes('contextual-help')) {
          return [{ style: { display: 'none' } }]; // Hidden contextual help
        }
        if (selector.includes('advanced') || selector.includes('expert')) {
          return [{ style: { display: 'none' } }]; // Hidden expert features
        }
        if (selector.includes('recent') || selector.includes('quick-access')) {
          return [{}]; // Return user features available
        }
        return [];
      });
      
      window.getComputedStyle = jest.fn(() => ({
        display: 'none',
        visibility: 'hidden'
      }));
      
      const result = cooperTesting.testPerpetualIntermediateOptimization();
      
      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.metrics.tutorialElements).toBe(0);
    });

    test('should detect tutorial element violations', () => {
      // Mock DOM with many tutorial elements
      document.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('.tutorial-overlay') || selector.includes('.onboarding-tooltip')) {
          return [{}, {}, {}]; // 3 tutorial elements
        }
        return [];
      });
      
      window.getComputedStyle.mockImplementation(() => ({
        display: 'block',
        visibility: 'visible'
      }));
      
      const result = cooperTesting.testPerpetualIntermediateOptimization();
      
      expect(result.metrics.tutorialElements).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
      expect(result.passed).toBe(false);
    });
  });

  describe('Report Generation', () => {
    test('should generate comprehensive report', () => {
      // Run some tests to populate data
      cooperTesting.startGoalAchievementTest('report_test');
      cooperTesting.completeGoalAchievementTest(true);
      cooperTesting.measureCognitiveLoad();
      cooperTesting.testPerpetualIntermediateOptimization();
      
      const report = cooperTesting.generateReport();
      
      expect(report.summary).toBeDefined();
      expect(report.summary.totalTests).toBeGreaterThan(0);
      expect(report.details).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });

    test('should calculate goal achievement rate', () => {
      // Add successful test
      cooperTesting.startGoalAchievementTest('success_test');
      cooperTesting.completeGoalAchievementTest(true);
      
      // Add failed test
      cooperTesting.startGoalAchievementTest('failed_test');
      cooperTesting.completeGoalAchievementTest(false);
      
      const rate = cooperTesting.calculateGoalAchievementRate();
      expect(rate).toBe(50); // 1 success out of 2 tests = 50%
    });

    test('should generate actionable recommendations', () => {
      // Create poor performance scenario
      cooperTesting.testResults.goalAchievement.push({
        duration: 45,
        targetMet: false,
        success: false
      });
      
      cooperTesting.testResults.cognitiveLoad.push({
        elementCount: 8,
        targetMet: false
      });
      
      const report = cooperTesting.generateReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      
      const goalRec = report.recommendations.find(r => r.category === 'Goal Achievement');
      expect(goalRec).toBeDefined();
      expect(goalRec.priority).toBe('high');
      
      const cognitiveRec = report.recommendations.find(r => r.category === 'Cognitive Load');
      expect(cognitiveRec).toBeDefined();
      expect(cognitiveRec.priority).toBe('high');
    });

    test('should export results in different formats', () => {
      cooperTesting.measureCognitiveLoad();
      
      // Test JSON export
      const jsonResults = cooperTesting.exportResults('json');
      const parsed = JSON.parse(jsonResults);
      expect(parsed.summary).toBeDefined();
      
      // Test CSV export
      const csvResults = cooperTesting.exportResults('csv');
      expect(csvResults).toContain('Test Type,Timestamp,Metric,Value,Target Met');
    });
  });

  describe('Cooper Monitoring', () => {
    test('should start and stop monitoring', () => {
      expect(cooperMonitoring.isMonitoring).toBe(false);
      
      const startTime = cooperMonitoring.startMonitoring();
      expect(cooperMonitoring.isMonitoring).toBe(true);
      expect(startTime).toBeDefined();
      
      const summary = cooperMonitoring.stopMonitoring();
      expect(cooperMonitoring.isMonitoring).toBe(false);
      expect(summary).toBeDefined();
    });

    test('should prevent duplicate monitoring sessions', () => {
      cooperMonitoring.startMonitoring();
      
      // Try to start again
      const secondStart = cooperMonitoring.startMonitoring();
      expect(secondStart).toBeUndefined();
      
      cooperMonitoring.stopMonitoring();
    });

    test('should generate session summary', () => {
      cooperMonitoring.startMonitoring();
      
      // Simulate some session data
      cooperMonitoring.performanceMetrics.totalInteractions = 5;
      cooperMonitoring.performanceMetrics.errorCount = 1;
      
      const summary = cooperMonitoring.stopMonitoring();
      
      expect(summary.sessionDuration).toBeGreaterThan(0);
      expect(summary.performanceMetrics.totalInteractions).toBe(5);
      expect(summary.performanceMetrics.errorCount).toBe(1);
      expect(summary.cooperPrincipleAdherence).toBeDefined();
    });
  });

  describe('Cooper Test Runner', () => {
    test('should register and run test suites', async () => {
      const testRunner = new CooperTestRunner();
      
      // Register a simple test suite
      testRunner.registerTestSuite('Basic Tests', [
        {
          name: 'Simple test',
          cooperPrinciple: 'goalAchievement',
          execute: async () => ({ passed: true, data: { result: 'success' } })
        }
      ]);
      
      const results = await testRunner.runAllTests({
        includeMonitoring: false,
        generateReport: false
      });
      
      expect(results.suites.length).toBe(1);
      expect(results.suites[0].passed).toBe(1);
      expect(results.suites[0].failed).toBe(0);
      expect(results.summary.overallStatus).toBe('passed');
    });

    test('should handle test failures', async () => {
      const testRunner = new CooperTestRunner();
      
      testRunner.registerTestSuite('Failing Tests', [
        {
          name: 'Failing test',
          cooperPrinciple: 'cognitiveLoad',
          execute: async () => ({ passed: false, reason: 'Test failed intentionally' })
        }
      ]);
      
      const results = await testRunner.runAllTests({
        includeMonitoring: false,
        generateReport: false
      });
      
      expect(results.suites[0].failed).toBe(1);
      expect(results.summary.overallStatus).toBe('failed');
    });

    test('should calculate Cooper principle adherence', async () => {
      const testRunner = new CooperTestRunner();
      
      testRunner.registerTestSuite('Mixed Results', [
        {
          name: 'Goal test 1',
          cooperPrinciple: 'goalAchievement',
          execute: async () => ({ passed: true })
        },
        {
          name: 'Goal test 2',
          cooperPrinciple: 'goalAchievement',
          execute: async () => ({ passed: false })
        },
        {
          name: 'Cognitive test',
          cooperPrinciple: 'cognitiveLoad',
          execute: async () => ({ passed: true })
        }
      ]);
      
      const results = await testRunner.runAllTests({
        includeMonitoring: false,
        generateReport: false
      });
      
      const adherence = results.summary.cooperPrincipleAdherence;
      expect(adherence.goalAchievement.score).toBe(50); // 1 pass out of 2 = 50%
      expect(adherence.cognitiveLoad.score).toBe(100); // 1 pass out of 1 = 100%
    });
  });

  describe('Pre-defined Test Suites', () => {
    test('should have goal achievement test suite', () => {
      const suite = CooperTestSuites.goalAchievement;
      
      expect(suite.name).toBe('Goal Achievement Tests');
      expect(suite.tests.length).toBeGreaterThan(0);
      expect(suite.tests[0].cooperPrinciple).toBe('goalAchievement');
      expect(suite.tests[0].requirements).toBeDefined();
    });

    test('should have cognitive load test suite', () => {
      const suite = CooperTestSuites.cognitiveLoad;
      
      expect(suite.name).toBe('Cognitive Load Tests');
      expect(suite.tests.length).toBeGreaterThan(0);
      expect(suite.tests[0].cooperPrinciple).toBe('cognitiveLoad');
    });

    test('should have error recovery test suite', () => {
      const suite = CooperTestSuites.errorRecovery;
      
      expect(suite.name).toBe('Error Recovery Tests');
      expect(suite.tests.length).toBeGreaterThan(0);
      expect(suite.tests[0].cooperPrinciple).toBe('errorRecovery');
    });

    test('should have perpetual intermediate test suite', () => {
      const suite = CooperTestSuites.perpetualIntermediate;
      
      expect(suite.name).toBe('Perpetual Intermediate Tests');
      expect(suite.tests.length).toBeGreaterThan(0);
      expect(suite.tests[0].cooperPrinciple).toBe('perpetualIntermediate');
    });
  });

  describe('Integration Testing', () => {
    test('should run complete Cooper validation workflow', async () => {
      const testRunner = new CooperTestRunner();
      
      // Register all pre-defined test suites
      Object.values(CooperTestSuites).forEach(suite => {
        testRunner.registerTestSuite(suite.name, suite.tests);
      });
      
      const results = await testRunner.runAllTests({
        includeMonitoring: true,
        generateReport: true,
        exportResults: false
      });
      
      expect(results.suites.length).toBe(4); // 4 Cooper principle test suites
      expect(results.summary.totalTests).toBeGreaterThan(0);
      expect(results.frameworkReport).toBeDefined();
      expect(results.monitoringSummary).toBeDefined();
    });

    test('should maintain data integrity across multiple test runs', () => {
      // Run multiple test cycles
      for (let i = 0; i < 3; i++) {
        cooperTesting.startGoalAchievementTest(`cycle_${i}`);
        cooperTesting.completeGoalAchievementTest(true);
        cooperTesting.measureCognitiveLoad();
      }
      
      const report = cooperTesting.generateReport();
      
      expect(report.details.goalAchievement.length).toBe(3);
      expect(report.details.cognitiveLoad.length).toBe(3);
      expect(report.summary.totalTests).toBe(6);
    });
  });
});