import React, { useState, useEffect } from 'react';

const PlatformFilter = ({ 
  selectedPlatforms = [], 
  onChange, 
  className = "",
  disabled = false,
  showSelectAll = true 
}) => {
  const [platforms, setPlatforms] = useState([
    {
      id: 'reddit',
      name: 'Reddit',
      icon: '📱',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      description: 'Community discussions',
      count: 1247
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      description: 'Social media posts',
      count: 892
    },
    {
      id: 'producthunt',
      name: 'Product Hunt',
      icon: '🚀',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      description: 'Product reviews',
      count: 456
    },
    {
      id: 'trustpilot',
      name: 'Trustpilot',
      icon: '⭐',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      description: 'Customer reviews',
      count: 234
    },
    {
      id: 'google',
      name: 'Google Reviews',
      icon: '🔍',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      description: 'Business reviews',
      count: 678
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      description: 'Video comments',
      count: 345
    }
  ]);

  // Handle platform toggle with direct manipulation
  const handlePlatformToggle = (platformId) => {
    if (disabled) return;
    
    const newSelected = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(id => id !== platformId)
      : [...selectedPlatforms, platformId];
    
    onChange(newSelected);
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (disabled) return;
    
    const allPlatformIds = platforms.map(p => p.id);
    const newSelected = selectedPlatforms.length === platforms.length ? [] : allPlatformIds;
    onChange(newSelected);
  };

  // Check if platform is selected
  const isPlatformSelected = (platformId) => {
    return selectedPlatforms.includes(platformId);
  };

  // Get selection summary
  const getSelectionSummary = () => {
    if (selectedPlatforms.length === 0) return 'No platforms selected';
    if (selectedPlatforms.length === platforms.length) return 'All platforms';
    return `${selectedPlatforms.length} of ${platforms.length} platforms`;
  };

  return (
    <div className={`${className}`}>
      {/* Header with Select All */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Platform Sources
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getSelectionSummary()}
          </p>
        </div>
        
        {showSelectAll && (
          <button
            onClick={handleSelectAll}
            disabled={disabled}
            className={`
              px-3 py-1 text-xs font-medium rounded-full transition-all duration-200
              ${disabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : selectedPlatforms.length === platforms.length
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transform hover:scale-105 active:scale-95
            `}
          >
            {selectedPlatforms.length === platforms.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Platform Grid with Direct Manipulation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {platforms.map((platform) => {
          const isSelected = isPlatformSelected(platform.id);
          
          return (
            <button
              key={platform.id}
              onClick={() => handlePlatformToggle(platform.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left group
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                }
                ${isSelected
                  ? `${platform.color} border-transparent text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transform-gpu
              `}
              onMouseEnter={(e) => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = isSelected ? '0 4px 14px rgba(0, 0, 0, 0.1)' : 'none';
                }
              }}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${platform.name} platform`}
            >
              {/* Selection Indicator */}
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </div>

              {/* Platform Icon */}
              <div className="flex items-center space-x-3 mb-2">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-lg
                  ${isSelected 
                    ? 'bg-white/20' 
                    : `${platform.color} text-white`
                  }
                  transition-all duration-200
                `}>
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`
                    font-medium text-sm truncate
                    ${isSelected 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-white'
                    }
                  `}>
                    {platform.name}
                  </div>
                </div>
              </div>

              {/* Platform Details */}
              <div className="space-y-1">
                <div className={`
                  text-xs truncate
                  ${isSelected 
                    ? 'text-white/80' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {platform.description}
                </div>
                <div className={`
                  text-xs font-medium
                  ${isSelected 
                    ? 'text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}>
                  {platform.count.toLocaleString()} mentions
                </div>
              </div>

              {/* Hover Effect Overlay */}
              {!isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>
            {selectedPlatforms.reduce((total, platformId) => {
              const platform = platforms.find(p => p.id === platformId);
              return total + (platform?.count || 0);
            }, 0).toLocaleString()} total mentions
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChange(platforms.filter(p => p.count > 500).map(p => p.id))}
            disabled={disabled}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            High volume only
          </button>
          <span>•</span>
          <button
            onClick={() => onChange(['reddit', 'twitter'])}
            disabled={disabled}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            Social only
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformFilter;