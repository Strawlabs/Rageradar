import React, { useState, useEffect } from 'react';

/**
 * Natural Transitions Component
 * Implements Cooper's principle of natural transitions that maintain user context
 * Provides smooth, predictable transitions without jarring interface changes
 */
const NaturalTransitions = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Natural fade-in on mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Context-Preserving Page Transition
 * Maintains visual continuity during navigation
 */
export const PageTransition = ({ children, preserveScroll = false }) => {
  const [isTransitioning] = useState(false);

  useEffect(() => {
    // Preserve scroll position if requested (Cooper principle: maintain context)
    if (preserveScroll) {
      const scrollPosition = window.scrollY;
      return () => {
        window.scrollTo(0, scrollPosition);
      };
    }
  }, [preserveScroll]);

  return (
    <div className={`transition-all duration-200 ease-out ${
      isTransitioning ? 'opacity-90 scale-[0.99]' : 'opacity-100 scale-100'
    }`}>
      {children}
    </div>
  );
};

/**
 * Invisible State Transition
 * Changes state without drawing attention to the interface mechanics
 */
export const InvisibleStateTransition = ({ 
  isLoading, 
  children, 
  loadingContent = null,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className={`transition-opacity duration-150 ${
        isLoading ? 'opacity-50' : 'opacity-100'
      }`}>
        {children}
      </div>
      
      {isLoading && loadingContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          {loadingContent}
        </div>
      )}
    </div>
  );
};

/**
 * Standard Web Convention Button
 * Uses familiar patterns users already understand
 */
export const StandardButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = "",
  ...props 
}) => {
  const baseClasses = "px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-400",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Invisible Form Field
 * Standard form input without unnecessary chrome
 */
export const InvisibleFormField = ({ 
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded focus:border-red-500 focus:outline-none transition-colors duration-200 ${className}`}
      {...props}
    />
  );
};

export default NaturalTransitions;