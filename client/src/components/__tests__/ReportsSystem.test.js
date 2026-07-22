import { TextEncoder, TextDecoder } from 'util';
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
jest.mock('jspdf', () => jest.fn().mockImplementation(() => ({
  text: jest.fn(),
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  save: jest.fn(),
  addPage: jest.fn(),
  splitTextToSize: jest.fn().mockReturnValue(['line1', 'line2'])
})));

jest.mock('html2canvas', () => jest.fn().mockResolvedValue({
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock')
}));

jest.mock('../PowerPointExport', () => ({
  generatePowerPointFile: jest.fn().mockResolvedValue(true)
}));

import ReportExport from '../ReportExport';
import ReportsEvents from '../ReportsEvents';

// Mock contexts and dependencies
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test-user', email: 'test@example.com' } })
}));

jest.mock('../../contexts/BrandContext', () => ({
  useBrand: () => ({ currentBrand: { id: 'test-brand', brandName: 'Test Brand', rageIndex: 32 } })
}));

jest.mock('../../contexts/FilterContext', () => ({
  useFilters: () => ({ filters: { timeRange: 'Last 7 days' }, updateFilter: jest.fn() })
}));

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { events: [] } }),
  post: jest.fn().mockResolvedValue({ data: { event: { eventId: 'evt-test', eventName: 'Created Event', status: 'In Progress' } } }),
  delete: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// Mock chart.js to prevent rendering issues in jsdom
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="mock-line-chart">Line Chart</div>
}));

describe('Reports & Events System', () => {
  describe('ReportExport Component', () => {
    const mockOnClose = jest.fn();

    it('renders export modal with options', () => {
      render(
        <ReportExport
          analysisData={{ rageIndex: 35, totalMentions: 500 }}
          brandName="Test Brand"
          reportType="overview"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Export Report')).toBeInTheDocument();
      expect(screen.getByText(/Report Focus: Executive Overview/i)).toBeInTheDocument();
      expect(screen.getByText('PDF Report')).toBeInTheDocument();
      expect(screen.getByText('CSV Data')).toBeInTheDocument();
      expect(screen.getByText('PowerPoint')).toBeInTheDocument();
    });

    it('displays dynamic report focus based on reportType prop', () => {
      const { rerender } = render(
        <ReportExport
          analysisData={{ rageIndex: 35 }}
          brandName="Test Brand"
          reportType="sentiment"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Report Focus: Detailed Sentiment Analysis/i)).toBeInTheDocument();

      rerender(
        <ReportExport
          analysisData={{ rageIndex: 35 }}
          brandName="Test Brand"
          reportType="competitive"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Report Focus: Competitive Intelligence Benchmark/i)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(
        <ReportExport
          analysisData={{ rageIndex: 35 }}
          brandName="Test Brand"
          reportType="overview"
          onClose={mockOnClose}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('ReportsEvents Component', () => {
    it('renders event tracking dashboard and KPI cards', async () => {
      render(
        <BrowserRouter>
          <ReportsEvents />
        </BrowserRouter>
      );

      expect(await screen.findByText('Event-Driven Sentiment Tracking')).toBeInTheDocument();
      expect(screen.getByText('New Tracked Event')).toBeInTheDocument();
      expect(screen.getByText('Tracked Events')).toBeInTheDocument();
      expect(screen.getByText('Avg Rage Shift')).toBeInTheDocument();
      expect(screen.getByText('Major Rage Spikes')).toBeInTheDocument();
    });

    it('opens new event creation modal when button is clicked', async () => {
      render(
        <BrowserRouter>
          <ReportsEvents />
        </BrowserRouter>
      );

      const newBtn = await screen.findByText('New Tracked Event');
      fireEvent.click(newBtn);

      expect(await screen.findByText('Create Tracked Event')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. v2.5 Global Product Launch')).toBeInTheDocument();
    });
  });
});
