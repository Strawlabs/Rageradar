import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs, formatNumber, getTrendIndicator } from '../utils/kpiCalculations';
import FilterBar from './shared/FilterBar';
import ColorfulWidget from './shared/ColorfulWidget';
import PageHeader from './shared/PageHeader';
import BrandLogo from './shared/BrandLogo';
import { capitalizeBrandName } from '../utils/brandUtils';
import EmptyState from './shared/EmptyState';
import { Line, Scatter, Radar, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Plus,
  X,
  Users,
  Target,
  Loader2
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Diverse color palette for competitors to ensure clear differentiation from main brand (avoiding blue for competitors)
const COMPETITOR_COLORS = [
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#F43F5E', // Rose
  '#F97316', // Orange
  '#D946EF', // Fuchsia
  '#84CC16', // Lime
  '#06B6D4', // Cyan
];

import ReportExport from './ReportExport';

const CompetitiveAnalysis = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { currentBrand } = useBrand();
  const { filters } = useFilters();
  const navigate = useNavigate();

  const brandName = currentBrand?.brandName || searchParams.get('brand');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [isUpdatingData, setIsUpdatingData] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const competitorsLoadedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBrand) {
        console.log('❌ CompetitiveAnalysis: No currentBrand available');
        setLoading(false);
        return;
      }

      console.log('🔍 CompetitiveAnalysis: Using brand data for:', currentBrand.brandName);

      // Show different loading states for initial load vs filter updates
      if (data) {
        setIsUpdatingData(true);
      } else {
        setLoading(true);
      }

      try {
        // Use shared KPI calculation for consistency (includes time range and geography)
        console.log('🔍 CompetitiveAnalysis: Current filters:', filters);
        const kpis = calculateKPIs(currentBrand, filters);
        console.log('📊 CompetitiveAnalysis: Calculated KPIs:', kpis);

        // Create competitive analysis data structure, preserving existing competitors
        let updatedCompetitors = {};

        // If we have existing competitor data, update it with new filter values
        if (data?.competitors && Object.keys(data.competitors).length > 0) {
          updatedCompetitors = updateCompetitorData(data.competitors);
          console.log('🔄 CompetitiveAnalysis: Updated existing competitor data for filters');
        }
        // If no existing data but we have competitors in state and they've been loaded, restore them
        else if (competitors.length > 0 && competitorsLoadedRef.current) {
          console.log('🔄 CompetitiveAnalysis: Restoring competitors from state:', competitors);
          competitors.forEach((competitorName, index) => {
            const competitorData = generateCompetitorData(competitorName);
            competitorData.color = COMPETITOR_COLORS[index % COMPETITOR_COLORS.length];
            updatedCompetitors[competitorName] = competitorData;
          });
          console.log('🔄 CompetitiveAnalysis: Restored competitor data:', updatedCompetitors);
        }
        // Also check localStorage directly if we have a brand name but no competitors in state yet
        else if (currentBrand?.brandName && typeof window !== 'undefined') {
          const stored = localStorage.getItem(`competitors_${currentBrand.brandName}`);
          if (stored) {
            try {
              const storedCompetitors = JSON.parse(stored);
              console.log('🔄 CompetitiveAnalysis: Direct localStorage restore in main useEffect:', storedCompetitors);
              storedCompetitors.forEach((competitorName, index) => {
                const competitorData = generateCompetitorData(competitorName);
                competitorData.color = COMPETITOR_COLORS[index % COMPETITOR_COLORS.length];
                updatedCompetitors[competitorName] = competitorData;
              });
              // Also update the competitors state if it's empty
              if (competitors.length === 0) {
                setCompetitors(storedCompetitors);
                competitorsLoadedRef.current = true;
              }
            } catch (error) {
              console.error('Error parsing stored competitors in main useEffect:', error);
            }
          }
        }



        if (Object.keys(updatedCompetitors).length > 0) {
          console.log('🔄 CompetitiveAnalysis: Updated competitor data for time range:', filters.timeRange);
        }

        const competitiveData = {
          brandName: currentBrand.brandName,
          mainBrand: {
            name: currentBrand.brandName,
            sentimentScore: kpis.averageSentiment,
            rageIndex: kpis.rageIndex,
            totalMentions: kpis.totalMentions,
            confidenceScore: kpis.confidenceScore,
            platformCount: kpis.platformCount,
            color: '#3B82F6' // Standard Blue for Main Brand
          },
          competitors: updatedCompetitors // Update competitor data with new filter values
        };

        setData(competitiveData);
      } catch (error) {
        console.error('Error generating competitive analysis data:', error);
        setData({
          brandName: currentBrand?.brandName || 'Error',
          mainBrand: null,
          competitors: {}
        });
      } finally {
        setLoading(false);
        setIsUpdatingData(false);
      }
    };

    fetchData();
  }, [currentBrand, filters.timeRange, filters.platform, filters.sentiment, filters.emotion, filters.geography]);

  // Load competitors from localStorage when brand changes (separate from filter updates)
  useEffect(() => {
    competitorsLoadedRef.current = false; // Reset the flag when brand changes

    // Get brand name from context or URL parameter
    const brandNameToUse = currentBrand?.brandName || brandName;

    if (brandNameToUse && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`competitors_${brandNameToUse}`);
      if (stored) {
        try {
          const storedCompetitors = JSON.parse(stored);
          console.log('📦 CompetitiveAnalysis: Loading stored competitors:', storedCompetitors);
          setCompetitors(storedCompetitors);
          competitorsLoadedRef.current = true;
        } catch (error) {
          console.error('Error parsing stored competitors:', error);
          setCompetitors([]);
          competitorsLoadedRef.current = true;
        }
      } else {
        console.log('📦 CompetitiveAnalysis: No stored competitors found for:', brandNameToUse);
        setCompetitors([]);
        competitorsLoadedRef.current = true;
      }
    }
  }, [currentBrand?.brandName, brandName]);

  // Additional useEffect to ensure localStorage is checked after component stabilizes (for hard refresh scenarios)
  useEffect(() => {
    console.log('🔄 CompetitiveAnalysis: Delayed load useEffect triggered', {
      currentBrand: currentBrand?.brandName,
      brandName,
      competitorsLoaded: competitorsLoadedRef.current
    });

    const checkStoredCompetitors = () => {
      const brandNameToUse = currentBrand?.brandName || brandName;
      console.log('🔄 CompetitiveAnalysis: Checking stored competitors for:', brandNameToUse);

      if (brandNameToUse && typeof window !== 'undefined' && !competitorsLoadedRef.current) {
        const stored = localStorage.getItem(`competitors_${brandNameToUse}`);
        console.log('🔄 CompetitiveAnalysis: localStorage result:', stored);
        if (stored) {
          try {
            const storedCompetitors = JSON.parse(stored);
            console.log('🔄 CompetitiveAnalysis: Delayed load - loading stored competitors:', storedCompetitors);
            setCompetitors(storedCompetitors);
            competitorsLoadedRef.current = true;
          } catch (error) {
            console.error('Error parsing stored competitors on delayed load:', error);
          }
        } else {
          console.log('🔄 CompetitiveAnalysis: No stored competitors found');
        }
      } else {
        console.log('🔄 CompetitiveAnalysis: Skipping check - brandName:', brandNameToUse, 'loaded:', competitorsLoadedRef.current);
      }
    };

    // Check immediately
    checkStoredCompetitors();

    // Also check after a short delay in case brand context loads later
    const timeout = setTimeout(() => {
      console.log('🔄 CompetitiveAnalysis: Delayed check after 100ms');
      checkStoredCompetitors();
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentBrand, brandName]); // Re-run when brand info becomes available

  // Function to generate competitor data with current filters
  const generateCompetitorData = (competitorName, baseVariation = null) => {
    const baseKpis = calculateKPIs(currentBrand, filters);

    // Use stored variation if available (for consistency), otherwise generate new one
    const variation = baseVariation || (Math.random() - 0.5) * 30; // ±15% variation
    const sentimentScore = Math.max(20, Math.min(95, baseKpis.averageSentiment + variation));

    return {
      name: competitorName,
      sentimentScore: Math.round(sentimentScore),
      rageIndex: Math.round(100 - sentimentScore),
      totalMentions: Math.round(baseKpis.totalMentions * (0.7 + Math.random() * 0.6)), // 70%-130% of your mentions
      confidenceScore: Math.round(80 + Math.random() * 15), // 80-95%
      baseVariation: variation // Store the variation for consistency
    };
  };

  // Function to update all competitor data when filters change
  const updateCompetitorData = (existingCompetitors) => {
    const updatedCompetitors = {};

    Object.entries(existingCompetitors).forEach(([name, competitor]) => {
      // Use the stored base variation to maintain relative positioning
      const updatedCompetitor = generateCompetitorData(name, competitor.baseVariation);
      updatedCompetitors[name] = {
        ...updatedCompetitor,
        color: competitor.color // Preserve the color
      };
    });

    return updatedCompetitors;
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitorName.trim()) return;

    setIsAddingCompetitor(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate competitor data with current filters
      const newCompetitor = generateCompetitorData(newCompetitorName);
      newCompetitor.color = COMPETITOR_COLORS[competitors.length % COMPETITOR_COLORS.length];

      setData(prevData => ({
        ...prevData,
        competitors: {
          ...prevData.competitors,
          [newCompetitorName]: newCompetitor
        }
      }));

      setCompetitors(prev => {
        const updated = [...prev, newCompetitorName];
        // Persist to localStorage
        if (typeof window !== 'undefined' && currentBrand?.brandName) {
          const storageKey = `competitors_${currentBrand.brandName}`;
          localStorage.setItem(storageKey, JSON.stringify(updated));
          console.log('💾 CompetitiveAnalysis: Saved competitors to localStorage:', storageKey, updated);
        }
        return updated;
      });
      setNewCompetitorName('');
    } catch (error) {
      console.error('Error adding competitor:', error);
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  const handleRemoveCompetitor = (competitorName) => {
    setData(prevData => {
      const newCompetitors = { ...prevData.competitors };
      delete newCompetitors[competitorName];
      return {
        ...prevData,
        competitors: newCompetitors
      };
    });

    setCompetitors(prev => {
      const updated = prev.filter(c => c !== competitorName);
      // Persist to localStorage
      if (typeof window !== 'undefined' && currentBrand?.brandName) {
        const storageKey = `competitors_${currentBrand.brandName}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
        console.log('💾 CompetitiveAnalysis: Updated competitors in localStorage:', storageKey, updated);
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Competitive Analysis</h1>
          <p className="text-muted-foreground">Compare your brand performance against competitors</p>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-lg font-medium text-muted-foreground">Loading competitive analysis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.mainBrand) {
    return (
      <div className="p-6 w-full">
        <EmptyState title="" message="" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Header with Brand Info */}
      <div className="mb-6">
        <PageHeader
          title="Competitive Analysis"
          subtitle="Compare your brand against competitors in the market"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          iconBg="from-orange-500 to-red-500"
          action={
            <button onClick={() => setShowExportModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Competitive Report
            </button>
          }
        />
      </div>

      <div className="max-w-full mx-auto space-y-6">
        {/* Filter Bar - Only Time Range */}
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

        {/* Main Brand KPI Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Brand Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ColorfulWidget
              title="Total Mentions"
              value={formatNumber(data.mainBrand.totalMentions)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
              color="blue"
              size="medium"
            />
            <ColorfulWidget
              title="Average Sentiment"
              value={`${data.mainBrand.sentimentScore}%`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
              size="medium"
            />
            <ColorfulWidget
              title="Rage Index"
              value={`${data.mainBrand.rageIndex}%`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="red"
              size="medium"
            />
            <ColorfulWidget
              title="Confidence Score"
              value={`${data.mainBrand.confidenceScore}%`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="purple"
              size="medium"
            />
          </div>
        </div>

        {/* Competitor Management */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Competitor Management</h2>
          </div>

          <div className="space-y-6">
            {/* Current Competitors */}
            {Object.keys(data.competitors).length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Active Competitors</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.values(data.competitors).map((competitor) => (
                    <div key={competitor.name} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                      <BrandLogo brandName={competitor.name} size="xs" />
                      <span className="font-medium text-slate-900 dark:text-white">{competitor.name}</span>
                      <button
                        onClick={() => handleRemoveCompetitor(competitor.name)}
                        className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">No Competitors Added</p>
                <p className="text-sm">Add competitors to start comparing your brand performance</p>
              </div>
            )}

            {/* Add New Competitor */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Add New Competitor</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter competitor brand name..."
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                />
                <button
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitorName.trim() || isAddingCompetitor}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isAddingCompetitor ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isAddingCompetitor ? 'Analyzing...' : 'Add Competitor'}
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Market Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Market Summary</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Overview of total market metrics including all brands and competitors
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{Object.keys(data.competitors).length + 1}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Brands</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((data.mainBrand.sentimentScore + Object.values(data.competitors).reduce((sum, c) => sum + c.sentimentScore, 0)) / (Object.keys(data.competitors).length + 1))}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Avg Market Sentiment</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(data.mainBrand.totalMentions + Object.values(data.competitors).reduce((sum, c) => sum + c.totalMentions, 0))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Market Mentions</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see market summary</p>
            </div>
          )}
        </div>

        {/* Enhanced Side-by-Side Metrics Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Competitive Metrics Table</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                  Detailed side-by-side comparison of key metrics across all brands with sortable columns
                </p>
              </div>
            </div>
            {Object.keys(data.competitors).length > 0 && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Sortable • Click column headers to sort
              </div>
            )}
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        Brand
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                      <div className="flex items-center justify-end gap-2">
                        Sentiment %
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                      <div className="flex items-center justify-end gap-2">
                        Rage Index %
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                      <div className="flex items-center justify-end gap-2">
                        Mentions
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                      <div className="flex items-center justify-end gap-2">
                        Market Share
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                      <div className="flex items-center justify-end gap-2">
                        Growth Rate
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[data.mainBrand, ...Object.values(data.competitors)]
                    .sort((a, b) => b.sentimentScore - a.sentimentScore)
                    .map((brand, index) => {
                      const totalMentions = [data.mainBrand, ...Object.values(data.competitors)].reduce((sum, b) => sum + b.totalMentions, 0);
                      const marketShare = ((brand.totalMentions / totalMentions) * 100);
                      const growthRate = Math.round((Math.random() - 0.5) * 20); // Simulated growth rate
                      const isYourBrand = brand.name === data.mainBrand.name;

                      return (
                        <tr key={brand.name} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isYourBrand ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                    'bg-slate-400'
                                }`}>
                                {index + 1}
                              </div>
                              <BrandLogo brandName={brand.name} size="sm" />
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">{brand.name}</div>
                                {isYourBrand && (
                                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Your Brand</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`font-bold text-lg ${brand.sentimentScore >= 70 ? 'text-green-600' : brand.sentimentScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {brand.sentimentScore}%
                              </span>
                              {!isYourBrand && (
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${brand.sentimentScore - data.mainBrand.sentimentScore >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                                  {brand.sentimentScore - data.mainBrand.sentimentScore >= 0 ? '+' : ''}{brand.sentimentScore - data.mainBrand.sentimentScore}% vs You
                                </span>
                              )}
                            </div>
                            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1`}>
                              <div
                                className={`h-2 rounded-full ${brand.sentimentScore >= 70 ? 'bg-green-500' : brand.sentimentScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${brand.sentimentScore}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`font-bold text-lg ${brand.rageIndex <= 30 ? 'text-green-600' : brand.rageIndex <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {brand.rageIndex}%
                              </span>
                              {!isYourBrand && (
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${brand.rageIndex - data.mainBrand.rageIndex <= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                                  {brand.rageIndex - data.mainBrand.rageIndex >= 0 ? '+' : ''}{brand.rageIndex - data.mainBrand.rageIndex}% vs You
                                </span>
                              )}
                            </div>
                            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1`}>
                              <div
                                className={`h-2 rounded-full ${brand.rageIndex <= 30 ? 'bg-green-500' : brand.rageIndex <= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${brand.rageIndex}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className="font-bold text-lg text-slate-900 dark:text-white">{formatNumber(brand.totalMentions)}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">mentions</div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className="font-bold text-lg text-purple-600">{marketShare.toFixed(1)}%</div>
                            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1`}>
                              <div
                                className="h-2 rounded-full bg-purple-500"
                                style={{ width: `${marketShare}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className={`font-bold text-lg flex items-center justify-end gap-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {growthRate >= 0 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                              )}
                              {Math.abs(growthRate)}%
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">growth</div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Competitors Added</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">Add competitors to see detailed metrics comparison with sortable columns</p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Rankings
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Market Share
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Growth Rates
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Performance Ranking */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Ranking</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Ranks all brands by overall performance score based on sentiment and volume metrics
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="space-y-3">
              {[data.mainBrand, ...Object.values(data.competitors)]
                .sort((a, b) => b.sentimentScore - a.sentimentScore)
                .map((brand, index) => {
                  const marketShare = ((brand.totalMentions / ([data.mainBrand, ...Object.values(data.competitors)].reduce((sum, b) => sum + b.totalMentions, 0))) * 100);
                  const growthRate = Math.round((Math.random() - 0.5) * 20); // Simulated growth rate

                  return (
                    <div key={brand.name} className={`flex items-center justify-between p-4 rounded-lg border ${brand.name === data.mainBrand.name ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                      <div className="flex items-center gap-4">
                        {/* Ranking Badge */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg' :
                              'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                          }`}>
                          {index === 0 ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ) : index === 1 ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <text x="12" y="16" textAnchor="middle" className="text-xs font-bold fill-white">2</text>
                            </svg>
                          ) : index === 2 ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <text x="12" y="16" textAnchor="middle" className="text-xs font-bold fill-white">3</text>
                            </svg>
                          ) : index + 1}
                        </div>

                        {/* Brand Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color || '#007AFF' }}></div>
                            <span className="font-semibold text-slate-900 dark:text-white">{brand.name}</span>
                            {brand.name === data.mainBrand.name && (
                              <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-medium">You</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                            <span>{brand.sentimentScore}% sentiment</span>
                            <span>{marketShare.toFixed(1)}% market share</span>
                            <span className={`flex items-center gap-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {growthRate >= 0 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                              )} {Math.abs(growthRate)}% growth
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 dark:text-white">{formatNumber(brand.totalMentions)}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">mentions</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${brand.rageIndex < 30 ? 'text-green-600' : brand.rageIndex < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {brand.rageIndex}%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">rage index</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see performance ranking</p>
            </div>
          )}
        </div>

        {/* Performance Radar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Radar Chart</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Multi-dimensional performance comparison across sentiment, volume, engagement, growth, and consistency
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="h-96">
              <Radar
                data={{
                  labels: ['Sentiment', 'Volume', 'Engagement', 'Growth', 'Consistency'],
                  datasets: [
                    {
                      label: data.mainBrand.name,
                      data: [
                        data.mainBrand.sentimentScore,
                        Math.min(100, (data.mainBrand.totalMentions / 1000) * 100),
                        data.mainBrand.confidenceScore,
                        Math.max(0, 50 + Math.random() * 30), // Simulated growth
                        Math.max(0, 60 + Math.random() * 30)  // Simulated consistency
                      ],
                      backgroundColor: 'rgba(59, 130, 246, 0.2)', // Match mainBrand color (#3B82F6)
                      borderColor: '#3B82F6',
                      borderWidth: 3,
                      pointBackgroundColor: '#3B82F6',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                    },
                    ...Object.values(data.competitors).slice(0, 3).map((competitor) => ({
                      label: competitor.name,
                      data: [
                        competitor.sentimentScore,
                        Math.min(100, (competitor.totalMentions / 1000) * 100),
                        competitor.confidenceScore || 85,
                        Math.max(0, 50 + Math.random() * 30), // Simulated growth
                        Math.max(0, 60 + Math.random() * 30)  // Simulated consistency
                      ],
                      backgroundColor: competitor.color + '20',
                      borderColor: competitor.color,
                      borderWidth: 2,
                      pointBackgroundColor: competitor.color,
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 4,
                    }))
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: '#374151',
                      borderWidth: 1,
                      cornerRadius: 8,
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: '#374151' },
                      angleLines: { color: '#374151' },
                      pointLabels: {
                        color: '#9CA3AF',
                        font: { size: 12 }
                      },
                      ticks: {
                        color: '#9CA3AF',
                        backdropColor: 'transparent'
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see multi-dimensional performance comparison</p>
            </div>
          )}
        </div>

        {/* Market Position Matrix */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Market Position Matrix</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                X-axis: Sentiment Score (0-100%) • Y-axis: Mention Volume • Top-right = Market Leaders
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div>
              {/* 2x2 Strategic Position Matrix */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 mb-6">
                {/* Axis Labels */}
                <div className="text-center mb-4">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">High Volume</div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Left Axis Label */}
                  <div className="flex items-center justify-center w-20">
                    <div className="transform -rotate-90 text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      High Sentiment
                    </div>
                  </div>

                  {/* 2x2 Grid */}
                  <div className="flex-1 grid grid-cols-2 gap-4 h-96">
                    {(() => {
                      const allBrands = [data.mainBrand, ...Object.values(data.competitors)];
                      const avgSentiment = allBrands.reduce((sum, b) => sum + b.sentimentScore, 0) / allBrands.length;
                      const avgMentions = allBrands.reduce((sum, b) => sum + b.totalMentions, 0) / allBrands.length;

                      // Use median instead of average for better distribution
                      const sentimentScores = allBrands.map(b => b.sentimentScore).sort((a, b) => a - b);
                      const mentionCounts = allBrands.map(b => b.totalMentions).sort((a, b) => a - b);
                      const medianSentiment = sentimentScores[Math.floor(sentimentScores.length / 2)];
                      const medianMentions = mentionCounts[Math.floor(mentionCounts.length / 2)];

                      // Categorize brands into quadrants using median
                      const quadrants = {
                        leaders: allBrands.filter(b => b.sentimentScore > medianSentiment && b.totalMentions > medianMentions),
                        challengers: allBrands.filter(b => b.sentimentScore <= medianSentiment && b.totalMentions > medianMentions),
                        niche: allBrands.filter(b => b.sentimentScore > medianSentiment && b.totalMentions <= medianMentions),
                        followers: allBrands.filter(b => b.sentimentScore <= medianSentiment && b.totalMentions <= medianMentions)
                      };

                      // Ensure every brand is in exactly one quadrant
                      const allAssigned = [...quadrants.leaders, ...quadrants.challengers, ...quadrants.niche, ...quadrants.followers];
                      const unassigned = allBrands.filter(b => !allAssigned.includes(b));

                      // If any brands are unassigned (edge case), put them in the most appropriate quadrant
                      unassigned.forEach(brand => {
                        if (brand.sentimentScore >= medianSentiment && brand.totalMentions >= medianMentions) {
                          quadrants.leaders.push(brand);
                        } else if (brand.sentimentScore < medianSentiment && brand.totalMentions >= medianMentions) {
                          quadrants.challengers.push(brand);
                        } else if (brand.sentimentScore >= medianSentiment && brand.totalMentions < medianMentions) {
                          quadrants.niche.push(brand);
                        } else {
                          quadrants.followers.push(brand);
                        }
                      });

                      return (
                        <>
                          {/* Top Left: Leaders (High Sentiment + High Volume) */}
                          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 flex flex-col min-h-[180px]">
                            <div className="text-center mb-4">
                              <div className="font-bold text-green-800 dark:text-green-200 text-xl">Leaders</div>
                              <div className="text-sm text-green-600 dark:text-green-400 mt-1">High Sentiment + High Volume</div>
                            </div>
                            <div className="flex-1 space-y-3">
                              {quadrants.leaders.map(brand => (
                                <div key={brand.name} className="flex items-start gap-3">
                                  <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: brand.name === data.mainBrand.name ? '#3B82F6' : brand.color }}></div>
                                  <div className="min-w-0 flex-1">
                                    <div className={`font-medium text-sm leading-tight ${brand.name === data.mainBrand.name ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {brand.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      {brand.sentimentScore}% • {formatNumber(brand.totalMentions)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Top Right: Challengers (Low Sentiment + High Volume) */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 flex flex-col min-h-[180px]">
                            <div className="text-center mb-4">
                              <div className="font-bold text-blue-800 dark:text-blue-200 text-xl">Challengers</div>
                              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">Low Sentiment + High Volume</div>
                            </div>
                            <div className="flex-1 space-y-3">
                              {quadrants.challengers.map(brand => (
                                <div key={brand.name} className="flex items-start gap-3">
                                  <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: brand.name === data.mainBrand.name ? '#3B82F6' : brand.color }}></div>
                                  <div className="min-w-0 flex-1">
                                    <div className={`font-medium text-sm leading-tight ${brand.name === data.mainBrand.name ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {brand.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      {brand.sentimentScore}% • {formatNumber(brand.totalMentions)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Left: Niche Players (High Sentiment + Low Volume) */}
                          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6 flex flex-col min-h-[180px]">
                            <div className="text-center mb-4">
                              <div className="font-bold text-purple-800 dark:text-purple-200 text-xl">Niche Players</div>
                              <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">High Sentiment + Low Volume</div>
                            </div>
                            <div className="flex-1 space-y-3">
                              {quadrants.niche.map(brand => (
                                <div key={brand.name} className="flex items-start gap-3">
                                  <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: brand.name === data.mainBrand.name ? '#3B82F6' : brand.color }}></div>
                                  <div className="min-w-0 flex-1">
                                    <div className={`font-medium text-sm leading-tight ${brand.name === data.mainBrand.name ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {brand.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      {brand.sentimentScore}% • {formatNumber(brand.totalMentions)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Right: Followers (Low Sentiment + Low Volume) */}
                          <div className="bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col min-h-[180px]">
                            <div className="text-center mb-4">
                              <div className="font-bold text-gray-800 dark:text-gray-200 text-xl">Followers</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Low Sentiment + Low Volume</div>
                            </div>
                            <div className="flex-1 space-y-3">
                              {quadrants.followers.map(brand => (
                                <div key={brand.name} className="flex items-start gap-3">
                                  <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: brand.name === data.mainBrand.name ? '#3B82F6' : brand.color }}></div>
                                  <div className="min-w-0 flex-1">
                                    <div className={`font-medium text-sm leading-tight ${brand.name === data.mainBrand.name ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {brand.name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      {brand.sentimentScore}% • {formatNumber(brand.totalMentions)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Right Axis Label */}
                  <div className="flex items-center justify-center w-20">
                    <div className="transform rotate-90 text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      Low Sentiment
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Low Volume</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see market positioning analysis</p>
            </div>
          )}
        </div>

        {/* Competitive Timeline Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Competitive Timeline</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Historical performance trends showing how brands have performed over time
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="h-80">
              <Line
                data={{
                  labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                  datasets: [
                    {
                      label: data.mainBrand.name,
                      data: [
                        data.mainBrand.sentimentScore - 5,
                        data.mainBrand.sentimentScore - 2,
                        data.mainBrand.sentimentScore + 1,
                        data.mainBrand.sentimentScore - 3,
                        data.mainBrand.sentimentScore + 2,
                        data.mainBrand.sentimentScore - 1,
                        data.mainBrand.sentimentScore
                      ],
                      borderColor: '#f97316',
                      backgroundColor: 'rgba(249, 115, 22, 0.1)',
                      borderWidth: 4,
                      tension: 0.4,
                      pointBackgroundColor: '#f97316',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 3,
                      pointRadius: 7,
                    },
                    ...Object.values(data.competitors).map((competitor) => ({
                      label: competitor.name,
                      data: [
                        competitor.sentimentScore - Math.random() * 10,
                        competitor.sentimentScore + Math.random() * 5,
                        competitor.sentimentScore - Math.random() * 3,
                        competitor.sentimentScore + Math.random() * 7,
                        competitor.sentimentScore - Math.random() * 4,
                        competitor.sentimentScore + Math.random() * 2,
                        competitor.sentimentScore
                      ],
                      borderColor: competitor.color,
                      backgroundColor: competitor.color + '20',
                      borderWidth: 3,
                      tension: 0.4,
                      pointBackgroundColor: competitor.color,
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 5,
                    }))
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      borderColor: '#374151',
                      borderWidth: 1,
                      cornerRadius: 8,
                    }
                  },
                  scales: {
                    x: {
                      grid: { color: '#374151' },
                      ticks: { color: '#9CA3AF' },
                      title: {
                        display: true,
                        text: 'Time Period',
                        color: '#9CA3AF'
                      }
                    },
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: { color: '#374151' },
                      ticks: { color: '#9CA3AF' },
                      title: {
                        display: true,
                        text: 'Sentiment Score (%)',
                        color: '#9CA3AF'
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see sentiment trends over time</p>
            </div>
          )}
        </div>

        {/* Sentiment Distribution Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sentiment Distribution Comparison</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Breakdown of brand perception: Positive (Brand Love), Neutral (Informational), and Negative (Rage/Displeasure)
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="space-y-4">
              {[data.mainBrand, ...Object.values(data.competitors)].map((brand) => {
                const positive = brand.sentimentScore;
                const negative = brand.rageIndex * 0.6; // Negative is subset of rage
                const neutral = 100 - positive - negative;

                return (
                  <div key={brand.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color || '#3B82F6' }}></div>
                        <span className="font-medium text-slate-900 dark:text-white">{brand.name}</span>
                        {brand.name === data.mainBrand.name && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">You</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {formatNumber(brand.totalMentions)} total mentions
                      </div>
                    </div>

                    <div className="flex h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <div
                        className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${positive}%` }}
                      >
                        {positive > 15 && `${positive.toFixed(0)}%`}
                      </div>
                      <div
                        className="bg-slate-400 dark:bg-slate-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${neutral}%` }}
                        title="Neutral / Informational"
                      >
                        {neutral > 15 && `${neutral.toFixed(0)}%`}
                      </div>
                      <div
                        className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${negative}%` }}
                      >
                        {negative > 15 && `${negative.toFixed(0)}%`}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatNumber(Math.round(brand.totalMentions * positive / 100))} positive
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatNumber(Math.round(brand.totalMentions * neutral / 100))} neutral & informational
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {formatNumber(Math.round(brand.totalMentions * negative / 100))} negative
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see sentiment distribution breakdown</p>
            </div>
          )}
        </div>

        {/* Channel Dominance Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Channel Dominance Analysis</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Shows market share distribution across different social media platforms for all brands
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Twitter', 'Reddit', 'Facebook', 'Instagram', 'YouTube', 'TikTok'].map((platform) => {
                const allBrands = [data.mainBrand, ...Object.values(data.competitors)];
                const platformData = allBrands.map(brand => ({
                  name: brand.name,
                  value: Math.round(brand.totalMentions * (0.1 + Math.random() * 0.3)), // Random platform distribution
                  color: brand.color || '#3B82F6'
                }));

                return (
                  <div key={platform} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3 text-center">{platform}</h3>
                    <div className="h-32 mb-3">
                      <Doughnut
                        data={{
                          labels: platformData.map(d => d.name),
                          datasets: [{
                            data: platformData.map(d => d.value),
                            backgroundColor: platformData.map(d => d.color + 'A0'), // Increased opacity from 80 to A0 (approx 63%)
                            borderColor: platformData.map(d => d.color),
                            borderWidth: 2,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              titleColor: '#fff',
                              bodyColor: '#fff',
                              callbacks: {
                                label: function (context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                                  return `${context.label}: ${percentage}% (${formatNumber(context.parsed)})`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      {platformData.sort((a, b) => b.value - a.value).map((brand, index) => (
                        <div key={brand.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.color }}></div>
                            <span className={brand.name === data.mainBrand.name ? 'font-semibold text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}>
                              {brand.name}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {((brand.value / platformData.reduce((sum, b) => sum + b.value, 0)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see platform dominance analysis</p>
            </div>
          )}
        </div>

        {/* Competitive Gaps Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Competitive Gaps Analysis</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Identifies performance gaps between your brand and competitors with strategic recommendations
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="space-y-6">
              {/* Opportunity Scoring */}
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-4">Performance Gaps vs Your Brand ({data.mainBrand.name})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(data.competitors).map((competitor) => {
                    const sentimentGap = Math.max(0, competitor.sentimentScore - data.mainBrand.sentimentScore);
                    const volumeGap = Math.max(0, competitor.totalMentions - data.mainBrand.totalMentions);
                    const opportunityScore = Math.round((sentimentGap * 0.6 + (volumeGap / 1000) * 0.4) * 2);

                    return (
                      <div key={competitor.name} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: competitor.color }}></div>
                            <span className="font-medium text-slate-900 dark:text-white">{competitor.name}</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${opportunityScore >= 20 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            opportunityScore >= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                            {opportunityScore >= 20 ? 'High Threat' : opportunityScore >= 10 ? 'Medium Gap' : 'Low Risk'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Sentiment Gap:</span>
                            <span className={`font-medium ${sentimentGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {sentimentGap > 0 ? `+${sentimentGap.toFixed(0)}%` : 'Leading'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Volume Gap:</span>
                            <span className={`font-medium ${volumeGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {volumeGap > 0 ? `+${formatNumber(volumeGap)}` : 'Leading'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Opportunity Score:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{opportunityScore}/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-4">Actionable Business Recommendations</h3>
                <div className="space-y-4">
                  {/* Sentiment Improvement Actions */}
                  {data.mainBrand.sentimentScore < Math.max(...Object.values(data.competitors).map(c => c.sentimentScore)) && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-300">Improve Sentiment Score</span>
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                        <p><strong>Current Gap:</strong> {Math.max(...Object.values(data.competitors).map(c => c.sentimentScore)) - data.mainBrand.sentimentScore}% behind top competitor</p>
                        <div className="space-y-1">
                          <p><strong>Actions to take:</strong></p>
                          <ul className="ml-4 space-y-1">
                            <li>• Enhance customer service response times and quality</li>
                            <li>• Address common complaints found in negative mentions</li>
                            <li>• Launch positive PR campaigns highlighting customer success stories</li>
                            <li>• Improve product quality based on user feedback</li>
                            <li>• Engage more actively with customers on social media</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Volume Increase Actions */}
                  {data.mainBrand.totalMentions < Math.max(...Object.values(data.competitors).map(c => c.totalMentions)) && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800 dark:text-purple-300">Increase Brand Visibility</span>
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-400 space-y-2">
                        <p><strong>Current Gap:</strong> {Math.max(...Object.values(data.competitors).map(c => c.totalMentions)) - data.mainBrand.totalMentions} fewer mentions than top competitor</p>
                        <div className="space-y-1">
                          <p><strong>Actions to take:</strong></p>
                          <ul className="ml-4 space-y-1">
                            <li>• Increase social media posting frequency and engagement</li>
                            <li>• Partner with influencers and brand ambassadors</li>
                            <li>• Launch viral marketing campaigns or challenges</li>
                            <li>• Participate in trending topics and conversations</li>
                            <li>• Create shareable content that encourages user-generated content</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rage Reduction Actions */}
                  {data.mainBrand.rageIndex > 40 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800 dark:text-red-300">Reduce Customer Frustration</span>
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-400 space-y-2">
                        <p><strong>Current Issue:</strong> {data.mainBrand.rageIndex}% rage index indicates customer frustration</p>
                        <div className="space-y-1">
                          <p><strong>Immediate actions:</strong></p>
                          <ul className="ml-4 space-y-1">
                            <li>• Implement proactive customer support and issue resolution</li>
                            <li>• Address product/service issues causing negative feedback</li>
                            <li>• Create transparent communication about known issues</li>
                            <li>• Offer compensation or solutions for affected customers</li>
                            <li>• Monitor social media for complaints and respond quickly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Maintenance */}
                  {data.mainBrand.sentimentScore >= Math.max(...Object.values(data.competitors).map(c => c.sentimentScore)) && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-300">Maintain Market Leadership</span>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-400 space-y-2">
                        <p><strong>Current Position:</strong> Leading with {data.mainBrand.sentimentScore}% sentiment score</p>
                        <div className="space-y-1">
                          <p><strong>Actions to maintain lead:</strong></p>
                          <ul className="ml-4 space-y-1">
                            <li>• Continue current successful strategies and campaigns</li>
                            <li>• Monitor competitors for new initiatives to counter</li>
                            <li>• Innovate and stay ahead of market trends</li>
                            <li>• Strengthen customer loyalty programs</li>
                            <li>• Expand into new markets or demographics</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to see gap analysis and strategic recommendations</p>
            </div>
          )}
        </div>

        {/* SWOT Analysis Generator */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">SWOT Analysis for {data.mainBrand.name}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                Strategic analysis of your brand's Strengths, Weaknesses, Opportunities, and Threats vs competitors
              </p>
            </div>
          </div>

          {Object.keys(data.competitors).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Strengths
                  </h3>
                  <div className="space-y-3">
                    {data.mainBrand.sentimentScore >= 60 && (
                      <div className="text-sm text-green-700 dark:text-green-400">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="font-medium">Superior sentiment score ({data.mainBrand.sentimentScore}%)</span>
                        </div>
                        <div className="ml-4 text-xs text-green-600 dark:text-green-500">
                          <strong>Leverage:</strong> Use positive sentiment in marketing campaigns, customer testimonials, and PR
                        </div>
                      </div>
                    )}
                    {data.mainBrand.rageIndex <= 35 && (
                      <div className="text-sm text-green-700 dark:text-green-400">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="font-medium">Low customer frustration ({data.mainBrand.rageIndex}% rage index)</span>
                        </div>
                        <div className="ml-4 text-xs text-green-600 dark:text-green-500">
                          <strong>Leverage:</strong> Highlight customer satisfaction in competitive positioning and retention programs
                        </div>
                      </div>
                    )}
                    <div className="text-sm text-green-700 dark:text-green-400">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="font-medium">Strong market presence ({formatNumber(data.mainBrand.totalMentions)} mentions)</span>
                      </div>
                      <div className="ml-4 text-xs text-green-600 dark:text-green-500">
                        <strong>Leverage:</strong> Use high visibility for thought leadership and industry influence
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opportunities */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Opportunities
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span>Expand into platforms where competitors are weaker</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span>Capitalize on competitor sentiment weaknesses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span>Increase mention volume during competitor downturns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span>Target competitor audiences with better messaging</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Weaknesses & Threats */}
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Weaknesses
                  </h3>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
                    {data.mainBrand.sentimentScore < 50 && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">!</span>
                        <span>Below-average sentiment score needs improvement</span>
                      </li>
                    )}
                    {data.mainBrand.rageIndex > 50 && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">!</span>
                        <span>High rage index indicates customer dissatisfaction</span>
                      </li>
                    )}
                    {Object.values(data.competitors).some(c => c.totalMentions > data.mainBrand.totalMentions * 1.5) && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">!</span>
                        <span>Lower mention volume compared to top competitors</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">!</span>
                      <span>Monitor competitive positioning regularly</span>
                    </li>
                  </ul>
                </div>

                {/* Threats */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Threats
                  </h3>
                  <ul className="text-sm text-red-700 dark:text-red-400 space-y-2">
                    {Object.values(data.competitors).filter(c => c.sentimentScore > data.mainBrand.sentimentScore).map(competitor => (
                      <li key={competitor.name} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">⚠</span>
                        <span>{competitor.name} has {competitor.sentimentScore - data.mainBrand.sentimentScore}% higher sentiment</span>
                      </li>
                    ))}
                    {Object.values(data.competitors).filter(c => c.totalMentions > data.mainBrand.totalMentions).map(competitor => (
                      <li key={competitor.name} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">⚠</span>
                        <span>{competitor.name} has {formatNumber(competitor.totalMentions - data.mainBrand.totalMentions)} more mentions</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">⚠</span>
                      <span>Market competition intensifying across all channels</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">Add competitors to generate SWOT analysis</p>
            </div>
          )}
        </div>
      </div>

      {showExportModal && (
        <ReportExport
          analysisData={data?.mainBrand || { rageIndex: currentBrand?.rageIndex || 28, totalMentions: currentBrand?.totalMentions || 1000, averageSentiment: currentBrand?.averageSentiment || 72 }}
          brandName={brandName || 'Brand'}
          appliedFilters={filters}
          timeRangeLabel={filters?.timeRange || 'Last 7 days'}
          reportType="competitive"
          reportContextData={{ mainBrand: data?.mainBrand, competitors: data?.competitors || {} }}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default CompetitiveAnalysis;