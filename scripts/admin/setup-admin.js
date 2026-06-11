const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin (make sure you have your service account key)
const serviceAccount = require('./server/rageradar-firebase-adminsdk.json'); // Update path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rageradar-default-rtdb.firebaseio.com" // Update with your database URL
});

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAdmin() {
  console.log('🔐 RageRadar Admin Setup');
  console.log('========================\n');

  rl.question('Enter admin email: ', async (email) => {
    rl.question('Enter admin password: ', async (password) => {
      try {
        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          emailVerified: true
        });

        console.log(`✅ Created user: ${userRecord.uid}`);

        // Create user document in Firestore with admin role
        const userDoc = {
          email: email,
          role: 'admin',
          plan: 'enterprise',
          createdAt: new Date(),
          firstName: 'Admin',
          lastName: 'User',
          maxBrands: 'unlimited',
          brandsUsed: 0,
          status: 'active'
        };

        await db.collection('users').doc(userRecord.uid).set(userDoc);
        
        console.log('✅ Created admin user document in Firestore');
        console.log('\n🎉 Admin setup complete!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`👤 Role: admin`);
        console.log('\nYou can now login with these credentials and access admin features.');
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
      }
    });
  });
}

setupAdmin();