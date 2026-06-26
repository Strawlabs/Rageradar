// Test configuration script for RageRadar
const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

async function testConfiguration() {
  console.log('🎯 Testing RageRadar Configuration...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables:');
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CSE_API_KEY',
    'GOOGLE_CSE_ID',
    'HUGGING_FACE_API_KEY'
  ];

  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`   ✅ ${varName}: Set`);
    }
  });

  if (missingVars.length > 0) {
    console.log(`   ❌ Missing variables: ${missingVars.join(', ')}`);
    console.log('   Please check your server/.env file\n');
    return;
  }

  // Test 2: Google Custom Search API
  console.log('\n2. Testing Google Custom Search API:');
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_CSE_API_KEY,
        cx: process.env.GOOGLE_CSE_ID,
        q: 'test site:reddit.com',
        num: 1
      }
    });
    console.log('   ✅ Google CSE API: Working');
    console.log(`   📊 Found ${response.data.searchInformation?.totalResults || 0} results`);
  } catch (error) {
    console.log('   ❌ Google CSE API: Failed');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
  }

  // Test 3: Hugging Face API
  console.log('\n3. Testing Hugging Face API:');
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
      { inputs: 'I love this product!' },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('   ✅ Hugging Face API: Working');
    console.log(`   🎭 Test emotion: ${response.data[0]?.label || 'unknown'}`);
  } catch (error) {
    console.log('   ❌ Hugging Face API: Failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
  }

  // Test 4: Supabase Connection (basic check)
  console.log('\n4. Testing Supabase Configuration:');
  try {
    const { supabase, isMockMode } = require('../../server/supabase');

    if (isMockMode) {
      console.log('   ✅ Running in local Mock Mode (using mock_db.json)');
      const { data, error } = await supabase.from('users').select('*').limit(1);
      if (error) throw error;
      console.log('   🔥 Mock DB: Connected');
    } else {
      const { data, error } = await supabase.from('users').select('*').limit(1);
      if (error) throw error;
      console.log('   ✅ Supabase Client: Working');
      console.log('   🔥 Supabase Database: Connected');
    }
  } catch (error) {
    console.log('   ❌ Supabase: Failed');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎯 Configuration test complete!');
  console.log('\nIf all tests pass, you can run: npm run dev');
}

// Run the test
testConfiguration().catch(console.error);