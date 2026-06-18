require('dotenv').config({ path: '.env' });

const express = require('express');
const cors = require('cors');
const { supabase, isMockMode } = require('./supabase');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

// Initialize logger first (before any other imports that might use it)
const logger = require('./utils/logger');
logger.info('🚀 Starting RageRadar server...');

// Validate environment variables before starting server
const { validateEnvironment } = require('./utils/envValidator');
validateEnvironment();

// Import Sentry for error tracking
const {
  initSentry,
  getSentryRequestHandler,
  getSentryTracingHandler,
  getSentryErrorHandler,
} = require('./utils/sentry');

// Import our new working search components
const SearchEngine = require('./searchEngine');
const SentimentAnalyzer = require('./sentimentAnalyzer');

// Import Phase 3 components
const TrendlineAnalyzer = require('./trendlineAnalyzer');
const ThemeExtractor = require('./utils/themeExtractor');
const InsightsGenerator = require('./utils/insightsGenerator');

// Import rate limiting middleware
const {
  apiLimiter,
  analysisLimiter,
  authLimiter,
  paymentLimiter,
  previewLimiter
} = require('./middleware/rateLimiter');

// Import request logging middleware
const { requestLogger, errorLogger } = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Sentry (must be first)
initSentry(app);

// Sentry request handler (must be before other middleware)
app.use(getSentryRequestHandler());
app.use(getSentryTracingHandler());

// Request logging
app.use(requestLogger);

// Middleware - Apply rate limiting
app.use('/api', apiLimiter); // General API rate limiting
app.use(cors());
app.use(express.json({ limit: '10mb' }));



if (isMockMode) {
  logger.info('⚠️ RUNNING IN LOCAL MOCK MODE (No real Supabase credentials provided)');
}
// Initialize search components
const searchEngine = new SearchEngine();
const sentimentAnalyzer = new SentimentAnalyzer();

// Initialize Phase 3 components
const trendlineAnalyzer = new TrendlineAnalyzer();
const themeExtractor = new ThemeExtractor();
const insightsGenerator = new InsightsGenerator();

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      uid: data.user.id,
      email: data.user.email,
      role: data.user.role || 'user',
      ...data.user
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Plan enforcement middleware
const checkUserPlan = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    // Get user plan from Supabase
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    let userData;
    if (userError || !userRow) {
      // Create default trial plan if user doesn't exist
      const defaultPlan = {
        id: userId,
        email: req.user.email || '',
        plan: 'trial',
        role: 'user',
        brands_used: 0,
        max_brands: 1,
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data: newRow, error: insertError } = await supabase
        .from('users')
        .insert(defaultPlan)
        .select()
        .single();
      
      userData = newRow ? {
        plan: newRow.plan,
        maxBrands: newRow.max_brands,
        brandsUsed: newRow.brands_used,
        trialEndsAt: newRow.trial_ends_at,
        role: newRow.role,
        email: newRow.email
      } : {
        plan: 'trial',
        maxBrands: 1,
        brandsUsed: 0,
        trialEndsAt: defaultPlan.trial_ends_at,
        role: 'user',
        email: defaultPlan.email
      };
    } else {
      userData = {
        plan: userRow.plan,
        maxBrands: userRow.max_brands,
        brandsUsed: userRow.brands_used,
        trialEndsAt: userRow.trial_ends_at,
        role: userRow.role,
        email: userRow.email
      };
    }

    req.userPlan = userData;

    // Admin users bypass all checks
    if (userData.role === 'admin') {
      return next();
    }

    // Check trial expiration
    if (userData.plan === 'trial') {
      const trialEnd = new Date(userData.trialEndsAt);

      if (new Date() > trialEnd) {
        return res.status(403).json({
          error: 'Trial expired',
          message: 'Your 3-day trial has expired. Upgrade to continue analyzing brands.',
          code: 'TRIAL_EXPIRED',
          currentPlan: 'trial',
          upgradeUrl: '/pricing',
          plans: {
            starter: { price: 19, brands: 3 },
            pro: { price: 49, brands: 10 },
            enterprise: { price: 'Custom', brands: 'Unlimited' }
          }
        });
      }
    }

    // Check brand limit
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('brand_name')
      .eq('user_id', userId);

    // Count unique brands
    const uniqueBrands = new Set();
    if (analyses) {
      analyses.forEach(row => {
        if (row.brand_name) {
          uniqueBrands.add(row.brand_name.toLowerCase());
        }
      });
    }

    const brandsUsed = uniqueBrands.size;
    const maxBrands = userData.maxBrands || 1;

    // Check if analyzing a new brand
    const requestedBrand = req.body.brandName?.toLowerCase();
    const isNewBrand = requestedBrand && !uniqueBrands.has(requestedBrand);

    if (isNewBrand && brandsUsed >= maxBrands) {
      return res.status(403).json({
        error: 'Brand limit reached',
        message: `You've reached your limit of ${maxBrands} brand${maxBrands > 1 ? 's' : ''}. Upgrade to analyze more brands.`,
        code: 'BRAND_LIMIT_REACHED',
        currentPlan: userData.plan,
        brandsUsed: brandsUsed,
        maxBrands: maxBrands,
        upgradeUrl: '/pricing',
        plans: {
          starter: { price: 19, brands: 3 },
          pro: { price: 49, brands: 10 },
          enterprise: { price: 'Custom', brands: 'Unlimited' }
        }
      });
    }

    // Update brands used count
    if (isNewBrand) {
      await supabase
        .from('users')
        .update({
          brands_used: brandsUsed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }

    next();
  } catch (error) {
    console.error('Plan check error:', error);
    // Allow request to proceed on error to avoid blocking users
    next();
  }
};

// Main brand analysis endpoint - with strict rate limiting
app.post('/api/analyze', authenticateUser, analysisLimiter, checkUserPlan, async (req, res) => {
  try {
    const { brandName } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    console.log(`Starting analysis for brand: ${brandName}`);

    // Step 1: Search for brand mentions
    const searchResults = await searchEngine.searchAllPlatforms(brandName);

    if (searchResults.length === 0) {
      return res.status(404).json({
        error: 'No mentions found for this brand',
        brandName,
        totalMentions: 0
      });
    }

    // Step 2: Extract text content and timestamps for sentiment analysis
    const textContent = searchResults.map(result => result.text).filter(text => text && text.length > 10);
    const timestamps = searchResults.map(result => result.timestamp || new Date().toISOString());

    if (textContent.length === 0) {
      return res.status(404).json({
        error: 'No analyzable content found',
        brandName,
        totalMentions: 0
      });
    }

    // Step 3: Perform enhanced sentiment analysis with brand context and temporal weighting
    const sentimentResults = sentimentAnalyzer.analyzeBatch(textContent, brandName, timestamps);

    // Step 4: Calculate platform statistics
    const platformStats = {};
    searchResults.forEach(result => {
      platformStats[result.platform] = (platformStats[result.platform] || 0) + 1;
    });

    // Step 5: Extract top positive and negative posts
    const sortedResults = sentimentResults.individual
      .map((result, index) => ({
        ...result,
        ...searchResults[index]
      }))
      .sort((a, b) => b.sentiment.score - a.sentiment.score);

    const topPositive = sortedResults
      .filter(r => r.sentiment.sentiment === 'positive')
      .slice(0, 3)
      .map(r => ({
        text: r.text,
        platform: r.platform,
        score: r.sentiment.score,
        url: r.url
      }));

    const topNegative = sortedResults
      .filter(r => r.sentiment.sentiment === 'negative')
      .slice(-3)
      .map(r => ({
        text: r.text,
        platform: r.platform,
        score: r.sentiment.score,
        url: r.url
      }));

    // Step 6: Calculate enhanced rage index with temporal and context weighting
    const negativeResults = sentimentResults.individual.filter(r => r.sentiment.sentiment === 'negative');

    let rageIndex = 0;
    if (negativeResults.length > 0) {
      // Calculate weighted negative intensity
      const weightedNegativeIntensity = negativeResults.reduce((sum, r) => {
        const intensity = 100 - r.sentiment.score;
        const weight = (r.sentiment.temporalWeight || 1) * r.sentiment.confidence;
        const contextMultiplier = r.sentiment.contextModifiers?.includes('sarcasm') ? 1.3 : 1.0;
        return sum + (intensity * weight * contextMultiplier);
      }, 0);

      const totalWeight = negativeResults.reduce((sum, r) =>
        sum + ((r.sentiment.temporalWeight || 1) * r.sentiment.confidence), 0);

      const avgWeightedIntensity = totalWeight > 0 ? weightedNegativeIntensity / totalWeight : 0;

      // Enhanced rage index calculation
      rageIndex = Math.min(100, avgWeightedIntensity * (sentimentResults.overall.negativePercentage / 100) * 1.2);
    }

    // Step 7: Extract themes from high-rage mentions (Phase 3)
    let themes = [];
    try {
      const mentionsWithRage = sortedResults.map(r => ({
        text: r.text,
        rageIndex: Math.round(rageIndex),
        platform: r.platform,
        timestamp: r.timestamp || new Date(),
        emotions: r.sentiment.emotions || []
      }));

      themes = await themeExtractor.extractThemes(mentionsWithRage, {
        minRageIndex: 50,
        topN: 5
      });
    } catch (themeError) {
      console.error('Theme extraction error:', themeError);
      // Continue without themes
    }

    // Step 8: Build comprehensive analysis result with enhanced insights
    const analysis = {
      brandName,
      totalMentions: searchResults.length,
      positivePercentage: Math.round(sentimentResults.overall.positivePercentage),
      negativePercentage: Math.round(sentimentResults.overall.negativePercentage),
      neutralPercentage: Math.round(sentimentResults.overall.neutralPercentage),
      weightedSentimentScore: Math.round(sentimentResults.overall.weightedAverage),
      confidenceScore: Math.round(sentimentResults.overall.confidenceScore * 100),
      rageIndex: Math.round(rageIndex),
      rageAlert: rageIndex > 70,
      cautionAlert: rageIndex > 50,
      emotions: sentimentResults.emotions,
      platformStats,
      topPositivePosts: topPositive,
      topNegativePosts: topNegative,
      searchResults: searchResults.slice(0, 10), // Return top 10 for reference
      analysisDate: new Date().toISOString(),
      isDemo: false,
      // Phase 3: Themes
      themes: themes,
      // Enhanced analysis features
      trendAnalysis: sentimentResults.trendAnalysis,
      contextInsights: sentimentResults.contextInsights,
      brandSpecificAnalysis: sentimentResults.brandSpecificAnalysis,
      enhancedFeatures: {
        temporalWeighting: true,
        contextDetection: true,
        brandSpecificKeywords: !!sentimentResults.brandSpecificAnalysis,
        sarcasmDetection: true,
        trendAnalysis: !!sentimentResults.trendAnalysis,
        themeExtraction: themes.length > 0
      }
    };

    // Step 9: Save to database and get brandId for Phase 3 features
    let savedAnalysisId = null;
    const brandId = `${req.user.uid}_${brandName.toLowerCase().replace(/\s+/g, '_')}`;
    try {
      const analysisToSave = {
        user_id: req.user.uid,
        brand_id: brandId,
        brand_name: brandName,
        total_mentions: analysis.totalMentions,
        positive_percentage: analysis.positivePercentage,
        negative_percentage: analysis.negativePercentage,
        neutral_percentage: analysis.neutralPercentage,
        weighted_sentiment_score: analysis.weightedSentimentScore,
        confidence_score: analysis.confidenceScore,
        rage_index: analysis.rageIndex,
        rage_alert: analysis.rageAlert,
        caution_alert: analysis.cautionAlert,
        emotions: analysis.emotions || [],
        platform_stats: analysis.platformStats || {},
        top_positive_posts: analysis.topPositivePosts || [],
        top_negative_posts: analysis.topNegativePosts || [],
        search_results: analysis.searchResults || [],
        themes: analysis.themes || [],
        insights: analysis.insights || [],
        trendline_summary: null,
        analysis_date: analysis.analysisDate || new Date().toISOString(),
        is_demo: analysis.isDemo || false
      };

      const { data: savedAnalysis, error: dbError } = await supabase
        .from('analyses')
        .insert(analysisToSave)
        .select()
        .single();

      if (dbError) throw dbError;
      savedAnalysisId = savedAnalysis.id;
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if DB save fails
    }

    // Step 10: Generate automated insights (Phase 3)
    let insights = [];
    let trendlineSummary = null;
    try {
      // Get historical analyses for this brand to calculate trendline
      const { data: historicalRows, error: historicalError } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', req.user.uid)
        .eq('brand_name', brandName)
        .order('created_at', { ascending: false })
        .limit(30);

      // Only calculate trendline if we have enough historical data
      if (historicalRows && historicalRows.length >= 7) {
        const trendline = await trendlineAnalyzer.calculateTrendline(brandId, {
          period: 30,
          granularity: 'day'
        });
        trendlineSummary = trendline.summary;
      }

      // Generate insights
      const insightData = {
        currentAnalysis: analysis,
        themes: themes,
        trendline: trendlineSummary ? { summary: trendlineSummary } : null
      };

      insights = await insightsGenerator.generateInsights(insightData);

      // Update saved analysis with insights and trendline
      if (savedAnalysisId) {
        await supabase
          .from('analyses')
          .update({
            insights: insights,
            trendline_summary: trendlineSummary
          })
          .eq('id', savedAnalysisId);
      }
    } catch (insightError) {
      console.error('Insight generation error:', insightError);
      // Continue without insights
    }

    // Add insights and trendline to response
    analysis.insights = insights;
    analysis.trendlineSummary = trendlineSummary;

    console.log(`Analysis completed for ${brandName}: ${analysis.totalMentions} mentions, ${analysis.positivePercentage}% positive`);

    res.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed. Please try again.',
      details: error.message
    });
  }
});

// Get user's brands
app.get('/api/brands', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;

    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const brands = (analyses || []).map(row => ({
      id: row.id,
      brandName: row.brand_name,
      name: row.brand_name,
      userId: row.user_id,
      brandId: row.brand_id,
      totalMentions: row.total_mentions,
      positivePercentage: row.positive_percentage,
      negativePercentage: row.negative_percentage,
      neutralPercentage: row.neutral_percentage,
      weightedSentimentScore: row.weighted_sentiment_score,
      confidenceScore: row.confidence_score,
      rageIndex: row.rage_index,
      rageAlert: row.rage_alert,
      cautionAlert: row.caution_alert,
      emotions: row.emotions,
      platformStats: row.platform_stats,
      topPositivePosts: row.top_positive_posts,
      topNegativePosts: row.top_negative_posts,
      searchResults: row.search_results,
      themes: row.themes,
      insights: row.insights,
      trendlineSummary: row.trendline_summary,
      analysisDate: row.analysis_date,
      isDemo: row.is_demo,
      createdAt: row.created_at
    }));

    // Sort by createdAt desc
    brands.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Found ${brands.length} analyzed brands for user ${userId}`);
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Delete a brand analysis
app.delete('/api/brands/:brandName', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const brandName = decodeURIComponent(req.params.brandName);

    console.log(`🗑️ Deleting brand analysis: ${brandName} for user: ${userId}`);

    // Check if exists first
    const { data: existing, error: findError } = await supabase
      .from('analyses')
      .select('id')
      .eq('user_id', userId)
      .eq('brand_name', brandName);

    if (findError || !existing || existing.length === 0) {
      console.log(`❌ No analysis found for brand: ${brandName}`);
      return res.status(404).json({ error: 'Brand analysis not found' });
    }

    // Delete all matching documents
    const { error: deleteError } = await supabase
      .from('analyses')
      .delete()
      .eq('user_id', userId)
      .eq('brand_name', brandName);

    if (deleteError) throw deleteError;

    console.log(`✅ Successfully deleted analysis document(s) for brand: ${brandName}`);
    res.json({
      success: true,
      message: `Brand analysis for "${brandName}" deleted successfully`,
      deletedCount: existing.length
    });
  } catch (error) {
    console.error('❌ Error deleting brand analysis:', error);
    res.status(500).json({ error: 'Failed to delete brand analysis' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    searchEngine: 'Working',
    sentimentAnalyzer: 'Working'
  });
});

// Quick preview analysis (no auth required)
// Quick preview analysis (no auth required) - with strict rate limiting for unauthenticated users
app.post('/api/preview-analysis', previewLimiter, async (req, res) => {
  try {
    const { brandName } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    console.log(`Preview analysis for: ${brandName}`);

    // Quick search with limited results
    const searchResults = await searchEngine.searchAllPlatforms(brandName);

    if (searchResults.length === 0) {
      return res.json({
        brandName,
        totalMentions: 0,
        message: 'No mentions found for this brand'
      });
    }

    // Optimized sentiment analysis - faster processing
    const textContent = searchResults.slice(0, 20).map(r => {
      // Combine title and text for better analysis
      const title = r.title || '';
      const text = r.text || '';
      return title + (text ? ' ' + text : '');
    }).filter(t => t && t.length > 5); // Less restrictive filter

    // Use fast batch processing for better performance
    const sentimentResults = sentimentAnalyzer.analyzeBatch(textContent, brandName, null, {
      skipEmotions: true,   // Skip expensive emotion analysis
      skipTrends: true,     // Skip trend analysis  
      skipInsights: true    // Skip context insights
    });

    res.json({
      brandName,
      totalMentions: searchResults.length,
      positivePercentage: Math.round(sentimentResults.overall.positivePercentage),
      negativePercentage: Math.round(sentimentResults.overall.negativePercentage),
      neutralPercentage: Math.round(sentimentResults.overall.neutralPercentage),
      preview: true
    });

  } catch (error) {
    console.error('Preview analysis error:', error);
    res.status(500).json({ error: 'Preview analysis failed' });
  }
});

// Stripe Checkout Session
// Stripe Checkout Session - with payment rate limiting
app.post('/api/create-checkout-session', authenticateUser, paymentLimiter, async (req, res) => {
  try {
    const { priceId, plan, billingCycle } = req.body;

    if (!priceId || !plan) {
      return res.status(400).json({ error: 'Price ID and plan are required' });
    }

    console.log(`Creating checkout session for user ${req.user.uid}, plan: ${plan}`);

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: req.user.uid,
        plan: plan,
        billingCycle: billingCycle || 'monthly'
      },
      subscription_data: {
        metadata: {
          userId: req.user.uid,
          plan: plan
        }
      }
    });

    console.log(`Checkout session created: ${session.id}`);
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook Handler
app.post('/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Webhook received: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const { userId, plan } = session.metadata;

          console.log(`Checkout completed for user ${userId}, plan: ${plan}`);

          // Plan limits
          const planLimits = {
            starter: { maxBrands: 3, features: ['basic', 'reports'] },
            pro: { maxBrands: 10, features: ['basic', 'reports', 'alerts', 'export'] },
            enterprise: { maxBrands: 999999, features: ['all'] }
          };

          // Update user plan in Supabase
          await supabase
            .from('users')
            .update({
              plan: plan,
              max_brands: planLimits[plan].maxBrands,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          console.log(`User ${userId} upgraded to ${plan}`);
          break;

        case 'customer.subscription.updated':
          const subscription = event.data.object;
          const subUserId = subscription.metadata.userId;

          console.log(`Subscription updated for user ${subUserId}`);

          await supabase
            .from('users')
            .update({
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', subUserId);
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object;
          const deletedUserId = deletedSub.metadata.userId;

          console.log(`Subscription canceled for user ${deletedUserId}`);

          // Downgrade to trial
          await supabase
            .from('users')
            .update({
              plan: 'trial',
              max_brands: 1,
              subscription_status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('id', deletedUserId);
          break;

        case 'invoice.payment_succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          console.error('Payment failed:', failedInvoice.id);

          // Optionally notify user or update status
          if (failedInvoice.subscription_details?.metadata?.userId) {
            await supabase
              .from('users')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString()
              })
              .eq('id', failedInvoice.subscription_details.metadata.userId);
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

// Get user's current plan and usage
app.get('/api/user/plan', authenticateUser, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.uid)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get brand count
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('brand_name')
      .eq('user_id', req.user.uid);

    const uniqueBrands = new Set();
    if (analyses) {
      analyses.forEach(row => {
        if (row.brand_name) uniqueBrands.add(row.brand_name.toLowerCase());
      });
    }

    // Get list of brands for display
    const brandsList = Array.from(uniqueBrands);

    res.json({
      plan: userData.plan || 'trial',
      maxBrands: userData.max_brands || 1,
      brandsUsed: uniqueBrands.size,
      brandsList: brandsList,
      features: userData.features || ['basic'],
      subscriptionStatus: userData.subscription_status || 'active',
      trialEndsAt: userData.trial_ends_at,
      stripeCustomerId: userData.stripe_customer_id,
      role: userData.role,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    res.status(500).json({ error: 'Failed to fetch user plan' });
  }
});

// Cancel subscription
app.post('/api/billing/cancel-subscription', authenticateUser, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.uid)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!userData.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(
      userData.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    await supabase
      .from('users')
      .update({
        subscription_status: 'canceling',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.uid);

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      periodEnd: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mount Phase 3 Insights Routes
app.use('/api/insights', require('./routes/insights'));

// Sentry error handler (must be before other error handlers)
app.use(getSentryErrorHandler());

// Error logging middleware
app.use(errorLogger);

// Final error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : err.message
  });
});

app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('🔍 Search Engine: Ready');
  logger.info('🤖 Sentiment Analyzer: Ready');
  logger.info(`💳 Stripe Integration: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not Configured'}`);
  logger.info(`📈 Sentry Monitoring: ${process.env.SENTRY_DSN ? 'Enabled' : 'Disabled'}`);
  logger.info('🚀 RageRadar server is ready!');
});