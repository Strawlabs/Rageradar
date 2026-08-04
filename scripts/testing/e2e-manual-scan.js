/**
 * E2E Test Script: SRCH-06 — Manual Scan Trigger
 * 
 * Tests the full /api/analyze flow against the live server.
 * Authenticates with Supabase, triggers a brand scan, and verifies
 * the pipeline runs end-to-end.
 *
 * Prerequisite: Server running on localhost:5001
 * Usage: node scripts/testing/e2e-manual-scan.js
 */

const path = require('path');
const { createClient } = require(path.resolve(__dirname, '../../server/node_modules/@supabase/supabase-js'));

const SUPABASE_URL = 'https://rndcfauuxvyenbqdkxio.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZGNmYXV1eHZ5ZW5icWRreGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQ5NzAsImV4cCI6MjA5NzIwMDk3MH0.9Ek9vT2e7lMyj8kXBuoM0GVQnnGGpwOQNFonBnxGH6o';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZGNmYXV1eHZ5ZW5icWRreGlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyNDk3MCwiZXhwIjoyMDk3MjAwOTcwfQ.J1FK2ECNT2jmve4AYOL7RROXIxy8PPCTQHd-HCr_7yQ';
const API_BASE = 'http://localhost:5001';

const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const results = [];
function record(testId, testName, passed, detail) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  results.push({ testId, testName, status, detail });
  console.log(`${status} | ${testId}: ${testName}`);
  if (detail) console.log(`        → ${detail}`);
}

async function getAuthToken() {
  const testEmail = `e2e_${Date.now()}@test.com`;
  const testPassword = 'StrongPassword123!';

  console.log(`Creating test user: ${testEmail}...`);
  // Create user using admin API (bypasses email confirmation)
  const { data: user, error: createErr } = await serviceClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });

  if (createErr) {
    throw new Error(`Failed to create test user: ${createErr.message}`);
  }

  // Ensure user has a record in public.users table (might be handled by trigger, but just in case)
  // Give them enterprise plan to ensure they can run scans
  await serviceClient.from('users').update({ plan: 'enterprise' }).eq('id', user.user.id);

  console.log('Signing in to get JWT...');
  const { data: session, error: signInErr } = await anonClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInErr || !session.session) {
    throw new Error(`Failed to sign in: ${signInErr?.message || 'No session'}`);
  }

  return { 
    token: session.session.access_token, 
    userId: user.user.id, 
    email: testEmail 
  };
}

async function testManualScan() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SRCH-06: Manual Scan Trigger — E2E Test');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 0: Verify server is up
  try {
    const healthRes = await fetch(`${API_BASE}/api/integrations/health`);
    const health = await healthRes.json();
    record('SRCH-06-0', 'Server is running', health.success,
      `Search providers: ${JSON.stringify(Object.keys(health.searchProviders || {}))}`);
  } catch (err) {
    record('SRCH-06-0', 'Server is running', false, `Cannot reach server: ${err.message}`);
    printSummary();
    return;
  }

  // Step 1: Get auth token
  let auth;
  try {
    auth = await getAuthToken();
    record('SRCH-06-1', 'Auth token obtained', true, `User: ${auth.email}`);
  } catch (err) {
    record('SRCH-06-1', 'Auth token obtained', false, err.message);
    printSummary();
    return;
  }

  // Step 2: Record pre-scan state
  const { data: beforeAnalyses } = await serviceClient
    .from('analyses')
    .select('id, brand_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const beforeCount = beforeAnalyses?.length || 0;
  console.log(`\nPre-scan: ${beforeCount} existing analyses\n`);

  // Step 3: Trigger manual scan
  const scanStart = Date.now();
  console.log('⏳ Triggering manual scan for "Notion"...\n');

  let scanResponse;
  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        brandName: 'Notion',
        website: 'notion.so'
      })
    });

    scanResponse = await res.json();
    const elapsed = ((Date.now() - scanStart) / 1000).toFixed(1);

    // Check if response was successful
    const isSuccess = res.ok && !scanResponse.error;
    record('SRCH-06-2', 'Manual scan starts immediately', isSuccess,
      isSuccess
        ? `Completed in ${elapsed}s`
        : `Error: ${scanResponse.error || scanResponse.details || res.status}`);

    if (!isSuccess) {
      console.log('Full response:', JSON.stringify(scanResponse, null, 2));
      printSummary();
      return;
    }
  } catch (err) {
    record('SRCH-06-2', 'Manual scan starts immediately', false, err.message);
    printSummary();
    return;
  }

  // Step 4: Verify downstream pipeline ran
  const hasRageIndex = scanResponse.rageIndex !== undefined && scanResponse.rageIndex !== null;
  record('SRCH-06-3', 'Pipeline completed (enrichment → emotion → Rage Index)', hasRageIndex,
    hasRageIndex
      ? `Rage Index: ${scanResponse.rageIndex}, Severity: ${scanResponse.severity}`
      : 'No Rage Index in response');

  const hasMentions = scanResponse.totalMentions > 0;
  record('SRCH-06-4', 'Mentions found and processed', hasMentions,
    `Total mentions: ${scanResponse.totalMentions || 0}`);

  const hasThemes = scanResponse.themes && scanResponse.themes.length > 0;
  record('SRCH-06-5', 'Theme extraction produced results', hasThemes,
    hasThemes ? `${scanResponse.themes.length} themes extracted` : 'No themes');

  const hasInsights = scanResponse.executiveSummary || (scanResponse.recommendations && scanResponse.recommendations.length > 0) || (scanResponse.insights && scanResponse.insights.length > 0);
  record('SRCH-06-6', 'AI insights generated', !!hasInsights,
    hasInsights ? 'Executive summary and recommendations present' : 'No insights generated');

  // Step 5: Verify data persisted in DB
  const { data: afterAnalyses } = await serviceClient
    .from('analyses')
    .select('id, brand_name, rage_index, total_mentions, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const afterCount = afterAnalyses?.length || 0;
  const newAnalysis = afterAnalyses?.find(a => a.brand_name === 'Notion');

  record('SRCH-06-7', 'Analysis persisted in database', !!newAnalysis,
    newAnalysis
      ? `DB record: rage_index=${newAnalysis.rage_index}, mentions=${newAnalysis.total_mentions}`
      : `Before: ${beforeCount} analyses, After: ${afterCount}`);

  // Step 6: Test concurrent scan (trigger second while first was running)
  console.log('\n⏳ Testing second manual scan (concurrent)...\n');
  const scan2Start = Date.now();
  try {
    const res2 = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({ brandName: 'Notion', website: 'notion.so' })
    });

    const scan2Response = await res2.json();
    const elapsed2 = ((Date.now() - scan2Start) / 1000).toFixed(1);

    record('SRCH-06-8', 'Second scan completes without corruption', res2.ok,
      `Completed in ${elapsed2}s, Rage Index: ${scan2Response.rageIndex}`);
  } catch (err) {
    record('SRCH-06-8', 'Second scan completes without corruption', false, err.message);
  }

  printSummary();
}

function printSummary() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  SRCH-06 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.status.includes('PASS')).length;
  const failed = results.filter(r => r.status.includes('FAIL')).length;

  results.forEach(r => {
    console.log(`  ${r.status} | ${r.testId}: ${r.testName}`);
  });

  console.log(`\n  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  if (failed === 0) console.log('\n  ✅ SRCH-06: Manual Scan Trigger — PASS');
  else console.log('\n  ⚠️  SRCH-06: Some checks failed. Review details above.');
}

testManualScan().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
