// Test configuration script for RageRadar
const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

async function testConfiguration() {
  console.log('🎯 Testing RageRadar Configuration...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables:');
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
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

  // Test 4: Firebase Admin (basic check)
  console.log('\n4. Testing Firebase Configuration:');
  try {
    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    // Test Firestore connection
    const db = admin.firestore();
    await db.collection('test').doc('config-test').set({ 
      timestamp: new Date(),
      test: true 
    });
    await db.collection('test').doc('config-test').delete();
    
    console.log('   ✅ Firebase Admin: Working');
    console.log('   🔥 Firestore: Connected');
  } catch (error) {
    console.log('   ❌ Firebase Admin: Failed');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎯 Configuration test complete!');
  console.log('\nIf all tests pass, you can run: npm run dev');
}

// Run the test
testConfiguration().catch(console.error);