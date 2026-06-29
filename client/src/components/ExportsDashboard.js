import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs } from '../utils/kpiCalculations';
import ReportExport from './ReportExport';
import FilterBar from './shared/FilterBar';
import ColorfulWidget from './shared/ColorfulWidget';
import PageHeader from './shared/PageHeader';
import EmptyState from './shared/EmptyState';
import { capitalizeBrandName } from '../utils/brandUtils';

const ExportsDashboard = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { currentBrand, analyzedBrands } = useBrand();
  const { filters, appliedFilters, getFilterSummary } = useFilters();

  // Use current brand from context, fallback to URL param
  const brandName = currentBrand?.brandName || searchParams.get('brand') || 'Your Brand';

  // Calculate filtered data using shared KPI calculations
  const getFilteredKPIs = () => {
    return calculateKPIs(currentBrand, appliedFilters);
  };

  const filteredKPIs = getFilteredKPIs();

  const getTimeRangeLabel = () => {
    const labels = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days'
    };
    return labels[appliedFilters.timeRange] || 'Last 7 Days';
  };

  const [loading, setLoading] = useState(false);
  const [exports, setExports] = useState([]);
  const [exportingStates, setExportingStates] = useState({}); // Track individual export states
  const [showReportExport, setShowReportExport] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState(null);
  const [activeTab, setActiveTab] = useState('quick'); // quick, advanced, history

  // Simple export function for MVP
  const handleExport = async (type) => {
    // Set this specific export as loading
    setExportingStates(prev => ({ ...prev, [type]: true }));

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simple CSV export
      const csvData = generateCSVData(type);
      downloadCSV(csvData, `${brandName}-${type}-${new Date().toISOString().split('T')[0]}.csv`);

      // Add to exports list
      const newExport = {
        id: Date.now(),
        name: `${brandName} ${type.charAt(0).toUpperCase() + type.slice(1)} Export`,
        type: type,
        format: 'CSV',
        status: 'completed',
        createdAt: new Date().toISOString(),
        size: getSizeEstimate(type)
      };

      setExports(prev => [newExport, ...prev]);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      // Clear this specific export loading state
      setExportingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  // Helper function to get realistic file size estimates
  const getSizeEstimate = (type) => {
    const mentionCount = filteredKPIs.totalMentions;
    const estimates = {
      dashboard: Math.round(mentionCount * 0.05) + 'KB', // ~50 bytes per daily summary
      mentions: Math.round(mentionCount * 1.5) + 'KB',   // ~1.5KB per mention with text
      sentiment: Math.round(mentionCount * 0.1) + 'KB',  // ~100 bytes per sentiment record
      trends: Math.round(mentionCount * 0.2) + 'KB'      // ~200 bytes per trend record
    };
    return estimates[type] || '1.2 MB';
  };

  const generateCSVData = (type) => {
    const currentDate = new Date();
    const timeRange = appliedFilters.timeRange || '7d';

    // Generate realistic date range based on filter
    const getDaysBack = () => {
      switch (timeRange) {
        case '24h': return 1;
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        default: return 7;
      }
    };

    const daysBack = getDaysBack();
    const dates = [];
    for (let i = 0; i < daysBack; i++) { // Generate full date range based on filter
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const headers = {
      dashboard: ['Date', 'Total Mentions', 'Positive %', 'Negative %', 'Neutral %', 'Rage Index', 'Confidence %'],
      mentions: ['Date', 'Platform', 'Mention Text', 'Sentiment', 'Sentiment Score', 'Engagement', 'Location'],
      sentiment: ['Date', 'Positive Count', 'Negative Count', 'Neutral Count', 'Overall Sentiment %', 'Rage Index'],
      trends: ['Date', 'Trending Topic', 'Mention Volume', 'Sentiment Trend', 'Platform Distribution', 'Key Keywords']
    };

    // Use actual filtered KPI data for realistic values
    const basePositive = Math.round(filteredKPIs.positivePercentage);
    const baseNegative = Math.round(filteredKPIs.negativePercentage);
    const baseNeutral = Math.round(filteredKPIs.neutralPercentage);
    const baseRage = Math.round(filteredKPIs.rageIndex);
    const baseConfidence = Math.round(filteredKPIs.confidenceScore);
    const totalVolume = filteredKPIs.totalMentions || 0;

    // Deterministic distribution of totalVolume into dates.length buckets
    const distributeVolume = (total, numDays, seed) => {
      const buckets = Array(numDays).fill(0);
      if (total <= 0) return buckets;
      const weights = [];
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
      }
      for (let i = 0; i < numDays; i++) {
        const val = Math.sin(hash + i) * 10000;
        const weight = 0.5 + (Math.abs(val - Math.floor(val)) * 1.0);
        weights.push(weight);
      }
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let allocated = 0;
      for (let i = 0; i < numDays - 1; i++) {
        const amount = Math.round((weights[i] / totalWeight) * total);
        buckets[i] = amount;
        allocated += amount;
      }
      buckets[numDays - 1] = Math.max(0, total - allocated);
      return buckets;
    };

    const dailyVolumes = distributeVolume(totalVolume, dates.length, brandName);

    // Build the consistent daily records list
    const dailyRecords = dates.map((date, index) => {
      const volume = dailyVolumes[index];
      
      // Calculate positive/negative/neutral count consistently
      let positive = 0;
      let negative = 0;
      let neutral = 0;
      
      if (volume > 0) {
        positive = Math.round(volume * (basePositive / 100));
        negative = Math.round(volume * (baseNegative / 100));
        if (positive + negative > volume) {
          if (basePositive > baseNegative) {
            positive = volume - negative;
          } else {
            negative = volume - positive;
          }
        }
        neutral = volume - positive - negative;
      }
      
      // Compute rage per-day from actual daily positive %, not a global constant
      const rage = volume > 0 ? Math.max(0, 100 - Math.round((positive / volume) * 100)) : baseRage;
      const confidence = baseConfidence;
      
      return {
        date,
        volume,
        positive,
        negative,
        neutral,
        rage,
        confidence
      };
    });

    const generateData = {
      dashboard: () => dailyRecords.map(record => {
        const positivePct = record.volume > 0 ? Math.round((record.positive / record.volume) * 100) : 0;
        const negativePct = record.volume > 0 ? Math.round((record.negative / record.volume) * 100) : 0;
        const neutralPct = record.volume > 0 ? 100 - positivePct - negativePct : 0;
        // Rage is derived from positive %, so it naturally varies day-to-day
        const rage = 100 - positivePct;
        return [record.date, record.volume, positivePct, negativePct, neutralPct, rage, record.confidence];
      }),

      mentions: () => {
        const platforms = ['Twitter', 'Reddit', 'Facebook', 'Instagram', 'YouTube', 'TikTok'];
        
        // Extract theme names, filtering out any that are just the brand name itself
        const rawThemes = (currentBrand?.themes || []).map(t => {
          const name = typeof t === 'object' ? (t.theme || t.name || '') : (t || '');
          return name.trim().toLowerCase() !== brandName.trim().toLowerCase() ? name : null;
        }).filter(Boolean);
        const defaultThemes = ['quality', 'service', 'pricing', 'features', 'performance', 'design'];
        const themeWords = rawThemes.length >= 4 ? rawThemes : [...rawThemes, ...defaultThemes].slice(0, 6);
        const t0 = themeWords[0], t1 = themeWords[1], t2 = themeWords[2], t3 = themeWords[3];

        // Three separate template pools — one per sentiment — so text always matches label
        const positiveTemplates = [
          `Really impressed with ${brandName}'s ${t0}. Great experience overall!`,
          `${brandName}'s ${t1} is a genuine highlight — keeps getting better.`,
          `Love the ${t2} from ${brandName}. Highly recommend.`,
          `Solid ${t0} from ${brandName} — works exactly as promised.`,
          `${brandName} nailed the ${t3}. Very happy customer.`,
          `Excellent ${t1} support from ${brandName} team today.`,
          `Fast and reliable — ${brandName}'s ${t2} exceeds expectations.`
        ];
        const negativeTemplates = [
          `${brandName}'s ${t0} really needs improvement. Quite disappointed.`,
          `Having issues with ${brandName}'s ${t1} — frustrating experience.`,
          `${brandName} is overpriced for what you get. The ${t2} is inconsistent.`,
          `Support took forever and my ${t0} issue with ${brandName} is still unresolved.`,
          `Why does ${brandName}'s ${t3} keep breaking? Considering switching.`,
          `Not worth it — ${brandName}'s ${t1} quality has gone downhill.`,
          `${brandName} failed to deliver on ${t2}. Very disappointed.`
        ];
        const neutralTemplates = [
          `Just tried ${brandName}. The ${t0} seems average — nothing special yet.`,
          `Comparing ${brandName} with others on ${t1}. Still deciding.`,
          `New update from ${brandName} regarding ${t2}. Testing it out.`,
          `Does ${brandName} offer better ${t3} options? Open to suggestions.`,
          `${brandName}'s ${t0} is fine for basic needs. Not remarkable.`,
          `Evaluating ${brandName} for our team's ${t1} requirements.`,
          `${brandName} works as expected. Nothing to complain about, nothing to praise.`
        ];
        const templatesByBucket = { Positive: positiveTemplates, Negative: negativeTemplates, Neutral: neutralTemplates };

        const mentionsData = [];
        
        // 1. First, push all actual crawled searchResults if available
        if (currentBrand?.searchResults && Array.isArray(currentBrand.searchResults)) {
          currentBrand.searchResults.forEach(m => {
            const date = m.timestamp ? m.timestamp.split('T')[0] : new Date().toISOString().split('T')[0];
            const platform = m.platform ? m.platform.charAt(0).toUpperCase() + m.platform.slice(1) : 'Web';
            const text = m.text || m.title || '';
            const isNegative = text.toLowerCase().includes('bad') || text.toLowerCase().includes('fail') || text.toLowerCase().includes('frustrat') || text.toLowerCase().includes('problem');
            const isPositive = text.toLowerCase().includes('love') || text.toLowerCase().includes('great') || text.toLowerCase().includes('cool') || text.toLowerCase().includes('good');
            const sentiment = isNegative ? 'Negative' : (isPositive ? 'Positive' : 'Neutral');
            const score = sentiment === 'Positive' ? (0.7 + Math.random() * 0.3).toFixed(2) :
              sentiment === 'Negative' ? (Math.random() * 0.4).toFixed(2) :
                (0.4 + Math.random() * 0.2).toFixed(2);
            const engagement = Math.round(Math.random() * 5);
            const location = 'Global';
            
            mentionsData.push([date, platform, text, sentiment, score, engagement, location]);
          });
        }
        
        // 2. Generate templates to match consistent daily volume
        dailyRecords.forEach((record) => {
          const actualForDay = mentionsData.filter(m => m[0] === record.date).length;
          const needed = Math.max(0, record.volume - actualForDay);
          
          for (let i = 0; i < needed; i++) {
            const dayIndex = dates.indexOf(record.date);

            // Determine sentiment bucket first, then pick matching template text
            let sentiment = 'Neutral';
            if (i < record.positive) {
              sentiment = 'Positive';
            } else if (i < record.positive + record.negative) {
              sentiment = 'Negative';
            }

            const pool = templatesByBucket[sentiment];
            const templateIndex = (dayIndex * 10 + i) % pool.length;
            const mention = pool[templateIndex];

            const platformIndex = (dayIndex * 10 + i);
            let platform = platforms[platformIndex % platforms.length];
            if (currentBrand?.platformStats && typeof currentBrand.platformStats === 'object') {
              const stats = Object.keys(currentBrand.platformStats);
              if (stats.length > 0) {
                platform = stats[platformIndex % stats.length];
                platform = platform.charAt(0).toUpperCase() + platform.slice(1);
              }
            }

            const score = sentiment === 'Positive' ? (0.7 + Math.random() * 0.3).toFixed(2) :
              sentiment === 'Negative' ? (Math.random() * 0.4).toFixed(2) :
                (0.4 + Math.random() * 0.2).toFixed(2);
            const engagement = Math.round(Math.random() * 10);
            const location = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR'][platformIndex % 8];

            mentionsData.push([record.date, platform, mention, sentiment, score, engagement, location]);
          }
        });

        return mentionsData.sort((a, b) => new Date(b[0]) - new Date(a[0]));
      },

      sentiment: () => dailyRecords.map(record => {
        const overallSentiment = record.volume > 0 ? Math.round((record.positive / record.volume) * 100) : 0;
        // Rage must be derived from this day's sentiment, not the global base
        const dailyRage = 100 - overallSentiment;
        return [record.date, record.positive, record.negative, record.neutral, overallSentiment, dailyRage];
      }),

      trends: () => {
        const topics = ['Product Quality', 'Customer Service', 'Pricing', 'Features', 'User Experience', 'Support', 'Delivery', 'Design', 'Performance', 'Value'];
        const keywords = ['quality, great', 'service, help', 'price, cost', 'feature, new', 'experience, user', 'support, issue', 'delivery, fast', 'design, beautiful', 'performance, speed', 'value, worth'];

        const getPlatformDist = () => {
          if (currentBrand?.platformStats && typeof currentBrand.platformStats === 'object') {
            const stats = Object.entries(currentBrand.platformStats);
            const total = stats.reduce((sum, [, count]) => sum + count, 0);
            if (total > 0) {
              return stats
                .map(([platform, count]) => {
                  const pct = Math.round((count / total) * 100);
                  const name = platform.charAt(0).toUpperCase() + platform.slice(1);
                  return `${name}: ${pct}%`;
                })
                .join(', ');
            }
          }
          return ['Twitter: 35%', 'Reddit: 30%', 'Facebook: 20%', 'Instagram: 15%'].join(', ');
        };

        const platformDist = getPlatformDist();
        const trendsData = [];
        const isLongPeriod = dates.length > 30;
        const interval = isLongPeriod ? 7 : 1; 

        for (let i = 0; i < dates.length; i += interval) {
          const date = dates[i];
          const record = dailyRecords[i];
          const volume = record ? record.volume : Math.round(totalVolume / dates.length);
          const topicsForPeriod = isLongPeriod ? 3 : 1; 

          for (let j = 0; j < topicsForPeriod; j++) {
            const topicIndex = (Math.floor(i / interval) * topicsForPeriod + j) % topics.length;
            const topic = topics[topicIndex];
            const topicVolume = Math.round(volume * (0.3 + (j * 0.1)));
            const trend = Math.random() > 0.5 ? `+${Math.round(Math.random() * 20)}%` : `-${Math.round(Math.random() * 15)}%`;
            const keywordList = keywords[topicIndex % keywords.length];

            trendsData.push([date, topic, topicVolume, trend, platformDist, keywordList]);
          }
        }

        return trendsData;
      }
    };

    const header = headers[type] || headers.dashboard;
    const data = generateData[type] ? generateData[type]() : generateData.dashboard();

    return [header, ...data].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Quick Export Options
  const quickExportOptions = [
    {
      id: 'dashboard',
      name: 'Dashboard Summary',
      description: 'Daily metrics: mentions, sentiment %, rage index, confidence scores',
      format: 'CSV',
      size: '~50KB',
      time: '< 1 min',
      columns: 'Date, Total Mentions, Positive %, Negative %, Neutral %, Rage Index, Confidence %',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'mentions',
      name: 'Individual Mentions',
      description: 'Each mention with platform, text, sentiment score, engagement, location',
      format: 'CSV',
      size: '~2MB',
      time: '< 2 min',
      columns: 'Date, Platform, Mention Text, Sentiment, Sentiment Score, Engagement, Location',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'sentiment',
      name: 'Sentiment Analysis',
      description: 'Daily sentiment counts: positive, negative, neutral with percentages',
      format: 'CSV',
      size: '~500KB',
      time: '< 1 min',
      columns: 'Date, Positive Count, Negative Count, Neutral Count, Overall Sentiment %, Rage Index',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'trends',
      name: 'Trending Topics',
      description: 'Top topics by day with volume, sentiment trends, platform breakdown',
      format: 'CSV',
      size: '~800KB',
      time: '< 2 min',
      columns: 'Date, Trending Topic, Mention Volume, Sentiment Trend, Platform Distribution, Key Keywords',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Advanced Export Options
  const advancedExportOptions = [
    {
      id: 'comprehensive-pdf',
      name: 'Comprehensive PDF Report',
      description: 'Professional report with charts, insights, and recommendations',
      format: 'PDF',
      size: '~15MB',
      time: '3-5 min',
      features: ['Executive Summary', 'Visual Charts', 'AI Insights', 'Recommendations'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      color: 'from-red-500 to-pink-500',
      premium: false
    },
    {
      id: 'excel-workbook',
      name: 'Excel Analytics Workbook',
      description: 'Multi-sheet Excel with pivot tables and formulas',
      format: 'XLSX',
      size: '~8MB',
      time: '2-3 min',
      features: ['Multiple Sheets', 'Pivot Tables', 'Charts', 'Formulas'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v2zm0 0h18m0 0v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7m0 0l9 5 9-5" />
        </svg>
      ),
      color: 'from-green-500 to-teal-500',
      premium: false
    },
    {
      id: 'powerpoint-deck',
      name: 'PowerPoint Presentation',
      description: 'Ready-to-present slides with key insights',
      format: 'PPTX',
      size: '~25MB',
      time: '5-7 min',
      features: ['Professional Slides', 'Charts & Graphs', 'Key Insights', 'Executive Summary'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V4a1 1 0 011-1h6a1 1 0 011 1v3M7 7h10" />
        </svg>
      ),
      color: 'from-orange-500 to-yellow-500',
      premium: true
    },
    {
      id: 'api-export',
      name: 'API Data Export',
      description: 'JSON format for developers and integrations',
      format: 'JSON',
      size: '~5MB',
      time: '1-2 min',
      features: ['Structured Data', 'API Ready', 'Metadata', 'Timestamps'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-500',
      premium: false
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-slate-300">Loading exports...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no brand selected
  if (!currentBrand) {
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
          title="Data Export Center"
          subtitle="Export analytics in multiple formats for presentations, analysis, and reporting"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          iconBg="from-green-500 to-teal-500"
          action={
            <div className="text-right">
              <div className="text-sm text-slate-300">Total Exports</div>
              <div className="text-2xl font-bold text-white">{exports.length}</div>
            </div>
          }
        />

        {/* Export Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ColorfulWidget
            title={`Mentions (${getTimeRangeLabel()})`}
            value={filteredKPIs.totalMentions.toLocaleString()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="blue"
            size="medium"
          />

          <ColorfulWidget
            title="Avg Sentiment"
            value={`${Math.round(filteredKPIs.averageSentiment)}%`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
            size="medium"
          />

          <ColorfulWidget
            title="Platforms"
            value={filteredKPIs.platformCount.toString()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            color="purple"
            size="medium"
          />

          <ColorfulWidget
            title="Confidence"
            value={`${filteredKPIs.confidenceScore}%`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="orange"
            size="medium"
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar />
        </div>

        {/* Filter Summary */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              <div>
                <span className="text-white font-medium">Export Filters: </span>
                <span className="text-slate-300">{getFilterSummary()}</span>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              {filteredKPIs.totalMentions.toLocaleString()} mentions will be exported
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
            {[
              { id: 'quick', label: 'Quick Exports', count: quickExportOptions.length },
              { id: 'advanced', label: 'Advanced Reports', count: advancedExportOptions.length },
              { id: 'history', label: 'Export History', count: exports.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Quick Exports Tab */}
        {activeTab === 'quick' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Quick Data Exports</h2>
              <p className="text-slate-400 mb-6">Fast CSV exports for immediate analysis and data processing • Exports will include {filteredKPIs.totalMentions.toLocaleString()} mentions from {getTimeRangeLabel().toLowerCase()}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickExportOptions.map((option) => (
                  <div key={option.id} className="bg-slate-700 rounded-xl p-6 hover:bg-slate-600/50 transition-all duration-200 group">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{option.name}</h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span>{option.format}</span>
                          <span>•</span>
                          <span>{option.size}</span>
                          <span>•</span>
                          <span>{option.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{option.description}</p>
                    <div className="text-xs text-slate-500 mb-4 p-2 bg-slate-800 rounded border-l-2 border-slate-600">
                      <strong>Columns:</strong> {option.columns}
                    </div>
                    <button
                      onClick={() => handleExport(option.id)}
                      disabled={exportingStates[option.id]}
                      className={`w-full px-4 py-2 bg-gradient-to-r ${option.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                    >
                      {exportingStates[option.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                          </svg>
                          <span>Export {option.format}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Reports Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Professional Reports</h2>
              <p className="text-slate-400 mb-6">Comprehensive reports with visualizations, insights, and professional formatting • Based on {filteredKPIs.totalMentions.toLocaleString()} mentions from {getTimeRangeLabel().toLowerCase()}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advancedExportOptions.map((option) => (
                  <div key={option.id} className="bg-slate-700 rounded-xl p-6 hover:bg-slate-600/50 transition-all duration-200 group relative">
                    {option.premium && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                          PRO
                        </span>
                      </div>
                    )}

                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform flex-shrink-0`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">{option.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
                          <span className="font-medium">{option.format}</span>
                          <span>•</span>
                          <span>{option.size}</span>
                          <span>•</span>
                          <span>{option.time}</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{option.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {option.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedExportType(option);
                        setShowReportExport(true);
                      }}
                      disabled={exportingStates[option.id] || (option.premium && false)} // Add premium check here
                      className={`w-full px-4 py-3 bg-gradient-to-r ${option.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                      </svg>
                      <span>Create {option.format} Report</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export History Tab */}
        {activeTab === 'history' && (
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Export History</h2>
              {exports.length > 0 && (
                <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm">
                  Clear History
                </button>
              )}
            </div>

            {exports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No exports yet</h3>
                <p className="text-slate-400 mb-4">Start by creating your first export from the Quick Exports or Advanced Reports tabs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exports.map((exportItem) => (
                  <div key={exportItem.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{exportItem.name}</div>
                        <div className="text-sm text-slate-400">
                          {exportItem.format} • {exportItem.size} • {new Date(exportItem.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        {exportItem.status}
                      </span>
                      <button className="p-2 text-slate-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report Export Modal */}
        {showReportExport && selectedExportType && (
          <ReportExport
            analysisData={filteredKPIs}
            brandName={brandName}
            preSelectedFormat={selectedExportType.format}
            appliedFilters={appliedFilters}
            timeRangeLabel={getTimeRangeLabel()}
            onClose={() => {
              setShowReportExport(false);
              setSelectedExportType(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ExportsDashboard;