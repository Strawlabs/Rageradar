import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

// Animated loading spinner component
const LoadingSpinner = ({ size = 'default', className, ...props }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

// Pulsing dots loader
const PulsingDots = ({ className, ...props }) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
  </div>
);

// Wave loading animation
const WaveLoader = ({ className, ...props }) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="w-1 bg-primary rounded-full animate-pulse"
        style={{
          height: `${12 + Math.sin(i * 0.5) * 8}px`,
          animationDelay: `${i * 100}ms`,
          animationDuration: '1s'
        }}
      />
    ))}
  </div>
);

// Real-time data loading component
const RealTimeDataLoader = ({ 
  title = "Loading real-time data...",
  subtitle,
  progress,
  className,
  ...props 
}) => (
  <Card className={cn("overflow-hidden", className)} {...props}>
    <CardHeader className="pb-2">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="default" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </CardHeader>
    
    {progress !== undefined && (
      <CardContent className="pt-0">
        <Progress value={progress} className="w-full" animated />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Connecting to data streams...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </CardContent>
    )}
  </Card>
);

// Sentiment analysis loading skeleton
const SentimentAnalysisLoader = ({ className, ...props }) => (
  <Card className={cn("overflow-hidden", className)} {...props}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      {/* Main metrics skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      
      {/* Progress bar skeleton */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      
      {/* Platform grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </CardContent>
    
    <CardFooter className="pt-0">
      <div className="flex justify-between w-full">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </CardFooter>
  </Card>
);

// Chart loading skeleton with animation
const ChartLoader = ({ 
  title = "Loading chart data...",
  height = "h-64",
  className,
  ...props 
}) => (
  <Card className={cn("overflow-hidden", className)} {...props}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </CardHeader>
    
    <CardContent>
      <div className={cn("relative overflow-hidden rounded-lg bg-muted/30", height)}>
        {/* Animated chart skeleton */}
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-primary/20 rounded-t animate-pulse"
              style={{
                width: '6%',
                height: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
        
        {/* Loading overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center gap-3">
            <LoadingSpinner />
            <span className="text-sm font-medium">{title}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Dashboard loading state
const DashboardLoader = ({ className, ...props }) => (
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
    
    {/* Main content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SentimentAnalysisLoader />
      <SentimentAnalysisLoader />
      <ChartLoader />
      <ChartLoader />
    </div>
    
    {/* Activity feed skeleton */}
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// Connection status loader
const ConnectionStatusLoader = ({ 
  status = "connecting",
  message = "Establishing connection to data streams...",
  className,
  ...props 
}) => {
  const statusConfig = {
    connecting: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      icon: <LoadingSpinner size="sm" />
    },
    reconnecting: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      icon: <PulsingDots />
    },
    loading: {
      color: 'text-primary',
      bgColor: 'bg-primary/5 border-primary/20',
      icon: <WaveLoader />
    }
  };

  const config = statusConfig[status] || statusConfig.connecting;

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-lg border transition-all duration-300",
      config.bgColor,
      className
    )} {...props}>
      {config.icon}
      <div>
        <div className={cn("font-medium", config.color)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        <div className="text-sm text-muted-foreground">
          {message}
        </div>
      </div>
    </div>
  );
};

// Export all loading components
export {
  LoadingSpinner,
  PulsingDots,
  WaveLoader,
  RealTimeDataLoader,
  SentimentAnalysisLoader,
  ChartLoader,
  DashboardLoader,
  ConnectionStatusLoader
};

// Default export for convenience
export default {
  Spinner: LoadingSpinner,
  Dots: PulsingDots,
  Wave: WaveLoader,
  RealTimeData: RealTimeDataLoader,
  SentimentAnalysis: SentimentAnalysisLoader,
  Chart: ChartLoader,
  Dashboard: DashboardLoader,
  ConnectionStatus: ConnectionStatusLoader
};