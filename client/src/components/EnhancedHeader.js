import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Search,
  HelpCircle,
  Settings,
  User,
  LogOut,
  PanelLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';

const EnhancedHeader = ({
  title,
  isMobile,
  sidebarCollapsed,
  onToggleSidebar,
  onToggleMobileMenu,
  selectedBrand,
  onBrandChange
}) => {
  const { currentUser, logout } = useAuth();
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Rage Index Spike Detected',
      message: 'Rage index increased by 45% in the last 2 hours',
      type: 'alert',
      severity: 'critical',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      unread: true,
      brand: 'Apple'
    },
    {
      id: 2,
      title: 'Analysis Complete',
      message: 'Tesla brand analysis has been completed',
      type: 'info',
      severity: 'low',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      unread: false,
      brand: 'Tesla'
    }
  ]);

  // Handle theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );

    // Navigate based on notification type
    if (notification.type === 'alert') {
      // Navigate to alerts dashboard
      window.location.href = '/dashboard/alerts';
    } else if (notification.type === 'analysis') {
      // Navigate to analysis page
      window.location.href = '/analysis';
    }
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📊';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const brandOptions = [
    'Apple', 'Samsung', 'Google', 'Microsoft', 'Tesla', 'Netflix', 'Amazon', 'Meta'
  ];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 transition-colors">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="rounded-2xl hover:bg-accent transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Desktop Sidebar Toggle */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="rounded-2xl hover:bg-accent transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="flex flex-1 items-center justify-between">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-4"
        >
          <h1 className="text-xl font-semibold text-foreground">
            {title}
          </h1>
        </motion.div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Brand Selector - Enhanced */}
          <div className="hidden sm:flex items-center space-x-3">
            <span className="text-sm font-medium text-muted-foreground">Analyzing:</span>
            <select
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="px-3 py-2 text-sm border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-all shadow-sm hover:border-ring/50"
              aria-label="Select brand to analyze"
            >
              {brandOptions.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl hover:bg-accent transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Help Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl hover:bg-accent transition-colors"
              title="Help & Support"
              aria-label="Help and support"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Theme Toggle with smooth transition */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-2xl hover:bg-accent transition-all duration-300"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'light' ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </motion.div>
            </Button>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-2xl relative hover:bg-accent transition-colors"
                  title="Notifications"
                  aria-label={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications} unread)` : ''}`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground font-medium"
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between p-4">
                  <span className="font-semibold">Notifications</span>
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadNotifications} new
                    </Badge>
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
                              {getSeverityIcon(notification.severity)}
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
                                <span className={`text-xs px-2 py-1 rounded-full ${notification.type === 'alert'
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
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-xs"
                        onClick={() => window.location.href = '/dashboard/alerts'}
                      >
                        View All Alerts
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
                  className="relative h-9 w-9 rounded-2xl hover:bg-accent transition-colors"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <AvatarImage
                      src={currentUser?.photoURL}
                      alt={currentUser?.displayName || 'User avatar'}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                      {currentUser?.displayName?.charAt(0) ||
                        currentUser?.email?.charAt(0) ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser?.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;