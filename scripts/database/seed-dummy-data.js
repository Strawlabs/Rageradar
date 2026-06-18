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
      brands_used: 1,
      max_brands: 2,
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

    // 2. Seed Dummy Analysis
    console.log('\n➡️ Seeding Analyses...');
    const { error: analysisError } = await supabase.from('analyses').insert({
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

    if (analysisError) {
      console.error('❌ Analyses insertion error:', analysisError.message || analysisError);
    } else {
      console.log('✅ Dummy analysis seeded.');
    }

    // 3. Seed Dummy Event
    console.log('\n➡️ Seeding Events...');
    const { error: eventError } = await supabase.from('events').insert({
      brand_id: 'apple',
      user_id: dummyUserId,
      event_name: 'Apple WWDC Keynote',
      event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days in future
      event_type: 'product_launch',
      description: 'Annual developers conference showcasing iOS and macOS updates.',
      pre_event_window: { days: 7 },
      post_event_window: { days: 7 },
      status: 'pending',
      color: '#ff9500',
      analysis: {}
    });

    if (eventError) {
      console.error('❌ Events insertion error:', eventError.message || eventError);
    } else {
      console.log('✅ Dummy event seeded.');
    }

  } catch (error) {
    console.error('❌ Unexpected seeding error:', error);
  } finally {
    console.log('\n🌱 Seeding completed!');
    process.exit(0);
  }
}

seedDummyData();
