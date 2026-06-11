import React, { useState, useRef, useCallback } from 'react';
import { ChartContainer } from './ui/chart-container';

const InteractiveChart = ({ 
  data = [], 
  onTimeRangeSelect, 
  onDataPointClick,
  className = "",
  height = 300,
  showBrush = true,
  allowZoom = true 
}) => {
  const [selectedRange, setSelectedRange] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const chartRef = useRef(null);
  const svgRef = useRef(null);

  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { date: '2024-01-01', sentiment: 65, mentions: 120, platform: 'reddit' },
    { date: '2024-01-02', sentiment: 72, mentions: 145, platform: 'twitter' },
    { date: '2024-01-03', sentiment: 58, mentions: 98, platform: 'reddit' },
    { date: '2024-01-04', sentiment: 81, mentions: 167, platform: 'producthunt' },
    { date: '2024-01-05', sentiment: 45, mentions: 89, platform: 'trustpilot' },
    { date: '2024-01-06', sentiment: 78, mentions: 134, platform: 'twitter' },
    { date: '2024-01-07', sentiment: 69, mentions: 156, platform: 'reddit' },
    { date: '2024-01-08', sentiment: 83, mentions: 178, platform: 'google' },
    { date: '2024-01-09', sentiment: 52, mentions: 112, platform: 'youtube' },
    { date: '2024-01-10', sentiment: 76, mentions: 143, platform: 'twitter' }
  ];

  // Chart dimensions
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = 600;
  const chartHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = useCallback((index) => {
    return (index / (chartData.length - 1)) * chartWidth;
  }, [chartData.length, chartWidth]);

  const yScale = useCallback((value) => {
    const maxValue = Math.max(...chartData.map(d => d.sentiment));
    const minValue = Math.min(...chartData.map(d => d.sentiment));
    return chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  }, [chartData, chartHeight]);

  // Generate SVG path for line chart
  const generatePath = useCallback(() => {
    return chartData.map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.sentiment);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [chartData, xScale, yScale]);

  // Handle mouse events for direct manipulation
  const handleMouseDown = (e) => {
    if (!showBrush) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - margin.left;
    
    setIsDragging(true);
    setDragStart(x);
    setSelectedRange({ start: x, end: x });
  };

  const handleMouseMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - margin.left;
    
    if (isDragging && dragStart !== null) {
      setSelectedRange({
        start: Math.min(dragStart, x),
        end: Math.max(dragStart, x)
      });
    }
    
    // Find closest data point for hover effect
    const closestIndex = Math.round((x / chartWidth) * (chartData.length - 1));
    if (closestIndex >= 0 && closestIndex < chartData.length) {
      setHoveredPoint({ ...chartData[closestIndex], index: closestIndex });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedRange && onTimeRangeSelect) {
      const startIndex = Math.round((selectedRange.start / chartWidth) * (chartData.length - 1));
      const endIndex = Math.round((selectedRange.end / chartWidth) * (chartData.length - 1));
      
      onTimeRangeSelect({
        startDate: chartData[Math.min(startIndex, endIndex)]?.date,
        endDate: chartData[Math.max(startIndex, endIndex)]?.date,
        startIndex: Math.min(startIndex, endIndex),
        endIndex: Math.max(startIndex, endIndex)
      });
    }
    
    setIsDragging(false);
    setDragStart(null);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setSelectedRange(null);
    }
  };

  // Handle data point clicks
  const handleDataPointClick = (point, index) => {
    if (onDataPointClick) {
      onDataPointClick(point, index);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedRange(null);
  };

  // Get sentiment color
  const getSentimentColor = (sentiment) => {
    if (sentiment >= 70) return '#10b981'; // green
    if (sentiment >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // Get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      reddit: '#ff4500',
      twitter: '#1da1f2',
      producthunt: '#da552f',
      trustpilot: '#00b67a',
      google: '#4285f4',
      youtube: '#ff0000'
    };
    return colors[platform] || '#6b7280';
  };

  return (
    <ChartContainer
      title="Sentiment Timeline"
      subtitle="Click and drag to select time range • Click points for details"
      onExport={() => {
        console.log('Exporting sentiment timeline chart');
      }}
      onRefresh={() => {
        console.log('Refreshing sentiment timeline data');
      }}
      className={className}
    >
      <div className="relative">
        {selectedRange && (
          <div className="absolute top-0 right-0 z-10">
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors duration-200"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Interactive Chart */}
        <div className="relative mt-4" ref={chartRef}>
        <svg
          ref={svgRef}
          width={chartWidth + margin.left + margin.right}
          height={height}
          className="cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Chart Background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            className="hover:fill-gray-50/50 dark:hover:fill-gray-700/50 transition-colors duration-200"
          />

          {/* Grid Lines */}
          <g className="opacity-20">
            {[0, 25, 50, 75, 100].map(value => (
              <line
                key={value}
                x1={margin.left}
                y1={margin.top + yScale(value)}
                x2={margin.left + chartWidth}
                y2={margin.top + yScale(value)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-400"
              />
            ))}
          </g>

          {/* Main Line Chart */}
          <path
            d={generatePath()}
            fill="none"
            stroke="url(#sentimentGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
            transform={`translate(${margin.left}, ${margin.top})`}
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="url(#sentimentGradient)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="url(#sentimentGradient)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d={`${generatePath()} L ${xScale(chartData.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`}
            fill="url(#areaGradient)"
            transform={`translate(${margin.left}, ${margin.top})`}
          />

          {/* Data Points */}
          {chartData.map((point, index) => (
            <g key={index}>
              {/* Data Point Circle */}
              <circle
                cx={margin.left + xScale(index)}
                cy={margin.top + yScale(point.sentiment)}
                r={hoveredPoint?.index === index ? 8 : 5}
                fill={getSentimentColor(point.sentiment)}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:r-8 transition-all duration-200 drop-shadow-md"
                onClick={() => handleDataPointClick(point, index)}
                onMouseEnter={() => setHoveredPoint({ ...point, index })}
              />
              
              {/* Platform Indicator */}
              <circle
                cx={margin.left + xScale(index)}
                cy={margin.top + yScale(point.sentiment)}
                r="2"
                fill={getPlatformColor(point.platform)}
                className="pointer-events-none"
              />
            </g>
          ))}

          {/* Selection Brush */}
          {selectedRange && (
            <rect
              x={margin.left + selectedRange.start}
              y={margin.top}
              width={selectedRange.end - selectedRange.start}
              height={chartHeight}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="2"
              className="pointer-events-none"
            />
          )}

          {/* Axes */}
          <g className="text-gray-500 dark:text-gray-400 text-xs">
            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map(value => (
              <text
                key={value}
                x={margin.left - 10}
                y={margin.top + yScale(value) + 4}
                textAnchor="end"
                className="fill-current"
              >
                {value}%
              </text>
            ))}
            
            {/* X-axis labels */}
            {chartData.filter((_, i) => i % 2 === 0).map((point, index) => (
              <text
                key={index}
                x={margin.left + xScale(index * 2)}
                y={height - 10}
                textAnchor="middle"
                className="fill-current"
              >
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            ))}
          </g>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: margin.left + xScale(hoveredPoint.index),
              top: margin.top + yScale(hoveredPoint.sentiment) - 10
            }}
          >
            <div className="font-semibold mb-1">
              {new Date(hoveredPoint.date).toLocaleDateString()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getSentimentColor(hoveredPoint.sentiment) }}
                />
                <span>Sentiment: {hoveredPoint.sentiment}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getPlatformColor(hoveredPoint.platform) }}
                />
                <span>{hoveredPoint.mentions} mentions</span>
              </div>
              <div className="text-gray-300 capitalize">
                Platform: {hoveredPoint.platform}
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Chart Controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Positive (70%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Neutral (50-70%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Negative (0-50%)</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {allowZoom && (
            <>
              <button
                onClick={() => setZoomLevel(Math.min(zoomLevel * 1.2, 3))}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                title="Zoom In"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel / 1.2, 0.5))}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                title="Zoom Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset(0);
              setSelectedRange(null);
            }}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            Reset
          </button>
        </div>
        </div>
      </div>
    </ChartContainer>
  );
};

export default InteractiveChart;