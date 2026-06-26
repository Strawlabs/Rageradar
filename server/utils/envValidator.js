/**
 * Environment Variable Validator
 * Validates all required environment variables at server startup
 */

const requiredEnvVars = [
  // Supabase Configuration
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',

  // API Keys
  'GOOGLE_CSE_API_KEY',
  'GOOGLE_CSE_ID',
  'HUGGING_FACE_API_KEY',
];

const optionalEnvVars = [
  'PORT',
  'CLIENT_URL',
  'NODE_ENV',
  'SENTRY_DSN',
  'LOG_LEVEL',
  // Stripe (optional for local testing, required for production)
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

function validateEnvironment() {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional but recommended variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });

  // Report missing required variables
  if (missing.length > 0) {
    console.error('\n❌ CRITICAL: Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file or environment.\n');
    process.exit(1);
  }

  // Report warnings for optional variables
  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️  WARNING: Missing optional environment variables:');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('\nThese are optional but recommended for production.\n');
  }

  // Critical warning for Stripe in production
  if (process.env.NODE_ENV === 'production' && (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)) {
    console.error('\n❌ CRITICAL: Stripe keys are required for production!');
    console.error('   Payment processing will not work without:');
    console.error('   - STRIPE_SECRET_KEY');
    console.error('   - STRIPE_WEBHOOK_SECRET\n');
    process.exit(1);
  }

  // Validate specific formats
  validateSpecificFormats();

  console.log('✅ Environment variables validated successfully');
}

function validateSpecificFormats() {
  // Validate Supabase URL format
  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_url') {
    try {
      new URL(process.env.SUPABASE_URL);
    } catch (error) {
      console.error('❌ SUPABASE_URL is not a valid URL');
      process.exit(1);
    }
  }

  // Validate Stripe keys
  if (process.env.STRIPE_SECRET_KEY) {
    const isTestKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    const isLiveKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');

    if (!isTestKey && !isLiveKey) {
      console.error('❌ STRIPE_SECRET_KEY appears to be malformed');
      process.exit(1);
    }

    if (process.env.NODE_ENV === 'production' && isTestKey) {
      console.warn('⚠️  WARNING: Using Stripe TEST key in production environment!');
    }
  }

  // Validate webhook secret
  if (process.env.STRIPE_WEBHOOK_SECRET &&
    !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    console.error('❌ STRIPE_WEBHOOK_SECRET appears to be malformed');
    process.exit(1);
  }

  // Validate URLs
  if (process.env.CLIENT_URL) {
    try {
      new URL(process.env.CLIENT_URL);
    } catch (error) {
      console.error('❌ CLIENT_URL is not a valid URL');
      process.exit(1);
    }
  }
}

module.exports = { validateEnvironment };
