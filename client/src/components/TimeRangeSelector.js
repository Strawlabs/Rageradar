import React, { useState, useRef, useEffect } from 'react';

const TimeRangeSelector = ({ 
  value = '7d', 
  onChange, 
  className = "",
  disabled = false,
  showCustomRange = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const dropdownRef = useRef(null);

  // Predefined time ranges with enhanced metadata
  const timeRanges = [
    { 
      value: '1d', 
      label: '24 Hours', 
      shortLabel: '1D',
      description: 'Last 24 hours',
      icon: '⚡',
      color: 'bg-blue-500'
    },
    { 
      value: '7d', 
      label: '7 Days', 
      shortLabel: '7D',
      description: 'Last week',
      icon: '📅',
      color: 'bg-green-500'
    },
    { 
      value: '30d', 
      label: '30 Days', 
      shortLabel: '30D',
      description: 'Last month',
      icon: '📊',
      color: 'bg-orange-500'
    },
    { 
      value: '90d', 
      label: '90 Days', 
      shortLabel: '90D',
      description: 'Last quarter',
      icon: '📈',
      color: 'bg-purple-500'
    },
    { 
      value: '1y', 
      label: '1 Year', 
      shortLabel: '1Y',
      description: 'Last year',
      icon: '🗓️',
      color: 'bg-red-500'
    }
  ];

  // Find current selection
  const currentRange = timeRanges.find(range => range.value === value) || timeRanges[1];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCustomPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle range selection with direct manipulation
  const handleRangeSelect = (rangeValue) => {
    onChange(rangeValue);
    setIsOpen(false);
    setShowCustomPicker(false);
  };

  // Handle custom range selection
  const handleCustomRange = () => {
    if (customStart && customEnd) {
      const customValue = `custom:${customStart}:${customEnd}`;
      onChange(customValue);
      setIsOpen(false);
      setShowCustomPicker(false);
    }
  };

  // Get relative time description
  const getRelativeTime = (rangeValue) => {
    const now = new Date();
    switch (rangeValue) {
      case '1d':
        return 'Since yesterday';
      case '7d':
        return 'Since last week';
      case '30d':
        return 'Since last month';
      case '90d':
        return 'Since 3 months ago';
      case '1y':
        return 'Since last year';
      default:
        return 'Custom range';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Button with Enhanced Visual Feedback */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
            : isOpen
            ? 'bg-white dark:bg-gray-800 border-red-500 dark:border-red-400 shadow-lg ring-2 ring-red-500/20'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
          }
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          transform hover:scale-[1.02] active:scale-[0.98]
        `}
        aria-label={`Select time range. Currently: ${currentRange.label}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Range Icon */}
        <div className={`w-8 h-8 rounded-lg ${currentRange.color} flex items-center justify-center text-white text-sm`}>
          {currentRange.icon}
        </div>
        
        {/* Range Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
            {currentRange.label}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {getRelativeTime(value)}
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Enhanced Dropdown with Direct Manipulation */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Quick Selection Grid */}
          <div className="p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase tracking-wide">
              Quick Select
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleRangeSelect(range.value)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left
                    ${value === range.value
                      ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400 shadow-md'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent hover:shadow-md'
                    }
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset
                    transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer
                    hover:border-gray-200 dark:hover:border-gray-600
                  `}
                  role="option"
                  aria-selected={value === range.value}
                  onMouseEnter={(e) => {
                    if (value !== range.value) {
                      e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== range.value) {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Range Icon */}
                  <div className={`w-6 h-6 rounded ${range.color} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                    {range.icon}
                  </div>
                  
                  {/* Range Details */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${
                      value === range.value 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {range.shortLabel}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {range.description}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {value === range.value && (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Range Section */}
            {showCustomRange && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => setShowCustomPicker(!showCustomPicker)}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded bg-gray-500 flex items-center justify-center text-white text-xs">
                        📆
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          Custom Range
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Select specific dates
                        </div>
                      </div>
                    </div>
                    <div className={`transition-transform duration-200 ${showCustomPicker ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Custom Date Picker */}
                  {showCustomPicker && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <button
                          onClick={handleCustomRange}
                          disabled={!customStart || !customEnd}
                          className="w-full px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Apply Custom Range
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;