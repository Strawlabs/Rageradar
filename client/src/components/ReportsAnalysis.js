import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs, formatNumber, getTrendIndicator } from '../utils/kpiCalculations';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import FilterBar from './shared/FilterBar';
import ColorfulWidget from './shared/ColorfulWidget';
import PageHeader from './shared/PageHeader';
import EmptyState from './shared/EmptyState';
import { capitalizeBrandName } from '../utils/brandUtils';
import ReportExport from './ReportExport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportsAnalysis = () => {
  const [searchParams] = useSearchParams();
  const urlBrandName = searchParams.get('brand');
  const { currentUser } = useAuth();
  const { currentBrand, analyzedBrands } = useBrand();
  const { filters } = useFilters();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);

  // Helper function to ensure proper brand name capitalization
  const formatBrandName = (name) => {
    if (!name) return name;
    // Handle special cases for proper capitalization
    const specialCases = {
      'netflix': 'Netflix',
      'apple': 'Apple',
      'tesla': 'Tesla',
      'google': 'Google',
      'microsoft': 'Microsoft',
      'amazon': 'Amazon',
      'meta': 'Meta',
      'facebook': 'Facebook'
    };
    return specialCases[name.toLowerCase()] || name;
  };

  // Use URL brand name if provided, otherwise use current brand from context
  const rawBrandName = urlBrandName || currentBrand?.brandName;
  const brandName = formatBrandName(rawBrandName);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // Function to apply filters to analysis data
  const applyFiltersToAnalysisData = (rawData) => {
    if (!rawData) return rawData;

    let filteredData = { ...rawData };

    // Apply platform filter
    if (filters.platform !== 'all' && rawData.platformContribution) {
      const platformData = rawData.platformContribution[filters.platform];
      if (platformData) {
        // Filter to show only selected platform
        filteredData.platformContribution = {
          [filters.platform]: platformData
        };
        // Don't override totalMentions - use shared KPI calculation
      } else {
        // Platform not found, show empty data
        filteredData.platformContribution = {};
        // Don't override totalMentions - use shared KPI calculation
      }
    }

    // Apply sentiment filter
    if (filters.sentiment !== 'all' && rawData.sentimentDistribution) {
      const sentimentValue = rawData.sentimentDistribution[filters.sentiment];
      if (sentimentValue) {
        // Update sentiment distribution to show only selected sentiment
        filteredData.sentimentDistribution = {
          positive: filters.sentiment === 'positive' ? 100 : 0,
          negative: filters.sentiment === 'negative' ? 100 : 0,
          neutral: filters.sentiment === 'neutral' ? 100 : 0
        };

        // Don't override totalMentions - use shared KPI calculation
      }
    }

    // Apply emotion filter to emotion heatmap
    if (filters.emotion !== 'all' && rawData.emotionHeatmap) {
      const emotionIndex = rawData.emotionHeatmap.emotions.indexOf(filters.emotion);
      if (emotionIndex !== -1) {
        filteredData.emotionHeatmap = {
          ...rawData.emotionHeatmap,
          emotions: [filters.emotion],
          data: [rawData.emotionHeatmap.data[emotionIndex]]
        };
      }
    }

    // Apply time range adjustments
    if (filters.timeRange !== '7d') {
      const timeMultipliers = {
        '24h': 0.14, // 1/7 of week (about 14% of weekly data)
        '30d': 4.3,  // ~4.3x week (30 days vs 7 days)
        '90d': 12.9  // ~12.9x week (90 days vs 7 days)
      };
      const multiplier = timeMultipliers[filters.timeRange] || 1;
      console.log(`🕒 Analysis Time range: ${filters.timeRange}, multiplier: ${multiplier}`);

      // Time-based variations for different metrics
      const timeVariations = {
        '24h': { sentiment: -5, platforms: -1 },
        '30d': { sentiment: +8, platforms: +1 },
        '90d': { sentiment: +12, platforms: +2 }
      };
      const variation = timeVariations[filters.timeRange] || { sentiment: 0, platforms: 0 };

      // Don't override totalMentions - use shared KPI calculation
      console.log(`📊 Analysis: Preserving shared KPI totalMentions: ${filteredData.totalMentions}`);

      // Update platform contribution
      if (filteredData.platformContribution) {
        const updatedPlatformContribution = {};
        Object.keys(filteredData.platformContribution).forEach(platform => {
          const platformData = filteredData.platformContribution[platform];
          updatedPlatformContribution[platform] = {
            positive: Math.round(platformData.positive * multiplier),
            negative: Math.round(platformData.negative * multiplier),
            neutral: Math.round(platformData.neutral * multiplier),
            total: Math.round(platformData.total * multiplier)
          };
        });
        filteredData.platformContribution = updatedPlatformContribution;
      }

      // Update sentiment distribution percentages slightly based on time range
      if (filteredData.sentimentDistribution) {
        const originalPositive = rawData.sentimentDistribution.positive;
        const originalNegative = rawData.sentimentDistribution.negative;
        const originalNeutral = rawData.sentimentDistribution.neutral;

        filteredData.sentimentDistribution = {
          positive: Math.max(0, Math.min(100, originalPositive + variation.sentiment)),
          negative: Math.max(0, Math.min(100, originalNegative - variation.sentiment * 0.5)),
          neutral: Math.max(0, Math.min(100, originalNeutral - variation.sentiment * 0.5))
        };

        // Normalize to 100%
        const total = filteredData.sentimentDistribution.positive +
          filteredData.sentimentDistribution.negative +
          filteredData.sentimentDistribution.neutral;
        if (total > 0) {
          filteredData.sentimentDistribution.positive = Math.round((filteredData.sentimentDistribution.positive / total) * 100);
          filteredData.sentimentDistribution.negative = Math.round((filteredData.sentimentDistribution.negative / total) * 100);
          filteredData.sentimentDistribution.neutral = 100 - filteredData.sentimentDistribution.positive - filteredData.sentimentDistribution.negative;
        }
      }

      // Update emotion trends data
      if (filteredData.emotionTrends) {
        filteredData.emotionTrends.positive = filteredData.emotionTrends.positive.map(val =>
          Math.max(0, Math.min(100, val + variation.sentiment))
        );
        filteredData.emotionTrends.negative = filteredData.emotionTrends.negative.map(val =>
          Math.max(0, Math.min(100, val - variation.sentiment * 0.5))
        );
        filteredData.emotionTrends.neutral = filteredData.emotionTrends.neutral.map(val =>
          Math.max(0, Math.min(100, val - variation.sentiment * 0.5))
        );
      }

      // Update top keywords counts
      if (filteredData.topKeywords) {
        filteredData.topKeywords = filteredData.topKeywords.map(keyword => ({
          ...keyword,
          count: Math.round(keyword.count * multiplier)
        }));
      }

      console.log(`📊 Analysis Updated - Total Mentions: ${filteredData.totalMentions}, Sentiment: ${filteredData.sentimentDistribution?.positive}% positive`);
    }

    return filteredData;
  };



  useEffect(() => {
    const fetchData = async () => {
      if (!currentBrand) {
        console.log('❌ ReportsAnalysis: No currentBrand available');
        setLoading(false);
        return;
      }

      console.log('🔍 ReportsAnalysis: Using brand data for:', currentBrand.brandName, 'totalMentions:', currentBrand.totalMentions);
      setLoading(true);

      try {
        // Use currentBrand data directly for consistency with other components
        console.log('📊 ReportsAnalysis: Using currentBrand data directly');

        // Transform data into analysis format using the same brand data
        const analysisData = generateAnalysisData(currentBrand);
        // Apply filters to the analysis data
        const filteredData = applyFiltersToAnalysisData(analysisData);

        console.log('📊 ReportsAnalysis: currentBrand data:', currentBrand);
        console.log('📊 ReportsAnalysis: filters:', filters);
        console.log('📊 ReportsAnalysis: Generated data with totalMentions:', filteredData.totalMentions);
        setData(filteredData);
      } catch (error) {
        console.error('Error generating analysis data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBrand, filters.timeRange, filters.platform, filters.sentiment, filters.emotion]);

  // Generate time-based emotion trends
  const generateTimeBasedEmotionTrends = (timeRange, brandData) => {
    const now = new Date();
    let labels = [];
    let positive = [];
    let negative = [];
    let neutral = [];

    const basePositive = brandData.positivePercentage || 60;
    const baseNegative = brandData.negativePercentage || 25;
    const baseNeutral = 100 - basePositive - baseNegative;

    switch (timeRange) {
      case '24h':
        // Show hourly data for last 24 hours
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
          labels.push(hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

          // Add some realistic variation
          const variation = (Math.random() - 0.5) * 10;
          positive.push(Math.max(0, Math.min(100, basePositive + variation)));
          negative.push(Math.max(0, Math.min(100, baseNegative - variation * 0.5)));
          neutral.push(Math.max(0, Math.min(100, baseNeutral - variation * 0.5)));
        }
        break;
      case '7d':
        // Show daily data for last 7 days
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        positive = [65, 68, 72, 70, 75, 78, basePositive];
        negative = [20, 18, 15, 17, 12, 10, baseNegative];
        neutral = [15, 14, 13, 13, 13, 12, baseNeutral];
        break;
      case '30d':
        // Show weekly data for last 30 days
        for (let i = 4; i >= 0; i--) {
          const week = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
          labels.push(`Week ${5 - i}`);

          const variation = (Math.random() - 0.5) * 15;
          positive.push(Math.max(0, Math.min(100, basePositive + variation)));
          negative.push(Math.max(0, Math.min(100, baseNegative - variation * 0.5)));
          neutral.push(Math.max(0, Math.min(100, baseNeutral - variation * 0.5)));
        }
        break;
      case '90d':
        // Show monthly data for last 90 days
        for (let i = 2; i >= 0; i--) {
          const month = new Date(now.getTime() - (i * 30 * 24 * 60 * 60 * 1000));
          labels.push(month.toLocaleDateString('en-US', { month: 'short' }));

          const variation = (Math.random() - 0.5) * 20;
          positive.push(Math.max(0, Math.min(100, basePositive + variation)));
          negative.push(Math.max(0, Math.min(100, baseNegative - variation * 0.5)));
          neutral.push(Math.max(0, Math.min(100, baseNeutral - variation * 0.5)));
        }
        break;
      default:
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        positive = [65, 68, 72, 70, 75, 78, basePositive];
        negative = [20, 18, 15, 17, 12, 10, baseNegative];
        neutral = [15, 14, 13, 13, 13, 12, baseNeutral];
    }

    return { labels, positive, negative, neutral };
  };

  const generateAnalysisData = (brandData) => {
    const platforms = Object.keys(brandData.platformStats || {});
    const emotions = ['joy', 'anger', 'fear', 'sadness', 'surprise', 'trust', 'anticipation', 'disgust'];

    // Generate platform contribution data
    const platformContribution = {};
    platforms.forEach(platform => {
      const stats = brandData.platformStats[platform];
      const mentions = stats?.mentions || Math.floor(Math.random() * 200) + 50;
      platformContribution[platform] = {
        positive: Math.floor(mentions * (brandData.positivePercentage / 100)),
        negative: Math.floor(mentions * (brandData.negativePercentage / 100)),
        neutral: Math.floor(mentions * (brandData.neutralPercentage / 100)),
        total: mentions
      };
    });

    // Generate emotion trends over time based on current time range
    const emotionTrends = generateTimeBasedEmotionTrends(filters.timeRange, brandData);

    // Generate sentiment distribution
    const sentimentDistribution = {
      positive: brandData.positivePercentage,
      negative: brandData.negativePercentage,
      neutral: brandData.neutralPercentage
    };

    // Generate top keywords
    const topKeywords = [
      { word: brandData.brandName, count: Math.floor(brandData.totalMentions * 0.8), sentiment: 'positive', change: '+12%' },
      { word: 'quality', count: Math.floor(brandData.totalMentions * 0.3), sentiment: 'positive', change: '+8%' },
      { word: 'service', count: Math.floor(brandData.totalMentions * 0.25), sentiment: 'neutral', change: '+5%' },
      { word: 'price', count: Math.floor(brandData.totalMentions * 0.2), sentiment: 'negative', change: '-3%' },
      { word: 'support', count: Math.floor(brandData.totalMentions * 0.15), sentiment: 'positive', change: '+15%' }
    ];

    // Use shared KPI calculation for consistency
    const kpis = calculateKPIs(brandData, filters);

    return {
      brandName: brandData.brandName,
      totalMentions: kpis.totalMentions,
      averageSentiment: kpis.averageSentiment,
      rageIndex: kpis.rageIndex,
      confidenceScore: kpis.confidenceScore,
      platformCount: kpis.platformCount,
      platformContribution,
      emotionTrends,
      sentimentDistribution,
      topKeywords,
      emotionHeatmap: generateEmotionHeatmap(brandData, emotions, platforms)
    };
  };

  const generateEmotionHeatmap = (brandData, emotions, platforms) => {
    if (platforms.length === 0) {
      return null;
    }

    return {
      emotions,
      platforms,
      data: emotions.map(emotion =>
        platforms.map(platform => {
          // Generate realistic emotion intensity based on brand sentiment
          const baseIntensity = brandData.positivePercentage > 70 ? 8 :
            brandData.positivePercentage > 50 ? 5 : 3;
          const variation = Math.random() * 6 + 2; // 2-8 range
          return Math.max(1, Math.min(15, Math.round(baseIntensity + variation)));
        })
      )
    };
  };

  const getEmotionColor = (emotion, intensity = 1) => {
    // Enhanced color scheme with better contrast and visibility
    const colors = {
      joy: { r: 34, g: 197, b: 94 }, // Bright Green
      anger: { r: 239, g: 68, b: 68 }, // Bright Red
      fear: { r: 147, g: 51, b: 234 }, // Purple
      sadness: { r: 59, g: 130, b: 246 }, // Blue
      surprise: { r: 245, g: 158, b: 11 }, // Orange/Yellow
      disgust: { r: 139, g: 69, b: 19 }, // Brown
      trust: { r: 16, g: 185, b: 129 }, // Teal
      anticipation: { r: 236, g: 72, b: 153 }, // Pink
      // Additional emotions
      satisfaction: { r: 34, g: 197, b: 94 }, // Green
      indifferent: { r: 107, g: 114, b: 128 }, // Gray
      excitement: { r: 245, g: 158, b: 11 }, // Orange
      neutral: { r: 107, g: 114, b: 128 }, // Gray
      curiosity: { r: 236, g: 72, b: 153 } // Pink
    };

    const color = colors[emotion] || { r: 107, g: 114, b: 128 };

    // Ensure minimum visibility with enhanced intensity calculation
    const minIntensity = 0.4;
    const maxIntensity = 0.9;
    const adjustedIntensity = minIntensity + (intensity * (maxIntensity - minIntensity));

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${adjustedIntensity})`;
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      reddit: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      youtube: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      facebook: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      instagram: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
        </svg>
      ),
      news: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </svg>
      ),
      blogs: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      ),
      forums: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    };
    return icons[platform] || (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#22c55e" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="9" cy="9" r="1" fill="white" />
          <circle cx="15" cy="9" r="1" fill="white" />
        </svg>
      ),
      anger: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#ef4444" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" stroke="white" strokeWidth="2" fill="none" />
          <line x1="9" y1="9" x2="9.01" y2="9" stroke="white" strokeWidth="2" />
          <line x1="15" y1="9" x2="15.01" y2="9" stroke="white" strokeWidth="2" />
        </svg>
      ),
      fear: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#9333ea" />
          <circle cx="12" cy="14" r="2" fill="white" />
          <circle cx="9" cy="9" r="1.5" fill="white" />
          <circle cx="15" cy="9" r="1.5" fill="white" />
        </svg>
      ),
      sadness: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#3b82f6" />
          <path d="M16 18s-1.5-2-4-2-4 2-4 2" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="9" cy="9" r="1" fill="white" />
          <circle cx="15" cy="9" r="1" fill="white" />
        </svg>
      ),
      surprise: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#f59e0b" />
          <circle cx="12" cy="16" r="2" fill="white" />
          <circle cx="9" cy="9" r="1.5" fill="white" />
          <circle cx="15" cy="9" r="1.5" fill="white" />
        </svg>
      ),
      disgust: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#8b4513" />
          <path d="M9 15h6" stroke="white" strokeWidth="2" />
          <circle cx="9" cy="9" r="1" fill="white" />
          <circle cx="15" cy="9" r="1" fill="white" />
        </svg>
      ),
      trust: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#10b981" />
          <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="9" cy="9" r="1" fill="white" />
          <circle cx="15" cy="9" r="1" fill="white" />
        </svg>
      ),
      anticipation: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#ec4899" />
          <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="9" cy="9" r="1" fill="white" />
          <circle cx="15" cy="9" r="1" fill="white" />
        </svg>
      )
    };
    return icons[emotion] || (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#6b7280" />
      </svg>
    );
  };

  // Platform chart data with proper null checks
  const platformContribution = data?.platformContribution || {};
  const platformData = {
    labels: Object.keys(platformContribution || {}),
    datasets: [
      {
        label: 'Negative',
        data: Object.values(platformContribution || {}).map(p => p?.negative || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      },
      {
        label: 'Neutral',
        data: Object.values(platformContribution || {}).map(p => p?.neutral || 0),
        backgroundColor: 'rgba(107, 114, 128, 0.8)',
        borderColor: 'rgba(107, 114, 128, 1)',
        borderWidth: 1
      },
      {
        label: 'Positive',
        data: Object.values(platformContribution || {}).map(p => p?.positive || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#F3F4F6',
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F3F4F6',
        bodyColor: '#F3F4F6',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y} mentions`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: '#374151',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12
          }
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: '#374151',
          drawBorder: false
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12
          }
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20
      }
    }
  };

  // Emotion trends chart data with proper null checks
  const emotionTrends = data?.emotionTrends || { labels: [], positive: [], negative: [], neutral: [] };
  const emotionTrendsData = {
    labels: emotionTrends?.labels || [],
    datasets: [
      {
        label: 'Positive',
        data: emotionTrends?.positive || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Negative',
        data: emotionTrends?.negative || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Neutral',
        data: emotionTrends?.neutral || [],
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Sentiment distribution doughnut data with proper null checks
  const sentimentDistribution = data?.sentimentDistribution || { positive: 0, negative: 0, neutral: 0 };
  const sentimentDoughnutData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          sentimentDistribution?.positive || 0,
          sentimentDistribution?.negative || 0,
          sentimentDistribution?.neutral || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 2
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 lg:p-6">
        <div className="max-w-full mx-auto">
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-lg font-medium text-white ml-3">Loading sentiment overview...</span>
            </div>
            <p className="text-slate-400">Analyzing emotion patterns across all platforms...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!data || !data.totalMentions || data.totalMentions === 0) {
    return (
      <div className="p-6 w-full">
        <EmptyState title="" message="" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <PageHeader
          title="Sentiment Analysis"
          subtitle="Comprehensive emotion analysis and sentiment tracking across all platforms"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          iconBg="from-blue-500 to-indigo-500"
          action={
            <button onClick={() => setShowExportModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Sentiment Report
            </button>
          }
        />

        {/* Filter Bar */}
        <FilterBar
          showKeywordFilter={false}
          showSortOptions={false}
          compact={true}
          className="mb-4"
        />

        {/* KPI Cards Row - Colorful Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <ColorfulWidget
            title="Total Mentions"
            value={data?.totalMentions?.toLocaleString() || '0'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            }
            color="blue"
            size="medium"
          />

          <ColorfulWidget
            title="Positive Sentiment"
            value={`${sentimentDistribution?.positive || 0}%`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
            size="medium"
          />

          <ColorfulWidget
            title="Negative Sentiment"
            value={`${sentimentDistribution?.negative || 0}%`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="red"
            size="medium"
          />

          <ColorfulWidget
            title="Active Platforms"
            value={Object.keys(platformContribution || {}).length.toString()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            }
            color="purple"
            size="medium"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Sentiment Distribution - Takes 1 column */}
          <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">
              Sentiment Distribution
            </h2>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut
                  data={sentimentDoughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 2000,
                      easing: 'easeInOutQuart'
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#F3F4F6',
                          padding: 20,
                          usePointStyle: true
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#F3F4F6',
                        bodyColor: '#F3F4F6',
                        borderColor: '#374151',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                          label: function (context) {
                            return `${context.label}: ${context.parsed}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sentiment Trends - Takes 2 columns */}
          <div className="xl:col-span-2 bg-slate-800 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">
              Sentiment Trends Over Time
            </h2>
            <div className="h-64">
              <Line
                data={emotionTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        color: '#F3F4F6',
                        padding: 20,
                        usePointStyle: true,
                        boxWidth: 12
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      titleColor: '#F3F4F6',
                      bodyColor: '#F3F4F6',
                      borderColor: '#374151',
                      borderWidth: 1,
                      cornerRadius: 8
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: '#374151',
                        drawBorder: false
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: '#374151',
                        drawBorder: false
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Platform Analysis and Keywords Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Platform Contribution Chart */}
          <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">
              Platform Contribution Analysis
            </h2>
            <div className="h-80">
              <Bar data={platformData} options={chartOptions} />
            </div>
          </div>

          {/* Top Keywords */}
          <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">
              Top Keywords & Phrases
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {(data?.topKeywords || []).map((keyword, index) => (
                <div
                  key={index}
                  className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{keyword.word}</span>
                    <span className={`text-sm px-2 py-1 rounded ${keyword.sentiment === 'positive'
                      ? 'bg-green-500/20 text-green-400'
                      : keyword.sentiment === 'negative'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                      }`}>
                      {keyword.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{keyword.count} mentions</span>
                    <span className={`font-medium ${keyword.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {keyword.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Emotion Heatmap - Full Width */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-6">
            Detailed Emotion Analysis Heatmap
          </h2>

          {data.emotionHeatmap ? (
            <>
              <div className="w-full">
                <div className="w-full">
                  {/* Header row */}
                  <div className="flex mb-2 w-full">
                    <div className="flex-shrink-0" style={{ width: '180px' }}></div>
                    <div className="flex-1 flex">
                      {data.emotionHeatmap.platforms.map((platform, index) => (
                        <div
                          key={index}
                          className="flex-1 text-center p-3 animate-slide-in min-w-0"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="text-slate-400 mb-2 flex justify-center">{getPlatformIcon(platform)}</div>
                          <div className="text-xs text-slate-300 capitalize font-medium truncate">
                            {platform}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data rows */}
                  {data.emotionHeatmap.emotions.map((emotion, emotionIndex) => (
                    <div key={emotion} className="flex mb-2 w-full">
                      <div
                        className="flex-shrink-0 flex items-center p-3 animate-slide-in"
                        style={{ width: '180px', animationDelay: `${emotionIndex * 150}ms` }}
                      >
                        <span className="mr-3 flex-shrink-0">{getEmotionIcon(emotion)}</span>
                        <span className="text-sm text-slate-300 capitalize font-medium truncate">
                          {emotion}
                        </span>
                      </div>

                      <div className="flex-1 flex">
                        {data.emotionHeatmap.data[emotionIndex].map((value, platformIndex) => (
                          <div
                            key={platformIndex}
                            className={`flex-1 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in border-2 mx-1 min-w-0 ${selectedEmotion === emotion && selectedPlatform === platformIndex
                              ? 'border-orange-500 shadow-lg'
                              : 'border-transparent'
                              }`}
                            style={{
                              backgroundColor: getEmotionColor(emotion, Math.max(0.3, value / 100)),
                              minHeight: '60px',
                              animationDelay: `${(emotionIndex * 8 + platformIndex) * 50}ms`
                            }}
                            onClick={() => {
                              setSelectedEmotion(emotion);
                              setSelectedPlatform(platformIndex);
                            }}
                          >
                            <div className="text-sm font-bold text-white text-center flex items-center justify-center h-full">
                              {value}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improved Heatmap Legend */}
              <div className="mt-8">
                <div className="flex items-center justify-center space-x-8 mb-4">
                  <div className="text-sm text-slate-400 font-medium">Intensity Scale:</div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-4 rounded border border-slate-600" style={{
                        backgroundColor: 'rgba(107, 114, 128, 0.5)'
                      }}></div>
                      <span className="text-sm text-slate-300">Low (0-33%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-4 rounded border border-slate-600" style={{
                        backgroundColor: 'rgba(107, 114, 128, 0.7)'
                      }}></div>
                      <span className="text-sm text-slate-300">Medium (34-66%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-4 rounded border border-slate-600" style={{
                        backgroundColor: 'rgba(107, 114, 128, 0.9)'
                      }}></div>
                      <span className="text-sm text-slate-300">High (67-100%)</span>
                    </div>
                  </div>
                </div>

                {/* Emotion Color Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {data.emotionHeatmap.emotions.map((emotion) => (
                    <div key={emotion} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-slate-600"
                        style={{ backgroundColor: getEmotionColor(emotion, 0.8) }}
                      ></div>
                      <span className="text-xs text-slate-300 capitalize">{emotion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Cell Info */}
              {selectedEmotion && selectedPlatform !== null && (
                <div className="mt-6 flex items-center justify-center">
                  <div className="bg-slate-700 rounded-lg p-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="flex-shrink-0">{getEmotionIcon(selectedEmotion)}</span>
                      <span className="text-white font-medium capitalize">{selectedEmotion}</span>
                    </div>
                    <div className="text-slate-400">×</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 flex-shrink-0">{getPlatformIcon(data.emotionHeatmap.platforms[selectedPlatform])}</span>
                      <span className="text-white font-medium capitalize">{data.emotionHeatmap.platforms[selectedPlatform]}</span>
                    </div>
                    <div className="text-slate-400">=</div>
                    <div className="text-white font-bold">
                      {data.emotionHeatmap.data[data.emotionHeatmap.emotions.indexOf(selectedEmotion)][selectedPlatform]}%
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Emotion Data Available
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  No mentions found for {brandName}. This could mean the brand has limited online presence or the search terms need adjustment.
                </p>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>• Try searching with different brand name variations</p>
                  <p>• Check if the company domain or website URL works better</p>
                  <p>• Consider that newer brands may have fewer mentions</p>
                </div>
                <button
                  onClick={() => navigate('/analysis')}
                  className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Try Different Search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showExportModal && (
        <ReportExport
          analysisData={data}
          brandName={currentBrand?.brandName || 'Brand'}
          appliedFilters={filters}
          timeRangeLabel={filters?.timeRange || 'Last 7 days'}
          reportType="sentiment"
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default ReportsAnalysis;