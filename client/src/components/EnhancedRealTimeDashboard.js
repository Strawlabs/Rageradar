import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import EnhancedRealTimeWidget from './EnhancedRealTimeWidget';
import { cn } from '../lib/utils';

// Icons
const RefreshIcon = () => <span className="text-sm">🔄</span>;
const SettingsIcon = () => <span className="text-sm">⚙️</span>;
const FullscreenIcon = () => <span className="text-sm">⛶</span>;
const AlertIcon = () => <span className="text-sm">🔔</span>;

const EnhancedRealTimeDashboard = ({ 
  brandName = "Your Brand",
  className,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState(false);
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(null);
  const [aggregatedData, setAggregatedData] = useState({
    totalMentions: 0,
    averageSentiment: 0,
    trendingPlatforms: [],
    alertsCount: 0
  });
  
  const [widgetData, setWidgetData] = useState({
    sentiment: null,
    mentions: null,
    platforms: null,
    trends: null
  });

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      
      // Simulate dashboard initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
    };

    initializeDashboard();
  }, [brandName]);

  // Handle data updates from individual widgets
  const handleWidgetDataUpdate = useCallback((widgetType, data) => {
    setWidgetData(prev => ({
      ...prev,
      [widgetType]: data
    }));
    
    setLastGlobalUpdate(new Date());
    
    // Update aggregated data
    setAggregatedData(prev => {
      const newData = { ...prev };
      
      if (data.mentions) {
        newData.totalMentions = Object.values(widgetData).reduce((sum, widget) => {
          return sum + (widget?.mentions || 0);
        }, data.mentions);
      }
      
      if (data.sentimentScore) {
        const validScores = Object.values(widgetData)
          .filter(widget => widget?.sentimentScore)
          .map(widget => widget.sentimentScore);
        validScores.push(data.sentimentScore);
        
        newData.averageSentiment = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
      }
      
      return newData;
    });
  }, [widgetData]);

  const handleRefreshAll = () => {
    // This would trigger a refresh of all widgets
    setLastGlobalUpdate(new Date());
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)} {...props}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>
        
        {/* Widgets skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Real-Time Dashboard
          </h1>
          <p className="text-muted-foreground">
            Live sentiment monitoring for {brandName}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            className="transition-all duration-200 hover:scale-105"
          >
            <RefreshIcon />
            Refresh All
          </Button>
          
          <Button variant="ghost" size="icon">
            <SettingsIcon />
          </Button>
          
          <Button variant="ghost" size="icon">
            <FullscreenIcon />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Total Mentions
            </div>
            <div className="text-2xl font-bold">
              {aggregatedData.totalMentions.toLocaleString()}
            </div>
            <div className="text-xs text-green-600">
              +12% from last hour
            </div>
          </div>
        </Card>
        
        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Avg Sentiment
            </div>
            <div className="text-2xl font-bold">
              {Math.round(aggregatedData.averageSentiment || 0)}%
            </div>
            <div className="text-xs text-blue-600">
              Stable trend
            </div>
          </div>
        </Card>
        
        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Active Platforms
            </div>
            <div className="text-2xl font-bold">
              7
            </div>
            <div className="text-xs text-green-600">
              All connected
            </div>
          </div>
        </Card>
        
        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Active Alerts
            </div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {aggregatedData.alertsCount}
              {aggregatedData.alertsCount > 0 && <AlertIcon />}
            </div>
            <div className="text-xs text-gray-600">
              No critical issues
            </div>
          </div>
        </Card>
      </div>

      {/* Real-Time Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Sentiment Widget */}
        <EnhancedRealTimeWidget
          title="Sentiment Analysis"
          brandName={brandName}
          updateInterval={2000}
          onDataUpdate={(data) => handleWidgetDataUpdate('sentiment', data)}
          className="lg:col-span-1"
        />
        
        {/* Mentions Volume Widget */}
        <EnhancedRealTimeWidget
          title="Mentions Volume"
          brandName={brandName}
          updateInterval={3000}
          onDataUpdate={(data) => handleWidgetDataUpdate('mentions', data)}
          className="lg:col-span-1"
        />
        
        {/* Platform Distribution Widget */}
        <EnhancedRealTimeWidget
          title="Platform Activity"
          brandName={brandName}
          updateInterval={4000}
          onDataUpdate={(data) => handleWidgetDataUpdate('platforms', data)}
          className="lg:col-span-1"
        />
        
        {/* Trending Topics Widget */}
        <EnhancedRealTimeWidget
          title="Trending Topics"
          brandName={brandName}
          updateInterval={5000}
          onDataUpdate={(data) => handleWidgetDataUpdate('trends', data)}
          className="lg:col-span-1"
        />
      </div>

      {/* Live Activity Feed */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              📱 Live Activity Feed
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Real-time updates
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {lastGlobalUpdate && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">
                    Dashboard updated with latest data
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {lastGlobalUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">
                  New positive mention detected on Twitter
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                2m ago
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm">
                  Sentiment spike detected on Reddit
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                5m ago
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">
                  Platform connection restored: YouTube
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                8m ago
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>All systems operational</span>
          </div>
          <div className="text-muted-foreground">
            Last updated: {lastGlobalUpdate ? lastGlobalUpdate.toLocaleTimeString() : 'Never'}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>7 data sources active</span>
          <span>•</span>
          <span>Real-time monitoring enabled</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRealTimeDashboard;