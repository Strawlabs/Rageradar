const axios = require('axios');

async function testAppleSeptemberEvent() {
  console.log('🍎 Testing Apple September 9th Event Sentiment Analysis\n');
  
  const baseURL = 'http://localhost:5001';
  
  // Test different search terms related to the Apple event
  const searchTerms = [
    'Apple September 9 event',
    'Apple iPhone 16 launch',
    'Apple Watch Series 10',
    'Apple AirPods 4',
    'Apple event 2024',
    'iPhone 16 Pro'
  ];
  
  console.log('🔍 Testing multiple Apple event-related searches...\n');
  
  for (const term of searchTerms) {
    try {
      console.log(`Analyzing: "${term}"`);
      
      const response = await axios.post(`${baseURL}/api/preview-analysis`, {
        brandName: term
      });
      
      const data = response.data;
      console.log(`  📊 Results:`);
      console.log(`     Total Mentions: ${data.totalMentions}`);
      console.log(`     Positive: ${data.positivePercentage}%`);
      console.log(`     Negative: ${data.negativePercentage}%`);
      console.log(`     Neutral: ${data.neutralPercentage}%`);
      
      // Analyze the sentiment quality
      if (data.positivePercentage > 0 || data.negativePercentage > 0) {
        console.log(`  ✅ Good sentiment detection!`);
      } else {
        console.log(`  ⚠️  All neutral - may need more specific search`);
      }
      
      console.log('');
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`  ❌ Failed to analyze "${term}":`, error.message);
    }
  }
}

async function testSpecificAppleEventSentiment() {
  console.log('🎯 Testing Specific Apple Event Sentiment\n');
  
  const baseURL = 'http://localhost:5001';
  
  try {
    // Test with the most likely to have sentiment
    const response = await axios.post(`${baseURL}/api/preview-analysis`, {
      brandName: 'iPhone 16 Pro'
    });
    
    const data = response.data;
    
    console.log('📱 iPhone 16 Pro Sentiment Analysis:');
    console.log(`   Brand: ${data.brandName}`);
    console.log(`   Total Mentions: ${data.totalMentions}`);
    console.log(`   Sentiment Distribution:`);
    console.log(`     😊 Positive: ${data.positivePercentage}%`);
    console.log(`     😐 Neutral: ${data.neutralPercentage}%`);
    console.log(`     😠 Negative: ${data.negativePercentage}%`);
    
    // Provide insights based on results
    if (data.totalMentions > 30) {
      console.log(`   ✅ Good mention volume - event generated discussion`);
    } else {
      console.log(`   ⚠️  Low mention volume - may need broader search terms`);
    }
    
    if (data.positivePercentage > data.negativePercentage) {
      console.log(`   📈 Overall positive sentiment about the iPhone 16 Pro!`);
    } else if (data.negativePercentage > data.positivePercentage) {
      console.log(`   📉 More negative sentiment detected`);
    } else {
      console.log(`   ➖ Balanced or neutral sentiment`);
    }
    
    // Calculate excitement index
    const excitementIndex = data.positivePercentage - data.negativePercentage;
    console.log(`   🎉 Excitement Index: ${excitementIndex > 0 ? '+' : ''}${excitementIndex}%`);
    
  } catch (error) {
    console.error('❌ Specific event test failed:', error.message);
  }
}

async function runAppleEventTests() {
  console.log('🚀 Starting Apple September 9th Event Sentiment Analysis\n');
  console.log('This will test sentiment about Apple\'s recent product launch event\n');
  
  await testAppleSeptemberEvent();
  await testSpecificAppleEventSentiment();
  
  console.log('🎉 Apple Event Sentiment Analysis Complete!\n');
  console.log('💡 Tips for better results:');
  console.log('   - Try "iPhone 16" for product-specific sentiment');
  console.log('   - Try "Apple Watch Series 10" for watch sentiment');
  console.log('   - Try "Apple AirPods 4" for AirPods sentiment');
  console.log('   - The system searches 27+ platforms for comprehensive coverage');
}

runAppleEventTests();