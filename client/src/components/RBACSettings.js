import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RBACSettings = () => {
  const { currentUser, userPlan, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');

  // Simplified permissions for RageRadar
  const [permissions, setPermissions] = useState({
    admin: {
      dashboard: ['view', 'edit', 'delete'],
      users: ['view', 'edit', 'delete', 'create'],
      blog: ['view', 'edit', 'delete', 'create', 'publish'],
      reports: ['view', 'edit', 'delete', 'create', 'export'],
      settings: ['view', 'edit'],
      billing: ['view', 'edit']
    },
    user: {
      dashboard: ['view'],
      users: [],
      blog: ['view'],
      reports: ['view', 'export'],
      settings: ['view'],
      billing: ['view']
    }
  });

  const [roles, setRoles] = useState([
    {
      id: 'admin',
      name: 'Super Admin',
      description: 'Complete system control including user management, blog management, and all RageRadar features',
      color: 'red',
      userCount: 1
    },
    {
      id: 'user',
      name: 'User',
      description: 'Access to sentiment analysis, reports, and standard RageRadar features',
      color: 'slate',
      userCount: 0
    }
  ]);

  const modules = [
    { 
      id: 'dashboard', 
      name: 'Sentiment Analysis', 
      icon: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    },
    { 
      id: 'users', 
      name: 'User Management', 
      icon: <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    },
    { 
      id: 'blog', 
      name: 'Blog Management', 
      icon: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    },
    { 
      id: 'reports', 
      name: 'Reports & Analytics', 
      icon: <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    },
    { 
      id: 'billing', 
      name: 'Billing & Plans', 
      icon: <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    }
  ];

  const permissionTypes = [
    { id: 'view', name: 'View', description: 'Can view content' },
    { id: 'edit', name: 'Edit', description: 'Can modify content' },
    { id: 'create', name: 'Create', description: 'Can create new content' },
    { id: 'delete', name: 'Delete', description: 'Can delete content' },
    { id: 'publish', name: 'Publish', description: 'Can publish content' },
    { id: 'export', name: 'Export', description: 'Can export data' }
  ];

  const handlePermissionChange = (roleId, moduleId, permission, checked) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [moduleId]: checked 
          ? [...prev[roleId][moduleId], permission]
          : prev[roleId][moduleId].filter(p => p !== permission)
      }
    }));
  };

  const getRoleColor = (color) => {
    const colors = {
      red: 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white border-transparent',
      slate: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[color] || colors.slate;
  };

  // Check if user is admin (same logic as sidebar)
  const isUserAdmin = (
    userPlan?.role === 'admin' || 
    userPlan?.email === 'admin@rageradar.com' || 
    currentUser?.email === 'admin@rageradar.com' ||
    isAdmin(userPlan)
  );

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
          <p className="text-gray-600 mb-6">You need admin privileges to access RBAC settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Control</h1>
          <p className="text-muted-foreground">Configure roles and permissions for RageRadar</p>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-lg border mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Roles Overview
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Permissions Matrix
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'roles' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <div key={role.id} className="bg-muted/30 rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(role.color)}`}>
                          {role.name}
                        </div>
                        <span className="text-sm text-gray-500">{role.userCount} users</span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4">{role.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground text-sm">Permissions:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(permissions[role.id]).map(([module, perms]) => (
                            perms.length > 0 && (
                              <span key={module} className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground border">
                                {modules.find(m => m.id === module)?.name}: {perms.length}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-foreground">Module</th>
                        {roles.map((role) => (
                          <th key={role.id} className="text-center py-3 px-4 font-medium text-foreground">
                            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(role.color)}`}>
                              {role.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((module) => (
                        <tr key={module.id} className="border-b border-border">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="mr-3">{module.icon}</div>
                              <span className="font-medium text-foreground">{module.name}</span>
                            </div>
                          </td>
                          {roles.map((role) => (
                            <td key={role.id} className="py-4 px-4">
                              <div className="space-y-2">
                                {permissionTypes.map((permType) => (
                                  <label key={permType.id} className="flex items-center text-sm cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={permissions[role.id][module.id]?.includes(permType.id) || false}
                                      onChange={(e) => handlePermissionChange(role.id, module.id, permType.id, e.target.checked)}
                                      className="mr-2 rounded border-border text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-foreground">{permType.name}</span>
                                  </label>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                    Save Permissions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permission Legend */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Permission Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permissionTypes.map((perm) => (
              <div key={perm.id} className="flex items-center p-3 bg-muted/30 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-foreground text-sm">{perm.name}</div>
                  <div className="text-xs text-muted-foreground">{perm.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RBACSettings;