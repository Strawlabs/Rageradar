/**
 * Delete Test User Script (Supabase)
 * Deletes a test user by email
 * Usage: node scripts/users/delete-test-user.js <email>
 */
const { supabase, isMockMode } = require('../_supabase');

const email = process.argv[2] || 'test@test.com';

async function deleteTestUser() {
  try {
    console.log(`🗑️  Deleting test user: ${email}`);

    // Find user in database
    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();

    if (user) {
      // Delete from auth (if not mock mode)
      if (!isMockMode) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      // Delete from database (cascades to related tables)
      await supabase.from('users').delete().eq('id', user.id);
      console.log(`✅ Deleted user: ${email} (${user.id})`);
    } else {
      console.log(`⚠️  User not found: ${email}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

deleteTestUser();