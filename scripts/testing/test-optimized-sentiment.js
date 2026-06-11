const SentimentAnalyzer = require('./server/sentimentAnalyzer');

async function testOptimizedSentiment() {
  console.log('🧪 Testing Optimized Sentiment Analyzer\n');
  
  try {
    const analyzer = new SentimentAnalyzer();
    
    // Test individual sentiment analysis
    console.log('1. Testing individual sentiment analysis...');
    const testTexts = [
      "Apple's new iPhone is absolutely amazing! The camera quality is incredible.",
      "I hate the new Apple update. It's terrible and broke everything.",
      "Apple devices are stolen from the store. This is concerning.",
      "Apple launches iPhone 11 again. Revolutionary breakthrough.",
      "The new MacBook is overpriced garbage. Not worth it."
    ];
    
    testTexts.forEach((text, i) => {
      console.log(`\n${i + 1}. "${text}"`);
      try {
        const result = analyzer.analyzeSentimentFast(text, null);
        console.log(`   Sentiment: ${result.sentiment} (${result.score.toFixed(1)})`);
        console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
        console.log(`   Words: +${result.positiveWords} -${result.negativeWords} (${result.totalWords} total)`);
      } catch (error) {
        console.error(`   Error: ${error.message}`);
      }
    });
    
    // Test batch analysis
    console.log('\n\n2. Testing batch analysis...');
    try {
      const batchResults = analyzer.analyzeBatch(testTexts, 'Apple', null, {
        skipEmotions: true,
        skipTrends: true,
        skipInsights: true
      });
      
      console.log('\n📊 Batch Results:');
      console.log(`   Positive: ${batchResults.overall.positivePercentage.toFixed(1)}%`);
      console.log(`   Negative: ${batchResults.overall.negativePercentage.toFixed(1)}%`);
      console.log(`   Neutral: ${batchResults.overall.neutralPercentage.toFixed(1)}%`);
      console.log(`   Average Score: ${batchResults.overall.averageSentiment.toFixed(1)}`);
      console.log(`   Confidence: ${batchResults.overall.confidenceScore.toFixed(2)}`);
      console.log(`   Total Analyzed: ${batchResults.totalAnalyzed}`);
      
    } catch (error) {
      console.error(`   Batch Error: ${error.message}`);
      console.error(error.stack);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testOptimizedSentiment();