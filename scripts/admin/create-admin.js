const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./rageradar-d1830-firebase-adminsdk-fbsvc-9e5efed2e6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rageradar-d1830-default-rtdb.firebaseio.com"
});

const auth = admin.auth();
const db = admin.firestore();

async function clearAllUsers() {
  try {
    console.log('🧹 Clearing all existing users...');
    
    // List all users
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    if (users.length === 0) {
      console.log('✅ No users found to delete');
      return;
    }
    
    // Delete all users
    const deletePromises = users.map(user => auth.deleteUser(user.uid));
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${users.length} users from Firebase Auth`);
    
    // Clear Firestore user documents
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    
    usersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (!usersSnapshot.empty) {
      await batch.commit();
      console.log(`✅ Deleted ${usersSnapshot.docs.length} user documents from Firestore`);
    }
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
  }
}

async function createAdminUser() {
  try {
    console.log('👑 Creating admin user...');
    
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
      role: 'admin', // This is the key field for RBAC
      plan: 'enterprise', // Updated to match AuthContext expectations
      tier: 'enterprise',
      unlimited: true,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      // Unlimited access settings
      maxBrands: 'unlimited', // Changed to string for consistency
      maxAnalyses: -1,
      maxAlerts: -1,
      brandsUsed: 0,
      features: {
        realTimeAlerts: true,
        visualAnalytics: true,
        csvExport: true,
        slackIntegration: true,
        apiAccess: true,
        customReports: true,
        whiteLabel: true,
        prioritySupport: true,
        userManagement: true,
        blogManagement: true,
        rbacSettings: true
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
    console.log('🚀 Starting admin setup process...\n');
    
    // Clear all existing users
    await clearAllUsers();
    
    console.log(''); // Empty line for readability
    
    // Create admin user
    const adminCredentials = await createAdminUser();
    
    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n📋 ADMIN LOGIN CREDENTIALS:');
    console.log('================================');
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: ${adminCredentials.password}`);
    console.log(`UID: ${adminCredentials.uid}`);
    console.log('================================');
    console.log('\n🔑 Admin Features:');
    console.log('• Unlimited brands');
    console.log('• Unlimited analyses');
    console.log('• All premium features enabled');
    console.log('• Real-time alerts');
    console.log('• Visual analytics');
    console.log('• CSV export');
    console.log('• Slack integration');
    console.log('• API access');
    console.log('• Custom reports');
    console.log('• White label options');
    console.log('• Priority support');
    
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    process.exit(0);
  }
}

main();