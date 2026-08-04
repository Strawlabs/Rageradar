/**
 * Quick Supabase connectivity verification script.
 * Tests: API reachability, auth service, and database query.
 */
const { supabase, isMockMode } = require('../_supabase');

console.log('─── Supabase Connection Check ───');
console.log(`Mock mode: ${isMockMode}`);
console.log(`URL : ${process.env.SUPABASE_URL}`);
console.log(`Key : ${process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20) + '…' : '(missing)'}`);
console.log('');

if (isMockMode) {
  console.error('❌ Running in MOCK MODE — no real Supabase connection.');
  process.exit(1);
}

(async () => {
  // 1. Test basic API reachability via auth.getSession()
  console.log('1️⃣  Testing API reachability (auth.getSession) …');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error(`   ❌ Auth error: ${error.message}`);
    } else {
      console.log('   ✅ Auth service reachable.');
    }
  } catch (e) {
    console.error(`   ❌ Network error: ${e.message}`);
  }

  // 2. Test database by querying the 'users' table
  console.log('2️⃣  Testing database query (select from users) …');
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });
    if (error) {
      console.error(`   ❌ DB query error: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`   ✅ Database reachable. Users table row count: ${count ?? '(count not returned — table exists)'}`);
    }
  } catch (e) {
    console.error(`   ❌ Network error: ${e.message}`);
  }

  // 3. Check known tables
  console.log('3️⃣  Checking known tables …');
  const tables = ['users', 'brands', 'complaints', 'reports', 'notifications'];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('id', { head: true });
      if (error) {
        console.log(`   ❌ ${t}: ${error.message}`);
      } else {
        console.log(`   ✅ ${t}: accessible`);
      }
    } catch (e) {
      console.log(`   ❌ ${t}: ${e.message}`);
    }
  }

  console.log('');
  console.log('─── Done ───');
})();
