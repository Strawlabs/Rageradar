# RageRadar API Documentation v2.0

## Overview

Complete API reference for integrating RageRadar's new features into the frontend.

**Base URL:** `http://localhost:5001/api` (development)  
**Production:** `https://api.rageradar.com/api`

---

## Authentication

All endpoints require Firebase authentication token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${firebaseToken}`,
  'Content-Type': 'application/json'
}
```

---

## Analysis Endpoints

### POST /api/analyze
Analyze brand sentiment with multi-emotion detection

**Request:**
```json
{
  "brandName": "Apple",
  "platforms": ["google", "reddit", "youtube"],
  "options": {
    "multiEmotion": true,
    "includeThemes": true,
    "timeRange": "week"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "brandId": "brand_123",
    "brandName": "Apple",
    "rageIndex": 65,
    "severity": "high",
    "emotions": [
      {
        "label": "frustration",
        "score": 0.78,
        "confidence": "high",
        "weight": 0.8
      }
    ],
    "mentions": [...],
    "platformBreakdown": {
      "reddit": { "rageIndex": 72, "mentionCount": 45 },
      "youtube": { "rageIndex": 58, "mentionCount": 30 }
    },
    "themes": [...],
    "insights": [...]
  }
}
```

**Plan Requirements:** Free (5/month), Starter (50/month), Pro (unlimited)

---

## Event Endpoints

### POST /api/events
Create a new event for tracking

**Request:**
```json
{
  "brandId": "brand_123",
  "userId": "user_456",
  "eventName": "iPhone 16 Launch",
  "eventDate": "2025-09-15",
  "eventType": "launch",
  "preEventDays": 7,
  "postEventDays": 14,
  "description": "New iPhone launch event"
}
```

**Response:**
```json
{
  "success": true,
  "event": {
    "eventId": "evt_789",
    "eventName": "iPhone 16 Launch",
    "status": "analyzing",
    "preEventWindow": {...},
    "postEventWindow": {...}
  }
}
```

**Plan Requirements:** Pro, Enterprise

---

### GET /api/events/:eventId
Get event analysis results

**Response:**
```json
{
  "success": true,
  "event": {
    "eventId": "evt_789",
    "eventName": "iPhone 16 Launch",
    "status": "complete",
    "analysis": {
      "preEventWindow": {
        "rageIndex": 45,
        "mentions": 120,
        "topEmotions": [...]
      },
      "duringEventWindow": {
        "rageIndex": 72,
        "mentions": 450,
        "topEmotions": [...]
      },
      "postEventWindow": {
        "rageIndex": 58,
        "mentions": 280,
        "topEmotions": [...]
      },
      "changes": {
        "rageIndexChange": 27,
        "emotionShift": "excitement → frustration"
      },
      "insights": [...]
    }
  }
}
```

---

### GET /api/brands/:brandId/events
List all events for a brand

**Query Parameters:**
- `limit` (optional): Number of events to return

**Response:**
```json
{
  "success": true,
  "events": [...],
  "count": 5
}
```

---

### GET /api/events/compare?eventIds=id1,id2,id3
Compare multiple events

**Response:**
```json
{
  "success": true,
  "comparison": {
    "events": [
      {
        "eventId": "evt_1",
        "eventName": "Launch 1",
        "rageIndex": 65,
        "rageIndexChange": 20
      }
    ],
    "summary": {
      "avgRageIndex": 60,
      "highestRage": 75,
      "lowestRage": 45
    }
  }
}
```

---

## Insights Endpoints

### POST /api/insights/generate
Generate automated insights

**Request:**
```json
{
  "brandId": "brand_123",
  "currentAnalysisId": "analysis_456",
  "previousAnalysisId": "analysis_455",
  "includeTrendline": true,
  "includeThemes": true,
  "trendlinePeriod": 30
}
```

**Response:**
```json
{
  "success": true,
  "insights": [
    {
      "icon": "🔴",
      "type": "rage_spike_critical",
      "title": "Critical Rage Spike Detected",
      "description": "Rage Index increased by 35 points (58%)",
      "recommendation": "Immediate action required...",
      "priority": "high",
      "score": 100,
      "data": {...}
    }
  ],
  "summary": {
    "icon": "🚨",
    "text": "2 critical issues requiring immediate attention",
    "breakdown": {
      "highPriority": 2,
      "alerts": 3,
      "positive": 1,
      "total": 8
    }
  }
}
```

**Plan Requirements:** Starter (5 types), Pro (all 8 types), Enterprise (all + custom)

---

### GET /api/insights/trendline/:brandId
Get trendline data

**Query Parameters:**
- `period`: Number of days (default: 30)
- `granularity`: 'hour', 'day', 'week', 'month' (default: 'day')

**Response:**
```json
{
  "success": true,
  "trendline": {
    "timeline": [
      {
        "timestamp": "2025-12-01T00:00:00Z",
        "rageIndex": 60,
        "mentionCount": 45,
        "severity": "high",
        "topEmotions": [...]
      }
    ],
    "trends": {
      "direction": "increasing",
      "change": 15,
      "percentChange": 25,
      "significance": "significant"
    },
    "spikes": [
      {
        "timestamp": "2025-12-05T00:00:00Z",
        "rageIndex": 85,
        "deviation": 25,
        "severity": "critical"
      }
    ],
    "movingAverage": [...],
    "summary": {
      "avgRageIndex": 62,
      "peakRageIndex": 85,
      "volatility": "high"
    }
  }
}
```

**Plan Requirements:** Pro (30 days), Enterprise (90+ days)

---

### POST /api/insights/themes
Extract themes from mentions

**Request:**
```json
{
  "mentions": [...],
  "minRageIndex": 60,
  "topN": 10
}
```

**Response:**
```json
{
  "success": true,
  "themes": [
    {
      "theme": "battery life",
      "keywords": ["battery", "battery life", "charging"],
      "frequency": 45,
      "avgRageIndex": 78,
      "intensityScore": 35.1,
      "percentage": 30,
      "examples": [...]
    }
  ],
  "count": 10
}
```

**Plan Requirements:** Pro, Enterprise

---

## Platform Integration Endpoints

### POST /api/platforms/search
Search across multiple platforms

**Request:**
```json
{
  "brandName": "Apple",
  "platforms": ["reddit", "youtube", "producthunt", "appstore"],
  "options": {
    "limit": 100,
    "timeFilter": "week",
    "includeComments": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "mentions": [...],
  "byPlatform": {
    "reddit": [...],
    "youtube": [...],
    "producthunt": [...],
    "appstore": [...]
  },
  "summary": {
    "totalMentions": 450,
    "byPlatform": {
      "reddit": 200,
      "youtube": 150,
      "producthunt": 50,
      "appstore": 50
    }
  }
}
```

**Plan Requirements:**
- Reddit: Starter+
- YouTube: Pro+
- Product Hunt: Pro+
- App Stores: Pro+

---

## User & Plan Endpoints

### GET /api/user/plan
Get current user's plan and usage

**Response:**
```json
{
  "success": true,
  "plan": "pro",
  "features": {
    "maxAnalyses": -1,
    "multiEmotion": true,
    "platforms": ["google", "bing", "serpapi"],
    "integrations": ["reddit", "youtube", "producthunt", "appstore"],
    "eventTracking": true,
    "themeExtraction": true,
    "trendlineDays": 30
  },
  "usage": {
    "analysesThisMonth": 45,
    "remaining": -1
  }
}
```

---

### GET /api/user/usage
Get detailed usage statistics

**Response:**
```json
{
  "success": true,
  "usage": {
    "currentMonth": {
      "analyses": 45,
      "apiCalls": 12500,
      "limit": -1
    },
    "history": [...]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required field",
  "message": "brandName is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No authorization token provided"
}
```

### 403 Forbidden (Plan Limit)
```json
{
  "error": "Analysis limit exceeded",
  "message": "You have used all 50 analyses for this month. Upgrade to continue.",
  "upgrade": true,
  "usage": {
    "used": 50,
    "limit": 50
  }
}
```

### 403 Forbidden (Feature Not Available)
```json
{
  "error": "Feature not available",
  "message": "eventTracking is not available on your current plan (starter). Upgrade to access this feature.",
  "upgrade": true,
  "feature": "eventTracking",
  "currentPlan": "starter"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limits

**By Plan:**
- Free: 10 requests/minute
- Starter: 30 requests/minute
- Pro: 100 requests/minute
- Enterprise: Unlimited

**By Endpoint:**
- Analysis: 5 requests/minute (all plans)
- Insights: 10 requests/minute
- Events: 20 requests/minute
- Other: Standard plan limits

---

## Webhooks (Enterprise Only)

### Event: analysis.completed
Triggered when analysis completes

**Payload:**
```json
{
  "event": "analysis.completed",
  "data": {
    "analysisId": "analysis_123",
    "brandId": "brand_456",
    "rageIndex": 65,
    "severity": "high"
  },
  "timestamp": "2025-12-01T10:30:00Z"
}
```

### Event: insight.critical
Triggered when critical insight detected

**Payload:**
```json
{
  "event": "insight.critical",
  "data": {
    "insightType": "rage_spike_critical",
    "brandId": "brand_456",
    "rageIndex": 95,
    "change": 35
  },
  "timestamp": "2025-12-01T10:30:00Z"
}
```

---

## SDK Examples

### JavaScript/React
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Authorization': `Bearer ${firebaseToken}`
  }
});

// Analyze brand
const analysis = await api.post('/analyze', {
  brandName: 'Apple',
  platforms: ['reddit', 'youtube']
});

// Get insights
const insights = await api.post('/insights/generate', {
  brandId: 'brand_123',
  includeTrendline: true
});

// Create event
const event = await api.post('/events', {
  brandId: 'brand_123',
  eventName: 'Product Launch',
  eventDate: '2025-12-15',
  eventType: 'launch'
});
```

---

## Best Practices

1. **Cache Results:** Cache trendline and theme data for 1 hour
2. **Batch Requests:** Use batch endpoints when possible
3. **Error Handling:** Always handle 403 errors for plan upgrades
4. **Loading States:** Show loading for analysis (30-60s)
5. **Retry Logic:** Implement exponential backoff for 429 errors
6. **Pagination:** Use limit parameter for large datasets

---

**Version:** 2.0  
**Last Updated:** December 2025  
**Status:** Production Ready ✅
