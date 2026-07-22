import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { capitalizeBrandName } from '../utils/brandUtils';
import PageHeader from './shared/PageHeader';
import ColorfulWidget from './shared/ColorfulWidget';
import BrandLogo from './shared/BrandLogo';
import { Search, TrendingUp, Target, Zap, Trash2, BarChart3, MessageSquare, Activity } from 'lucide-react';
import AnalyzeBrandButton from './shared/AnalyzeBrandButton';
import axios from 'axios';

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addAnalyzedBrand, analyzedBrands, removeBrand, selectBrand } = useBrand();

  // State declarations
  const [brandName, setBrandName] = useState('');
  const [selectedPlatforms] = useState([
    'reddit', 'twitter', 'producthunt', 'trustpilot', 'youtube', 'facebook',
    'instagram', 'tiktok', 'glassdoor', 'amazon', 'yelp', 'medium', 'quora'
  ]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (searchBrand = null) => {
    const brand = searchBrand || brandName.trim();
    if (!brand) return;

    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post('/api/analyze', {
        brandName: brand,
        platforms: selectedPlatforms
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        await addAnalyzedBrand(response.data);
        setBrandName('');
        setShowSearch(false);
        navigate('/dashboard', {
          state: {
            newAnalysis: true,
            brandName: brand
          }
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze brand. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = (brandName) => {
    setBrandToDelete(brandName);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;

    setIsDeleting(true);
    try {
      await removeBrand(brandToDelete);
      setShowDeleteModal(false);
      setBrandToDelete(null);

      // If no brands left, show search interface
      const remainingBrands = analyzedBrands.filter(b => b.brandName !== brandToDelete);
      if (remainingBrands.length === 0) {
        setShowSearch(false);
      }
    } catch (error) {
      console.error('Failed to delete brand:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate dynamic KPIs for the analysis page
  const totalInsights = analyzedBrands.reduce((acc, brand) => acc + (brand.insightCount || 0), 0);
  const avgSentiment = analyzedBrands.length > 0
    ? Math.round(analyzedBrands.reduce((acc, brand) => acc + (brand.positivePercentage || 0), 0) / analyzedBrands.length)
    : 0;

  const analysisKPIs = [
    {
      title: 'Searches Today',
      value: (analyzedBrands.filter(b => {
        if (!b.analyzedAt) return false;
        const d = new Date(b.analyzedAt);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }).length || 0).toString(),
      icon: <Search className="w-5 h-5" />,
      color: 'blue'
    },
    {
      title: 'Brands Analyzed',
      value: analyzedBrands.length.toString(),
      icon: <Target className="w-5 h-5" />,
      color: 'green'
    },
    {
      title: 'Total Insights',
      value: totalInsights.toString(),
      icon: <Zap className="w-5 h-5" />,
      color: 'purple'
    },
    {
      title: 'Avg Sentiment',
      value: analyzedBrands.length > 0 ? `${avgSentiment}%` : '0%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'teal'
    }
  ];

  const getPopularSearches = () => {
    if (analyzedBrands.length > 0) {
      // Show their recently analyzed brands as "Quick Links"
      return analyzedBrands.slice(0, 5).map(b => capitalizeBrandName(b.brandName));
    }
    // Default inspirations for new users
    return ['Apple', 'Tesla', 'Netflix', 'Google', 'Amazon'];
  };

  return (
    <>
      {/* Show analyzed brands if they exist and user isn't actively searching */}
      {analyzedBrands.length > 0 && !showSearch ? (
        <div className="h-full bg-background p-6">
          {/* Header matching empty state style */}
          <PageHeader
            title="Brand Analysis"
            subtitle="View and manage your analyzed brands, companies, platforms, and events"
            icon={<Search className="w-7 h-7" />}
            iconBg="from-purple-500 to-indigo-500"
          >
            <AnalyzeBrandButton text="Analyze New Brand" icon={Search} onClick={() => setShowSearch(true)} />
          </PageHeader>

          {/* Analyzed Brands Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {analyzedBrands.map((brand, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group w-full min-w-[320px]"
              >
                {/* Brand Header with Logo */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex-shrink-0">
                    <BrandLogo brandName={brand.brandName} size="md" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {capitalizeBrandName(brand.brandName)}
                    </h3>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${(brand.rageIndex || 0) > 50 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      (brand.rageIndex || 0) > 30 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                      {(brand.rageIndex || 0) > 50 ? 'High Rage' :
                        (brand.rageIndex || 0) > 30 ? 'Medium' : 'Low Rage'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Mentions</span>
                    <span className="font-semibold text-foreground">{brand.totalMentions || 50}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Positive</span>
                    <span className="font-semibold text-green-600">{Math.round(brand.positivePercentage || 22)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Negative</span>
                    <span className="font-semibold text-red-600">{Math.round(brand.rageIndex || 12)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Analyzed</span>
                    <span className="font-semibold text-muted-foreground text-xs">
                      {brand.analyzedAt ? new Date(brand.analyzedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        selectBrand(brand);
                        navigate('/dashboard', { state: { selectedBrand: brand, fromHistory: true } });
                      }}
                      className="bg-primary/10 hover:bg-primary/20 text-primary py-2 px-3 rounded-lg font-medium text-xs transition-colors duration-200 flex items-center justify-center gap-1.5"
                      title="Open Dashboard"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        selectBrand(brand);
                        navigate('/mentions');
                      }}
                      className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 py-2 px-3 rounded-lg font-medium text-xs transition-colors duration-200 flex items-center justify-center gap-1.5"
                      title="Investigate Mentions"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Mentions
                    </button>
                    <button
                      onClick={() => {
                        selectBrand(brand);
                        navigate('/realtime');
                      }}
                      className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 py-2 px-3 rounded-lg font-medium text-xs transition-colors duration-200 flex items-center justify-center gap-1.5"
                      title="Live Intelligence Feed"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Live Feed
                    </button>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteBrand(brand.brandName)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1 text-xs font-medium"
                      title="Delete brand analysis"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Show search interface if no brands or user clicked "Analyze New Brand" */
        <div className="p-6 space-y-6">

          {/* Back button if showing search from analyzed brands view */}
          {showSearch && analyzedBrands.length > 0 && (
            <div className="flex justify-start mb-6">
              <button
                onClick={() => setShowSearch(false)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Analyzed Brands
              </button>
            </div>
          )}

          <PageHeader
            title="Brand Analysis"
            subtitle="Discover what people really think about any brand"
            icon={<Search className="w-7 h-7" />}
            iconBg="from-purple-500 to-indigo-500"
          />

          {/* Search Section - Expanded */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg mb-8">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Analyze Brands, Companies & Events
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter a brand, company, or event name to discover real-time sentiment analysis from across the web
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter brand, company, or event name (e.g., Apple, Tesla, Netflix)"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
                  className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loading}
                />
                <button
                  onClick={() => handleAnalyze()}
                  disabled={loading || !brandName.trim()}
                  className="px-8 py-4 text-lg bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {analyzedBrands.length > 0 ? 'Recent searches: ' : 'Inspirations: '}
                {getPopularSearches().join(', ')}
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Enter Brand</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Type any brand, company, or event name
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">AI Analysis</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Our AI scans 27+ platforms for mentions
                </p>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Get Insights</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  View detailed sentiment and emotion analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Brand Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the analysis for "{capitalizeBrandName(brandToDelete)}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )
      }
    </>
  );
};

export default AnalysisPage;