const admin = require('firebase-admin');
const serviceAccount = require('./rageradar-d1830-firebase-adminsdk-fbsvc-9e5efed2e6.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rageradar-d1830-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function setAdminRole(email) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Found user:', userRecord.uid);
    
    // Update user document in Firestore
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.update({
      role: 'admin',
      plan: 'admin',
      maxBrands: 999999,
      brandsUsed: 0,
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    });
    
    console.log(`✅ Successfully set admin role for ${email}`);
    console.log('User now has:');
    console.log('- role: admin');
    console.log('- plan: admin');
    console.log('- maxBrands: 999999');
    console.log('- Unlimited access to all features');
    
  } catch (error) {
    console.error('❌ Error setting admin role:', error);
  }
  
  process.exit(0);
}

// Get email from command line argument or use default
const email = process.argv[2] || 'your-email@example.com';

console.log(`Setting admin role for: ${email}`);
setAdminRole(email);