const axios = require('axios');

async function testBrandsAPI() {
  try {
    console.log('🧪 Testing /api/brands endpoint...\n');
    
    // Test without auth first (should fail)
    try {
      const response = await axios.get('http://localhost:5001/api/brands');
      console.log('❌ Unexpected: Got response without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get('http://localhost:5001/api/health');
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBrandsAPI();