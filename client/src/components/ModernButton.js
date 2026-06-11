import React from 'react';
import { buildButtonClasses } from '../utils/designSystem';

const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'base',
  disabled = false,
  loading = false,
  icon: IconComponent,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props 
}) => {
  const buttonClasses = buildButtonClasses(variant, size);
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const loadingClasses = loading ? 'cursor-wait' : '';
  
  const combinedClasses = `${buttonClasses} ${disabledClasses} ${loadingClasses} ${className}`.trim();

  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={combinedClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && <LoadingSpinner />}
        {!loading && IconComponent && iconPosition === 'left' && (
          <IconComponent className="w-4 h-4" />
        )}
        <span>{children}</span>
        {!loading && IconComponent && iconPosition === 'right' && (
          <IconComponent className="w-4 h-4" />
        )}
      </div>
    </button>
  );
};

// Specialized button variants
export const IconButton = ({ 
  icon: IconComponent, 
  size = 'base',
  variant = 'ghost',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'p-1.5',
    base: 'p-2',
    lg: 'p-3'
  };

  return (
    <ModernButton
      variant={variant}
      className={`${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      <IconComponent className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
    </ModernButton>
  );
};

export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        let roundedClasses = '';
        if (isFirst && isLast) {
          roundedClasses = 'rounded-lg';
        } else if (isFirst) {
          roundedClasses = 'rounded-l-lg rounded-r-none';
        } else if (isLast) {
          roundedClasses = 'rounded-r-lg rounded-l-none';
        } else {
          roundedClasses = 'rounded-none';
        }
        
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${roundedClasses} -ml-px first:ml-0`.trim()
        });
      })}
    </div>
  );
};

export default ModernButton;