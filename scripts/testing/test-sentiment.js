const SentimentAnalyzer = require('./server/sentimentAnalyzer');

function testSentimentAnalysis() {
  console.log('🧠 Testing sentiment analysis...\n');
  
  const analyzer = new SentimentAnalyzer();
  
  // Test with clear positive and negative examples
  const testTexts = [
    "I love Samsung phones! They are amazing and work perfectly. Great quality and excellent features.",
    "Samsung phones are terrible. Worst experience ever. Hate the interface and poor battery life.",
    "Samsung phone is okay. Nothing special but works fine for basic tasks.",
    "My s21 fe came with one ui 5, which might had lesser featured but had done the ui right, I miss it",
    "All things I liked about Samsung are slowly disappearing. I used to joke about iPhone users"
  ];
  
  console.log('Testing individual texts:');
  testTexts.forEach((text, index) => {
    const result = analyzer.analyzeSentiment(text);
    console.log(`\n${index + 1}. "${text.substring(0, 60)}..."`);
    console.log(`   Sentiment: ${result.sentiment} (${result.score.toFixed(1)})`);
    console.log(`   Positive words: ${result.positiveWords}, Negative words: ${result.negativeWords}`);
  });
  
  // Test batch analysis
  console.log('\n📊 Batch analysis:');
  const batchResults = analyzer.analyzeBatch(testTexts);
  console.log(`Positive: ${Math.round(batchResults.overall.positivePercentage)}%`);
  console.log(`Negative: ${Math.round(batchResults.overall.negativePercentage)}%`);
  console.log(`Neutral: ${Math.round(batchResults.overall.neutralPercentage)}%`);
}

testSentimentAnalysis();