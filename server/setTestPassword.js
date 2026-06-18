/**
 * Set Test Password Script
 * Updates Supabase Auth password for testing purposes
 * 
 * Usage: node setTestPassword.js <email> <password>
 * Example: node setTestPassword.js admin@rageradar.com Admin123!
 */

require('dotenv').config();
const { supabase, isMockMode } = require('./supabase');

async function setPassword(email, newPassword) {
    try {
        console.log(`🔍 Looking up user: ${email}`);

        if (isMockMode) {
            console.log('🔧 Running in Mock Mode — simulating password update');
            console.log('\n✅ Password updated successfully (Mock Mode)!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Email:    ${email}`);
            console.log(`Password: ${newPassword}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            process.exit(0);
        }

        // Look up user by email in the users table
        const { data: userData, error: lookupError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('email', email)
            .single();

        if (lookupError || !userData) {
            throw { code: 'auth/user-not-found', message: `No user found with email: ${email}` };
        }

        console.log(`✅ Found user: ${userData.id}`);

        // Update password via Supabase Admin API
        const { data, error } = await supabase.auth.admin.updateUserById(userData.id, {
            password: newPassword
        });

        if (error) throw error;

        console.log('\n✅ Password updated successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Also update role to admin if email is admin@rageradar.com
        if (email === 'admin@rageradar.com') {
            await supabase
                .from('users')
                .update({
                    role: 'admin',
                    plan: 'enterprise',
                    max_brands: -1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userData.id);

            console.log('✅ Admin role and unlimited access granted in Supabase');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.code === 'auth/user-not-found') {
            console.log('\n💡 User does not exist. Creating new admin user...');
            try {
                // Create user via Supabase Admin API
                const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
                    email: email,
                    password: newPassword,
                    email_confirm: true
                });

                if (createError) throw createError;

                const newUser = newUserData.user;
                console.log(`✅ Created new user: ${newUser.id}`);

                // Set admin role in database
                await supabase
                    .from('users')
                    .insert({
                        id: newUser.id,
                        email: email,
                        role: 'admin',
                        plan: 'enterprise',
                        max_brands: -1,
                        created_at: new Date().toISOString()
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
