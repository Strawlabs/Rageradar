/**
 * Check User Brands Script (Supabase)
 * Shows brand analyses for a specific user
 * Usage: node scripts/users/check-user-brands.js <email>
 */
const { supabase } = require('../_supabase');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node check-user-brands.js <email>');
  process.exit(1);
}

async function checkUserBrands() {
  try {
    console.log(`🔍 Checking brands for: ${email}\n`);

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`👤 User: ${user.email}`);
    console.log(`   Plan: ${user.plan || 'trial'}`);
    console.log(`   Brands used: ${user.brands_used || 0}/${user.max_brands || 1}`);

    // Get analyses
    const { data: analyses, error: analysisError } = await supabase
      .from('analyses')
      .select('brand_name, brand_id, analysis_date, total_mentions, weighted_sentiment_score')
      .eq('user_id', user.id)
      .order('analysis_date', { ascending: false });

    if (analysisError) throw analysisError;

    if (!analyses || analyses.length === 0) {
      console.log('\n📊 No brand analyses found.');
    } else {
      console.log(`\n📊 Brand Analyses (${analyses.length}):`);
      analyses.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.brand_name} — Score: ${a.weighted_sentiment_score}, Mentions: ${a.total_mentions}, Date: ${a.analysis_date}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
  process.exit(0);
}

checkUserBrands();