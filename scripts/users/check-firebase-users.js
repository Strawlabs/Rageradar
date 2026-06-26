/**
 * Check Users Script (Supabase)
 * Lists all users in the database
 * Usage: node scripts/users/check-firebase-users.js
 * 
 * Note: This script was renamed from check-firebase-users but kept
 * for backwards compatibility. Use check-users.js instead.
 */
const { supabase } = require('../_supabase');

async function checkUsers() {
  try {
    console.log('👥 Listing all users...\n');

    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw error;

    if (!users || users.length === 0) {
      console.log('No users found.');
      process.exit(0);
    }

    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   ID:    ${user.id}`);
      console.log(`   Role:  ${user.role || 'user'}`);
      console.log(`   Plan:  ${user.plan || 'trial'}`);
      console.log(`   Brands: ${user.brands_used || 0}/${user.max_brands || 1}`);
      console.log('');
    });

    console.log(`Total: ${users.length} users`);
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

checkUsers();