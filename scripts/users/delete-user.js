/**
 * Delete User Script (Supabase)
 * Deletes a user by email (with confirmation)
 * Usage: node scripts/users/delete-user.js <email>
 */
const { supabase, isMockMode } = require('../_supabase');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node delete-user.js <email>');
  process.exit(1);
}

async function deleteUser() {
  try {
    console.log(`🗑️  Deleting user: ${email}`);

    // Find user
    const { data: user } = await supabase.from('users').select('id, email, role, plan').eq('email', email).single();

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`   Found: ${user.email} (${user.role}, ${user.plan})`);

    // Delete from auth
    if (!isMockMode) {
      await supabase.auth.admin.deleteUser(user.id);
      console.log('   ✅ Removed from Supabase Auth');
    }

    // Delete from database (cascades)
    await supabase.from('users').delete().eq('id', user.id);
    console.log('   ✅ Removed from database');

    console.log(`\n✅ User ${email} deleted successfully!`);
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

deleteUser();