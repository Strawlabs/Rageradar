import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Progress, SentimentProgress } from './ui/progress';
import { cn } from '../lib/utils';
import { useBrand } from '../contexts/BrandContext';

// Icons (using simple Unicode for now, can be replaced with Lucide React)
const PlayIcon = () => <span className="text-sm">▶️</span>;
const PauseIcon = () => <span className="text-sm">⏸️</span>;
const RefreshIcon = () => <span className="text-sm">🔄</span>;
const AlertIcon = () => <span className="text-sm">⚠️</span>;
const TrendingUpIcon = () => <span className="text-sm">📈</span>;
const TrendingDownIcon = () => <span className="text-sm">📉</span>;
const ActivityIcon = () => <span className="text-sm">📊</span>;

const EnhancedRealTimeWidget = ({
  title = "Real-Time Sentiment",
  brandName = "Your Brand",
  updateInterval = 3000,
  className,
  onDataUpdate,
  ...props
}) => {
  const { currentBrand } = useBrand();
  // State management
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Real-time data state
  const [currentData, setCurrentData] = useState({
    sentimentScore: 0,
    mentions: 0,
    trend: 'stable',
    change: 0,
    platforms: {
      twitter: 0,
      reddit: 0,
      youtube: 0,
      news: 0
    },
    sentiment: {
      positive: 0,
      negative: 0,
      neutral: 0
    }
  });

  const [historicalData, setHistoricalData] = useState([]);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Simulate real-time data generation
  const generateRealTimeData = useCallback(() => {
    const actualBrand = currentBrand || { brandName, positivePercentage: 65, totalMentions: 120 };
    const baseScore = actualBrand.positivePercentage || 65;
    const baseMentions = Math.max(10, Math.floor((actualBrand.totalMentions || 120) / 100)); // Normalized for 'current' stream

    // Add realistic variation
    const scoreVariation = (Math.random() - 0.5) * 20;
    const mentionVariation = Math.floor((Math.random() - 0.5) * 40);

    const newScore = Math.max(0, Math.min(100, baseScore + scoreVariation));
    const newMentions = Math.max(0, baseMentions + mentionVariation);

    // Calculate trend based on previous data
    const previousScore = currentData.sentimentScore || baseScore;
    const change = newScore - previousScore;
    const trend = change > 2 ? 'rising' : change < -2 ? 'falling' : 'stable';

    // Generate platform distribution
    const totalMentions = newMentions;
    const platforms = {
      twitter: Math.floor(totalMentions * (0.4 + Math.random() * 0.2)),
      reddit: Math.floor(totalMentions * (0.25 + Math.random() * 0.15)),
      youtube: Math.floor(totalMentions * (0.2 + Math.random() * 0.1)),
      news: Math.floor(totalMentions * (0.15 + Math.random() * 0.1))
    };

    // Generate sentiment distribution based on score
    const sentimentBase = newScore / 100;
    const sentiment = {
      positive: Math.floor(totalMentions * (sentimentBase * 0.8 + Math.random() * 0.2)),
      negative: Math.floor(totalMentions * ((1 - sentimentBase) * 0.6 + Math.random() * 0.2)),
      neutral: 0
    };
    sentiment.neutral = totalMentions - sentiment.positive - sentiment.negative;

    return {
      sentimentScore: Math.round(newScore),
      mentions: newMentions,
      trend,
      change: Math.round(change * 10) / 10,
      platforms,
      sentiment,
      timestamp: new Date().toISOString()
    };
  }, [currentData.sentimentScore]);

  // Simulate API call with error handling
  const fetchRealTimeData = useCallback(async () => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

      // Simulate occasional errors (5% chance)
      if (Math.random() < 0.05 && retryCount < 3) {
        throw new Error('Network connection failed');
      }

      const newData = generateRealTimeData();

      if (!mountedRef.current) return;

      setCurrentData(newData);
      setHistoricalData(prev => {
        const updated = [...prev, newData];
        return updated.slice(-50); // Keep last 50 data points
      });
      setLastUpdate(new Date());
      setHasError(false);
      setRetryCount(0);

      // Notify parent component
      if (onDataUpdate) {
        onDataUpdate(newData);
      }

    } catch (error) {
      console.error('Real-time data fetch error:', error);

      if (!mountedRef.current) return;

      setHasError(true);
      setErrorMessage(error.message || 'Failed to fetch real-time data');
      setRetryCount(prev => prev + 1);
    }
  }, [generateRealTimeData, retryCount, onDataUpdate]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      // Generate initial historical data
      const initialData = [];
      for (let i = 20; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * updateInterval);
        const baseScore = 65 + (Math.random() - 0.5) * 15;
        const baseMentions = 120 + Math.floor((Math.random() - 0.5) * 30);

        initialData.push({
          sentimentScore: Math.round(baseScore),
          mentions: baseMentions,
          trend: 'stable',
          change: 0,
          platforms: {
            twitter: Math.floor(baseMentions * 0.4),
            reddit: Math.floor(baseMentions * 0.25),
            youtube: Math.floor(baseMentions * 0.2),
            news: Math.floor(baseMentions * 0.15)
          },
          sentiment: {
            positive: Math.floor(baseMentions * 0.6),
            negative: Math.floor(baseMentions * 0.25),
            neutral: Math.floor(baseMentions * 0.15)
          },
          timestamp: timestamp.toISOString()
        });
      }

      setHistoricalData(initialData);
      setCurrentData(initialData[initialData.length - 1]);
      setLastUpdate(new Date());
      setIsLoading(false);
    };

    initializeData();
  }, [updateInterval]);

  // Real-time data updates
  useEffect(() => {
    if (isLive && !isLoading) {
      intervalRef.current = setInterval(fetchRealTimeData, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, isLoading, fetchRealTimeData, updateInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Helper functions
  const getSentimentColor = (score) => {
    if (score >= 80) return 'text-sentiment-positive';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-sentiment-negative';
  };

  const getSentimentBgColor = (score) => {
    if (score >= 80) return 'bg-sentiment-positive-bg border-sentiment-positive';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-sentiment-negative-bg border-sentiment-negative';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising': return <TrendingUpIcon />;
      case 'falling': return <TrendingDownIcon />;
      default: return <ActivityIcon />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    setRetryCount(0);
    fetchRealTimeData();
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    );
  }

  // Error state
  if (hasError && retryCount >= 3) {
    return (
      <Card className={cn("overflow-hidden border-destructive/50 bg-destructive/5", className)} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <AlertIcon />
            </div>
            <div>
              <CardTitle className="text-destructive">Connection Error</CardTitle>
              <p className="text-sm text-muted-foreground">
                {errorMessage || 'Unable to fetch real-time data'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            onClick={handleRetry}
            className="w-full"
          >
            <RefreshIcon />
            Retry Connection
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      getSentimentBgColor(currentData.sentimentScore),
      className
    )} {...props}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              getSentimentBgColor(currentData.sentimentScore)
            )}>
              {getTrendIcon(currentData.trend)}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {brandName} • Live Updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-colors",
              isLive
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )} />
              {isLive ? 'LIVE' : 'PAUSED'}
            </div>

            {/* Control button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleLiveUpdates}
              className="transition-all duration-200 hover:scale-105"
            >
              {isLive ? <PauseIcon /> : <PlayIcon />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main metrics */}
        <div className="flex items-center justify-between">
          <div>
            <div className={cn(
              "text-3xl font-bold transition-colors duration-300",
              getSentimentColor(currentData.sentimentScore)
            )}>
              {currentData.sentimentScore}%
            </div>
            <div className="text-sm text-muted-foreground">
              Sentiment Score
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-semibold">
              {currentData.mentions.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Mentions
            </div>
          </div>

          <div className="text-right">
            <div className={cn(
              "text-lg font-semibold flex items-center gap-1",
              currentData.change > 0 ? 'text-green-600' :
                currentData.change < 0 ? 'text-red-600' : 'text-gray-600'
            )}>
              {currentData.change > 0 ? '+' : ''}{currentData.change}%
              {getTrendIcon(currentData.trend)}
            </div>
            <div className="text-sm text-muted-foreground">
              Change
            </div>
          </div>
        </div>

        {/* Sentiment distribution */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Sentiment Distribution</span>
            <span className="text-muted-foreground">
              {currentData.sentiment.positive + currentData.sentiment.negative + currentData.sentiment.neutral} total
            </span>
          </div>
          <SentimentProgress
            positive={currentData.sentiment.positive}
            negative={currentData.sentiment.negative}
            neutral={currentData.sentiment.neutral}
            showLabels={false}
          />
        </div>

        {/* Platform breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(currentData.platforms).map(([platform, count]) => (
            <div
              key={platform}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 transition-colors hover:bg-muted"
            >
              <span className="text-sm font-medium capitalize">{platform}</span>
              <span className="text-sm font-semibold">{count}</span>
            </div>
          ))}
        </div>

        {/* Error indicator (if recovering) */}
        {hasError && retryCount < 3 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
            <AlertIcon />
            <span className="text-sm">
              Connection issues detected. Retrying... ({retryCount}/3)
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>
            Last updated: {formatTimeAgo(lastUpdate)}
          </span>
          <span>
            Updates every {Math.round(updateInterval / 1000)}s
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EnhancedRealTimeWidget;