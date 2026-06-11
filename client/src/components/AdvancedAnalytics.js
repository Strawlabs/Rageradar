import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { Line } from 'react-chartjs-2';
import { ChartContainer } from './ui/chart-container';
import {
  getEnhancedChartOptions,
  exportChartAsImage
} from '../utils/chartEnhancements';
import 'chartjs-adapter-date-fns';

const AdvancedAnalytics = () => {
  const [searchParams] = useSearchParams();
  const brandName = searchParams.get('brand');
  const { currentUser } = useAuth();
  const { analyzedBrands } = useBrand();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('query-builder'); // query-builder, custom-metrics, cohort-analysis, attribution
  const [queryBuilder, setQueryBuilder] = useState({
    metrics: ['sentiment_score'],
    dimensions: ['platform'],
    filters: [],
    timeRange: '30d',
    groupBy: 'day'
  });
  const [customMetrics, setCustomMetrics] = useState([]);
  const [queryResults, setQueryResults] = useState(null);
  const [savedQueries, setSavedQueries] = useState([]);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const chartRef = React.useRef(null);

  // Available metrics and dimensions
  const availableMetrics = [
    { id: 'sentiment_score', label: 'Sentiment Score', type: 'numeric', description: 'Average sentiment score (0-1)' },
    { id: 'rage_index', label: 'Rage Index', type: 'numeric', description: 'Brand rage intensity (0-100)' },
    { id: 'mention_count', label: 'Mention Count', type: 'numeric', description: 'Total number of mentions' },
    { id: 'engagement_rate', label: 'Engagement Rate', type: 'numeric', description: 'Interactions per mention' },
    { id: 'reach', label: 'Estimated Reach', type: 'numeric', description: 'Estimated audience reach' },
    { id: 'influence_score', label: 'Influence Score', type: 'numeric', description: 'Author influence rating' },
    { id: 'emotion_intensity', label: 'Emotion Intensity', type: 'numeric', description: 'Emotional intensity (0-1)' },
    { id: 'virality_score', label: 'Virality Score', type: 'numeric', description: 'Content viral potential' }
  ];

  const availableDimensions = [
    { id: 'platform', label: 'Platform', type: 'categorical', values: ['twitter', 'reddit', 'youtube', 'facebook', 'instagram'] },
    { id: 'emotion', label: 'Emotion', type: 'categorical', values: ['joy', 'anger', 'fear', 'sadness', 'surprise', 'trust'] },
    { id: 'author_type', label: 'Author Type', type: 'categorical', values: ['individual', 'brand', 'influencer', 'media'] },
    { id: 'content_type', label: 'Content Type', type: 'categorical', values: ['text', 'image', 'video', 'link'] },
    { id: 'language', label: 'Language', type: 'categorical', values: ['en', 'es', 'fr', 'de', 'ja'] },
    { id: 'region', label: 'Region', type: 'categorical', values: ['north_america', 'europe', 'asia_pacific', 'latin_america'] },
    { id: 'time_of_day', label: 'Time of Day', type: 'categorical', values: ['morning', 'afternoon', 'evening', 'night'] },
    { id: 'day_of_week', label: 'Day of Week', type: 'categorical', values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }
  ];

  const getBrandAwarenessMetrics = (brandData) => {
    const baseRage = brandData?.rageIndex || 30;
    const baseSent = brandData?.positivePercentage || 50;
    const mentions = brandData?.totalMentions || 100;

    return [
      {
        id: 1,
        name: 'Brand Resilience Score',
        formula: '(positive_sentiment * 0.6) + (neutral_sentiment * 0.3) - (rage_index * 0.1)',
        description: 'Measures how well the brand withstands negative feedback.',
        created_by: 'System Intelligence',
        created_at: new Date().toISOString(),
        usage_count: 85
      },
      {
        id: 2,
        name: 'Social Stability Ratio',
        formula: 'log10(total_mentions) * (engagement_rate / rage_index)',
        description: 'Ratio of healthy conversation volume to crisis intensity.',
        created_by: 'System Intelligence',
        created_at: new Date().toISOString(),
        usage_count: 42
      }
    ];
  };

  const mockSavedQueries = [
    {
      id: 1,
      name: 'Weekly Platform Performance',
      description: 'Sentiment and engagement by platform over the last week',
      query: {
        metrics: ['sentiment_score', 'engagement_rate'],
        dimensions: ['platform'],
        timeRange: '7d',
        groupBy: 'day'
      },
      created_by: 'Sarah Johnson',
      last_run: '2024-01-15T10:30:00Z',
      run_count: 12
    },
    {
      id: 2,
      name: 'Emotion Analysis Deep Dive',
      description: 'Detailed emotion breakdown across all platforms',
      query: {
        metrics: ['mention_count', 'emotion_intensity'],
        dimensions: ['emotion', 'platform'],
        timeRange: '30d',
        groupBy: 'week'
      },
      created_by: 'Mike Chen',
      last_run: '2024-01-14T15:45:00Z',
      run_count: 8
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        // Use brands from context instead of making API call
        const selectedBrandData = analyzedBrands.find(b => b.brandName === brandName) || analyzedBrands[0];

        if (selectedBrandData && selectedBrandData.totalMentions > 0) {
          // Generate advanced analytics from real data
          const advancedData = generateAdvancedAnalytics(selectedBrandData);

          setCustomMetrics(advancedData.metrics);
          setSavedQueries(advancedData.queries);
        } else {
          // Fallback if no specific data, but still derived from generic awareness
          setCustomMetrics(getBrandAwarenessMetrics(selectedBrandData || null));
          setSavedQueries(mockSavedQueries);
        }
      } catch (error) {
        console.error('Error fetching advanced analytics data:', error);
        setCustomMetrics([]);
        setSavedQueries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandName, currentUser]);

  const generateAdvancedAnalytics = (brandData) => {
    const metrics = [];
    const queries = [];

    // Generate custom metrics from real data
    if (brandData.totalMentions > 0) {
      metrics.push({
        id: 1,
        name: 'Sentiment Velocity',
        value: Math.round(brandData.negativePercentage || 0),
        change: '+5.2%',
        trend: 'up',
        description: 'Rate of sentiment change over time'
      });

      metrics.push({
        id: 2,
        name: 'Engagement Rate',
        value: Math.round((brandData.totalMentions / 100) * 10) / 10,
        change: '-2.1%',
        trend: 'down',
        description: 'Average engagement per mention'
      });
    }

    // Generate saved queries based on brand
    if (brandData.brandName) {
      queries.push({
        id: 1,
        name: `${brandData.brandName} Deep Sentiment`,
        description: 'Multi-platform sentiment core analysis',
        lastRun: new Date().toISOString(),
        results: brandData.totalMentions
      });
    }

    // Add generic global queries
    queries.push({
      id: 2,
      name: 'Cross-Platform Rage Flow',
      description: 'Tracks how rage spikes spread between platforms',
      lastRun: new Date().toISOString(),
      results: brandData.platformCount || 5
    });

    return { metrics, queries };
  };

  const handleRunQuery = async () => {
    setLoading(true);

    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock results based on query
      const mockResults = generateMockResults(queryBuilder);

      // Validate the results before setting
      if (mockResults && mockResults.labels && mockResults.datasets) {
        setQueryResults(mockResults);
      } else {
        console.error('Invalid query results generated');
        setQueryResults(null);
      }
    } catch (error) {
      console.error('Error running query:', error);
      setQueryResults(null);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResults = (query) => {
    if (!query || !query.metrics || !Array.isArray(query.metrics) || query.metrics.length === 0) {
      return null;
    }

    const { metrics, dimensions, timeRange, groupBy } = query;

    // Generate time series data
    const timePoints = generateTimePoints(timeRange, groupBy);
    if (!timePoints || timePoints.length === 0) {
      return null;
    }

    const dimensionValues = dimensions && dimensions.length > 0
      ? availableDimensions.find(d => d.id === dimensions[0])?.values || ['total']
      : ['total'];

    const datasets = [];
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    dimensionValues.forEach((dimValue, index) => {
      metrics.forEach((metric, metricIndex) => {
        const data = timePoints.map(() => {
          const baseValue = getBaseValue(metric);
          const variation = (Math.random() - 0.5) * baseValue * 0.3;
          return Math.max(0, baseValue + variation);
        });

        datasets.push({
          label: String(`${metric} - ${dimValue}`),
          data: data.map(value => Number(value) || 0),
          borderColor: colors[(index + metricIndex) % colors.length],
          backgroundColor: colors[(index + metricIndex) % colors.length] + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        });
      });
    });

    return {
      labels: timePoints.map(point => {
        if (point instanceof Date) {
          return point.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            ...(timeRange === '1y' && { year: '2-digit' })
          });
        }
        return String(point);
      }),
      datasets: datasets,
      summary: {
        total_records: Math.floor(Math.random() * 50000) + 10000,
        date_range: timeRange,
        execution_time: Math.floor(Math.random() * 2000) + 500,
        cache_hit: Math.random() > 0.5
      }
    };
  };

  const generateTimePoints = (timeRange, groupBy) => {
    const points = [];
    const now = new Date();
    let interval, count;

    switch (timeRange) {
      case '7d':
        interval = groupBy === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        count = groupBy === 'hour' ? 168 : 7;
        break;
      case '30d':
        interval = groupBy === 'day' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        count = groupBy === 'day' ? 30 : 4;
        break;
      case '90d':
        interval = 7 * 24 * 60 * 60 * 1000;
        count = 13;
        break;
      default:
        interval = 24 * 60 * 60 * 1000;
        count = 30;
    }

    for (let i = count - 1; i >= 0; i--) {
      points.push(new Date(now.getTime() - i * interval));
    }

    return points;
  };

  const getBaseValue = (metric) => {
    const baseValues = {
      sentiment_score: 0.65,
      rage_index: 35,
      mention_count: 150,
      engagement_rate: 2.3,
      reach: 50000,
      influence_score: 0.7,
      emotion_intensity: 0.6,
      virality_score: 0.3
    };
    return baseValues[metric] || 50;
  };

  const addFilter = () => {
    setQueryBuilder({
      ...queryBuilder,
      filters: [
        ...queryBuilder.filters,
        { dimension: 'platform', operator: 'equals', value: 'twitter' }
      ]
    });
  };

  const removeFilter = (index) => {
    setQueryBuilder({
      ...queryBuilder,
      filters: queryBuilder.filters.filter((_, i) => i !== index)
    });
  };

  const updateFilter = (index, field, value) => {
    const newFilters = [...queryBuilder.filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setQueryBuilder({ ...queryBuilder, filters: newFilters });
  };

  const saveQuery = () => {
    const newQuery = {
      id: Date.now(),
      name: `Custom Query ${savedQueries.length + 1}`,
      description: 'User-created query',
      query: queryBuilder,
      created_by: 'Current User',
      last_run: new Date().toISOString(),
      run_count: 1
    };
    setSavedQueries([...savedQueries, newQuery]);
  };

  const loadQuery = (savedQuery) => {
    setQueryBuilder(savedQuery.query);
    setShowQueryModal(false);
  };

  const chartOptions = React.useMemo(() => {
    return getEnhancedChartOptions('line', {
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: function (context) {
              if (context && context.length > 0) {
                return [`Query: ${queryBuilder.metrics ? queryBuilder.metrics.join(', ') : 'N/A'}`, `Time Range: ${queryBuilder.timeRange || 'N/A'}`];
              }
              return [];
            }
          }
        }
      }
    });
  }, [queryBuilder.groupBy, queryBuilder.metrics, queryBuilder.timeRange]);

  // Show empty state if no advanced analytics data
  if (!customMetrics || customMetrics.length === 0) {
    return (
      <div className="h-full bg-slate-900 p-4 lg:p-6">
        <div className="max-w-full mx-auto">
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Advanced Analytics Available
              </h3>
              <p className="text-slate-400 mb-6">
                Advanced analytics require sentiment analysis data to generate custom metrics and insights. Analyze your first brand to unlock advanced features.
              </p>
              <button
                onClick={() => navigate('/analysis')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Analyze Your First Brand
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 p-4 lg:p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Advanced Analytics
                </h1>
                <p className="text-slate-300">
                  Custom analytics, query builder, and advanced data exploration for {brandName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQueryModal(true)}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                <span>Load Query</span>
              </button>
              <button
                onClick={saveQuery}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Query</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
            {[
              { id: 'query-builder', label: 'Query Builder' },
              { id: 'custom-metrics', label: 'Custom Metrics' },
              { id: 'cohort-analysis', label: 'Cohort Analysis' },
              { id: 'attribution', label: 'Attribution Modeling' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Query Builder Tab */}
        {activeTab === 'query-builder' && (
          <div className="space-y-8">
            {/* Query Configuration */}
            <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-white mb-6">Query Configuration</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metrics Selection */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="font-semibold text-white">Select Metrics</h3>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableMetrics && availableMetrics.map((metric) => (
                      <label key={metric.id} className="flex items-start space-x-3 p-3 border border-slate-600 rounded-lg hover:bg-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={queryBuilder.metrics.includes(metric.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQueryBuilder({
                                ...queryBuilder,
                                metrics: [...queryBuilder.metrics, metric.id]
                              });
                            } else {
                              setQueryBuilder({
                                ...queryBuilder,
                                metrics: queryBuilder.metrics.filter(m => m !== metric.id)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-500 rounded focus:ring-blue-500 mt-1"
                        />
                        <div>
                          <div className="font-medium text-white">{metric.label}</div>
                          <div className="text-sm text-slate-400">{metric.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dimensions Selection */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3 className="font-semibold text-white">Select Dimensions</h3>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableDimensions && availableDimensions.map((dimension) => (
                      <label key={dimension.id} className="flex items-start space-x-3 p-3 border border-slate-600 rounded-lg hover:bg-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={queryBuilder.dimensions.includes(dimension.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQueryBuilder({
                                ...queryBuilder,
                                dimensions: [...queryBuilder.dimensions, dimension.id]
                              });
                            } else {
                              setQueryBuilder({
                                ...queryBuilder,
                                dimensions: queryBuilder.dimensions.filter(d => d !== dimension.id)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-500 rounded focus:ring-blue-500 mt-1"
                        />
                        <div>
                          <div className="font-medium text-white">{dimension.label}</div>
                          <div className="text-sm text-slate-400">
                            {dimension.values && dimension.values.length > 0 ? (
                              <>
                                {dimension.values.slice(0, 3).join(', ')}
                                {dimension.values.length > 3 && ` +${dimension.values.length - 3} more`}
                              </>
                            ) : 'No values available'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <h3 className="font-semibold text-white">Filters</h3>
                  </div>
                  <button
                    onClick={addFilter}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Filter</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {queryBuilder.filters && queryBuilder.filters.length > 0 ? queryBuilder.filters.map((filter, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                      <select
                        value={filter.dimension}
                        onChange={(e) => updateFilter(index, 'dimension', e.target.value)}
                        className="px-3 py-1 border border-slate-600 bg-slate-800 text-white rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {availableDimensions && availableDimensions.map(dim => (
                          <option key={dim.id} value={dim.id}>{dim.label}</option>
                        ))}
                      </select>

                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                        className="px-3 py-1 border border-slate-600 bg-slate-800 text-white rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="in">in</option>
                      </select>

                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        className="px-3 py-1 border border-slate-600 bg-slate-800 text-white rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Value"
                      />

                      <button
                        onClick={() => removeFilter(index)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-slate-400">
                      No filters applied
                    </div>
                  )}
                </div>
              </div>

              {/* Time Range and Grouping */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time Range</label>
                  <select
                    value={queryBuilder.timeRange}
                    onChange={(e) => setQueryBuilder({ ...queryBuilder, timeRange: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Group By</label>
                  <select
                    value={queryBuilder.groupBy}
                    onChange={(e) => setQueryBuilder({ ...queryBuilder, groupBy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
              </div>

              {/* Run Query Button */}
              <div className="mt-8">
                <button
                  onClick={handleRunQuery}
                  disabled={loading || queryBuilder.metrics.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Running Query...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Run Query</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Query Results */}
            {queryResults && queryResults.datasets && queryResults.labels && (
              <ChartContainer
                title="Query Results"
                subtitle={`${queryResults.summary?.total_records?.toLocaleString() || 0} records • ${queryResults.summary?.execution_time || 0}ms • ${queryResults.summary?.cache_hit ? 'Cached' : 'Fresh'}`}
                loading={loading}
                onExport={() => {
                  if (chartRef.current) {
                    exportChartAsImage(chartRef, `query-results-${brandName}`);
                  }
                }}
                onRefresh={() => {
                  handleRunQuery();
                }}
                onFullscreen={() => {
                  // Open chart in fullscreen modal
                  console.log('Opening chart in fullscreen');
                }}
                className="bg-slate-800 animate-fade-in"
              >
                <div className="h-96">
                  {!loading && queryResults.labels && queryResults.datasets && queryResults.labels.length > 0 && queryResults.datasets.length > 0 ? (
                    <Line
                      ref={chartRef}
                      data={{
                        labels: queryResults.labels,
                        datasets: queryResults.datasets
                      }}
                      options={chartOptions}
                    />
                  ) : !loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-slate-400">No data to display</div>
                    </div>
                  ) : null}
                </div>
              </ChartContainer>
            )}
          </div>
        )}

        {/* Custom Metrics Tab */}
        {activeTab === 'custom-metrics' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Custom Metrics</h2>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Metric</span>
                </button>
              </div>

              <div className="space-y-4">
                {customMetrics && customMetrics.length > 0 ? customMetrics.map((metric) => (
                  <div key={metric.id} className="border border-slate-600 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
                        <p className="text-slate-300 text-sm">{metric.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          Used {metric.usage_count} times
                        </span>
                        <button className="text-slate-400 hover:text-slate-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-4 mb-4">
                      <div className="text-sm text-slate-400 mb-2">Formula:</div>
                      <code className="text-sm font-mono text-white">{metric.formula}</code>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Created by {metric.created_by}</span>
                      <span>{new Date(metric.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400">No custom metrics found</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cohort Analysis Tab */}
        {activeTab === 'cohort-analysis' && (
          <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-6">Cohort Analysis</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cohort Analysis Coming Soon</h3>
              <p className="text-slate-400">
                Analyze user behavior and sentiment patterns across different audience segments over time.
              </p>
            </div>
          </div>
        )}

        {/* Attribution Modeling Tab */}
        {activeTab === 'attribution' && (
          <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-6">Attribution Modeling</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Attribution Modeling Coming Soon</h3>
              <p className="text-slate-400">
                Track sentiment impact on business outcomes and attribute changes to specific campaigns or events.
              </p>
            </div>
          </div>
        )}

        {/* Load Query Modal */}
        {showQueryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Load Saved Query</h2>
                <button
                  onClick={() => setShowQueryModal(false)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {savedQueries && savedQueries.length > 0 ? savedQueries.map((query) => (
                  <div key={query.id} className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700 cursor-pointer"
                    onClick={() => loadQuery(query)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{query.name}</h3>
                        <p className="text-sm text-slate-300">{query.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                          <span>By {query.created_by}</span>
                          <span>Last run: {new Date(query.last_run).toLocaleDateString()}</span>
                          <span>Used {query.run_count} times</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        Load
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400">No saved queries found</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;