// Delete test user to allow re-registration
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

async function deleteTestUser() {
  try {
    const emailToDelete = 'prabhunagoormani@gmail.com';
    const uid = 'w4LWXqZ6AOhHSoKT88X8YTtrZd23';
    
    console.log(`🗑️ Deleting user: ${emailToDelete}`);
    
    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);
    console.log('✅ User deleted from Firebase Authentication');
    
    // Delete from Firestore
    const db = admin.firestore();
    await db.collection('users').doc(uid).delete();
    console.log('✅ User document deleted from Firestore');
    
    console.log('🎉 User deleted successfully! You can now register again with this email.');
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
  }
}

deleteTestUser();