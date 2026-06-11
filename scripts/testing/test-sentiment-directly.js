const SentimentAnalyzer = require('./server/sentimentAnalyzer');

const analyzer = new SentimentAnalyzer();

// Test with some real Apple-related texts that should have clear sentiment
const testTexts = [
  "Apple's new iPhone is absolutely amazing! The camera quality is incredible and the battery life is fantastic.",
  "I hate the new Apple update. It's terrible and broke everything. Worst decision ever.",
  "Apple devices are stolen from the store. This is a major security issue and very concerning.",
  "Apple launches iPhone 11 again. Revolutionary breakthrough in mobile technology.",
  "The new MacBook is overpriced garbage. Not worth the money at all.",
  "Love my new iPad! Works perfectly and the design is beautiful.",
  "Apple's monopoly lawsuit is concerning for the company's future",
  "Tim Cook announced exciting new features coming to iOS"
];

console.log('🧪 Testing Sentiment Analysis Directly\n');

testTexts.forEach((text, i) => {
  console.log(`${i + 1}. "${text}"`);
  
  const result = analyzer.analyzeSentiment(text, 'Apple');
  console.log(`   Sentiment: ${result.sentiment} (${result.score.toFixed(1)})`);
  console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
  console.log(`   Positive words: ${result.positiveWords}, Negative words: ${result.negativeWords}`);
  console.log(`   Context: ${result.contextModifiers.join(', ') || 'none'}`);
  console.log('');
});

// Test batch analysis
console.log('📊 Batch Analysis Results:');
const batchResults = analyzer.analyzeBatch(testTexts, 'Apple');
console.log(`Positive: ${batchResults.overall.positivePercentage.toFixed(1)}%`);
console.log(`Negative: ${batchResults.overall.negativePercentage.toFixed(1)}%`);
console.log(`Neutral: ${batchResults.overall.neutralPercentage.toFixed(1)}%`);
console.log(`Average Score: ${batchResults.overall.averageSentiment.toFixed(1)}`);
console.log(`Confidence: ${batchResults.overall.confidenceScore.toFixed(2)}`);