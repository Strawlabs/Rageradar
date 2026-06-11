/**
 * User Context Service - Manages user preferences and recent activity
 * Implements Cooper's Goal-Directed Design principles for perpetual intermediates
 */

const USER_CONTEXT_KEY = 'rageradar_user_context';
const RECENT_ANALYSES_KEY = 'rageradar_recent_analyses';

// Default context for a new user
const DEFAULT_USER_CONTEXT = {
  primaryGoal: 'quick_check',
  industry: 'general',
  preferredMetrics: ['overall_sentiment', 'trend_direction'],
  urgencyLevel: 'low',
  lastVisit: null,
  totalAnalyses: 0,
  favoriteCategories: []
};

/**
 * Get user context from localStorage with smart defaults
 */
export const getUserContext = () => {
  try {
    const stored = localStorage.getItem(USER_CONTEXT_KEY);
    if (stored) {
      const context = JSON.parse(stored);
      return {
        ...DEFAULT_USER_CONTEXT,
        ...context,
        lastVisit: context.lastVisit ? new Date(context.lastVisit) : null
      };
    }
  } catch (error) {
    console.warn('Failed to load user context:', error);
  }

  return DEFAULT_USER_CONTEXT;
};

/**
 * Update user context with new data
 */
export const updateUserContext = (updates) => {
  try {
    const current = getUserContext();
    const updated = {
      ...current,
      ...updates,
      lastVisit: new Date().toISOString()
    };

    localStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to update user context:', error);
    return getUserContext();
  }
};

/**
 * Get recent analyses for quick access
 */
export const getRecentAnalyses = () => {
  try {
    const stored = localStorage.getItem(RECENT_ANALYSES_KEY);
    if (stored) {
      const analyses = JSON.parse(stored);
      // Return only the most recent analyses
      return analyses
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    }
  } catch (error) {
    console.warn('Failed to load recent analyses:', error);
  }

  return []; // Return empty array if no stored data exists
};

/**
 * Get mock recent analyses for demonstration
 */
export const getMockRecentAnalyses = () => {
  const now = new Date();
  return [
    {
      id: '1',
      brandName: 'Apple',
      category: 'technology',
      sentiment: 78,
      trend: 'up',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      mentions: 1247,
      keyInsight: 'Strong positive sentiment around new iPhone release'
    },
    {
      id: '2',
      brandName: 'Tesla',
      category: 'automotive',
      sentiment: -15,
      trend: 'down',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      mentions: 892,
      keyInsight: 'Concerns about recent price changes'
    },
    {
      id: '3',
      brandName: 'Netflix',
      category: 'entertainment',
      sentiment: 45,
      trend: 'stable',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      mentions: 634,
      keyInsight: 'Mixed reactions to new content releases'
    },
    {
      id: '4',
      brandName: 'Amazon',
      category: 'retail',
      sentiment: 62,
      trend: 'up',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      mentions: 1856,
      keyInsight: 'Positive feedback on delivery improvements'
    },
    {
      id: '5',
      brandName: 'Microsoft',
      category: 'technology',
      sentiment: 71,
      trend: 'up',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      mentions: 743,
      keyInsight: 'Strong enterprise adoption of new features'
    },
    {
      id: '6',
      brandName: 'Starbucks',
      category: 'food-service',
      sentiment: 23,
      trend: 'volatile',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      mentions: 456,
      keyInsight: 'Seasonal menu changes receiving mixed reviews'
    }
  ];
};

/**
 * Add a new analysis to recent history
 */
export const addRecentAnalysis = (analysis) => {
  try {
    const recent = getRecentAnalyses();
    const newAnalysis = {
      id: Date.now(),
      brandName: analysis.brandName,
      timestamp: new Date().toISOString(),
      sentiment: analysis.sentiment || 0,
      category: analysis.category || 'unknown',
      trend: analysis.trend || 'stable',
      mentions: analysis.mentions || 0,
      keyInsight: analysis.keyInsight || 'Analysis completed'
    };

    // Remove duplicate brand names (keep most recent)
    const filtered = recent.filter(item =>
      item.brandName.toLowerCase() !== newAnalysis.brandName.toLowerCase()
    );

    // Add new analysis at the beginning
    const updated = [newAnalysis, ...filtered].slice(0, 10); // Keep max 10

    localStorage.setItem(RECENT_ANALYSES_KEY, JSON.stringify(updated));

    // Update user context
    updateUserContext({
      totalAnalyses: (getUserContext().totalAnalyses || 0) + 1,
      recentBrands: updated.slice(0, 5).map(a => a.brandName)
    });

    return updated;
  } catch (error) {
    console.warn('Failed to add recent analysis:', error);
    return getRecentAnalyses();
  }
};

/**
 * Get smart defaults based on user context and time of day
 */
export const getSmartDefaults = () => {
  const context = getUserContext();
  const hour = new Date().getHours();

  // Time-based suggestions (Commonly analyzed brands)
  let timeBasedSuggestions = ['Apple', 'Tesla', 'Google'];

  if (hour >= 9 && hour <= 11) {
    // Morning suggestions
    timeBasedSuggestions = ['Apple', 'Microsoft', 'Nvidia'];
  } else if (hour >= 20) {
    // Evening suggestions
    timeBasedSuggestions = ['Netflix', 'Spotify', 'Amazon'];
  }

  return {
    suggestedBrands: timeBasedSuggestions,
    primaryAction: context.primaryGoal === 'quick_check' ? 'analyze' : 'compare',
    showRecentFirst: context.totalAnalyses > 3,
    autoFocus: true, // Always auto-focus for immediate interaction
    defaultTimeRange: '7d', // Most common use case
    defaultPlatforms: ['all'] // Eliminate configuration needs
  };
};

/**
 * Determine if user is a returning user (perpetual intermediate)
 */
export const isReturningUser = () => {
  const context = getUserContext();
  return context.totalAnalyses > 0 || context.lastVisit !== null;
};

/**
 * Get personalized workflow optimizations
 */
export const getWorkflowOptimizations = () => {
  const context = getUserContext();
  const isReturning = isReturningUser();

  return {
    // Skip onboarding for returning users
    skipOnboarding: isReturning,

    // Show advanced features for experienced users
    showAdvancedFeatures: context.totalAnalyses > 5,

    // Prioritize recent brands in suggestions
    prioritizeRecent: isReturning,

    // Auto-select common preferences
    autoSelectDefaults: {
      timeRange: '7d',
      platforms: 'all',
      metrics: context.preferredMetrics
    },

    // Optimize for Brand Manager Sarah's workflow
    primaryWorkflow: {
      step1: 'brand_input',
      step2: 'immediate_analysis',
      step3: 'key_insights',
      step4: 'action_items'
    }
  };
};

/**
 * Track user interaction for continuous optimization
 */
export const trackUserInteraction = (action, data = {}) => {
  try {
    const context = getUserContext();
    const interactions = context.interactions || [];

    const interaction = {
      action,
      timestamp: new Date().toISOString(),
      data
    };

    // Keep only last 50 interactions
    const updated = [interaction, ...interactions].slice(0, 50);

    updateUserContext({
      interactions: updated
    });
  } catch (error) {
    console.warn('Failed to track interaction:', error);
  }
};

/**
 * Get industry-specific suggestions based on user context
 */
export const getIndustrySpecificSuggestions = () => {
  const context = getUserContext();
  const industryBrands = {
    technology: ['Apple', 'Microsoft', 'Google', 'Tesla'],
    retail: ['Amazon', 'Nike', 'Walmart', 'Target'],
    entertainment: ['Netflix', 'Disney', 'Spotify', 'YouTube'],
    automotive: ['Tesla', 'Ford', 'BMW', 'Toyota'],
    'food-service': ['McDonald\'s', 'Starbucks', 'Subway', 'KFC'],
    'consumer-goods': ['Coca-Cola', 'Pepsi', 'Unilever', 'P&G']
  };

  return industryBrands[context.industry] || industryBrands.technology;
};