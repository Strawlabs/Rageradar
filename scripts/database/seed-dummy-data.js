// Seed Dummy Data for RageRadar (Supabase/Mock DB)
const { supabase } = require('../_supabase');

async function seedDummyData() {
  console.log('🌱 Starting database seeding with dummy data...');

  try {
    // 1. Seed Dummy User
    const dummyUserId = '7179cafb-ddd1-4eab-acb9-e117a03372a5';
    console.log('➡️ Seeding Users...');
    
    const { error: userError } = await supabase.from('users').insert({
      id: dummyUserId,
      email: 'testuser_4464@gmail.com',
      plan: 'trial',
      role: 'user',
      first_name: 'Demo',
      last_name: 'User',
      company_name: 'MockCorp',
      company_email: 'info@mockcorp.com',
      contact_number: '+15551234567',
      job_title: 'Product Manager',
      company_size: '50-200',
      brands_used: 2,
      max_brands: 5,
      subscription_status: 'active',
      gdpr_consent: { analytics: true, marketing: false, functional: true, dataProcessing: true },
      gdpr_consent_updated: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      signup_date: new Date().toISOString(),
      last_login: new Date().toISOString()
    });

    if (userError) {
      console.warn('⚠️ User insertion warning/error (user might already exist):', userError.message || userError);
    } else {
      console.log('✅ Dummy user seeded.');
    }

    // 2. Seed Dummy Analyses
    console.log('\n➡️ Seeding Analyses...');
    
    // Seed Apple
    const { error: appleAnalysisError } = await supabase.from('analyses').insert({
      user_id: dummyUserId,
      brand_id: 'apple',
      brand_name: 'Apple',
      total_mentions: 180,
      positive_percentage: 65,
      negative_percentage: 20,
      neutral_percentage: 15,
      weighted_sentiment_score: 72,
      confidence_score: 90,
      rage_index: 22,
      rage_alert: false,
      caution_alert: false,
      emotions: [
        { label: 'joy', score: 0.60 },
        { label: 'neutral', score: 0.15 },
        { label: 'anger', score: 0.12 },
        { label: 'sadness', score: 0.08 },
        { label: 'surprise', score: 0.05 }
      ],
      platform_stats: {
        reddit: { total: 100, positive: 60, negative: 25 },
        product_hunt: { total: 80, positive: 70, negative: 10 }
      },
      top_positive_posts: [
        { title: 'The new M4 chip is absolutely insane!', platform: 'reddit', score: 8.5 },
        { title: 'Best laptop I have ever owned.', platform: 'producthunt', score: 9.0 }
      ],
      top_negative_posts: [
        { title: 'Battery life is slightly worse than expected.', platform: 'reddit', score: 3.0 }
      ],
      search_results: [],
      themes: ['Performance Boost', 'M4 Silicon', 'Pricing Concerns'],
      insights: [
        'Users are extremely thrilled by the M4 processor performance gains.',
        'Watch out for feedback regarding pricing tiers on the base specs.'
      ],
      trendline_summary: {
        dates: ['2026-06-12', '2026-06-14', '2026-06-16', '2026-06-18'],
        scores: [65, 68, 70, 72]
      },
      analysis_date: new Date().toISOString(),
      is_demo: false
    });

    if (appleAnalysisError) {
      console.error('❌ Apple Analysis insertion error:', appleAnalysisError.message || appleAnalysisError);
    } else {
      console.log('✅ Apple mock analysis seeded.');
    }

    // Seed Stripe
    const { error: stripeAnalysisError } = await supabase.from('analyses').insert({
      user_id: dummyUserId,
      brand_id: 'stripe',
      brand_name: 'Stripe',
      total_mentions: 240,
      positive_percentage: 45,
      negative_percentage: 35,
      neutral_percentage: 20,
      weighted_sentiment_score: 54,
      confidence_score: 85,
      rage_index: 58,
      rage_alert: false,
      caution_alert: true,
      emotions: [
        { label: 'frustration', score: 0.35 },
        { label: 'anger', score: 0.25 },
        { label: 'joy', score: 0.20 },
        { label: 'neutral', score: 0.15 },
        { label: 'sadness', score: 0.05 }
      ],
      platform_stats: {
        reddit: { total: 140, positive: 50, negative: 60 },
        twitter: { total: 100, positive: 40, negative: 40 }
      },
      top_positive_posts: [
        { title: 'Stripe Billing makes subscription models so easy to implement.', platform: 'twitter', score: 8.0 },
        { title: 'The new Dashboard metrics UI is highly clean and readable.', platform: 'reddit', score: 7.8 }
      ],
      top_negative_posts: [
        { title: 'API checkout has been throwing 504 Gateway Timeouts for the last hour!', platform: 'reddit', score: 1.2 },
        { title: 'Account got suspended without warning. Devastating.', platform: 'twitter', score: 0.5 }
      ],
      search_results: [],
      themes: ['API Latency Spikes', 'Unexpected Suspensions', 'Subscription Billing Ease'],
      insights: [
        'EU users are experiencing payout delays due to KYC validation updates.',
        'Checkout latency spiked significantly on June 18 between 14:00 and 15:30 UTC.'
      ],
      trendline_summary: {
        dates: ['2026-06-12', '2026-06-14', '2026-06-16', '2026-06-18'],
        scores: [48, 50, 52, 54]
      },
      analysis_date: new Date().toISOString(),
      is_demo: false
    });

    if (stripeAnalysisError) {
      console.error('❌ Stripe Analysis insertion error:', stripeAnalysisError.message || stripeAnalysisError);
    } else {
      console.log('✅ Stripe mock analysis seeded.');
    }

    // 3. Seed Dummy Events
    console.log('\n➡️ Seeding Events...');
    
    // Seed Apple WWDC
    const { error: appleEventError } = await supabase.from('events').insert({
      brand_id: 'apple',
      user_id: dummyUserId,
      event_name: 'Apple WWDC Keynote',
      event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      event_type: 'product_launch',
      description: 'Annual developers conference showcasing iOS and macOS updates.',
      pre_event_window: { days: 7 },
      post_event_window: { days: 7 },
      status: 'pending',
      color: '#ff9500',
      analysis: {}
    });

    if (appleEventError) {
      console.error('❌ Apple Event insertion error:', appleEventError.message || appleEventError);
    } else {
      console.log('✅ Apple WWDC Keynote event seeded.');
    }

    // Seed Stripe Sessions
    const { error: stripeEventError } = await supabase.from('events').insert({
      brand_id: 'stripe',
      user_id: dummyUserId,
      event_name: 'Stripe Sessions Annual Conference',
      event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      event_type: 'developer_conference',
      description: 'Annual conference focusing on global economic infrastructure updates and product announcements.',
      pre_event_window: { days: 5 },
      post_event_window: { days: 5 },
      status: 'pending',
      color: '#6366f1',
      analysis: {}
    });

    if (stripeEventError) {
      console.error('❌ Stripe Event insertion error:', stripeEventError.message || stripeEventError);
    } else {
      console.log('✅ Stripe Sessions event seeded.');
    }

  } catch (error) {
    console.error('❌ Unexpected seeding error:', error);
  } finally {
    console.log('\n🌱 Seeding completed!');
    process.exit(0);
  }
}

seedDummyData();
