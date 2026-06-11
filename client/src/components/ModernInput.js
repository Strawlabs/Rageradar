import React, { useState, forwardRef } from 'react';
import { designSystem } from '../utils/designSystem';

const ModernInput = forwardRef(({ 
  label,
  error,
  helperText,
  icon: IconComponent,
  iconPosition = 'left',
  size = 'base',
  variant = 'default',
  className = '',
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    base: 'px-4 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  const variantClasses = {
    default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-500 focus:border-green-500'
  };

  const inputClasses = `
    block w-full rounded-lg border bg-white transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[error ? 'error' : variant]}
    ${IconComponent && iconPosition === 'left' ? 'pl-10' : ''}
    ${IconComponent && iconPosition === 'right' ? 'pr-10' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {IconComponent && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <IconComponent className={`w-5 h-5 ${error ? 'text-red-400' : focused ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

ModernInput.displayName = 'ModernInput';

// Specialized input variants
export const SearchInput = ({ 
  placeholder = "Search...", 
  onSearch,
  className = '',
  ...props 
}) => {
  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <ModernInput
      icon={SearchIcon}
      placeholder={placeholder}
      onKeyPress={handleKeyPress}
      className={className}
      {...props}
    />
  );
};

export const Select = ({ 
  label,
  error,
  helperText,
  options = [],
  placeholder = "Select an option",
  className = '',
  ...props 
}) => {
  const ChevronDownIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const selectClasses = `
    block w-full px-4 py-2 rounded-lg border border-gray-300 bg-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    appearance-none pr-10 transition-colors duration-200
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select className={selectClasses} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDownIcon />
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export const TextArea = forwardRef(({ 
  label,
  error,
  helperText,
  rows = 4,
  className = '',
  ...props 
}, ref) => {
  const textareaClasses = `
    block w-full px-4 py-2 rounded-lg border border-gray-300 bg-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    resize-vertical transition-colors duration-200
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default ModernInput;