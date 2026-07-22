import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';

let mockAuthContext = {
  currentUser: null,
  userPlan: null,
  loading: false,
  isAdmin: jest.fn().mockReturnValue(false),
  isTrialExpired: jest.fn().mockReturnValue(false)
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

describe('PrivateRoute Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext = {
      currentUser: null,
      userPlan: null,
      loading: false,
      isAdmin: jest.fn().mockReturnValue(false),
      isTrialExpired: jest.fn().mockReturnValue(false)
    };
  });

  const renderRoute = (ui, initialUrl = '/protected') => {
    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/auth" element={<div>Auth Page</div>} />
          <Route path="/protected" element={ui} />
          <Route path="/pricing" element={<div>Pricing Page</div>} />
          <Route path="/analyze" element={<div>Analyze Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading spinner when auth is loading', () => {
    mockAuthContext.loading = true;
    renderRoute(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Auth Page')).not.toBeInTheDocument();
  });

  test('redirects to /auth when currentUser is null', () => {
    mockAuthContext.currentUser = null;
    renderRoute(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    );
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders children when authenticated and no special guards required', () => {
    mockAuthContext.currentUser = { uid: 'user-1', email: 'user@example.com' };
    renderRoute(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('renders Access Denied when requiredRoles guard fails', () => {
    mockAuthContext.currentUser = { uid: 'user-1', email: 'user@example.com' };
    mockAuthContext.userPlan = { role: 'user' };

    renderRoute(
      <PrivateRoute requiredRoles={['admin', 'super_admin']}>
        <div>Admin Dashboard</div>
      </PrivateRoute>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/you do not have the required role/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  test('renders Plan Upgrade Required when requiredPlan guard fails', () => {
    mockAuthContext.currentUser = { uid: 'user-1', email: 'user@example.com' };
    mockAuthContext.userPlan = { plan: 'trial', role: 'user' };

    renderRoute(
      <PrivateRoute requiredPlan={['pro', 'enterprise']}>
        <div>Premium AI Feature</div>
      </PrivateRoute>
    );

    expect(screen.getByText('Plan Upgrade Required')).toBeInTheDocument();
    expect(screen.getByText(/this feature requires one of the following plans/i)).toBeInTheDocument();
    expect(screen.queryByText('Premium AI Feature')).not.toBeInTheDocument();
  });
});
