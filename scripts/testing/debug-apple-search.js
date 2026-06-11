const SearchEngine = require('./server/searchEngine');
const SentimentAnalyzer = require('./server/sentimentAnalyzer');

async function debugAppleSearch() {
  console.log('🔍 Debugging Apple Search in Detail...\n');
  
  const searchEngine = new SearchEngine();
  const sentimentAnalyzer = new SentimentAnalyzer();
  
  try {
    // Test each platform individually
    console.log('1. Testing Reddit search...');
    const redditResults = await searchEngine.searchReddit('Apple');
    console.log(`Reddit results: ${redditResults.length}`);
    redditResults.slice(0, 3).forEach((result, i) => {
      console.log(`  ${i+1}. ${result.title.substring(0, 80)}...`);
      console.log(`     Score: ${result.score}, Platform: ${result.platform}`);
    });
    
    console.log('\n2. Testing Hacker News search...');
    const hnResults = await searchEngine.searchHackerNews('Apple');
    console.log(`Hacker News results: ${hnResults.length}`);
    hnResults.slice(0, 3).forEach((result, i) => {
      console.log(`  ${i+1}. ${result.title.substring(0, 80)}...`);
      console.log(`     Score: ${result.score}, Platform: ${result.platform}`);
    });
    
    console.log('\n3. Testing GitHub search...');
    const githubResults = await searchEngine.searchGitHub('Apple');
    console.log(`GitHub results: ${githubResults.length}`);
    githubResults.slice(0, 3).forEach((result, i) => {
      console.log(`  ${i+1}. ${result.title.substring(0, 80)}...`);
      console.log(`     Score: ${result.score}, Platform: ${result.platform}`);
    });
    
    console.log('\n4. Testing Product Hunt search...');
    const phResults = await searchEngine.searchProductHunt('Apple');
    console.log(`Product Hunt results: ${phResults.length}`);
    phResults.slice(0, 3).forEach((result, i) => {
      console.log(`  ${i+1}. ${result.title.substring(0, 80)}...`);
      console.log(`     Score: ${result.score}, Platform: ${result.platform}`);
    });
    
    // Combine all results
    const allResults = [...redditResults, ...hnResults, ...githubResults, ...phResults];
    console.log(`\n📊 Total combined results: ${allResults.length}`);
    
    if (allResults.length > 0) {
      console.log('\n5. Testing sentiment analysis on actual results...');
      
      // Test sentiment on a few real results
      const textsToAnalyze = allResults.slice(0, 10).map(r => r.text || r.title);
      const timestamps = allResults.slice(0, 10).map(r => r.timestamp || r.created);
      
      const sentimentResults = sentimentAnalyzer.analyzeBatch(textsToAnalyze, 'Apple', timestamps);
      
      console.log('\n📈 Sentiment Analysis Results:');
      console.log(`  Positive: ${sentimentResults.overall.positivePercentage.toFixed(1)}%`);
      console.log(`  Negative: ${sentimentResults.overall.negativePercentage.toFixed(1)}%`);
      console.log(`  Neutral: ${sentimentResults.overall.neutralPercentage.toFixed(1)}%`);
      console.log(`  Average Score: ${sentimentResults.overall.averageSentiment.toFixed(1)}`);
      console.log(`  Confidence: ${sentimentResults.overall.confidenceScore.toFixed(2)}`);
      
      // Show individual analysis for first few results
      console.log('\n🔍 Individual Analysis (first 5):');
      sentimentResults.individual.slice(0, 5).forEach((result, i) => {
        console.log(`  ${i+1}. "${result.text.substring(0, 60)}..."`);
        console.log(`     Sentiment: ${result.sentiment.sentiment} (${result.sentiment.score.toFixed(1)})`);
        console.log(`     Confidence: ${result.sentiment.confidence.toFixed(2)}`);
        console.log(`     Context: ${result.sentiment.contextModifiers.join(', ') || 'none'}`);
      });
      
      if (sentimentResults.brandSpecificAnalysis) {
        console.log('\n🍎 Apple-Specific Analysis:');
        console.log('  Top Products Mentioned:');
        sentimentResults.brandSpecificAnalysis.topProducts.forEach(p => {
          console.log(`    ${p.product}: ${p.count} mentions`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error.stack);
  }
}

debugAppleSearch();