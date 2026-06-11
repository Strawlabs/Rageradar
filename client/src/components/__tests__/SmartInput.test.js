import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartInput from '../SmartInput';

describe('SmartInput Component', () => {
  const mockOnAnalyze = jest.fn();
  const mockOnBrandSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct placeholder text', () => {
    render(<SmartInput onAnalyze={mockOnAnalyze} />);
    
    const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
    expect(input).toBeInTheDocument();
  });

  test('shows suggestions when input is focused', async () => {
    render(<SmartInput onAnalyze={mockOnAnalyze} />);
    
    const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText('Smart suggestions')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
    });
  });

  test('calls onAnalyze when suggestion is clicked', async () => {
    render(<SmartInput onAnalyze={mockOnAnalyze} onBrandSelect={mockOnBrandSelect} />);
    
    const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
    fireEvent.focus(input);
    
    await waitFor(() => {
      const appleButton = screen.getByText('Apple');
      fireEvent.click(appleButton);
    });
    
    expect(mockOnBrandSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Apple' })
    );
    expect(mockOnAnalyze).toHaveBeenCalledWith('Apple');
  });

  test('calls onAnalyze when Enter key is pressed', () => {
    render(<SmartInput onAnalyze={mockOnAnalyze} />);
    
    const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
    fireEvent.change(input, { target: { value: 'Microsoft' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnAnalyze).toHaveBeenCalledWith('Microsoft');
  });

  test('shows loading state when analyzing', async () => {
    const slowAnalyze = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<SmartInput onAnalyze={slowAnalyze} />);
    
    const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
    const button = screen.getByLabelText(/Analyze brand sentiment/);
    
    fireEvent.change(input, { target: { value: 'Test Brand' } });
    fireEvent.click(button);
    
    expect(screen.getByLabelText('Analyzing...')).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(<SmartInput onAnalyze={mockOnAnalyze} />);
    
    const input = screen.getByLabelText('Enter brand name for sentiment analysis');
    const button = screen.getByLabelText(/Analyze brand sentiment/);
    
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  test('auto-focuses input when autoFocus is true', () => {
    render(<SmartInput onAnalyze={mockOnAnalyze} autoFocus={true} />);
    
    const input = screen.getByPlaceholderText('Apple, Tesla, Netflix...');
    expect(input).toHaveFocus();
  });
});