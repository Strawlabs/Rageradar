const admin = require('firebase-admin');
require('dotenv').config({ path: './server/.env' });

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
const auth = admin.auth();

async function deleteUser(email) {
  try {
    console.log(`🔍 Looking for user: ${email}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    
    console.log(`👤 Found user with UID: ${uid}`);
    
    // Delete user document from Firestore
    console.log('🗑️  Deleting user document from Firestore...');
    await db.collection('users').doc(uid).delete();
    console.log('✅ User document deleted from Firestore');
    
    // Delete any brands associated with this user
    console.log('🗑️  Deleting user brands from Firestore...');
    const brandsSnapshot = await db.collection('brands').where('userId', '==', uid).get();
    const batch = db.batch();
    
    brandsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (!brandsSnapshot.empty) {
      await batch.commit();
      console.log(`✅ Deleted ${brandsSnapshot.size} brand documents`);
    } else {
      console.log('ℹ️  No brand documents found');
    }
    
    // Delete user from Authentication
    console.log('🗑️  Deleting user from Authentication...');
    await auth.deleteUser(uid);
    console.log('✅ User deleted from Authentication');
    
    console.log(`🎉 Successfully deleted user: ${email}`);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`❌ User not found: ${email}`);
    } else {
      console.error('❌ Error deleting user:', error);
    }
  }
}

// Delete the specific user
deleteUser('prabhunagoormani@gmail.com')
  .then(() => {
    console.log('🏁 Deletion process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });