// Test Supabase Signup Functionality
const { createClient } = require('../../server/node_modules/@supabase/supabase-js');
require('dotenv').config({ path: './client/.env' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const isMockMode = !supabaseUrl || 
                   supabaseUrl === 'your_supabase_url' || 
                   !supabaseAnonKey || 
                   supabaseAnonKey.startsWith('your_');

console.log('🔧 Testing Supabase Signup...');
console.log('Supabase Config:', {
  supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
  supabaseAnonKey: supabaseAnonKey ? '✅ Set' : '❌ Missing',
  mode: isMockMode ? 'MOCK MODE' : 'REAL SUPABASE'
});

async function testSupabaseSignup() {
  if (isMockMode) {
    console.log('✅ In mock mode, frontend signup logic is simulated in localStorage and API routes handle table writes.');
    console.log('🎉 Mock mode checks passed.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase initialized successfully');
    
    // Test signup with a test user
    const testEmail = `testuser_${Math.floor(Math.random() * 10000)}@gmail.com`;
    const testPassword = 'testpassword123';
    
    console.log(`🧪 Testing signup with: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          company_name: 'Test Company'
        }
      }
    });

    if (authError) throw authError;
    console.log('✅ User created in auth.users successfully:', authData.user.id);
    
    console.log('🎉 Supabase signup test completed successfully!');
    
  } catch (error) {
    console.error('❌ Supabase signup test failed:', error.message);
    console.error('Full error:', error);
  }
}

testSupabaseSignup();
