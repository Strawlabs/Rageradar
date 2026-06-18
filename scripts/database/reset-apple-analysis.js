/**
 * Reset Apple Analysis Script (Supabase)
 * Removes all Apple brand analyses
 * Usage: node scripts/database/reset-apple-analysis.js
 */
const { supabase } = require('../_supabase');

async function resetAppleAnalysis() {
  try {
    console.log('🍎 Resetting Apple analysis data...');

    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('brand_name', 'Apple');

    if (error) throw error;
    console.log('✅ Apple analysis data cleared!');
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

resetAppleAnalysis();