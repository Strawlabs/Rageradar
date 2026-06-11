// Check user brands and analysis data
const admin = require('firebase-admin');
require('dotenv').config({ path: './server/.env' });

// Initialize Firebase Admin (reuse existing app if available)
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs?gid=${process.env.FIREBASE_CLIENT_ID}`
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

async function checkUserBrands() {
  try {
    const db = admin.firestore();
    const userEmail = 'prabhunagoormani@gmail.com';
    const userUID = 'w4LWXqZ6AOhHSoKT88X8YTtrZd23';
    
    console.log(`🔧 Checking brands for user: ${userEmail}`);
    console.log(`User UID: ${userUID}`);
    
    // Check user document
    const userDoc = await db.collection('users').doc(userUID).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('\n👤 User Data:');
      console.log(`Email: ${userData.email}`);
      console.log(`Plan: ${userData.plan}`);
      console.log(`Brands Used: ${userData.brandsUsed}`);
      console.log(`Max Brands: ${userData.maxBrands}`);
      console.log(`Created: ${userData.createdAt?.toDate?.() || userData.createdAt}`);
    }
    
    // Check brands collection for this user
    console.log('\n🔧 Checking brands collection...');
    const brandsSnapshot = await db.collection('brands')
      .where('userId', '==', userUID)
      .get();
    
    console.log(`📊 Total brands found for user: ${brandsSnapshot.size}`);
    
    if (!brandsSnapshot.empty) {
      console.log('\n🏢 User\'s brands:');
      brandsSnapshot.forEach((doc, index) => {
        const brandData = doc.data();
        console.log(`${index + 1}. Brand: ${brandData.name || brandData.brandName}`);
        console.log(`   Document ID: ${doc.id}`);
        console.log(`   User ID: ${brandData.userId}`);
        console.log(`   Created: ${brandData.createdAt?.toDate?.() || brandData.createdAt}`);
        console.log(`   Status: ${brandData.status || 'N/A'}`);
        console.log(`   Analysis Count: ${brandData.analysisCount || 0}`);
        console.log('   ---');
      });
    }
    
    // Check if there are any global/shared brands
    console.log('\n🔧 Checking for global/shared brands...');
    const allBrandsSnapshot = await db.collection('brands').get();
    console.log(`📊 Total brands in database: ${allBrandsSnapshot.size}`);
    
    const globalBrands = [];
    const userBrands = [];
    const otherUserBrands = [];
    
    allBrandsSnapshot.forEach((doc) => {
      const brandData = doc.data();
      if (!brandData.userId) {
        globalBrands.push({ id: doc.id, ...brandData });
      } else if (brandData.userId === userUID) {
        userBrands.push({ id: doc.id, ...brandData });
      } else {
        otherUserBrands.push({ id: doc.id, ...brandData });
      }
    });
    
    console.log(`\n📊 Brand breakdown:`);
    console.log(`Global brands (no userId): ${globalBrands.length}`);
    console.log(`Your brands: ${userBrands.length}`);
    console.log(`Other users' brands: ${otherUserBrands.length}`);
    
    if (globalBrands.length > 0) {
      console.log('\n🌍 Global brands found:');
      globalBrands.forEach((brand, index) => {
        console.log(`${index + 1}. ${brand.name || brand.brandName} (ID: ${brand.id})`);
        console.log(`   Created: ${brand.createdAt?.toDate?.() || brand.createdAt || 'Unknown'}`);
        console.log(`   Status: ${brand.status || 'N/A'}`);
      });
    }
    
    if (otherUserBrands.length > 0) {
      console.log('\n👥 Other users\' brands:');
      otherUserBrands.slice(0, 5).forEach((brand, index) => {
        console.log(`${index + 1}. ${brand.name || brand.brandName} (User: ${brand.userId})`);
      });
      if (otherUserBrands.length > 5) {
        console.log(`   ... and ${otherUserBrands.length - 5} more`);
      }
    }
    
    // Check analyses collection
    console.log('\n🔧 Checking analyses collection...');
    const analysesSnapshot = await db.collection('analyses')
      .where('userId', '==', userUID)
      .get();
    
    console.log(`📊 Total analyses found for user: ${analysesSnapshot.size}`);
    
    if (!analysesSnapshot.empty) {
      console.log('\n📈 User\'s analyses:');
      analysesSnapshot.forEach((doc, index) => {
        const analysisData = doc.data();
        console.log(`${index + 1}. Brand: ${analysisData.brandName}`);
        console.log(`   Document ID: ${doc.id}`);
        console.log(`   Created: ${analysisData.createdAt?.toDate?.() || analysisData.createdAt}`);
        console.log(`   Status: ${analysisData.status || 'N/A'}`);
        console.log(`   Mentions: ${analysisData.mentions?.length || 0}`);
        console.log('   ---');
      });
    }
    
    console.log('\n🎉 Brand check completed!');
    
  } catch (error) {
    console.error('❌ Error checking user brands:', error.message);
    console.error('Full error:', error);
  }
}

checkUserBrands();