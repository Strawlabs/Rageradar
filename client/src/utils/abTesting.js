/**
 * A/B Testing Framework for Cooper Design Optimization
 * Provides utilities for running experiments and measuring impact
 */

import cooperAnalytics from './cooperAnalytics';

class ABTestingFramework {
  constructor() {
    this.activeTests = new Map();
    this.userAssignments = this.loadUserAssignments();
  }

  // Initialize a new A/B test
  createTest(testConfig) {
    const {
      testId,
      name,
      description,
      variants,
      trafficAllocation = 1.0, // Percentage of users to include
      targetMetric,
      minimumSampleSize = 100,
      maxDuration = 30 * 24 * 60 * 60 * 1000 // 30 days
    } = testConfig;

    const test = {
      testId,
      name,
      description,
      variants,
      trafficAllocation,
      targetMetric,
      minimumSampleSize,
      maxDuration,
      startTime: Date.now(),
      status: 'running',
      results: {},
      assignments: new Map()
    };

    // Initialize results for each variant
    variants.forEach(variant => {
      test.results[variant] = {
        users: 0,
        conversions: 0,
        conversionRate: 0,
        metrics: []
      };
    });

    this.activeTests.set(testId, test);
    this.saveTestConfig(test);

    return test;
  }

  // Get user's variant for a test
  getVariant(testId, userId = null) {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Use session ID if no user ID provided
    const identifier = userId || cooperAnalytics.sessionId;

    // Check if user already assigned
    if (this.userAssignments[testId] && this.userAssignments[testId][identifier]) {
      return this.userAssignments[testId][identifier];
    }

    // Check if user should be included in test
    if (!this.shouldIncludeUser(test.trafficAllocation)) {
      return null;
    }

    // Assign variant using consistent hashing
    const variant = this.assignVariant(testId, identifier, test.variants);
    
    // Store assignment
    if (!this.userAssignments[testId]) {
      this.userAssignments[testId] = {};
    }
    this.userAssignments[testId][identifier] = variant;
    this.saveUserAssignments();

    // Update test results
    test.results[variant].users++;
    test.assignments.set(identifier, variant);

    // Track assignment event
    cooperAnalytics.trackABTestConversion(testId, 'assignment', 1);

    return variant;
  }

  // Track conversion for A/B test
  trackConversion(testId, conversionType = 'primary', value = 1, userId = null) {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'running') {
      return;
    }

    const identifier = userId || cooperAnalytics.sessionId;
    const variant = this.userAssignments[testId]?.[identifier];
    
    if (!variant) {
      return; // User not in test
    }

    // Update conversion metrics
    test.results[variant].conversions++;
    test.results[variant].conversionRate = 
      test.results[variant].conversions / test.results[variant].users;

    // Store detailed metric
    test.results[variant].metrics.push({
      type: conversionType,
      value,
      timestamp: Date.now(),
      userId: identifier
    });

    // Track with analytics
    cooperAnalytics.trackABTestConversion(testId, conversionType, value);

    // Check if test should be concluded
    this.checkTestCompletion(testId);
  }

  // Cooper-specific A/B tests
  createCooperTest(principle, testConfig) {
    const cooperTestId = `cooper_${principle}_${Date.now()}`;
    
    const test = this.createTest({
      ...testConfig,
      testId: cooperTestId,
      name: `Cooper ${principle} Optimization`,
      targetMetric: 'cooper_adherence_score'
    });

    // Add Cooper-specific tracking
    test.cooperPrinciple = principle;
    test.baselineScore = this.getBaselineCooperScore(principle);

    return test;
  }

  // Predefined Cooper principle tests
  testGoalDirectedDesign(variants) {
    return this.createCooperTest('goal_directed', {
      name: 'Goal-Directed Design Optimization',
      description: 'Test different approaches to goal-directed interface design',
      variants,
      targetMetric: 'goal_completion_rate',
      minimumSampleSize: 200
    });
  }

  testPerpetualIntermediate(variants) {
    return this.createCooperTest('perpetual_intermediate', {
      name: 'Perpetual Intermediate User Experience',
      description: 'Optimize interface complexity for perpetual intermediate users',
      variants,
      targetMetric: 'task_efficiency',
      minimumSampleSize: 150
    });
  }

  testInterfaceInvisibility(variants) {
    return this.createCooperTest('interface_invisibility', {
      name: 'Interface Invisibility Test',
      description: 'Reduce interface friction and cognitive load',
      variants,
      targetMetric: 'time_to_insight',
      minimumSampleSize: 100
    });
  }

  testDirectManipulation(variants) {
    return this.createCooperTest('direct_manipulation', {
      name: 'Direct Manipulation Interface',
      description: 'Test direct manipulation vs traditional controls',
      variants,
      targetMetric: 'user_satisfaction',
      minimumSampleSize: 120
    });
  }

  // Statistical analysis
  calculateStatisticalSignificance(testId) {
    const test = this.activeTests.get(testId);
    if (!test || test.variants.length !== 2) {
      return null;
    }

    const [variantA, variantB] = test.variants;
    const resultsA = test.results[variantA];
    const resultsB = test.results[variantB];

    // Two-proportion z-test
    const n1 = resultsA.users;
    const n2 = resultsB.users;
    const x1 = resultsA.conversions;
    const x2 = resultsB.conversions;

    if (n1 < 30 || n2 < 30) {
      return { significance: false, reason: 'Insufficient sample size' };
    }

    const p1 = x1 / n1;
    const p2 = x2 / n2;
    const pPool = (x1 + x2) / (n1 + n2);
    
    const se = Math.sqrt(pPool * (1 - pPool) * (1/n1 + 1/n2));
    const zScore = (p1 - p2) / se;
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    const isSignificant = pValue < 0.05;
    const confidence = (1 - pValue) * 100;

    return {
      significance: isSignificant,
      pValue,
      confidence,
      zScore,
      lift: ((p1 - p2) / p2) * 100,
      winner: p1 > p2 ? variantA : variantB
    };
  }

  // Utility methods
  shouldIncludeUser(trafficAllocation) {
    return Math.random() < trafficAllocation;
  }

  assignVariant(testId, identifier, variants) {
    const hash = this.hashString(identifier + testId);
    const variantIndex = hash % variants.length;
    return variants[variantIndex];
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  normalCDF(x) {
    // Approximation of normal cumulative distribution function
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  checkTestCompletion(testId) {
    const test = this.activeTests.get(testId);
    if (!test) return;

    const totalUsers = Object.values(test.results).reduce((sum, result) => sum + result.users, 0);
    const hasMinimumSample = totalUsers >= test.minimumSampleSize;
    const hasRunLongEnough = Date.now() - test.startTime > (7 * 24 * 60 * 60 * 1000); // 7 days minimum
    const hasMaxDurationPassed = Date.now() - test.startTime > test.maxDuration;

    if (hasMaxDurationPassed || (hasMinimumSample && hasRunLongEnough)) {
      const significance = this.calculateStatisticalSignificance(testId);
      
      if (significance && significance.significance) {
        this.concludeTest(testId, significance.winner, 'statistical_significance');
      } else if (hasMaxDurationPassed) {
        this.concludeTest(testId, null, 'max_duration_reached');
      }
    }
  }

  concludeTest(testId, winner, reason) {
    const test = this.activeTests.get(testId);
    if (!test) return;

    test.status = 'concluded';
    test.endTime = Date.now();
    test.winner = winner;
    test.conclusionReason = reason;
    test.finalResults = this.calculateStatisticalSignificance(testId);

    // Track test conclusion
    cooperAnalytics.sendEvent('ab_test_concluded', {
      testId,
      winner,
      reason,
      duration: test.endTime - test.startTime,
      totalUsers: Object.values(test.results).reduce((sum, result) => sum + result.users, 0)
    });

    this.saveTestConfig(test);
  }

  getBaselineCooperScore(principle) {
    // Get historical Cooper adherence score for this principle
    const metrics = JSON.parse(localStorage.getItem('cooperMetrics') || '[]');
    const principleMetrics = metrics.filter(m => 
      m.type === 'cooperAdherence' && m.data.principle === principle
    );

    if (principleMetrics.length === 0) return 75; // Default baseline

    const avgScore = principleMetrics.reduce((sum, m) => sum + m.data.score, 0) / principleMetrics.length;
    return Math.round(avgScore);
  }

  // Data persistence
  saveTestConfig(test) {
    const tests = JSON.parse(localStorage.getItem('abTests') || '{}');
    tests[test.testId] = {
      ...test,
      assignments: Array.from(test.assignments.entries())
    };
    localStorage.setItem('abTests', JSON.stringify(tests));
  }

  loadUserAssignments() {
    return JSON.parse(localStorage.getItem('abTestAssignments') || '{}');
  }

  saveUserAssignments() {
    localStorage.setItem('abTestAssignments', JSON.stringify(this.userAssignments));
  }

  // Public API
  getActiveTests() {
    return Array.from(this.activeTests.values()).filter(test => test.status === 'running');
  }

  getTestResults(testId) {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    return {
      ...test,
      significance: this.calculateStatisticalSignificance(testId)
    };
  }

  getAllTestResults() {
    const results = {};
    this.activeTests.forEach((test, testId) => {
      results[testId] = this.getTestResults(testId);
    });
    return results;
  }
}

// Global instance
const abTesting = new ABTestingFramework();

// Initialize common Cooper principle tests
if (typeof window !== 'undefined') {
  // Example: Test different onboarding flows
  abTesting.testGoalDirectedDesign(['original', 'simplified', 'guided']);
  
  // Example: Test dashboard layouts
  abTesting.testPerpetualIntermediate(['grid', 'list', 'cards']);
}

export default abTesting;