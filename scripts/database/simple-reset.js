/**
 * Simple Reset Script (Supabase)
 * Clears analyses and events but keeps users
 * Usage: node scripts/database/simple-reset.js
 */
const { supabase } = require('../_supabase');

async function simpleReset() {
  try {
    console.log('🔄 Simple database reset (keeping users)...\n');

    const tables = ['notifications', 'events', 'analyses'];

    for (const table of tables) {
      try {
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log(`   ✅ ${table}: cleared`);
      } catch (err) {
        console.log(`   ⚠️  ${table}: ${err.message}`);
      }
    }

    // Reset brands_used on all users
    await supabase.from('users').update({ brands_used: 0, updated_at: new Date().toISOString() }).neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ users: brands_used reset to 0');

    console.log('\n✅ Simple reset complete! Users preserved.');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

simpleReset();