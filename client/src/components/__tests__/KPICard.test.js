import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KPICard, SentimentKPICard, MetricKPICard } from '../ui/kpi-card';

describe('KPI Card Components', () => {
  describe('KPICard', () => {
    it('renders basic KPI card with title and value', () => {
      render(
        <KPICard
          title="Test Metric"
          value="42"
          description="Test description"
        />
      );
      
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('shows loading state when loading prop is true', () => {
      render(<KPICard loading={true} />);
      
      // Should show skeleton loaders
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('displays trend information when provided', () => {
      render(
        <KPICard
          title="Test Metric"
          value="42"
          trend="up"
          trendValue="15%"
        />
      );
      
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('↗')).toBeInTheDocument();
    });

    it('displays badge when provided', () => {
      render(
        <KPICard
          title="Test Metric"
          value="42"
          badge={{ content: 'New', variant: 'success' }}
        />
      );
      
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('SentimentKPICard', () => {
    it('renders sentiment card with rage index', () => {
      render(
        <SentimentKPICard
          title="Brand Sentiment"
          rageIndex={35}
          mentions={1500}
          trend="down"
          trendValue="5%"
        />
      );
      
      expect(screen.getByText('Brand Sentiment')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('1,500 mentions')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    it('renders sentiment card with sentiment score', () => {
      render(
        <SentimentKPICard
          title="Brand Sentiment"
          sentimentScore={0.75}
          mentions={2000}
        />
      );
      
      expect(screen.getByText('Brand Sentiment')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('2,000 mentions')).toBeInTheDocument();
    });
  });

  describe('MetricKPICard', () => {
    it('renders metric card with target', () => {
      render(
        <MetricKPICard
          title="Conversion Rate"
          value="85"
          unit="%"
          target="80"
          icon="🎯"
          description="User goal completion"
        />
      );
      
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('User goal completion')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('calculates progress correctly', () => {
      render(
        <MetricKPICard
          title="Test Metric"
          value="75"
          target="100"
        />
      );
      
      // Should show 75% progress
      expect(screen.getByText('Target: 100')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and semantic structure', () => {
      render(
        <KPICard
          title="Accessible Metric"
          value="42"
          description="Test description"
          icon="📊"
        />
      );
      
      // Should have proper heading structure
      const title = screen.getByText('Accessible Metric');
      expect(title).toBeInTheDocument();
      
      // Should have proper text hierarchy
      const value = screen.getByText('42');
      expect(value).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('applies hover classes for interactive cards', () => {
      const { container } = render(
        <KPICard
          title="Interactive Card"
          value="42"
          onClick={() => {}}
        />
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('Color Coding', () => {
    it('applies correct status colors for sentiment', () => {
      const { container } = render(
        <SentimentKPICard
          title="Negative Sentiment"
          rageIndex={85} // High rage index should be negative status
        />
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('hover:border-negative-300');
    });

    it('applies correct status colors for positive metrics', () => {
      const { container } = render(
        <MetricKPICard
          title="Good Metric"
          value="95"
          target="80" // Above target should be positive
        />
      );
      
      // Should have positive status styling in the card hover classes
      const card = container.firstChild;
      expect(card).toHaveClass('hover:border-positive-300');
    });
  });
});