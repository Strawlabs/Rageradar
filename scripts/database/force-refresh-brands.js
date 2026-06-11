// Simple script to verify current Apple data in database
const admin = require('firebase-admin');
require('dotenv').config({ path: 'server/.env' });

// Initialize Firebase Admin
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

const db = admin.firestore();

async function checkCurrentAppleData() {
  try {
    console.log('🔍 Checking current Apple data in database...');
    
    // Find all Apple analyses (without orderBy to avoid index requirement)
    const snapshot = await db.collection('analyses')
      .where('brandName', '==', 'Apple')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No Apple analyses found in database');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} Apple analysis records:`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || 'No date';
      console.log(`\n${index + 1}. Analysis ID: ${doc.id}`);
      console.log(`   Created: ${createdAt}`);
      console.log(`   Total Mentions: ${data.totalMentions || 0}`);
      console.log(`   Positive: ${data.positivePercentage || 0}%`);
      console.log(`   Negative: ${data.negativePercentage || 0}%`);
      console.log(`   Rage Index: ${data.rageIndex || 'Not calculated'}`);
      console.log(`   Weighted Score: ${data.weightedSentimentScore || 'Not available'}`);
      console.log(`   Confidence: ${data.confidenceScore || 'Not available'}`);
      console.log(`   Enhanced Features: ${data.enhancedFeatures ? 'Yes' : 'No'}`);
      
      if (data.platformStats) {
        console.log(`   Platforms: ${Object.keys(data.platformStats).join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking Apple data:', error);
  } finally {
    process.exit(0);
  }
}

checkCurrentAppleData();