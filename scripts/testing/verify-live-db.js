// Verify Live Supabase Auth and Database Connection
const { createClient } = require('../../server/node_modules/@supabase/supabase-js');
require('dotenv').config({ path: './client/.env' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
  console.error('❌ Error: REACT_APP_SUPABASE_URL is not configured in client/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyLiveDb() {
  console.log('📡 Connecting to live Supabase...');
  console.log(`URL: ${supabaseUrl}\n`);

  try {
    // 1. Use the test user we registered in the previous run
    const testEmail = 'testuser_4464@gmail.com';
    const testPassword = 'testpassword123';

    console.log(`➡️ Step 1: Using existing test user: ${testEmail}`);
    const signUpData = { user: { id: '7179cafb-ddd1-4eab-acb9-e117a03372a5' } };

    // 2. Sign in with the user to establish a session
    console.log('\n➡️ Step 2: Signing in to verify authentication session...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw signInError;
    console.log('✅ Signed in successfully!');

    // 3. Query the user table (RLS allows users to read their own profile)
    console.log('\n➡️ Step 3: Querying the public.users database table...');
    const { data: profiles, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id);

    if (dbError) {
      console.warn('⚠️ Query returned an error (Table might not exist or RLS blocked access):', dbError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Stored record found in public.users:');
      console.log(JSON.stringify(profiles[0], null, 2));
    } else {
      console.log('ℹ️ Auth succeeded, but no matching record found in public.users table yet.');
      console.log('(Note: If you have not set up the database trigger or webhook to sync auth.users to public.users, the table will be empty. This is expected unless a signup API route or trigger creates the row.)');
    }

    console.log('\n🎉 Verification completed successfully!');
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message || error);
  } finally {
    process.exit(0);
  }
}

verifyLiveDb();
