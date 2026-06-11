import React, { useState } from 'react';
import { Line, Bar, Scatter, Radar } from 'react-chartjs-2';
import { ModernIcon, enterpriseDesign, getEnterpriseColor } from '../utils/enterpriseDesignSystem';

import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs } from '../utils/kpiCalculations';

const EnterpriseAnalysis = () => {
  const { currentBrand } = useBrand();
  const { filters } = useFilters();
  const [selectedAnalysis, setSelectedAnalysis] = useState('correlation');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedSites, setSelectedSites] = useState(['all']);
  const [sentimentFilter, setSentimentFilter] = useState('all');

  const kpis = calculateKPIs(currentBrand, filters);
  const brandName = currentBrand?.brandName || 'Brand';
  const themes = currentBrand?.themes || [];

  // Analysis Types
  const analysisTypes = [
    { id: 'correlation', name: 'Correlation Analysis', icon: 'activity' },
    { id: 'keywords', name: 'Keyword Clouds', icon: 'search' },
    { id: 'comparative', name: 'Comparative Analysis', icon: 'users' },
    { id: 'trends', name: 'Trend Analysis', icon: 'trendingUp' },
    { id: 'geographic', name: 'Geographic Analysis', icon: 'sites' }
  ];

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      }
    }
  };

  // Dynamic data for correlation analysis
  const correlationData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
    datasets: [
      {
        label: `${brandName} Sentiment Growth`,
        data: Array.from({ length: 6 }, () => kpis.averageSentiment + (Math.random() - 0.5) * 10),
        borderColor: getEnterpriseColor('primary.500'),
        backgroundColor: getEnterpriseColor('primary.500') + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Mention Velocity',
        data: Array.from({ length: 6 }, () => (kpis.totalMentions / 10) + (Math.random() - 0.5) * 20),
        borderColor: getEnterpriseColor('secondary.500'),
        backgroundColor: getEnterpriseColor('secondary.500') + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const keywordData = {
    labels: themes.length > 0 ? themes.slice(0, 6) : ['Quality', 'Service', 'Price', 'Speed', 'Ease', 'Reliability'],
    datasets: [
      {
        label: 'Keyword Mentions',
        data: Array.from({ length: themes.slice(0, 6).length || 6 }, () => Math.floor(kpis.totalMentions * (0.1 + Math.random() * 0.2))),
        backgroundColor: [
          getEnterpriseColor('primary.500'),
          getEnterpriseColor('secondary.500'),
          getEnterpriseColor('positive.500'),
          getEnterpriseColor('negative.500'),
          getEnterpriseColor('neutral.500'),
          getEnterpriseColor('primary.300')
        ],
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const FilterDrawer = () => (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-neutral-200 transform transition-transform duration-300 ease-in-out z-50 ${filterDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
          <button
            onClick={() => setFilterDrawerOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            <ModernIcon name="x" className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Sites */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Sites</label>
          <div className="space-y-2">
            {['All Sites', 'Reddit', 'Twitter', 'Instagram', 'TikTok', 'YouTube'].map((site) => (
              <label key={site} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  defaultChecked={site === 'All Sites'}
                />
                <span className="ml-2 text-sm text-neutral-700">{site}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sentiment */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Sentiment</label>
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive Only</option>
            <option value="negative">Negative Only</option>
            <option value="neutral">Neutral Only</option>
          </select>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Keywords</label>
          <input
            type="text"
            placeholder="Enter keywords..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-neutral-200 bg-white">
        <div className="flex space-x-3">
          <button className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200">
            Apply Filters
          </button>
          <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors duration-200">
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  const AnalysisCard = ({ title, children, actions }) => (
    <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );

  const renderAnalysisContent = () => {
    switch (selectedAnalysis) {
      case 'correlation':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalysisCard
              title="Sentiment vs Stock Price Correlation"
              actions={
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Export Data
                </button>
              }
            >
              <div className="h-64">
                <Line data={correlationData} options={chartOptions} />
              </div>
              <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Correlation Coefficient:</span>
                  <span className="font-semibold text-positive-600">+0.73</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-neutral-600">Significance:</span>
                  <span className="font-semibold text-neutral-900">High</span>
                </div>
              </div>
            </AnalysisCard>

            <AnalysisCard
              title="Volume vs Mentions Analysis"
              actions={
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Details
                </button>
              }
            >
              <div className="h-64">
                <Line data={correlationData} options={chartOptions} />
              </div>
              <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">R-squared:</span>
                  <span className="font-semibold text-secondary-600">0.68</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-neutral-600">P-value:</span>
                  <span className="font-semibold text-neutral-900">&lt; 0.001</span>
                </div>
              </div>
            </AnalysisCard>
          </div>
        );

      case 'keywords':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalysisCard
              title="Top Keywords by Frequency"
              actions={
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Word Cloud
                </button>
              }
            >
              <div className="h-64">
                <Bar data={keywordData} options={chartOptions} />
              </div>
            </AnalysisCard>

            <AnalysisCard title="Keyword Sentiment Breakdown">
              <div className="space-y-4">
                {(themes.length > 0 ? themes.slice(0, 4) : ['Quality', 'Pricing', 'Service', 'Reliability']).map((keyword, index) => {
                  const positive = Math.floor(60 + Math.random() * 30);
                  const negative = Math.floor(Math.random() * (100 - positive));
                  const neutral = 100 - positive - negative;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-neutral-900">{keyword}</span>
                        <span className="text-neutral-600">{Math.floor(kpis.totalMentions / 4)} mentions</span>
                      </div>
                      <div className="flex h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="bg-positive-500" style={{ width: `${positive}%` }}></div>
                        <div className="bg-neutral-400" style={{ width: `${neutral}%` }}></div>
                        <div className="bg-negative-500" style={{ width: `${negative}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnalysisCard>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <ModernIcon name="activity" className="w-12 h-12 text-neutral-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Analysis Coming Soon</h3>
            <p className="text-neutral-600">This analysis type is being developed.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Deep-Dive Analysis</h1>
          <p className="text-neutral-600 mt-1">Advanced analytics for {brandName}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
          >
            <ModernIcon name="filter" className="w-4 h-4" strokeWidth={1.5} />
            <span>Filters</span>
          </button>

          <button className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-colors duration-200 shadow-sm">
            <ModernIcon name="download" className="w-4 h-4" strokeWidth={1.5} />
            <span>Export to Reports</span>
          </button>
        </div>
      </div>

      {/* Analysis Type Selector */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Analysis Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {analysisTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedAnalysis(type.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${selectedAnalysis === type.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <ModernIcon name={type.icon} className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-sm font-medium">{type.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Content */}
      {renderAnalysisContent()}

      {/* Insights Panel */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">AI-Generated Insights for {brandName}</h2>
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">
            <div className="flex items-start space-x-3">
              <ModernIcon name="activity" className="w-5 h-5 text-primary-600 mt-0.5" strokeWidth={1.5} />
              <div>
                <h4 className="font-medium text-primary-900">Strong Momentum Detected</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Sentiment shows a positive correlation with engagement growth over the past 30 days.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-negative-50 rounded-lg border-l-4 border-negative-500">
            <div className="flex items-start space-x-3">
              <ModernIcon name="trendingDown" className="w-5 h-5 text-negative-600 mt-0.5" strokeWidth={1.5} />
              <div>
                <h4 className="font-medium text-negative-900">Emerging Sentiment Issue</h4>
                <p className="text-sm text-negative-700 mt-1">
                  "{themes[0] || 'Pricing'}" mentions have increased with localized negative sentiment clusters.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-positive-50 rounded-lg border-l-4 border-positive-500">
            <div className="flex items-start space-x-3">
              <ModernIcon name="trendingUp" className="w-5 h-5 text-positive-600 mt-0.5" strokeWidth={1.5} />
              <div>
                <h4 className="font-medium text-positive-900">Brand Preference Spike</h4>
                <p className="text-sm text-positive-700 mt-1">
                  "{themes[1] || 'Reliability'}" keyword shows strong positive sentiment among power users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer />

      {/* Overlay */}
      {filterDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setFilterDrawerOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default EnterpriseAnalysis;