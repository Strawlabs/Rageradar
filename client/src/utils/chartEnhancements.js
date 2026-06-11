// Chart.js enhancement utilities for consistent styling and improved UX
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  RadialLinearScale
} from 'chart.js';

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  RadialLinearScale
);

// Enhanced color palette for sentiment analysis
export const sentimentColors = {
  positive: '#10B981',
  neutral: '#6B7280', 
  negative: '#EF4444',
  mixed: '#F59E0B'
};

// Platform-specific colors
export const platformColors = {
  reddit: '#FF4500',
  twitter: '#1DA1F2',
  producthunt: '#DA552F',
  trustpilot: '#00B67A',
  google: '#4285F4',
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  tiktok: '#000000'
};

// Enhanced chart options with modern styling
export const getEnhancedChartOptions = (type = 'line', customOptions = {}) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          title: function(context) {
            if (type === 'time') {
              return new Date(context[0].label).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            }
            return context[0].label;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            
            // Format based on data type
            if (context.dataset.label?.toLowerCase().includes('sentiment')) {
              label += context.parsed.y + '%';
            } else if (context.dataset.label?.toLowerCase().includes('mentions')) {
              label += context.parsed.y.toLocaleString() + ' mentions';
            } else {
              label += context.parsed.y;
            }
            
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 3,
        tension: 0.4
      },
      bar: {
        borderRadius: 6,
        borderSkipped: false
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

  // Type-specific enhancements
  switch (type) {
    case 'line':
      baseOptions.scales.y.beginAtZero = false;
      break;
    case 'bar':
      baseOptions.scales.y.beginAtZero = true;
      break;
    case 'pie':
    case 'doughnut':
      delete baseOptions.scales;
      baseOptions.plugins.legend.position = 'bottom';
      break;
    case 'time':
      baseOptions.scales.x.type = 'time';
      baseOptions.scales.x.time = {
        unit: 'day',
        stepSize: 1,
        displayFormats: {
          day: 'MMM dd',
          hour: 'HH:mm',
          minute: 'HH:mm'
        },
        tooltipFormat: 'MMM dd, yyyy'
      };
      baseOptions.scales.x.adapters = {
        date: {
          locale: 'en-US'
        }
      };
      // Add bounds to prevent the error
      baseOptions.scales.x.bounds = 'data';
      baseOptions.scales.x.ticks = {
        ...baseOptions.scales.x.ticks,
        maxTicksLimit: 10,
        autoSkip: true
      };
      break;
  }

  // Merge with custom options
  return mergeDeep(baseOptions, customOptions);
};

// Enhanced dataset styling for sentiment data
export const getSentimentDataset = (data, label = 'Sentiment', options = {}) => {
  return {
    label,
    data,
    borderColor: sentimentColors.positive,
    backgroundColor: sentimentColors.positive + '20',
    borderWidth: 3,
    fill: options.fill || false,
    tension: 0.4,
    pointBackgroundColor: data.map(value => {
      if (value >= 70) return sentimentColors.positive;
      if (value >= 50) return sentimentColors.neutral;
      return sentimentColors.negative;
    }),
    pointBorderColor: '#FFFFFF',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 7,
    ...options
  };
};

// Enhanced dataset styling for platform data
export const getPlatformDataset = (data, platforms, label = 'Mentions', options = {}) => {
  return {
    label,
    data,
    backgroundColor: platforms.map(platform => platformColors[platform] || '#6B7280'),
    borderColor: platforms.map(platform => platformColors[platform] || '#6B7280'),
    borderWidth: 0,
    borderRadius: 8,
    borderSkipped: false,
    ...options
  };
};

// Create gradient backgrounds for charts
export const createGradient = (ctx, colorStart, colorEnd, vertical = true) => {
  const gradient = ctx.createLinearGradient(0, 0, vertical ? 0 : ctx.canvas.width, vertical ? ctx.canvas.height : 0);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

// Enhanced pie chart data with sentiment colors
export const getSentimentPieData = (positive, neutral, negative) => {
  return {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [positive, neutral, negative],
      backgroundColor: [
        sentimentColors.positive,
        sentimentColors.neutral,
        sentimentColors.negative
      ],
      borderWidth: 0,
      hoverBorderWidth: 2,
      hoverBorderColor: '#FFFFFF'
    }]
  };
};

// Export chart as image
export const exportChartAsImage = (chartRef, filename = 'chart') => {
  if (chartRef.current) {
    const canvas = chartRef.current.canvas;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = url;
    link.click();
  }
};

// Export chart data as CSV
export const exportChartAsCSV = (data, filename = 'chart-data') => {
  if (!data || !data.labels || !data.datasets) return;
  
  let csv = 'Label';
  data.datasets.forEach(dataset => {
    csv += `,${dataset.label}`;
  });
  csv += '\n';
  
  data.labels.forEach((label, index) => {
    csv += `${label}`;
    data.datasets.forEach(dataset => {
      csv += `,${dataset.data[index]}`;
    });
    csv += '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.csv`;
  link.href = url;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Validate and fix time series data
export const validateTimeSeriesData = (data) => {
  if (!data || !data.labels || !Array.isArray(data.labels)) {
    return data;
  }

  // Convert labels to proper Date objects if they aren't already
  const validatedLabels = data.labels.map(label => {
    if (label instanceof Date) {
      return label;
    }
    
    // Try to parse as date string
    const date = new Date(label);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If parsing fails, create a sequential date
    const now = new Date();
    const index = data.labels.indexOf(label);
    return new Date(now.getTime() - (data.labels.length - index - 1) * 24 * 60 * 60 * 1000);
  });

  // Ensure we have at least 2 data points with reasonable time difference
  if (validatedLabels.length < 2) {
    const now = new Date();
    return {
      ...data,
      labels: [
        new Date(now.getTime() - 24 * 60 * 60 * 1000),
        now
      ]
    };
  }

  // Check if time range is reasonable (not too large)
  const timeRange = validatedLabels[validatedLabels.length - 1].getTime() - validatedLabels[0].getTime();
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  
  if (timeRange > maxRange) {
    // If range is too large, create a reasonable range
    const now = new Date();
    const newLabels = validatedLabels.map((_, index) => {
      return new Date(now.getTime() - (validatedLabels.length - index - 1) * 24 * 60 * 60 * 1000);
    });
    
    return {
      ...data,
      labels: newLabels
    };
  }

  return {
    ...data,
    labels: validatedLabels
  };
};

// Deep merge utility for options
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Chart animation presets
export const animationPresets = {
  smooth: {
    duration: 750,
    easing: 'easeInOutQuart'
  },
  fast: {
    duration: 300,
    easing: 'easeOutQuart'
  },
  bounce: {
    duration: 1000,
    easing: 'easeOutBounce'
  },
  none: {
    duration: 0
  }
};

// Responsive breakpoints for charts
export const getResponsiveOptions = (breakpoint = 'desktop') => {
  const options = {
    mobile: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 10,
            font: { size: 10 }
          }
        }
      },
      elements: {
        point: { radius: 3, hoverRadius: 5 },
        line: { borderWidth: 2 }
      }
    },
    tablet: {
      plugins: {
        legend: {
          labels: {
            padding: 15,
            font: { size: 11 }
          }
        }
      },
      elements: {
        point: { radius: 3.5, hoverRadius: 5.5 },
        line: { borderWidth: 2.5 }
      }
    },
    desktop: {
      // Default options already optimized for desktop
    }
  };
  
  return options[breakpoint] || options.desktop;
};