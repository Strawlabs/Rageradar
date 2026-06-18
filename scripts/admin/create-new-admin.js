/**
 * Create New Admin User Script (Supabase)
 * Usage: node scripts/admin/create-new-admin.js <email> <password>
 */
const { supabase, isMockMode } = require('../_supabase');

const email = process.argv[2] || 'admin@rageradar.com';
const password = process.argv[3] || 'RageRadar2025!';

async function createAdmin() {
  try {
    console.log(`👑 Creating admin: ${email}`);

    let uid;
    if (isMockMode) {
      uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
      console.log(`✅ Mock admin UID: ${uid}`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { firstName: 'Admin', lastName: 'User' }
      });
      if (error) throw error;
      uid = data.user.id;
      console.log(`✅ Auth user created: ${uid}`);
    }

    await supabase.from('users').insert({
      id: uid, email, role: 'admin', plan: 'enterprise',
      first_name: 'Admin', last_name: 'User',
      max_brands: -1, brands_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    console.log('✅ Admin record created in database');
    console.log(`\n📋 Credentials:\n  Email: ${email}\n  Password: ${password}\n  UID: ${uid}`);
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

createAdmin();