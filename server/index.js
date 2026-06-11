require('dotenv').config({ path: '.env' });

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
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



// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Check if using local mock mode
const isMockMode = process.env.FIREBASE_PROJECT_ID === 'your_project_id' || !process.env.FIREBASE_PROJECT_ID;

if (isMockMode) {
  logger.info('⚠️ RUNNING IN LOCAL MOCK MODE (No real Firebase credentials provided)');
  const MockDb = require('./utils/mockDb');
  const mockDbInstance = new MockDb();
  
  // Monkey patch admin.firestore
  Object.defineProperty(admin, 'firestore', {
    value: function() {
      return mockDbInstance;
    },
    configurable: true
  });
  admin.firestore.FieldValue = {
    serverTimestamp: () => 'SERVER_TIMESTAMP_SENTINEL'
  };

  // Monkey patch admin.auth
  const mockAuthInstance = {
    verifyIdToken: async (token) => {
      if (token && (token.startsWith('mock-token-') || token === 'mock-token')) {
        const email = token === 'mock-token' ? 'admin@rageradar.com' : token.replace('mock-token-', '');
        const uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
        return {
          uid,
          email,
          role: email === 'admin@rageradar.com' ? 'admin' : 'user',
          admin: email === 'admin@rageradar.com',
          email_verified: true
        };
      }
      throw new Error('Invalid token in mock mode');
    },
    getUserByEmail: async (email) => {
      const uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
      return { uid, email };
    },
    createUser: async (properties) => {
      const uid = 'mock-uid-' + properties.email.replace(/[@.]/g, '-');
      return { uid, ...properties };
    },
    updateUser: async (uid, properties) => {
      return { uid, ...properties };
    },
    deleteUser: async (uid) => {
      return true;
    }
  };

  Object.defineProperty(admin, 'auth', {
    value: function() {
      return mockAuthInstance;
    },
    configurable: true
  });
}

const db = admin.firestore();

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

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
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

    // Get user plan from Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // Create default trial plan if user doesn't exist
      const defaultPlan = {
        email: req.user.email || '',
        plan: 'trial',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        brandsUsed: 0,
        maxBrands: 1,
        role: 'user'
      };

      await db.collection('users').doc(userId).set(defaultPlan);
      req.userPlan = defaultPlan;
      return next();
    }

    const userData = userDoc.data();
    req.userPlan = userData;

    // Admin users bypass all checks
    if (userData.role === 'admin') {
      return next();
    }

    // Check trial expiration
    if (userData.plan === 'trial') {
      const trialEnd = userData.trialEndsAt?.toDate ? userData.trialEndsAt.toDate() : new Date(userData.trialEndsAt);

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
    const analysesSnapshot = await db.collection('analyses')
      .where('userId', '==', userId)
      .select('brandName')
      .get();

    // Count unique brands
    const uniqueBrands = new Set();
    analysesSnapshot.forEach(doc => {
      const brandName = doc.data().brandName;
      if (brandName) {
        uniqueBrands.add(brandName.toLowerCase());
      }
    });

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
      await db.collection('users').doc(userId).update({
        brandsUsed: brandsUsed + 1,
        lastAnalysisAt: admin.firestore.FieldValue.serverTimestamp()
      });
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
    try {
      const docRef = await db.collection('analyses').add({
        ...analysis,
        userId: req.user.uid,
        brandId: `${req.user.uid}_${brandName.toLowerCase().replace(/\s+/g, '_')}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      savedAnalysisId = docRef.id;
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if DB save fails
    }

    // Step 10: Generate automated insights (Phase 3)
    let insights = [];
    let trendlineSummary = null;
    try {
      // Get historical analyses for this brand to calculate trendline
      const brandId = `${req.user.uid}_${brandName.toLowerCase().replace(/\s+/g, '_')}`;
      const historicalSnapshot = await db.collection('analyses')
        .where('userId', '==', req.user.uid)
        .where('brandName', '==', brandName)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();

      // Only calculate trendline if we have enough historical data
      if (historicalSnapshot.size >= 7) {
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
        await db.collection('analyses').doc(savedAnalysisId).update({
          insights: insights,
          trendlineSummary: trendlineSummary
        });
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

    // Fetch from analyses collection where the actual data is stored
    const analysesSnapshot = await db.collection('analyses')
      .where('userId', '==', userId)
      .get();

    const brands = [];
    analysesSnapshot.forEach(doc => {
      const data = doc.data();
      brands.push({
        id: doc.id,
        brandName: data.brandName,
        name: data.brandName,
        ...data
      });
    });

    // Sort by createdAt in JavaScript (most recent first)
    brands.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });

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

    // Find and delete all analyses for this brand and user
    const analysesSnapshot = await db.collection('analyses')
      .where('userId', '==', userId)
      .where('brandName', '==', brandName)
      .get();

    if (analysesSnapshot.empty) {
      console.log(`❌ No analysis found for brand: ${brandName}`);
      return res.status(404).json({ error: 'Brand analysis not found' });
    }

    // Delete all matching documents
    const batch = db.batch();
    analysesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`✅ Successfully deleted ${analysesSnapshot.size} analysis document(s) for brand: ${brandName}`);
    res.json({
      success: true,
      message: `Brand analysis for "${brandName}" deleted successfully`,
      deletedCount: analysesSnapshot.size
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

          // Update user plan in Firestore
          await db.collection('users').doc(userId).update({
            plan: plan,
            maxBrands: planLimits[plan].maxBrands,
            features: planLimits[plan].features,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: 'active',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`User ${userId} upgraded to ${plan}`);
          break;

        case 'customer.subscription.updated':
          const subscription = event.data.object;
          const subUserId = subscription.metadata.userId;
          const subPlan = subscription.metadata.plan;

          console.log(`Subscription updated for user ${subUserId}`);

          await db.collection('users').doc(subUserId).update({
            subscriptionStatus: subscription.status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object;
          const deletedUserId = deletedSub.metadata.userId;

          console.log(`Subscription canceled for user ${deletedUserId}`);

          // Downgrade to trial
          await db.collection('users').doc(deletedUserId).update({
            plan: 'trial',
            maxBrands: 1,
            features: ['basic'],
            subscriptionStatus: 'canceled',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          break;

        case 'invoice.payment_succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          console.error('Payment failed:', failedInvoice.id);

          // Optionally notify user or update status
          if (failedInvoice.subscription_details?.metadata?.userId) {
            await db.collection('users').doc(failedInvoice.subscription_details.metadata.userId).update({
              subscriptionStatus: 'past_due',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
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
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Get brand count
    const analysesSnapshot = await db.collection('analyses')
      .where('userId', '==', req.user.uid)
      .select('brandName')
      .get();

    const uniqueBrands = new Set();
    analysesSnapshot.forEach(doc => {
      const brandName = doc.data().brandName;
      if (brandName) uniqueBrands.add(brandName.toLowerCase());
    });

    // Get list of brands for display
    const brandsList = Array.from(uniqueBrands);

    res.json({
      plan: userData.plan || 'trial',
      maxBrands: userData.maxBrands || 1,
      brandsUsed: uniqueBrands.size,
      brandsList: brandsList,
      features: userData.features || ['basic'],
      subscriptionStatus: userData.subscriptionStatus || 'active',
      trialEndsAt: userData.trialEndsAt,
      stripeCustomerId: userData.stripeCustomerId,
      role: userData.role,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    res.status(500).json({ error: 'Failed to fetch user plan' });
  }
});

// Cancel subscription
app.post('/api/billing/cancel-subscription', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    if (!userData.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(
      userData.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    await db.collection('users').doc(req.user.uid).update({
      subscriptionStatus: 'canceling',
      cancelAtPeriodEnd: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

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