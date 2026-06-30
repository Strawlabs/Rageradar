const HackerNewsIntegration = require('../../server/integrations/hackerNewsIntegration');

async function testHN() {
  console.log('🧪 Testing Hacker News Integration with real live query...\n');
  const integration = new HackerNewsIntegration();
  
  try {
    const results = await integration.searchBrand('Zoho', { limit: 10 });
    console.log(`✅ Success! Found ${results.length} mentions on Hacker News.`);
    
    if (results.length > 0) {
      console.log('\n📋 Sample HN mentions:');
      results.slice(0, 3).forEach((r, idx) => {
        console.log(`\n--- Mention #${idx + 1} ---`);
        console.log(`Type: ${r.type}`);
        console.log(`Author: ${r.author}`);
        console.log(`URL: ${r.url}`);
        console.log(`Timestamp: ${r.timestamp}`);
        console.log(`Text: ${r.text.substring(0, 150)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
  }
}

testHN();
