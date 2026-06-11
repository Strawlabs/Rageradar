import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Download } from 'lucide-react';

const ModernPageTemplate = ({ 
  title, 
  description, 
  children, 
  actions = [],
  badges = [],
  className = ""
}) => {
  return (
    <div className={`p-6 w-full ${className}`}>
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || "outline"} className="text-sm">
                {badge.label}
              </Badge>
            ))}
            
            {actions.map((action, index) => (
              <Button 
                key={index}
                variant={action.variant || "outline"} 
                size={action.size || "sm"}
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}
            
            {/* Default actions */}
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

// Modern KPI Card Component
export const ModernKPICard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  description,
  color = "blue"
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600',
      red: 'bg-red-50 dark:bg-red-950 text-red-600',
      green: 'bg-green-50 dark:bg-green-950 text-green-600',
      orange: 'bg-orange-50 dark:bg-orange-950 text-orange-600',
      purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${getColorClasses()}`}>
            <Icon className="w-5 h-5" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              {change}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-foreground">
            {value}
          </h3>
          <p className="text-sm font-medium text-foreground">
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Modern Chart Card Component
export const ModernChartCard = ({ 
  title, 
  children, 
  actions = [],
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
          </CardTitle>
          {actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <Button 
                  key={index}
                  variant={action.variant || "outline"} 
                  size={action.size || "sm"}
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernPageTemplate;