# 🎭 Multi-Emotion Detection & Rage Index 2.0

## Overview

RageRadar now features advanced multi-emotion detection powered by state-of-the-art AI models, replacing basic positive/negative sentiment with granular emotional analysis.

## What's New

### 1. Multi-Label Emotion Detection

**Before:** Binary sentiment (positive/negative/neutral)

**Now:** Multiple emotions per mention with confidence scores

**Supported Emotions:**
- **Rage Emotions:** anger, fury, frustration, annoyance
- **Negative Emotions:** disgust, disappointment, sadness, fear, disapproval
- **Positive Emotions:** joy, love, admiration, excitement, gratitude, optimism
- **Neutral Emotions:** neutral, surprise, realization, confusion

**Example Output:**
```json
{
  "emotions": [
    { "label": "anger", "score": 0.85, "confidence": "high", "weight": 1.0 },
    { "label": "frustration", "score": 0.72, "confidence": "high", "weight": 0.8 },
    { "label": "disappointment", "score": 0.45, "confidence": "medium", "weight": 0.8 }
  ],
  "primaryEmotion": "anger",
  "emotionDistribution": {
    "anger": 42,
    "frustration": 36,
    "disappointment": 22
  }
}
```

---

### 2. Rage Index 2.0

**Before:** Simple negative percentage

**Now:** Weighted emotion scoring normalized to 0-100 scale

#### Calculation Method

```javascript
// Each emotion has a weight
const weights = {
  anger: 1.0,        // High rage
  frustration: 0.8,  // Medium-high rage
  sadness: 0.6,      // Medium rage
  joy: -0.5,         // Reduces rage
  love: -0.7         // Strongly reduces rage
};

// Weighted score calculation
totalScore = Σ (emotion.score × emotion.weight)

// Normalize to 0-100
rageIndex = ((totalScore + 1) / 2) × 100
```

#### Severity Levels

| Rage Index | Severity | Color | Meaning |
|------------|----------|-------|---------|
| 80-100 | Critical | 🔴 Red | Crisis level - immediate action needed |
| 60-79 | High | 🟠 Orange | Widespread frustration |
| 40-59 | Moderate | 🟡 Yellow | Significant negative sentiment |
| 20-39 | Low | 🟢 Green | Some frustration |
| 0-19 | Minimal | ⚪ Gray | Mostly positive |

---

### 3. Enhanced Analytics

#### Emotion Distribution
See the breakdown of all detected emotions across your brand mentions.

#### Top Emotions
Identify the most frequent emotions associated with your brand.

#### Platform Breakdown
Compare Rage Index across different platforms (Reddit, Twitter, etc.).

#### Time-Series Analysis
Track how emotions and Rage Index change over time.

---

## API Usage

### Analyze Single Text

```javascript
POST /api/analyze/text

{
  "text": "This product is frustrating and disappointing",
  "options": {
    "granular": false  // Use primary model
  }
}

Response:
{
  "emotions": [...],
  "primaryEmotion": "frustration",
  "rageIndex": 75,
  "rageSeverity": "high",
  "emotionDistribution": {...}
}
```

### Analyze Brand (Aggregated)

```javascript
POST /api/analyze/brand

{
  "brandName": "Apple",
  "options": {
    "byPlatform": true,
    "byTime": true,
    "timeGranularity": "day"
  }
}

Response:
{
  "rageIndex": 65,
  "rageSeverity": "high",
  "topEmotions": [
    { "emotion": "frustration", "count": 45, "percentage": 30 },
    { "emotion": "anger", "count": 38, "percentage": 25 },
    { "emotion": "disappointment", "count": 25, "percentage": 17 }
  ],
  "emotionDistribution": {...},
  "platformBreakdown": {
    "reddit": { "rageIndex": 72, "severity": "high" },
    "twitter": { "rageIndex": 58, "severity": "moderate" }
  },
  "trendline": [
    { "timestamp": "2025-12-01", "rageIndex": 60 },
    { "timestamp": "2025-12-02", "rageIndex": 65 },
    { "timestamp": "2025-12-03", "rageIndex": 70 }
  ]
}
```

---

## Configuration

### Enable/Disable Multi-Emotion Detection

**Environment Variable:**
```bash
ENABLE_MULTI_EMOTION=true  # Enable (default)
ENABLE_MULTI_EMOTION=false # Disable (fallback to basic sentiment)
```

**Runtime Toggle:**
```javascript
const analyzer = new EnhancedSentimentAnalyzer();

// Enable
analyzer.setMultiEmotionEnabled(true);

// Disable
analyzer.setMultiEmotionEnabled(false);
```

### Model Selection

**Primary Model:** `j-hartmann/emotion-english-distilroberta-base`
- 7 core emotions
- Fast and accurate
- Recommended for production

**Fallback Model:** `SamLowe/roberta-base-go_emotions`
- 28 granular emotions
- Slower but more detailed
- Use with `granular: true` option

---

## Backward Compatibility

The new system maintains full backward compatibility:

**Old Format Still Supported:**
```json
{
  "sentiment": "negative",  // Mapped from primary emotion
  "score": -0.7            // Mapped from Rage Index
}
```

**Mapping Rules:**
- `rageIndex 0-40` → `sentiment: "positive"`
- `rageIndex 40-60` → `sentiment: "mixed"`
- `rageIndex 60-100` → `sentiment: "negative"`

---

## Performance

### Speed
- Single text analysis: ~200-500ms
- Batch analysis (10 texts): ~1-2 seconds
- Aggregated analysis (100 mentions): ~3-5 seconds

### Rate Limits
- Hugging Face API: 30 requests/minute (free tier)
- Recommended: Batch processing for large datasets

### Caching
Results are cached for 1 hour to improve performance and reduce API calls.

---

## UI Updates

### Dashboard
- **Emotion Breakdown Chart:** Pie chart showing emotion distribution
- **Rage Index Gauge:** Visual indicator with severity color
- **Top Emotions List:** Most frequent emotions with counts
- **Emotion Badges:** Color-coded badges on each mention

### Reports
- **Emotion Timeline:** Track emotion changes over time
- **Platform Comparison:** Compare emotions across platforms
- **Severity Heatmap:** Visualize rage intensity

---

## Best Practices

### 1. Use Batch Processing
```javascript
// Good: Batch processing
const results = await analyzer.analyzeBatch(texts);

// Avoid: Individual calls in loop
for (const text of texts) {
  await analyzer.analyze(text); // Slow!
}
```

### 2. Enable Caching
```javascript
// Cache results for frequently accessed brands
const cacheKey = `brand_${brandId}_${date}`;
const cached = cache.get(cacheKey);
if (cached) return cached;
```

### 3. Monitor API Usage
```javascript
// Track Hugging Face API calls
logger.info('Emotion analysis', {
  textsAnalyzed: texts.length,
  apiCallsUsed: Math.ceil(texts.length / 10)
});
```

### 4. Gradual Rollout
```javascript
// Test with subset of users first
const useMultiEmotion = user.betaTester || Math.random() < 0.1;
analyzer.setMultiEmotionEnabled(useMultiEmotion);
```

---

## Troubleshooting

### Issue: API Rate Limit Exceeded

**Solution:**
```javascript
// Implement exponential backoff
async function analyzeWithRetry(text, retries = 3) {
  try {
    return await analyzer.analyze(text);
  } catch (error) {
    if (error.message.includes('rate limit') && retries > 0) {
      await sleep(2000 * (4 - retries));
      return analyzeWithRetry(text, retries - 1);
    }
    throw error;
  }
}
```

### Issue: Slow Performance

**Solutions:**
1. Use batch processing
2. Enable caching
3. Reduce analysis frequency
4. Use basic sentiment for non-critical analyses

### Issue: Inaccurate Emotions

**Solutions:**
1. Try granular model for more detail
2. Provide more context in text
3. Review and report edge cases
4. Consider custom fine-tuning (Enterprise)

---

## Migration Guide

### From Basic Sentiment to Multi-Emotion

**Step 1:** Enable feature flag
```bash
ENABLE_MULTI_EMOTION=true
```

**Step 2:** Update database schema
```javascript
// Add emotions field to mentions
{
  emotions: [
    { label: 'anger', score: 0.85, confidence: 'high' }
  ],
  primaryEmotion: 'anger',
  rageIndex: 75,
  rageSeverity: 'high'
}
```

**Step 3:** Update UI components
```javascript
// Old
<SentimentBadge sentiment={mention.sentiment} />

// New
<EmotionBadges emotions={mention.emotions} />
<RageIndexGauge rageIndex={mention.rageIndex} severity={mention.rageSeverity} />
```

**Step 4:** Test thoroughly
- Verify API responses
- Check UI rendering
- Monitor performance
- Validate accuracy

---

## Future Enhancements

### Planned Features
- Custom emotion models per industry
- Emotion intensity tracking
- Emotion shift detection
- Comparative emotion analysis
- Emotion-based alerts

### Research Areas
- Sarcasm detection improvements
- Context-aware emotion analysis
- Multi-language support
- Real-time emotion streaming

---

## Resources

### Models
- **Primary:** https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
- **Fallback:** https://huggingface.co/SamLowe/roberta-base-go_emotions

### Documentation
- Hugging Face API: https://huggingface.co/docs/api-inference
- Emotion Detection: https://huggingface.co/tasks/text-classification

### Support
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@rageradar.com
- Slack: #rageradar-support

---

**Last Updated:** December 2025  
**Version:** 2.0.0  
**Status:** Production Ready ✅
