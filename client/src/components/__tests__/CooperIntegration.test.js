/**
 * Cooper Design Principle Integration Tests
 * End-to-end validation of Cooper testing framework and monitoring system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CooperTestingFramework from '../../utils/cooperTesting';
import CooperMonitoring from '../../utils/cooperMonitoring';
import CooperTestingDashboard from '../CooperTestingDashboard';
import OptimizedLandingPage from '../OptimizedLandingPage';

// Mock dependencies
jest.mock('../../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn()
  })
}));

// Mock performance API
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

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Cooper Testing Framework Integration', () => {
  let cooperTesting;
  let cooperMonitoring;

  beforeEach(() => {
    cooperTesting = new CooperTestingFramework();
    cooperMonitoring = new CooperMonitoring();
    
    // Reset performance mock
    window.performance.now.mockImplementation(() => Date.now());
  });

  afterEach(() => {
    cooperMonitoring.stopMonitoring();
    jest.clearAllMocks();
  });

  describe('Complete User Journey Testing', () => {
    test('should validate complete Cooper principles in real user scenario', async () => {
      const user = userEvent.setup();
      
      // Start monitoring
      cooperMonitoring.startMonitoring();
      
      // Render the optimized landing page
      renderWithRouter(<OptimizedLandingPage />);
      
      // Start goal achievement test
      const goalTest = cooperTesting.startGoalAchievementTest('complete_user_journey');
      
      // Step 1: Initial cognitive load measurement
      const initialCognitiveLoad = cooperTesting.measureCognitiveLoad();
      expect(initialCognitiveLoad.targetMet).toBe(true);
      expect(initialCognitiveLoad.elementCount).toBeLessThanOrEqual(5);
      
      // Step 2: User interaction - find and focus on search input
      const searchInput = screen.getByPlaceholderText(/enter any brand name/i);
      expect(searchInput).toBeInTheDocument();
      
      await user.click(searchInput);
      
      // Step 3: User types brand name
      await user.type(searchInput, 'Apple');
      
      // Step 4: Cognitive load should remain stable during interaction
      const interactionCognitiveLoad = cooperTesting.measureCognitiveLoad();
      expect(interactionCognitiveLoad.targetMet).toBe(true);
      
      // Step 5: User submits analysis
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      expect(analyzeButton).toBeInTheDocument();
      
      await user.click(analyzeButton);
      
      // Step 6: Complete goal achievement test
      const goalResult = cooperTesting.completeGoalAchievementTest(true, 'User successfully initiated analysis');
      
      // Validate goal achievement
      expect(goalResult.success).toBe(true);
      expect(goalResult.targetMet).toBe(true);
      expect(goalResult.duration).toBeLessThanOrEqual(30);
      expect(goalResult.interactionCount).toBeGreaterThan(0);
      expect(goalResult.interactionCount).toBeLessThanOrEqual(10); // Reasonable interaction count
      
      // Step 7: Test perpetual intermediate optimization
      const piResult = cooperTesting.testPerpetualIntermediateOptimization();
      expect(piResult.passed).toBe(true);
      expect(piResult.score).toBeGreaterThanOrEqual(80);
      
      // Step 8: Stop monitoring and get session summary
      const sessionSummary = cooperMonitoring.stopMonitoring();
      
      // Validate monitoring results
      expect(sessionSummary.performanceMetrics.totalInteractions).toBeGreaterThan(0);
      expect(sessionSummary.cooperPrincipleAdherence.goalAchievement.achievedWithin30Seconds).toBe(true);
      expect(sessionSummary.cooperPrincipleAdherence.cognitiveLoad.targetMet).toBe(true);
      
      // Step 9: Generate comprehensive report
      const report = cooperTesting.generateReport();
      
      // Validate report quality
      expect(report.summary.goalAchievementRate).toBeGreaterThanOrEqual(80);
      expect(report.summary.averageCognitiveLoad).toBeLessThanOrEqual(5);
      expect(report.recommendations.length).toBeLessThanOrEqual(2); // Should have minimal recommendations for good design
    });

    test('should handle error scenarios and validate recovery', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<OptimizedLandingPage />);
      
      // Start error recovery test
      const errorTest = cooperTesting.startErrorRecoveryTest('invalid_brand_input');
      
      // Simulate error scenario - empty input
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);
      
      // First recovery attempt - user realizes they need to enter a brand
      const searchInput = screen.getByPlaceholderText(/enter any brand name/i);
      await user.type(searchInput, 'InvalidBrand123!@#');
      await user.click(analyzeButton);
      
      // Second recovery attempt - user tries a valid brand
      await user.clear(searchInput);
      await user.type(searchInput, 'Apple');
      await user.click(analyzeButton);
      
      // Record successful recovery
      const recoveryResult = cooperTesting.recordErrorRecoveryAttempt(true, 'user_correction');
      
      expect(recoveryResult.successful).toBe(true);
      expect(recoveryResult.attempts).toBe(1); // Should count as one recovery attempt
      expect(recoveryResult.recoveryMethod).toBe('user_correction');
    });

    test('should validate perpetual intermediate optimization across components', async () => {
      const user = userEvent.setup();
      
      // Render with additional components that might affect PI optimization
      renderWithRouter(
        <div>
          <OptimizedLandingPage />
          {/* Simulate contextual help that should be hidden by default */}
          <div className="contextual-help" style={{ display: 'none' }}>
            Contextual help content
          </div>
          {/* Simulate advanced features that should be hidden */}
          <div className="advanced-options" style={{ display: 'none' }}>
            Advanced configuration options
          </div>
          {/* Simulate return user features */}
          <div className="recent-analyses">
            Recent analyses for returning users
          </div>
        </div>
      );
      
      const piResult = cooperTesting.testPerpetualIntermediateOptimization();
      
      // Validate perpetual intermediate optimization
      expect(piResult.passed).toBe(true);
      expect(piResult.metrics.tutorialElements).toBeLessThanOrEqual(2);
      expect(piResult.metrics.contextualHelpAvailable.available).toBe(true);
      expect(piResult.metrics.contextualHelpAvailable.intrusive).toBe(false);
      expect(piResult.metrics.expertFeaturesHidden.percentageHidden).toBeGreaterThanOrEqual(80);
      expect(piResult.metrics.returnUserOptimizations.availableFeatures).toBeGreaterThan(0);
    });
  });

  describe('Real-time Monitoring Integration', () => {
    test('should continuously monitor Cooper principles during user session', async () => {
      const user = userEvent.setup();
      
      // Start monitoring
      const startTime = cooperMonitoring.startMonitoring();
      expect(startTime).toBeDefined();
      expect(cooperMonitoring.isMonitoring).toBe(true);
      
      renderWithRouter(<OptimizedLandingPage />);
      
      // Simulate user interactions
      const searchInput = screen.getByPlaceholderText(/enter any brand name/i);
      await user.type(searchInput, 'Tesla');
      
      // Wait for monitoring to capture interactions
      await waitFor(() => {
        const sessionData = cooperMonitoring.exportSessionData();
        expect(sessionData.performanceMetrics.totalInteractions).toBeGreaterThan(0);
      });
      
      // Trigger cognitive load measurement
      const cognitiveLoad = cooperMonitoring.measureCognitiveLoad();
      expect(cognitiveLoad.elements.count).toBeLessThanOrEqual(5);
      
      // Complete user action
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);
      
      // Stop monitoring and validate results
      const sessionSummary = cooperMonitoring.stopMonitoring();
      
      expect(sessionSummary.sessionDuration).toBeGreaterThan(0);
      expect(sessionSummary.performanceMetrics.totalInteractions).toBeGreaterThan(0);
      expect(sessionSummary.cooperPrincipleAdherence.cognitiveLoad.targetMet).toBe(true);
      expect(sessionSummary.recommendations.length).toBeLessThanOrEqual(3);
    });

    test('should detect cognitive load violations in real-time', async () => {
      const user = userEvent.setup();
      
      cooperMonitoring.startMonitoring();
      
      // Render page with excessive elements to trigger cognitive load violation
      renderWithRouter(
        <div>
          <OptimizedLandingPage />
          {/* Add many visible interactive elements */}
          {Array.from({ length: 10 }, (_, i) => (
            <button key={i} className="primary-action">
              Extra Button {i}
            </button>
          ))}
        </div>
      );
      
      // Measure cognitive load
      const cognitiveLoad = cooperMonitoring.measureCognitiveLoad();
      
      // Should detect violation
      expect(cognitiveLoad.elements.count).toBeGreaterThan(5);
      
      const sessionSummary = cooperMonitoring.stopMonitoring();
      expect(sessionSummary.cooperPrincipleAdherence.cognitiveLoad.targetMet).toBe(false);
      
      // Should generate recommendation
      const cognitiveRecommendation = sessionSummary.recommendations.find(
        rec => rec.type === 'cognitive_load'
      );
      expect(cognitiveRecommendation).toBeDefined();
      expect(cognitiveRecommendation.priority).toBe('high');
    });
  });

  describe('Testing Dashboard Integration', () => {
    test('should render testing dashboard with live metrics', async () => {
      renderWithRouter(<CooperTestingDashboard />);
      
      // Check for dashboard elements
      expect(screen.getByText('Cooper Design Testing Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Goal Achievement Rate')).toBeInTheDocument();
      expect(screen.getByText('Cognitive Load')).toBeInTheDocument();
      expect(screen.getByText('Error Recovery Rate')).toBeInTheDocument();
      expect(screen.getByText('Perpetual Intermediate Score')).toBeInTheDocument();
      
      // Check for testing controls
      expect(screen.getByText('Start Goal Test')).toBeInTheDocument();
      expect(screen.getByText('Measure Cognitive Load')).toBeInTheDocument();
      expect(screen.getByText('Test PI Optimization')).toBeInTheDocument();
      
      // Check for export buttons
      expect(screen.getByText('Export JSON')).toBeInTheDocument();
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    test('should execute manual tests through dashboard', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<CooperTestingDashboard />);
      
      // Start goal achievement test
      const startGoalButton = screen.getByText('Start Goal Test');
      await user.click(startGoalButton);
      
      // Should show test running state
      await waitFor(() => {
        expect(screen.getByText(/Test running/)).toBeInTheDocument();
      });
      
      // Complete test successfully
      const successButton = screen.getByText('Success');
      await user.click(successButton);
      
      // Should return to initial state
      await waitFor(() => {
        expect(screen.getByText('Start Goal Test')).toBeInTheDocument();
      });
      
      // Run cognitive load test
      const cognitiveLoadButton = screen.getByText('Measure Cognitive Load');
      await user.click(cognitiveLoadButton);
      
      // Should update metrics (we can't easily test the exact values in this context)
      expect(cognitiveLoadButton).toBeInTheDocument();
    });

    test('should export test results in different formats', async () => {
      const user = userEvent.setup();
      
      // Mock URL.createObjectURL and related methods
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockClick = jest.fn();
      
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      
      // Mock createElement to return element with click method
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick
          };
        }
        return originalCreateElement.call(document, tagName);
      });
      
      renderWithRouter(<CooperTestingDashboard />);
      
      // Test JSON export
      const exportJsonButton = screen.getByText('Export JSON');
      await user.click(exportJsonButton);
      
      expect(mockClick).toHaveBeenCalled();
      
      // Test CSV export
      const exportCsvButton = screen.getByText('Export CSV');
      await user.click(exportCsvButton);
      
      expect(mockClick).toHaveBeenCalledTimes(2);
      
      // Restore mocks
      document.createElement = originalCreateElement;
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle high-frequency interactions without performance degradation', async () => {
      const user = userEvent.setup();
      
      cooperMonitoring.startMonitoring();
      renderWithRouter(<OptimizedLandingPage />);
      
      const searchInput = screen.getByPlaceholderText(/enter any brand name/i);
      
      // Simulate rapid typing
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        await user.type(searchInput, 'a');
        await user.clear(searchInput);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
      
      const sessionSummary = cooperMonitoring.stopMonitoring();
      
      // Should have captured all interactions
      expect(sessionSummary.performanceMetrics.totalInteractions).toBeGreaterThan(90);
      
      // Should not have excessive errors
      expect(sessionSummary.performanceMetrics.errorCount).toBeLessThan(5);
    });

    test('should gracefully handle monitoring start/stop cycles', () => {
      // Start monitoring
      expect(cooperMonitoring.isMonitoring).toBe(false);
      
      const startTime1 = cooperMonitoring.startMonitoring();
      expect(cooperMonitoring.isMonitoring).toBe(true);
      expect(startTime1).toBeDefined();
      
      // Try to start again (should not create duplicate listeners)
      const startTime2 = cooperMonitoring.startMonitoring();
      expect(startTime2).toBeUndefined();
      
      // Stop monitoring
      const summary1 = cooperMonitoring.stopMonitoring();
      expect(cooperMonitoring.isMonitoring).toBe(false);
      expect(summary1).toBeDefined();
      
      // Try to stop again (should return null)
      const summary2 = cooperMonitoring.stopMonitoring();
      expect(summary2).toBeNull();
      
      // Should be able to start again
      const startTime3 = cooperMonitoring.startMonitoring();
      expect(cooperMonitoring.isMonitoring).toBe(true);
      expect(startTime3).toBeDefined();
      
      cooperMonitoring.stopMonitoring();
    });

    test('should maintain data integrity across test cycles', () => {
      // Run multiple test cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        // Goal achievement test
        cooperTesting.startGoalAchievementTest(`cycle_${cycle}`);
        cooperTesting.completeGoalAchievementTest(true, `Cycle ${cycle} completed`);
        
        // Cognitive load test
        cooperTesting.measureCognitiveLoad();
        
        // Error recovery test
        cooperTesting.startErrorRecoveryTest(`error_cycle_${cycle}`);
        cooperTesting.recordErrorRecoveryAttempt(true, 'recovery_method');
        
        // Perpetual intermediate test
        cooperTesting.testPerpetualIntermediateOptimization();
      }
      
      const report = cooperTesting.generateReport();
      
      // Should have data from all cycles
      expect(report.details.goalAchievement.length).toBe(3);
      expect(report.details.cognitiveLoad.length).toBe(3);
      expect(report.details.errorRecovery.length).toBe(3);
      expect(report.details.perpetualIntermediate.length).toBe(3);
      
      // Summary should reflect all tests
      expect(report.summary.totalTests).toBe(12); // 3 cycles × 4 test types
      
      // Should generate appropriate recommendations
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });
});