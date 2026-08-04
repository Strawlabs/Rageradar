/**
 * RLS-06 Deep Investigation
 * Verify whether the anon UPDATE actually modified any rows
 */
const path = require('path');
const { createClient } = require(path.resolve(__dirname, '../../server/node_modules/@supabase/supabase-js'));

const SUPABASE_URL = 'https://rndcfauuxvyenbqdkxio.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZGNmYXV1eHZ5ZW5icWRreGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQ5NzAsImV4cCI6MjA5NzIwMDk3MH0.9Ek9vT2e7lMyj8kXBuoM0GVQnnGGpwOQNFonBnxGH6o';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZGNmYXV1eHZ5ZW5icWRreGlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyNDk3MCwiZXhwIjoyMDk3MjAwOTcwfQ.J1FK2ECNT2jmve4AYOL7RROXIxy8PPCTQHd-HCr_7yQ';

const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function investigate() {
  // Get a user's current state
  const { data: users } = await serviceClient
    .from('users')
    .select('id, email, plan, role')
    .limit(1);

  const target = users[0];
  console.log('Target user BEFORE:', JSON.stringify(target));

  // Attempt anon UPDATE with .select() to see returned rows
  const { data: updateResult, error: updateErr, count, status, statusText } = await anonClient
    .from('users')
    .update({ plan: 'enterprise', role: 'super_admin' })
    .eq('id', target.id)
    .select();

  console.log('\nAnon UPDATE response:');
  console.log('  status:', status, statusText);
  console.log('  error:', updateErr ? updateErr.message : 'none');
  console.log('  returned rows:', updateResult?.length || 0);
  console.log('  count:', count);

  // Verify the actual state with service-role
  const { data: after } = await serviceClient
    .from('users')
    .select('id, email, plan, role')
    .eq('id', target.id)
    .single();

  console.log('\nTarget user AFTER:', JSON.stringify(after));

  const planChanged = after.plan !== target.plan;
  const roleChanged = after.role !== target.role;

  if (planChanged || roleChanged) {
    console.log('\n❌ CRITICAL P0: Data was actually modified by anon client!');
    console.log(`   Plan: ${target.plan} → ${after.plan}`);
    console.log(`   Role: ${target.role} → ${after.role}`);
    
    // Restore original values immediately
    await serviceClient.from('users')
      .update({ plan: target.plan, role: target.role })
      .eq('id', target.id);
    console.log('   ↳ Restored to original values');
  } else {
    console.log('\n✅ SAFE: RLS silently filtered the UPDATE — 0 rows affected.');
    console.log('   Note: Supabase returns no error for UPDATE on 0 matching rows.');
    console.log('   This is expected behavior, not a security gap.');
  }
}

investigate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
