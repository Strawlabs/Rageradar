const SearchEngine = require('./server/searchEngine');
const SentimentAnalyzer = require('./server/sentimentAnalyzer');

async function testGoogleCustomSearch() {
  console.log('🔍 Testing Google Custom Search Implementation\n');
  
  const searchEngine = new SearchEngine();
  const sentimentAnalyzer = new SentimentAnalyzer();
  
  try {
    console.log('1. Testing Apple search with Google Custom Search...');
    const searchResults = await searchEngine.searchAllPlatforms('Apple', 30);
    
    console.log(`\n📊 Search Results Summary:`);
    console.log(`Total results: ${searchResults.length}`);
    
    // Group by platform
    const platformStats = {};
    searchResults.forEach(result => {
      platformStats[result.platform] = (platformStats[result.platform] || 0) + 1;
    });
    
    console.log('\n📈 Platform Breakdown:');
    Object.entries(platformStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([platform, count]) => {
        console.log(`  ${platform}: ${count} results`);
      });
    
    console.log('\n🔍 Sample Results (first 5):');
    searchResults.slice(0, 5).forEach((result, i) => {
      console.log(`  ${i+1}. [${result.platform}] ${result.title.substring(0, 60)}...`);
      console.log(`     URL: ${result.url}`);
      console.log(`     Text: ${result.text.substring(0, 80)}...`);
    });
    
    // Test sentiment analysis
    console.log('\n🧠 Testing Sentiment Analysis...');
    const textContent = searchResults.slice(0, 15).map(r => {
      const title = r.title || '';
      const text = r.text || '';
      return title + (text ? ' ' + text : '');
    }).filter(t => t && t.length > 10);
    
    const sentimentResults = sentimentAnalyzer.analyzeBatch(textContent, 'Apple');
    
    console.log('\n📈 Sentiment Analysis Results:');
    console.log(`  Positive: ${sentimentResults.overall.positivePercentage.toFixed(1)}%`);
    console.log(`  Negative: ${sentimentResults.overall.negativePercentage.toFixed(1)}%`);
    console.log(`  Neutral: ${sentimentResults.overall.neutralPercentage.toFixed(1)}%`);
    console.log(`  Average Score: ${sentimentResults.overall.averageSentiment.toFixed(1)}`);
    console.log(`  Confidence: ${sentimentResults.overall.confidenceScore.toFixed(2)}`);
    
    if (sentimentResults.brandSpecificAnalysis) {
      console.log('\n🍎 Apple-Specific Analysis:');
      console.log('  Top Products Mentioned:');
      sentimentResults.brandSpecificAnalysis.topProducts.forEach(p => {
        console.log(`    ${p.product}: ${p.count} mentions`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('credentials not configured')) {
      console.log('\n⚠️  Google Custom Search API credentials are missing.');
      console.log('Please check your server/.env file for:');
      console.log('  GOOGLE_CSE_API_KEY=your_api_key');
      console.log('  GOOGLE_CSE_ID=your_search_engine_id');
    }
  }
}

testGoogleCustomSearch();