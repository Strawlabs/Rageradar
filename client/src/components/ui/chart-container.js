import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Download, MoreHorizontal, Maximize2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

const ChartContainer = ({ 
  title, 
  subtitle,
  children, 
  className,
  onExport,
  onRefresh,
  onFullscreen,
  showActions = true,
  loading = false,
  error = null,
  ...props 
}) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export functionality
      console.log('Exporting chart:', title);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      console.log('Refreshing chart:', title);
    }
  };

  const handleFullscreen = () => {
    if (onFullscreen) {
      onFullscreen();
    } else {
      console.log('Fullscreen chart:', title);
    }
  };

  if (error) {
    return (
      <Card className={cn("overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm", className)} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-destructive">Error Loading Chart</CardTitle>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {showActions && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="rounded-2xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200", className)} {...props}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {showActions && (
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-2xl hover:bg-accent"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh data"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-2xl hover:bg-accent"
                onClick={handleExport}
                title="Export chart"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-2xl hover:bg-accent"
                onClick={handleFullscreen}
                title="Fullscreen view"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-2xl hover:bg-accent"
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export { ChartContainer };