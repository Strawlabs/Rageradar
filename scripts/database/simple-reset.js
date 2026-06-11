const admin = require('firebase-admin');
require('dotenv').config({ path: 'server/.env' });

// Initialize Firebase Admin with environment variables
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

async function clearFirestoreOnly() {
  try {
    console.log('🧹 Clearing Firestore collections...');
    
    // List of collections to clear
    const collections = [
      'users',
      'brands', 
      'analyses',
      'mentions',
      'reports',
      'alerts',
      'settings',
      'integrations',
      'exports',
      'sites',
      'notifications'
    ];
    
    let totalCleared = 0;
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        
        if (snapshot.empty) {
          console.log(`✅ Collection '${collectionName}' is already empty`);
          continue;
        }
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ Cleared ${snapshot.docs.length} documents from '${collectionName}'`);
        totalCleared += snapshot.docs.length;
        
      } catch (error) {
        console.log(`⚠️  Collection '${collectionName}' doesn't exist or error: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Firestore cleanup complete! Cleared ${totalCleared} total documents.`);
    
  } catch (error) {
    console.error('❌ Error clearing Firestore:', error);
  }
}

async function deleteAllUsers() {
  try {
    console.log('👥 Clearing Firebase Authentication users...');
    
    const listUsers = await admin.auth().listUsers();
    const userIds = listUsers.users.map(user => user.uid);
    
    if (userIds.length === 0) {
      console.log('✅ No users to delete');
      return;
    }
    
    // Delete users in batches
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      await Promise.all(batch.map(uid => admin.auth().deleteUser(uid)));
      console.log(`✅ Deleted ${batch.length} users`);
    }
    
    console.log(`✅ Deleted ${userIds.length} total users`);
    
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting simple data reset...\n');
    
    // Clear Firestore collections
    await clearFirestoreOnly();
    
    console.log(''); // Empty line
    
    // Clear Firebase Auth users
    await deleteAllUsers();
    
    console.log('\n🎉 Data reset complete!');
    console.log('\n📋 What was cleared:');
    console.log('• All Firestore collections');
    console.log('• All Firebase Authentication users');
    
    console.log('\n⚠️  Next steps:');
    console.log('1. Clear your browser cache and localStorage');
    console.log('2. Sign up with a new account');
    console.log('3. You now have a fresh start!');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    process.exit(0);
  }
}

main();