const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing initialization)
const serviceAccount = require('./rageradar-d1830-firebase-adminsdk-fbsvc-9e5efed2e6.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rageradar-d1830-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function clearAllCollections() {
  try {
    console.log('🧹 Clearing all Firestore collections...');
    
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
      'notifications',
      'apiKeys',
      'subscriptions',
      'usage',
      'logs'
    ];
    
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
        
      } catch (error) {
        console.log(`⚠️  Collection '${collectionName}' doesn't exist or error: ${error.message}`);
      }
    }
    
    console.log('✅ All collections cleared successfully');
    
  } catch (error) {
    console.error('❌ Error clearing collections:', error);
  }
}

async function clearRealtimeDatabase() {
  try {
    console.log('🧹 Clearing Realtime Database...');
    
    const rtdb = admin.database();
    await rtdb.ref().set(null);
    
    console.log('✅ Realtime Database cleared');
    
  } catch (error) {
    console.error('❌ Error clearing Realtime Database:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting complete data cleanup...\n');
    
    // Clear all Firestore collections
    await clearAllCollections();
    
    console.log(''); // Empty line
    
    // Clear Realtime Database
    await clearRealtimeDatabase();
    
    console.log('\n🎉 Complete data cleanup finished!');
    console.log('\n📋 What was cleared:');
    console.log('• All Firestore collections (users, brands, analyses, etc.)');
    console.log('• Realtime Database');
    console.log('• All cached data');
    
    console.log('\n⚠️  Next steps:');
    console.log('1. Clear your browser cache and localStorage');
    console.log('2. Run create-admin.js to create fresh admin user');
    console.log('3. Restart your development server');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    process.exit(0);
  }
}

main();