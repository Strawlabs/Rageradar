const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./rageradar-d1830-firebase-adminsdk-fbsvc-9e5efed2e6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  // Remove the databaseURL since we're only using Firestore
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
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
  }
}

async function clearAllFirestoreData() {
  try {
    console.log('🧹 Clearing all Firestore data...');
    
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
      'logs',
      'sessions',
      'cache'
    ];
    
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();
        
        if (snapshot.empty) {
          continue;
        }
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        totalDeleted += snapshot.docs.length;
        console.log(`✅ Cleared ${snapshot.docs.length} documents from '${collectionName}'`);
        
      } catch (error) {
        // Collection doesn't exist, which is fine
        continue;
      }
    }
    
    console.log(`✅ Total documents deleted: ${totalDeleted}`);
    
  } catch (error) {
    console.error('❌ Error clearing Firestore:', error);
  }
}

async function createFreshAdminUser() {
  try {
    console.log('👑 Creating fresh admin user...');
    
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
      displayName: 'RageRadar Admin',
      companyName: 'RageRadar Inc.',
      companyEmail: adminEmail,
      contactNumber: '+1-555-ADMIN',
      jobTitle: 'System Administrator',
      companySize: '1000+',
      role: 'admin',
      tier: 'enterprise',
      plan: 'enterprise',
      unlimited: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      signupDate: admin.firestore.FieldValue.serverTimestamp(),
      // Unlimited access settings
      maxBrands: -1, // -1 means unlimited
      brandsUsed: 0,
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
        prioritySupport: true,
        enterpriseDashboard: true,
        advancedAnalytics: true,
        realTimeIntelligence: true,
        aiInsights: true,
        enterpriseIntegrations: true
      },
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          slack: false,
          sms: false
        },
        dashboard: {
          defaultView: 'enterprise',
          autoRefresh: true,
          refreshInterval: 30
        }
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
    console.log('🚀 Starting complete reset process...\n');
    
    // Step 1: Clear all users
    await clearAllUsers();
    console.log('');
    
    // Step 2: Clear all Firestore data
    await clearAllFirestoreData();
    console.log('');
    
    // Step 3: Create fresh admin user
    const adminCredentials = await createFreshAdminUser();
    
    console.log('\n🎉 Complete reset finished successfully!');
    console.log('\n📋 FRESH ADMIN LOGIN CREDENTIALS:');
    console.log('================================');
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: ${adminCredentials.password}`);
    console.log(`UID: ${adminCredentials.uid}`);
    console.log('================================');
    
    console.log('\n🔑 Admin Features Enabled:');
    console.log('• Unlimited brands and analyses');
    console.log('• Enterprise dashboard access');
    console.log('• All premium features unlocked');
    console.log('• Real-time intelligence');
    console.log('• AI insights engine');
    console.log('• Advanced analytics');
    console.log('• Enterprise integrations');
    console.log('• Custom reports and exports');
    console.log('• White label options');
    console.log('• Priority support');
    
    console.log('\n🌟 Next Steps:');
    console.log('1. Clear your browser cache and localStorage');
    console.log('2. Close and restart your browser');
    console.log('3. Go to http://localhost:3000/auth');
    console.log('4. Login with the credentials above');
    console.log('5. Navigate to http://localhost:3000/enterprise');
    
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    process.exit(0);
  }
}

main();