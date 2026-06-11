import React, { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    timeRange: '7d',
    platform: 'all',
    sentiment: 'all',
    emotion: 'all',
    keyword: '',
    geography: 'all',
    dateRange: {
      start: null,
      end: null
    },
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  // Update a single filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update multiple filters at once
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Apply filters (useful for batch updates)
  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  // Reset all filters to default
  const resetFilters = () => {
    const defaultFilters = {
      timeRange: '7d',
      platform: 'all',
      sentiment: 'all',
      emotion: 'all',
      keyword: '',
      dateRange: {
        start: null,
        end: null
      },
      sortBy: 'timestamp',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  // Get active filter count (excluding defaults)
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.platform !== 'all') count++;
    if (filters.sentiment !== 'all') count++;
    if (filters.emotion !== 'all') count++;
    if (filters.keyword.trim()) count++;
    if (filters.dateRange.start && filters.dateRange.end) count++;
    return count;
  };

  // Check if filters have changed from applied state
  const hasUnappliedChanges = () => {
    return JSON.stringify(filters) !== JSON.stringify(appliedFilters);
  };

  // Get filter summary text
  const getFilterSummary = () => {
    const parts = [];
    
    if (filters.platform !== 'all') {
      parts.push(`Platform: ${filters.platform}`);
    }
    
    if (filters.sentiment !== 'all') {
      parts.push(`Sentiment: ${filters.sentiment}`);
    }
    
    if (filters.emotion !== 'all') {
      parts.push(`Emotion: ${filters.emotion}`);
    }
    
    if (filters.keyword.trim()) {
      parts.push(`Keyword: "${filters.keyword}"`);
    }
    
    if (filters.timeRange !== '7d') {
      const timeRangeLabels = {
        '24h': 'Last 24 Hours',
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days',
        '90d': 'Last 90 Days'
      };
      parts.push(`Time: ${timeRangeLabels[filters.timeRange] || filters.timeRange}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'No filters applied';
  };

  // Auto-apply filters after a short delay (for real-time filtering)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const value = {
    filters,
    appliedFilters,
    updateFilter,
    updateFilters,
    applyFilters,
    resetFilters,
    getActiveFilterCount,
    hasUnappliedChanges,
    getFilterSummary
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;