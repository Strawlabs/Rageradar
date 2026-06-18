/**
 * Force Refresh Brands Script (Supabase)
 * Resets brands_used counter for all users
 * Usage: node scripts/database/force-refresh-brands.js
 */
const { supabase } = require('../_supabase');

async function forceRefreshBrands() {
  try {
    console.log('🔄 Force refreshing brand counts...');

    // Get all users
    const { data: users, error: fetchError } = await supabase.from('users').select('id, email, brands_used');
    if (fetchError) throw fetchError;

    console.log(`Found ${users?.length || 0} users`);

    // For each user, count their actual analyses and update brands_used
    for (const user of (users || [])) {
      const { data: analyses } = await supabase
        .from('analyses')
        .select('brand_name')
        .eq('user_id', user.id);

      const uniqueBrands = new Set((analyses || []).map(a => a.brand_name)).size;

      await supabase
        .from('users')
        .update({ brands_used: uniqueBrands, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      console.log(`   ✅ ${user.email}: ${uniqueBrands} brands`);
    }

    console.log('\n✅ Brand counts refreshed!');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

forceRefreshBrands();