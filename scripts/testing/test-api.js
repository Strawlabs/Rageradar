/**
 * Test API / Database Content (Supabase)
 * Lists users and analyses from the database
 * Usage: node scripts/testing/test-api.js
 */
const { supabase } = require('../_supabase');

async function testDatabaseContent() {
  try {
    console.log('🔍 Checking database content...\n');
    
    // Check analyses table
    console.log('📊 Analyses table:');
    const { data: analyses, error: analysesError } = await supabase.from('analyses').select('*');
    if (analysesError) {
      console.error('❌ Error fetching analyses:', analysesError.message);
    } else {
      console.log(`Found ${analyses?.length || 0} analyses`);
      
      if (analyses && analyses.length > 0) {
        analyses.forEach((data, index) => {
          console.log(`${index + 1}. Brand: ${data.brand_name || data.brandName}`);
          console.log(`   User: ${data.user_id || data.userId}`);
          console.log(`   Mentions: ${data.total_mentions || data.totalMentions}`);
          console.log(`   Positive: ${data.positive_percentage || data.positivePercentage}%`);
          console.log(`   Created: ${data.created_at || data.createdAt}`);
          console.log('');
        });
      }
    }
    
    // Check users table
    console.log('\n👥 Users table:');
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`Found ${users?.length || 0} users`);
      
      if (users && users.length > 0) {
        users.forEach((data, index) => {
          console.log(`${index + 1}. User: ${data.email}`);
          console.log(`   ID: ${data.id}`);
          console.log('');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error checking database:', error);
  } finally {
    process.exit(0);
  }
}

testDatabaseContent();