import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const { currentUser, userPlan, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  // Check if user is admin (same logic as sidebar) - must be defined before useEffect
  const isUserAdmin = (
    userPlan?.role === 'admin' || 
    userPlan?.role === 'super_admin' || 
    userPlan?.email === 'admin@rageradar.com' || 
    currentUser?.email === 'admin@rageradar.com' ||
    isAdmin(userPlan)
  );

  const roles = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access, including user & role management' },
    { value: 'admin', label: 'Admin', description: 'Can manage users, plans, and system content' },
    { value: 'enterprise_user', label: 'Enterprise User', description: 'Advanced access with API & export capabilities' },
    { value: 'user', label: 'Standard User', description: 'Standard access to sentiment analysis features' }
  ];

  const plans = ['trial', 'free', 'starter', 'pro', 'enterprise'];
  const statuses = ['active', 'inactive', 'suspended', 'deactivated'];

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser || !isUserAdmin) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to fetch users from the server API first
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch('/api/admin/users', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            const formatted = userData.map(u => ({
              id: u.id,
              email: u.email || 'Unknown',
              firstName: u.first_name || 'Unknown',
              lastName: u.last_name || 'User',
              role: u.role || 'user',
              plan: u.plan || 'trial',
              status: u.subscription_status || 'active',
              createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown',
              lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never',
              brandsUsed: u.brands_used || 0,
              maxBrands: u.max_brands || 1,
              companyName: u.company_name || 'N/A'
            }));
            setUsers(formatted);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API not available, fetching from Supabase directly');
        }

        // Fallback: Fetch from Supabase directly
        const { supabase } = await import('../supabase');
        
        const { data: usersSnapshot, error: dbError } = await supabase.from('users').select('*');
        if (dbError) throw dbError;
        
        const usersData = (usersSnapshot || []).map((userData) => {
          return {
            id: userData.id,
            email: userData.email || 'Unknown',
            firstName: userData.first_name || userData.firstName || 'Unknown',
            lastName: userData.last_name || userData.lastName || 'User',
            role: userData.role || 'user',
            plan: userData.plan || 'trial',
            status: userData.subscription_status || userData.status || 'active',
            createdAt: userData.created_at || userData.createdAt ? new Date(userData.created_at || userData.createdAt).toLocaleDateString() : 'Unknown',
            lastLogin: userData.last_login || userData.lastLogin ? new Date(userData.last_login || userData.lastLogin).toLocaleDateString() : 'Never',
            brandsUsed: userData.brands_used || userData.brandsUsed || 0,
            maxBrands: userData.max_brands || userData.maxBrands || 1,
            companyName: userData.company_name || userData.companyName || 'N/A'
          };
        });

        console.log('📊 UserManagement: Fetched users from Supabase:', usersData.length);
        setUsers(usersData);
        
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to show at least the current admin user
        setUsers([
          {
            id: currentUser.uid,
            email: currentUser.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            plan: 'enterprise',
            status: 'active',
            createdAt: 'Unknown',
            lastLogin: 'Now',
            brandsUsed: 'unlimited',
            maxBrands: 'unlimited',
            companyName: 'RageRadar'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, isUserAdmin]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      if (currentUser?.getIdToken) {
        const token = await currentUser.getIdToken();
        await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole })
        });
      } else {
        const { supabase } = await import('../supabase');
        await supabase.from('users').update({ role: newRole }).eq('id', userId);
      }
    } catch (err) {
      console.warn('Backend role update error:', err);
    }

    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      if (currentUser?.getIdToken) {
        const token = await currentUser.getIdToken();
        await fetch(`/api/admin/users/${userId}/plan`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ plan: newPlan })
        });
      } else {
        const { supabase } = await import('../supabase');
        await supabase.from('users').update({ plan: newPlan }).eq('id', userId);
      }
    } catch (err) {
      console.warn('Backend plan update error:', err);
    }

    const planBrands = { trial: 1, free: 1, starter: 3, pro: 10, enterprise: 'unlimited' };
    setUsers(users.map(user => 
      user.id === userId ? { ...user, plan: newPlan, maxBrands: planBrands[newPlan] || 1 } : user
    ));
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      if (currentUser?.getIdToken && newStatus === 'deactivated') {
        const token = await currentUser.getIdToken();
        await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        const { supabase } = await import('../supabase');
        await supabase.from('users').update({ subscription_status: newStatus }).eq('id', userId);
      }
    } catch (err) {
      console.warn('Backend status update error:', err);
    }

    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white font-bold';
      case 'admin': return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      case 'enterprise_user': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'user': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'deactivated': return 'bg-gray-200 text-gray-600 line-through';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.firstName + ' ' + user.lastName + ' ' + user.email + ' ' + user.companyName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    return matchesSearch && matchesRole && matchesPlan;
  });

  if (!isUserAdmin) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="bg-card p-8 rounded-xl border text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access user management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts, roles, and subscriptions</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Users
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enterprise</p>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.plan === 'enterprise' || u.role === 'enterprise_user').length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-card p-4 rounded-lg border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search users by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none capitalize"
            >
              <option value="all">All Plans</option>
              {plans.map(p => (
                <option key={p} value={p}>{p} Plan</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Users ({filteredUsers.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Brands</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(user.firstName || 'U').charAt(0)}{(user.lastName || 'U').charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email} • {user.companyName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {roles.find(r => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground capitalize">
                      <select
                        value={user.plan}
                        onChange={(e) => handlePlanChange(user.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-orange-500 capitalize"
                      >
                        {plans.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {user.brandsUsed}/{user.maxBrands === 'unlimited' ? '∞' : user.maxBrands}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-xs font-semibold underline"
                        >
                          Change Role
                        </button>
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No users found matching your search and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 max-w-md w-full border shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Role for {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              
              <div className="space-y-3 mb-6">
                {roles.map((role) => (
                  <label key={role.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedUser.role === role.value}
                      onChange={() => setSelectedUser({...selectedUser, role: role.value})}
                      className="mr-3 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRoleChange(selectedUser.id, selectedUser.role)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-lg text-sm font-bold transition-all"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;