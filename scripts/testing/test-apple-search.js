const axios = require('axios');

async function testAppleSearch() {
  console.log('Testing Apple search...');
  
  try {
    // Test preview analysis
    console.log('\n1. Testing preview analysis...');
    const previewResponse = await axios.post('http://localhost:5001/api/preview-analysis', {
      brandName: 'Apple'
    });
    console.log('Preview result:', JSON.stringify(previewResponse.data, null, 2));
    
    // Test health check
    console.log('\n2. Testing health check...');
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('Health result:', JSON.stringify(healthResponse.data, null, 2));
    
    console.log('\n✅ API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAppleSearch();