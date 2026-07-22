import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Auth from '../Auth';

const mockLogin = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    currentUser: null,
    loading: false
  })
}));

describe('Auth Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (initialUrl = '/login') => {
    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/analyze" element={<div>Analyze Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders login form with fields and forgot password link', () => {
    renderWithRouter('/login');
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('calls login from useAuth when submitted with valid inputs', async () => {
    mockLogin.mockResolvedValue();
    renderWithRouter('/login');

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@company.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@company.com', 'password123');
    });
  });

  test('displays user-friendly error message on login rejection', async () => {
    mockLogin.mockRejectedValue({ code: 'auth/invalid-credential', message: 'Invalid login credentials' });
    renderWithRouter('/login');

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@company.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('displays expired session alert when expired=true query param is present', () => {
    renderWithRouter('/login?expired=true');
    expect(screen.getByText(/your session has expired\. please sign in again\./i)).toBeInTheDocument();
  });
});
