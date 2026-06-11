import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Loading 
        message="Authenticating" 
        subMessage="Verifying your credentials"
      />
    );
  }

  return currentUser ? children : <Navigate to="/auth" />;
};

export default PrivateRoute;