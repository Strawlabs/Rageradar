/**
 * Set Admin Role Script (Supabase)
 * Usage: node scripts/admin/set-admin-role.js <email>
 */
const { supabase } = require('../_supabase');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node set-admin-role.js <email>');
  process.exit(1);
}

async function setAdminRole() {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin', plan: 'enterprise', max_brands: -1, updated_at: new Date().toISOString() })
      .eq('email', email);

    if (error) throw error;
    console.log(`✅ Admin role set for ${email}`);
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

setAdminRole();