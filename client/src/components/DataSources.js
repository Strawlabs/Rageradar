import React, { useState, useEffect, useCallback } from 'react';
import { useBrand } from '../contexts/BrandContext';

const DataSources = () => {
  const { currentBrand } = useBrand();
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState([]);
  const [activeTab, setActiveTab] = useState('connected'); // connected, available, settings
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  // Enhanced mock data for data sources
  const mockSources = [
    {
      id: 1,
      name: 'Twitter API v2',
      type: 'twitter',
      status: 'connected',
      icon: '🐦',
      description: 'Real-time tweets and engagement data',
      lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      dataPoints: 15420,
      rateLimit: { used: 847, limit: 1000, resetTime: '2024-01-16T15:00:00Z' },
      config: {
        bearerToken: '••••••••••••••••',
        webhookUrl: 'https://api.rageradar.com/webhooks/twitter',
        keywords: ['your-brand', 'your-product'],
        languages: ['en', 'es', 'fr'],
        geoFilter: false
      },
      metrics: {
        dailyMentions: 1247,
        avgSentiment: 0.68,
        topHashtags: ['#yourbrand', '#yourproduct']
      }
    },
    {
      id: 2,
      name: 'Reddit API',
      type: 'reddit',
      status: 'connected',
      icon: '🔴',
      description: 'Subreddit posts and comments monitoring',
      lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      dataPoints: 8934,
      rateLimit: { used: 234, limit: 600, resetTime: '2024-01-16T14:30:00Z' },
      config: {
        clientId: '••••••••••••••••',
        clientSecret: '••••••••••••••••',
        subreddits: ['yourbrand', 'technology'],
        postTypes: ['text', 'link'],
        minScore: 5
      },
      metrics: {
        dailyMentions: 892,
        avgSentiment: 0.45,
        topSubreddits: ['r/yourbrand', 'r/technology']
      }
    },
    {
      id: 3,
      name: 'YouTube Data API',
      type: 'youtube',
      status: 'connected',
      icon: '📺',
      description: 'Video comments and channel analytics',
      lastSync: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      dataPoints: 5678,
      rateLimit: { used: 456, limit: 10000, resetTime: '2024-01-16T16:00:00Z' },
      config: {
        apiKey: '••••••••••••••••',
        channels: ['YourBrand', 'TechReviewer'],
        videoKeywords: ['product review', 'brand unboxing', 'tutorial'],
        commentDepth: 2
      },
      metrics: {
        dailyMentions: 634,
        avgSentiment: 0.72,
        topChannels: ['YourBrand', 'TechReviewer']
      }
    },
    {
      id: 4,
      name: 'News API',
      type: 'news',
      status: 'error',
      icon: '📰',
      description: 'Global news articles and press coverage',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      dataPoints: 0,
      error: 'API key expired. Please update credentials.',
      rateLimit: { used: 0, limit: 1000, resetTime: '2024-01-16T15:00:00Z' },
      config: {
        apiKey: '••••••••••••••••',
        sources: ['techcrunch', 'theverge', 'engadget', 'reuters'],
        categories: ['technology', 'business'],
        language: 'en'
      },
      metrics: {
        dailyMentions: 0,
        avgSentiment: 0,
        topSources: []
      }
    },
    {
      id: 5,
      name: 'Trustpilot API',
      type: 'trustpilot',
      status: 'paused',
      icon: '⭐',
      description: 'Customer reviews and ratings',
      lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      dataPoints: 2341,
      rateLimit: { used: 123, limit: 500, resetTime: '2024-01-16T14:00:00Z' },
      config: {
        apiKey: '••••••••••••••••',
        businessId: 'your-company',
        reviewTypes: ['all'],
        minRating: 1
      },
      metrics: {
        dailyMentions: 234,
        avgSentiment: 0.34,
        avgRating: 2.8
      }
    }
  ];

  const availableSources = [
    {
      id: 'facebook',
      name: 'Facebook Graph API',
      type: 'facebook',
      icon: '📘',
      description: 'Public posts and page mentions',
      status: 'available',
      features: ['Posts', 'Comments', 'Page Insights', 'Reactions'],
      pricing: 'Free tier: 200 requests/hour',
      setupComplexity: 'Medium'
    },
    {
      id: 'instagram',
      name: 'Instagram Basic Display',
      type: 'instagram',
      icon: '📷',
      description: 'Public posts and hashtag monitoring',
      status: 'available',
      features: ['Posts', 'Stories', 'Hashtags', 'User Mentions'],
      pricing: 'Free tier: 200 requests/hour',
      setupComplexity: 'Medium'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn API',
      type: 'linkedin',
      icon: '💼',
      description: 'Professional network mentions',
      status: 'available',
      features: ['Company Updates', 'Professional Posts', 'Industry Insights'],
      pricing: 'Enterprise only',
      setupComplexity: 'High'
    },
    {
      id: 'tiktok',
      name: 'TikTok Research API',
      type: 'tiktok',
      icon: '🎵',
      description: 'Video content and hashtag tracking',
      status: 'beta',
      features: ['Video Metadata', 'Hashtag Trends', 'User Mentions'],
      pricing: 'Research access required',
      setupComplexity: 'High'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Personalize mock sources if brand exists
      const personalizedSources = mockSources.map(source => {
        if (currentBrand) {
          return {
            ...source,
            config: {
              ...source.config,
              keywords: currentBrand.themes || source.config.keywords || [currentBrand.brandName]
            },
            status: currentBrand.totalMentions > 0 ? 'connected' : 'paused'
          };
        }
        return source;
      });

      setSources(personalizedSources);
      setLoading(false);
    };

    fetchData();
  }, [currentBrand]);

  const getStatusColor = (status) => {
    const colors = {
      connected: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
      paused: 'bg-yellow-100 text-yellow-700',
      connecting: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || colors.connected;
  };

  const getStatusIcon = (status) => {
    const icons = {
      connected: (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      error: (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      paused: (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ),
      connecting: (
        <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    };
    return icons[status] || icons.connected;
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

  const handleToggleSource = (sourceId) => {
    setSources(sources.map(source =>
      source.id === sourceId
        ? {
          ...source,
          status: source.status === 'paused' ? 'connected' : 'paused'
        }
        : source
    ));
  };

  const handleRefreshSource = (sourceId) => {
    setSources(sources.map(source =>
      source.id === sourceId
        ? {
          ...source,
          status: 'connecting',
          lastSync: new Date().toISOString()
        }
        : source
    ));

    // Simulate refresh completion
    setTimeout(() => {
      setSources(sources.map(source =>
        source.id === sourceId
          ? { ...source, status: 'connected' }
          : source
      ));
    }, 2000);
  };

  const connectedSources = sources.filter(s => s.status === 'connected');
  const errorSources = sources.filter(s => s.status === 'error');
  const pausedSources = sources.filter(s => s.status === 'paused');

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-600">Loading data sources...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Data Sources
            </h1>
            <p className="text-gray-600">
              Manage and monitor your social media and news data connections
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddSource(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Add Data Source
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected Sources</p>
              <p className="text-2xl font-bold text-green-600">{connectedSources.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Data Points</p>
              <p className="text-2xl font-bold text-blue-600">
                {sources.reduce((sum, s) => sum + (s.dataPoints || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{errorSources.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paused</p>
              <p className="text-2xl font-bold text-yellow-600">{pausedSources.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏸️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'connected', label: 'Connected Sources', count: sources.length },
            { id: 'available', label: 'Available Sources', count: availableSources.length },
            { id: 'settings', label: 'Global Settings', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex - 1 px - 4 py - 2 rounded - lg text - sm font - medium transition - colors ${activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                } `}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Connected Sources Tab */}
      {activeTab === 'connected' && (
        <div className="space-y-6">
          {sources.map((source) => (
            <div key={source.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{source.icon}</div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                      <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${getStatusColor(source.status)} `}>
                        {getStatusIcon(source.status)} {source.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{source.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>🕒 Last sync: {formatTimeAgo(source.lastSync)}</span>
                      <span>📊 {source.dataPoints?.toLocaleString() || 0} data points</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRefreshSource(source.id)}
                    disabled={source.status === 'connecting'}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                  >
                    <svg className={`w - 5 h - 5 ${source.status === 'connecting' ? 'animate-spin' : ''} `}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleSource(source.id)}
                    className={`px - 3 py - 1 rounded - full text - xs font - medium ${source.status === 'paused'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      } transition - colors`}
                  >
                    {source.status === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => setSelectedSource(source)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    Configure
                  </button>
                </div>
              </div>

              {source.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">⚠️</span>
                    <span className="text-red-700 text-sm font-medium">Error:</span>
                    <span className="text-red-600 text-sm">{source.error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rate Limits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Rate Limits</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Used</span>
                      <span className="font-medium">{source.rateLimit.used}/{source.rateLimit.limit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h - 2 rounded - full ${(source.rateLimit.used / source.rateLimit.limit) > 0.8 ? 'bg-red-500' :
                            (source.rateLimit.used / source.rateLimit.limit) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          } `}
                        style={{ width: `${(source.rateLimit.used / source.rateLimit.limit) * 100}% ` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Resets: {new Date(source.rateLimit.resetTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Today's Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Mentions</span>
                      <span className="font-medium">{source.metrics.dailyMentions?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg Sentiment</span>
                      <span className={`font - medium ${source.metrics.avgSentiment > 0.6 ? 'text-green-600' :
                          source.metrics.avgSentiment > 0.4 ? 'text-yellow-600' : 'text-red-600'
                        } `}>
                        {Math.round((source.metrics.avgSentiment || 0) * 100)}%
                      </span>
                    </div>
                    {source.metrics.avgRating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg Rating</span>
                        <span className="font-medium">{source.metrics.avgRating}/5</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Content */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Top Content</h4>
                  <div className="space-y-2">
                    {(source.metrics.topHashtags || source.metrics.topSubreddits || source.metrics.topChannels || source.metrics.topSources || []).slice(0, 3).map((item, index) => (
                      <div key={index} className="text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Sources Tab */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableSources.map((source) => (
            <div key={source.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{source.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                    <p className="text-gray-600">{source.description}</p>
                  </div>
                </div>

                <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${source.status === 'available' ? 'bg-green-100 text-green-700' :
                    source.status === 'beta' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                  } `}>
                  {source.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {source.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Pricing:</span>
                    <div className="font-medium text-gray-900">{source.pricing}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Setup:</span>
                    <div className={`font - medium ${source.setupComplexity === 'Low' ? 'text-green-600' :
                        source.setupComplexity === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      } `}>
                      {source.setupComplexity}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Connect {source.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Global Data Collection Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Retention Period
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language Filter
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="all">All Languages</option>
                  <option value="en">English Only</option>
                  <option value="multi">English + Spanish + French</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Enable real-time data processing</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Automatically pause sources on rate limit</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Send daily data collection reports</span>
                </label>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Save Settings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Export & Backup</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Export All Data</h4>
                  <p className="text-sm text-gray-600">Download complete dataset in JSON format</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Backup Settings</h4>
                  <p className="text-sm text-gray-600">Export source configurations and settings</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source Configuration Modal */}
      {selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedSource.icon}</span>
                <h2 className="text-xl font-semibold text-gray-900">{selectedSource.name} Configuration</h2>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* API Configuration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
                <div className="space-y-4">
                  {Object.entries(selectedSource.config).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {Array.isArray(value) ? (
                        <input
                          type="text"
                          value={value.join(', ')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Comma-separated values"
                        />
                      ) : typeof value === 'boolean' ? (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={value}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Enabled</span>
                        </label>
                      ) : (
                        <input
                          type={key.toLowerCase().includes('token') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                          value={value}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Connection */}
              <div className="pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-3">
                  Test Connection
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSources;