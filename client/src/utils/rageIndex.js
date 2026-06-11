/**
 * RageRadar - Rage Index Calculation Engine
 * 
 * The Rage Index is a proprietary metric that measures the intensity of negative emotions
 * with a focus on anger, frustration, and outrage across digital platforms.
 */

// Emotion weights for Rage Index calculation
const RAGE_WEIGHTS = {
  // High rage emotions (primary contributors)
  anger: 1.0,
  rage: 1.0,
  fury: 1.0,
  outrage: 1.0,
  
  // Medium rage emotions
  frustration: 0.8,
  annoyance: 0.7,
  irritation: 0.7,
  disappointment: 0.6,
  
  // Low rage emotions
  sadness: 0.3,
  fear: 0.2,
  disgust: 0.5,
  
  // Neutral/positive emotions (negative contribution to rage)
  joy: -0.3,
  happiness: -0.3,
  satisfaction: -0.5,
  love: -0.4,
  excitement: -0.2,
  surprise: 0.1, // Can be positive or negative
  
  // Default for unknown emotions
  neutral: 0.0,
  indifferent: 0.0
};

// Platform influence multipliers (some platforms amplify rage more)
const PLATFORM_MULTIPLIERS = {
  twitter: 1.2,    // High viral potential
  reddit: 1.1,     // Discussion amplification
  facebook: 1.0,   // Baseline
  youtube: 0.9,    // Comments less influential
  instagram: 0.8,  // Visual platform, less text rage
  tiktok: 1.1,     // High engagement
  trustpilot: 1.3, // Review sites carry more weight
  glassdoor: 1.2,  // Employee reviews are impactful
  news: 1.4,       // News mentions are highly influential
  blogs: 1.1,      // Opinion pieces
  forums: 1.0,     // General discussion
  default: 1.0
};

// Time decay factors (recent mentions matter more)
const TIME_DECAY = {
  '1h': 1.0,
  '6h': 0.9,
  '24h': 0.8,
  '3d': 0.6,
  '7d': 0.4,
  '30d': 0.2
};

/**
 * Calculate Rage Index for a brand based on emotion analysis
 * @param {Array} mentions - Array of mention objects with emotions
 * @param {Object} options - Calculation options
 * @returns {Object} Rage index data
 */
export const calculateRageIndex = (mentions, options = {}) => {
  if (!mentions || mentions.length === 0) {
    return {
      rageIndex: 0,
      confidence: 0,
      breakdown: {},
      trend: 'stable',
      riskLevel: 'low'
    };
  }

  let totalRageScore = 0;
  let totalWeight = 0;
  let emotionBreakdown = {};
  let platformBreakdown = {};
  let timeBreakdown = {};

  mentions.forEach(mention => {
    const emotion = mention.emotion?.toLowerCase() || 'neutral';
    const platform = mention.platform?.toLowerCase() || 'default';
    const timestamp = mention.timestamp || mention.date;
    
    // Get emotion weight
    const emotionWeight = RAGE_WEIGHTS[emotion] || RAGE_WEIGHTS.neutral;
    
    // Get platform multiplier
    const platformMultiplier = PLATFORM_MULTIPLIERS[platform] || PLATFORM_MULTIPLIERS.default;
    
    // Calculate time decay
    const timeDecay = calculateTimeDecay(timestamp);
    
    // Calculate mention rage score
    const mentionRageScore = emotionWeight * platformMultiplier * timeDecay * (mention.confidence || 1);
    
    totalRageScore += mentionRageScore;
    totalWeight += timeDecay;
    
    // Track breakdowns
    emotionBreakdown[emotion] = (emotionBreakdown[emotion] || 0) + 1;
    platformBreakdown[platform] = (platformBreakdown[platform] || 0) + mentionRageScore;
    
    const timeKey = getTimeKey(timestamp);
    timeBreakdown[timeKey] = (timeBreakdown[timeKey] || 0) + mentionRageScore;
  });

  // Calculate final rage index (0-100 scale)
  const rawRageIndex = totalWeight > 0 ? (totalRageScore / totalWeight) : 0;
  const rageIndex = Math.max(0, Math.min(100, Math.round((rawRageIndex + 1) * 50))); // Normalize to 0-100

  // Calculate confidence based on sample size and recency
  const confidence = calculateConfidence(mentions.length, totalWeight);

  // Determine trend and risk level
  const trend = calculateTrend(timeBreakdown);
  const riskLevel = getRiskLevel(rageIndex, trend);

  return {
    rageIndex,
    confidence,
    breakdown: {
      emotions: emotionBreakdown,
      platforms: platformBreakdown,
      timeline: timeBreakdown
    },
    trend,
    riskLevel,
    totalMentions: mentions.length,
    metadata: {
      calculatedAt: new Date().toISOString(),
      algorithm: 'RageRadar v1.0'
    }
  };
};

/**
 * Calculate time decay factor based on mention timestamp
 */
const calculateTimeDecay = (timestamp) => {
  if (!timestamp) return TIME_DECAY['30d'];
  
  const now = new Date();
  const mentionTime = new Date(timestamp);
  const hoursDiff = (now - mentionTime) / (1000 * 60 * 60);
  
  if (hoursDiff <= 1) return TIME_DECAY['1h'];
  if (hoursDiff <= 6) return TIME_DECAY['6h'];
  if (hoursDiff <= 24) return TIME_DECAY['24h'];
  if (hoursDiff <= 72) return TIME_DECAY['3d'];
  if (hoursDiff <= 168) return TIME_DECAY['7d'];
  return TIME_DECAY['30d'];
};

/**
 * Get time key for breakdown
 */
const getTimeKey = (timestamp) => {
  if (!timestamp) return '30d+';
  
  const now = new Date();
  const mentionTime = new Date(timestamp);
  const hoursDiff = (now - mentionTime) / (1000 * 60 * 60);
  
  if (hoursDiff <= 1) return '1h';
  if (hoursDiff <= 6) return '6h';
  if (hoursDiff <= 24) return '24h';
  if (hoursDiff <= 72) return '3d';
  if (hoursDiff <= 168) return '7d';
  return '30d+';
};

/**
 * Calculate confidence score based on sample size and recency
 */
const calculateConfidence = (sampleSize, totalWeight) => {
  // Base confidence on sample size
  let confidence = Math.min(1, sampleSize / 100); // 100 mentions = 100% confidence
  
  // Adjust for recency (more recent mentions = higher confidence)
  const recencyBonus = Math.min(0.3, totalWeight / 10);
  confidence = Math.min(1, confidence + recencyBonus);
  
  return Math.round(confidence * 100);
};

/**
 * Calculate trend based on time breakdown
 */
const calculateTrend = (timeBreakdown) => {
  const recent = (timeBreakdown['1h'] || 0) + (timeBreakdown['6h'] || 0);
  const older = (timeBreakdown['24h'] || 0) + (timeBreakdown['3d'] || 0);
  
  if (recent > older * 1.2) return 'rising';
  if (recent < older * 0.8) return 'falling';
  return 'stable';
};

/**
 * Determine risk level based on rage index and trend
 */
const getRiskLevel = (rageIndex, trend) => {
  if (rageIndex >= 80) return 'critical';
  if (rageIndex >= 60) return 'high';
  if (rageIndex >= 40) return 'medium';
  if (rageIndex >= 20) return 'low';
  return 'minimal';
};

/**
 * Generate AI insights based on rage analysis
 */
export const generateRageInsights = (rageData, mentions) => {
  const insights = [];
  const { rageIndex, trend, breakdown, riskLevel } = rageData;

  // Risk level insights
  if (riskLevel === 'critical') {
    insights.push({
      type: 'alert',
      priority: 'high',
      message: `🚨 Critical rage level detected (${rageIndex}%). Immediate attention required.`,
      action: 'Review top negative mentions and prepare crisis response.'
    });
  } else if (riskLevel === 'high') {
    insights.push({
      type: 'warning',
      priority: 'medium',
      message: `⚠️ High rage levels detected (${rageIndex}%). Monitor closely.`,
      action: 'Investigate primary sources of frustration.'
    });
  }

  // Trend insights
  if (trend === 'rising') {
    insights.push({
      type: 'trend',
      priority: 'medium',
      message: `📈 Rage levels are rising. Early intervention recommended.`,
      action: 'Identify and address emerging issues quickly.'
    });
  }

  // Platform insights
  const topPlatform = Object.entries(breakdown.platforms)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topPlatform && topPlatform[1] > 0) {
    insights.push({
      type: 'platform',
      priority: 'low',
      message: `📱 Highest rage concentration on ${topPlatform[0]}.`,
      action: `Focus monitoring and response efforts on ${topPlatform[0]}.`
    });
  }

  // Emotion insights
  const topEmotion = Object.entries(breakdown.emotions)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topEmotion && RAGE_WEIGHTS[topEmotion[0]] > 0.5) {
    insights.push({
      type: 'emotion',
      priority: 'low',
      message: `😤 Primary emotion: ${topEmotion[0]} (${topEmotion[1]} mentions).`,
      action: `Address root causes of ${topEmotion[0]} in customer experience.`
    });
  }

  return insights;
};

/**
 * Compare rage indices between brands or time periods
 */
export const compareRageIndices = (current, comparison) => {
  const difference = current.rageIndex - comparison.rageIndex;
  const percentChange = comparison.rageIndex > 0 
    ? Math.round((difference / comparison.rageIndex) * 100)
    : 0;

  return {
    difference,
    percentChange,
    direction: difference > 0 ? 'higher' : difference < 0 ? 'lower' : 'same',
    significance: Math.abs(percentChange) > 20 ? 'significant' : 'minor'
  };
};

/**
 * Predict rage index trend for next period
 */
export const predictRageTrend = (historicalData) => {
  if (!historicalData || historicalData.length < 3) {
    return {
      prediction: 'insufficient_data',
      confidence: 0,
      expectedRange: [0, 100]
    };
  }

  // Simple linear regression for trend prediction
  const recent = historicalData.slice(-5); // Last 5 data points
  const trend = calculateLinearTrend(recent.map(d => d.rageIndex));
  
  const lastValue = recent[recent.length - 1].rageIndex;
  const prediction = Math.max(0, Math.min(100, lastValue + trend));
  
  return {
    prediction: Math.round(prediction),
    confidence: Math.min(90, recent.length * 15), // More data = higher confidence
    expectedRange: [
      Math.max(0, Math.round(prediction - 10)),
      Math.min(100, Math.round(prediction + 10))
    ],
    trend: trend > 2 ? 'increasing' : trend < -2 ? 'decreasing' : 'stable'
  };
};

/**
 * Calculate linear trend from array of values
 */
const calculateLinearTrend = (values) => {
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
};

export default {
  calculateRageIndex,
  generateRageInsights,
  compareRageIndices,
  predictRageTrend
};