# Frontend Integration Guide

## Overview

This guide helps frontend developers integrate all new RageRadar features into the React application.

---

## Setup

### 1. Install Dependencies

```bash
cd client
npm install recharts react-tooltip framer-motion
```

**New Dependencies:**
- `recharts`: For trendline charts
- `react-tooltip`: For feature tooltips
- `framer-motion`: For animations

---

## Feature Integration

### 1. Multi-Emotion Detection

**Component:** `src/components/EmotionDisplay.jsx`

```jsx
import React from 'react';

const EmotionDisplay = ({ emotions, primaryEmotion }) => {
  const emotionColors = {
    anger: '#DC2626',
    frustration: '#EA580C',
    joy: '#10B981',
    sadness: '#3B82F6',
    // ... more emotions
  };

  return (
    <div className="emotion-display">
      <h3>Detected Emotions</h3>
      
      {/* Primary Emotion */}
      <div className="primary-emotion">
        <span className="emotion-label">{primaryEmotion}</span>
        <span className="emotion-badge">Primary</span>
      </div>

      {/* All Emotions */}
      <div className="emotion-list">
        {emotions.map((emotion) => (
          <div 
            key={emotion.label}
            className="emotion-item"
            style={{ borderColor: emotionColors[emotion.label] }}
          >
            <span className="label">{emotion.label}</span>
            <div className="score-bar">
              <div 
                className="fill"
                style={{ 
                  width: `${emotion.score * 100}%`,
                  backgroundColor: emotionColors[emotion.label]
                }}
              />
            </div>
            <span className="score">{Math.round(emotion.score * 100)}%</span>
            <span className={`confidence ${emotion.confidence}`}>
              {emotion.confidence}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionDisplay;
```

**API Call:**
```javascript
const analyzeWithEmotions = async (brandName) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      brandName,
      options: { multiEmotion: true }
    })
  });
  
  const data = await response.json();
  return data.analysis;
};
```

---

### 2. Rage Index 2.0 Display

**Component:** `src/components/RageIndexGauge.jsx`

```jsx
import React from 'react';

const RageIndexGauge = ({ rageIndex, severity }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#DC2626',
      high: '#EA580C',
      moderate: '#F59E0B',
      low: '#10B981',
      minimal: '#6B7280'
    };
    return colors[severity] || colors.minimal;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      high: '🟠',
      moderate: '🟡',
      low: '🟢',
      minimal: '⚪'
    };
    return icons[severity] || icons.minimal;
  };

  return (
    <div className="rage-index-gauge">
      <div className="gauge-container">
        {/* Circular gauge */}
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="20"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={getSeverityColor(severity)}
            strokeWidth="20"
            strokeDasharray={`${(rageIndex / 100) * 502} 502`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dy=".3em"
            fontSize="48"
            fontWeight="bold"
            fill={getSeverityColor(severity)}
          >
            {rageIndex}
          </text>
        </svg>
      </div>

      <div className="severity-info">
        <span className="icon">{getSeverityIcon(severity)}</span>
        <span className="label">{severity.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default RageIndexGauge;
```

---

### 3. Trendline Chart

**Component:** `src/components/TrendlineChart.jsx`

```jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const TrendlineChart = ({ trendline }) => {
  const { timeline, movingAverage, spikes } = trendline;

  return (
    <div className="trendline-chart">
      <h3>Rage Index Trendline</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={timeline}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleString()}
            formatter={(value) => [`${value}`, 'Rage Index']}
          />
          <Legend />
          
          {/* Actual rage index */}
          <Line 
            type="monotone" 
            dataKey="rageIndex" 
            stroke="#DC2626" 
            strokeWidth={2}
            name="Rage Index"
          />
          
          {/* Moving average */}
          <Line 
            type="monotone" 
            dataKey="movingAverage" 
            stroke="#3B82F6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="7-Day Average"
            data={movingAverage}
          />
          
          {/* Spike markers */}
          {spikes.map((spike, index) => (
            <ReferenceLine
              key={index}
              x={spike.timestamp}
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{ value: '⚠️ Spike', position: 'top' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Trend indicator */}
      <div className="trend-indicator">
        <span className={`trend ${trendline.trends.direction}`}>
          {trendline.trends.direction === 'increasing' ? '📈' : '📉'}
          {trendline.trends.percentChange}% {trendline.trends.direction}
        </span>
      </div>
    </div>
  );
};

export default TrendlineChart;
```

**API Call:**
```javascript
const getTrendline = async (brandId, period = 30) => {
  const response = await fetch(
    `/api/insights/trendline/${brandId}?period=${period}&granularity=day`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  return data.trendline;
};
```

---

### 4. Automated Insights Display

**Component:** `src/components/InsightsPanel.jsx`

```jsx
import React from 'react';

const InsightsPanel = ({ insights, summary }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 border-red-500 text-red-900',
      medium: 'bg-yellow-100 border-yellow-500 text-yellow-900',
      low: 'bg-blue-100 border-blue-500 text-blue-900'
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className="insights-panel">
      {/* Summary */}
      <div className="insights-summary">
        <span className="icon">{summary.icon}</span>
        <p>{summary.text}</p>
      </div>

      {/* Insights list */}
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`insight-card ${getPriorityColor(insight.priority)}`}
          >
            <div className="insight-header">
              <span className="icon">{insight.icon}</span>
              <h4>{insight.title}</h4>
              <span className={`priority-badge ${insight.priority}`}>
                {insight.priority}
              </span>
            </div>

            <p className="description">{insight.description}</p>

            <div className="recommendation">
              <strong>💡 Recommendation:</strong>
              <p>{insight.recommendation}</p>
            </div>

            {/* Show data if available */}
            {insight.data && (
              <details className="insight-data">
                <summary>View Details</summary>
                <pre>{JSON.stringify(insight.data, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
```

---

### 5. Event Tracking Interface

**Component:** `src/components/EventTracker.jsx`

```jsx
import React, { useState } from 'react';

const EventTracker = ({ brandId }) => {
  const [eventData, setEventData] = useState({
    eventName: '',
    eventDate: '',
    eventType: 'launch',
    preEventDays: 7,
    postEventDays: 14
  });

  const createEvent = async () => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        brandId,
        userId: currentUser.uid,
        ...eventData
      })
    });

    const data = await response.json();
    return data.event;
  };

  return (
    <div className="event-tracker">
      <h3>Create Event</h3>
      
      <form onSubmit={(e) => { e.preventDefault(); createEvent(); }}>
        <input
          type="text"
          placeholder="Event Name"
          value={eventData.eventName}
          onChange={(e) => setEventData({...eventData, eventName: e.target.value})}
        />

        <input
          type="date"
          value={eventData.eventDate}
          onChange={(e) => setEventData({...eventData, eventDate: e.target.value})}
        />

        <select
          value={eventData.eventType}
          onChange={(e) => setEventData({...eventData, eventType: e.target.value})}
        >
          <option value="launch">Product Launch</option>
          <option value="crisis">Crisis</option>
          <option value="announcement">Announcement</option>
          <option value="update">Update</option>
          <option value="controversy">Controversy</option>
        </select>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventTracker;
```

---

### 6. Theme Visualization

**Component:** `src/components/ThemeCloud.jsx`

```jsx
import React from 'react';

const ThemeCloud = ({ themes }) => {
  const getThemeSize = (intensityScore) => {
    // Scale font size based on intensity
    return Math.max(12, Math.min(48, intensityScore / 2));
  };

  return (
    <div className="theme-cloud">
      <h3>Top Rage Themes</h3>
      
      <div className="themes-container">
        {themes.map((theme, index) => (
          <div 
            key={index}
            className="theme-item"
            style={{
              fontSize: `${getThemeSize(theme.intensityScore)}px`,
              opacity: 0.5 + (theme.intensityScore / 100)
            }}
          >
            <span className="theme-text">{theme.theme}</span>
            <span className="theme-count">({theme.frequency})</span>
          </div>
        ))}
      </div>

      {/* Theme list */}
      <div className="theme-list">
        {themes.map((theme, index) => (
          <div key={index} className="theme-detail">
            <h4>{index + 1}. {theme.theme}</h4>
            <div className="theme-stats">
              <span>Frequency: {theme.frequency}</span>
              <span>Rage Index: {theme.avgRageIndex}</span>
              <span>Intensity: {theme.intensityScore}</span>
            </div>
            <div className="theme-examples">
              {theme.examples.map((ex, i) => (
                <blockquote key={i}>{ex.text}</blockquote>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeCloud;
```

---

### 7. Plan Upgrade Prompt

**Component:** `src/components/UpgradePrompt.jsx`

```jsx
import React from 'react';

const UpgradePrompt = ({ error, onUpgrade }) => {
  if (!error || !error.upgrade) return null;

  return (
    <div className="upgrade-prompt">
      <div className="prompt-content">
        <h3>⚠️ {error.error}</h3>
        <p>{error.message}</p>

        {error.usage && (
          <div className="usage-info">
            <p>Used: {error.usage.used} / {error.usage.limit}</p>
          </div>
        )}

        <button onClick={onUpgrade} className="upgrade-button">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default UpgradePrompt;
```

---

## State Management

### Context Setup

**`src/contexts/AnalysisContext.jsx`**

```jsx
import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [trendline, setTrendline] = useState(null);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeWithEmotions = async (brandName) => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandName,
          options: { multiEmotion: true, includeThemes: true }
        })
      });

      const data = await response.json();
      setCurrentAnalysis(data.analysis);
      setThemes(data.analysis.themes);
      
      // Generate insights
      await generateInsights(data.analysis.id);
      
      return data.analysis;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (analysisId) => {
    const response = await fetch('/api/insights/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentAnalysisId: analysisId,
        includeTrendline: true,
        includeThemes: true
      })
    });

    const data = await response.json();
    setInsights(data.insights);
    setTrendline(data.trendline);
  };

  return (
    <AnalysisContext.Provider value={{
      currentAnalysis,
      insights,
      trendline,
      themes,
      loading,
      analyzeWithEmotions,
      generateInsights
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => useContext(AnalysisContext);
```

---

## Testing

### Unit Tests

```javascript
// EmotionDisplay.test.jsx
import { render, screen } from '@testing-library/react';
import EmotionDisplay from './EmotionDisplay';

test('displays primary emotion', () => {
  const emotions = [
    { label: 'anger', score: 0.85, confidence: 'high' }
  ];
  
  render(<EmotionDisplay emotions={emotions} primaryEmotion="anger" />);
  expect(screen.getByText('anger')).toBeInTheDocument();
  expect(screen.getByText('Primary')).toBeInTheDocument();
});
```

---

## Deployment Checklist

- [ ] Update API base URL for production
- [ ] Add error boundaries for new components
- [ ] Test all plan restrictions
- [ ] Verify responsive design
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add analytics tracking
- [ ] Test with real data
- [ ] Performance optimization
- [ ] Accessibility audit

---

**Next:** Start with EmotionDisplay component, then RageIndexGauge, then TrendlineChart.
