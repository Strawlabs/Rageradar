import React, { useState } from 'react';
import { useFilters } from '../../contexts/FilterContext';
import { Filter, X, Search, Calendar, BarChart3, MessageSquare, Heart, Clock } from 'lucide-react';

const FilterBar = ({ 
  showPlatformFilter = true,
  showSentimentFilter = true,
  showEmotionFilter = true,
  showKeywordFilter = true,
  showTimeRangeFilter = true,
  showGeographyFilter = false,
  showSortOptions = true,
  className = "",
  compact = false,
  availablePlatforms = null // New prop for dynamic platforms
}) => {
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    getActiveFilterCount, 
    getFilterSummary 
  } = useFilters();

  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  // Dynamic platform options based on available data
  const getDynamicPlatformOptions = () => {
    // Default platform options with icons
    const allPlatformIcons = {
      'all': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      'twitter': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      'reddit': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      'youtube': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      'facebook': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      'instagram': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
      'tiktok': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
      'linkedin': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      // Add more platform icons as needed
      'trustpilot': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      'glassdoor': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      'amazon': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.548.41-3.156.615-4.83.615-3.268 0-6.306-.756-9.116-2.275-.364-.196-.604-.403-.725-.615-.12-.21-.09-.36.09-.48l.094-.514z"/>
        </svg>
      ),
      // Generic icon for unknown platforms
      'default': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    };

    // Start with "All Platforms" option
    const options = [
      { 
        value: 'all', 
        label: 'All Platforms', 
        icon: allPlatformIcons['all']
      }
    ];

    // Use provided platforms or fallback to default set
    const platformsToShow = availablePlatforms || ['Reddit', 'Twitter', 'Facebook', 'Instagram', 'TikTok', 'LinkedIn'];
    
    // Add dynamic platform options based on available data
    platformsToShow.forEach(platform => {
      const platformKey = platform.toLowerCase();
      options.push({
        value: platformKey,
        label: platform,
        icon: allPlatformIcons[platformKey] || allPlatformIcons['default']
      });
    });

    return options;
  };

  const platformOptions = getDynamicPlatformOptions();

  const sentimentOptions = [
    { 
      value: 'all', 
      label: 'All Sentiments', 
      color: 'text-slate-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    },
    { 
      value: 'positive', 
      label: 'Positive', 
      color: 'text-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    },
    { 
      value: 'negative', 
      label: 'Negative', 
      color: 'text-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    },
    { 
      value: 'neutral', 
      label: 'Neutral', 
      color: 'text-slate-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="8" y1="15" x2="16" y2="15"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    }
  ];

  const geographyOptions = [
    { 
      value: 'all', 
      label: 'Global', 
      color: 'text-slate-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
        </svg>
      )
    },
    { 
      value: 'north-america', 
      label: 'North America', 
      color: 'text-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      )
    },
    { 
      value: 'europe', 
      label: 'Europe', 
      color: 'text-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      )
    },
    { 
      value: 'asia-pacific', 
      label: 'Asia Pacific', 
      color: 'text-purple-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      )
    },
    { 
      value: 'latin-america', 
      label: 'Latin America', 
      color: 'text-orange-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      )
    },
    { 
      value: 'middle-east-africa', 
      label: 'Middle East & Africa', 
      color: 'text-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      )
    }
  ];

  const emotionOptions = [
    { 
      value: 'all', 
      label: 'All Emotions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    },
    { 
      value: 'joy', 
      label: 'Joy', 
      color: 'text-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    },
    { 
      value: 'anger', 
      label: 'Anger', 
      color: 'text-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <path d="M6.5 6.5l.01.01"/>
          <path d="M17.5 6.5l.01.01"/>
        </svg>
      )
    },
    { 
      value: 'fear', 
      label: 'Fear', 
      color: 'text-purple-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="14" r="2"/>
          <circle cx="9" cy="9" r="1"/>
          <circle cx="15" cy="9" r="1"/>
        </svg>
      )
    },
    { 
      value: 'sadness', 
      label: 'Sadness', 
      color: 'text-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 18s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    },
    { 
      value: 'surprise', 
      label: 'Surprise', 
      color: 'text-yellow-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="16" r="2"/>
          <circle cx="9" cy="9" r="1.5"/>
          <circle cx="15" cy="9" r="1.5"/>
        </svg>
      )
    },
    { 
      value: 'trust', 
      label: 'Trust', 
      color: 'text-teal-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      )
    },
    { 
      value: 'anticipation', 
      label: 'Anticipation', 
      color: 'text-pink-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      )
    },
    { 
      value: 'disgust', 
      label: 'Disgust', 
      color: 'text-orange-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9 15h6"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    }
  ];

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const sortOptions = [
    { value: 'timestamp', label: 'Date' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'influence', label: 'Influence' }
  ];

  const activeFilterCount = getActiveFilterCount();

  // Get count of advanced filters only
  const getAdvancedFilterCount = () => {
    let count = 0;
    if (filters.emotion !== 'all') count++;
    if (filters.keyword.trim()) count++;
    return count;
  };

  const advancedFilterCount = getAdvancedFilterCount();

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
          </div>
          {activeFilterCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Basic Filters - Always Visible */}
      <div className="space-y-6">
        {/* Time Range Filter */}
        {showTimeRangeFilter && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Time Range:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {timeRangeOptions.map((range) => (
                <button
                  key={range.value}
                  onClick={() => updateFilter('timeRange', range.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                    filters.timeRange === range.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Platform Filter */}
        {showPlatformFilter && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Platform:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {platformOptions.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => updateFilter('platform', platform.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 border ${
                    filters.platform === platform.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {platform.icon}
                  <span>{platform.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sentiment Filter */}
        {showSentimentFilter && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
              <Heart className="w-4 h-4" />
              <span className="font-medium">Sentiment:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {sentimentOptions.map((sentiment) => (
                <button
                  key={sentiment.value}
                  onClick={() => updateFilter('sentiment', sentiment.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border flex items-center gap-2 ${
                    filters.sentiment === sentiment.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : `text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600`
                  }`}
                >
                  {sentiment.icon}
                  {sentiment.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Geography Filter */}
        {showGeographyFilter && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                <path d="M2 12h20"/>
              </svg>
              <span className="font-medium">Geography:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {geographyOptions.map((geography) => (
                <button
                  key={geography.value}
                  onClick={() => updateFilter('geography', geography.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border flex items-center gap-2 ${
                    filters.geography === geography.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : `text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600`
                  }`}
                >
                  {geography.icon}
                  {geography.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Advanced Filters - Expandable Section */}
      {(showEmotionFilter || showKeywordFilter || showSortOptions) && (
        <div className="mt-6">
          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Advanced Filters</span>
              {advancedFilterCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {advancedFilterCount}
                </span>
              )}
              <svg 
                className={`w-4 h-4 transform transition-transform ${isAdvancedExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isAdvancedExpanded && (
              <button
                onClick={() => setIsAdvancedExpanded(false)}
                className="text-sm text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Collapse
              </button>
            )}
          </div>

          {/* Advanced Filter Controls */}
          {isAdvancedExpanded && (
            <div className="space-y-6 pl-6 border-l-2 border-orange-200 dark:border-orange-800">
              {/* Emotion Filter */}
              {showEmotionFilter && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Emotion:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {emotionOptions.map((emotion) => (
                      <button
                        key={emotion.value}
                        onClick={() => updateFilter('emotion', emotion.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border flex items-center gap-2 ${
                          filters.emotion === emotion.value
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : `text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600`
                        }`}
                      >
                        {emotion.icon}
                        {emotion.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Filter */}
              {showKeywordFilter && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                    <Search className="w-4 h-4" />
                    <span className="font-medium">Search:</span>
                  </div>
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={filters.keyword}
                      onChange={(e) => updateFilter('keyword', e.target.value)}
                      placeholder="Search keywords..."
                      className="w-full px-4 py-2 pl-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Sort Options */}
              {showSortOptions && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-medium">Sort by:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {sortOptions.map((sort) => (
                      <button
                        key={sort.value}
                        onClick={() => updateFilter('sortBy', sort.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                          filters.sortBy === sort.value
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                    <button
                      onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600"
                      title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      <svg className={`w-4 h-4 transform transition-transform ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Summary */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {getFilterSummary()}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;