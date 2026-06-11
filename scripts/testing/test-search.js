const SearchEngine = require('./server/searchEngine');
const SentimentAnalyzer = require('./server/sentimentAnalyzer');

async function testSamsungAnalysis() {
  console.log('🧪 Testing Samsung sentiment analysis...\n');
  
  try {
    // Initialize components
    const searchEngine = new SearchEngine();
    const sentimentAnalyzer = new SentimentAnalyzer();
    
    console.log('✅ Search engine and sentiment analyzer initialized');
    
    // Test search
    console.log('\n🔍 Searching for Samsung mentions...');
    const searchResults = await searchEngine.searchAllPlatforms('Samsung');
    
    console.log(`✅ Found ${searchResults.length} search results`);
    
    if (searchResults.length === 0) {
      console.log('❌ No search results found - this might be the issue');
      return;
    }
    
    // Show sample results
    console.log('\n📋 Sample search results:');
    searchResults.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. [${result.platform}] ${result.title}`);
      console.log(`   Text: ${result.text.substring(0, 100)}...`);
      console.log(`   URL: ${result.url}`);
      console.log('');
    });
    
    // Test sentiment analysis
    console.log('🧠 Analyzing sentiment...');
    const textContent = searchResults.map(result => result.text).filter(text => text && text.length > 10);
    
    if (textContent.length === 0) {
      console.log('❌ No text content to analyze');
      return;
    }
    
    const sentimentResults = sentimentAnalyzer.analyzeBatch(textContent);
    
    console.log('✅ Sentiment analysis complete');
    console.log('\n📊 Results:');
    console.log(`Total mentions: ${searchResults.length}`);
    console.log(`Positive: ${Math.round(sentimentResults.overall.positivePercentage)}%`);
    console.log(`Negative: ${Math.round(sentimentResults.overall.negativePercentage)}%`);
    console.log(`Neutral: ${Math.round(sentimentResults.overall.neutralPercentage)}%`);
    
    // Show platform breakdown
    const platformStats = {};
    searchResults.forEach(result => {
      platformStats[result.platform] = (platformStats[result.platform] || 0) + 1;
    });
    
    console.log('\n🌐 Platform breakdown:');
    Object.entries(platformStats).forEach(([platform, count]) => {
      console.log(`${platform}: ${count} mentions`);
    });
    
    console.log('\n🎉 Test completed successfully!');
    console.log('The search and sentiment analysis logic is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testSamsungAnalysis();