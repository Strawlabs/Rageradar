import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContextualHelp, { SmartHelpButton, ProgressiveDisclosure } from '../ContextualHelp';
import OptimizedOnboarding, { ContextualWelcome, FeatureDiscovery } from '../OptimizedOnboarding';
import { getUserContext, updateUserContext } from '../../utils/userContext';

// Mock the user context utilities
jest.mock('../../utils/userContext', () => ({
  getUserContext: jest.fn(),
  updateUserContext: jest.fn(),
  trackUserInteraction: jest.fn(),
  isReturningUser: jest.fn(),
  getWorkflowOptimizations: jest.fn()
}));

describe('Perpetual Intermediate Optimization', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('ContextualHelp', () => {
    it('should not show help indicator for experienced users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 15,
        interactions: []
      });

      render(
        <ContextualHelp context="test" helpContent="Test help">
          <button>Test Button</button>
        </ContextualHelp>
      );

      // Should not show help indicator for experienced users
      expect(screen.queryByLabelText('Get help')).not.toBeInTheDocument();
    });

    it('should show subtle help indicator for new users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 0,
        interactions: []
      });

      render(
        <ContextualHelp context="test" helpContent="Test help">
          <button>Test Button</button>
        </ContextualHelp>
      );

      // Should show help indicator for new users
      expect(screen.getByLabelText('Get help')).toBeInTheDocument();
    });

    it('should show help on hover with delay', async () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 2,
        interactions: []
      });

      render(
        <ContextualHelp context="test" helpContent="Test help content" delay={100}>
          <button>Test Button</button>
        </ContextualHelp>
      );

      const button = screen.getByText('Test Button');
      fireEvent.mouseEnter(button);

      // Should not show immediately
      expect(screen.queryByText('Test help content')).not.toBeInTheDocument();

      // Should show after delay
      await waitFor(() => {
        expect(screen.getByText('Test help content')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('SmartHelpButton', () => {
    it('should not show for experienced users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 10,
        interactions: []
      });

      const mockOnHelp = jest.fn();
      render(<SmartHelpButton onHelpRequest={mockOnHelp} />);

      // Should not render for experienced users
      expect(screen.queryByLabelText('Get help')).not.toBeInTheDocument();
    });

    it('should show for users who might need help', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 2,
        interactions: [{ action: 'error_occurred' }]
      });

      const mockOnHelp = jest.fn();
      render(<SmartHelpButton onHelpRequest={mockOnHelp} />);

      // Should show for users with errors
      expect(screen.getByLabelText('Get help')).toBeInTheDocument();
    });
  });

  describe('ProgressiveDisclosure', () => {
    it('should not show advanced features for new users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 1,
        interactions: []
      });

      render(
        <ProgressiveDisclosure
          threshold={3}
          label="Advanced options"
          advancedContent={<div>Advanced content</div>}
        >
          <div>Basic content</div>
        </ProgressiveDisclosure>
      );

      // Should show basic content
      expect(screen.getByText('Basic content')).toBeInTheDocument();
      
      // Should not show advanced options
      expect(screen.queryByText('Advanced options')).not.toBeInTheDocument();
    });

    it('should show advanced features for experienced users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 5,
        interactions: []
      });

      render(
        <ProgressiveDisclosure
          threshold={3}
          label="Advanced options"
          advancedContent={<div>Advanced content</div>}
        >
          <div>Basic content</div>
        </ProgressiveDisclosure>
      );

      // Should show basic content
      expect(screen.getByText('Basic content')).toBeInTheDocument();
      
      // Should show advanced options toggle
      expect(screen.getByText('Advanced options')).toBeInTheDocument();
    });

    it('should expand advanced content when clicked', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 5,
        interactions: []
      });

      render(
        <ProgressiveDisclosure
          threshold={3}
          label="Advanced options"
          advancedContent={<div>Advanced content</div>}
        >
          <div>Basic content</div>
        </ProgressiveDisclosure>
      );

      // Click to expand
      fireEvent.click(screen.getByText('Advanced options'));

      // Should show advanced content
      expect(screen.getByText('Advanced content')).toBeInTheDocument();
    });
  });

  describe('OptimizedOnboarding', () => {
    it('should not show for users who completed onboarding', () => {
      localStorage.setItem('rageradar-onboarding-completed', 'true');
      getUserContext.mockReturnValue({
        totalAnalyses: 1,
        interactions: []
      });

      const mockOnComplete = jest.fn();
      render(<OptimizedOnboarding onComplete={mockOnComplete} />);

      // Should not show onboarding
      expect(screen.queryByText('Welcome to RageRadar')).not.toBeInTheDocument();
    });

    it('should show minimal onboarding for new users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 0,
        interactions: []
      });

      const mockOnComplete = jest.fn();
      render(<OptimizedOnboarding onComplete={mockOnComplete} />);

      // Should show minimal onboarding
      expect(screen.getByText('Welcome to RageRadar')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should offer detailed guidance when requested', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 0,
        interactions: []
      });

      const mockOnComplete = jest.fn();
      render(<OptimizedOnboarding onComplete={mockOnComplete} />);

      // Should show option for guidance
      expect(screen.getByText('Need guidance?')).toBeInTheDocument();

      // Click for guidance
      fireEvent.click(screen.getByText('Need guidance?'));

      // Should show guidance content
      expect(screen.getByText('Quick Tips')).toBeInTheDocument();
    });
  });

  describe('ContextualWelcome', () => {
    it('should show welcome for returning users after long absence', () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 10);
      
      getUserContext.mockReturnValue({
        totalAnalyses: 5,
        lastVisit: weekAgo.toISOString(),
        interactions: []
      });

      render(<ContextualWelcome />);

      // Should show welcome message
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      expect(screen.getByText(/Your preferences have been optimized/)).toBeInTheDocument();
    });

    it('should not show for recent visitors', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      getUserContext.mockReturnValue({
        totalAnalyses: 5,
        lastVisit: yesterday.toISOString(),
        interactions: []
      });

      render(<ContextualWelcome />);

      // Should not show welcome message
      expect(screen.queryByText('Welcome back!')).not.toBeInTheDocument();
    });
  });

  describe('FeatureDiscovery', () => {
    it('should show new feature indicator for experienced users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 8,
        interactions: []
      });

      render(
        <FeatureDiscovery feature="test-feature" threshold={5}>
          <button>Feature Button</button>
        </FeatureDiscovery>
      );

      // Should show new feature indicator
      const container = screen.getByText('Feature Button').parentElement;
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should not show indicator for new users', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 2,
        interactions: []
      });

      render(
        <FeatureDiscovery feature="test-feature" threshold={5}>
          <button>Feature Button</button>
        </FeatureDiscovery>
      );

      // Should not show new feature indicator
      const container = screen.getByText('Feature Button').parentElement;
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });

    it('should hide indicator after interaction', () => {
      getUserContext.mockReturnValue({
        totalAnalyses: 8,
        interactions: []
      });

      render(
        <FeatureDiscovery feature="test-feature" threshold={5}>
          <button>Feature Button</button>
        </FeatureDiscovery>
      );

      // Click the feature
      fireEvent.click(screen.getByText('Feature Button'));

      // Should mark as seen and hide indicator
      expect(localStorage.getItem('feature-seen-test-feature')).toBe('true');
    });
  });

  describe('Integration Tests', () => {
    it('should provide appropriate experience for perpetual intermediate', () => {
      // Simulate a perpetual intermediate user (Brand Manager Sarah)
      getUserContext.mockReturnValue({
        totalAnalyses: 7,
        primaryGoal: 'quick_check',
        industry: 'technology',
        preferredMetrics: ['overall_sentiment', 'trend_direction'],
        interactions: []
      });

      render(
        <div>
          <ContextualHelp context="brand_input" helpContent="Help content">
            <input placeholder="Enter brand name" />
          </ContextualHelp>
          
          <ProgressiveDisclosure
            threshold={5}
            label="Advanced options"
            advancedContent={<div>Time range selector</div>}
          >
            <div>Basic analysis</div>
          </ProgressiveDisclosure>
          
          <SmartHelpButton onHelpRequest={() => {}} />
        </div>
      );

      // Should show basic content
      expect(screen.getByPlaceholderText('Enter brand name')).toBeInTheDocument();
      expect(screen.getByText('Basic analysis')).toBeInTheDocument();
      
      // Should show advanced options for experienced user
      expect(screen.getByText('Advanced options')).toBeInTheDocument();
      
      // Should not show help button for experienced user
      expect(screen.queryByLabelText('Get help')).not.toBeInTheDocument();
      
      // Should not show contextual help indicator
      expect(screen.queryByText('?')).not.toBeInTheDocument();
    });
  });
});