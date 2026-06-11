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

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testDatabaseContent() {
  try {
    console.log('🔍 Checking database content...\n');
    
    // Check analyses collection
    console.log('📊 Analyses collection:');
    const analysesSnapshot = await db.collection('analyses').get();
    console.log(`Found ${analysesSnapshot.size} analyses`);
    
    if (analysesSnapshot.size > 0) {
      analysesSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Brand: ${data.brandName}`);
        console.log(`   User: ${data.userId}`);
        console.log(`   Mentions: ${data.totalMentions}`);
        console.log(`   Positive: ${data.positivePercentage}%`);
        console.log(`   Created: ${data.createdAt?.toDate?.() || 'No date'}`);
        console.log('');
      });
    }
    
    // Check brands collection
    console.log('🏢 Brands collection:');
    const brandsSnapshot = await db.collection('brands').get();
    console.log(`Found ${brandsSnapshot.size} brands`);
    
    if (brandsSnapshot.size > 0) {
      brandsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Brand: ${data.name || data.brandName}`);
        console.log(`   User: ${data.userId}`);
        console.log('');
      });
    }
    
    // Check users collection
    console.log('👥 Users collection:');
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users`);
    
    if (usersSnapshot.size > 0) {
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. User: ${data.email}`);
        console.log(`   UID: ${doc.id}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

testDatabaseContent();