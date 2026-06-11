/**
 * Shared Alert Generation Utilities
 * 
 * This file contains shared logic for generating alerts across different components
 * to ensure consistency between AI Insights and Alerts Dashboard.
 */

// Alert Configuration - matches AI Insights config
export const ALERT_CONFIG = {
  SENTIMENT_THRESHOLDS: {
    CRITICAL_NEGATIVE: 70,
    HIGH_NEGATIVE: 50,
    MODERATE_NEGATIVE: 30,
    EXCELLENT_POSITIVE: 80,
    GOOD_POSITIVE: 60
  },
  VOLUME_THRESHOLDS: {
    HIGH: 1000,
    MEDIUM: 500,
    LOW: 100
  },
  ALERT_PRIORITIES: {
    CRITICAL: { color: 'red', urgency: '< 1 hour' },
    HIGH: { color: 'orange', urgency: '< 4 hours' },
    MEDIUM: { color: 'yellow', urgency: '< 24 hours' },
    LOW: { color: 'green', urgency: '< 7 days' }
  }
};

/**
 * Generate alerts from brand data using the same logic as AI Insights
 * @param {Object} brandData - The brand data object
 * @returns {Array} - Array of alert objects
 */
export const generateAlertsFromBrandData = (brandData) => {
  const alerts = [];
  
  if (!brandData) {
    console.log('🚨 AlertsUtils: No brand data provided');
    return alerts;
  }

  // Calculate rage index (same as AI Insights)
  const rageIndex = brandData.rageIndex || (100 - (brandData.positivePercentage || 0));
  
  console.log('🚨 AlertsUtils: Processing brand data:', {
    brandName: brandData.brandName,
    rageIndex: rageIndex,
    positivePercentage: brandData.positivePercentage,
    negativePercentage: brandData.negativePercentage,
    totalMentions: brandData.totalMentions,
    criticalThreshold: ALERT_CONFIG.SENTIMENT_THRESHOLDS.CRITICAL_NEGATIVE,
    highThreshold: ALERT_CONFIG.SENTIMENT_THRESHOLDS.HIGH_NEGATIVE
  });
  
  // Critical Sentiment Alert (matches AI Insights logic)
  if (rageIndex > ALERT_CONFIG.SENTIMENT_THRESHOLDS.CRITICAL_NEGATIVE) {
    console.log('🚨 AlertsUtils: Creating CRITICAL alert - rageIndex:', rageIndex, '> threshold:', ALERT_CONFIG.SENTIMENT_THRESHOLDS.CRITICAL_NEGATIVE);
    alerts.push({
      id: `critical_sentiment_${Date.now()}`,
      type: 'sentiment_drop',
      title: 'Critical Sentiment Alert',
      description: `${brandData.brandName} rage index at ${Math.round(rageIndex)}% - Immediate action required`,
      timestamp: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
      brand: brandData.brandName,
      status: 'active',
      severity: 'critical',
      source: 'ai_insights',
      platforms: Object.keys(brandData.platformStats || {}).slice(0, 3),
      keywords: ['negative feedback', 'complaints', 'critical issues'],
      mentions: Math.round(brandData.totalMentions * (brandData.negativePercentage / 100)),
      estimatedReach: Math.round(brandData.totalMentions * 2.5),
      currentValue: `${Math.round(rageIndex)}%`,
      threshold: `${ALERT_CONFIG.SENTIMENT_THRESHOLDS.CRITICAL_NEGATIVE}%`,
      change: `+${Math.round(Math.random() * 15 + 10)}%`,
      actionRequired: true,
      urgency: ALERT_CONFIG.ALERT_PRIORITIES.CRITICAL.urgency
    });
  }
  
  // High Negative Sentiment Alert
  else if (rageIndex > ALERT_CONFIG.SENTIMENT_THRESHOLDS.HIGH_NEGATIVE) {
    console.log('🚨 AlertsUtils: Creating HIGH alert - rageIndex:', rageIndex, '> threshold:', ALERT_CONFIG.SENTIMENT_THRESHOLDS.HIGH_NEGATIVE);
    alerts.push({
      id: `high_sentiment_${Date.now()}`,
      type: 'sentiment_drop',
      title: 'High Negative Sentiment Alert',
      description: `${brandData.brandName} experiencing elevated negative sentiment at ${Math.round(rageIndex)}%`,
      timestamp: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
      brand: brandData.brandName,
      status: 'active',
      severity: 'high',
      source: 'ai_insights',
      platforms: Object.keys(brandData.platformStats || {}).slice(0, 2),
      keywords: ['negative', 'complaints', 'issues'],
      mentions: Math.round(brandData.totalMentions * (brandData.negativePercentage / 100)),
      estimatedReach: Math.round(brandData.totalMentions * 2.2),
      currentValue: `${Math.round(rageIndex)}%`,
      threshold: `${ALERT_CONFIG.SENTIMENT_THRESHOLDS.HIGH_NEGATIVE}%`,
      change: `+${Math.round(Math.random() * 12 + 5)}%`,
      actionRequired: true,
      urgency: ALERT_CONFIG.ALERT_PRIORITIES.HIGH.urgency
    });
  }

  // High Volume Alert
  if (brandData.totalMentions > ALERT_CONFIG.VOLUME_THRESHOLDS.HIGH) {
    alerts.push({
      id: `volume_spike_${Date.now()}`,
      type: 'volume_spike',
      title: 'High Mention Volume Alert',
      description: `${brandData.brandName} experiencing high discussion volume with ${brandData.totalMentions.toLocaleString()} mentions`,
      timestamp: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000).toISOString(),
      brand: brandData.brandName,
      status: 'active',
      severity: brandData.totalMentions > 2000 ? 'high' : 'medium',
      source: 'volume_monitor',
      platforms: Object.keys(brandData.platformStats || {}),
      keywords: [brandData.brandName.toLowerCase(), 'trending', 'viral'],
      mentions: brandData.totalMentions,
      estimatedReach: Math.round(brandData.totalMentions * 3.2),
      currentValue: brandData.totalMentions.toLocaleString(),
      threshold: ALERT_CONFIG.VOLUME_THRESHOLDS.HIGH.toLocaleString(),
      change: `+${Math.round(Math.random() * 25 + 15)}%`,
      actionRequired: false,
      urgency: ALERT_CONFIG.ALERT_PRIORITIES.MEDIUM.urgency
    });
  }

  // Positive Sentiment Surge (good news!)
  if (brandData.positivePercentage > ALERT_CONFIG.SENTIMENT_THRESHOLDS.EXCELLENT_POSITIVE) {
    alerts.push({
      id: `positive_surge_${Date.now()}`,
      type: 'sentiment_spike',
      title: 'Positive Sentiment Surge',
      description: `${brandData.brandName} receiving exceptional positive feedback at ${Math.round(brandData.positivePercentage)}%`,
      timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
      brand: brandData.brandName,
      status: 'active',
      severity: 'low',
      source: 'sentiment_monitor',
      platforms: Object.keys(brandData.platformStats || {}).slice(0, 2),
      keywords: ['excellent', 'amazing', 'love it', 'outstanding'],
      mentions: Math.round(brandData.totalMentions * (brandData.positivePercentage / 100)),
      estimatedReach: Math.round(brandData.totalMentions * 2.8),
      currentValue: `${Math.round(brandData.positivePercentage)}%`,
      threshold: `${ALERT_CONFIG.SENTIMENT_THRESHOLDS.EXCELLENT_POSITIVE}%`,
      change: `+${Math.round(Math.random() * 10 + 5)}%`,
      actionRequired: false,
      urgency: ALERT_CONFIG.ALERT_PRIORITIES.LOW.urgency
    });
  }

  // Always generate at least one test alert if no alerts were created
  if (alerts.length === 0) {
    console.log('🚨 AlertsUtils: No alerts met thresholds, creating test alert');
    alerts.push({
      id: `test_alert_${Date.now()}`,
      type: 'sentiment_drop',
      title: 'Brand Monitoring Active',
      description: `${brandData.brandName} is being monitored. Current sentiment: ${Math.round(brandData.positivePercentage || 0)}%`,
      timestamp: new Date().toISOString(),
      brand: brandData.brandName,
      status: 'active',
      severity: 'medium',
      source: 'monitoring_system',
      platforms: Object.keys(brandData.platformStats || {}).slice(0, 2),
      keywords: ['monitoring', 'active'],
      mentions: brandData.totalMentions || 0,
      estimatedReach: Math.round((brandData.totalMentions || 0) * 2.0),
      currentValue: `${Math.round(brandData.positivePercentage || 0)}%`,
      threshold: 'N/A',
      change: '+0%',
      actionRequired: false,
      urgency: ALERT_CONFIG.ALERT_PRIORITIES.LOW.urgency
    });
  }

  console.log('🚨 AlertsUtils: Final alerts generated:', alerts.length);
  return alerts;
};

/**
 * Generate alert rules for a brand
 * @param {Object} brandData - The brand data object
 * @returns {Array} - Array of alert rule objects
 */
export const generateAlertRules = (brandData) => {
  if (!brandData) return [];

  const rules = [
    {
      id: 1,
      name: `${brandData.brandName} Critical Sentiment Monitor`,
      type: 'sentiment_drop',
      threshold: ALERT_CONFIG.SENTIMENT_THRESHOLDS.CRITICAL_NEGATIVE,
      platforms: Object.keys(brandData.platformStats || {}),
      keywords: 'critical, urgent, serious issues',
      enabled: true,
      channels: ['email', 'slack', 'sms'],
      createdBy: 'AI Insights',
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0
    },
    {
      id: 2,
      name: `${brandData.brandName} High Volume Monitor`,
      type: 'volume_spike',
      threshold: ALERT_CONFIG.VOLUME_THRESHOLDS.HIGH,
      platforms: Object.keys(brandData.platformStats || {}),
      keywords: brandData.brandName.toLowerCase(),
      enabled: true,
      channels: ['email'],
      createdBy: 'AI Insights',
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0
    },
    {
      id: 3,
      name: `${brandData.brandName} Negative Sentiment Monitor`,
      type: 'sentiment_drop',
      threshold: ALERT_CONFIG.SENTIMENT_THRESHOLDS.HIGH_NEGATIVE,
      platforms: Object.keys(brandData.platformStats || {}),
      keywords: 'negative, complaints, issues',
      enabled: true,
      channels: ['email', 'slack'],
      createdBy: 'AI Insights',
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0
    }
  ];

  return rules;
};

/**
 * Convert AI Insights alert format to AlertsDashboard format
 * @param {Array} aiAlerts - Alerts from AI Insights
 * @param {Object} brandData - Brand data for context
 * @returns {Array} - Formatted alerts for AlertsDashboard
 */
export const convertAIAlertsToAlertsDashboard = (aiAlerts, brandData) => {
  return aiAlerts.map(alert => ({
    ...alert,
    description: alert.message || alert.description,
    brand: brandData?.brandName || 'Unknown',
    platforms: Object.keys(brandData?.platformStats || {}),
    keywords: ['ai-generated', 'critical'],
    mentions: brandData?.totalMentions || 0,
    estimatedReach: Math.round((brandData?.totalMentions || 0) * 2.5),
    currentValue: alert.message?.match(/(\d+)%/)?.[1] + '%' || 'N/A',
    threshold: '70%',
    change: '+15%',
    actionRequired: alert.type === 'critical'
  }));
};