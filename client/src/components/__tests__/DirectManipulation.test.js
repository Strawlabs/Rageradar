import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartInput from '../SmartInput';
import PlatformFilter from '../PlatformFilter';
import TimeRangeSelector from '../TimeRangeSelector';
import DirectManipulationDemo from '../DirectManipulationDemo';

// Mock components that might have external dependencies
jest.mock('../InteractiveChart', () => {
  return function MockInteractiveChart({ onDataPointClick, onTimeRangeSelect }) {
    return (
      <div data-testid="interactive-chart">
        <button 
          onClick={() => onDataPointClick({ date: '2024-01-01', sentiment: 75 }, 0)}
          data-testid="chart-data-point"
        >
          Data Point
        </button>
        <button 
          onClick={() => onTimeRangeSelect({ startDate: '2024-01-01', endDate: '2024-01-07' })}
          data-testid="chart-time-range"
        >
          Select Range
        </button>
      </div>
    );
  };
});

describe('Direct Manipulation Features', () => {
  describe('SmartInput Component', () => {
    test('renders with placeholder text', () => {
      render(<SmartInput />);
      expect(screen.getByPlaceholderText('Apple, Tesla, Netflix...')).toBeInTheDocument();
    });

    test('shows suggestions on focus', async () => {
      render(<SmartInput />);
      const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
      
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(screen.getByText('Smart suggestions')).toBeInTheDocument();
      });
    });

    test('calls onBrandSelect when suggestion is clicked', async () => {
      const mockOnBrandSelect = jest.fn();
      render(<SmartInput onBrandSelect={mockOnBrandSelect} />);
      
      const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
      fireEvent.focus(input);
      
      await waitFor(() => {
        const appleSuggestion = screen.getByText('Apple');
        fireEvent.click(appleSuggestion);
      });
      
      expect(mockOnBrandSelect).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Apple' })
      );
    });

    test('has proper hover states on suggestions', async () => {
      render(<SmartInput />);
      const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
      
      fireEvent.focus(input);
      
      await waitFor(() => {
        const suggestion = screen.getByText('Apple').closest('button');
        expect(suggestion).toHaveClass('hover:scale-[1.02]');
      });
    });
  });

  describe('PlatformFilter Component', () => {
    test('renders all platform options', () => {
      render(<PlatformFilter selectedPlatforms={[]} onChange={() => {}} />);
      
      expect(screen.getByText('Reddit')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Product Hunt')).toBeInTheDocument();
      expect(screen.getByText('Trustpilot')).toBeInTheDocument();
    });

    test('shows selected platforms with proper styling', () => {
      render(<PlatformFilter selectedPlatforms={['reddit']} onChange={() => {}} />);
      
      const redditButton = screen.getByText('Reddit').closest('button');
      expect(redditButton).toHaveClass('bg-orange-500');
    });

    test('calls onChange when platform is toggled', () => {
      const mockOnChange = jest.fn();
      render(<PlatformFilter selectedPlatforms={[]} onChange={mockOnChange} />);
      
      const redditButton = screen.getByText('Reddit').closest('button');
      fireEvent.click(redditButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(['reddit']);
    });

    test('select all functionality works', () => {
      const mockOnChange = jest.fn();
      render(<PlatformFilter selectedPlatforms={[]} onChange={mockOnChange} />);
      
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining(['reddit', 'twitter', 'producthunt', 'trustpilot', 'google', 'youtube'])
      );
    });

    test('has proper hover effects', () => {
      render(<PlatformFilter selectedPlatforms={[]} onChange={() => {}} />);
      
      const redditButton = screen.getByText('Reddit').closest('button');
      expect(redditButton).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('TimeRangeSelector Component', () => {
    test('renders with default selection', () => {
      render(<TimeRangeSelector value="7d" onChange={() => {}} />);
      
      expect(screen.getByText('7 Days')).toBeInTheDocument();
    });

    test('opens dropdown when clicked', () => {
      render(<TimeRangeSelector value="7d" onChange={() => {}} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Quick Select')).toBeInTheDocument();
    });

    test('calls onChange when range is selected', () => {
      const mockOnChange = jest.fn();
      render(<TimeRangeSelector value="7d" onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const thirtyDayOption = screen.getByText('30D');
      fireEvent.click(thirtyDayOption);
      
      expect(mockOnChange).toHaveBeenCalledWith('30d');
    });

    test('shows custom range picker when enabled', () => {
      render(<TimeRangeSelector value="7d" onChange={() => {}} showCustomRange={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Custom Range')).toBeInTheDocument();
    });
  });

  describe('DirectManipulationDemo Component', () => {
    test('renders all sections', () => {
      render(<DirectManipulationDemo />);
      
      expect(screen.getByText('Direct Manipulation Features')).toBeInTheDocument();
      expect(screen.getByText('1. Click-to-Select Brand Suggestions')).toBeInTheDocument();
      expect(screen.getByText('2. Enhanced Time Range Selection')).toBeInTheDocument();
      expect(screen.getByText('3. Platform Toggle Functionality')).toBeInTheDocument();
      expect(screen.getByText('4. Interactive Chart with Direct Manipulation')).toBeInTheDocument();
    });

    test('handles brand selection', async () => {
      render(<DirectManipulationDemo />);
      
      const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
      fireEvent.focus(input);
      
      await waitFor(() => {
        const appleSuggestion = screen.getByText('Apple');
        fireEvent.click(appleSuggestion);
      });
      
      expect(screen.getByText('✓ Selected brand:')).toBeInTheDocument();
    });

    test('handles chart interactions', () => {
      render(<DirectManipulationDemo />);
      
      const dataPointButton = screen.getByTestId('chart-data-point');
      fireEvent.click(dataPointButton);
      
      expect(screen.getByText('Selected Data Point')).toBeInTheDocument();
    });

    test('shows Cooper principles section', () => {
      render(<DirectManipulationDemo />);
      
      expect(screen.getByText('Cooper\'s Direct Manipulation Principles Applied')).toBeInTheDocument();
      expect(screen.getByText('See and Point')).toBeInTheDocument();
      expect(screen.getByText('Immediate Results')).toBeInTheDocument();
      expect(screen.getByText('Spatial Memory')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    test('SmartInput has proper ARIA labels', () => {
      render(<SmartInput />);
      
      const input = screen.getByLabelText('Enter brand name for sentiment analysis');
      expect(input).toBeInTheDocument();
    });

    test('PlatformFilter buttons have proper ARIA states', () => {
      render(<PlatformFilter selectedPlatforms={['reddit']} onChange={() => {}} />);
      
      const redditButton = screen.getByLabelText('Deselect Reddit platform');
      expect(redditButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('TimeRangeSelector has proper ARIA attributes', () => {
      render(<TimeRangeSelector value="7d" onChange={() => {}} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });

  describe('Keyboard Navigation', () => {
    test('SmartInput handles Enter key', () => {
      const mockOnAnalyze = jest.fn();
      render(<SmartInput onAnalyze={mockOnAnalyze} />);
      
      const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
      fireEvent.change(input, { target: { value: 'Apple' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnAnalyze).toHaveBeenCalledWith('Apple');
    });

    test('SmartInput handles Escape key', async () => {
      render(<SmartInput />);
      
      const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(screen.getByText('Smart suggestions')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(input, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Smart suggestions')).not.toBeInTheDocument();
      });
    });
  });

  describe('Visual Feedback', () => {
    test('buttons have proper hover and active states', () => {
      render(<PlatformFilter selectedPlatforms={[]} onChange={() => {}} />);
      
      const redditButton = screen.getByText('Reddit').closest('button');
      expect(redditButton).toHaveClass('hover:scale-[1.02]', 'active:scale-[0.98]');
    });

    test('selected states are visually distinct', () => {
      render(<PlatformFilter selectedPlatforms={['reddit']} onChange={() => {}} />);
      
      const redditButton = screen.getByText('Reddit').closest('button');
      const twitterButton = screen.getByText('Twitter').closest('button');
      
      expect(redditButton).toHaveClass('bg-orange-500');
      expect(twitterButton).not.toHaveClass('bg-orange-500');
    });
  });
});