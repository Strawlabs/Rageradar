import React, { useState, useEffect } from 'react';
import { ModernIcon, enterpriseDesign } from '../utils/enterpriseDesignSystem';

import { useBrand } from '../contexts/BrandContext';
import { calculateKPIs } from '../utils/kpiCalculations';
import { useFilters } from '../contexts/FilterContext';

const EnterpriseMentions = () => {
  const { currentBrand } = useBrand();
  const { filters } = useFilters();
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    site: 'all',
    sentiment: 'all',
    emotion: 'all',
    dateRange: '24h'
  });
  const [expandedMention, setExpandedMention] = useState(null);

  // Simulate real-time mentions based on brand data
  useEffect(() => {
    if (!currentBrand) {
      setLoading(false);
      return;
    }

    const kpis = calculateKPIs(currentBrand, filters);
    const brandName = currentBrand.brandName;
    const themes = (currentBrand.themes || []).map(t => typeof t === 'string' ? t : (t.theme || t.name || t.label || ''));

    const generateMention = () => {
      const isPositive = Math.random() * 100 < kpis.averageSentiment;
      const sentiment = isPositive ? 'positive' : (Math.random() > 0.5 ? 'negative' : 'neutral');
      const theme = themes.length > 0 ? themes[Math.floor(Math.random() * themes.length)] : 'quality';

      const contentTemplates = {
        positive: [
          `Really impressed with ${brandName}'s focus on ${theme}. Great experience!`,
          `Been using ${brandName} for a while and the ${theme} is definitely a highlight.`,
          `Innovation at ${brandName} is reaching new heights. Love the ${theme}!`,
          `Shoutout to ${brandName} for the excellent support on ${theme} issues.`
        ],
        negative: [
          `Disappointed with ${brandName} lately. The ${theme} really needs work.`,
          `Anyone else having trouble with ${brandName}'s ${theme}? Extremely frustrating.`,
          `Why is ${brandName} so expensive when the ${theme} is this inconsistent?`,
          `${brandName} support was a letdown for my ${theme} query.`
        ],
        neutral: [
          `Just checked out ${brandName}. The ${theme} seems okay, nothing special.`,
          `Comparing ${brandName} with others in terms of ${theme}.`,
          `New update from ${brandName} regarding ${theme}. Still testing it out.`,
          `Does ${brandName} offer better options for ${theme}?`
        ]
      };

      const templates = contentTemplates[sentiment];
      const content = templates[Math.floor(Math.random() * templates.length)];

      return {
        id: Math.random().toString(36).substr(2, 9),
        platform: ['Reddit', 'Twitter', 'Instagram', 'TikTok', 'YouTube'][Math.floor(Math.random() * 5)],
        content,
        sentiment,
        emotion: isPositive ? 'joy' : (sentiment === 'negative' ? 'anger' : 'neutral'),
        author: `@user${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        engagement: {
          likes: Math.floor(Math.random() * (kpis.totalMentions / 10)),
          shares: Math.floor(Math.random() * (kpis.totalMentions / 50)),
          comments: Math.floor(Math.random() * (kpis.totalMentions / 100))
        },
        url: 'https://example.com/mention',
        aiSummary: `AI analysis of this ${sentiment} mention regarding ${brandName}'s ${theme}.`
      };
    };

    // Initial load
    const initialMentions = Array.from({ length: 20 }, generateMention);
    setMentions(initialMentions);
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newMention = generateMention();
      setMentions(prev => [newMention, ...prev.slice(0, 49)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentBrand, filters]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-positive-100 text-positive-800';
      case 'negative': return 'bg-negative-100 text-negative-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getSentimentDot = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-positive-500';
      case 'negative': return 'bg-negative-500';
      default: return 'bg-neutral-500';
    }
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      joy: '😊',
      anger: '😠',
      fear: '😨',
      sadness: '😢',
      surprise: '😲',
      neutral: '😐'
    };
    return emojis[emotion] || '😐';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      Reddit: 'mentions',
      Twitter: 'mentions',
      Instagram: 'mentions',
      TikTok: 'mentions',
      YouTube: 'mentions'
    };
    return icons[platform] || 'mentions';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredMentions = mentions.filter(mention => {
    if (searchQuery && !mention.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedFilters.site !== 'all' && mention.platform.toLowerCase() !== selectedFilters.site) {
      return false;
    }
    if (selectedFilters.sentiment !== 'all' && mention.sentiment !== selectedFilters.sentiment) {
      return false;
    }
    if (selectedFilters.emotion !== 'all' && mention.emotion !== selectedFilters.emotion) {
      return false;
    }
    return true;
  });

  const MentionCard = ({ mention }) => {
    const isExpanded = expandedMention === mention.id;

    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-start space-x-4">
          {/* Sentiment Indicator */}
          <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${getSentimentDot(mention.sentiment)}`}></div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <ModernIcon name={getPlatformIcon(mention.platform)} className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-neutral-900">{mention.platform}</span>
                </div>
                <span className="text-sm text-neutral-500">•</span>
                <span className="text-sm text-neutral-500">{mention.author}</span>
                <span className="text-sm text-neutral-500">•</span>
                <span className="text-sm text-neutral-500">{formatTimeAgo(mention.timestamp)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(mention.sentiment)}`}>
                  {mention.sentiment}
                </span>
                <span className="text-lg">{getEmotionEmoji(mention.emotion)}</span>
              </div>
            </div>

            {/* Content */}
            <p className="text-neutral-700 mb-4 leading-relaxed">{mention.content}</p>

            {/* Engagement Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                <span>{mention.engagement.likes} likes</span>
                <span>{mention.engagement.shares} shares</span>
                <span>{mention.engagement.comments} comments</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setExpandedMention(isExpanded ? null : mention.id)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isExpanded ? 'Less' : 'More'}
                </button>
                <button className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors duration-200">
                  <ModernIcon name="share" className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                </button>
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  <ModernIcon name="external" className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">AI Summary</h4>
                  <p className="text-sm text-neutral-700">{mention.aiSummary}</p>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
                    Add to Report
                  </button>
                  <button className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors duration-200">
                    Flag for Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-neutral-200">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-neutral-200 rounded-full mt-2"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 bg-neutral-200 rounded w-20"></div>
                    <div className="h-4 bg-neutral-200 rounded w-16"></div>
                    <div className="h-4 bg-neutral-200 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-neutral-200 rounded w-full"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mentions Stream</h1>
          <p className="text-neutral-600 mt-1">Real-time brand mentions across all platforms</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <div className="w-2 h-2 bg-positive-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>

          <button className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-colors duration-200 shadow-sm">
            <ModernIcon name="download" className="w-4 h-4" strokeWidth={1.5} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ModernIcon name="search" className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
            </div>
            <input
              type="text"
              placeholder="Search mentions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Site Filter */}
          <select
            value={selectedFilters.site}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, site: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Sites</option>
            <option value="reddit">Reddit</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={selectedFilters.sentiment}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, sentiment: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>

          {/* Emotion Filter */}
          <select
            value={selectedFilters.emotion}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, emotion: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Emotions</option>
            <option value="joy">😊 Joy</option>
            <option value="anger">😠 Anger</option>
            <option value="fear">😨 Fear</option>
            <option value="sadness">😢 Sadness</option>
            <option value="surprise">😲 Surprise</option>
            <option value="neutral">😐 Neutral</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <ModernIcon name="activity" className="w-6 h-6 text-primary-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Today</p>
              <p className="text-2xl font-bold text-neutral-900">{filteredMentions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-positive-50 rounded-lg">
              <ModernIcon name="trendingUp" className="w-6 h-6 text-positive-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Positive</p>
              <p className="text-2xl font-bold text-neutral-900">
                {filteredMentions.filter(m => m.sentiment === 'positive').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-negative-50 rounded-lg">
              <ModernIcon name="trendingDown" className="w-6 h-6 text-negative-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Negative</p>
              <p className="text-2xl font-bold text-neutral-900">
                {filteredMentions.filter(m => m.sentiment === 'negative').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary-50 rounded-lg">
              <ModernIcon name="activity" className="w-6 h-6 text-secondary-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Avg/Hour</p>
              <p className="text-2xl font-bold text-neutral-900">47</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mentions List */}
      <div className="space-y-4">
        {filteredMentions.length === 0 ? (
          <div className="text-center py-12">
            <ModernIcon name="search" className="w-12 h-12 text-neutral-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No mentions found</h3>
            <p className="text-neutral-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredMentions.map((mention) => (
            <MentionCard key={mention.id} mention={mention} />
          ))
        )}
      </div>

      {/* Load More */}
      {filteredMentions.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors duration-200">
            Load More Mentions
          </button>
        </div>
      )}
    </div>
  );
};

export default EnterpriseMentions;