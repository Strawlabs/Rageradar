/**
 * Feature Configuration for RageRadar
 * 
 * This file manages which features are enabled in production vs development.
 * Features marked as production: true are fully tested and ready for end users.
 */

export const FEATURE_FLAGS = {
  // Core Application Features - PRODUCTION READY ✅
  LANDING_PAGE: {
    production: true,
    description: "Main landing page with hero section and features"
  },
  
  AUTHENTICATION: {
    production: true,
    description: "Login, signup, and user authentication system"
  },
  
  DASHBOARD: {
    production: true,
    description: "Main dashboard with KPI overview and brand analytics"
  },
  
  // Reports Section - PRODUCTION READY ✅
  REPORTS_OVERVIEW: {
    production: true,
    description: "Reports overview with summary metrics and charts"
  },
  
  REPORTS_ANALYSIS: {
    production: true,
    description: "Detailed analysis reports with filtering and insights"
  },
  
  REPORTS_TRENDS: {
    production: true,
    description: "Trends analysis with timeline, events, and anomaly detection"
  },
  
  REPORTS_MENTIONS: {
    production: true,
    description: "Mentions explorer with platform breakdown and sentiment analysis"
  },
  
  COMPETITIVE_ANALYSIS: {
    production: true,
    description: "Competitive analysis with brand comparison and market insights"
  },
  
  // AI Features Section - PRODUCTION READY ✅
  AI_INSIGHTS: {
    production: true,
    description: "Enhanced AI insights with emotion analysis, geographic intelligence, and crisis prediction"
  },
  
  // Features in Development - NOT PRODUCTION READY ⚠️
  REAL_TIME_INTELLIGENCE: {
    production: true,
    description: "Real-time monitoring and live sentiment tracking"
  },
  
  ADVANCED_ALERTS: {
    production: true,
    description: "Advanced alerting system with custom triggers and email notifications"
  },
  
  EXPORT_SYSTEM: {
    production: true,
    description: "Professional data export system with PDF, Excel, PowerPoint, and JSON formats"
  },
  
  ADMIN_PANEL: {
    production: false,
    description: "Administrative panel for user and system management"
  }
};

/**
 * Check if a feature is enabled in the current environment
 * @param {string} featureName - The feature key from FEATURE_FLAGS
 * @param {boolean} isDevelopment - Whether we're in development mode
 * @returns {boolean} - Whether the feature should be enabled
 */
export const isFeatureEnabled = (featureName, isDevelopment = process.env.NODE_ENV === 'development') => {
  const feature = FEATURE_FLAGS[featureName];
  
  if (!feature) {
    console.warn(`Feature flag '${featureName}' not found`);
    return false;
  }
  
  // In development, all features are available
  if (isDevelopment) {
    return true;
  }
  
  // In production, only features marked as production: true are available
  return feature.production;
};

/**
 * Get all production-ready features
 * @returns {Array} - List of production-ready feature names
 */
export const getProductionFeatures = () => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, config]) => config.production)
    .map(([name, _]) => name);
};

/**
 * Get all development-only features
 * @returns {Array} - List of development-only feature names
 */
export const getDevelopmentFeatures = () => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, config]) => !config.production)
    .map(([name, _]) => name);
};

/**
 * Production Build Configuration
 * Features that are verified and ready for end users
 */
export const PRODUCTION_BUILD = {
  version: "1.1.0",
  buildDate: new Date().toISOString(),
  verifiedFeatures: [
    "LANDING_PAGE",
    "AUTHENTICATION", 
    "DASHBOARD",
    "REPORTS_OVERVIEW",
    "REPORTS_ANALYSIS", 
    "REPORTS_TRENDS",
    "REPORTS_MENTIONS",
    "COMPETITIVE_ANALYSIS",
    "AI_INSIGHTS",
    "ADVANCED_ALERTS",
    "REAL_TIME_INTELLIGENCE",
    "EXPORT_SYSTEM"
  ],
  description: "All core features including Dashboard, Reports, AI Insights, Alert Management, Real-time Intelligence, and Professional Export System have been fully tested and verified for production use."
};