import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs, formatNumber, getTrendIndicator } from '../utils/kpiCalculations';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import BrandHistory from './BrandHistory';
import LiveSentimentChart from './LiveSentimentChart';
import ColorfulWidget from './shared/ColorfulWidget';
import PageHeader from './shared/PageHeader';
import BrandLogo from './shared/BrandLogo';
import { capitalizeBrandName } from '../utils/brandUtils';
import AnalyzeBrandButton from './shared/AnalyzeBrandButton';
import EmptyState from './shared/EmptyState';
import axios from 'axios';
import {
  TrendingUp,
  Activity,
  Users,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Zap,
  Target,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  ChevronDown,
  Calendar,
  Filter,
  Clock,
  ExternalLink,
  Brain,
  Radio,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

// ─── Severity Band ────────────────────────────────────────────────────────────
const SEVERITY_BANDS = [
  { label: 'Minimal', min: 0,  max: 19, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  { label: 'Low',     min: 20, max: 39, color: 'bg-yellow-400',  text: 'text-yellow-700 dark:text-yellow-400',  bg: 'bg-yellow-50 dark:bg-yellow-950'  },
  { label: 'Moderate',min: 40, max: 59, color: 'bg-orange-500',  text: 'text-orange-700 dark:text-orange-400',  bg: 'bg-orange-50 dark:bg-orange-950'  },
  { label: 'High',    min: 60, max: 79, color: 'bg-red-500',     text: 'text-red-700 dark:text-red-400',        bg: 'bg-red-50 dark:bg-red-950'        },
  { label: 'Critical',min: 80, max: 100,color: 'bg-red-800',     text: 'text-red-900 dark:text-red-300',        bg: 'bg-red-100 dark:bg-red-900/40'    },
];

const getSeverityBand = (score) => SEVERITY_BANDS.find(b => score >= b.min && score <= b.max) || SEVERITY_BANDS[0];

const RageIndexSeverityBand = ({ rageIndex }) => {
  const active = getSeverityBand(rageIndex);
  return (
    <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-muted">
      {SEVERITY_BANDS.map((band) => {
        const isActive = band.label === active.label;
        return (
          <div
            key={band.label}
            title={`${band.label}: ${band.min}–${band.max}`}
            className={`flex-1 py-1.5 text-center text-[10px] font-semibold transition-all duration-300 ${
              isActive
                ? `${band.color} text-white shadow-sm scale-y-110`
                : 'bg-muted text-muted-foreground opacity-50'
            }`}
          >
            {band.label}
          </div>
        );
      })}
    </div>
  );
};

// ─── Live Mention Ticker ──────────────────────────────────────────────────────
const PLATFORM_COLORS = {
  twitter: 'text-blue-400', reddit: 'text-orange-400', youtube: 'text-red-400',
  facebook: 'text-blue-600', instagram: 'text-pink-400', tiktok: 'text-purple-400',
  linkedin: 'text-indigo-400', news: 'text-slate-400', default: 'text-slate-400',
};

const MentionTicker = ({ mentions }) => {
  const tickerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const items = (mentions || []).slice(0, 12);
  if (items.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-muted/30 border border-muted"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div
        ref={tickerRef}
        className={`flex gap-4 py-2 px-4 ${ isPaused ? '' : 'animate-[ticker_30s_linear_infinite]' }`}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {[...items, ...items].map((mention, idx) => {
          const platformColor = PLATFORM_COLORS[mention.platform] || PLATFORM_COLORS.default;
          const rageScore = mention.rageIndex || mention.rageScore || 0;
          const bandColor = getSeverityBand(rageScore).color;
          return (
            <div key={idx} className="flex items-center gap-2 shrink-0 max-w-xs">
              <span className={`text-xs font-semibold uppercase ${platformColor}`}>{mention.platform || 'web'}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                {(mention.text || mention.content || '').slice(0, 70)}{(mention.text || mention.content || '').length > 70 ? '…' : ''}
              </span>
              {rageScore > 0 && (
                <span className={`inline-block w-2 h-2 rounded-full ${bandColor} shrink-0`} title={`Rage: ${rageScore}`} />
              )}
              <span className="text-muted-foreground/40 shrink-0">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CleanModernDashboard = () => {
  const { currentUser } = useAuth();
  const { analyzedBrands, currentBrand, selectBrand, loading: brandLoading } = useBrand();
  const { filters, updateFilter } = useFilters();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Handle navigation state and brand selection
  useEffect(() => {
    // Handle new analysis data from AnalysisPage
    if (location.state?.newAnalysis && location.state?.brandName) {
      setSuccessMessage(`✅ Analysis complete for ${location.state.brandName}!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      navigate(location.pathname, { replace: true });
    }

    // Handle brand selection from history
    if (location.state?.selectedBrand && location.state?.fromHistory) {
      selectBrand(location.state.selectedBrand);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, selectBrand]);

  // Update dashboard data when current brand changes
  useEffect(() => {
    console.log('🔍 Dashboard: currentBrand:', currentBrand);
    console.log('🔍 Dashboard: analyzedBrands:', analyzedBrands);
    console.log('🔍 Dashboard: brandLoading:', brandLoading);
    console.log('⏰ Dashboard: timeRange:', filters.timeRange);

    if (currentBrand) {
      console.log('✅ Dashboard: Loading data for brand:', currentBrand.brandName);
      console.log('📊 Original brand data:', {
        totalMentions: currentBrand.totalMentions,
        rageIndex: currentBrand.rageIndex,
        positivePercentage: currentBrand.positivePercentage
      });

      const kpiData = calculateKPIData(currentBrand);
      setDashboardData(kpiData);

      // Log the adjusted data for debugging
      const adjustedData = getTimeAdjustedData(currentBrand);
      console.log('🎯 Adjusted data:', adjustedData);
    } else if (analyzedBrands.length === 0 && !brandLoading) {
      console.log('❌ Dashboard: No brands found, showing empty state');
      setDashboardData(getEmptyStateData());
    }
    setLoading(false);
  }, [currentBrand, analyzedBrands, brandLoading, filters.timeRange, filters.platform, filters.sentiment]);

  // Get time-adjusted brand data
  const getTimeAdjustedData = (brand) => {
    if (!brand) return null;

    // Use shared KPI calculation for consistency across all components
    const kpis = calculateKPIs(brand, filters);

    console.log(`🔍 Brand: ${brand.brandName || 'Unknown'}, Time Range: ${filters.timeRange}`);
    console.log(`📊 Shared KPIs:`, kpis);

    return {
      rageIndex: kpis.rageIndex,
      totalMentions: kpis.totalMentions,
      positivePercentage: kpis.averageSentiment,
      confidenceScore: kpis.confidenceScore
    };
  };

  // Calculate KPI data from brand analysis with time range
  const calculateKPIData = (brand) => {
    if (!brand) {
      return getEmptyStateData();
    }

    const adjustedData = getTimeAdjustedData(brand);
    const rageIndex = adjustedData.rageIndex;
    const totalMentions = adjustedData.totalMentions;
    const sentimentScore = adjustedData.positivePercentage;
    const weightedScore = Math.round(Math.max(0, Math.min(100, sentimentScore + (filters.timeRange === '90d' ? 5 : filters.timeRange === '30d' ? 3 : filters.timeRange === '24h' ? -2 : 0))));
    const confidenceScore = adjustedData.confidenceScore;
    const activeAlerts = brand.rageAlert ? (brand.cautionAlert ? 2 : 1) : 0;

    // Time range context for display
    const timeRangeLabel = {
      '24h': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days'
    }[filters.timeRange] || 'Last 7 days';

    return [
      {
        title: 'Rage Index',
        value: `${rageIndex}%`,
        change: filters.timeRange === '24h' ? '+3.2%' : filters.timeRange === '7d' ? '-0.8%' : filters.timeRange === '30d' ? '-1.8%' : '-2.5%',
        trend: filters.timeRange === '24h' ? 'up' : filters.timeRange === '7d' ? 'down' : filters.timeRange === '30d' ? 'down' : 'down',
        icon: Activity,
        color: rageIndex > 50 ? 'text-red-600' : rageIndex > 30 ? 'text-orange-600' : rageIndex === 0 ? 'text-gray-600' : 'text-green-600',
        bgColor: rageIndex > 50 ? 'bg-red-50 dark:bg-red-950' : rageIndex > 30 ? 'bg-orange-50 dark:bg-orange-950' : rageIndex === 0 ? 'bg-gray-50 dark:bg-gray-950' : 'bg-green-50 dark:bg-green-950',
        description: `Negative sentiment (${timeRangeLabel})`,
        tooltip: 'How angry or upset people are about your brand'
      },
      {
        title: 'Total Mentions',
        value: totalMentions.toLocaleString(),
        change: filters.timeRange === '24h' ? '-85.0%' : filters.timeRange === '7d' ? '+15.2%' : filters.timeRange === '30d' ? '+220.0%' : '+450.0%',
        trend: filters.timeRange === '24h' ? 'down' : filters.timeRange === '7d' ? 'up' : filters.timeRange === '30d' ? 'up' : 'up',
        icon: MessageSquare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        description: `Mentions found (${timeRangeLabel})`,
        tooltip: 'How many times people talked about your brand online'
      },
      {
        title: 'Sentiment Score',
        value: `${sentimentScore}%`,
        change: filters.timeRange === '24h' ? '-2.1%' : filters.timeRange === '7d' ? '+1.4%' : filters.timeRange === '30d' ? '+5.3%' : '+8.7%',
        trend: filters.timeRange === '24h' ? 'down' : filters.timeRange === '7d' ? 'up' : filters.timeRange === '30d' ? 'up' : 'up',
        icon: TrendingUp,
        color: sentimentScore > 70 ? 'text-green-600' : sentimentScore > 50 ? 'text-yellow-600' : 'text-red-600',
        bgColor: sentimentScore > 70 ? 'bg-green-50 dark:bg-green-950' : sentimentScore > 50 ? 'bg-yellow-50 dark:bg-yellow-950' : 'bg-red-50 dark:bg-red-950',
        description: `Enhanced sentiment (${timeRangeLabel})`,
        tooltip: 'Overall happiness score - how people feel about your brand'
      },
      {
        title: 'Confidence Score',
        value: `${confidenceScore}%`,
        change: filters.timeRange === '24h' ? '-8.0%' : filters.timeRange === '7d' ? '+3.5%' : filters.timeRange === '30d' ? '+12.0%' : '+18.5%',
        trend: filters.timeRange === '24h' ? 'down' : filters.timeRange === '7d' ? 'up' : filters.timeRange === '30d' ? 'up' : 'up',
        icon: Activity,
        color: confidenceScore > 80 ? 'text-green-600' : confidenceScore > 60 ? 'text-blue-600' : 'text-yellow-600',
        bgColor: confidenceScore > 80 ? 'bg-green-50 dark:bg-green-950' : confidenceScore > 60 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-yellow-50 dark:bg-yellow-950',
        description: `Analysis reliability (${timeRangeLabel})`,
        tooltip: 'How reliable this data is - higher means more trustworthy'
      }
    ];
  };

  // Empty state data for new users
  const getEmptyStateData = () => [
    {
      title: 'Rage Index',
      value: '0%',
      change: 'No data',
      trend: 'neutral',
      icon: Activity,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      description: 'Analyze a brand to see sentiment',
      tooltip: 'How angry or upset people are about your brand'
    },
    {
      title: 'Total Mentions',
      value: '0',
      change: 'No data',
      trend: 'neutral',
      icon: MessageSquare,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      description: 'No mentions found yet',
      tooltip: 'How many times people talked about your brand online'
    },
    {
      title: 'Sentiment Score',
      value: '0%',
      change: 'No data',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      description: 'Analyze a brand to see sentiment',
      tooltip: 'Overall happiness score - how people feel about your brand'
    },
    {
      title: 'Active Alerts',
      value: '0',
      change: 'No data',
      trend: 'neutral',
      icon: AlertTriangle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      description: 'No alerts configured',
      tooltip: 'Important warnings when people get really upset about your brand'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return ArrowUpRight;
      case 'down': return ArrowDownRight;
      default: return Minus;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full bg-background">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-lg font-medium text-muted-foreground">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full bg-background">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Failed to Load Dashboard</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <div className="p-6 space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-green-700 dark:text-green-400 font-medium text-center">
              {successMessage}
            </p>
          </div>
        )}

        {/* Show EmptyState if no brand selected, otherwise show dashboard */}
        {!currentBrand ? (
          <EmptyState title="" message="" />
        ) : (
          <>
            {/* Enhanced Header with Brand Selector */}
            <div className="space-y-4">
              <PageHeader
                title="Dashboard"
                subtitle={`Welcome back, ${currentUser?.displayName?.split(' ')[0] || 'User'}! Here's what's happening with ${capitalizeBrandName(currentBrand.brandName)} sentiment.`}
                icon={<BarChart3 className="w-6 h-6" />}
                iconColor="text-blue-600"
              >
              </PageHeader>

              {/* Brand Selector and Time Range Controls */}
              {currentBrand && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Brand Selector Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <BrandLogo brandName={currentBrand.brandName} size="sm" />
                        <span className="font-medium">{capitalizeBrandName(currentBrand.brandName)}</span>
                        {analyzedBrands.length > 1 && (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {showBrandDropdown && analyzedBrands.length > 1 && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-lg shadow-lg z-50">
                          <div className="p-2 max-h-64 overflow-y-auto">
                            {analyzedBrands.map((brand, index) => (
                              <button
                                key={`${brand.brandName}-${index}`}
                                onClick={() => {
                                  selectBrand(brand);
                                  setShowBrandDropdown(false);
                                }}
                                className={`w-full p-3 text-left rounded-lg transition-colors ${currentBrand?.brandName === brand.brandName
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-muted'
                                  }`}
                              >
                                <div className="font-medium flex items-center gap-2">
                                  <BrandLogo brandName={brand.brandName} size="sm" />
                                  {capitalizeBrandName(brand.brandName)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {brand.totalMentions || 0} mentions • {Math.round(brand.positivePercentage || 0)}% positive
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time Range Selector - Matching FilterBar Design */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Time Range:</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { value: '24h', label: 'Last 24 Hours' },
                          { value: '7d', label: 'Last 7 Days' },
                          { value: '30d', label: 'Last 30 Days' },
                          { value: '90d', label: 'Last 90 Days' }
                        ].map((range) => (
                          <button
                            key={range.value}
                            onClick={() => updateFilter('timeRange', range.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${filters.timeRange === range.value
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
                              }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Range Info */}
                    <div className="text-sm text-muted-foreground">
                      Showing data for {
                        filters.timeRange === '24h' ? 'last 24 hours' :
                          filters.timeRange === '7d' ? 'last 7 days' :
                            filters.timeRange === '30d' ? 'last 30 days' :
                              'last 90 days'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Brand History Panel */}
            {showHistoryPanel && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Brand Analysis History
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistoryPanel(false)}
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BrandHistory compact={true} />
                </CardContent>
              </Card>
            )}


            {/* Enhanced KPI Cards with Colorful Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {dashboardData && dashboardData.map((kpi, index) => {
                const Icon = kpi.icon;

                // Map KPI titles to gradient colors
                const getGradientColor = (title) => {
                  switch (title.toLowerCase()) {
                    case 'rage index': return 'red';
                    case 'total mentions': return 'blue';
                    case 'sentiment score': return 'green';
                    case 'confidence score': return 'purple';
                    case 'active alerts': return 'orange';
                    default: return 'blue';
                  }
                };

                // Create icon element for ColorfulWidget
                const iconElement = <Icon className="w-5 h-5" />;

                return (
                  <ColorfulWidget
                    key={index}
                    title={kpi.title}
                    value={kpi.value}
                    icon={iconElement}
                    color={getGradientColor(kpi.title)}
                    size="medium"
                    className="hover:scale-105 transition-transform duration-200"
                    onClick={() => {
                      // Add click handlers for navigation if needed
                      if (kpi.title === 'Total Mentions') {
                        navigate('/dashboard/mentions');
                      } else if (kpi.title === 'Active Alerts') {
                        navigate('/dashboard/alerts');
                      }
                    }}
                  />
                );
              })}
            </div>

            {/* Live Widgets - Moved to Top */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5" />
                    Live Sentiment Pulse
                    {currentBrand && (
                      <Badge variant="outline" className="text-xs animate-pulse">
                        LIVE
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground italic">
                    How people feel about your brand right now
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      {currentBrand ? (() => {
                        const adjustedData = getTimeAdjustedData(currentBrand);
                        return (
                          <>
                            <div className="text-4xl font-bold text-green-600 mb-2">
                              {adjustedData.positivePercentage}%
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">Positive sentiment</p>
                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {adjustedData.positivePercentage}% Positive
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                {adjustedData.rageIndex}% Negative
                              </span>
                            </div>
                          </>
                        );
                      })() : (
                        <>
                          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Analyze a brand to see live sentiment
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5" />
                    Mentions Volume
                  </CardTitle>
                  <p className="text-xs text-muted-foreground italic">
                    How many times people talked about your brand
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      {currentBrand ? (() => {
                        const adjustedData = getTimeAdjustedData(currentBrand);
                        return (
                          <>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                              {adjustedData.totalMentions.toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">Total mentions</p>
                            <div className="text-xs text-muted-foreground">
                              {filters.timeRange === '24h' ? 'Last 24 hours' :
                                filters.timeRange === '7d' ? 'Last 7 days' :
                                  'Last 30 days'}
                            </div>
                          </>
                        );
                      })() : (
                        <>
                          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            No mentions data yet
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column - Sentiment Trend Chart */}
              <div className="xl:col-span-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Sentiment Trend
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dashboard/reports/analysis')}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentBrand ? (
                      <div className="h-80">
                        <LiveSentimentChart
                          brandData={currentBrand}
                          timeRange={filters.timeRange}
                        />
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                        <div className="text-center space-y-3">
                          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-foreground">No Data Available</p>
                            <p className="text-sm text-muted-foreground">
                              Analyze your first brand to see sentiment trends over time
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/analysis')}
                          >
                            Start Your First Analysis
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Platform Distribution Chart */}
              <div className="xl:col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-5 h-5" />
                          Platform Distribution
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          Where people are talking about your brand (Twitter, Reddit, etc.)
                        </p>
                      </div>
                      {currentBrand && (
                        <div className="text-right">
                          <div className="text-lg font-semibold text-foreground">
                            {(() => {
                              const adjustedData = getTimeAdjustedData(currentBrand);
                              return adjustedData.totalMentions.toLocaleString();
                            })()}
                            <span className="text-sm font-normal text-muted-foreground ml-1">mentions</span>
                          </div>
                          {currentBrand.platformStats && (
                            <div className="text-xs text-muted-foreground">
                              {Object.keys(currentBrand.platformStats).length} platforms found
                            </div>
                          )}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentBrand ? (
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-center justify-between py-2 px-3 text-xs font-medium text-muted-foreground border-b border-muted">
                          <div className="flex-1">Platform</div>
                          <div className="flex-1 max-w-[200px] text-center">Distribution</div>
                          <div className="flex items-center gap-4 text-right">
                            <span className="min-w-[60px]">Mentions</span>
                            <span className="min-w-[35px]">Share</span>
                          </div>
                        </div>

                        {/* Platform breakdown - adjusted for time range */}
                        {(() => {
                          // Use the same data source as KPI cards for consistency (shared KPIs handle time adjustments)
                          const adjustedData = getTimeAdjustedData(currentBrand);
                          const adjustedMentions = adjustedData.totalMentions;

                          // Use actual platform data from search results if available
                          const actualPlatformStats = currentBrand.platformStats || {};
                          const totalActualMentions = Object.values(actualPlatformStats).reduce((sum, count) => sum + count, 0);

                          // Platform color mapping
                          const platformColors = {
                            'twitter': 'bg-blue-500',
                            'reddit': 'bg-orange-500',
                            'facebook': 'bg-blue-600',
                            'instagram': 'bg-pink-500',
                            'youtube': 'bg-red-500',
                            'tiktok': 'bg-purple-500',
                            'linkedin': 'bg-indigo-500',
                            'trustpilot': 'bg-green-500',
                            'glassdoor': 'bg-teal-500',
                            'amazon': 'bg-yellow-600',
                            'yelp': 'bg-red-600',
                            'g2': 'bg-blue-700',
                            'medium': 'bg-gray-800',
                            'quora': 'bg-red-700',
                            'producthunt': 'bg-orange-600',
                            'techcrunch': 'bg-green-600',
                            'hackernews': 'bg-orange-700',
                            'stackoverflow': 'bg-orange-400',
                            'appstore': 'bg-blue-400',
                            'playstore': 'bg-green-400'
                          };

                          let platformData;

                          if (totalActualMentions > 0) {
                            // Use real platform data from search results
                            platformData = Object.entries(actualPlatformStats)
                              .map(([platform, count]) => ({
                                name: platform.charAt(0).toUpperCase() + platform.slice(1),
                                actualCount: count,
                                percentage: Math.round((count / totalActualMentions) * 100),
                                color: platformColors[platform.toLowerCase()] || 'bg-gray-500'
                              }))
                              .sort((a, b) => b.actualCount - a.actualCount); // Sort by mention count - show ALL platforms
                          } else {
                            // No platform data available - empty state
                            platformData = [];
                          }

                          // Calculate mentions for each platform, ensuring they add up correctly
                          const platforms = platformData.map((platform, index) => {
                            let mentions;
                            let actualPercentage;

                            if (platform.actualCount !== undefined) {
                              // Use real data - time adjustments handled by shared KPIs
                              // Calculate proportional mentions based on adjusted total
                              const proportionOfTotal = platform.actualCount / (currentBrand.totalMentions || 1);
                              mentions = Math.round(adjustedMentions * proportionOfTotal);
                              // Use the pre-calculated percentage from the original data
                              actualPercentage = platform.percentage;

                              // If mentions become 0 due to time scaling, set percentage to 0
                              if (mentions === 0) {
                                actualPercentage = 0;
                              }

                            } else {
                              // No demo data - use actual values only
                              mentions = 0;
                              actualPercentage = 0;

                              // If mentions become 0, set percentage to 0
                              if (mentions === 0) {
                                actualPercentage = 0;
                              }
                            }

                            return {
                              ...platform,
                              mentions: Math.max(0, mentions), // Ensure no negative values
                              actualPercentage: actualPercentage
                            };
                          });

                          return platforms;
                        })().map((platform, index) => (
                          <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                            {/* Platform Info */}
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-3 h-3 rounded-full ${platform.color} flex-shrink-0`}></div>
                              <span className="font-medium text-sm">{platform.name}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-300 ${platform.color}`}
                                  style={{ width: `${platform.actualPercentage}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-right">
                              <span className="text-sm font-medium text-foreground min-w-[60px]">
                                {platform.mentions.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground min-w-[35px]">
                                {platform.actualPercentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                        <div className="text-center space-y-3">
                          <Globe className="w-16 h-16 text-muted-foreground mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-foreground">No Platform Data</p>
                            <p className="text-sm text-muted-foreground">
                              Analyze a brand to see platform distribution
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/analysis')}
                          >
                            Start Analysis
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* ── Rage Index Severity Band ──────────────────────────────── */}
            {currentBrand && (() => {
              const adjustedData = getTimeAdjustedData(currentBrand);
              const ri = adjustedData.rageIndex;
              const band = getSeverityBand(ri);
              return (
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className="w-5 h-5" />
                        Rage Index Severity Band
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${band.bg} ${band.text}`}>
                        {ri}% — {band.label}
                      </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground italic">
                      Current frustration level across Minimal → Critical spectrum
                    </p>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <RageIndexSeverityBand rageIndex={ri} />
                  </CardContent>
                </Card>
              );
            })()}

            {/* ── Active Alerts + Mention Ticker ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Alerts */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentBrand ? (() => {
                    const alerts = [];
                    if (currentBrand.rageAlert) alerts.push({ label: 'Rage Threshold Exceeded', level: 'critical', icon: AlertTriangle });
                    if (currentBrand.cautionAlert) alerts.push({ label: 'Elevated Frustration', level: 'warning', icon: Zap });
                    if (currentBrand.rageIndex >= 80) alerts.push({ label: 'Critical Rage Level', level: 'critical', icon: AlertTriangle });
                    else if (currentBrand.rageIndex >= 60) alerts.push({ label: 'High Negative Sentiment', level: 'warning', icon: Zap });
                    return alerts.length > 0 ? (
                      alerts.map((alert, i) => {
                        const Icon = alert.icon;
                        return (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
                            alert.level === 'critical'
                              ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                              : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
                          }`}>
                            <Icon className={`w-4 h-4 shrink-0 ${
                              alert.level === 'critical' ? 'text-red-600' : 'text-orange-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                              alert.level === 'critical'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-orange-700 dark:text-orange-400'
                            }`}>{alert.label}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">No active alerts</span>
                      </div>
                    );
                  })() : (
                    <p className="text-sm text-muted-foreground">Analyze a brand to see alerts</p>
                  )}
                </CardContent>
              </Card>

              {/* AI Commentary Feed */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Commentary
                    {currentBrand && <Badge variant="outline" className="text-xs animate-pulse">LIVE</Badge>}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground italic">AI-generated insights based on latest brand data</p>
                </CardHeader>
                <CardContent>
                  {currentBrand ? (() => {
                    // Pull insights from brand object — set by orchestrator
                    const rawInsights = currentBrand.insights || currentBrand.aiInsights || currentBrand.aiCommentary;
                    const insightsList = Array.isArray(rawInsights)
                      ? rawInsights.slice(0, 3)
                      : typeof rawInsights === 'string'
                        ? [rawInsights]
                        : null;

                    if (insightsList && insightsList.length > 0) {
                      return (
                        <ul className="space-y-3">
                          {insightsList.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                              <span>{typeof insight === 'string' ? insight : (insight.text || insight.content || JSON.stringify(insight))}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    // Fallback: derive commentary from brand numbers
                    const ri = currentBrand.rageIndex || 0;
                    const band = getSeverityBand(ri);
                    const totalMentions = currentBrand.totalMentions || 0;
                    const platforms = Object.keys(currentBrand.platformStats || {}).length;
                    return (
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                          <span>Rage Index is currently <strong>{ri}%</strong> — placing {capitalizeBrandName(currentBrand.brandName)} in the <strong>{band.label}</strong> severity band.</span>
                        </li>
                        {totalMentions > 0 && (
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                            <span>Found <strong>{totalMentions.toLocaleString()} mentions</strong> across {platforms > 0 ? `${platforms} platforms` : 'multiple platforms'}.</span>
                          </li>
                        )}
                        {currentBrand.themes && currentBrand.themes.length > 0 && (
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                            <span>Top conversation themes: <strong>{currentBrand.themes.slice(0, 3).map(t => typeof t === 'string' ? t : (t.theme || t.name || '')).filter(Boolean).join(', ')}</strong>.</span>
                          </li>
                        )}
                      </ul>
                    );
                  })() : (
                    <p className="text-sm text-muted-foreground">Analyze a brand to generate AI commentary.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Live Mention Ticker ───────────────────────────────────── */}
            {currentBrand?.searchResults?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Live Mention Ticker
                    <Badge variant="outline" className="text-xs animate-pulse">LIVE</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground italic">Latest mentions scrolling in real time — hover to pause</p>
                </CardHeader>
                <CardContent>
                  <MentionTicker mentions={currentBrand.searchResults} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CleanModernDashboard;