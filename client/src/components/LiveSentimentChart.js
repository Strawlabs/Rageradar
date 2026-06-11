import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LiveSentimentChart = ({ brandData, timeRange = '7d' }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate time-based data points
  const generateTimePoints = (range) => {
    const points = [];
    const now = new Date();
    let intervals, format;

    switch (range) {
      case '24h':
        intervals = 24;
        format = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        for (let i = intervals - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
          points.push({
            label: format(time),
            timestamp: time
          });
        }
        break;
      case '7d':
        intervals = 7;
        format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        for (let i = intervals - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
          points.push({
            label: format(time),
            timestamp: time
          });
        }
        break;
      case '30d':
        intervals = 30;
        format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        for (let i = intervals - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
          points.push({
            label: format(time),
            timestamp: time
          });
        }
        break;
      case '90d':
        intervals = 13; // Show ~13 weeks (90 days / 7 days per week)
        format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        for (let i = intervals - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000)); // Weekly intervals
          points.push({
            label: format(time),
            timestamp: time
          });
        }
        break;
      default:
        return [];
    }
    return points;
  };

  // Generate realistic sentiment data
  const generateSentimentData = (timePoints, brandData) => {
    if (!brandData) return { positive: [], negative: [], neutral: [] };

    const basePositive = brandData.positivePercentage || 60;
    const baseNegative = brandData.negativePercentage || 25;
    const baseNeutral = 100 - basePositive - baseNegative;

    return timePoints.map((point, index) => {
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 20;
      const trendFactor = Math.sin((index / timePoints.length) * Math.PI) * 10;
      
      let positive = Math.max(0, Math.min(100, basePositive + variation + trendFactor));
      let negative = Math.max(0, Math.min(100, baseNegative + (variation * -0.5)));
      let neutral = Math.max(0, 100 - positive - negative);
      
      // Normalize to 100%
      const total = positive + negative + neutral;
      if (total > 0) {
        positive = (positive / total) * 100;
        negative = (negative / total) * 100;
        neutral = (neutral / total) * 100;
      }
      
      return {
        positive: Math.round(positive * 10) / 10,
        negative: Math.round(negative * 10) / 10,
        neutral: Math.round(neutral * 10) / 10
      };
    });
  };

  useEffect(() => {
    const updateChartData = () => {
      setLoading(true);
      
      const timePoints = generateTimePoints(timeRange);
      const sentimentData = generateSentimentData(timePoints, brandData);
      
      const data = {
        labels: timePoints.map(point => point.label),
        datasets: [
          {
            label: 'Positive',
            data: sentimentData.map(d => d.positive),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(34, 197, 94)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'Negative',
            data: sentimentData.map(d => d.negative),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(239, 68, 68)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'Neutral',
            data: sentimentData.map(d => d.neutral),
            borderColor: 'rgb(156, 163, 175)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(156, 163, 175)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          }
        ]
      };
      
      setChartData(data);
      setLoading(false);
    };

    updateChartData();
  }, [brandData, timeRange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
          font: {
            size: 11
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        borderWidth: 2
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading sentiment data...</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No Data Available</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sentiment data will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LiveSentimentChart;