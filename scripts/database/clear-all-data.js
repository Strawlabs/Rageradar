/**
 * Clear All Data Script (Supabase)
 * Deletes all data from all tables
 * Usage: node scripts/database/clear-all-data.js
 */
const { supabase, isMockMode } = require('../_supabase');

async function clearAllData() {
  try {
    console.log('🧹 Clearing all data from Supabase...\n');

    const tables = ['notifications', 'billing_events', 'gdpr_consent', 'audit_logs', 'events', 'analyses', 'password_resets', 'users'];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.log(`   ⚠️  ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: cleared`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${table}: ${err.message}`);
      }
    }

    console.log('\n✅ All data cleared!');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

clearAllData();