import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminTest = () => {
  const { currentUser, userPlan, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Test Page</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current User Info</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {currentUser?.email || 'Not logged in'}</p>
            <p><strong>UID:</strong> {currentUser?.uid || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Plan Info</h2>
          <div className="space-y-2">
            <p><strong>User Plan Loaded:</strong> {userPlan ? 'Yes' : 'No'}</p>
            <p><strong>Role:</strong> {userPlan?.role || 'Not set'}</p>
            <p><strong>Plan:</strong> {userPlan?.plan || 'Not set'}</p>
            <p><strong>Email in Plan:</strong> {userPlan?.email || 'Not set'}</p>
            <p><strong>Status:</strong> {userPlan?.status || 'Not set'}</p>
          </div>
          
          {userPlan && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Full User Plan Object:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(userPlan, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Check Results</h2>
          <div className="space-y-2">
            <p><strong>isAdmin(userPlan):</strong> {isAdmin(userPlan) ? 'TRUE' : 'FALSE'}</p>
            <p><strong>userPlan?.role === 'admin':</strong> {userPlan?.role === 'admin' ? 'TRUE' : 'FALSE'}</p>
            <p><strong>userPlan?.email === 'admin@rageradar.com':</strong> {userPlan?.email === 'admin@rageradar.com' ? 'TRUE' : 'FALSE'}</p>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-6 ${
          isAdmin(userPlan) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <h2 className="text-xl font-semibold mb-4">Final Result</h2>
          {isAdmin(userPlan) ? (
            <div className="text-green-800">
              <p className="text-lg font-semibold">✅ You are an ADMIN</p>
              <p>You should see the Administration section in the sidebar.</p>
            </div>
          ) : (
            <div className="text-red-800">
              <p className="text-lg font-semibold">❌ You are NOT an admin</p>
              <p>You will not see the Administration section in the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTest;