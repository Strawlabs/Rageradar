import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const SimpleSidebar = ({ isCollapsed, onToggle, isMobile }) => {
  const location = useLocation();
  const { currentUser, userPlan, logout } = useAuth();

  const navigationItems = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Brand Analysis', path: '/analysis', icon: Brain },
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
      ]
    },
    {
      title: 'Reports',
      items: [
        { name: 'Overview', path: '/dashboard/reports/overview', icon: FileText },
        { name: 'Analysis', path: '/dashboard/reports/analysis', icon: BarChart3 },
        { name: 'Trends', path: '/dashboard/reports/trends', icon: TrendingUp },
        { name: 'Mentions', path: '/dashboard/reports/mentions', icon: MessageSquare },
        { name: 'Competitive', path: '/dashboard/reports/competitive', icon: Users },
      ]
    },
    {
      title: 'AI Features',
      items: [
        { name: 'AI Insights', path: '/dashboard/ai-insights', icon: Brain },
        { name: 'Real-time', path: '/dashboard/real-time', icon: Zap },
      ]
    },
    {
      title: 'Tools',
      items: [
        { name: 'Alerts', path: '/dashboard/alerts', icon: Bell },
        { name: 'Exports', path: '/dashboard/exports', icon: Download },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

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
        className={cn(
          "h-full bg-card border-r border-border transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-16" : "w-64",
          isMobile ? "fixed left-0 top-0 z-50 shadow-xl" : ""
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">RageRadar</h2>
                  <p className="text-xs text-muted-foreground">Sentiment Intelligence</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {!isCollapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              
              <nav className="space-y-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-active={isActive}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "sidebar-link-active !bg-slate-100 dark:!bg-slate-700 !text-slate-900 dark:!text-white !border-l-4 !border-orange-500"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        isCollapsed && "justify-center"
                      )}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        outline: 'none',
                        ...(isActive ? {
                          backgroundColor: 'rgb(241 245 249)',
                          color: 'rgb(15 23 42)',
                          borderLeft: '4px solid rgb(249 115 22)'
                        } : {})
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

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentUser?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userPlan?.plan ? userPlan.plan.charAt(0).toUpperCase() + userPlan.plan.slice(1) + ' Plan' : 'Loading...'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SimpleSidebar;