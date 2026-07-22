/**
 * Tests for Cooper Analytics and Monitoring System
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderHook, act } from '@testing-library/react';
import cooperAnalytics from '../../utils/cooperAnalytics';
import abTesting from '../../utils/abTesting';
import { 
  useGoalTracking, 
  useJourneyTracking, 
  useCooperTracking,
  useABTest,
  useInsightTracking,
  useCooperAnalytics
} from '../../hooks/useAnalytics';
import AnalyticsDashboard from '../AnalyticsDashboard';

// Mock fetch for API calls
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);

describe('Cooper Analytics System', () => {
  beforeEach(() => {
    // Clear analytics data
    cooperAnalytics.events = [];
    cooperAnalytics.goals.clear();
    cooperAnalytics.journeySteps = [];
    cooperAnalytics.frictionPoints = [];
    
    // Clear localStorage
    localStorage.clear();
    
    // Reset fetch mock
    fetch.mockClear();
  });

  describe('Goal Achievement Tracking', () => {
    test('should define and track goals correctly', () => {
      const goalId = 'test_analysis';
      const description = 'Complete brand analysis';
      const targetTime = 30000; // 30 seconds

      cooperAnalytics.defineGoal(goalId, description, targetTime);

      const goal = cooperAnalytics.goals.get(goalId);
      expect(goal).toBeDefined();
      expect(goal.description).toBe(description);
      expect(goal.targetTime).toBe(targetTime);
      expect(goal.completed).toBe(false);
    });

    test('should track goal steps and completion', () => {
      const goalId = 'test_analysis';
      cooperAnalytics.defineGoal(goalId, 'Test analysis');

      // Track steps
      cooperAnalytics.trackGoalStep(goalId, 'search_brand', { brand: 'TestBrand' });
      cooperAnalytics.trackGoalStep(goalId, 'view_results');

      const goal = cooperAnalytics.goals.get(goalId);
      expect(goal.steps).toHaveLength(2);
      expect(goal.steps[0].step).toBe('search_brand');
      expect(goal.steps[0].metadata.brand).toBe('TestBrand');

      // Complete goal
      cooperAnalytics.completeGoal(goalId, { success: true });
      expect(goal.completed).toBe(true);
      expect(goal.completionTime).toBeDefined();
    });

    test('useGoalTracking hook should work correctly', () => {
      const { result } = renderHook(() => 
        useGoalTracking('hook_test', 'Hook test goal', 5000)
      );

      expect(cooperAnalytics.goals.has('hook_test')).toBe(true);

      act(() => {
        result.current.trackStep('step1', { data: 'test' });
      });

      const goal = cooperAnalytics.goals.get('hook_test');
      expect(goal.steps).toHaveLength(1);
      expect(goal.steps[0].step).toBe('step1');

      act(() => {
        result.current.completeGoal({ result: 'success' });
      });

      expect(goal.completed).toBe(true);
    });
  });

  describe('Time-to-First-Insight Tracking', () => {
    test('should track time to first insight', () => {
      const timeMs = 2500;
      cooperAnalytics.trackTimeToFirstInsight(timeMs);

      expect(cooperAnalytics.events).toHaveLength(1);
      expect(cooperAnalytics.events[0].type).toBe('time_to_first_insight');
      expect(cooperAnalytics.events[0].data.timeMs).toBe(timeMs);
    });

    test('useInsightTracking hook should measure time correctly', async () => {
      const { result } = renderHook(() => useInsightTracking());

      act(() => {
        result.current.startInsightTimer();
      });

      // Simulate some time passing
      await new Promise(resolve => setTimeout(resolve, 100));

      act(() => {
        result.current.recordInsight({ type: 'sentiment_analysis' });
      });

      expect(cooperAnalytics.events.some(e => e.type === 'time_to_first_insight')).toBe(true);
    });
  });

  describe('User Journey Tracking', () => {
    test('should track journey steps', () => {
      cooperAnalytics.trackJourneyStep('page_view', { path: '/dashboard' });
      cooperAnalytics.trackJourneyStep('click_button', { button: 'analyze' });

      expect(cooperAnalytics.journeySteps).toHaveLength(2);
      expect(cooperAnalytics.journeySteps[0].action).toBe('page_view');
      expect(cooperAnalytics.journeySteps[1].action).toBe('click_button');
    });

    test('should detect friction points', () => {
      // Simulate repeated actions (user confusion)
      cooperAnalytics.trackJourneyStep('click_analyze');
      cooperAnalytics.trackJourneyStep('click_analyze');
      cooperAnalytics.trackJourneyStep('click_analyze');

      expect(cooperAnalytics.frictionPoints.length).toBeGreaterThan(0);
      expect(cooperAnalytics.frictionPoints[0].type).toBe('repeated_action');
    });

    test('useJourneyTracking hook should track actions', () => {
      const { result } = renderHook(() => useJourneyTracking());

      act(() => {
        result.current.trackAction('test_action', { context: 'test' });
      });

      expect(cooperAnalytics.journeySteps).toHaveLength(1);
      expect(cooperAnalytics.journeySteps[0].action).toBe('test_action');
    });
  });

  describe('Cooper Principle Adherence', () => {
    test('should track Cooper principle scores', () => {
      cooperAnalytics.trackCooperPrinciple('goal_directed', 85, { component: 'dashboard' });

      expect(cooperAnalytics.events).toHaveLength(1);
      expect(cooperAnalytics.events[0].type).toBe('cooper_adherence');
      expect(cooperAnalytics.events[0].data.principle).toBe('goal_directed');
      expect(cooperAnalytics.events[0].data.score).toBe(85);
    });

    test('useCooperTracking hook should track all principles', () => {
      const { result } = renderHook(() => useCooperTracking());

      act(() => {
        result.current.trackGoalDirected(90, { test: true });
        result.current.trackPerpetualIntermediate(85);
        result.current.trackInterfaceInvisibility(80);
        result.current.trackDirectManipulation(95);
        result.current.trackExciseElimination(88);
      });

      const adherenceEvents = cooperAnalytics.events.filter(e => e.type === 'cooper_adherence');
      expect(adherenceEvents).toHaveLength(5);
      
      const principles = adherenceEvents.map(e => e.data.principle);
      expect(principles).toContain('goal_directed');
      expect(principles).toContain('perpetual_intermediate');
      expect(principles).toContain('interface_invisibility');
      expect(principles).toContain('direct_manipulation');
      expect(principles).toContain('excise_elimination');
    });
  });

  describe('A/B Testing Framework', () => {
    test('should create and manage A/B tests', () => {
      const testConfig = {
        testId: 'test_onboarding',
        name: 'Onboarding Test',
        variants: ['original', 'simplified'],
        targetMetric: 'completion_rate'
      };

      const test = abTesting.createTest(testConfig);
      
      expect(test.testId).toBe('test_onboarding');
      expect(test.variants).toEqual(['original', 'simplified']);
      expect(test.status).toBe('running');
    });

    test('should assign variants consistently', () => {
      const testId = 'consistency_test';
      abTesting.createTest({
        testId,
        variants: ['A', 'B'],
        name: 'Consistency Test'
      });

      const userId = 'test_user_123';
      const variant1 = abTesting.getVariant(testId, userId);
      const variant2 = abTesting.getVariant(testId, userId);

      expect(variant1).toBe(variant2);
      expect(['A', 'B']).toContain(variant1);
    });

    test('should track conversions correctly', () => {
      const testId = 'conversion_test';
      abTesting.createTest({
        testId,
        variants: ['A', 'B'],
        name: 'Conversion Test'
      });

      const userId = 'test_user_456';
      const variant = abTesting.getVariant(testId, userId);
      
      abTesting.trackConversion(testId, 'primary', 1, userId);

      const test = abTesting.activeTests.get(testId);
      expect(test.results[variant].conversions).toBe(1);
    });

    test('useABTest hook should work correctly', () => {
      const testId = 'hook_ab_test';
      const variants = ['control', 'treatment'];

      abTesting.createTest({
        testId,
        variants,
        name: 'Hook AB Test'
      });

      const { result } = renderHook(() => useABTest(testId, variants));

      expect(['control', 'treatment']).toContain(result.current.variant);

      act(() => {
        result.current.trackConversion('click', 1);
      });

      const test = abTesting.activeTests.get(testId);
      const userVariant = result.current.variant;
      expect(test.results[userVariant].conversions).toBe(1);
    });

    test('should calculate statistical significance', () => {
      const testId = 'significance_test';
      const test = abTesting.createTest({
        testId,
        variants: ['A', 'B'],
        name: 'Significance Test'
      });

      // Simulate test data
      test.results.A = { users: 100, conversions: 20, conversionRate: 0.2 };
      test.results.B = { users: 100, conversions: 30, conversionRate: 0.3 };

      const significance = abTesting.calculateStatisticalSignificance(testId);
      
      expect(significance).toBeDefined();
      expect(significance.pValue).toBeDefined();
      expect(significance.confidence).toBeDefined();
      expect(significance.winner).toBe('B');
    });
  });

  describe('Analytics Dashboard', () => {
    test('should render analytics dashboard', async () => {
      // Mock API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          goalAchievement: [],
          timeToInsight: [],
          frictionPoints: [],
          cooperAdherence: [],
          abTestResults: [],
          userJourneys: []
        })
      });

      render(<AnalyticsDashboard />);

      expect(screen.getByText('Cooper Design Analytics')).toBeInTheDocument();
      expect(screen.getByText('Monitor user behavior and design principle adherence')).toBeInTheDocument();
    });

    test('should handle loading state', () => {
      // Mock delayed API response
      fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<AnalyticsDashboard />);

      expect(screen.getByText('Cooper Design Analytics')).toBeInTheDocument();
      // Should show loading animation
      const loader = document.querySelector('.animate-spin') || document.querySelector('.animate-pulse');
      expect(loader).toBeInTheDocument();
    });

    test('should handle API errors gracefully', async () => {
      // Mock API error
      fetch.mockRejectedValueOnce(new Error('API Error'));

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Cooper Design Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence', () => {
    test('should store metrics in localStorage', () => {
      cooperAnalytics.storeMetric('test_metric', { value: 123 });

      const stored = JSON.parse(localStorage.getItem('cooperMetrics'));
      expect(stored).toHaveLength(1);
      expect(stored[0].type).toBe('test_metric');
      expect(stored[0].data.value).toBe(123);
    });

    test('should limit stored metrics to prevent memory issues', () => {
      // Store more than the limit
      for (let i = 0; i < 150; i++) {
        cooperAnalytics.storeMetric('test_metric', { value: i });
      }

      const stored = JSON.parse(localStorage.getItem('cooperMetrics'));
      expect(stored.length).toBeLessThanOrEqual(100);
    });

    test('should store failed events for retry', () => {
      const event = { type: 'test_event', data: { test: true } };
      cooperAnalytics.storeEventLocally(event);

      const pending = JSON.parse(localStorage.getItem('pendingAnalyticsEvents'));
      expect(pending).toHaveLength(1);
      expect(pending[0].type).toBe('test_event');
    });
  });

  describe('User Type Classification', () => {
    test('should classify user types based on behavior', () => {
      // Simulate beginner behavior (high error rate)
      cooperAnalytics.journeySteps = [
        { action: 'step1', timestamp: Date.now() },
        { action: 'step2', timestamp: Date.now() }
      ];
      cooperAnalytics.frictionPoints = [
        { type: 'error_encountered' },
        { type: 'error_encountered' }
      ];

      const userType = cooperAnalytics.getUserType();
      expect(userType).toBe('beginner');
    });

    test('should identify expert users', () => {
      // Simulate expert behavior (low error rate, fast actions)
      cooperAnalytics.startTime = Date.now() - 5000; // 5 seconds ago
      cooperAnalytics.journeySteps = [
        { action: 'step1', timestamp: Date.now() - 4000 },
        { action: 'step2', timestamp: Date.now() - 3000 },
        { action: 'step3', timestamp: Date.now() - 2000 },
        { action: 'step4', timestamp: Date.now() - 1000 }
      ];
      cooperAnalytics.frictionPoints = []; // No friction

      const userType = cooperAnalytics.getUserType();
      expect(userType).toBe('expert');
    });

    test('should default to perpetual intermediate', () => {
      // Simulate moderate behavior
      cooperAnalytics.startTime = Date.now() - 10000;
      cooperAnalytics.journeySteps = [
        { action: 'step1', timestamp: Date.now() - 8000 },
        { action: 'step2', timestamp: Date.now() - 4000 }
      ];
      cooperAnalytics.frictionPoints = [{ type: 'long_pause' }];

      const userType = cooperAnalytics.getUserType();
      expect(userType).toBe('perpetual_intermediate');
    });
  });

  describe('Session Management', () => {
    test('should generate unique session IDs', () => {
      const sessionId1 = cooperAnalytics.generateSessionId();
      const sessionId2 = cooperAnalytics.generateSessionId();

      expect(sessionId1).not.toBe(sessionId2);
      expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    test('should provide session summary', () => {
      cooperAnalytics.defineGoal('test_goal', 'Test');
      cooperAnalytics.completeGoal('test_goal');
      cooperAnalytics.trackJourneyStep('test_step');
      cooperAnalytics.recordFrictionPoint('test_friction', {});

      const summary = cooperAnalytics.getSessionSummary();

      expect(summary.sessionId).toBeDefined();
      expect(summary.duration).toBeGreaterThan(0);
      expect(summary.totalSteps).toBe(1);
      expect(summary.goalsCompleted).toBe(1);
      expect(summary.frictionPoints).toBe(1);
      expect(summary.userType).toBeDefined();
    });
  });
});

describe('Integration Tests', () => {
  test('should integrate analytics with React components', () => {
    const TestComponent = () => {
      const { goal, journey, cooper } = useCooperAnalytics({
        goalId: 'integration_test',
        goalDescription: 'Integration test goal'
      });

      return (
        <div>
          <button onClick={() => goal?.trackStep('button_click')}>
            Track Step
          </button>
          <button onClick={() => journey?.trackAction('test_action')}>
            Track Action
          </button>
          <button onClick={() => cooper.trackGoalDirected(90)}>
            Track Cooper
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Track Step'));
    fireEvent.click(screen.getByText('Track Action'));
    fireEvent.click(screen.getByText('Track Cooper'));

    expect(cooperAnalytics.goals.has('integration_test')).toBe(true);
    expect(cooperAnalytics.journeySteps.length).toBeGreaterThan(0);
    expect(cooperAnalytics.events.some(e => e.type === 'cooper_adherence')).toBe(true);
  });
});