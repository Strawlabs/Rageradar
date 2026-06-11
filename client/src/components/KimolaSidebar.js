import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const KimolaSidebar = ({ activeSection, onSectionChange, collapsed, onToggleCollapse }) => {
  const { currentUser, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    reports: true,
    models: false,
    datasets: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationItems = [
    {
      id: 'home',
      name: 'HOME',
      icon: '🏠',
      type: 'single'
    },
    {
      id: 'projects',
      name: 'PROJECTS',
      icon: '📁',
      type: 'single'
    },
    {
      id: 'feeds',
      name: 'FEEDS',
      icon: '📡',
      type: 'single',
      badge: 'NEW'
    },
    {
      id: 'reports',
      name: 'REPORTS',
      icon: '📊',
      type: 'expandable',
      expanded: expandedSections.reports,
      children: [
        { id: 'overview', name: 'Overview', icon: '👁️' },
        { id: 'analysis', name: 'Analysis', icon: '🔍' },
        { id: 'performance', name: 'Performance', icon: '📈' },
        { id: 'comparisons', name: 'Comparisons', icon: '⚖️' },
        { id: 'pivots', name: 'Pivots', icon: '🔄' },
        { id: 'junk', name: 'Junk', icon: '🗑️' }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      type: 'single',
      isSubItem: true
    },
    {
      id: 'models',
      name: 'MODELS',
      icon: '🤖',
      type: 'expandable',
      expanded: expandedSections.models,
      children: [
        { id: 'sentiment-models', name: 'Sentiment Models', icon: '😊' },
        { id: 'classification-models', name: 'Classification', icon: '🏷️' },
        { id: 'custom-models', name: 'Custom Models', icon: '🔧' }
      ]
    },
    {
      id: 'datasets',
      name: 'DATASETS',
      icon: '💾',
      type: 'expandable',
      expanded: expandedSections.datasets,
      children: [
        { id: 'training-data', name: 'Training Data', icon: '📚' },
        { id: 'validation-sets', name: 'Validation Sets', icon: '✅' },
        { id: 'test-data', name: 'Test Data', icon: '🧪' }
      ]
    },
    {
      id: 'account',
      name: 'ACCOUNT',
      icon: '👤',
      type: 'single'
    }
  ];

  const otherItems = [
    {
      id: 'support',
      name: 'Support',
      icon: '🆘',
      type: 'single'
    },
    {
      id: 'signout',
      name: 'Sign Out',
      icon: '🚪',
      type: 'single',
      action: logout
    }
  ];

  const renderNavItem = (item, isChild = false) => {
    const isActive = activeSection === item.id;
    const baseClasses = `flex items-center w-full text-left transition-colors duration-200 ${
      isChild ? 'pl-8 py-2' : 'px-4 py-3'
    } ${
      isActive 
        ? 'bg-teal-500 text-white' 
        : 'text-gray-300 hover:text-white hover:bg-gray-700'
    }`;

    if (item.type === 'expandable') {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleSection(item.id)}
            className={baseClasses}
          >
            <span className="mr-3 text-sm">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1 text-sm font-medium">{item.name}</span>
                <span className={`transform transition-transform ${item.expanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </>
            )}
          </button>
          {!collapsed && item.expanded && item.children && (
            <div className="bg-gray-800">
              {item.children.map(child => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          if (item.action) {
            item.action();
          } else {
            onSectionChange(item.id);
          }
        }}
        className={baseClasses}
      >
        <span className="mr-3 text-sm">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{item.name}</span>
            {item.badge && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div className={`bg-gray-900 text-white h-screen flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser?.email || 'user@example.com'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        <nav className="py-4">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>

        {/* Other Section */}
        <div className="border-t border-gray-700 mt-4">
          {!collapsed && (
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                OTHER
              </span>
            </div>
          )}
          <nav>
            {otherItems.map(item => renderNavItem(item))}
          </nav>
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
        >
          <span className={`transform transition-transform ${collapsed ? 'rotate-180' : ''}`}>
            ◀
          </span>
        </button>
      </div>
    </div>
  );
};

export default KimolaSidebar;