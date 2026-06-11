// Shared KPI calculation utilities to ensure consistency across all report pages

export const calculateKPIs = (brandData, filters = {}) => {
  if (!brandData) {
    return {
      totalMentions: 0,
      averageSentiment: 0,
      rageIndex: 0,
      confidenceScore: 0,
      platformCount: 0
    };
  }

  // Base values from brand data
  const baseTotalMentions = brandData.totalMentions || 1247;
  const basePositivePercentage = brandData.positivePercentage || 65;
  const baseConfidenceScore = 85; // Standard confidence score

  // Time range multipliers for consistent scaling
  const timeMultipliers = {
    '24h': 0.5,  // Half of baseline for daily view
    '7d': 1.0,   // baseline
    '30d': 2.5,  // 2.5x week for monthly
    '90d': 6.0   // 6x week for quarterly
  };

  // Platform filters (if specific platform selected, reduce total)
  const platformMultipliers = {
    'all': 1.0,
    'twitter': 0.35,
    'reddit': 0.30,
    'facebook': 0.25,
    'instagram': 0.20,
    'youtube': 0.18,
    'tiktok': 0.15,
    'linkedin': 0.12,
    'snapchat': 0.10,
    'pinterest': 0.08,
    'discord': 0.06,
    'telegram': 0.05,
    'whatsapp': 0.04,
    'twitch': 0.03,
    'clubhouse': 0.02
  };

  // Sentiment filters (if specific sentiment selected, adjust accordingly)
  const sentimentAdjustments = {
    'all': { multiplier: 1.0, sentimentBonus: 0 },
    'positive': { multiplier: 0.65, sentimentBonus: 15 },
    'neutral': { multiplier: 0.25, sentimentBonus: 0 },
    'negative': { multiplier: 0.10, sentimentBonus: -25 }
  };

  // Geography filters (regional market variations)
  const geographyMultipliers = {
    'all': 1.0,
    'north-america': 0.45,      // ~45% of global mentions
    'europe': 0.30,             // ~30% of global mentions
    'asia-pacific': 0.35,       // ~35% of global mentions
    'latin-america': 0.15,      // ~15% of global mentions
    'middle-east-africa': 0.10  // ~10% of global mentions
  };

  // Geography sentiment variations (cultural differences)
  const geographySentimentAdjustments = {
    'all': 0,
    'north-america': +2,        // Generally more positive sentiment
    'europe': -1,               // Slightly more critical
    'asia-pacific': +3,         // Generally positive sentiment
    'latin-america': +4,        // Very positive sentiment
    'middle-east-africa': +1    // Neutral to positive
  };

  // Apply filters
  const timeMultiplier = timeMultipliers[filters.timeRange] || 1.0;
  const platformMultiplier = platformMultipliers[filters.platform] || 1.0;
  const sentimentAdjustment = sentimentAdjustments[filters.sentiment] || sentimentAdjustments.all;
  const geographyMultiplier = geographyMultipliers[filters.geography] || 1.0;
  const geographySentimentAdjustment = geographySentimentAdjustments[filters.geography] || 0;

  // Calculate final values
  const totalMentions = Math.round(baseTotalMentions * timeMultiplier * platformMultiplier * sentimentAdjustment.multiplier * geographyMultiplier);
  
  // Calculate average sentiment with platform, time, and geography variations
  let averageSentiment = basePositivePercentage + sentimentAdjustment.sentimentBonus + geographySentimentAdjustment;
  
  // Platform-specific sentiment variations
  const platformSentimentAdjustments = {
    'twitter': -3,    // Slightly more negative on Twitter
    'reddit': -5,     // More negative on Reddit
    'facebook': +2,   // Slightly more positive on Facebook
    'instagram': +5,  // More positive on Instagram
    'youtube': +1,    // Neutral to slightly positive
    'tiktok': +3,     // Generally positive on TikTok
    'linkedin': +4,   // Professional, generally positive
    'snapchat': +2,   // Young audience, generally positive
    'pinterest': +6,  // Visual, aspirational content
    'discord': 0,     // Gaming/community, neutral
    'telegram': -1,   // Mixed sentiment
    'whatsapp': +1,   // Personal, generally positive
    'twitch': +2,     // Entertainment, generally positive
    'clubhouse': +3   // Professional networking, positive
  };
  
  if (filters.platform !== 'all' && platformSentimentAdjustments[filters.platform]) {
    averageSentiment += platformSentimentAdjustments[filters.platform];
  }
  
  // Time range affects sentiment (longer periods tend to be more stable/neutral)
  if (timeMultiplier > 2) {
    averageSentiment += 2; // Longer periods show slight positive bias
  } else if (timeMultiplier < 1) {
    averageSentiment -= 3; // Shorter periods can be more volatile/negative
  }
  
  averageSentiment = Math.max(0, Math.min(100, averageSentiment));
  const rageIndex = Math.round(100 - averageSentiment);
  // Calculate confidence score based on multiple factors
  let confidenceScore = baseConfidenceScore;
  
  // Time range affects confidence (more data = higher confidence)
  if (timeMultiplier > 1) {
    confidenceScore += 5; // More data over longer periods
  } else if (timeMultiplier < 1) {
    confidenceScore -= 10; // Less data over shorter periods
  }
  
  // Platform specificity affects confidence
  if (filters.platform !== 'all') {
    confidenceScore -= 5; // Less confident with single platform
  }
  
  // Sentiment filtering affects confidence
  if (filters.sentiment !== 'all') {
    confidenceScore -= 8; // Less confident when filtering by sentiment
  }
  
  confidenceScore = Math.max(60, Math.min(95, confidenceScore));
  const platformCount = filters.platform === 'all' ? 6 : 1;

  // Calculate proper sentiment percentages based on averageSentiment
  const positivePercentage = Math.max(0, Math.min(100, averageSentiment));
  const negativePercentage = Math.max(0, Math.min(40, (100 - averageSentiment) * 0.6)); // Negative is subset of non-positive
  const neutralPercentage = Math.max(0, 100 - positivePercentage - negativePercentage); // Remainder is neutral

  const result = {
    totalMentions,
    averageSentiment,
    rageIndex,
    confidenceScore,
    platformCount,
    // Proper sentiment percentages
    positivePercentage,
    negativePercentage,
    neutralPercentage,
    // Change indicators (for trend display)
    mentionsChange: Math.round((timeMultiplier - 1) * 20),
    sentimentChange: Math.round(sentimentAdjustment.sentimentBonus * 0.3),
    confidenceChange: timeMultiplier > 1 ? 5 : 0
  };
  
  return result;
};

// Helper function to format numbers consistently
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

// Helper function to get trend indicator
export const getTrendIndicator = (change) => {
  if (change > 0) return { color: 'text-green-400', symbol: '+', trend: 'increasing' };
  if (change < 0) return { color: 'text-red-400', symbol: '', trend: 'decreasing' };
  return { color: 'text-gray-400', symbol: '', trend: 'stable' };
};