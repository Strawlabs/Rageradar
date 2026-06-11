import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentAnalysisQuickAccess from '../RecentAnalysisQuickAccess';
import * as userContext from '../../utils/userContext';

// Mock the userContext module
jest.mock('../../utils/userContext', () => ({
  getRecentAnalyses: jest.fn(),
  trackUserInteraction: jest.fn(),
}));

describe('RecentAnalysisQuickAccess', () => {
  const mockRecentAnalyses = [
    {
      id: '1',
      brandName: 'Apple',
      category: 'technology',
      sentiment: 75,
      trend: 'up',
      timestamp: new Date().toISOString(),
      mentions: 150
    },
    {
      id: '2',
      brandName: 'Tesla',
      category: 'automotive',
      sentiment: -20,
      trend: 'down',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      mentions: 89
    },
    {
      id: '3',
      brandName: 'Netflix',
      category: 'entertainment',
      sentiment: 10,
      trend: 'stable',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      mentions: 234
    }
  ];

  beforeEach(() => {
    userContext.getRecentAnalyses.mockReturnValue(mockRecentAnalyses);
    userContext.trackUserInteraction.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders recent analyses section with modern styling', () => {
    render(<RecentAnalysisQuickAccess />);
    
    expect(screen.getByText('Recent Analyses')).toBeInTheDocument();
    expect(screen.getByText('3 recent brand analyses')).toBeInTheDocument();
  });

  test('displays analysis cards with proper information', () => {
    render(<RecentAnalysisQuickAccess />);
    
    // Check if brand names are displayed
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Tesla')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    
    // Check if categories are displayed
    expect(screen.getByText('technology')).toBeInTheDocument();
    expect(screen.getByText('automotive')).toBeInTheDocument();
    expect(screen.getByText('entertainment')).toBeInTheDocument();
  });

  test('shows correct sentiment badges', () => {
    render(<RecentAnalysisQuickAccess />);
    
    // Check for sentiment indicators (emojis)
    expect(screen.getByText('😊')).toBeInTheDocument(); // Positive sentiment for Apple
    expect(screen.getByText('😠')).toBeInTheDocument(); // Negative sentiment for Tesla
    expect(screen.getByText('😐')).toBeInTheDocument(); // Neutral sentiment for Netflix
  });

  test('displays trend indicators correctly', () => {
    render(<RecentAnalysisQuickAccess />);
    
    // Check for trend icons
    expect(screen.getByText('📈')).toBeInTheDocument(); // Up trend
    expect(screen.getByText('📉')).toBeInTheDocument(); // Down trend
    expect(screen.getByText('➡️')).toBeInTheDocument(); // Stable trend
  });

  test('shows status indicators based on analysis age', () => {
    render(<RecentAnalysisQuickAccess />);
    
    // Check for status badges
    expect(screen.getByText('Live')).toBeInTheDocument(); // Recent analysis
    expect(screen.getByText('Recent')).toBeInTheDocument(); // 2 hours ago
    expect(screen.getByText('Recent')).toBeInTheDocument(); // 1 day ago
  });

  test('calls onBrandSelect when analysis card is clicked', () => {
    const mockOnBrandSelect = jest.fn();
    render(<RecentAnalysisQuickAccess onBrandSelect={mockOnBrandSelect} />);
    
    const appleCard = screen.getByText('Apple').closest('div[role="button"]');
    fireEvent.click(appleCard);
    
    expect(mockOnBrandSelect).toHaveBeenCalledWith('Apple');
    expect(userContext.trackUserInteraction).toHaveBeenCalledWith('quick_access_used', { brandName: 'Apple' });
  });

  test('displays empty state when no analyses are available', () => {
    userContext.getRecentAnalyses.mockReturnValue([]);
    render(<RecentAnalysisQuickAccess />);
    
    expect(screen.getByText('No recent analyses')).toBeInTheDocument();
    expect(screen.getByText('Start analyzing brands to see your recent work here')).toBeInTheDocument();
  });

  test('shows "View All" button when there are more than 8 analyses', () => {
    const manyAnalyses = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      brandName: `Brand ${i + 1}`,
      category: 'technology',
      sentiment: 50,
      trend: 'stable',
      timestamp: new Date().toISOString(),
      mentions: 100
    }));
    
    userContext.getRecentAnalyses.mockReturnValue(manyAnalyses);
    render(<RecentAnalysisQuickAccess />);
    
    expect(screen.getByText('View 2 more analyses')).toBeInTheDocument();
  });

  test('applies hover effects and interactive styling', () => {
    render(<RecentAnalysisQuickAccess />);
    
    const appleCard = screen.getByText('Apple').closest('div[role="button"]');
    expect(appleCard).toHaveClass('cursor-pointer');
    expect(appleCard).toHaveClass('hover:shadow-lg');
  });

  test('displays mentions count correctly', () => {
    render(<RecentAnalysisQuickAccess />);
    
    expect(screen.getByText('150 mentions')).toBeInTheDocument();
    expect(screen.getByText('89 mentions')).toBeInTheDocument();
    expect(screen.getByText('234 mentions')).toBeInTheDocument();
  });

  test('shows progress bars for sentiment strength', () => {
    render(<RecentAnalysisQuickAccess />);
    
    // Check for sentiment strength labels
    const sentimentStrengthLabels = screen.getAllByText('Sentiment Strength');
    expect(sentimentStrengthLabels).toHaveLength(3);
    
    // Check for percentage values
    expect(screen.getByText('75%')).toBeInTheDocument(); // Apple
    expect(screen.getByText('20%')).toBeInTheDocument(); // Tesla (absolute value)
    expect(screen.getByText('10%')).toBeInTheDocument(); // Netflix
  });
});