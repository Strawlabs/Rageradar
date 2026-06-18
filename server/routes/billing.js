const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { authenticateUser } = require('../middleware/auth');

// Note: Stripe will be initialized when STRIPE_SECRET_KEY is provided
let stripe = null;

// Initialize Stripe if secret key is available
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error.message);
  }
} else {
  console.log('⚠️ Stripe not initialized - STRIPE_SECRET_KEY not provided');
}

/**
 * Create Stripe checkout session
 */
router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Stripe not configured',
        message: 'Payment processing is not available. Please contact support.'
      });
    }

    const { priceId, planId, billingCycle } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    if (!priceId || !planId || !billingCycle) {
      return res.status(400).json({ error: 'Missing required fields: priceId, planId, billingCycle' });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe customer if doesn't exist
    let customerId = userData.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
          planId: planId
        }
      });
      customerId = customer.id;

      // Save customer ID to user document
      await supabase
        .from('users')
        .update({
          stripe_customer_id: customerId
        })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/settings?tab=billing&success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/settings?tab=billing&canceled=true`,
      metadata: {
        userId: userId,
        planId: planId,
        billingCycle: billingCycle
      }
    });

    // Log the checkout attempt
    await supabase
      .from('billing_events')
      .insert({
        user_id: userId,
        type: 'checkout_created',
        session_id: session.id,
        plan_id: planId,
        billing_cycle: billingCycle,
        price_id: priceId,
        timestamp: new Date().toISOString()
      });

    res.json({ sessionUrl: session.url, sessionId: session.id });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

/**
 * Handle Stripe webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    console.log('Received Stripe webhook:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Get user's billing information
 */
router.get('/info', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get subscription info if Stripe is available
    let subscriptionInfo = null;
    if (stripe && userData.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          subscriptionInfo = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            planId: subscription.metadata?.planId || 'unknown',
            billingCycle: subscription.items.data[0]?.price?.recurring?.interval || 'unknown'
          };
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe subscription:', stripeError);
      }
    }

    const billingInfo = {
      plan: userData.plan || 'trial',
      stripeCustomerId: userData.stripe_customer_id || null,
      subscription: subscriptionInfo,
      trialEndsAt: userData.trial_ends_at || null,
      isTrialExpired: userData.trial_ends_at ? new Date() > new Date(userData.trial_ends_at) : false
    };

    res.json(billingInfo);

  } catch (error) {
    console.error('Error getting billing info:', error);
    res.status(500).json({ error: 'Failed to get billing information' });
  }
});

/**
 * Create Stripe customer portal session for payment method management
 */
router.post('/create-portal-session', authenticateUser, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Stripe not configured',
        message: 'Payment management is not available. Please contact support.'
      });
    }

    const userId = req.user.uid;

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customerId = userData.stripe_customer_id;

    if (!customerId) {
      return res.status(400).json({ 
        error: 'No payment method found',
        message: 'You need to subscribe to a plan first before managing payment methods.'
      });
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/settings?tab=billing`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      message: error.message 
    });
  }
});

/**
 * Cancel subscription
 */
router.post('/cancel-subscription', authenticateUser, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const userId = req.user.uid;
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    // Cancel the subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Log the cancellation
    await supabase
      .from('billing_events')
      .insert({
        user_id: userId,
        type: 'subscription_canceled',
        subscription_id: subscriptionId,
        timestamp: new Date().toISOString()
      });

    res.json({ 
      message: 'Subscription will be canceled at the end of the current period',
      cancelAt: new Date(subscription.cancel_at * 1000)
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Webhook handler functions
async function handleCheckoutCompleted(session) {
  try {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    
    if (!userId || !planId) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Update user plan
    await supabase
      .from('users')
      .update({
        plan: planId,
        stripe_customer_id: session.customer,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    console.log(`✅ User ${userId} upgraded to ${planId} plan`);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Find user by customer ID
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .limit(1);

    if (findError || !users || users.length === 0) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const userId = users[0].id;
    const planId = subscription.metadata?.planId || 'pro';

    await supabase
      .from('users')
      .update({
        plan: planId,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    console.log(`✅ Subscription created for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  // Similar to handleSubscriptionCreated but for updates
  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Find user by customer ID
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .limit(1);

    if (findError || !users || users.length === 0) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const userId = users[0].id;

    await supabase
      .from('users')
      .update({
        plan: 'trial',
        stripe_subscription_id: null,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    console.log(`✅ Subscription canceled for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  // Log successful payment, send confirmation email, etc.
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  // Handle failed payment, send notification, etc.
}

module.exports = router;