import React from 'react';
import { buildBadgeClasses } from '../utils/designSystem';

const ModernBadge = ({ 
  children, 
  variant = 'info', 
  size = 'base',
  icon: IconComponent,
  dot = false,
  className = '',
  ...props 
}) => {
  const badgeClasses = buildBadgeClasses(variant);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    base: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const combinedClasses = `${badgeClasses} ${sizeClasses[size]} ${className}`.trim();

  return (
    <span className={combinedClasses} {...props}>
      <div className="flex items-center space-x-1">
        {dot && (
          <div className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success' ? 'bg-green-600' :
            variant === 'error' ? 'bg-red-600' :
            variant === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
          }`}></div>
        )}
        {IconComponent && <IconComponent className="w-3 h-3" />}
        <span>{children}</span>
      </div>
    </span>
  );
};

// Specialized badge variants
export const StatusBadge = ({ status, children, ...props }) => {
  const statusVariants = {
    online: 'success',
    offline: 'error',
    away: 'warning',
    busy: 'error',
    idle: 'warning'
  };

  return (
    <ModernBadge 
      variant={statusVariants[status] || 'info'} 
      dot={true}
      {...props}
    >
      {children}
    </ModernBadge>
  );
};

export const CountBadge = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <ModernBadge 
      variant="error" 
      size="sm"
      className="min-w-[1.25rem] h-5 flex items-center justify-center rounded-full"
      {...props}
    >
      {displayCount}
    </ModernBadge>
  );
};

export const GradientBadge = ({ 
  children, 
  gradient = 'from-blue-500 to-purple-600',
  className = '',
  ...props 
}) => {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${gradient} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const PulseBadge = ({ children, className = '', ...props }) => {
  return (
    <span className="relative">
      <ModernBadge className={className} {...props}>
        {children}
      </ModernBadge>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
    </span>
  );
};

export default ModernBadge;