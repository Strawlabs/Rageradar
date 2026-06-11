import React, { useState, useEffect, useRef } from 'react';
import { getUserContext, trackUserInteraction } from '../utils/userContext';

/**
 * Contextual Help Component - Cooper's Perpetual Intermediate Optimization
 * 
 * Provides on-demand assistance without intruding on workflow.
 * Assumes domain knowledge while offering help when needed.
 */
const ContextualHelp = ({ 
  context, 
  children, 
  helpContent, 
  trigger = 'hover',
  delay = 1000,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [userNeedsHelp, setUserNeedsHelp] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const timeoutRef = useRef(null);
  const userContext = getUserContext();

  // Determine if user might need help based on behavior
  useEffect(() => {
    const shouldShowHelp = () => {
      // Don't show help for experienced users unless they explicitly ask
      if (userContext.totalAnalyses > 10) return false;
      
      // Show help for new users after some hesitation
      if (userContext.totalAnalyses === 0 && !hasInteracted) return true;
      
      // Show help if user seems stuck (context-specific logic)
      return false;
    };

    setUserNeedsHelp(shouldShowHelp());
  }, [userContext.totalAnalyses, hasInteracted]);

  const showHelp = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      trackUserInteraction('contextual_help_shown', { context });
    }, delay);
  };

  const hideHelp = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleInteraction = () => {
    setHasInteracted(true);
    setUserNeedsHelp(false);
    trackUserInteraction('user_interacted', { context });
  };

  const handleHelpClick = () => {
    setIsVisible(!isVisible);
    trackUserInteraction('contextual_help_clicked', { context });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main content */}
      <div
        onMouseEnter={trigger === 'hover' ? showHelp : undefined}
        onMouseLeave={trigger === 'hover' ? hideHelp : undefined}
        onClick={handleInteraction}
        onFocus={handleInteraction}
      >
        {children}
      </div>

      {/* Subtle help indicator - only when user might need it */}
      {userNeedsHelp && !hasInteracted && (
        <button
          onClick={handleHelpClick}
          className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-600 transition-colors animate-pulse"
          aria-label="Get help"
        >
          ?
        </button>
      )}

      {/* Contextual help tooltip */}
      {isVisible && helpContent && (
        <div className="absolute z-50 w-64 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg top-full left-0 mt-2">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {helpContent}
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-1 right-1 w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close help"
          >
            ×
          </button>
          
          {/* Arrow */}
          <div className="absolute -top-1 left-4 w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Smart Help Button - Appears only when contextually relevant
 */
export const SmartHelpButton = ({ onHelpRequest, className = '' }) => {
  const [showButton, setShowButton] = useState(false);
  const userContext = getUserContext();

  useEffect(() => {
    // Show help button only for users who might need it
    // But don't assume they're beginners
    const shouldShow = userContext.totalAnalyses < 5 || 
                      (userContext.interactions || []).some(i => 
                        i.action.includes('error') || i.action.includes('stuck')
                      );
    
    setShowButton(shouldShow);
  }, [userContext]);

  if (!showButton) return null;

  return (
    <button
      onClick={() => {
        onHelpRequest();
        trackUserInteraction('help_requested');
      }}
      className={`text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors ${className}`}
      aria-label="Get help"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
};

/**
 * Progressive Disclosure Container
 * Shows advanced features only when user is ready
 */
export const ProgressiveDisclosure = ({ 
  children, 
  advancedContent, 
  threshold = 3,
  label = "Advanced options"
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const userContext = getUserContext();

  useEffect(() => {
    // Show advanced features for experienced users
    setShowAdvanced(userContext.totalAnalyses >= threshold);
  }, [userContext.totalAnalyses, threshold]);

  const toggleAdvanced = () => {
    setIsExpanded(!isExpanded);
    trackUserInteraction('advanced_features_toggled', { expanded: !isExpanded });
  };

  return (
    <div>
      {/* Basic content - always visible */}
      {children}
      
      {/* Advanced content - progressive disclosure */}
      {showAdvanced && (
        <div className="mt-4">
          <button
            onClick={toggleAdvanced}
            className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg 
              className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {label}
          </button>
          
          {isExpanded && (
            <div className="mt-3 pl-5 border-l-2 border-slate-200 dark:border-slate-700">
              {advancedContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextualHelp;