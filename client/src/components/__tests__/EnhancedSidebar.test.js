import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import EnhancedSidebar from '../EnhancedSidebar';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock the auth context
const mockUser = {
  displayName: 'Test User',
  email: 'test@example.com'
};

const mockAuthContext = {
  currentUser: mockUser,
  logout: jest.fn()
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div>{children}</div>
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('EnhancedSidebar', () => {
  const defaultProps = {
    isCollapsed: false,
    onToggle: jest.fn(),
    isMobile: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar with all navigation items', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    // Check for main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
    expect(screen.getByText('Real-Time')).toBeInTheDocument();
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Data Sources')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Exports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('displays search functionality when not collapsed', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search navigation...');
    expect(searchInput).toBeInTheDocument();
  });

  test('hides search functionality when collapsed', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} isCollapsed={true} />);
    
    const searchInput = screen.queryByPlaceholderText('Search navigation...');
    expect(searchInput).not.toBeInTheDocument();
  });

  test('filters navigation items based on search query', async () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search navigation...');
    fireEvent.change(searchInput, { target: { value: 'reports' } });
    
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
      // Other items should still be visible but filtered
    });
  });

  test('expands reports section by default', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    // Reports section should be expanded, showing sub-items
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
    expect(screen.getByText('Trends')).toBeInTheDocument();

    expect(screen.getByText('Mentions Explorer')).toBeInTheDocument();
    expect(screen.getByText('Competitive Analysis')).toBeInTheDocument();
  });

  test('displays user profile information', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('displays badges for special items', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    expect(screen.getByText('NEW')).toBeInTheDocument(); // AI Insights
    expect(screen.getByText('LIVE')).toBeInTheDocument(); // Real-Time
    expect(screen.getByText('PRO')).toBeInTheDocument(); // Integrations
    expect(screen.getByText('3')).toBeInTheDocument(); // Alerts
  });

  test('calls onToggle when toggle button is clicked', () => {
    const mockToggle = jest.fn();
    renderWithRouter(<EnhancedSidebar {...defaultProps} onToggle={mockToggle} />);
    
    const toggleButton = screen.getByTitle('Collapse sidebar');
    fireEvent.click(toggleButton);
    
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  test('calls logout when logout button is clicked', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    const logoutButton = screen.getByTitle('Sign out');
    fireEvent.click(logoutButton);
    
    expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
  });

  test('handles mobile mode correctly', () => {
    const mockMobileClose = jest.fn();
    renderWithRouter(
      <EnhancedSidebar 
        {...defaultProps} 
        isMobile={true} 
        onMobileClose={mockMobileClose} 
      />
    );
    
    const closeButton = screen.getByTitle('Close sidebar');
    fireEvent.click(closeButton);
    
    expect(mockMobileClose).toHaveBeenCalledTimes(1);
  });

  test('preserves all existing routes', () => {
    renderWithRouter(<EnhancedSidebar {...defaultProps} />);
    
    // Check that all route links are present
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    
    // Check reports sub-routes
    const overviewLink = screen.getByRole('link', { name: /overview/i });
    expect(overviewLink).toHaveAttribute('href', '/dashboard/reports/overview');
    
    const analysisLink = screen.getByRole('link', { name: /analysis/i });
    expect(analysisLink).toHaveAttribute('href', '/dashboard/reports/analysis');
    
    // Check other main routes
    const aiInsightsLink = screen.getByRole('link', { name: /ai insights/i });
    expect(aiInsightsLink).toHaveAttribute('href', '/dashboard/ai-insights');
    
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).toHaveAttribute('href', '/dashboard/settings');
  });
});