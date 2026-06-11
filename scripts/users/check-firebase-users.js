// Check Firebase Users and Test Registration
const admin = require('firebase-admin');
require('dotenv').config({ path: './server/.env' });

// Initialize Firebase Admin
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

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

async function checkFirebaseUsers() {
  try {
    console.log('🔧 Checking Firebase users...');
    
    // List all users
    const listUsersResult = await admin.auth().listUsers(1000);
    console.log(`📊 Total users found: ${listUsersResult.users.length}`);
    
    if (listUsersResult.users.length > 0) {
      console.log('\n👥 Existing users:');
      listUsersResult.users.forEach((userRecord, index) => {
        console.log(`${index + 1}. Email: ${userRecord.email}`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   Created: ${userRecord.metadata.creationTime}`);
        console.log(`   Last Sign In: ${userRecord.metadata.lastSignInTime || 'Never'}`);
        console.log(`   Email Verified: ${userRecord.emailVerified}`);
        console.log('   ---');
      });
    } else {
      console.log('📭 No users found in Firebase Authentication');
    }
    
    // Check Firestore users collection
    console.log('\n🔧 Checking Firestore users collection...');
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`📊 Total user documents in Firestore: ${usersSnapshot.size}`);
    
    if (!usersSnapshot.empty) {
      console.log('\n📄 User documents in Firestore:');
      usersSnapshot.forEach((doc, index) => {
        const userData = doc.data();
        console.log(`${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Plan: ${userData.plan}`);
        console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
        console.log(`   Company: ${userData.companyName}`);
        console.log(`   Created: ${userData.createdAt?.toDate?.() || userData.createdAt}`);
        console.log('   ---');
      });
    } else {
      console.log('📭 No user documents found in Firestore');
    }
    
    // Test creating a user
    console.log('\n🧪 Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    try {
      const userRecord = await admin.auth().createUser({
        email: testEmail,
        password: testPassword,
        displayName: 'Test User'
      });
      
      console.log('✅ Test user created successfully:', userRecord.uid);
      
      // Create Firestore document
      const userDoc = {
        email: testEmail,
        plan: 'trial',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        brandsUsed: 0,
        maxBrands: 1,
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company'
      };
      
      await db.collection('users').doc(userRecord.uid).set(userDoc);
      console.log('✅ Test user document created in Firestore');
      
      // Clean up - delete the test user
      await admin.auth().deleteUser(userRecord.uid);
      await db.collection('users').doc(userRecord.uid).delete();
      console.log('🧹 Test user cleaned up');
      
    } catch (createError) {
      console.error('❌ Failed to create test user:', createError.message);
    }
    
    console.log('\n🎉 Firebase check completed!');
    
  } catch (error) {
    console.error('❌ Error checking Firebase:', error.message);
    console.error('Full error:', error);
  }
}

checkFirebaseUsers();