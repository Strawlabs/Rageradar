// Test script to verify all data connections are working
const axios = require('axios');

async function testDataConnections() {
  console.log('🧪 Testing RageRadar Data Connections\n');
  
  const baseURL = 'http://localhost:5001';
  
  try {
    // Test 1: Health Check
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Server health:', healthResponse.data);
    
    // Test 2: Preview Analysis (no auth required)
    console.log('\n2. Testing preview analysis...');
    const previewResponse = await axios.post(`${baseURL}/api/preview-analysis`, {
      brandName: 'Apple'
    });
    console.log('✅ Preview analysis:', previewResponse.data);
    
    // Test 3: Verify data structure
    console.log('\n3. Verifying data structure...');
    const data = previewResponse.data;
    const requiredFields = ['brandName', 'totalMentions', 'positivePercentage', 'negativePercentage', 'neutralPercentage'];
    
    const missingFields = requiredFields.filter(field => !(field in data));
    if (missingFields.length === 0) {
      console.log('✅ All required fields present:', requiredFields);
    } else {
      console.log('❌ Missing fields:', missingFields);
    }
    
    // Test 4: Data quality check
    console.log('\n4. Testing data quality...');
    const totalPercentage = data.positivePercentage + data.negativePercentage + data.neutralPercentage;
    if (Math.abs(totalPercentage - 100) < 1) {
      console.log('✅ Sentiment percentages add up to 100%');
    } else {
      console.log('❌ Sentiment percentages don\'t add up:', totalPercentage);
    }
    
    if (data.totalMentions > 0) {
      console.log('✅ Found mentions:', data.totalMentions);
    } else {
      console.log('❌ No mentions found');
    }
    
    // Test 5: Sentiment distribution check
    console.log('\n5. Testing sentiment distribution...');
    if (data.positivePercentage > 0 || data.negativePercentage > 0) {
      console.log('✅ Sentiment analysis working - not all neutral');
      console.log(`   Positive: ${data.positivePercentage}%`);
      console.log(`   Negative: ${data.negativePercentage}%`);
      console.log(`   Neutral: ${data.neutralPercentage}%`);
    } else {
      console.log('⚠️  All sentiment is neutral - may need tuning');
    }
    
    console.log('\n🎉 Data connection tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test different brands
async function testMultipleBrands() {
  console.log('\n🔍 Testing Multiple Brands\n');
  
  const brands = ['Apple', 'Google', 'Tesla', 'Microsoft'];
  const baseURL = 'http://localhost:5001';
  
  for (const brand of brands) {
    try {
      console.log(`Testing ${brand}...`);
      const response = await axios.post(`${baseURL}/api/preview-analysis`, {
        brandName: brand
      });
      
      const data = response.data;
      console.log(`  Mentions: ${data.totalMentions}, Positive: ${data.positivePercentage}%, Negative: ${data.negativePercentage}%`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ❌ ${brand} failed:`, error.message);
    }
  }
}

// Run tests
async function runAllTests() {
  await testDataConnections();
  await testMultipleBrands();
}

runAllTests();