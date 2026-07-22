import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendlineChart from '../TrendlineChart';

// Mock recharts ResponsiveContainer to render children cleanly in Jest/JSDOM environment
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div style={{ width: 800, height: 400 }}>{children}</div>
  };
});

describe('TrendlineChart Component', () => {
  const mockTrendline = {
    timeline: [
      { timestamp: '2026-07-01T00:00:00.000Z', rageIndex: 30, mentionCount: 15 },
      { timestamp: '2026-07-02T00:00:00.000Z', rageIndex: 35, mentionCount: 20 },
      { timestamp: '2026-07-03T00:00:00.000Z', rageIndex: 85, mentionCount: 30 }
    ],
    movingAverages: {
      '7d': [
        { timestamp: '2026-07-01T00:00:00.000Z', value: 30 },
        { timestamp: '2026-07-02T00:00:00.000Z', value: 32 },
        { timestamp: '2026-07-03T00:00:00.000Z', value: 50 }
      ],
      '30d': [
        { timestamp: '2026-07-01T00:00:00.000Z', value: 30 },
        { timestamp: '2026-07-02T00:00:00.000Z', value: 31 },
        { timestamp: '2026-07-03T00:00:00.000Z', value: 48 }
      ]
    },
    spikes: [
      {
        timestamp: '2026-07-03T00:00:00.000Z',
        date: new Date('2026-07-03'),
        rageIndex: 85,
        rollingMean: 32,
        rollingStdDev: 5,
        deviation: 53,
        severity: 'critical',
        mentionCount: 30
      }
    ],
    summary: {
      avgRageIndex: 50,
      peakRageIndex: 85,
      lowestRageIndex: 30,
      volatility: 'high'
    }
  };

  test('renders chart summary stats accurately', () => {
    render(<TrendlineChart trendline={mockTrendline} />);
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('Peak')).toBeInTheDocument();
    expect(screen.getByText('Lowest')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  test('renders Detected Rage Spikes section with statistical deviation info', () => {
    render(<TrendlineChart trendline={mockTrendline} />);
    expect(screen.getByText('Detected Rage Spikes (Statistical Anomalies)')).toBeInTheDocument();
    expect(screen.getByText(/Score: 85 \(\+53 pts vs rolling mean 32\)/i)).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  test('renders gracefully when trendline data is empty or minimal', () => {
    const emptyTrendline = {
      timeline: [],
      movingAverage: [],
      movingAverages: { '7d': [], '30d': [] },
      spikes: []
    };
    const { container } = render(<TrendlineChart trendline={emptyTrendline} />);
    expect(screen.getByText('No trendline data available')).toBeInTheDocument();
  });
});
