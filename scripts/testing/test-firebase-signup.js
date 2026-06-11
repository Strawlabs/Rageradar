// Test Firebase Signup Functionality
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: './client/.env' });

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

console.log('🔧 Testing Firebase Signup...');
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing'
});

async function testFirebaseSignup() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test signup with a test user
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log(`🧪 Testing signup with: ${testEmail}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created successfully:', userCredential.user.uid);
    
    // Test Firestore write
    const userDoc = {
      email: testEmail,
      plan: 'trial',
      createdAt: new Date(),
      trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      brandsUsed: 0,
      maxBrands: 1,
      firstName: 'Test',
      lastName: 'User',
      companyName: 'Test Company'
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
    console.log('✅ User document created in Firestore');
    
    console.log('🎉 Firebase signup test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase signup test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
}

testFirebaseSignup();