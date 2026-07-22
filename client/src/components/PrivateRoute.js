import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children, requiredRoles, requiredPlan }) => {
  const { currentUser, userPlan, loading, isAdmin, isTrialExpired } = useAuth();

  if (loading) {
    return (
      <Loading 
        message="Authenticating" 
        subMessage="Verifying your credentials"
      />
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // Check trial expiration unless user is admin
  if (isTrialExpired(currentUser) && !isAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Trial Expired</h2>
          <p className="text-gray-600 mb-6">
            Your 3-day trial period has ended. Please upgrade your subscription to continue accessing RageRadar insights.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/pricing"
              className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 block"
            >
              View Pricing & Upgrade
            </Link>
            <Link
              to="/"
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = userPlan?.role || currentUser?.role || 'user';
    if (!requiredRoles.includes(userRole)) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You do not have the required role ({requiredRoles.join(' or ')}) to view this page.
            </p>
            <Link
              to="/analyze"
              className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 block"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  // Check plan requirement
  if (requiredPlan && requiredPlan.length > 0) {
    const userRole = userPlan?.role || currentUser?.role || 'user';
    // Admins bypass plan checks
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      const currentPlan = userPlan?.plan || 'trial';
      if (!requiredPlan.includes(currentPlan)) {
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Plan Upgrade Required</h2>
              <p className="text-gray-600 mb-6">
                This feature requires one of the following plans: <span className="font-semibold uppercase text-purple-600">{requiredPlan.join(', ')}</span>. You are currently on the <span className="font-semibold uppercase text-gray-800">{currentPlan}</span> plan.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/pricing"
                  className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200 block"
                >
                  View Pricing & Upgrade
                </Link>
                <Link
                  to="/analyze"
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 block"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        );
      }
    }
  }

  return children;
};

export default PrivateRoute;