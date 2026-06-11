import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, LogOut, User, Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from './theme-provider';
import EnhancedSidebar from './EnhancedSidebar';
import { cn } from '../lib/utils';

const EnhancedLayout = ({ children }) => {
  const { currentUser, userPlan, logout, isAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([
    // No demo notifications - will show empty state
  ]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );
    
    // Navigate based on type
    if (notification.type === 'alert') {
      window.location.href = '/dashboard/alerts';
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };


  // Handle responsive behavior with improved mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      // Close mobile menu when switching to desktop
      if (!isMobileDevice && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Also listen for orientation changes on mobile devices
    window.addEventListener('orientationchange', () => {
      setTimeout(checkMobile, 100); // Small delay to ensure dimensions are updated
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [mobileMenuOpen]);

  // Use the theme provider instead of local state
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle edge swipe to open mobile menu
  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let isEdgeSwipe = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      // Check if touch started from the left edge (within 20px)
      isEdgeSwipe = startX < 20;
    };

    const handleTouchMove = (e) => {
      if (!isEdgeSwipe || mobileMenuOpen) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = Math.abs(currentY - startY);

      // Check if it's a horizontal swipe from the edge
      if (deltaX > 50 && deltaY < 100 && deltaX > deltaY * 2) {
        setMobileMenuOpen(true);
        isEdgeSwipe = false; // Prevent multiple triggers
      }
    };

    const handleTouchEnd = () => {
      isEdgeSwipe = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, mobileMenuOpen]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 cyber-hud-bg relative overflow-hidden">
      {/* Sidebar */}
      <EnhancedSidebar
        isCollapsed={isMobile ? false : sidebarCollapsed}
        onToggle={isMobile ? closeMobileMenu : toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar with improved mobile touch targets */}
        <header className={cn(
          "sticky top-0 z-10 flex items-center gap-3 bg-slate-900/30 backdrop-blur border-b border-slate-800/40",
          isMobile ? "h-14 px-3" : "h-16 px-4"
        )}>


          <div className="flex flex-1 items-center justify-end min-w-0">
            <div className={cn(
              "flex items-center",
              isMobile ? "gap-2" : "gap-3"
            )}>
              {/* Theme Toggle with improved mobile touch target */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                  "rounded-2xl touch-manipulation",
                  isMobile ? "h-9 w-9" : "h-10 w-10"
                )}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' || theme === 'system' ? (
                  <Moon className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                ) : (
                  <Sun className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                )}
              </Button>

              {/* Notifications Dropdown with improved mobile touch target */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-2xl relative touch-manipulation hover:bg-muted focus:outline-none focus:ring-0 focus:bg-muted data-[state=open]:bg-muted",
                      isMobile ? "h-9 w-9" : "h-10 w-10"
                    )}
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  side="bottom"
                  sideOffset={8}
                  alignOffset={-4}
                  className="w-80 z-50 bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md"
                >
                  <DropdownMenuLabel className="flex items-center justify-between p-4">
                    <span className="font-semibold">Notifications</span>
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                        {notifications.filter(n => n.unread).length} new
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex flex-col items-start p-4 cursor-pointer hover:bg-accent/50 border-l-4 border-l-transparent hover:border-l-primary transition-all"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-start space-x-3 flex-1">
                              <span className="text-lg">
                                {notification.severity === 'critical' ? '🚨' : 
                                 notification.severity === 'high' ? '⚠️' : 'ℹ️'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium ${notification.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                  </span>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    notification.type === 'alert' 
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                  }`}>
                                    {notification.type === 'alert' ? 'Alert' : 'Info'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <span className="text-sm text-muted-foreground">No notifications</span>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="p-2 space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center text-xs"
                          onClick={() => window.location.href = '/dashboard/alerts'}
                        >
                          View All Alerts
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center text-xs text-muted-foreground"
                          onClick={clearAllNotifications}
                        >
                          Clear All
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-2xl shadow-sm border-2 focus:outline-none focus:ring-0 data-[state=open]:bg-muted",
                      "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400/30",
                      "hover:from-orange-600 hover:to-orange-700 hover:border-orange-500/40",
                      "dark:from-orange-600 dark:to-orange-700 dark:border-orange-500/30",
                      "dark:hover:from-orange-700 dark:hover:to-orange-800 dark:hover:border-orange-600/40",
                      isMobile ? "size-8" : "size-9"
                    )}
                  >
                    <span className={cn(
                      "font-semibold",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {currentUser?.email?.startsWith('admin@') ? 'A' : 
                       currentUser?.displayName?.charAt(0) || 
                       currentUser?.email?.charAt(0) || 'U'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser?.email || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userPlan?.plan ? userPlan.plan.charAt(0).toUpperCase() + userPlan.plan.slice(1) + ' Plan' : 'Loading...'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedLayout;