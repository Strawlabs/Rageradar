/**
 * React hooks for Cooper Analytics integration
 * Provides easy-to-use hooks for tracking user behavior and Cooper principles
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import cooperAnalytics from '../utils/cooperAnalytics';
import abTesting from '../utils/abTesting';

// Hook for tracking goal-directed behavior
export const useGoalTracking = (goalId, description, targetTime = null) => {
  const goalStarted = useRef(false);

  useEffect(() => {
    if (!goalStarted.current) {
      cooperAnalytics.defineGoal(goalId, description, targetTime);
      goalStarted.current = true;
    }

    return () => {
      // Clean up if component unmounts before goal completion
      const goal = cooperAnalytics.goals.get(goalId);
      if (goal && !goal.completed) {
        cooperAnalytics.sendEvent('goal_abandoned', {
          goalId,
          timeSpent: Date.now() - goal.startTime,
          stepsCompleted: goal.steps.length
        });
      }
    };
  }, [goalId, description, targetTime]);

  const trackStep = useCallback((stepName, metadata = {}) => {
    cooperAnalytics.trackGoalStep(goalId, stepName, metadata);
  }, [goalId]);

  const completeGoal = useCallback((metadata = {}) => {
    cooperAnalytics.completeGoal(goalId, metadata);
  }, [goalId]);

  return { trackStep, completeGoal };
};

// Hook for tracking user journey and friction points
export const useJourneyTracking = () => {
  const trackAction = useCallback((action, context = {}) => {
    cooperAnalytics.trackJourneyStep(action, context);
  }, []);

  const trackError = useCallback((error, context = {}) => {
    cooperAnalytics.trackJourneyStep('error', { error, ...context });
  }, []);

  const trackSuccess = useCallback((action, context = {}) => {
    cooperAnalytics.trackJourneyStep('success', { action, ...context });
  }, []);

  return { trackAction, trackError, trackSuccess };
};

// Hook for Cooper principle adherence tracking
export const useCooperTracking = () => {
  const trackAdherence = useCallback((principle, score, context = {}) => {
    cooperAnalytics.trackCooperPrinciple(principle, score, context);
  }, []);

  const trackGoalDirected = useCallback((score, context = {}) => {
    trackAdherence('goal_directed', score, context);
  }, [trackAdherence]);

  const trackPerpetualIntermediate = useCallback((score, context = {}) => {
    trackAdherence('perpetual_intermediate', score, context);
  }, [trackAdherence]);

  const trackInterfaceInvisibility = useCallback((score, context = {}) => {
    trackAdherence('interface_invisibility', score, context);
  }, [trackAdherence]);

  const trackDirectManipulation = useCallback((score, context = {}) => {
    trackAdherence('direct_manipulation', score, context);
  }, [trackAdherence]);

  const trackExciseElimination = useCallback((score, context = {}) => {
    trackAdherence('excise_elimination', score, context);
  }, [trackAdherence]);

  return {
    trackAdherence,
    trackGoalDirected,
    trackPerpetualIntermediate,
    trackInterfaceInvisibility,
    trackDirectManipulation,
    trackExciseElimination
  };
};

// Hook for A/B testing
export const useABTest = (testId, variants = []) => {
  const [variant, setVariant] = useState(() => {
    return variants.length > 0 ? abTesting.getVariant(testId) : null;
  });

  useEffect(() => {
    if (variants.length > 0) {
      setVariant(abTesting.getVariant(testId));
    }
  }, [testId, variants]);

  const trackConversion = useCallback((conversionType = 'primary', value = 1) => {
    abTesting.trackConversion(testId, conversionType, value);
  }, [testId]);

  return { variant, trackConversion };
};

// Hook for time-to-insight tracking
export const useInsightTracking = () => {
  const insightStartTime = useRef(null);

  const startInsightTimer = useCallback(() => {
    insightStartTime.current = Date.now();
  }, []);

  const recordInsight = useCallback((metadata = {}) => {
    if (insightStartTime.current) {
      const timeToInsight = Date.now() - insightStartTime.current;
      cooperAnalytics.trackTimeToFirstInsight(timeToInsight);
      insightStartTime.current = null;
    }
  }, []);

  return { startInsightTimer, recordInsight };
};

// Hook for performance monitoring
export const usePerformanceTracking = () => {
  const trackPageLoad = useCallback((pageName) => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        cooperAnalytics.sendEvent('page_performance', {
          page: pageName,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        });
      }
    }
  }, []);

  const trackInteraction = useCallback((interactionType, element, duration) => {
    cooperAnalytics.sendEvent('interaction_performance', {
      type: interactionType,
      element,
      duration,
      timestamp: Date.now()
    });
  }, []);

  return { trackPageLoad, trackInteraction };
};

// Hook for accessibility tracking
export const useAccessibilityTracking = () => {
  const trackKeyboardNavigation = useCallback((action, element) => {
    cooperAnalytics.sendEvent('accessibility_keyboard', {
      action,
      element,
      timestamp: Date.now()
    });
  }, []);

  const trackScreenReaderUsage = useCallback((action, content) => {
    cooperAnalytics.sendEvent('accessibility_screen_reader', {
      action,
      content,
      timestamp: Date.now()
    });
  }, []);

  const trackFocusManagement = useCallback((fromElement, toElement) => {
    cooperAnalytics.sendEvent('accessibility_focus', {
      from: fromElement,
      to: toElement,
      timestamp: Date.now()
    });
  }, []);

  return { trackKeyboardNavigation, trackScreenReaderUsage, trackFocusManagement };
};

// Hook for user context tracking
export const useUserContext = () => {
  const updateUserContext = useCallback((context) => {
    cooperAnalytics.sendEvent('user_context_update', {
      context,
      timestamp: Date.now()
    });
  }, []);

  const trackUserType = useCallback(() => {
    const userType = cooperAnalytics.getUserType();
    cooperAnalytics.sendEvent('user_type_classification', {
      userType,
      timestamp: Date.now()
    });
    return userType;
  }, []);

  return { updateUserContext, trackUserType };
};

// Hook for session analytics
export const useSessionAnalytics = () => {
  useEffect(() => {
    // Track session start
    cooperAnalytics.trackJourneyStep('session_start', {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer
    });

    // Track session end on page unload
    const handleUnload = () => {
      const summary = cooperAnalytics.getSessionSummary();
      cooperAnalytics.sendEvent('session_end', summary);
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, []);

  const getSessionSummary = useCallback(() => {
    return cooperAnalytics.getSessionSummary();
  }, []);

  return { getSessionSummary };
};

// Composite hook for comprehensive analytics
export const useCooperAnalytics = (config = {}) => {
  const {
    goalId,
    goalDescription,
    targetTime,
    trackJourney = true,
    trackPerformance = true,
    abTestId,
    abTestVariants = []
  } = config;

  // Initialize all tracking hooks
  const goalTracking = goalId ? useGoalTracking(goalId, goalDescription, targetTime) : null;
  const journeyTracking = trackJourney ? useJourneyTracking() : null;
  const cooperTracking = useCooperTracking();
  const abTest = abTestId ? useABTest(abTestId, abTestVariants) : null;
  const insightTracking = useInsightTracking();
  const performanceTracking = trackPerformance ? usePerformanceTracking() : null;
  const accessibilityTracking = useAccessibilityTracking();
  const userContext = useUserContext();
  
  useSessionAnalytics();

  return {
    goal: goalTracking,
    journey: journeyTracking,
    cooper: cooperTracking,
    abTest,
    insight: insightTracking,
    performance: performanceTracking,
    accessibility: accessibilityTracking,
    userContext
  };
};