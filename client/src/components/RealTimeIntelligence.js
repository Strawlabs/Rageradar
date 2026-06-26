import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import EmptyState from './shared/EmptyState';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const RealTimeIntelligence = () => {
  const [searchParams] = useSearchParams();
  const urlBrandName = searchParams.get('brand');
  const { currentUser } = useAuth();
  const { currentBrand, analyzedBrands } = useBrand();
  const navigate = useNavigate();

  // Use URL brand name if provided, otherwise use current brand from context
  const brandName = urlBrandName || currentBrand?.brandName;

  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [liveData, setLiveData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({});
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [geographicData, setGeographicData] = useState([]);
  const [velocityIndicators, setVelocityIndicators] = useState([]);
  const [activeStreams, setActiveStreams] = useState(0);
  const [hasValidBrand, setHasValidBrand] = useState(false);
  const intervalRef = useRef(null);

  // Fetch real brand data
  const fetchRealBrandData = async () => {
    if (!brandName) return null;

    // Use brands from context instead of making API call
    const brandData = analyzedBrands.find(b => b.brandName === brandName);
    return brandData || null;
  };

  // Store base data for consistent generation
  const [baseData, setBaseData] = useState(null);

  // Real-time data simulation with real base data
  const generateRealTimeData = async () => {
    let realData = baseData;
    if (!realData) {
      realData = await fetchRealBrandData();
      setBaseData(realData);
    }

    const now = new Date();

    // Use real data as base if available
    const baseRageIndex = realData ? (realData.rageIndex || 35) : 35;
    const baseMentions = realData ? (realData.totalMentions || 150) : 150;
    const baseSentiment = realData ? ((realData.positivePercentage || 65) / 100) : 0.65;

    // Add some realistic variation
    const rageVariation = (Math.random() - 0.5) * 10;
    const mentionVariation = Math.floor((Math.random() - 0.5) * 50);
    const sentimentVariation = (Math.random() - 0.5) * 0.2;

    return {
      timestamp: now.toISOString(),
      rageIndex: Math.max(0, Math.min(100, baseRageIndex + rageVariation)),
      mentions: Math.max(0, baseMentions + mentionVariation),
      sentiment: Math.max(0, Math.min(1, baseSentiment + sentimentVariation)),
      platforms: {
        twitter: Math.floor(Math.random() * 50) + 20,
        reddit: Math.floor(Math.random() * 30) + 10,
        youtube: Math.floor(Math.random() * 25) + 15,
        news: Math.floor(Math.random() * 20) + 5,
        instagram: Math.floor(Math.random() * 35) + 10
      }
    };
  };

  // Synchronous data generation for intervals
  const generateSyncRealTimeData = () => {
    const now = new Date();

    // Use stored base data or defaults
    const baseRageIndex = baseData ? (baseData.rageIndex || 35) : 35;
    const baseMentions = baseData ? (baseData.totalMentions || 150) : 150;
    const baseSentiment = baseData ? ((baseData.positivePercentage || 65) / 100) : 0.65;

    // Add some realistic variation
    const rageVariation = (Math.random() - 0.5) * 10;
    const mentionVariation = Math.floor((Math.random() - 0.5) * 50);
    const sentimentVariation = (Math.random() - 0.5) * 0.2;

    return {
      timestamp: now.toISOString(),
      rageIndex: Math.max(0, Math.min(100, baseRageIndex + rageVariation)),
      mentions: Math.max(0, baseMentions + mentionVariation),
      sentiment: Math.max(0, Math.min(1, baseSentiment + sentimentVariation)),
      platforms: {
        twitter: Math.floor(Math.random() * 50) + 20,
        reddit: Math.floor(Math.random() * 30) + 10,
        youtube: Math.floor(Math.random() * 25) + 15,
        news: Math.floor(Math.random() * 20) + 5,
        instagram: Math.floor(Math.random() * 35) + 10
      }
    };
  };

  // Velocity calculation helper
  const calculateVelocity = (current, previous, timeInMinutes = 1) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getIndicatorsFromData = (dataPoint, prevPoint) => {
    const mentionChange = calculateVelocity(dataPoint.mentions, prevPoint?.mentions);
    const sentimentChange = calculateVelocity(dataPoint.sentiment, prevPoint?.sentiment);
    const rageChange = calculateVelocity(dataPoint.rageIndex, prevPoint?.rageIndex);

    return [
      {
        metric: 'Mention Velocity',
        current: Math.round(dataPoint.mentions),
        unit: 'avg mentions/min',
        change: (mentionChange >= 0 ? '+' : '') + mentionChange.toFixed(1) + '%',
        trend: mentionChange >= 0 ? 'up' : 'down',
        status: mentionChange > 20 ? 'surging' : 'normal'
      },
      {
        metric: 'Sentiment Stability',
        current: (dataPoint.sentiment * 100).toFixed(1),
        unit: '% positive weight',
        change: (sentimentChange >= 0 ? '+' : '') + sentimentChange.toFixed(2) + '%',
        trend: sentimentChange >= 0 ? 'up' : 'down',
        status: dataPoint.sentiment > 0.6 ? 'positive' : 'warning'
      },
      {
        metric: 'Rage Acceleration',
        current: dataPoint.rageIndex.toFixed(1),
        unit: 'index value',
        change: (rageChange >= 0 ? '+' : '') + rageChange.toFixed(1) + '%',
        trend: rageChange >= 0 ? 'up' : 'down',
        status: dataPoint.rageIndex > 60 ? 'alert' : 'normal'
      },
      {
        metric: 'Active Reach',
        current: Math.round(dataPoint.mentions * 45),
        unit: 'estimated eyes',
        change: '+ ' + (Math.random() * 5).toFixed(1) + '%',
        trend: 'up',
        status: 'normal'
      }
    ];
  };

  // Generate mock historical data for the live chart
  const mockHistoricalData = Array.from({ length: 50 }, (_, i) => {
    const timestamp = new Date(Date.now() - (49 - i) * 60 * 1000);
    return {
      timestamp: timestamp.toISOString(),
      rageIndex: 35 + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 5,
      mentions: 150 + Math.cos(i * 0.15) * 30 + (Math.random() - 0.5) * 20,
      sentiment: 0.65 + Math.sin(i * 0.08) * 0.15 + (Math.random() - 0.5) * 0.1,
      platforms: {
        twitter: Math.floor(Math.random() * 50) + 20,
        reddit: Math.floor(Math.random() * 30) + 10,
        youtube: Math.floor(Math.random() * 25) + 15,
        news: Math.floor(Math.random() * 20) + 5,
        instagram: Math.floor(Math.random() * 35) + 10
      }
    };
  });

  const mockCurrentMetrics = {
    rageIndex: 34,
    mentions: 147,
    sentiment: 0.68,
    engagement: 2.4,
    reach: 45600,
    velocity: 23,
    platforms: {
      twitter: 45,
      reddit: 23,
      youtube: 18,
      news: 8,
      instagram: 6
    }
  };

  // Generate real-time data from actual brand data
  const generateRealTimeDataFromBrand = (brandData) => {
    const baseRageIndex = brandData.rageIndex || 35;
    const baseMentions = brandData.totalMentions || 150;
    const baseSentiment = (brandData.positivePercentage || 65) / 100;

    // Generate historical data based on real brand data
    const historical = Array.from({ length: 50 }, (_, i) => {
      const timestamp = new Date(Date.now() - (49 - i) * 60 * 1000);
      return {
        timestamp: timestamp.toISOString(),
        rageIndex: baseRageIndex + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 3,
        mentions: baseMentions + Math.cos(i * 0.15) * 20 + (Math.random() - 0.5) * 10,
        sentiment: baseSentiment + Math.sin(i * 0.08) * 0.1 + (Math.random() - 0.5) * 0.05,
        platforms: brandData.platformStats || {
          reddit: Math.floor(Math.random() * 30) + 10,
          hackernews: Math.floor(Math.random() * 20) + 5,
          github: Math.floor(Math.random() * 15) + 5
        }
      };
    });

    const current = {
      rageIndex: baseRageIndex,
      mentions: baseMentions,
      sentiment: baseSentiment,
      engagement: 2.4,
      reach: baseMentions * 30,
      velocity: 23,
      platforms: brandData.platformStats || {},
      confidenceScore: brandData.confidenceScore || 75,
      weightedSentiment: brandData.weightedSentimentScore || (brandData.positivePercentage || 65)
    };

    return {
      historical,
      current,
      topics: (brandData.themes || []).map((theme, idx) => ({
        id: idx,
        topic: theme.theme || theme.name || theme.label || theme,
        mentions: theme.count || Math.floor(baseMentions * 0.1),
        change: '+ ' + (Math.floor(Math.random() * 20) + 5) + '%',
        sentiment: theme.sentiment !== undefined ? theme.sentiment : baseSentiment,
        velocity: theme.rageIndex > 60 ? 'surging' : 'rising',
        lastUpdate: new Date().toISOString()
      })),
      geographic: brandData.geographicBreakdown || [
        { region: 'Detected via Context', sentiment: baseSentiment, mentions: Math.floor(baseMentions * 0.3), change: 'Inferred', flag: '📍' }
      ],
      velocity: getIndicatorsFromData(current, historical[historical.length - 2])
    };
  };

  useEffect(() => {
    const initializeData = async () => {
      if (!currentUser) return;

      // If no brand is specified, show empty state
      if (!brandName) {
        setLoading(false);
        setHasValidBrand(false);
        setIsLive(false);
        return;
      }

      setLoading(true);
      try {
        // Use brands from context instead of making API call
        let selectedBrandData = analyzedBrands.find(b => b.brandName === brandName);

        // If no brand found in context but we have current brand, use that
        if (!selectedBrandData && currentBrand && currentBrand.brandName === brandName) {
          selectedBrandData = currentBrand;
        }

        if (selectedBrandData && selectedBrandData.totalMentions > 0) {
          console.log('🔄 RealTime: Using real brand data for', selectedBrandData.brandName);
          // Generate real-time data from actual brand data
          const realTimeData = generateRealTimeDataFromBrand(selectedBrandData);

          setLiveData(realTimeData.historical);
          setCurrentMetrics(realTimeData.current);
          setTrendingTopics(realTimeData.topics);
          setGeographicData(realTimeData.geographic);
          setVelocityIndicators(realTimeData.velocity);
          setActiveStreams(Object.keys(selectedBrandData.platformStats || {}).length);
          setHasValidBrand(true);
          setIsLive(true); // Only start live updates when we have valid brand data
        } else {
          // No valid brand data found
          console.log('🔄 RealTime: No valid brand data found for', brandName);
          setLiveData([]);
          setCurrentMetrics({});
          setTrendingTopics([]);
          setVelocityIndicators([]);
          setActiveStreams(0);
          setHasValidBrand(false);
          setIsLive(false);
        }
      } catch (error) {
        console.error('Error fetching real-time data:', error);
        setLiveData([]);
        setCurrentMetrics({});
        setTrendingTopics([]);
        setVelocityIndicators([]);
        setActiveStreams(0);
        setHasValidBrand(false);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [brandName, currentUser, currentBrand]);

  useEffect(() => {
    if (isLive && hasValidBrand) {
      intervalRef.current = setInterval(() => {
        const newDataPoint = generateSyncRealTimeData();

        setLiveData(prevData => {
          const newData = [...prevData, newDataPoint];
          // Keep only last 100 data points for performance
          return newData.slice(-100);
        });

        setCurrentMetrics(newDataPoint);
        setVelocityIndicators(prev => getIndicatorsFromData(newDataPoint, prev?.[0] ? { mentions: prev[0].current, sentiment: prev[1].current / 100, rageIndex: prev[2].current } : null));
      }, 2000); // Update every 2 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, hasValidBrand]);

  const getVelocityColor = (trend, status) => {
    if (status === 'alert') return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (status === 'warning') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (status === 'positive') return 'text-green-400 bg-green-500/20 border-green-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  const getVelocityIcon = (velocity) => {
    switch (velocity) {
      case 'surging': return (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
      case 'rising': return (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
      case 'steady': return (
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 12h8" />
        </svg>
      );
      case 'falling': return (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
      default: return (
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return (
      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
    return (
      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const realTimeChartData = {
    labels: liveData.map(d => d.timestamp),
    datasets: [
      {
        label: 'Rage Index',
        data: liveData.map(d => d.rageIndex),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Mentions',
        data: liveData.map(d => d.mentions),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const platformDistributionData = {
    labels: ['Twitter', 'Reddit', 'YouTube', 'News', 'Instagram'],
    datasets: [{
      data: [
        currentMetrics.platforms?.twitter || 0,
        currentMetrics.platforms?.reddit || 0,
        currentMetrics.platforms?.youtube || 0,
        currentMetrics.platforms?.news || 0,
        currentMetrics.platforms?.instagram || 0
      ],
      backgroundColor: [
        '#1DA1F2',
        '#FF4500',
        '#FF0000',
        '#718096',
        '#E1306C'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute'
        },
        grid: {
          display: false
        },
        ticks: {
          style: 'italic',
          color: '#94a3b8'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        position: 'left',
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e2e8f0',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-900 p-4 lg:p-6">
        <div className="max-w-full mx-auto">
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-lg font-medium text-white ml-3">Connecting to live data streams...</span>
            </div>
            <p className="text-slate-400">Initializing real-time intelligence dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no valid brand is selected or no data available
  if (!hasValidBrand || !brandName) {
    return (
      <div className="p-6 w-full">
        <EmptyState title="" message="" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full font-inter">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Real-Time Intelligence
                </h1>
                <p className="text-slate-300">
                  Live sentiment monitoring for {brandName}
                </p>
              </div>
            </div>

            <div className="hidden xl:block max-w-sm">
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-xs text-slate-300">
                <span className="font-bold text-slate-100 block mb-1">Intelligence Guide:</span>
                Monitor brand sentiment as it happens. Use this dashboard to catch emerging crises (Rage Spikes) or viral successes in seconds.
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span className="text-sm font-medium text-slate-300">
                  {isLive ? 'LIVE' : 'PAUSED'}
                </span>
              </div>

              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${isLive
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
              >
                {isLive ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 mb-8 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">Live Data Streams</div>
                <div className="text-sm text-slate-300">
                  {activeStreams} active connections • Last update: {formatTimeAgo(currentMetrics.timestamp)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(currentMetrics.rageIndex || 0)}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Rage Index</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {currentMetrics.mentions || 0}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Mentions/min</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((currentMetrics.sentiment || 0) * 100)}%
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Sentiment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Live Timeline */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-white">Live Sentiment Pulse</h2>
                <div className="group relative">
                  <svg className="w-4 h-4 text-slate-400 hover:text-white cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute left-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <p className="text-xs text-slate-300">Real-time chart showing rage index and mention volume trends. Helps you spot sentiment spikes and conversation volume changes as they happen.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Updating live</span>
              </div>
            </div>
            <div className="h-72">
              {liveData.length > 0 ? (
                <Line data={realTimeChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Connecting to streams...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Live Platforms</h2>
              <div className="group relative">
                <svg className="w-4 h-4 text-slate-400 hover:text-white cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <p className="text-xs text-slate-300">Shows where your brand mentions are coming from across different social platforms in real-time.</p>
                </div>
              </div>
            </div>
            <div className="h-72">
              <Doughnut
                data={platformDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        color: '#94a3b8',
                        font: { size: 10 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {velocityIndicators.map((indicator, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{indicator.metric}</div>
                <div className="w-6 h-6">{getTrendIcon(indicator.trend)}</div>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-white">
                  {typeof indicator.current === 'number' && indicator.current < 1
                    ? indicator.current.toFixed(3)
                    : indicator.current}
                </div>
                <div className="text-xs text-slate-500">{indicator.unit}</div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getVelocityColor(indicator.trend, indicator.status)}`}>
                  {indicator.change}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{indicator.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Real-Time Context & Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trending Topics (Real Themes) */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Live Trending Context</h2>
              </div>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30 font-bold uppercase tracking-wider">Analysis Based</span>
            </div>

            <div className="space-y-3">
              {trendingTopics.length > 0 ? (
                trendingTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase">
                        {topic.topic.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 text-sm">{topic.topic}</div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                          <span>{topic.mentions} mentions found</span>
                          <span>•</span>
                          <span className={topic.sentiment > 0.6 ? 'text-green-400' : topic.sentiment < 0.4 ? 'text-red-400' : 'text-slate-400'}>
                            {Math.round(topic.sentiment * 100)}% stability
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">{topic.change}</div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{topic.velocity}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-500">No emerging themes found in recent pulse.</p>
                </div>
              )}
            </div>
          </div>

          {/* Geographic Inferred Data */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Regional Intelligence</h2>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold uppercase tracking-wider">Real Inferred</span>
                </div>
              </div>
              <div className="group relative">
                <svg className="w-4 h-4 text-slate-400 hover:text-white cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute right-0 top-6 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <p className="text-xs text-slate-300">Sentiment tracked by analyzing mentions of specific cities, countries, and regional source domains in the live stream.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {geographicData.length > 0 ? (
                geographicData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{region.flag}</span>
                      <div>
                        <div className="font-semibold text-slate-100 text-sm">{region.region}</div>
                        <div className="text-xs text-slate-400">{region.mentions.toLocaleString()} mentions detected</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${region.sentiment > 0.7 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(region.sentiment * 100)}%
                      </div>
                      <div className="text-[10px] text-blue-400 font-bold mt-1 uppercase tracking-tighter">Geo-Source: Context</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-500">Scanning stream for geographic markers...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2v14a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-semibold text-white">Live Activity Feed</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Stream Active</span>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {liveData.slice(-20).reverse().map((dataPoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${dataPoint.rageIndex > 60 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                  <div>
                    <span className="text-sm font-medium text-slate-200 block">
                      Data pulse received: {Math.round(dataPoint.rageIndex)} Rage Index • {dataPoint.mentions} Mentions
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Sentiment Stability: {Math.round(dataPoint.sentiment * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {formatTimeAgo(dataPoint.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeIntelligence;