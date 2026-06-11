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

const auth = admin.auth();
const db = admin.firestore();

async function createAdminUser() {
  try {
    console.log('👑 Creating new admin user...');
    
    const adminEmail = 'admin@rageradar.com';
    const adminPassword = 'RageRadar2025!';
    
    // Create admin user in Firebase Auth
    const adminUser = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'RageRadar Admin',
      emailVerified: true
    });
    
    console.log(`✅ Created admin user with UID: ${adminUser.uid}`);
    
    // Set custom claims for admin privileges
    await auth.setCustomUserClaims(adminUser.uid, {
      admin: true,
      role: 'admin',
      unlimited: true,
      tier: 'enterprise'
    });
    
    console.log('✅ Set admin custom claims');
    
    // Create admin user document in Firestore
    const adminData = {
      uid: adminUser.uid,
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      companyName: 'RageRadar Inc.',
      companyEmail: adminEmail,
      contactNumber: '+1-555-ADMIN',
      jobTitle: 'System Administrator',
      companySize: '1000+',
      role: 'admin',
      tier: 'enterprise',
      unlimited: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      // Unlimited access settings
      maxBrands: -1, // -1 means unlimited
      maxAnalyses: -1,
      maxAlerts: -1,
      features: {
        realTimeAlerts: true,
        visualAnalytics: true,
        csvExport: true,
        slackIntegration: true,
        apiAccess: true,
        customReports: true,
        whiteLabel: true,
        prioritySupport: true
      }
    };
    
    await db.collection('users').doc(adminUser.uid).set(adminData);
    
    console.log('✅ Created admin user document in Firestore');
    
    return {
      email: adminEmail,
      password: adminPassword,
      uid: adminUser.uid
    };
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Creating fresh admin account...\n');
    
    // Create admin user
    const adminCredentials = await createAdminUser();
    
    console.log('\n🎉 Admin account created successfully!');
    console.log('\n📋 ADMIN LOGIN CREDENTIALS:');
    console.log('================================');
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: ${adminCredentials.password}`);
    console.log(`UID: ${adminCredentials.uid}`);
    console.log('================================');
    console.log('\n🔑 Admin Features Enabled:');
    console.log('• Unlimited brands and analyses');
    console.log('• All premium features');
    console.log('• Real-time alerts');
    console.log('• Visual analytics');
    console.log('• CSV export');
    console.log('• API access');
    console.log('• Custom reports');
    
    console.log('\n⚠️  SAVE THESE CREDENTIALS - You can now log in!');
    
  } catch (error) {
    console.error('❌ Admin creation failed:', error);
  } finally {
    process.exit(0);
  }
}

main();