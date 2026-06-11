import React from 'react';
import { designSystem, buildCardClasses } from '../utils/designSystem';

const ModernCard = ({ 
  children, 
  className = '', 
  hover = true, 
  padding = true,
  variant = 'base',
  onClick,
  ...props 
}) => {
  const cardClasses = buildCardClasses(variant, hover);
  const paddingClass = padding ? 'p-6' : '';
  
  const combinedClasses = `${cardClasses} ${paddingClass} ${className}`.trim();
  
  if (onClick) {
    return (
      <button 
        className={`${combinedClasses} cursor-pointer text-left w-full`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

// Specialized card variants
export const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: IconComponent,
  description,
  className = ''
}) => {
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'neutral': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
      default: return '→';
    }
  };

  return (
    <ModernCard className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {IconComponent && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <IconComponent className="w-6 h-6 text-blue-600" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        
        {change && (
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${getTrendColor(trend)}`}>
              <span className="text-lg">{getTrendIcon(trend)}</span>
              <span className="text-sm font-medium">{change}</span>
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    </ModernCard>
  );
};

export const ChartCard = ({ 
  title, 
  children, 
  actions,
  className = ''
}) => {
  return (
    <ModernCard className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </ModernCard>
  );
};

export const StatusCard = ({ 
  status, 
  title, 
  description, 
  value,
  className = ''
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-800 border-red-200';
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ModernCard className={`${getStatusColor(status)} ${className}`}>
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getStatusDot(status)}`}></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{title}</h4>
            {value && <span className="font-bold">{value}</span>}
          </div>
          {description && (
            <p className="text-sm opacity-75 mt-1">{description}</p>
          )}
        </div>
      </div>
    </ModernCard>
  );
};

export default ModernCard;