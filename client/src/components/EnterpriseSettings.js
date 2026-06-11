import React, { useState } from 'react';
import { ModernIcon, enterpriseDesign } from '../utils/enterpriseDesignSystem';
import { useAuth } from '../contexts/AuthContext';

const EnterpriseSettings = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    slack: false,
    sms: false
  });

  const tabs = [
    { id: 'profile', name: 'User Profile', icon: 'user' },
    { id: 'notifications', name: 'Notifications', icon: 'bell' },
    { id: 'api', name: 'API Keys', icon: 'settings' },
    { id: 'branding', name: 'Branding', icon: 'sites' },
    { id: 'admin', name: 'Admin', icon: 'users' }
  ];

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left ${isActive
        ? 'bg-primary-50 text-primary-700 border border-primary-200'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
        }`}
    >
      <ModernIcon name={tab.icon} className="w-5 h-5" strokeWidth={1.5} />
      <span>{tab.name}</span>
    </button>
  );

  const ProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={currentUser?.displayName || 'User'}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
            <input
              type="email"
              defaultValue={currentUser?.email || 'user@company.com'}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Job Title</label>
            <input
              type="text"
              defaultValue={currentUser?.role || 'Brand Manager'}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Company</label>
            <input
              type="text"
              defaultValue={currentUser?.company || 'Your Corporation'}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
              Upload New
            </button>
            <p className="text-xs text-neutral-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
            { key: 'slack', label: 'Slack Integration', description: 'Send alerts to Slack channels' },
            { key: 'sms', label: 'SMS Alerts', description: 'Critical alerts via SMS' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">{item.label}</h4>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Alert Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Rage Index Threshold</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="flex-1"
              />
              <span className="text-sm font-medium text-neutral-900 w-12">75%</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Alert when rage index exceeds this value</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Mention Volume Spike</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="500"
                defaultValue="200"
                className="flex-1"
              />
              <span className="text-sm font-medium text-neutral-900 w-12">200%</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Alert when mentions increase by this percentage</p>
          </div>
        </div>
      </div>
    </div>
  );

  const APITab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">API Keys</h3>
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-900">Production API Key</h4>
              <span className="px-2 py-1 bg-positive-100 text-positive-800 rounded-full text-xs font-medium">Active</span>
            </div>
            <div className="flex items-center space-x-3">
              <code className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded text-sm font-mono">
                rr_prod_1234567890abcdef...
              </code>
              <button className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors duration-200">
                Copy
              </button>
              <button className="px-3 py-2 bg-negative-100 text-negative-700 rounded-lg text-sm font-medium hover:bg-negative-200 transition-colors duration-200">
                Revoke
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Created on Jan 15, 2024 • Last used 2 hours ago</p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-900">Development API Key</h4>
              <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">Inactive</span>
            </div>
            <div className="flex items-center space-x-3">
              <code className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded text-sm font-mono">
                rr_dev_abcdef1234567890...
              </code>
              <button className="px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors duration-200">
                Copy
              </button>
              <button className="px-3 py-2 bg-negative-100 text-negative-700 rounded-lg text-sm font-medium hover:bg-negative-200 transition-colors duration-200">
                Revoke
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Created on Dec 10, 2023 • Never used</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
          Generate New Key
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">API Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">This Month</h4>
            <p className="text-2xl font-bold text-neutral-900">24,567</p>
            <p className="text-sm text-neutral-600">API calls</p>
          </div>
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Rate Limit</h4>
            <p className="text-2xl font-bold text-neutral-900">1,000</p>
            <p className="text-sm text-neutral-600">calls/hour</p>
          </div>
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Remaining</h4>
            <p className="text-2xl font-bold text-positive-600">847</p>
            <p className="text-sm text-neutral-600">this hour</p>
          </div>
        </div>
      </div>
    </div>
  );

  const BrandingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Brand Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Primary', color: '#2563eb', current: true },
            { name: 'Secondary', color: '#14b8a6', current: true },
            { name: 'Success', color: '#22c55e', current: true },
            { name: 'Error', color: '#ef4444', current: true }
          ].map((item) => (
            <div key={item.name} className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg border border-neutral-300"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  <h4 className="font-medium text-neutral-900">{item.name}</h4>
                  <p className="text-xs text-neutral-600">{item.color}</p>
                </div>
              </div>
              <input
                type="color"
                defaultValue={item.color}
                className="w-full h-8 rounded border border-neutral-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Logo Upload</h3>
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
          <ModernIcon name="upload" className="w-12 h-12 text-neutral-400 mx-auto mb-4" strokeWidth={1.5} />
          <h4 className="font-medium text-neutral-900 mb-2">Upload your logo</h4>
          <p className="text-sm text-neutral-600 mb-4">SVG, PNG, or JPG. Max size 2MB.</p>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
            Choose File
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">White Label Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Hide RageRadar Branding</h4>
              <p className="text-sm text-neutral-600">Remove RageRadar logos from reports and exports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <h4 className="font-medium text-neutral-900">Custom Domain</h4>
              <p className="text-sm text-neutral-600">Use your own domain for the dashboard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const AdminTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Team Members</h3>
        <div className="space-y-4">
          {[
            { name: 'John Doe', email: 'john.doe@company.com', role: 'Admin', status: 'Active' },
            { name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Editor', status: 'Active' },
            { name: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'Viewer', status: 'Pending' }
          ].map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{member.name}</h4>
                  <p className="text-sm text-neutral-600">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select className="px-3 py-1 border border-neutral-300 rounded text-sm">
                  <option>Admin</option>
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-positive-100 text-positive-800' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                  {member.status}
                </span>
                <button className="p-1 hover:bg-neutral-100 rounded transition-colors duration-200">
                  <ModernIcon name="x" className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
          Invite Team Member
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Subscription</h3>
        <div className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-neutral-900">Enterprise Plan</h4>
              <p className="text-sm text-neutral-600">Unlimited brands and advanced features</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-900">$299</p>
              <p className="text-sm text-neutral-600">per month</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              <p>Next billing: February 15, 2024</p>
              <p>5 team members • Unlimited brands</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors duration-200">
                Change Plan
              </button>
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'notifications': return <NotificationsTab />;
      case 'api': return <APITab />;
      case 'branding': return <BrandingTab />;
      case 'admin': return <AdminTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-1">Manage your account preferences and configuration</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg p-6 border border-neutral-200">
            {renderTabContent()}

            {/* Save Button */}
            <div className="flex justify-end pt-6 mt-6 border-t border-neutral-200">
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors duration-200">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseSettings;