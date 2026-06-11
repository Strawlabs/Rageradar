import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EnhancedHeader from '../EnhancedHeader';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
}));

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: null
    },
    logout: jest.fn()
  })
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EnhancedHeader', () => {
  const defaultProps = {
    title: 'Test Dashboard',
    isMobile: false,
    sidebarCollapsed: false,
    onToggleSidebar: jest.fn(),
    onToggleMobileMenu: jest.fn(),
    selectedBrand: 'Apple',
    onBrandChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'light'),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  test('renders header with title', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
  });

  test('shows mobile menu button on mobile', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} isMobile={true} />);
    expect(screen.getByLabelText('Open mobile menu')).toBeInTheDocument();
  });

  test('shows desktop sidebar toggle on desktop', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
  });

  test('displays brand selector with correct value', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    const brandSelect = screen.getByLabelText('Select brand to analyze');
    expect(brandSelect).toHaveValue('Apple');
  });

  test('calls onBrandChange when brand is changed', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    const brandSelect = screen.getByLabelText('Select brand to analyze');
    fireEvent.change(brandSelect, { target: { value: 'Google' } });
    expect(defaultProps.onBrandChange).toHaveBeenCalledWith('Google');
  });

  test('toggles theme when theme button is clicked', async () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    const themeButton = screen.getByLabelText('Switch to dark mode');
    fireEvent.click(themeButton);
    
    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  test('displays user avatar with fallback', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test User"
  });

  test('shows notification badge when there are unread notifications', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Unread notifications count
  });

  test('calls onToggleSidebar when sidebar toggle is clicked', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    const sidebarToggle = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(sidebarToggle);
    expect(defaultProps.onToggleSidebar).toHaveBeenCalled();
  });

  test('calls onToggleMobileMenu when mobile menu button is clicked', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} isMobile={true} />);
    const mobileMenuButton = screen.getByLabelText('Open mobile menu');
    fireEvent.click(mobileMenuButton);
    expect(defaultProps.onToggleMobileMenu).toHaveBeenCalled();
  });

  test('has proper accessibility attributes', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Help and support')).toBeInTheDocument();
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Select brand to analyze')).toBeInTheDocument();
  });

  test('displays proper theme toggle tooltip', () => {
    renderWithProviders(<EnhancedHeader {...defaultProps} />);
    const themeButton = screen.getByLabelText('Switch to dark mode');
    expect(themeButton).toHaveAttribute('title', 'Switch to dark mode');
  });
});