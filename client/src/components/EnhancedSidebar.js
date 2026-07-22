import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Users,
  Bell,
  Download,
  Settings,
  Brain,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plug,
  Calendar
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { isFeatureEnabled } from '../config/features';

const EnhancedSidebar = ({ isCollapsed, onToggle, isMobile }) => {
  const location = useLocation();
  const { currentUser, userPlan, logout, isAdmin } = useAuth();

  // Role-based navigation items with feature flags
  const getNavigationItems = () => {

    const baseItems = [
      {
        title: 'Dashboard',
        items: [
          { name: 'Brand Analysis', path: '/analysis', icon: Brain, feature: 'DASHBOARD' },
          { name: 'Dashboard', path: '/dashboard', icon: BarChart3, feature: 'DASHBOARD' },
        ]
      },
      {
        title: 'Reports',
        items: [
          { name: 'Overview', path: '/dashboard/reports/overview', icon: FileText, feature: 'REPORTS_OVERVIEW' },
          { name: 'Analysis', path: '/dashboard/reports/analysis', icon: BarChart3, feature: 'REPORTS_ANALYSIS' },
          { name: 'Trends', path: '/dashboard/reports/trends', icon: TrendingUp, feature: 'REPORTS_TRENDS' },
          { name: 'Mentions', path: '/dashboard/reports/mentions', icon: MessageSquare, feature: 'REPORTS_MENTIONS' },
          { name: 'Competitive Analysis', path: '/dashboard/reports/competitive', icon: Users, feature: 'COMPETITIVE_ANALYSIS' },
          { name: 'Events & Impact', path: '/dashboard/reports/events', icon: Calendar, feature: 'REPORTS_OVERVIEW' },
        ]
      },
      {
        title: 'AI Features',
        items: [
          { name: 'AI Insights', path: '/dashboard/ai-insights', icon: Brain, feature: 'AI_INSIGHTS' },
          { name: 'Real-time', path: '/dashboard/real-time', icon: Zap, feature: 'REAL_TIME_INTELLIGENCE' },
        ]
      },
      {
        title: 'Tools',
        items: [
          { name: 'Alerts', path: '/dashboard/alerts', icon: Bell, feature: 'ADVANCED_ALERTS' },
          { name: 'Exports', path: '/dashboard/exports', icon: Download, feature: 'EXPORT_SYSTEM' },
          { name: 'Integrations', path: '/dashboard/integrations', icon: Plug },
          { name: 'Settings', path: '/dashboard/settings', icon: Settings, feature: 'DASHBOARD' },
        ]
      }
    ];

    // Filter items based on feature flags
    const filteredItems = baseItems.map(section => ({
      ...section,
      items: section.items.filter(item =>
        !item.feature || isFeatureEnabled(item.feature)
      )
    })).filter(section => section.items.length > 0);

    // Add admin-only sections
    const isUserAdmin = (
      userPlan?.role === 'admin' ||
      userPlan?.email === 'admin@rageradar.com' ||
      currentUser?.email === 'admin@rageradar.com' ||
      isAdmin(userPlan)
    );

    if (isUserAdmin && isFeatureEnabled('ADMIN_PANEL')) {
      // Add Admin section with all admin tools
      filteredItems.push({
        title: 'Administration',
        items: [
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'RBAC Settings', path: '/admin/rbac', icon: Settings },
          { name: 'Blog Management', path: '/admin/blog', icon: FileText },
        ]
      });
    }

    return filteredItems;
  };

  // Force re-render when userPlan changes
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    if (userPlan) {
      setRenderKey(prev => prev + 1);
    }
  }, [userPlan]);

  const navigationItems = getNavigationItems();

  // Don't render navigation if user data is still loading
  if (!userPlan && currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const isActivePath = (path) => {
    // Exact match for main routes
    if (path === '/dashboard' || path === '/analyze') {
      return location.pathname === path;
    }
    // For sub-routes, use startsWith
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div
        key={renderKey}
        className={cn(
          "h-full bg-slate-950/60 backdrop-blur-md transition-all duration-300 flex-shrink-0 border-r border-slate-900 flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          isMobile ? "fixed left-0 top-0 z-50 shadow-xl bg-slate-950" : ""
        )}
      >
        {/* Header */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.35)]">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-100 tracking-wider">RageRadar</h2>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                {isMobile ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {!isCollapsed && (
                <h3 className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}

              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-active={isActive}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "text-white glow-orange bg-orange-500/10"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/40",
                        isCollapsed && "justify-center"
                      )}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        outline: 'none',
                      }}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>


      </div>
    </>
  );
};

export default EnhancedSidebar;