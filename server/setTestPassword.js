/**
 * Set Test Password Script
 * Updates Firebase Auth password for testing purposes
 * 
 * Usage: node setTestPassword.js <email> <password>
 * Example: node setTestPassword.js admin@rageradar.com Admin123!
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function setPassword(email, newPassword) {
    try {
        console.log(`🔍 Looking up user: ${email}`);

        // Get user by email
        const user = await admin.auth().getUserByEmail(email);
        console.log(`✅ Found user: ${user.uid}`);

        // Update password
        await admin.auth().updateUser(user.uid, {
            password: newPassword
        });

        console.log('\n✅ Password updated successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Also update role to admin if email is admin@rageradar.com
        if (email === 'admin@rageradar.com') {
            const db = admin.firestore();
            await db.collection('users').doc(user.uid).set({
                email: email,
                role: 'admin',
                plan: 'enterprise',
                maxBrands: -1,
                maxAnalyses: -1,
                unlimited: true,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('✅ Admin role and unlimited access granted in Firestore');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.code === 'auth/user-not-found') {
            console.log('\n💡 User does not exist. Creating new admin user...');
            try {
                const newUser = await admin.auth().createUser({
                    email: email,
                    password: newPassword,
                    emailVerified: true
                });

                console.log(`✅ Created new user: ${newUser.uid}`);

                // Set admin role
                const db = admin.firestore();
                await db.collection('users').doc(newUser.uid).set({
                    email: email,
                    role: 'admin',
                    plan: 'enterprise',
                    maxBrands: -1,
                    maxAnalyses: -1,
                    unlimited: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log('\n✅ Admin user created successfully!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`Email:    ${email}`);
                console.log(`Password: ${newPassword}`);
                console.log(`Role:     admin`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                process.exit(0);
            } catch (createError) {
                console.error('❌ Failed to create user:', createError.message);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

if (!email || !password) {
    console.error('❌ Usage: node setTestPassword.js <email> <password>');
    console.error('Example: node setTestPassword.js admin@rageradar.com Admin123!');
    process.exit(1);
}

// Validate password strength
if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    process.exit(1);
}

setPassword(email, password);
