import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Globe, 
  Settings,
  Brain,
  Zap,
  BarChart4,
  Bell,
  Link as LinkIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Search,
  Filter,
  Activity,
  Target
} from 'lucide-react';

const ModernSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    reports: true
  });

  // Icon mapping for navigation items
  const getIcon = (iconName, className = "w-5 h-5") => {
    const icons = {
      dashboard: <BarChart3 className={className} />,
      reports: <FileText className={className} />,
      'ai-insights': <Brain className={className} />,
      'real-time': <Zap className={className} />,
      'advanced-analytics': <BarChart4 className={className} />,
      alerts: <Bell className={className} />,
      sources: <Globe className={className} />,
      integrations: <LinkIcon className={className} />,
      exports: <Download className={className} />,
      settings: <Settings className={className} />,
      // Sub-navigation icons
      overview: <Activity className="w-4 h-4" />,
      analysis: <Search className="w-4 h-4" />,
      trends: <TrendingUp className="w-4 h-4" />,

      mentions: <MessageSquare className="w-4 h-4" />,
      competitive: <Target className="w-4 h-4" />
    };
    return icons[iconName] || <BarChart3 className={className} />;
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',
      description: 'Overview & Key Metrics'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'reports',
      description: 'Comprehensive Analytics',
      expandable: true,
      children: [
        { id: 'overview', label: 'Overview', path: '/dashboard/reports/overview', icon: 'overview' },
        { id: 'analysis', label: 'Analysis', path: '/dashboard/reports/analysis', icon: 'analysis' },
        { id: 'trends', label: 'Trends', path: '/dashboard/reports/trends', icon: 'trends' },

        { id: 'mentions', label: 'Mentions Explorer', path: '/dashboard/reports/mentions', icon: 'mentions' },
        { id: 'competitive', label: 'Competitive Analysis', path: '/dashboard/reports/competitive', icon: 'competitive' }
      ]
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: 'ai-insights',
      path: '/dashboard/ai-insights',
      description: 'AI-Powered Intelligence & Predictions',
      badge: 'NEW'
    },
    {
      id: 'real-time',
      label: 'Real-Time',
      icon: 'real-time',
      path: '/dashboard/real-time',
      description: 'Live Intelligence Dashboard',
      badge: 'LIVE'
    },
    {
      id: 'advanced-analytics',
      label: 'Advanced Analytics',
      icon: 'advanced-analytics',
      path: '/dashboard/advanced-analytics',
      description: 'Custom Queries & Deep Analysis'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: 'alerts',
      path: '/dashboard/alerts',
      description: 'Crisis Detection & Notifications',
      badge: '3'
    },
    // Hidden for MVP - Data Sources and Integrations will be added in next phase
    // {
    //   id: 'sources',
    //   label: 'Data Sources',
    //   icon: 'sources',
    //   path: '/dashboard/sources',
    //   description: 'Platform Management'
    // },
    // {
    //   id: 'integrations',
    //   label: 'Integrations',
    //   icon: 'integrations',
    //   path: '/dashboard/integrations',
    //   description: 'Enterprise Integrations & Workflows',
    //   badge: 'PRO'
    // },
    {
      id: 'exports',
      label: 'Exports',
      icon: 'exports',
      path: '/dashboard/exports',
      description: 'Reports & Data Export'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      path: '/dashboard/settings',
      description: 'Configuration & Preferences'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getBadgeStyle = (badge) => {
    const styles = {
      'NEW': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      'LIVE': 'bg-red-100 text-red-700 border border-red-200 animate-pulse',
      'PRO': 'bg-purple-100 text-purple-700 border border-purple-200',
      '3': 'bg-blue-100 text-blue-700 border border-blue-200'
    };
    return styles[badge] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full shadow-sm`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">RageRadar</h1>
                <p className="text-xs text-gray-500">Brand Intelligence</p>
              </div>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <div key={item.id}>
            {item.expandable ? (
              <div>
                <button
                  onClick={() => setExpandedSections({
                    ...expandedSections,
                    [item.id]: !expandedSections[item.id]
                  })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                    isActiveRoute(item.path) 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${isActiveRoute(item.path) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {getIcon(item.icon)}
                    </div>
                    {!isCollapsed && (
                      <div className="text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                      expandedSections[item.id] ? 'rotate-90' : ''
                    } ${isActiveRoute(item.path) ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                </button>
                
                {expandedSections[item.id] && !isCollapsed && (
                  <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        to={child.path}
                        className={`flex items-center space-x-3 p-2.5 rounded-lg transition-all duration-200 group ${
                          isActiveRoute(child.path)
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className={`${isActiveRoute(child.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                          {getIcon(child.icon)}
                        </div>
                        <span className="text-sm font-medium">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                  isActiveRoute(item.path) 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${isActiveRoute(item.path) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {getIcon(item.icon)}
                  </div>
                  {!isCollapsed && (
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  )}
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeStyle(item.badge)}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.displayName || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};