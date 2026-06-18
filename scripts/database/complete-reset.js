/**
 * Complete Reset Script (Supabase)
 * Clears all data and recreates admin user
 * Usage: node scripts/database/complete-reset.js
 */
const { supabase, isMockMode } = require('../_supabase');

async function completeReset() {
  try {
    console.log('🔄 Complete database reset starting...\n');

    // 1. Clear all data (order matters due to foreign keys)
    const tables = ['notifications', 'billing_events', 'gdpr_consent', 'audit_logs', 'events', 'analyses', 'password_resets', 'users'];

    for (const table of tables) {
      try {
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log(`   ✅ ${table}: cleared`);
      } catch (err) {
        console.log(`   ⚠️  ${table}: ${err.message}`);
      }
    }

    // 2. Recreate admin user
    console.log('\n👑 Recreating admin user...');
    const adminEmail = 'admin@rageradar.com';
    let adminUid;

    if (isMockMode) {
      adminUid = 'mock-uid-admin-rageradar-com';
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail, password: 'RageRadar2025!', email_confirm: true,
        user_metadata: { firstName: 'Admin', lastName: 'User' }
      });
      if (error) throw error;
      adminUid = data.user.id;
    }

    await supabase.from('users').insert({
      id: adminUid, email: adminEmail, role: 'admin', plan: 'enterprise',
      first_name: 'Admin', last_name: 'User', company_name: 'RageRadar Inc.',
      max_brands: -1, brands_used: 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    });

    console.log('✅ Admin user recreated');
    console.log('\n🎉 Complete reset finished!');
    console.log(`\n📋 Admin: ${adminEmail} / RageRadar2025!`);
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

completeReset();