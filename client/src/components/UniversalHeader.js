import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBrand } from '../contexts/BrandContext';
import { useAuth } from '../contexts/AuthContext';
import BrandSelector from './BrandSelector';
import TimeRangeSelector from './TimeRangeSelector';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, Settings, HelpCircle } from 'lucide-react';

const UniversalHeader = ({ 
  title, 
  subtitle, 
  showTimeRange = true, 
  showBrandSelector = true,
  onTimeRangeChange,
  currentTimeRange = '7d',
  actions = []
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBrand } = useBrand();
  const { currentUser, logout } = useAuth();
  const [timeRange, setTimeRange] = useState(currentTimeRange);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to log out');
    }
  };

  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('reports/overview')) return 'Reports Overview';
    if (path.includes('reports/trends')) return 'Trends Analysis';
    if (path.includes('reports/mentions')) return 'Mentions Explorer';
    if (path.includes('competitive')) return 'Competitive Analysis';
    if (path.includes('ai-insights')) return 'AI Insights';
    if (path.includes('real-time')) return 'Real-Time Monitoring';
    if (path.includes('alerts')) return 'Alerts';
    if (path.includes('exports')) return 'Exports';
    if (path.includes('settings')) return 'Settings';
    return 'RageRadar';
  };

  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    if (currentBrand) {
      return `Analyzing ${currentBrand.brandName} • ${currentBrand.totalMentions || 0} mentions`;
    }
    return 'Select a brand to view analysis data';
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Brand Info */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {getPageSubtitle()}
            </p>
          </div>
          
          {showBrandSelector && (
            <div className="flex items-center space-x-3">
              <BrandSelector />
              {currentBrand && (
                <Badge 
                  variant="outline" 
                  className={`${
                    (currentBrand.rageIndex || 0) > 60 ? 'border-red-200 text-red-700 bg-red-50' : 
                    (currentBrand.rageIndex || 0) > 30 ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
                    'border-green-200 text-green-700 bg-green-50'
                  }`}
                >
                  Rage Index: {Math.round(currentBrand.rageIndex || 0)}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Controls and Actions */}
        <div className="flex items-center space-x-4">
          {showTimeRange && currentBrand && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Time Range:</span>
              <TimeRangeSelector
                value={timeRange}
                onChange={handleTimeRangeChange}
                size="sm"
              />
            </div>
          )}
          
          {/* Custom Actions */}
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              className={action.className}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}
          
          {/* Default Actions */}
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      
      {/* No Brand Selected State */}
      {showBrandSelector && !currentBrand && (
        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-orange-800 dark:text-orange-200 font-medium">
                  No brand selected
                </p>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Analyze a brand to view detailed insights and reports
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/analysis')} className="bg-orange-500 hover:bg-orange-600">
              Analyze Your First Brand
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalHeader;