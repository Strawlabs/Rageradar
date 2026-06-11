import React, { useState, useEffect } from 'react';
import { getRecentAnalyses, trackUserInteraction } from '../utils/userContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Badge, SentimentBadge } from './ui/badge';
import { Button } from './ui/button';
import { capitalizeBrandName } from '../utils/brandUtils';

const RecentAnalysisQuickAccess = ({ onBrandSelect, className = "" }) => {
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const recent = getRecentAnalyses();
    setRecentAnalyses(recent);
    setIsVisible(true); // Always show the component, even for empty state
  }, []);

  const handleQuickAccess = (analysis) => {
    trackUserInteraction('quick_access_used', { brandName: analysis.brandName });
    if (onBrandSelect) {
      onBrandSelect(analysis.brandName);
    }
  };

  const getSentimentVariant = (sentiment) => {
    if (sentiment >= 20) return 'positive';
    if (sentiment >= 0) return 'neutral';
    return 'negative';
  };

  const getTrendIcon = (trend) => {
    const icons = {
      up: { icon: '📈', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
      down: { icon: '📉', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
      stable: { icon: '➡️', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
      volatile: { icon: '📊', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' }
    };
    return icons[trend] || icons.stable;
  };

  const getStatusIndicator = (analysis) => {
    const now = new Date();
    const analysisDate = new Date(analysis.timestamp);
    const hoursAgo = Math.floor((now - analysisDate) / (1000 * 60 * 60));
    
    if (hoursAgo < 1) return { status: 'active', label: 'Live' };
    if (hoursAgo < 24) return { status: 'recent', label: 'Recent' };
    if (hoursAgo < 168) return { status: 'archived', label: 'Archived' };
    return { status: 'old', label: 'Old' };
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      {/* Modern Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent Analyses</h3>
              <p className="text-sm text-muted-foreground">
                {recentAnalyses.length} recent brand {recentAnalyses.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Click to re-analyze
            </Badge>
            {recentAnalyses.length > 6 && (
              <Button variant="ghost" size="sm" className="text-xs">
                View All ({recentAnalyses.length})
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recentAnalyses.slice(0, 8).map((analysis) => {
          const trendData = getTrendIcon(analysis.trend);
          const statusData = getStatusIndicator(analysis);
          
          return (
            <Card
              key={analysis.id}
              variant="outline"
              hoverable
              clickable
              onClick={() => handleQuickAccess(analysis)}
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                      {capitalizeBrandName(analysis.brandName)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground capitalize truncate mt-1">
                      {analysis.category.replace('-', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Badge 
                      variant={statusData.status === 'active' ? 'success' : statusData.status === 'recent' ? 'info' : 'secondary'} 
                      size="sm"
                      className="text-xs"
                    >
                      {statusData.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                {/* Sentiment Score with Enhanced Styling */}
                <div className="flex items-center justify-between mb-3">
                  <SentimentBadge
                    sentiment={getSentimentVariant(analysis.sentiment) === 'positive' ? 'positive' : 
                             getSentimentVariant(analysis.sentiment) === 'negative' ? 'negative' : 'neutral'}
                    score={Math.abs(analysis.sentiment) / 100}
                    showScore={true}
                    className="text-xs"
                  />
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trendData.bg}`}>
                    <span className="text-xs">{trendData.icon}</span>
                    <span className={`text-xs font-medium capitalize ${trendData.color}`}>
                      {analysis.trend}
                    </span>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTimeAgo(analysis.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{analysis.mentions > 0 ? `${analysis.mentions}` : '0'} mentions</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                {/* Progress Bar for Sentiment Strength */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Sentiment Strength</span>
                    <span className="text-xs font-medium">{Math.abs(analysis.sentiment)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        getSentimentVariant(analysis.sentiment) === 'positive' 
                          ? 'bg-green-500' 
                          : getSentimentVariant(analysis.sentiment) === 'negative' 
                          ? 'bg-red-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.abs(analysis.sentiment)}%` }}
                    />
                  </div>
                </div>
              </CardFooter>

              {/* Enhanced Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
            </Card>
          );
        })}
      </div>
      
      {/* Enhanced Show More Section */}
      {recentAnalyses.length > 8 && (
        <div className="mt-6 text-center">
          <Card variant="ghost" className="p-4 border-dashed border-2 hover:border-primary/50 transition-colors">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              View {recentAnalyses.length - 8} more analyses
            </Button>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {recentAnalyses.length === 0 && (
        <Card variant="ghost" className="p-8 text-center border-dashed border-2">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-foreground">No recent analyses</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Start analyzing brands to see your recent work here
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RecentAnalysisQuickAccess;