import React, { useRef } from 'react';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { useBrand } from '../contexts/BrandContext';
import { ChartContainer } from './ui/chart-container';
import {
  getEnhancedChartOptions,
  getSentimentDataset,
  getSentimentPieData,
  getPlatformDataset,
  exportChartAsImage,
  exportChartAsCSV,
  sentimentColors,
  platformColors
} from '../utils/chartEnhancements';

const ChartShowcase = ({ brandName }) => {
  const { currentBrand } = useBrand(); // Add useBrand import if needed, assuming it's available or we can just use the prop
  const activeBrandName = brandName || currentBrand?.brandName || 'Brand Analysis';

  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const radarChartRef = useRef(null);

  const baseSentiment = currentBrand?.averageSentiment || 70;
  const baseMentions = currentBrand?.totalMentions || 1000;

  // Generate dynamic dates for the last 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  const timeSeriesData = {
    labels: generateDates(),
    datasets: [
      getSentimentDataset(
        Array(7).fill(0).map(() => Math.max(0, Math.min(100, baseSentiment + (Math.random() - 0.5) * 15))),
        'Sentiment Score',
        { fill: true }
      ),
      {
        label: 'Mentions',
        data: Array(7).fill(0).map(() => Math.max(0, Math.round(baseMentions / 7 + (Math.random() - 0.5) * (baseMentions / 15)))),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F620',
        yAxisID: 'y1',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const platformData = {
    labels: ['Reddit', 'Twitter', 'Product Hunt', 'Trustpilot'],
    datasets: [getPlatformDataset(
      [
        Math.round(baseMentions * 0.4),
        Math.round(baseMentions * 0.3),
        Math.round(baseMentions * 0.15),
        Math.round(baseMentions * 0.15)
      ],
      ['reddit', 'twitter', 'producthunt', 'trustpilot'],
      'Mentions'
    )]
  };

  const sentimentPieData = getSentimentPieData(
    currentBrand?.positivePercentage || 65,
    currentBrand?.neutralPercentage || 25,
    currentBrand?.negativePercentage || 10
  );

  const radarData = {
    labels: ['Quality', 'Service', 'Pricing', 'Features', 'Delivery', 'Support'],
    datasets: [{
      label: activeBrandName,
      data: [78, 65, 58, 82, 71, 75].map(v => Math.max(0, Math.min(100, v + (Math.random() - 0.5) * 10))),
      backgroundColor: sentimentColors.positive + '20',
      borderColor: sentimentColors.positive,
      borderWidth: 2,
      pointBackgroundColor: sentimentColors.positive,
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2
    }]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Enhanced Chart Showcase
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Modern chart containers with professional styling and enhanced functionality
        </p>
      </div>

      {/* Time Series Line Chart */}
      <ChartContainer
        title="Sentiment Timeline"
        subtitle="Sentiment score and mention volume over time"
        onExport={() => {
          if (lineChartRef.current) {
            exportChartAsImage(lineChartRef, `sentiment-timeline-${brandName}`);
          }
        }}
        onRefresh={() => {
          console.log('Refreshing timeline data');
        }}
        onFullscreen={() => {
          console.log('Opening timeline in fullscreen');
        }}
      >
        <div className="h-80">
          <Line
            ref={lineChartRef}
            data={timeSeriesData}
            options={getEnhancedChartOptions('line', {
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Sentiment Score (%)'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Mentions'
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                }
              }
            })}
          />
        </div>
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Bar Chart */}
        <ChartContainer
          title="Platform Breakdown"
          subtitle="Mentions across social platforms"
          onExport={() => {
            if (barChartRef.current) {
              exportChartAsImage(barChartRef, `platform-breakdown-${brandName}`);
            }
          }}
          onRefresh={() => {
            console.log('Refreshing platform data');
          }}
        >
          <div className="h-64">
            <Bar
              ref={barChartRef}
              data={platformData}
              options={getEnhancedChartOptions('bar', {
                plugins: {
                  legend: {
                    display: false
                  }
                }
              })}
            />
          </div>
        </ChartContainer>

        {/* Sentiment Pie Chart */}
        <ChartContainer
          title="Sentiment Distribution"
          subtitle="Overall sentiment breakdown"
          onExport={() => {
            if (pieChartRef.current) {
              exportChartAsImage(pieChartRef, `sentiment-pie-${brandName}`);
            }
          }}
          onRefresh={() => {
            console.log('Refreshing sentiment data');
          }}
        >
          <div className="h-64">
            <Pie
              ref={pieChartRef}
              data={sentimentPieData}
              options={getEnhancedChartOptions('pie')}
            />
          </div>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doughnut Chart */}
        <ChartContainer
          title="Sentiment Doughnut"
          subtitle="Alternative sentiment visualization"
          onExport={() => {
            if (doughnutChartRef.current) {
              exportChartAsImage(doughnutChartRef, `sentiment-doughnut-${brandName}`);
            }
          }}
          onRefresh={() => {
            console.log('Refreshing doughnut data');
          }}
        >
          <div className="h-64">
            <Doughnut
              ref={doughnutChartRef}
              data={sentimentPieData}
              options={getEnhancedChartOptions('doughnut', {
                cutout: '60%',
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              })}
            />
          </div>
        </ChartContainer>

        {/* Radar Chart */}
        <ChartContainer
          title="Aspect Analysis"
          subtitle="Multi-dimensional brand perception"
          onExport={() => {
            if (radarChartRef.current) {
              exportChartAsImage(radarChartRef, `aspect-radar-${brandName}`);
            }
          }}
          onRefresh={() => {
            console.log('Refreshing radar data');
          }}
        >
          <div className="h-64">
            <Radar
              ref={radarChartRef}
              data={radarData}
              options={getEnhancedChartOptions('radar', {
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20
                    }
                  }
                }
              })}
            />
          </div>
        </ChartContainer>
      </div>

      {/* Error State Example */}
      <ChartContainer
        title="Error State Example"
        subtitle="Demonstrates error handling"
        error="Failed to load chart data. Please check your connection."
        onRefresh={() => {
          console.log('Retrying failed chart');
        }}
      >
        {/* This content won't be shown due to error prop */}
      </ChartContainer>

      {/* Loading State Example */}
      <ChartContainer
        title="Loading State Example"
        subtitle="Demonstrates loading state"
        loading={true}
      >
        {/* This content won't be shown due to loading prop */}
      </ChartContainer>

      {/* Feature Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ✨ Enhanced Chart Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Modern Styling</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Rounded corners and shadows</li>
              <li>• Consistent color palette</li>
              <li>• Professional typography</li>
              <li>• Hover animations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Enhanced UX</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Export functionality</li>
              <li>• Refresh capabilities</li>
              <li>• Fullscreen options</li>
              <li>• Loading states</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Error Handling</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Graceful error states</li>
              <li>• Retry mechanisms</li>
              <li>• User-friendly messages</li>
              <li>• Fallback content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartShowcase;