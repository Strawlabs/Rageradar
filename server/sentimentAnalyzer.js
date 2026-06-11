// Enhanced sentiment analysis with temporal weighting and context understanding
class SentimentAnalyzer {
  constructor() {
    // Comprehensive sentiment lexicons
    this.positiveWords = new Set([
      'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'good', 'love', 'perfect', 'like', 'liked',
      'wonderful', 'outstanding', 'brilliant', 'superb', 'magnificent', 'incredible',
      'impressive', 'remarkable', 'exceptional', 'marvelous', 'terrific', 'fabulous',
      'delightful', 'pleasant', 'satisfying', 'helpful', 'useful', 'valuable', 'quality',
      'reliable', 'efficient', 'effective', 'smooth', 'fast', 'easy', 'simple', 'clean',
      'beautiful', 'elegant', 'innovative', 'creative', 'smart', 'clever', 'intuitive',
      'user-friendly', 'convenient', 'affordable', 'worth', 'recommend', 'satisfied',
      'happy', 'pleased', 'glad', 'excited', 'thrilled', 'impressed', 'grateful',
      // Tech-specific positive terms
      'revolutionary', 'breakthrough', 'cutting-edge', 'state-of-the-art', 'premium',
      'flagship', 'polished', 'seamless', 'responsive', 'fluid', 'sleek', 'refined',
      // More common positive words
      'nice', 'cool', 'sweet', 'solid', 'works', 'working', 'success', 'successful',
      'win', 'winner', 'winning', 'best', 'better', 'improved', 'upgrade', 'updated',
      'fix', 'fixed', 'solved', 'solution', 'launch', 'launched', 'new', 'fresh'
    ]);

    this.negativeWords = new Set([
      'awful', 'terrible', 'horrible', 'bad', 'worst', 'hate', 'disgusting', 'pathetic', 'disappearing', 'miss',
      'useless', 'worthless', 'disappointing', 'frustrating', 'annoying', 'irritating',
      'confusing', 'complicated', 'difficult', 'hard', 'slow', 'buggy', 'broken',
      'failed', 'error', 'problem', 'issue', 'trouble', 'concern', 'complaint', 'poor',
      'cheap', 'expensive', 'overpriced', 'waste', 'regret', 'sorry', 'unfortunately',
      'sadly', 'angry', 'upset', 'mad', 'furious', 'outraged', 'disgusted', 'shocked',
      'appalled', 'disappointed', 'unsatisfied', 'unhappy', 'displeased', 'concerned',
      'worried', 'scared', 'afraid', 'nervous', 'anxious', 'stressed', 'overwhelmed',
      // Tech-specific negative terms
      'laggy', 'glitchy', 'crashed', 'freezing', 'outdated', 'obsolete', 'bloated',
      'clunky', 'unintuitive', 'fragmented', 'inconsistent', 'unreliable',
      // More common negative words
      'sucks', 'suck', 'stupid', 'dumb', 'lame', 'boring', 'meh', 'fail', 'fails',
      'wrong', 'weird', 'strange', 'odd', 'wtf', 'omg', 'ugh', 'argh', 'damn',
      'shit', 'crap', 'trash', 'garbage', 'junk', 'stolen', 'theft', 'steal',
      'monopoly', 'sue', 'sued', 'lawsuit', 'court', 'illegal', 'unfair', 'greedy'
    ]);

    this.intensifiers = new Map([
      ['very', 1.5], ['extremely', 2.0], ['incredibly', 2.0], ['absolutely', 1.8],
      ['completely', 1.7], ['totally', 1.6], ['really', 1.4], ['quite', 1.3],
      ['pretty', 1.2], ['rather', 1.1], ['somewhat', 0.8], ['slightly', 0.7],
      ['barely', 0.5], ['hardly', 0.4], ['not', -1.0], ['never', -1.2], ['no', -0.8]
    ]);

    // Brand-specific keyword mappings for better context
    this.brandKeywords = {
      'apple': {
        positive: ['innovative', 'premium', 'sleek', 'intuitive', 'ecosystem', 'seamless', 'polished', 'refined'],
        negative: ['expensive', 'overpriced', 'locked', 'restrictive', 'proprietary', 'walled-garden'],
        products: ['iphone', 'ipad', 'mac', 'macbook', 'airpods', 'apple watch', 'ios', 'macos', 'safari', 'siri']
      },
      'google': {
        positive: ['free', 'open', 'accessible', 'comprehensive', 'integrated', 'smart', 'ai-powered'],
        negative: ['privacy', 'tracking', 'ads', 'monopoly', 'data-hungry'],
        products: ['android', 'chrome', 'gmail', 'youtube', 'pixel', 'google assistant', 'maps']
      },
      'microsoft': {
        positive: ['productive', 'enterprise', 'reliable', 'compatible', 'versatile'],
        negative: ['bloated', 'complex', 'legacy', 'corporate'],
        products: ['windows', 'office', 'teams', 'xbox', 'surface', 'azure', 'cortana']
      }
    };

    // Sarcasm detection patterns
    this.sarcasmPatterns = [
      /oh (great|wonderful|fantastic)/i,
      /just (perfect|great|wonderful)/i,
      /thanks (a lot|so much)/i,
      /really (helpful|useful|great)/i,
      /exactly what i (wanted|needed)/i
    ];

    // Context negation patterns
    this.negationPatterns = [
      /not (really|very|particularly|especially)/i,
      /hardly|barely|scarcely/i,
      /nothing (good|great|special)/i,
      /far from (perfect|great|good)/i
    ];

    this.emotionKeywords = {
      joy: ['happy', 'excited', 'thrilled', 'delighted', 'cheerful', 'elated', 'joyful'],
      anger: ['angry', 'furious', 'mad', 'outraged', 'irritated', 'annoyed', 'frustrated'],
      sadness: ['sad', 'disappointed', 'depressed', 'upset', 'heartbroken', 'miserable'],
      fear: ['scared', 'afraid', 'terrified', 'worried', 'anxious', 'nervous', 'concerned'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'bewildered'],
      disgust: ['disgusted', 'revolted', 'appalled', 'sickened', 'repulsed', 'nauseated'],
      trust: ['trust', 'reliable', 'dependable', 'confident', 'secure', 'safe', 'certain'],
      anticipation: ['excited', 'eager', 'hopeful', 'optimistic', 'expectant', 'looking forward']
    };
  }

  preprocessText(text) {
    if (!text || typeof text !== 'string') return [];
    
    return text.toLowerCase()
      // Decode HTML entities
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove special characters but keep basic punctuation for context
      .replace(/[^\w\s\.\!\?]/g, ' ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 1); // Changed from 2 to 1 to catch more words
  }

  analyzeSentiment(text, brandName = null, timestamp = null) {
    const words = this.preprocessText(text);
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = words.length;
    let contextModifiers = [];

    // Check for sarcasm
    const isSarcastic = this.detectSarcasm(text);
    if (isSarcastic) {
      contextModifiers.push('sarcasm');
    }

    // Check for negation context
    const hasNegation = this.detectNegation(text);
    if (hasNegation) {
      contextModifiers.push('negation');
    }

    // Get brand-specific keywords if brand is provided
    const brandContext = brandName ? this.getBrandContext(brandName.toLowerCase()) : null;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let wordScore = 0;
      let intensity = 1;
      let contextMultiplier = 1;

      // Check for intensifiers in previous words
      if (i > 0 && this.intensifiers.has(words[i - 1])) {
        intensity = this.intensifiers.get(words[i - 1]);
      }

      // Brand-specific sentiment scoring
      if (brandContext) {
        if (brandContext.positive.includes(word)) {
          wordScore = 1.2 * intensity; // Brand-specific positive words get higher weight
          positiveCount++;
        } else if (brandContext.negative.includes(word)) {
          wordScore = -1.2 * intensity; // Brand-specific negative words get higher weight
          negativeCount++;
        } else if (brandContext.products.includes(word)) {
          contextMultiplier = 1.1; // Product mentions get slight boost
        }
      }

      // Standard sentiment scoring if not brand-specific
      if (wordScore === 0) {
        if (this.positiveWords.has(word)) {
          wordScore = 1 * intensity * contextMultiplier;
          positiveCount++;
        } else if (this.negativeWords.has(word)) {
          wordScore = -1 * intensity * contextMultiplier;
          negativeCount++;
        }
      }

      score += wordScore;
    }

    // Apply context modifiers
    if (isSarcastic) {
      score = score * -0.8; // Flip and reduce intensity for sarcasm
    }
    if (hasNegation) {
      score = score * 0.7; // Reduce intensity for negation
    }

    // Apply temporal weighting if timestamp provided
    let temporalWeight = 1;
    if (timestamp) {
      temporalWeight = this.calculateTemporalWeight(timestamp);
      score = score * temporalWeight;
    }

    // Normalize score based on word count and sentiment word density
    const normalizedScore = totalWords > 0 ? score / Math.sqrt(totalWords) : 0;
    
    // Convert to percentage (0-100 scale) with better scaling
    // Base score of 50, then adjust based on sentiment with wider range
    const sentimentScore = Math.max(0, Math.min(100, 50 + (normalizedScore * 35)));

    // Determine sentiment category with more aggressive thresholds
    let sentiment = 'neutral';
    if (sentimentScore > 55) sentiment = 'positive';      // More aggressive positive
    else if (sentimentScore < 45) sentiment = 'negative'; // More aggressive negative

    // Calculate confidence based on multiple factors
    const sentimentWordCount = positiveCount + negativeCount;
    const wordCoverage = sentimentWordCount / Math.max(1, totalWords);
    const baseConfidence = Math.min(1, wordCoverage * 5); // Boost confidence calculation
    const contextConfidence = contextModifiers.length > 0 ? 1.1 : 1.0; // Context adds confidence
    const brandConfidence = brandContext ? 1.2 : 1.0;
    const lengthBonus = Math.min(1.2, totalWords / 10); // Longer texts get slight confidence boost
    
    const confidence = Math.min(1, baseConfidence * contextConfidence * brandConfidence * lengthBonus);

    return {
      score: sentimentScore,
      sentiment,
      confidence,
      positiveWords: positiveCount,
      negativeWords: negativeCount,
      totalWords,
      contextModifiers,
      temporalWeight,
      brandSpecific: !!brandContext
    };
  }

  // New helper methods
  detectSarcasm(text) {
    return this.sarcasmPatterns.some(pattern => pattern.test(text));
  }

  detectNegation(text) {
    return this.negationPatterns.some(pattern => pattern.test(text));
  }

  getBrandContext(brandName) {
    return this.brandKeywords[brandName] || null;
  }

  calculateTemporalWeight(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const hoursDiff = (now - postTime) / (1000 * 60 * 60);
    
    // Recent posts (< 24h) get higher weight, older posts get lower weight
    if (hoursDiff < 24) return 1.2;
    if (hoursDiff < 72) return 1.1;
    if (hoursDiff < 168) return 1.0; // 1 week
    if (hoursDiff < 720) return 0.9; // 1 month
    return 0.8; // Older than 1 month
  }

  analyzeEmotion(text) {
    const words = this.preprocessText(text);
    const emotionScores = {};

    // Initialize emotion scores
    Object.keys(this.emotionKeywords).forEach(emotion => {
      emotionScores[emotion] = 0;
    });

    // Count emotion keywords
    words.forEach(word => {
      Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.includes(word)) {
          emotionScores[emotion]++;
        }
      });
    });

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionScores)
      .reduce((a, b) => emotionScores[a[0]] > emotionScores[b[0]] ? a : b)[0];

    return {
      dominantEmotion,
      scores: emotionScores,
      confidence: emotionScores[dominantEmotion] / Math.max(1, words.length * 0.05)
    };
  }

  // Optimized batch processing for better performance
  analyzeBatch(texts, brandName = null, timestamps = null, options = {}) {
    const { 
      skipEmotions = true,  // Skip emotion analysis for speed
      skipTrends = true,    // Skip trend analysis for speed
      skipInsights = true   // Skip context insights for speed
    } = options;

    // Fast batch processing - analyze all texts efficiently
    const results = [];
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;
    let totalScore = 0;
    let totalConfidence = 0;

    // Get brand context once for all texts
    const brandContext = brandName ? this.getBrandContext(brandName.toLowerCase()) : null;

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const timestamp = timestamps ? timestamps[i] : null;
      
      // Fast sentiment analysis without full object creation
      const sentiment = this.analyzeSentimentFast(text, brandContext, timestamp);
      
      results.push({
        sentiment,
        text: text.substring(0, 100), // Shorter for memory efficiency
        timestamp,
        index: i
      });

      // Accumulate counts for efficiency
      if (sentiment.sentiment === 'positive') totalPositive++;
      else if (sentiment.sentiment === 'negative') totalNegative++;
      else totalNeutral++;
      
      totalScore += sentiment.score;
      totalConfidence += sentiment.confidence;
    }

    const totalResults = results.length;
    const averageScore = totalResults > 0 ? totalScore / totalResults : 50;
    const averageConfidence = totalResults > 0 ? totalConfidence / totalResults : 0;

    return {
      overall: {
        averageSentiment: averageScore,
        positivePercentage: (totalPositive / totalResults) * 100,
        negativePercentage: (totalNegative / totalResults) * 100,
        neutralPercentage: (totalNeutral / totalResults) * 100,
        confidenceScore: averageConfidence
      },
      individual: results,
      totalAnalyzed: totalResults,
      // Optional expensive operations only if requested
      emotions: skipEmotions ? {} : this.analyzeEmotionsBatch(texts),
      trendAnalysis: skipTrends ? null : this.calculateTrendFast(results, timestamps),
      contextInsights: skipInsights ? [] : this.analyzeContextInsightsFast(results),
      brandSpecificAnalysis: brandName ? this.getBrandSpecificInsights(results, brandName) : null
    };
  }

  // Fast sentiment analysis without expensive operations
  analyzeSentimentFast(text, brandContext = null, timestamp = null) {
    if (!text || typeof text !== 'string') {
      return { score: 50, sentiment: 'neutral', confidence: 0 };
    }

    const words = this.preprocessTextFast(text);
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    const totalWords = words.length;

    // Fast word scoring without complex context analysis
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let wordScore = 0;

      // Brand-specific scoring (if available)
      if (brandContext) {
        if (brandContext.positive.includes(word)) {
          wordScore = 1.5; // Higher weight for brand-specific
          positiveCount++;
        } else if (brandContext.negative.includes(word)) {
          wordScore = -1.5;
          negativeCount++;
        }
      }

      // Standard sentiment scoring
      if (wordScore === 0) {
        if (this.positiveWords.has(word)) {
          wordScore = 1;
          positiveCount++;
        } else if (this.negativeWords.has(word)) {
          wordScore = -1;
          negativeCount++;
        }
      }

      score += wordScore;
    }

    // Improved scoring algorithm for better distribution
    const sentimentWordRatio = (positiveCount + negativeCount) / Math.max(1, totalWords);
    const normalizedScore = totalWords > 0 ? score / Math.max(1, Math.sqrt(totalWords)) : 0;
    
    // Better scaling: Base 50, wider range ±35 for more aggressive scoring
    const sentimentScore = Math.max(0, Math.min(100, 50 + (normalizedScore * 35)));

    // More aggressive thresholds for better distribution
    let sentiment = 'neutral';
    if (sentimentScore > 55) sentiment = 'positive';      // More aggressive for better distribution
    else if (sentimentScore < 45) sentiment = 'negative'; // More aggressive for better distribution

    // Simple confidence based on sentiment word density
    const confidence = Math.min(1, sentimentWordRatio * 3);

    return {
      score: sentimentScore,
      sentiment,
      confidence,
      positiveWords: positiveCount,
      negativeWords: negativeCount,
      totalWords
    };
  }

  // Faster text preprocessing
  preprocessTextFast(text) {
    return text.toLowerCase()
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/[^\w\s]/g, ' ')          // Remove special chars
      .replace(/\s+/g, ' ')              // Normalize whitespace
      .trim()
      .split(' ')
      .filter(word => word.length > 2);  // Filter short words
  }

  // Fast helper methods for optional expensive operations
  analyzeEmotionsBatch(texts) {
    // Simplified emotion analysis for batch processing
    const emotionCounts = {};
    texts.forEach(text => {
      const emotion = this.analyzeEmotion(text);
      const dominantEmotion = emotion.dominantEmotion;
      emotionCounts[dominantEmotion] = (emotionCounts[dominantEmotion] || 0) + 1;
    });
    return emotionCounts;
  }

  calculateTrendFast(results, timestamps) {
    if (!timestamps || timestamps.length < 2) return null;
    
    // Simple trend calculation
    const validResults = results.filter(r => r.timestamp);
    if (validResults.length < 2) return null;
    
    const firstHalf = validResults.slice(0, Math.floor(validResults.length / 2));
    const secondHalf = validResults.slice(Math.floor(validResults.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.sentiment.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.sentiment.score, 0) / secondHalf.length;
    
    const direction = secondAvg > firstAvg ? 'improving' : 'declining';
    const strength = Math.abs(secondAvg - firstAvg);
    
    return {
      direction,
      strength,
      summary: `Sentiment is ${direction} with ${strength.toFixed(1)} point change`
    };
  }

  analyzeContextInsightsFast(results) {
    // Simplified context insights
    const insights = [];
    const lowConfidenceCount = results.filter(r => r.sentiment.confidence < 0.5).length;
    
    if (lowConfidenceCount > results.length * 0.3) {
      insights.push({
        type: 'confidence',
        message: `${lowConfidenceCount} mentions had low confidence scores`,
        severity: 'low'
      });
    }
    
    return insights;
  }

  // New analysis methods
  calculateTrend(results) {
    // Sort by timestamp
    const sortedResults = results
      .filter(r => r.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (sortedResults.length < 2) return null;

    // Calculate trend over time periods
    const periods = this.groupByTimePeriods(sortedResults);
    const trendData = periods.map(period => ({
      period: period.label,
      averageSentiment: period.results.reduce((sum, r) => sum + r.sentiment.score, 0) / period.results.length,
      count: period.results.length
    }));

    // Calculate overall trend direction
    const firstPeriod = trendData[0];
    const lastPeriod = trendData[trendData.length - 1];
    const trendDirection = lastPeriod.averageSentiment > firstPeriod.averageSentiment ? 'improving' : 'declining';
    const trendStrength = Math.abs(lastPeriod.averageSentiment - firstPeriod.averageSentiment);

    return {
      direction: trendDirection,
      strength: trendStrength,
      periods: trendData,
      summary: `Sentiment is ${trendDirection} with ${trendStrength.toFixed(1)} point change`
    };
  }

  groupByTimePeriods(results) {
    const now = new Date();
    const periods = [
      { label: 'Last 24h', start: new Date(now - 24 * 60 * 60 * 1000), results: [] },
      { label: 'Last 3 days', start: new Date(now - 3 * 24 * 60 * 60 * 1000), results: [] },
      { label: 'Last week', start: new Date(now - 7 * 24 * 60 * 60 * 1000), results: [] },
      { label: 'Older', start: new Date(0), results: [] }
    ];

    results.forEach(result => {
      const timestamp = new Date(result.timestamp);
      for (let period of periods) {
        if (timestamp >= period.start) {
          period.results.push(result);
          break;
        }
      }
    });

    return periods.filter(p => p.results.length > 0);
  }

  analyzeContextInsights(results, brandName) {
    const insights = [];
    
    // Sarcasm detection insights
    const sarcasmCount = results.filter(r => r.sentiment.contextModifiers?.includes('sarcasm')).length;
    if (sarcasmCount > results.length * 0.1) {
      insights.push({
        type: 'sarcasm',
        message: `${sarcasmCount} mentions detected as sarcastic, indicating potential dissatisfaction`,
        severity: 'medium'
      });
    }

    // Brand-specific insights
    const brandSpecificCount = results.filter(r => r.sentiment.brandSpecific).length;
    if (brandSpecificCount > 0) {
      insights.push({
        type: 'brand_context',
        message: `${brandSpecificCount} mentions used brand-specific terminology`,
        severity: 'info'
      });
    }

    // Confidence insights
    const lowConfidenceCount = results.filter(r => r.sentiment.confidence < 0.5).length;
    if (lowConfidenceCount > results.length * 0.3) {
      insights.push({
        type: 'confidence',
        message: `${lowConfidenceCount} mentions had low confidence scores - consider manual review`,
        severity: 'low'
      });
    }

    return insights;
  }

  getBrandSpecificInsights(results, brandName) {
    const brandContext = this.getBrandContext(brandName.toLowerCase());
    if (!brandContext) return null;

    const productMentions = {};
    const brandSentiments = { positive: 0, negative: 0, neutral: 0 };

    results.forEach(result => {
      const words = this.preprocessText(result.text);
      
      // Count product mentions
      brandContext.products.forEach(product => {
        if (words.includes(product)) {
          productMentions[product] = (productMentions[product] || 0) + 1;
        }
      });

      // Count brand-specific sentiments
      brandSentiments[result.sentiment.sentiment]++;
    });

    return {
      productMentions,
      brandSentiments,
      topProducts: Object.entries(productMentions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([product, count]) => ({ product, count }))
    };
  }
}

module.exports = SentimentAnalyzer;