import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs } from '../utils/kpiCalculations';
import { generateAlertsFromBrandData } from '../utils/alertsUtils';
import FilterBar from './shared/FilterBar';
import ColorfulWidget from './shared/ColorfulWidget';
import PageHeader from './shared/PageHeader';
import EmptyState from './shared/EmptyState';
import { capitalizeBrandName } from '../utils/brandUtils';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Eye,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lightbulb,
  Shield,
  Rocket,
  Activity,
  Users,
  Globe,
  Filter,
  Download,
  Share2,
  Settings,
  ChevronRight,
  Star,
  TrendingDown
} from 'lucide-react';

const EnhancedAIInsightsEngine = () => {
  const [searchParams] = useSearchParams();
  const brandName = searchParams.get('brand');
  const { currentUser } = useAuth();
  const { currentBrand, analyzedBrands } = useBrand();
  const { filters } = useFilters();
  const navigate = useNavigate();

  // Enhanced AI Engine Configuration
  const AI_CONFIG = {
    SENTIMENT_THRESHOLDS: {
      CRITICAL_NEGATIVE: 70,
      HIGH_NEGATIVE: 50,
      MODERATE_NEGATIVE: 30,
      EXCELLENT_POSITIVE: 80,
      GOOD_POSITIVE: 60
    },
    CONFIDENCE_LEVELS: {
      HIGH: 0.85,
      MEDIUM: 0.70,
      LOW: 0.55
    },
    ALERT_PRIORITIES: {
      CRITICAL: { color: 'red', urgency: '< 1 hour' },
      HIGH: { color: 'orange', urgency: '< 4 hours' },
      MEDIUM: { color: 'yellow', urgency: '< 24 hours' },
      LOW: { color: 'green', urgency: '< 7 days' }
    }
  };

  // State management
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('insights');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isUpdatingData, setIsUpdatingData] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState(new Set());

  // Toggle insight expansion
  const toggleInsightExpansion = (insightId) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };




  const [aiPerformance, setAiPerformance] = useState({
    accuracy: 0.89,
    predictions_made: 247,
    successful_predictions: 219,
    learning_rate: 0.12,
    uptime: '99.7%'
  });

  // Advanced AI Analysis Functions
  const performSentimentAnalysis = useCallback((brandData) => {
    if (!brandData) return null;

    const sentiment = {
      positive: brandData.positivePercentage || 0,
      negative: brandData.negativePercentage || 0,
      neutral: brandData.neutralPercentage || 0
    };

    console.log('🎭 Sentiment Analysis Input:', {
      brandName: brandData.brandName,
      positivePercentage: brandData.positivePercentage,
      negativePercentage: brandData.negativePercentage,
      neutralPercentage: brandData.neutralPercentage,
      sentiment
    });

    const sentimentScore = (sentiment.positive * 1.0) + (sentiment.neutral * 0.5) - (sentiment.negative * 1.2);
    const volatility = Math.abs(sentiment.positive - sentiment.negative);
    const stability = 100 - volatility;

    return {
      ...sentiment,
      score: Math.max(0, Math.min(100, sentimentScore)),
      volatility,
      stability,
      trend: sentiment.positive > sentiment.negative ? 'positive' : 'negative',
      confidence: Math.min(0.95, 0.6 + (brandData.totalMentions / 1000) * 0.3)
    };
  }, []);

  // Enhanced Emotion AI - Phase 1 Feature
  const performEmotionAnalysis = useCallback((brandData) => {
    if (!brandData) return null;

    const sentiment = performSentimentAnalysis(brandData);
    if (!sentiment) return null;

    const mentions = brandData.totalMentions || 0;
    const avgMentions = 500; // baseline for comparison

    // Emotion detection based on sentiment patterns and volume
    const emotions = {
      joy: {
        intensity: sentiment.positive > 70 && sentiment.volatility < 20 ?
          Math.min(100, sentiment.positive + (sentiment.stability / 2)) : 0,
        confidence: sentiment.positive > 70 ? 0.85 : 0.45,
        triggers: sentiment.positive > 70 ? ['High positive sentiment', 'Low volatility', 'Stable brand perception'] : []
      },
      anger: {
        intensity: sentiment.negative > 40 && mentions > avgMentions ?
          Math.min(100, sentiment.negative + (mentions / avgMentions * 10)) : 0,
        confidence: sentiment.negative > 40 && mentions > avgMentions ? 0.88 : 0.35,
        triggers: sentiment.negative > 40 ? ['High negative sentiment', 'Increased mention volume', 'Potential crisis indicators'] : []
      },
      fear: {
        intensity: sentiment.negative > 30 && sentiment.volatility > 40 ?
          Math.min(100, sentiment.volatility + sentiment.negative / 2) : 0,
        confidence: sentiment.volatility > 40 ? 0.75 : 0.40,
        triggers: sentiment.volatility > 40 ? ['High sentiment volatility', 'Uncertain brand perception', 'Mixed reactions'] : []
      },
      surprise: {
        intensity: mentions > avgMentions * 1.5 ?
          Math.min(100, (mentions / avgMentions) * 30) : 0,
        confidence: mentions > avgMentions * 1.5 ? 0.80 : 0.30,
        triggers: mentions > avgMentions * 1.5 ? ['Sudden mention spike', 'Viral content or event', 'Increased brand attention'] : []
      },
      trust: {
        intensity: sentiment.positive > 60 && sentiment.stability > 70 ?
          Math.min(100, (sentiment.positive + sentiment.stability) / 2) : 0,
        confidence: sentiment.stability > 70 ? 0.82 : 0.45,
        triggers: sentiment.stability > 70 ? ['Consistent positive sentiment', 'High stability', 'Reliable brand perception'] : []
      },
      disgust: {
        intensity: sentiment.negative > 50 && brandData.rageIndex > 60 ?
          Math.min(100, (sentiment.negative + brandData.rageIndex) / 2) : 0,
        confidence: brandData.rageIndex > 60 ? 0.85 : 0.40,
        triggers: brandData.rageIndex > 60 ? ['High rage index', 'Strong negative sentiment', 'Brand reputation issues'] : []
      }
    };

    // Calculate dominant emotion
    const dominantEmotion = Object.entries(emotions)
      .filter(([_, emotion]) => emotion.intensity > 20)
      .sort(([_, a], [__, b]) => b.intensity - a.intensity)[0];

    return {
      emotions,
      dominant_emotion: dominantEmotion ? {
        name: dominantEmotion[0],
        intensity: Math.round(dominantEmotion[1].intensity),
        confidence: dominantEmotion[1].confidence
      } : null,
      emotional_stability: sentiment.stability,
      emotional_complexity: Object.values(emotions).filter(e => e.intensity > 15).length,
      overall_emotional_health: Math.round((sentiment.score + sentiment.stability) / 2)
    };
  }, [performSentimentAnalysis]);

  // Geographic Intelligence - Phase 1 Feature
  const performGeographicAnalysis = useCallback((brandData, currentFilters) => {
    if (!brandData) return null;

    // Regional performance data based on geography filter and cultural factors
    const regions = {
      'north-america': {
        name: 'North America',
        sentiment_modifier: 2,
        volume_share: 0.45,
        cultural_traits: ['Direct communication', 'Brand loyalty', 'Social media active'],
        market_maturity: 'mature',
        crisis_sensitivity: 'medium'
      },
      'europe': {
        name: 'Europe',
        sentiment_modifier: -1,
        volume_share: 0.30,
        cultural_traits: ['Privacy conscious', 'Quality focused', 'Regulatory aware'],
        market_maturity: 'mature',
        crisis_sensitivity: 'high'
      },
      'asia-pacific': {
        name: 'Asia Pacific',
        sentiment_modifier: 3,
        volume_share: 0.35,
        cultural_traits: ['Mobile first', 'Community driven', 'Innovation embracing'],
        market_maturity: 'growing',
        crisis_sensitivity: 'low'
      },
      'latin-america': {
        name: 'Latin America',
        sentiment_modifier: 4,
        volume_share: 0.15,
        cultural_traits: ['Relationship focused', 'Family oriented', 'Expressive communication'],
        market_maturity: 'emerging',
        crisis_sensitivity: 'medium'
      },
      'middle-east-africa': {
        name: 'Middle East & Africa',
        sentiment_modifier: 1,
        volume_share: 0.10,
        cultural_traits: ['Traditional values', 'Community respect', 'Growing digital adoption'],
        market_maturity: 'emerging',
        crisis_sensitivity: 'low'
      }
    };

    const baseSentiment = brandData.positivePercentage - brandData.negativePercentage;
    const baseMentions = brandData.totalMentions || 0;

    // Calculate regional performance
    const regionalData = Object.entries(regions).map(([regionId, region]) => {
      const isCurrentRegion = currentFilters?.geography === regionId;
      const adjustedSentiment = Math.max(0, Math.min(100, baseSentiment + region.sentiment_modifier));
      const adjustedMentions = Math.round(baseMentions * region.volume_share);

      return {
        id: regionId,
        name: region.name,
        sentiment_score: adjustedSentiment,
        mention_volume: adjustedMentions,
        market_share: Math.round(region.volume_share * 100),
        cultural_traits: region.cultural_traits,
        market_maturity: region.market_maturity,
        crisis_sensitivity: region.crisis_sensitivity,
        is_current: isCurrentRegion,
        performance_vs_global: adjustedSentiment - baseSentiment,
        opportunity_score: calculateOpportunityScore(adjustedSentiment, adjustedMentions, region.market_maturity)
      };
    });

    // Find best and worst performing regions
    const sortedByPerformance = [...regionalData].sort((a, b) => b.sentiment_score - a.sentiment_score);
    const bestRegion = sortedByPerformance[0];
    const worstRegion = sortedByPerformance[sortedByPerformance.length - 1];

    // Calculate geographic insights
    const insights = {
      regional_performance: regionalData,
      best_performing_region: bestRegion,
      worst_performing_region: worstRegion,
      geographic_diversity: calculateGeographicDiversity(regionalData),
      expansion_opportunities: regionalData
        .filter(r => r.opportunity_score > 70)
        .sort((a, b) => b.opportunity_score - a.opportunity_score),
      risk_regions: regionalData
        .filter(r => r.sentiment_score < 40 || r.crisis_sensitivity === 'high')
        .sort((a, b) => a.sentiment_score - b.sentiment_score),
      cultural_alignment: analyzeCulturalAlignment(regionalData, brandData),
      global_reach_score: Math.round(regionalData.reduce((sum, r) => sum + r.market_share, 0))
    };

    return insights;

    // Helper functions
    function calculateOpportunityScore(sentiment, mentions, maturity) {
      const sentimentWeight = sentiment * 0.4;
      const volumeWeight = (mentions / baseMentions) * 100 * 0.3;
      const maturityWeight = maturity === 'emerging' ? 30 : maturity === 'growing' ? 20 : 10;
      return Math.min(100, sentimentWeight + volumeWeight + maturityWeight);
    }

    function calculateGeographicDiversity(regions) {
      const activeRegions = regions.filter(r => r.mention_volume > 0).length;
      const sentimentVariance = calculateVariance(regions.map(r => r.sentiment_score));
      return {
        active_regions: activeRegions,
        sentiment_variance: Math.round(sentimentVariance),
        diversity_score: Math.round((activeRegions / regions.length) * 100)
      };
    }

    function analyzeCulturalAlignment(regions, brandData) {
      // Analyze how well brand performs across different cultural contexts
      const culturalPerformance = regions.map(region => ({
        region: region.name,
        alignment_score: Math.round(region.sentiment_score + (region.market_maturity === 'mature' ? 10 : 0)),
        cultural_fit: region.sentiment_score > baseSentiment ? 'strong' : 'needs_improvement'
      }));

      return {
        overall_cultural_adaptability: Math.round(
          culturalPerformance.reduce((sum, cp) => sum + cp.alignment_score, 0) / culturalPerformance.length
        ),
        strong_cultural_fits: culturalPerformance.filter(cp => cp.cultural_fit === 'strong'),
        improvement_areas: culturalPerformance.filter(cp => cp.cultural_fit === 'needs_improvement')
      };
    }

    function calculateVariance(values) {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
      return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }
  }, []);

  // Advanced Crisis Prediction - Phase 1 Feature
  const performAdvancedCrisisPrediction = useCallback((brandData, emotionData, geographicData) => {
    if (!brandData) return { anomalies: [], crisis_assessment: null };

    const anomalies = [];
    const currentMetrics = {
      mentions: brandData.totalMentions || 0,
      sentiment: brandData.positivePercentage - brandData.negativePercentage,
      rageIndex: brandData.rageIndex || 0,
      positivePercentage: brandData.positivePercentage || 0,
      negativePercentage: brandData.negativePercentage || 0
    };

    // Multi-signal crisis detection
    const crisisSignals = {
      sentiment_velocity: calculateSentimentVelocity(currentMetrics),
      volume_anomaly: detectVolumeAnomalies(currentMetrics),
      emotional_distress: analyzeEmotionalDistress(emotionData),
      geographic_spread: analyzeGeographicRisk(geographicData),
      platform_cascade: detectPlatformCascade(brandData),
      keyword_toxicity: analyzeKeywordToxicity(currentMetrics)
    };

    // Crisis probability calculation
    const crisisProbability = calculateCrisisProbability(crisisSignals);
    const timeToImpact = estimateTimeToImpact(crisisSignals);
    const severityLevel = assessCrisisSeverity(crisisSignals, currentMetrics);

    // Generate specific anomaly alerts
    Object.entries(crisisSignals).forEach(([signalType, signal]) => {
      if (signal.detected && signal.severity !== 'low') {
        anomalies.push({
          type: signalType,
          severity: signal.severity,
          description: signal.description,
          confidence: signal.confidence,
          impact: signal.impact,
          time_to_impact: signal.time_to_impact,
          mitigation_urgency: signal.mitigation_urgency,
          affected_stakeholders: signal.affected_stakeholders || []
        });
      }
    });

    // Comprehensive crisis assessment
    const crisisAssessment = {
      overall_risk_level: severityLevel,
      crisis_probability: Math.round(crisisProbability * 100),
      estimated_time_to_impact: timeToImpact,
      primary_risk_factors: Object.entries(crisisSignals)
        .filter(([_, signal]) => signal.risk_score > 60)
        .map(([type, signal]) => ({ type, risk_score: signal.risk_score, description: signal.description }))
        .sort((a, b) => b.risk_score - a.risk_score),
      recommended_actions: generateCrisisRecommendations(crisisSignals, severityLevel),
      stakeholder_impact: assessStakeholderImpact(crisisSignals),
      recovery_timeline: estimateRecoveryTimeline(severityLevel, crisisProbability)
    };

    return { anomalies, crisis_assessment: crisisAssessment };

    // Helper functions for crisis prediction
    function calculateSentimentVelocity(metrics) {
      const velocityScore = Math.abs(metrics.sentiment) > 50 ? 80 : Math.abs(metrics.sentiment) * 1.6;
      const isNegativeTrend = metrics.sentiment < -20;

      return {
        detected: velocityScore > 60,
        severity: velocityScore > 80 ? 'critical' : velocityScore > 60 ? 'high' : 'medium',
        confidence: 0.85,
        risk_score: velocityScore,
        description: `Sentiment velocity: ${Math.round(velocityScore)}% change rate`,
        impact: isNegativeTrend ? 'Rapid reputation decline detected' : 'Sentiment volatility increasing',
        time_to_impact: isNegativeTrend ? '2-6 hours' : '12-24 hours',
        mitigation_urgency: isNegativeTrend ? 'immediate' : 'high',
        affected_stakeholders: ['customers', 'investors', 'media']
      };
    }

    function detectVolumeAnomalies(metrics) {
      const baselineVolume = 500;
      const volumeMultiplier = metrics.mentions / baselineVolume;
      const anomalyScore = volumeMultiplier > 2 ? Math.min(100, volumeMultiplier * 30) : 0;

      return {
        detected: volumeMultiplier > 2,
        severity: volumeMultiplier > 4 ? 'critical' : volumeMultiplier > 2.5 ? 'high' : 'medium',
        confidence: 0.92,
        risk_score: anomalyScore,
        description: `Volume spike: ${Math.round(volumeMultiplier * 100)}% above baseline`,
        impact: volumeMultiplier > 4 ? 'Viral crisis potential detected' : 'Unusual attention surge',
        time_to_impact: volumeMultiplier > 4 ? '1-3 hours' : '6-12 hours',
        mitigation_urgency: volumeMultiplier > 4 ? 'immediate' : 'high',
        affected_stakeholders: ['social_media', 'news_outlets', 'customers']
      };
    }

    function analyzeEmotionalDistress(emotionData) {
      if (!emotionData) return { detected: false, risk_score: 0 };

      const negativeEmotions = ['anger', 'fear', 'disgust'];
      const negativeIntensity = negativeEmotions.reduce((sum, emotion) => {
        return sum + (emotionData.emotions[emotion]?.intensity || 0);
      }, 0) / negativeEmotions.length;

      const distressScore = negativeIntensity;

      return {
        detected: distressScore > 40,
        severity: distressScore > 70 ? 'critical' : distressScore > 50 ? 'high' : 'medium',
        confidence: 0.78,
        risk_score: distressScore,
        description: `Emotional distress level: ${Math.round(distressScore)}%`,
        impact: distressScore > 70 ? 'Severe emotional backlash detected' : 'Negative emotional response building',
        time_to_impact: distressScore > 70 ? '30 minutes - 2 hours' : '4-8 hours',
        mitigation_urgency: distressScore > 70 ? 'immediate' : 'high',
        affected_stakeholders: ['customers', 'community', 'employees']
      };
    }

    function analyzeGeographicRisk(geoData) {
      if (!geoData) return { detected: false, risk_score: 0 };

      const riskRegions = geoData.risk_regions || [];
      const riskScore = riskRegions.length > 0 ? Math.min(100, riskRegions.length * 25 + (riskRegions[0]?.sentiment_score < 30 ? 30 : 0)) : 0;

      return {
        detected: riskRegions.length > 0,
        severity: riskScore > 70 ? 'critical' : riskScore > 40 ? 'high' : 'medium',
        confidence: 0.82,
        risk_score: riskScore,
        description: `Geographic risk: ${riskRegions.length} regions affected`,
        impact: riskScore > 70 ? 'Multi-regional crisis spreading' : 'Regional reputation issues detected',
        time_to_impact: riskScore > 70 ? '2-6 hours' : '1-2 days',
        mitigation_urgency: riskScore > 70 ? 'immediate' : 'medium',
        affected_stakeholders: ['regional_customers', 'local_media', 'distributors']
      };
    }

    function detectPlatformCascade(brandData) {
      const platforms = Object.keys(brandData.platformStats || {});
      const cascadeRisk = platforms.length > 3 ? Math.min(100, platforms.length * 15) : 0;

      return {
        detected: cascadeRisk > 45,
        severity: cascadeRisk > 75 ? 'critical' : cascadeRisk > 60 ? 'high' : 'medium',
        confidence: 0.75,
        risk_score: cascadeRisk,
        description: `Cross-platform spread: ${platforms.length} platforms affected`,
        impact: cascadeRisk > 75 ? 'Multi-platform crisis cascade detected' : 'Cross-platform attention building',
        time_to_impact: cascadeRisk > 75 ? '1-4 hours' : '6-12 hours',
        mitigation_urgency: cascadeRisk > 75 ? 'immediate' : 'high',
        affected_stakeholders: ['social_media_users', 'influencers', 'media']
      };
    }

    function analyzeKeywordToxicity(metrics) {
      // Simulate keyword toxicity analysis based on sentiment patterns
      const toxicityScore = metrics.negativePercentage > 40 ? Math.min(100, metrics.negativePercentage * 1.5) : 0;

      return {
        detected: toxicityScore > 50,
        severity: toxicityScore > 80 ? 'critical' : toxicityScore > 65 ? 'high' : 'medium',
        confidence: 0.73,
        risk_score: toxicityScore,
        description: `Toxic keyword prevalence: ${Math.round(toxicityScore)}%`,
        impact: toxicityScore > 80 ? 'Highly toxic narrative spreading' : 'Negative keyword trends detected',
        time_to_impact: toxicityScore > 80 ? '30 minutes - 2 hours' : '4-8 hours',
        mitigation_urgency: toxicityScore > 80 ? 'immediate' : 'high',
        affected_stakeholders: ['brand_reputation', 'customers', 'search_results']
      };
    }

    function calculateCrisisProbability(signals) {
      const signalWeights = {
        sentiment_velocity: 0.25,
        volume_anomaly: 0.20,
        emotional_distress: 0.20,
        geographic_spread: 0.15,
        platform_cascade: 0.10,
        keyword_toxicity: 0.10
      };

      return Object.entries(signals).reduce((prob, [type, signal]) => {
        return prob + (signal.risk_score / 100) * signalWeights[type];
      }, 0);
    }

    function estimateTimeToImpact(signals) {
      const urgentSignals = Object.values(signals).filter(s => s.mitigation_urgency === 'immediate');
      if (urgentSignals.length > 0) return '< 2 hours';

      const highSignals = Object.values(signals).filter(s => s.mitigation_urgency === 'high');
      if (highSignals.length > 1) return '2-6 hours';

      return '6-24 hours';
    }

    function assessCrisisSeverity(signals, metrics) {
      const criticalSignals = Object.values(signals).filter(s => s.severity === 'critical').length;
      const highSignals = Object.values(signals).filter(s => s.severity === 'high').length;

      if (criticalSignals > 1 || (criticalSignals === 1 && highSignals > 1)) return 'critical';
      if (criticalSignals === 1 || highSignals > 2) return 'high';
      if (highSignals > 0) return 'medium';
      return 'low';
    }

    function generateCrisisRecommendations(signals, severity) {
      const recommendations = [];

      if (severity === 'critical') {
        recommendations.push('IMMEDIATE: Activate crisis response team and communication protocols');
        recommendations.push('URGENT: Prepare public statement addressing key concerns');
        recommendations.push('CRITICAL: Monitor all channels for escalation patterns');
      }

      if (signals.sentiment_velocity.detected) {
        recommendations.push('Deploy sentiment stabilization messaging across key platforms');
      }

      if (signals.volume_anomaly.detected) {
        recommendations.push('Increase monitoring frequency and response team capacity');
      }

      if (signals.emotional_distress.detected) {
        recommendations.push('Focus on empathetic communication and direct customer engagement');
      }

      return recommendations;
    }

    function assessStakeholderImpact(signals) {
      const stakeholders = {};
      Object.values(signals).forEach(signal => {
        signal.affected_stakeholders?.forEach(stakeholder => {
          stakeholders[stakeholder] = (stakeholders[stakeholder] || 0) + signal.risk_score;
        });
      });

      return Object.entries(stakeholders)
        .map(([name, impact]) => ({ name, impact_score: Math.round(impact / Object.keys(signals).length) }))
        .sort((a, b) => b.impact_score - a.impact_score);
    }

    function estimateRecoveryTimeline(severity, probability) {
      if (severity === 'critical') return '2-4 weeks';
      if (severity === 'high') return '1-2 weeks';
      if (probability > 0.6) return '3-7 days';
      return '1-3 days';
    }
  }, []);

  // Legacy function for backward compatibility
  const detectAnomalies = useCallback((brandData) => {
    const result = performAdvancedCrisisPrediction(brandData, null, null);
    return result.anomalies;
  }, [performAdvancedCrisisPrediction]);

  const generateEnhancedInsights = useCallback((brandData) => {
    if (!brandData || !brandData.totalMentions) return [];

    const insights = [];
    const sentimentAnalysis = performSentimentAnalysis(brandData);
    const emotionAnalysis = performEmotionAnalysis(brandData);
    const geographicAnalysis = performGeographicAnalysis(brandData, filters);
    const crisisAnalysis = performAdvancedCrisisPrediction(brandData, emotionAnalysis, geographicAnalysis);
    const anomalies = crisisAnalysis.anomalies;
    const platforms = Object.keys(brandData.platformStats || {});

    // 1. Customer Sentiment Analysis (Business-Friendly)
    const getBusinessSentimentTitle = (score) => {
      if (score >= 80) return "Customers Love Your Brand";
      if (score >= 65) return "Positive Customer Feedback";
      if (score >= 50) return "Mixed Customer Reactions";
      if (score >= 30) return "Customer Concerns Detected";
      return "Urgent: Customer Satisfaction Crisis";
    };

    const getBusinessSentimentSummary = (score, mentions, trend) => {
      const trendText = trend === 'positive' ? 'improving' : 'declining';
      if (score >= 80) return `Excellent news! ${mentions} customers are talking about your brand, and ${Math.round(score)}% of the conversation is positive. Customer satisfaction is ${trendText}.`;
      if (score >= 65) return `Good news! Out of ${mentions} customer conversations, ${Math.round(score)}% are positive. Your brand reputation is ${trendText}.`;
      if (score >= 50) return `${mentions} customers are discussing your brand with mixed feelings. ${Math.round(score)}% positive sentiment suggests room for improvement.`;
      if (score >= 30) return `Warning: ${mentions} customer conversations show only ${Math.round(score)}% positive sentiment. Customer satisfaction is ${trendText} and needs attention.`;
      return `Critical Alert: Only ${Math.round(score)}% of ${mentions} customer conversations are positive. Immediate action needed to address customer concerns.`;
    };

    insights.push({
      id: 'sentiment_intelligence',
      type: 'sentiment_analysis',
      title: getBusinessSentimentTitle(sentimentAnalysis.score),
      confidence: sentimentAnalysis.confidence,
      impact: sentimentAnalysis.score < 30 ? 'critical' : sentimentAnalysis.score < 50 ? 'high' : sentimentAnalysis.score > 70 ? 'positive' : 'medium',
      category: 'customer_sentiment',
      generated_at: new Date().toISOString(),
      summary: getBusinessSentimentSummary(sentimentAnalysis.score, brandData.totalMentions, sentimentAnalysis.trend),
      detailed_analysis: {
        key_findings: [
          `Customer Satisfaction Score: ${Math.round(sentimentAnalysis.score)}/100 ${sentimentAnalysis.score >= 70 ? '(Excellent)' : sentimentAnalysis.score >= 50 ? '(Good)' : sentimentAnalysis.score >= 30 ? '(Needs Improvement)' : '(Critical)'}`,
          `Brand Reputation Stability: ${Math.round(sentimentAnalysis.stability)}% ${sentimentAnalysis.stability >= 70 ? '(Very Stable)' : sentimentAnalysis.stability >= 50 ? '(Stable)' : '(Unstable)'}`,
          `Customer Conversation Volume: ${brandData.totalMentions} mentions analyzed`,
          `Trend Direction: Customer sentiment is ${sentimentAnalysis.trend === 'positive' ? 'improving 📈' : 'declining 📉'}`
        ],
        supporting_data: {
          customer_feedback_breakdown: {
            happy_customers: `${Math.round(sentimentAnalysis.positive)}% of customers express positive feelings`,
            neutral_customers: `${Math.round(sentimentAnalysis.neutral)}% of customers are neutral`,
            unhappy_customers: `${Math.round(sentimentAnalysis.negative)}% of customers express concerns`
          },
          business_metrics: {
            satisfaction_score: `${Math.round(sentimentAnalysis.score)}/100`,
            reputation_stability: `${Math.round(sentimentAnalysis.stability)}%`,
            customer_conversations: brandData.totalMentions,
            trend: sentimentAnalysis.trend === 'positive' ? 'Improving' : 'Declining'
          }
        },
        recommendations: [
          sentimentAnalysis.score < 30 ? '🚨 URGENT: Launch immediate customer service recovery program and address top complaints' :
            sentimentAnalysis.score < 50 ? '📈 Focus on customer experience improvements and address negative feedback themes' :
              sentimentAnalysis.score < 70 ? '✨ Amplify positive customer stories and maintain current service quality' :
                '🎯 Leverage excellent customer satisfaction for marketing campaigns and referral programs'
        ]
      },
      ai_explanation: `We analyzed ${brandData.totalMentions} customer conversations to understand how people feel about your brand. This helps you make better business decisions about customer service, marketing, and product improvements.`,
      data_sources: platforms,
      related_metrics: ['customer_satisfaction', 'brand_reputation', 'conversation_volume']
    });

    // 2. Customer Emotions Analysis (Business-Friendly)
    if (emotionAnalysis) {
      const getEmotionBusinessTitle = (dominantEmotion, health) => {
        if (!dominantEmotion) return "Customers Have Balanced Feelings";
        switch (dominantEmotion.name) {
          case 'joy': return "Customers Are Delighted With Your Brand";
          case 'trust': return "Customers Trust Your Brand";
          case 'surprise': return "Your Brand Is Creating Buzz";
          case 'anger': return "Customers Are Frustrated - Action Needed";
          case 'fear': return "Customers Have Concerns About Your Brand";
          case 'disgust': return "Serious Customer Satisfaction Issues";
          default: return "Understanding Customer Emotions";
        }
      };

      const getEmotionBusinessSummary = (dominantEmotion, health) => {
        if (!dominantEmotion) {
          return `Great news! Your customers have balanced emotions about your brand (${health}/100 emotional health score). This suggests stable customer relationships without major concerns.`;
        }

        const emotionExplanations = {
          joy: `Excellent! Customers are genuinely happy with your brand. This ${dominantEmotion.intensity}% joy level indicates strong customer satisfaction and loyalty.`,
          trust: `Outstanding! Customers trust your brand deeply. This ${dominantEmotion.intensity}% trust level is excellent for long-term business growth and customer retention.`,
          surprise: `Interesting! Your brand is creating surprise and excitement. This ${dominantEmotion.intensity}% surprise level suggests you're doing something noteworthy that's getting attention.`,
          anger: `Alert! Customers are expressing frustration. This ${dominantEmotion.intensity}% anger level requires immediate attention to prevent customer loss.`,
          fear: `Warning! Customers have concerns or uncertainties about your brand. This ${dominantEmotion.intensity}% fear level suggests trust-building is needed.`,
          disgust: `Critical! Customers are expressing strong negative feelings. This ${dominantEmotion.intensity}% disgust level requires urgent brand reputation management.`
        };

        return emotionExplanations[dominantEmotion.name] || `Customers are primarily feeling ${dominantEmotion.name} about your brand.`;
      };

      insights.push({
        id: 'emotion_intelligence',
        type: 'emotion_analysis',
        title: getEmotionBusinessTitle(emotionAnalysis.dominant_emotion, emotionAnalysis.overall_emotional_health),
        confidence: emotionAnalysis.dominant_emotion ? emotionAnalysis.dominant_emotion.confidence : 0.70,
        impact: emotionAnalysis.overall_emotional_health < 30 ? 'critical' :
          emotionAnalysis.overall_emotional_health < 50 ? 'high' :
            emotionAnalysis.overall_emotional_health > 70 ? 'positive' : 'medium',
        category: 'customer_emotions',
        generated_at: new Date().toISOString(),
        summary: getEmotionBusinessSummary(emotionAnalysis.dominant_emotion, emotionAnalysis.overall_emotional_health),
        detailed_analysis: {
          key_findings: [
            emotionAnalysis.dominant_emotion ?
              `Primary Customer Emotion: ${emotionAnalysis.dominant_emotion.name.toUpperCase()} (${emotionAnalysis.dominant_emotion.intensity}% of conversations)` :
              'Balanced Customer Emotions - No single emotion dominates',
            `Customer Emotional Stability: ${Math.round(emotionAnalysis.emotional_stability)}% ${emotionAnalysis.emotional_stability >= 70 ? '(Very Stable)' : emotionAnalysis.emotional_stability >= 50 ? '(Stable)' : '(Needs Attention)'}`,
            `Emotional Complexity: ${emotionAnalysis.emotional_complexity} different emotions detected in customer conversations`,
            `Overall Customer Emotional Health: ${emotionAnalysis.overall_emotional_health}/100 ${emotionAnalysis.overall_emotional_health >= 70 ? '(Excellent)' : emotionAnalysis.overall_emotional_health >= 50 ? '(Good)' : '(Needs Improvement)'}`
          ],
          supporting_data: {
            customer_emotion_breakdown: Object.entries(emotionAnalysis.emotions)
              .filter(([_, emotion]) => emotion.intensity > 10)
              .reduce((acc, [name, emotion]) => {
                const emotionLabels = {
                  joy: `😄 Happy Customers: ${Math.round(emotion.intensity)}%`,
                  trust: `🤝 Trusting Customers: ${Math.round(emotion.intensity)}%`,
                  surprise: `😲 Surprised Customers: ${Math.round(emotion.intensity)}%`,
                  anger: `😠 Frustrated Customers: ${Math.round(emotion.intensity)}%`,
                  fear: `😰 Concerned Customers: ${Math.round(emotion.intensity)}%`,
                  disgust: `🤢 Dissatisfied Customers: ${Math.round(emotion.intensity)}%`
                };
                acc[name] = emotionLabels[name] || `${Math.round(emotion.intensity)}% intensity`;
                return acc;
              }, {}),
            what_triggers_emotions: emotionAnalysis.dominant_emotion ?
              emotionAnalysis.emotions[emotionAnalysis.dominant_emotion.name].triggers : [],
            business_health_metrics: {
              customer_emotional_stability: `${Math.round(emotionAnalysis.emotional_stability)}%`,
              emotional_diversity: `${emotionAnalysis.emotional_complexity} different emotions`,
              overall_customer_happiness: `${emotionAnalysis.overall_emotional_health}/100`
            }
          },
          recommendations: [
            emotionAnalysis.dominant_emotion?.name === 'anger' ? '🚨 URGENT: Launch customer service recovery program and address top complaints immediately' :
              emotionAnalysis.dominant_emotion?.name === 'fear' ? '🛡️ Build customer confidence with transparent communication, testimonials, and guarantees' :
                emotionAnalysis.dominant_emotion?.name === 'joy' ? '🚀 Capitalize on customer happiness with referral programs and positive testimonials in marketing' :
                  emotionAnalysis.dominant_emotion?.name === 'trust' ? '💎 Leverage customer trust for premium offerings, partnerships, and brand expansion opportunities' :
                    emotionAnalysis.dominant_emotion?.name === 'disgust' ? '🔧 CRITICAL: Conduct immediate brand audit and implement comprehensive reputation recovery plan' :
                      emotionAnalysis.dominant_emotion?.name === 'surprise' ? '📢 Channel customer excitement into viral marketing campaigns and social media engagement' :
                        '✅ Maintain excellent customer emotional balance with consistent quality and communication'
          ]
        },
        ai_explanation: `We analyzed customer conversations to understand the emotions your brand evokes. This helps you improve customer experience, adjust marketing messages, and build stronger customer relationships.`,
        data_sources: platforms,
        related_metrics: ['emotion_intensity', 'emotional_stability', 'emotional_health']
      });
    }

    // 3. Market Expansion Opportunities (Business-Friendly)
    if (geographicAnalysis) {
      const getMarketTitle = (opportunities, risks) => {
        if (opportunities.length >= 3) return "Excellent Global Expansion Opportunities";
        if (opportunities.length >= 1) return "New Market Opportunities Available";
        if (risks.length > 0) return "Market Performance Needs Attention";
        return "Global Market Performance Review";
      };

      const getMarketSummary = (bestRegion, opportunities, risks) => {
        let summary = `Your brand performs best in ${bestRegion.name} with ${bestRegion.sentiment_score}% customer satisfaction. `;

        if (opportunities.length > 0) {
          summary += `Great news! We found ${opportunities.length} promising market${opportunities.length > 1 ? 's' : ''} for expansion: ${opportunities.slice(0, 2).map(o => o.name).join(' and ')}.`;
        }

        if (risks.length > 0) {
          summary += ` However, ${risks.length} market${risks.length > 1 ? 's need' : ' needs'} attention to improve customer satisfaction.`;
        }

        return summary;
      };

      insights.push({
        id: 'geographic_intelligence',
        type: 'geographic_analysis',
        title: getMarketTitle(geographicAnalysis.expansion_opportunities, geographicAnalysis.risk_regions),
        confidence: 0.88,
        impact: geographicAnalysis.risk_regions.length > 0 ? 'high' :
          geographicAnalysis.expansion_opportunities.length > 2 ? 'positive' : 'medium',
        category: 'market_expansion',
        generated_at: new Date().toISOString(),
        summary: getMarketSummary(geographicAnalysis.best_performing_region, geographicAnalysis.expansion_opportunities, geographicAnalysis.risk_regions),
        detailed_analysis: {
          key_findings: [
            `🏆 Top Performing Market: ${geographicAnalysis.best_performing_region.name} (${geographicAnalysis.best_performing_region.sentiment_score}% customer satisfaction)`,
            `🌍 Global Market Presence: Active in ${geographicAnalysis.geographic_diversity.active_regions} out of ${geographicAnalysis.regional_performance.length} major regions`,
            `🎯 Cultural Fit Score: ${geographicAnalysis.cultural_alignment.overall_cultural_adaptability}/100 (how well your brand resonates globally)`,
            `📈 Growth Opportunities: ${geographicAnalysis.expansion_opportunities.length} high-potential markets identified for expansion`
          ],
          supporting_data: {
            regional_breakdown: geographicAnalysis.regional_performance.reduce((acc, region) => {
              acc[region.name] = {
                sentiment: `${region.sentiment_score}%`,
                volume: `${region.mention_volume} mentions`,
                market_share: `${region.market_share}%`,
                maturity: region.market_maturity
              };
              return acc;
            }, {}),
            performance_metrics: {
              best_region: geographicAnalysis.best_performing_region.name,
              worst_region: geographicAnalysis.worst_performing_region.name,
              diversity_score: geographicAnalysis.geographic_diversity.diversity_score,
              cultural_alignment: geographicAnalysis.cultural_alignment.overall_cultural_adaptability
            },
            opportunities: geographicAnalysis.expansion_opportunities.map(opp => ({
              region: opp.name,
              opportunity_score: opp.opportunity_score,
              market_maturity: opp.market_maturity
            })),
            risk_assessment: geographicAnalysis.risk_regions.map(risk => ({
              region: risk.name,
              sentiment_score: risk.sentiment_score,
              crisis_sensitivity: risk.crisis_sensitivity
            }))
          },
          recommendations: [
            geographicAnalysis.expansion_opportunities.length > 0 ?
              `Prioritize expansion in ${geographicAnalysis.expansion_opportunities[0].name} (${geographicAnalysis.expansion_opportunities[0].opportunity_score}% opportunity score)` :
              'Focus on strengthening performance in current markets',
            geographicAnalysis.risk_regions.length > 0 ?
              `Address reputation issues in ${geographicAnalysis.risk_regions[0].name} with targeted regional strategy` :
              'Maintain strong regional performance across all markets',
            `Leverage cultural strengths in ${geographicAnalysis.best_performing_region.name} for global brand messaging`,
            geographicAnalysis.cultural_alignment.improvement_areas.length > 0 ?
              `Adapt messaging for cultural fit in ${geographicAnalysis.cultural_alignment.improvement_areas.map(area => area.region).join(', ')}` :
              'Strong cultural alignment across all regions'
          ]
        },
        ai_explanation: `Geographic intelligence analysis using regional sentiment patterns, cultural factors, market maturity, and expansion potential scoring.`,
        data_sources: platforms,
        related_metrics: ['regional_sentiment', 'geographic_diversity', 'cultural_alignment', 'expansion_potential']
      });
    }

    // 4. Business Risk & Reputation Protection (Business-Friendly)
    if (crisisAnalysis.crisis_assessment) {
      const assessment = crisisAnalysis.crisis_assessment;

      const getRiskTitle = (probability, level) => {
        if (level === 'critical') return "URGENT: Brand Reputation Crisis Detected";
        if (level === 'high') return "High Risk: Brand Reputation Needs Protection";
        if (probability > 60) return "Moderate Risk: Monitor Brand Reputation";
        if (probability > 30) return "Low Risk: Keep Watching Brand Health";
        return "Good News: Brand Reputation is Stable";
      };

      const getRiskSummary = (probability, level, timeToImpact, factorsCount) => {
        if (level === 'critical') {
          return `${probability}% crisis risk within ${timeToImpact}. ${factorsCount} critical issues need immediate attention.`;
        }
        if (level === 'high') {
          return `${probability}% reputation risk within ${timeToImpact}. ${factorsCount} issues need attention.`;
        }
        if (probability > 60) {
          return `${probability}% risk probability. ${factorsCount} issues to monitor within ${timeToImpact}.`;
        }
        if (probability > 30) {
          return `${probability}% risk probability. ${factorsCount} minor issues to track over ${timeToImpact}.`;
        }
        return `${probability}% risk probability. Brand reputation is stable.`;
      };

      insights.push({
        id: 'crisis_prediction',
        type: 'crisis_analysis',
        title: getRiskTitle(assessment.crisis_probability, assessment.overall_risk_level),
        confidence: 0.89,
        impact: assessment.overall_risk_level === 'critical' ? 'critical' :
          assessment.overall_risk_level === 'high' ? 'high' :
            assessment.crisis_probability > 60 ? 'medium' : 'low',
        category: 'reputation_protection',
        generated_at: new Date().toISOString(),
        summary: getRiskSummary(assessment.crisis_probability, assessment.overall_risk_level, assessment.estimated_time_to_impact, assessment.primary_risk_factors.length),
        detailed_analysis: {
          key_findings: [
            `🎯 Business Risk Level: ${assessment.crisis_probability}% chance of reputation impact ${assessment.crisis_probability > 70 ? '(HIGH RISK)' : assessment.crisis_probability > 40 ? '(MODERATE RISK)' : '(LOW RISK)'}`,
            `⏰ Time to Act: ${assessment.estimated_time_to_impact} ${assessment.overall_risk_level === 'critical' ? '(URGENT)' : assessment.overall_risk_level === 'high' ? '(SOON)' : '(MONITOR)'}`,
            `🔍 Issues to Address: ${assessment.primary_risk_factors.length} reputation risk${assessment.primary_risk_factors.length > 1 ? 's' : ''} identified`,
            `🏥 Recovery Time: ${assessment.recovery_timeline} expected time to restore reputation if issues escalate`,
            `📊 Overall Assessment: ${assessment.overall_risk_level.toUpperCase()} priority level for your business`
          ],
          supporting_data: {
            risk_assessment: {
              crisis_probability: `${assessment.crisis_probability}%`,
              risk_level: assessment.overall_risk_level,
              time_to_impact: assessment.estimated_time_to_impact,
              recovery_timeline: assessment.recovery_timeline
            },
            risk_factors: assessment.primary_risk_factors.reduce((acc, factor) => {
              acc[factor.type] = {
                risk_score: `${factor.risk_score}%`,
                description: factor.description
              };
              return acc;
            }, {}),
            stakeholder_impact: assessment.stakeholder_impact.reduce((acc, stakeholder) => {
              acc[stakeholder.name] = `${stakeholder.impact_score}% impact`;
              return acc;
            }, {}),
            crisis_signals: {
              total_signals: Object.keys(crisisAnalysis.anomalies).length,
              critical_signals: crisisAnalysis.anomalies.filter(a => a.severity === 'critical').length,
              high_signals: crisisAnalysis.anomalies.filter(a => a.severity === 'high').length
            }
          },
          recommendations: assessment.recommended_actions
        },
        ai_explanation: `Advanced multi-signal crisis prediction using sentiment velocity, volume anomalies, emotional distress, geographic spread, platform cascade, and keyword toxicity analysis.`,
        data_sources: platforms,
        related_metrics: ['crisis_probability', 'risk_level', 'time_to_impact', 'stakeholder_impact']
      });
    }

    // 5. Anomaly Detection
    if (anomalies.length > 0) {
      insights.push({
        id: 'anomaly_intelligence',
        type: 'anomaly_detection',
        title: `${anomalies.length} Critical Anomal${anomalies.length === 1 ? 'y' : 'ies'} Detected`,
        confidence: Math.max(...anomalies.map(a => a.confidence)),
        impact: anomalies.some(a => a.severity === 'critical') ? 'critical' : 'high',
        category: 'anomaly_detection',
        generated_at: new Date().toISOString(),
        summary: `AI detected ${anomalies.length} significant anomal${anomalies.length === 1 ? 'y' : 'ies'} requiring immediate attention.`,
        detailed_analysis: {
          key_findings: anomalies.map(anomaly => anomaly.description),
          supporting_data: {
            anomaly_count: anomalies.length,
            severity_breakdown: anomalies.reduce((acc, anomaly) => {
              acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
              return acc;
            }, {})
          },
          recommendations: anomalies.map(anomaly =>
            anomaly.severity === 'critical' ? `URGENT: ${anomaly.impact}` : anomaly.impact
          )
        },
        ai_explanation: `Anomaly detection using statistical analysis and pattern recognition to identify unusual patterns.`,
        data_sources: platforms,
        related_metrics: ['anomaly_score', 'deviation_magnitude']
      });
    }

    // 3. Competitive Intelligence
    if (analyzedBrands.length > 1) {
      const competitorData = analyzedBrands.filter(b => b.brandName !== brandData.brandName);
      const avgCompetitorSentiment = competitorData.reduce((sum, brand) =>
        sum + (brand.positivePercentage - brand.negativePercentage), 0) / competitorData.length;
      const brandSentiment = brandData.positivePercentage - brandData.negativePercentage;

      insights.push({
        id: 'competitive_intelligence',
        type: 'competitive_analysis',
        title: `Competitive Position Analysis`,
        confidence: 0.84,
        impact: brandSentiment > avgCompetitorSentiment ? 'positive' : 'medium',
        category: 'competitive_intelligence',
        generated_at: new Date().toISOString(),
        summary: `${brandData.brandName} ${brandSentiment > avgCompetitorSentiment ? 'outperforms' : 'underperforms'} competitor average by ${Math.abs(Math.round(brandSentiment - avgCompetitorSentiment))} sentiment points.`,
        detailed_analysis: {
          key_findings: [
            `Your brand sentiment: ${Math.round(brandSentiment)} vs competitor average: ${Math.round(avgCompetitorSentiment)}`,
            `Competitive advantage: ${brandSentiment > avgCompetitorSentiment ? 'Positive' : 'Negative'} ${Math.abs(Math.round(brandSentiment - avgCompetitorSentiment))} points`,
            `Market position: ${brandSentiment > avgCompetitorSentiment ? 'Leading' : 'Following'} in sentiment metrics`
          ],
          supporting_data: {
            brand_sentiment: Math.round(brandSentiment),
            competitor_average: Math.round(avgCompetitorSentiment),
            competitive_gap: Math.round(brandSentiment - avgCompetitorSentiment)
          },
          recommendations: [
            brandSentiment > avgCompetitorSentiment ? 'Leverage competitive advantage in marketing' : 'Analyze competitor strategies for improvement'
          ]
        },
        ai_explanation: `Competitive analysis comparing sentiment metrics across analyzed brands.`,
        data_sources: platforms,
        related_metrics: ['competitive_sentiment', 'market_share']
      });
    }

    return insights;
  }, [performSentimentAnalysis, performEmotionAnalysis, performGeographicAnalysis, performAdvancedCrisisPrediction, detectAnomalies, analyzedBrands, filters]);

  const generatePredictions = useCallback((brandData) => {
    if (!brandData || !brandData.totalMentions) return [];

    const predictions = [];
    const sentiment = performSentimentAnalysis(brandData);

    // Sentiment forecast
    const sentimentTrend = sentiment.trend === 'positive' ? 1 : -1;
    const predictedSentiment = Math.max(0, Math.min(100,
      sentiment.score + (sentimentTrend * sentiment.volatility * 0.1)
    ));

    predictions.push({
      id: 'sentiment_forecast',
      type: 'sentiment_forecast',
      title: 'AI-Powered Sentiment Trajectory',
      confidence: sentiment.confidence,
      timeframe: '7 days',
      prediction: {
        current_sentiment: sentiment.score / 100,
        predicted_sentiment: predictedSentiment / 100,
        change_direction: predictedSentiment > sentiment.score ? 'improving' : 'declining',
        change_magnitude: `${Math.abs(Math.round(predictedSentiment - sentiment.score))}%`,
        key_drivers: [
          `Current sentiment stability: ${Math.round(sentiment.stability)}%`,
          `Mention volume: ${brandData.totalMentions}`,
          `Platform diversity: ${Object.keys(brandData.platformStats || {}).length} channels`
        ]
      },
      daily_forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sentiment: Math.max(0.1, Math.min(0.9,
          sentiment.score / 100 + (i * (predictedSentiment - sentiment.score) / 700)
        )),
        confidence: Math.max(0.6, sentiment.confidence - (i * 0.05))
      }))
    });

    // Crisis probability
    const crisisFactors = [
      brandData.rageIndex > 50 ? 0.3 : 0,
      sentiment.negative > 40 ? 0.25 : 0,
      sentiment.volatility > 30 ? 0.2 : 0
    ];

    const crisisProbability = Math.min(0.95, crisisFactors.reduce((sum, factor) => sum + factor, 0.05));

    if (crisisProbability > 0.2) {
      predictions.push({
        id: 'crisis_risk',
        type: 'crisis_probability',
        title: 'Crisis Risk Assessment',
        confidence: 0.82,
        timeframe: '72 hours',
        prediction: {
          crisis_probability: `${Math.round(crisisProbability * 100)}%`,
          severity_if_occurs: crisisProbability > 0.6 ? 'critical' : crisisProbability > 0.4 ? 'high' : 'medium',
          time_to_potential_crisis: '72 hours',
          trigger_events: [
            brandData.rageIndex > 50 ? 'High rage index' : null,
            sentiment.negative > 40 ? 'Elevated negative sentiment' : null
          ].filter(Boolean)
        },
        mitigation_strategies: [
          crisisProbability > 0.6 ? 'Activate crisis response team immediately' : 'Prepare crisis response protocols',
          'Monitor social channels for escalation patterns'
        ]
      });
    }

    return predictions;
  }, [performSentimentAnalysis]);

  const generateRecommendations = useCallback((brandData) => {
    if (!brandData) return [];

    const recommendations = [];
    const sentiment = performSentimentAnalysis(brandData);

    // Crisis management
    if (brandData.rageIndex > AI_CONFIG.SENTIMENT_THRESHOLDS.HIGH_NEGATIVE) {
      recommendations.push({
        priority: 'critical',
        category: 'crisis_management',
        title: 'Immediate Crisis Response Required',
        actions: [
          'Activate crisis communication team within 1 hour',
          'Prepare public statement addressing key concerns',
          'Monitor social channels for escalation patterns'
        ],
        timeline: '< 1 hour',
        impact: 'Prevent further brand damage',
        confidence: 0.94
      });
    }

    // Sentiment improvement
    if (sentiment.negative > 30) {
      recommendations.push({
        priority: 'high',
        category: 'sentiment_improvement',
        title: 'Negative Sentiment Mitigation Strategy',
        actions: [
          'Identify and address root causes of negative feedback',
          'Increase positive content publishing frequency',
          'Engage directly with dissatisfied customers'
        ],
        timeline: '< 24 hours',
        impact: 'Improve brand perception',
        confidence: 0.87
      });
    }

    // Opportunity maximization
    if (sentiment.positive > AI_CONFIG.SENTIMENT_THRESHOLDS.GOOD_POSITIVE) {
      recommendations.push({
        priority: 'medium',
        category: 'opportunity_maximization',
        title: 'Leverage Positive Momentum',
        actions: [
          'Amplify positive testimonials and reviews',
          'Launch new product/feature announcements',
          'Increase marketing spend while sentiment is high'
        ],
        timeline: '< 7 days',
        impact: 'Maximize positive brand momentum',
        confidence: 0.81
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [performSentimentAnalysis]);

  // Data fetching
  const fetchAIData = useCallback(async () => {
    if (!currentUser) return;

    // Show different loading states for initial load vs filter updates
    if (insights.length > 0) {
      setIsUpdatingData(true);
    } else {
      setLoading(true);
    }
    try {
      const selectedBrandData = currentBrand || analyzedBrands.find(b => b.brandName === brandName) || analyzedBrands[0];

      if (selectedBrandData && selectedBrandData.totalMentions > 0) {
        console.log('🤖 Enhanced AI Engine: Analyzing brand data for:', selectedBrandData.brandName);

        const kpis = calculateKPIs(selectedBrandData, filters);
        // Preserve original sentiment data and merge with calculated KPIs
        const enhancedBrandData = {
          ...selectedBrandData,
          ...kpis,
          // Ensure we preserve original sentiment percentages if they exist
          positivePercentage: selectedBrandData.positivePercentage || kpis.positivePercentage || 65,
          negativePercentage: selectedBrandData.negativePercentage || kpis.negativePercentage || 25,
          neutralPercentage: selectedBrandData.neutralPercentage || kpis.neutralPercentage || 10
        };

        console.log('🔍 AI Engine: Enhanced brand data:', {
          brandName: enhancedBrandData.brandName,
          totalMentions: enhancedBrandData.totalMentions,
          positivePercentage: enhancedBrandData.positivePercentage,
          negativePercentage: enhancedBrandData.negativePercentage,
          neutralPercentage: enhancedBrandData.neutralPercentage
        });

        const aiInsights = generateEnhancedInsights(enhancedBrandData);
        const aiPredictions = generatePredictions(enhancedBrandData);
        const aiRecommendations = generateRecommendations(enhancedBrandData);

        // Generate alerts using shared utility (same as AlertsDashboard)
        const alerts = generateAlertsFromBrandData(enhancedBrandData).map(alert => ({
          id: alert.id,
          type: alert.severity,
          title: alert.title,
          message: alert.description,
          timestamp: alert.timestamp,
          urgency: alert.urgency
        }));

        setInsights(aiInsights);
        setPredictions(aiPredictions);
        setRecommendations(aiRecommendations);
        setRealTimeAlerts(alerts);

        console.log('🎯 Enhanced AI Analysis Complete:', {
          insights: aiInsights.length,
          predictions: aiPredictions.length,
          recommendations: aiRecommendations.length,
          alerts: alerts.length
        });
      } else {
        setInsights([]);
        setPredictions([]);
        setRecommendations([]);
        setRealTimeAlerts([]);
      }
    } catch (error) {
      console.error('Error in enhanced AI analysis:', error);
      setInsights([]);
      setPredictions([]);
      setRecommendations([]);
      setRealTimeAlerts([]);
    } finally {
      setLoading(false);
      setIsUpdatingData(false);
    }
  }, [currentUser, currentBrand, brandName, analyzedBrands, filters, generateEnhancedInsights, generatePredictions, generateRecommendations]);

  useEffect(() => {
    fetchAIData();
  }, [fetchAIData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Enhanced AI Engine: Auto-refreshing insights...');
      fetchAIData();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAIData]);

  // Utility functions
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getImpactColor = (impact) => {
    const colors = {
      critical: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      low: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      positive: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    };
    return colors[impact] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      sentiment_analysis: <BarChart3 className="w-6 h-6" />,
      emotion_analysis: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      ),
      geographic_analysis: <Globe className="w-6 h-6" />,
      crisis_analysis: <AlertTriangle className="w-6 h-6" />,
      anomaly_detection: <Activity className="w-6 h-6" />,
      competitive_analysis: <Target className="w-6 h-6" />,
      sentiment_forecast: <TrendingUp className="w-6 h-6" />,
      crisis_probability: <Shield className="w-6 h-6" />
    };
    return icons[type] || <Brain className="w-6 h-6" />;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="text-lg font-medium text-slate-900 dark:text-white ml-3">Enhanced AI is analyzing your data...</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">Generating intelligent insights and predictions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && (!insights || insights.length === 0)) {
    return (
      <div className="p-6 w-full">
        <EmptyState title="" message="" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <PageHeader
        title="Enhanced AI Insights"
        subtitle="Advanced artificial intelligence for comprehensive brand analysis"
        icon={<Brain className="w-7 h-7" />}
        iconBg="from-purple-500 to-blue-500"
      />

      <div className="max-w-full mx-auto space-y-6">
        {/* Filter Bar */}
        <div className="relative">
          <FilterBar
            showPlatformFilter={false}
            showSentimentFilter={false}
            showEmotionFilter={false}
            showKeywordFilter={false}
            showGeographyFilter={true}
            showSortOptions={false}
            showTimeRangeFilter={true}
          />
          {isUpdatingData && (
            <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              <span>Updating data...</span>
            </div>
          )}
        </div>

        {/* AI Performance Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">AI Analysis Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ColorfulWidget
              title="AI Insights"
              value={insights.length.toString()}
              icon={<Brain className="w-5 h-5" />}
              color="blue"
              size="medium"
            />
            <ColorfulWidget
              title="Predictions"
              value={predictions.length.toString()}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
              size="medium"
            />
            <ColorfulWidget
              title="Recommendations"
              value={recommendations.length.toString()}
              icon={<Target className="w-5 h-5" />}
              color="green"
              size="medium"
            />
            <ColorfulWidget
              title="Active Alerts"
              value={realTimeAlerts.length.toString()}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="red"
              size="medium"
            />
          </div>
        </div>

        {/* Critical Alerts Card */}
        {realTimeAlerts.length > 0 && (
          <div
            className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white cursor-pointer hover:from-red-600 hover:to-orange-600 transition-all duration-200"
            onClick={() => navigate('/alerts')}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-semibold">Critical Alerts ({realTimeAlerts.length})</h3>
                <p className="text-red-100">{realTimeAlerts[0]?.message}</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                <span className="text-sm font-medium">View All</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-1 p-2">
            {[
              { id: 'insights', label: 'AI Insights', icon: Brain, count: insights.length },
              {
                id: 'emotions',
                label: 'Emotion AI',
                icon: () => (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                    <path d="M12 6c-1 0-2 1-2 2v2c0 1 1 2 2 2s2-1 2-2V8c0-1-1-2-2-2z" />
                  </svg>
                ),
                count: insights.filter(i => i.type === 'emotion_analysis').length
              },
              {
                id: 'geography',
                label: 'Geographic AI',
                icon: () => (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <path d="M2 12h20" />
                    <path d="M8 12l8 0" />
                  </svg>
                ),
                count: insights.filter(i => i.type === 'geographic_analysis').length
              },
              {
                id: 'crisis',
                label: 'Crisis AI',
                icon: () => (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l8 0" stroke="red" />
                  </svg>
                ),
                count: insights.filter(i => i.type === 'crisis_analysis').length
              },
              { id: 'predictions', label: 'Predictions', icon: TrendingUp, count: predictions.length },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, count: recommendations.length },
              { id: 'performance', label: 'AI Performance', icon: Activity, count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI-Generated Insights</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {insights.length} intelligent insights discovered • Last updated {formatTimeAgo(new Date().toISOString())}
                  </p>
                </div>
                <button
                  onClick={fetchAIData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Insights
                </button>
              </div>

              <div className="grid gap-6">
                {insights.map((insight) => (
                  <div key={insight.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getImpactColor(insight.impact)}`}>
                        {getTypeIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                              {insight.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                              {insight.summary}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(insight.confidence || 0)}`}>
                              {Math.round((insight.confidence || 0) * 100)}% Confidence
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getImpactColor(insight.impact || 'medium')}`}>
                              {(insight.impact || 'medium').charAt(0).toUpperCase() + (insight.impact || 'medium').slice(1)} Impact
                            </span>
                          </div>
                        </div>

                        {/* Accordion Toggle Button */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Generated {formatTimeAgo(insight.generated_at)} • AI Confidence: {Math.round(insight.confidence * 100)}%
                          </div>
                          <button
                            onClick={() => {
                              console.log('View Full Analysis clicked for insight type:', insight.type);

                              if (insight.type === 'emotion_analysis') {
                                console.log('Switching to tab: emotions');
                                setActiveTab('emotions');
                              } else if (insight.type === 'geographic_analysis') {
                                console.log('Switching to tab: geography');
                                setActiveTab('geography');
                              } else if (insight.type === 'crisis_analysis') {
                                console.log('Switching to tab: crisis');
                                setActiveTab('crisis');
                              } else {
                                // For insights that don't have dedicated tabs (sentiment_analysis, anomaly_detection, etc.)
                                // Toggle the expandable details instead
                                console.log('Toggling expandable details for:', insight.type);
                                toggleInsightExpansion(insight.id);
                              }
                            }}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
                          >
                            <span>
                              {(insight.type === 'emotion_analysis' || insight.type === 'geographic_analysis' || insight.type === 'crisis_analysis')
                                ? 'View Full Analysis'
                                : (expandedInsights.has(insight.id) ? 'Hide Details' : 'View Details')
                              }
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${!(insight.type === 'emotion_analysis' || insight.type === 'geographic_analysis' || insight.type === 'crisis_analysis')
                                && expandedInsights.has(insight.id) ? 'rotate-90' : ''
                              }`} />
                          </button>
                        </div>

                        {/* Expandable Details */}
                        {expandedInsights.has(insight.id) && (
                          <div className="mt-4 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                            {/* Key Findings */}
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white mb-3">Key Business Findings:</h4>
                              <ul className="space-y-2">
                                {insight.detailed_analysis.key_findings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* AI Recommendations */}
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white mb-3">Recommended Actions:</h4>
                              <ul className="space-y-2">
                                {insight.detailed_analysis.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                    <Lightbulb className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* AI Explanation */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How We Analyzed This:</h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300">{insight.ai_explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'emotions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Emotion AI Intelligence</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Advanced emotion detection and analysis powered by AI
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Phase 1 Feature
                  </div>
                </div>
              </div>

              {insights.filter(insight => insight.type === 'emotion_analysis').length > 0 ? (
                <div className="grid gap-6">
                  {insights.filter(insight => insight.type === 'emotion_analysis').map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getImpactColor(insight.impact)}`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                {insight.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                {insight.summary}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(insight.confidence)}`}>
                                {Math.round(insight.confidence * 100)}% Confidence
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getImpactColor(insight.impact)}`}>
                                {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                              </span>
                            </div>
                          </div>

                          {/* Emotion Breakdown Visualization */}
                          {insight.detailed_analysis.supporting_data?.emotion_breakdown && (
                            <div className="mb-4">
                              <h4 className="font-medium text-slate-900 dark:text-white mb-3">Detected Emotions:</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {Object.entries(insight.detailed_analysis.supporting_data.emotion_breakdown).map(([emotion, intensity]) => {
                                  const emotionIcons = {
                                    joy: (
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                      </svg>
                                    ),
                                    anger: (
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                        <path d="M9 9l6 0" />
                                        <path d="M9 6l6 0" />
                                      </svg>
                                    ),
                                    fear: (
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="9" cy="9" r="1" />
                                        <circle cx="15" cy="9" r="1" />
                                        <path d="M8 13h8" />
                                      </svg>
                                    ),
                                    surprise: (
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="12" cy="16" r="1" />
                                        <circle cx="9" cy="9" r="1" />
                                        <circle cx="15" cy="9" r="1" />
                                      </svg>
                                    ),
                                    trust: (
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    ),
                                    disgust: (
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                        <path d="M9 9h6" />
                                      </svg>
                                    )
                                  };

                                  const emotionColors = {
                                    joy: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                                    anger: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                                    fear: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                                    surprise: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                                    trust: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                                    disgust: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                                  };

                                  return (
                                    <div key={emotion} className={`p-4 rounded-xl border-2 ${emotionColors[emotion] || 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} text-center`}>
                                      <div className="flex justify-center mb-2">
                                        {emotionIcons[emotion] || (
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                          </svg>
                                        )}
                                      </div>
                                      <div className="font-semibold text-sm capitalize mb-1">{emotion}</div>
                                      <div className="text-xs font-bold">{intensity}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Emotional Health Metrics */}
                          {insight.detailed_analysis.supporting_data?.stability_metrics && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                  {insight.detailed_analysis.supporting_data.stability_metrics.emotional_stability}%
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Emotional Stability</div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                  {insight.detailed_analysis.supporting_data.stability_metrics.emotional_complexity}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Active Emotions</div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                  {insight.detailed_analysis.supporting_data.stability_metrics.overall_health}/100
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Emotional Health</div>
                              </div>
                            </div>
                          )}

                          {/* Key Findings and Recommendations */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Key Findings:</h4>
                              <ul className="space-y-1">
                                {insight.detailed_analysis.key_findings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                    {finding}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white mb-2">AI Recommendations:</h4>
                              <ul className="space-y-1">
                                {insight.detailed_analysis.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg w-fit mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Emotion AI Analysis</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Advanced emotion detection is analyzing your brand data. Results will appear here once sufficient data is processed.
                  </p>
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    🚀 Phase 1 Feature - Enhanced Emotion Intelligence
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'geography' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Geographic Intelligence</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Regional market analysis and global expansion insights
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Phase 1 Feature
                  </div>
                </div>
              </div>

              {insights.filter(insight => insight.type === 'geographic_analysis').length > 0 ? (
                <div className="grid gap-6">
                  {insights.filter(insight => insight.type === 'geographic_analysis').map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getImpactColor(insight.impact)}`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                {insight.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                {insight.summary}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(insight.confidence)}`}>
                                {Math.round(insight.confidence * 100)}% Confidence
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getImpactColor(insight.impact)}`}>
                                {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                              </span>
                            </div>
                          </div>

                          {/* Accordion Toggle Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Generated {formatTimeAgo(insight.generated_at)} • AI Confidence: {Math.round(insight.confidence * 100)}%
                            </div>
                            <button
                              onClick={() => toggleInsightExpansion(insight.id)}
                              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
                            >
                              <span>{expandedInsights.has(insight.id) ? 'Hide Details' : 'View Details'}</span>
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedInsights.has(insight.id) ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* Expandable Details */}
                          {expandedInsights.has(insight.id) && (
                            <div className="mt-4 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                              {/* Regional Performance Grid */}
                              {insight.detailed_analysis.supporting_data?.regional_breakdown && (
                                <div className="mb-6">
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">Regional Performance:</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(insight.detailed_analysis.supporting_data.regional_breakdown).map(([region, data]) => {
                                      const regionFlags = {
                                        'North America': '🇺🇸',
                                        'Europe': '🇪🇺',
                                        'Asia Pacific': '🌏',
                                        'Latin America': '🌎',
                                        'Middle East & Africa': '🌍'
                                      };

                                      const sentimentValue = parseInt(data.sentiment);
                                      const sentimentColor = sentimentValue >= 70 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                        sentimentValue >= 50 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                          sentimentValue >= 30 ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                                            'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';

                                      return (
                                        <div key={region} className={`p-4 rounded-xl border-2 ${sentimentColor}`}>
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{regionFlags[region] || '🌐'}</span>
                                            <span className="font-semibold text-sm">{region}</span>
                                          </div>
                                          <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                              <span>Sentiment:</span>
                                              <span className="font-semibold">{data.sentiment}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Volume:</span>
                                              <span className="font-semibold">{data.volume}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Market Share:</span>
                                              <span className="font-semibold">{data.market_share}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Maturity:</span>
                                              <span className="font-semibold capitalize">{data.maturity}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Key Metrics Dashboard */}
                              {insight.detailed_analysis.supporting_data?.performance_metrics && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
                                    <div className="text-lg font-bold text-green-600 mb-1">
                                      {insight.detailed_analysis.supporting_data.performance_metrics.best_region}
                                    </div>
                                    <div className="text-xs text-green-600">Best Region</div>
                                  </div>
                                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center border border-red-200 dark:border-red-800">
                                    <div className="text-lg font-bold text-red-600 mb-1">
                                      {insight.detailed_analysis.supporting_data.performance_metrics.worst_region}
                                    </div>
                                    <div className="text-xs text-red-600">Needs Focus</div>
                                  </div>
                                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
                                    <div className="text-lg font-bold text-blue-600 mb-1">
                                      {insight.detailed_analysis.supporting_data.performance_metrics.diversity_score}%
                                    </div>
                                    <div className="text-xs text-blue-600">Geographic Reach</div>
                                  </div>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
                                    <div className="text-lg font-bold text-purple-600 mb-1">
                                      {insight.detailed_analysis.supporting_data.performance_metrics.cultural_alignment}/100
                                    </div>
                                    <div className="text-xs text-purple-600">Cultural Fit</div>
                                  </div>
                                </div>
                              )}

                              {/* Expansion Opportunities */}
                              {insight.detailed_analysis.supporting_data?.opportunities && insight.detailed_analysis.supporting_data.opportunities.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">🚀 Expansion Opportunities:</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {insight.detailed_analysis.supporting_data.opportunities.map((opp, index) => (
                                      <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-green-800 dark:text-green-300">{opp.region}</span>
                                          <span className="text-sm font-semibold text-green-600">{opp.opportunity_score}% potential</span>
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-400 capitalize">{opp.market_maturity} market</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Risk Assessment */}
                              {insight.detailed_analysis.supporting_data?.risk_assessment && insight.detailed_analysis.supporting_data.risk_assessment.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">Risk Regions:</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {insight.detailed_analysis.supporting_data.risk_assessment.map((risk, index) => (
                                      <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-red-800 dark:text-red-300">{risk.region}</span>
                                          <span className="text-sm font-semibold text-red-600">{risk.sentiment_score}% sentiment</span>
                                        </div>
                                        <div className="text-xs text-red-600 dark:text-red-400 capitalize">{risk.crisis_sensitivity} crisis sensitivity</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Key Findings and Recommendations */}
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Key Findings:</h4>
                                  <ul className="space-y-1">
                                    {insight.detailed_analysis.key_findings.map((finding, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        {finding}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Strategic Recommendations:</h4>
                                  <ul className="space-y-1">
                                    {insight.detailed_analysis.recommendations.map((rec, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Rocket className="w-4 h-4 mt-0.5 text-blue-500" />
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg w-fit mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      <path d="M2 12h20" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Geographic Intelligence</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Regional market analysis is processing your brand data. Geographic insights will appear here once analysis is complete.
                  </p>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    🌍 Phase 1 Feature - Global Market Intelligence
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'crisis' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Advanced Crisis Prediction</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Multi-signal crisis detection and early warning system
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Phase 1 Feature
                  </div>
                </div>
              </div>

              {insights.filter(insight => insight.type === 'crisis_analysis').length > 0 ? (
                <div className="grid gap-6">
                  {insights.filter(insight => insight.type === 'crisis_analysis').map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getImpactColor(insight.impact)}`}>
                          {getTypeIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                {insight.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                {insight.summary}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(insight.confidence)}`}>
                                {Math.round(insight.confidence * 100)}% Confidence
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getImpactColor(insight.impact)}`}>
                                {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Risk
                              </span>
                            </div>
                          </div>

                          {/* Accordion Toggle Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Generated {formatTimeAgo(insight.generated_at)} • AI Confidence: {Math.round(insight.confidence * 100)}%
                            </div>
                            <button
                              onClick={() => toggleInsightExpansion(insight.id)}
                              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
                            >
                              <span>{expandedInsights.has(insight.id) ? 'Hide Details' : 'View Details'}</span>
                              <ChevronRight className={`w-4 h-4 transition-transform ${expandedInsights.has(insight.id) ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* Expandable Details */}
                          {expandedInsights.has(insight.id) && (
                            <div className="mt-4 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                              {/* Crisis Risk Dashboard */}
                              {insight.detailed_analysis.supporting_data?.risk_assessment && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                  <div className={`rounded-lg p-4 text-center border-2 ${parseInt(insight.detailed_analysis.supporting_data.risk_assessment.crisis_probability) > 70 ?
                                      'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                                      parseInt(insight.detailed_analysis.supporting_data.risk_assessment.crisis_probability) > 40 ?
                                        'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' :
                                        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                                    }`}>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                      {insight.detailed_analysis.supporting_data.risk_assessment.crisis_probability}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">Crisis Probability</div>
                                  </div>
                                  <div className={`rounded-lg p-4 text-center border-2 ${insight.detailed_analysis.supporting_data.risk_assessment.risk_level === 'critical' ?
                                      'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                                      insight.detailed_analysis.supporting_data.risk_assessment.risk_level === 'high' ?
                                        'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' :
                                        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                                    }`}>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1 capitalize">
                                      {insight.detailed_analysis.supporting_data.risk_assessment.risk_level}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">Risk Level</div>
                                  </div>
                                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border-2 border-blue-300 dark:border-blue-700">
                                    <div className="text-lg font-bold text-blue-600 mb-1">
                                      {insight.detailed_analysis.supporting_data.risk_assessment.time_to_impact}
                                    </div>
                                    <div className="text-xs text-blue-600">Time to Impact</div>
                                  </div>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center border-2 border-purple-300 dark:border-purple-700">
                                    <div className="text-lg font-bold text-purple-600 mb-1">
                                      {insight.detailed_analysis.supporting_data.risk_assessment.recovery_timeline}
                                    </div>
                                    <div className="text-xs text-purple-600">Recovery Time</div>
                                  </div>
                                </div>
                              )}

                              {/* Risk Factors */}
                              {insight.detailed_analysis.supporting_data?.risk_factors && (
                                <div className="mb-6">
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">Primary Risk Factors:</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(insight.detailed_analysis.supporting_data.risk_factors).map(([factor, data]) => {
                                      const riskScore = parseInt(data.risk_score);
                                      const riskColor = riskScore > 80 ? 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                                        riskScore > 60 ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' :
                                          'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';

                                      return (
                                        <div key={factor} className={`border-2 rounded-lg p-3 ${riskColor}`}>
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium capitalize">{factor.replace('_', ' ')}</span>
                                            <span className="text-sm font-bold">{data.risk_score}</span>
                                          </div>
                                          <div className="text-xs">{data.description}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Stakeholder Impact */}
                              {insight.detailed_analysis.supporting_data?.stakeholder_impact && (
                                <div className="mb-6">
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">👥 Stakeholder Impact:</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.entries(insight.detailed_analysis.supporting_data.stakeholder_impact).map(([stakeholder, impact]) => (
                                      <div key={stakeholder} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-center">
                                        <div className="font-medium text-sm capitalize mb-1">{stakeholder.replace('_', ' ')}</div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400">{impact}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Crisis Signals */}
                              {insight.detailed_analysis.supporting_data?.crisis_signals && (
                                <div className="mb-6">
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">📊 Crisis Signals Detected:</h4>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                                      <div className="text-xl font-bold text-red-600 mb-1">
                                        {insight.detailed_analysis.supporting_data.crisis_signals.critical_signals}
                                      </div>
                                      <div className="text-xs text-red-600">Critical Signals</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-200 dark:border-orange-800">
                                      <div className="text-xl font-bold text-orange-600 mb-1">
                                        {insight.detailed_analysis.supporting_data.crisis_signals.high_signals}
                                      </div>
                                      <div className="text-xs text-orange-600">High Signals</div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                                      <div className="text-xl font-bold text-blue-600 mb-1">
                                        {insight.detailed_analysis.supporting_data.crisis_signals.total_signals}
                                      </div>
                                      <div className="text-xs text-blue-600">Total Signals</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Key Findings and Recommendations */}
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Key Findings:</h4>
                                  <ul className="space-y-1">
                                    {insight.detailed_analysis.key_findings.map((finding, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                        {finding}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">Crisis Response Actions:</h4>
                                  <ul className="space-y-1">
                                    {insight.detailed_analysis.recommendations.map((rec, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Shield className="w-4 h-4 mt-0.5 text-red-500" />
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg w-fit mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Crisis Prediction System</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Advanced multi-signal crisis detection is monitoring your brand. Crisis predictions and early warnings will appear here when risk factors are detected.
                  </p>
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                    🛡️ Phase 1 Feature - Advanced Crisis Prediction
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Predictions</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {predictions.length} predictive insights based on current trends
                </p>
              </div>

              <div className="grid gap-6">
                {predictions.map((prediction) => (
                  <div key={prediction.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        {getTypeIcon(prediction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                              {prediction.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                              Forecast for next {prediction.timeframe}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(prediction.confidence)}`}>
                            {Math.round(prediction.confidence * 100)}% Confidence
                          </span>
                        </div>

                        {prediction.type === 'sentiment_forecast' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                <div className="text-sm text-slate-600 dark:text-slate-400">Current Sentiment</div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                  {Math.round(prediction.prediction.current_sentiment * 100)}%
                                </div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                <div className="text-sm text-slate-600 dark:text-slate-400">Predicted Sentiment</div>
                                <div className={`text-2xl font-bold flex items-center gap-2 ${prediction.prediction.change_direction === 'improving' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                  {Math.round(prediction.prediction.predicted_sentiment * 100)}%
                                  {prediction.prediction.change_direction === 'improving' ?
                                    <TrendingUp className="w-5 h-5" /> :
                                    <TrendingDown className="w-5 h-5" />
                                  }
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Key Drivers:</h4>
                              <ul className="space-y-1">
                                {prediction.prediction.key_drivers.map((driver, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                                    {driver}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {prediction.type === 'crisis_probability' && (
                          <div className="space-y-4">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-red-600" />
                                <div>
                                  <div className="font-semibold text-red-900 dark:text-red-100">
                                    Crisis Probability: {prediction.prediction.crisis_probability}
                                  </div>
                                  <div className="text-sm text-red-700 dark:text-red-300">
                                    Severity if occurs: {prediction.prediction.severity_if_occurs}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Mitigation Strategies:</h4>
                              <ul className="space-y-1">
                                {prediction.mitigation_strategies.map((strategy, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Shield className="w-4 h-4 mt-0.5 text-blue-500" />
                                    {strategy}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Recommendations</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {recommendations.length} actionable recommendations prioritized by impact
                </p>
              </div>

              <div className="grid gap-6">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${rec.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                          rec.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                            rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' :
                              'bg-green-100 dark:bg-green-900/20 text-green-600'
                        }`}>
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                              {rec.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                              {rec.category.replace('_', ' ').toUpperCase()} • Timeline: {rec.timeline}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rec.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                                rec.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' :
                                    'bg-green-100 dark:bg-green-900/20 text-green-600'
                              }`}>
                              {rec.priority.toUpperCase()} Priority
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(rec.confidence)}`}>
                              {Math.round(rec.confidence * 100)}% Confidence
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Action Items:</h4>
                            <ul className="space-y-2">
                              {rec.actions.map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                            <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Expected Impact:</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{rec.impact}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Performance Metrics</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time performance and accuracy metrics for the AI engine
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Accuracy</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {Math.round(aiPerformance.accuracy * 100)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Prediction accuracy rate
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Predictions</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {aiPerformance.predictions_made}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total predictions made
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Success Rate</h3>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round((aiPerformance.successful_predictions / aiPerformance.predictions_made) * 100)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Successful predictions
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Uptime</h3>
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {aiPerformance.uptime}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    System availability
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">AI Engine Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Sentiment Analysis Engine</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Anomaly Detection System</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Predictive Analytics</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Real-time Monitoring</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIInsightsEngine;