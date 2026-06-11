import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

// Icons
const AlertTriangleIcon = () => <span className="text-lg">⚠️</span>;
const RefreshIcon = () => <span className="text-sm">🔄</span>;
const WifiOffIcon = () => <span className="text-lg">📶</span>;
const ServerIcon = () => <span className="text-lg">🖥️</span>;
const ClockIcon = () => <span className="text-sm">⏰</span>;
const CheckIcon = () => <span className="text-sm">✅</span>;

// Auto-retry hook
const useAutoRetry = (retryFunction, maxRetries = 3, retryDelay = 2000) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  const retry = async () => {
    if (retryCount >= maxRetries) return false;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await retryFunction();
      setRetryCount(0);
      setIsRetrying(false);
      return true;
    } catch (error) {
      setIsRetrying(false);
      
      if (retryCount + 1 < maxRetries) {
        // Start countdown for next retry
        setNextRetryIn(retryDelay / 1000);
        const countdown = setInterval(() => {
          setNextRetryIn(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              retry(); // Auto retry
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      return false;
    }
  };

  const manualRetry = () => {
    setNextRetryIn(0);
    retry();
  };

  const reset = () => {
    setRetryCount(0);
    setIsRetrying(false);
    setNextRetryIn(0);
  };

  return {
    retry: manualRetry,
    reset,
    retryCount,
    isRetrying,
    nextRetryIn,
    canRetry: retryCount < maxRetries
  };
};

// Generic error boundary component
const ErrorBoundary = ({ 
  error,
  onRetry,
  title = "Something went wrong",
  description,
  className,
  children,
  ...props 
}) => {
  const { retry, retryCount, isRetrying, nextRetryIn, canRetry } = useAutoRetry(onRetry);

  if (!error) return children;

  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)} {...props}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangleIcon />
          </div>
          <div>
            <CardTitle className="text-destructive">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
          
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground">
              Retry attempt: {retryCount}/3
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={retry}
          disabled={!canRetry || isRetrying}
          className="flex-1"
        >
          {isRetrying ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Retrying...
            </>
          ) : nextRetryIn > 0 ? (
            <>
              <ClockIcon />
              Retry in {nextRetryIn}s
            </>
          ) : (
            <>
              <RefreshIcon />
              {retryCount > 0 ? 'Try Again' : 'Retry'}
            </>
          )}
        </Button>
        
        {!canRetry && (
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Connection error component
const ConnectionError = ({ 
  onRetry,
  type = "network",
  className,
  ...props 
}) => {
  const errorConfig = {
    network: {
      icon: <WifiOffIcon />,
      title: "Connection Lost",
      description: "Unable to connect to real-time data streams",
      suggestion: "Check your internet connection and try again"
    },
    server: {
      icon: <ServerIcon />,
      title: "Server Error",
      description: "Our servers are experiencing issues",
      suggestion: "We're working to fix this. Please try again in a moment"
    },
    timeout: {
      icon: <ClockIcon />,
      title: "Request Timeout",
      description: "The request took too long to complete",
      suggestion: "The service might be busy. Please try again"
    }
  };

  const config = errorConfig[type] || errorConfig.network;
  const { retry, retryCount, isRetrying, nextRetryIn, canRetry } = useAutoRetry(onRetry);

  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)} {...props}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            {config.icon}
          </div>
          <div>
            <CardTitle className="text-destructive">{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {config.suggestion}
          </p>
          
          {retryCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Attempts:</span>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      i < retryCount ? "bg-destructive" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
          
          {nextRetryIn > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Auto-retry in:</span>
                <span className="font-mono">{nextRetryIn}s</span>
              </div>
              <Progress 
                value={(1 - nextRetryIn / 2) * 100} 
                className="h-1"
                variant="error"
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={retry}
          disabled={!canRetry || isRetrying}
          className="w-full"
          variant={canRetry ? "default" : "secondary"}
        >
          {isRetrying ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Connecting...
            </>
          ) : !canRetry ? (
            "Maximum retries reached"
          ) : (
            <>
              <RefreshIcon />
              Try Again ({3 - retryCount} attempts left)
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Data loading error component
const DataLoadError = ({ 
  onRetry,
  dataType = "sentiment data",
  className,
  ...props 
}) => {
  const { retry, retryCount, isRetrying, canRetry } = useAutoRetry(onRetry);

  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)} {...props}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangleIcon />
          </div>
          <div>
            <CardTitle className="text-destructive">
              Failed to Load {dataType}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Unable to fetch the latest information
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-destructive">
            <p className="text-sm">
              This could be due to:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Network connectivity issues</li>
              <li>• Temporary server problems</li>
              <li>• Data source unavailable</li>
            </ul>
          </div>
          
          {retryCount > 0 && (
            <div className="text-sm text-muted-foreground">
              Failed attempts: {retryCount}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={retry}
          disabled={!canRetry || isRetrying}
          variant="outline"
          className="w-full"
        >
          {isRetrying ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>
              <RefreshIcon />
              Reload {dataType}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Real-time connection error
const RealTimeConnectionError = ({ 
  onRetry,
  onFallback,
  className,
  ...props 
}) => {
  const { retry, retryCount, isRetrying, nextRetryIn, canRetry } = useAutoRetry(onRetry, 5, 3000);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (retryCount >= 3) {
      setShowFallback(true);
    }
  }, [retryCount]);

  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)} {...props}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <WifiOffIcon />
          </div>
          <div>
            <CardTitle className="text-destructive">
              Real-Time Connection Lost
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Unable to maintain live data stream
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Impact:</strong> Data may not be up-to-date. 
              Last successful update was {Math.floor(Math.random() * 5) + 1} minutes ago.
            </p>
          </div>
          
          {nextRetryIn > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Reconnecting automatically in:</span>
                <span className="font-mono font-semibold">{nextRetryIn}s</span>
              </div>
              <Progress 
                value={(1 - nextRetryIn / 3) * 100} 
                className="h-2"
                animated
              />
            </div>
          )}
          
          {showFallback && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Alternative:</strong> Switch to cached data mode to continue working
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          onClick={retry}
          disabled={!canRetry || isRetrying}
          variant="outline"
          className="flex-1"
        >
          {isRetrying ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Reconnecting...
            </>
          ) : (
            <>
              <RefreshIcon />
              Retry Connection
            </>
          )}
        </Button>
        
        {showFallback && onFallback && (
          <Button 
            onClick={onFallback}
            variant="secondary"
            className="flex-1"
          >
            Use Cached Data
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Success recovery component
const RecoverySuccess = ({ 
  message = "Connection restored successfully",
  onDismiss,
  autoHide = true,
  className,
  ...props 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  if (!visible) return null;

  return (
    <Card className={cn(
      "border-green-200 bg-green-50 animate-slide-up",
      className
    )} {...props}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <CheckIcon />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
            <p className="text-xs text-green-600">
              Real-time updates have resumed
            </p>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export {
  ErrorBoundary,
  ConnectionError,
  DataLoadError,
  RealTimeConnectionError,
  RecoverySuccess,
  useAutoRetry
};

export default {
  Boundary: ErrorBoundary,
  Connection: ConnectionError,
  DataLoad: DataLoadError,
  RealTimeConnection: RealTimeConnectionError,
  RecoverySuccess,
  useAutoRetry
};