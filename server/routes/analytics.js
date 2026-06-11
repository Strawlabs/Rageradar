const express = require('express');
const router = express.Router();

// In-memory storage for demo (use database in production)
let analyticsEvents = [];
let dashboardMetrics = {
  goalAchievement: [],
  timeToInsight: [],
  frictionPoints: [],
  cooperAdherence: [],
  abTestResults: [],
  userJourneys: []
};

// Store analytics event
router.post('/events', (req, res) => {
  try {
    const event = {
      ...req.body,
      timestamp: Date.now(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    analyticsEvents.push(event);
    
    // Process event for dashboard metrics
    processEventForDashboard(event);
    
    // Keep only last 10000 events to prevent memory issues
    if (analyticsEvents.length > 10000) {
      analyticsEvents = analyticsEvents.slice(-10000);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics event error:', error);
    res.status(500).json({ error: 'Failed to store analytics event' });
  }
});

// Get dashboard data
router.get('/dashboard', (req, res) => {
  try {
    const range = req.query.range || '7d';
    const filteredMetrics = filterMetricsByTimeRange(dashboardMetrics, range);
    
    const dashboardData = {
      ...filteredMetrics,
      summary: generateSummaryStats(filteredMetrics),
      abTests: getActiveABTests(),
      userJourneys: getCommonUserJourneys(range)
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get specific metric data
router.get('/metrics/:metricType', (req, res) => {
  try {
    const { metricType } = req.params;
    const range = req.query.range || '7d';
    
    const metrics = filterMetricsByTimeRange(
      { [metricType]: dashboardMetrics[metricType] || [] },
      range
    );

    res.json(metrics[metricType] || []);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get A/B test results
router.get('/ab-tests', (req, res) => {
  try {
    const abTests = getActiveABTests();
    res.json(abTests);
  } catch (error) {
    console.error('A/B test error:', error);
    res.status(500).json({ error: 'Failed to fetch A/B test data' });
  }
});

// Get user journey analysis
router.get('/user-journeys', (req, res) => {
  try {
    const range = req.query.range || '7d';
    const journeys = getCommonUserJourneys(range);
    res.json(journeys);
  } catch (error) {
    console.error('User journey error:', error);
    res.status(500).json({ error: 'Failed to fetch user journey data' });
  }
});

// Get friction point analysis
router.get('/friction-points', (req, res) => {
  try {
    const range = req.query.range || '7d';
    const frictionAnalysis = analyzeFrictionPoints(range);
    res.json(frictionAnalysis);
  } catch (error) {
    console.error('Friction analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze friction points' });
  }
});

// Helper Functions
function processEventForDashboard(event) {
  const { type, data } = event;

  switch (type) {
    case 'goal_completed':
      dashboardMetrics.goalAchievement.push({
        goalId: data.goalId,
        completionTime: data.completionTime,
        achieved: data.achieved,
        timestamp: event.timestamp
      });
      break;

    case 'time_to_first_insight':
      dashboardMetrics.timeToInsight.push({
        timeMs: data.timeMs,
        userType: data.userType,
        pathway: data.pathway,
        timestamp: event.timestamp
      });
      break;

    case 'friction_point':
      dashboardMetrics.frictionPoints.push({
        type: data.type,
        context: data.data,
        timestamp: event.timestamp
      });
      break;

    case 'cooper_adherence':
      dashboardMetrics.cooperAdherence.push({
        principle: data.principle,
        score: data.score,
        context: data.context,
        timestamp: event.timestamp
      });
      break;

    case 'ab_test_conversion':
      const existingTest = dashboardMetrics.abTestResults.find(t => t.testId === data.testId);
      if (existingTest) {
        if (!existingTest.conversions[data.variant]) {
          existingTest.conversions[data.variant] = [];
        }
        existingTest.conversions[data.variant].push({
          type: data.conversionType,
          value: data.value,
          timestamp: event.timestamp
        });
      }
      break;

    case 'journey_step':
      dashboardMetrics.userJourneys.push({
        sessionId: data.sessionId,
        action: data.action,
        context: data.context,
        timestamp: event.timestamp
      });
      break;
  }
}

function filterMetricsByTimeRange(metrics, range) {
  const now = Date.now();
  const timeRanges = {
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  const cutoff = now - (timeRanges[range] || timeRanges['7d']);

  const filtered = {};
  Object.keys(metrics).forEach(key => {
    filtered[key] = metrics[key].filter(item => item.timestamp > cutoff);
  });

  return filtered;
}

function generateSummaryStats(metrics) {
  const avgTimeToInsight = metrics.timeToInsight.length > 0 
    ? metrics.timeToInsight.reduce((sum, item) => sum + item.timeMs, 0) / metrics.timeToInsight.length / 1000
    : 0;

  const goalAchievementRate = metrics.goalAchievement.length > 0
    ? (metrics.goalAchievement.filter(g => g.achieved).length / metrics.goalAchievement.length) * 100
    : 0;

  const avgCooperScore = metrics.cooperAdherence.length > 0
    ? metrics.cooperAdherence.reduce((sum, item) => sum + item.score, 0) / metrics.cooperAdherence.length
    : 0;

  return {
    avgTimeToInsight: Math.round(avgTimeToInsight * 10) / 10,
    goalAchievementRate: Math.round(goalAchievementRate),
    totalFrictionPoints: metrics.frictionPoints.length,
    avgCooperScore: Math.round(avgCooperScore)
  };
}

function getActiveABTests() {
  // Mock A/B test data - in production, this would come from your A/B testing platform
  return [
    {
      testId: 'onboarding_flow_v2',
      name: 'Onboarding Flow Optimization',
      variants: ['original', 'simplified'],
      status: 'running',
      startDate: Date.now() - (7 * 24 * 60 * 60 * 1000),
      results: {
        original: { conversions: 156, total: 200, rate: 0.78 },
        simplified: { conversions: 164, total: 200, rate: 0.82 }
      },
      confidence: 0.95,
      winner: 'simplified'
    },
    {
      testId: 'dashboard_layout_v3',
      name: 'Dashboard Layout Test',
      variants: ['grid', 'list'],
      status: 'running',
      startDate: Date.now() - (3 * 24 * 60 * 60 * 1000),
      results: {
        grid: { conversions: 130, total: 200, rate: 0.65 },
        list: { conversions: 126, total: 200, rate: 0.63 }
      },
      confidence: 0.67,
      winner: null
    }
  ];
}

function getCommonUserJourneys(range) {
  // Analyze user journey patterns from stored events
  const journeyEvents = dashboardMetrics.userJourneys;
  const sessionJourneys = {};

  // Group events by session
  journeyEvents.forEach(event => {
    if (!sessionJourneys[event.sessionId]) {
      sessionJourneys[event.sessionId] = [];
    }
    sessionJourneys[event.sessionId].push(event);
  });

  // Analyze common patterns
  const pathCounts = {};
  Object.values(sessionJourneys).forEach(journey => {
    const path = journey
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(step => step.action)
      .slice(0, 5) // First 5 steps
      .join(' → ');
    
    pathCounts[path] = (pathCounts[path] || 0) + 1;
  });

  // Return top 5 most common journeys
  return Object.entries(pathCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([path, count]) => ({
      path,
      count,
      percentage: Math.round((count / Object.keys(sessionJourneys).length) * 100)
    }));
}

function analyzeFrictionPoints(range) {
  const frictionPoints = dashboardMetrics.frictionPoints;
  
  const frictionTypes = {};
  frictionPoints.forEach(fp => {
    frictionTypes[fp.type] = (frictionTypes[fp.type] || 0) + 1;
  });

  const topFrictionPoints = Object.entries(frictionTypes)
    .sort(([,a], [,b]) => b - a)
    .map(([type, count]) => ({ type, count }));

  return {
    total: frictionPoints.length,
    byType: topFrictionPoints,
    trend: calculateFrictionTrend(frictionPoints)
  };
}

function calculateFrictionTrend(frictionPoints) {
  const now = Date.now();
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);

  const thisWeek = frictionPoints.filter(fp => fp.timestamp > weekAgo).length;
  const lastWeek = frictionPoints.filter(fp => 
    fp.timestamp > twoWeeksAgo && fp.timestamp <= weekAgo
  ).length;

  const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
  
  return {
    thisWeek,
    lastWeek,
    change: Math.round(change)
  };
}

module.exports = router;