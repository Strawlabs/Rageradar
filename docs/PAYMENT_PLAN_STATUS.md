# Payment Plan Implementation Status

## 📊 Current Status: **PARTIALLY IMPLEMENTED** ⚠️

---

## ✅ What's Already Implemented

### **1. Frontend Plan Structure** (AuthContext.js)

```javascript
// User plan data structure exists:
{
  email: "user@example.com",
  plan: "trial",              // trial, starter, pro, enterprise
  createdAt: Date,
  trialEndsAt: Date,
  brandsUsed: 0,
  maxBrands: 1,               // Limit based on plan
  role: "user"                // or "admin"
}
```

### **2. Plan Limits Defined**

| Plan | Max Brands | Duration | Price |
|------|-----------|----------|-------|
| **Trial** | 1 | 3 days | Free |
| **Starter** | 3 | Monthly | $19/mo |
| **Pro** | 10 | Monthly | $49/mo |
| **Enterprise** | Unlimited | Custom | Custom |

### **3. Helper Functions in AuthContext**

```javascript
✅ isTrialExpired(user)     // Checks if trial has expired
✅ canCreateBrand(user)     // Checks if user can analyze more brands
✅ isAdmin(user)            // Checks if user is admin
✅ refreshUserPlan()        // Refreshes user plan from database
```

### **4. User Document Creation**

When users sign up, a Firestore document is created with:
- Plan: "trial"
- maxBrands: 1
- brandsUsed: 0
- trialEndsAt: 3 days from signup

### **5. Stripe Documentation**

- Complete Stripe setup guide exists (`docs/STRIPE_SETUP.md`)
- Webhook configuration documented
- Price IDs structure defined

---

## ❌ What's NOT Implemented

### **1. Backend Plan Enforcement** 🚨 CRITICAL

**Problem:** The backend `/api/analyze` endpoint does NOT check:
- User's plan limits
- Number of brands already analyzed
- Trial expiration
- Plan permissions

**Current Code:**
```javascript
// server/index.js - /api/analyze endpoint
app.post('/api/analyze', authenticateUser, async (req, res) => {
  // ❌ NO PLAN CHECK HERE!
  const { brandName } = req.body;
  
  // Proceeds with analysis without checking limits
  const searchResults = await searchEngine.searchAllPlatforms(brandName);
  // ...
});
```

**What Should Happen:**
```javascript
app.post('/api/analyze', authenticateUser, async (req, res) => {
  // ✅ CHECK USER PLAN FIRST
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  const userData = userDoc.data();
  
  // Check trial expiration
  if (userData.plan === 'trial' && isExpired(userData.trialEndsAt)) {
    return res.status(403).json({ 
      error: 'Trial expired. Please upgrade to continue.' 
    });
  }
  
  // Check brand limit
  const brandCount = await db.collection('analyses')
    .where('userId', '==', req.user.uid)
    .select('brandName')
    .get();
  
  const uniqueBrands = new Set(brandCount.docs.map(d => d.data().brandName));
  
  if (uniqueBrands.size >= userData.maxBrands) {
    return res.status(403).json({ 
      error: `Brand limit reached (${userData.maxBrands}). Please upgrade.` 
    });
  }
  
  // Proceed with analysis...
});
```

---

### **2. Stripe Payment Integration** 🚨 CRITICAL

**Missing:**
- No Stripe checkout flow
- No payment processing endpoints
- No webhook handlers
- No subscription management

**What's Needed:**

#### **A. Stripe Checkout Endpoint**
```javascript
// server/index.js
app.post('/api/create-checkout-session', authenticateUser, async (req, res) => {
  const { priceId, plan } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/pricing`,
    metadata: {
      userId: req.user.uid,
      plan: plan
    }
  });
  
  res.json({ sessionId: session.id });
});
```

#### **B. Webhook Handler**
```javascript
// server/index.js
app.post('/api/billing/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      // Update user plan in database
      const session = event.data.object;
      await updateUserPlan(session.metadata.userId, session.metadata.plan);
      break;
      
    case 'customer.subscription.deleted':
      // Downgrade user to trial
      await downgradeUser(event.data.object.metadata.userId);
      break;
  }
  
  res.json({ received: true });
});
```

---

### **3. Frontend Payment Flow** ⚠️ MISSING

**What's Needed:**

#### **A. Pricing Page with Stripe Integration**
```javascript
// Component to handle plan selection
const handleSelectPlan = async (priceId, plan) => {
  const response = await axios.post('/api/create-checkout-session', {
    priceId,
    plan
  });
  
  // Redirect to Stripe Checkout
  const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  await stripe.redirectToCheckout({
    sessionId: response.data.sessionId
  });
};
```

#### **B. Billing Dashboard**
- Display current plan
- Show usage (brands used / max brands)
- Upgrade/downgrade buttons
- Cancel subscription option
- Billing history

---

### **4. Plan Upgrade/Downgrade Logic** ⚠️ MISSING

**What's Needed:**
```javascript
// Update user plan in Firestore
async function updateUserPlan(userId, newPlan) {
  const planLimits = {
    trial: { maxBrands: 1, features: ['basic'] },
    starter: { maxBrands: 3, features: ['basic', 'reports'] },
    pro: { maxBrands: 10, features: ['basic', 'reports', 'alerts', 'export'] },
    enterprise: { maxBrands: 'unlimited', features: ['all'] }
  };
  
  await db.collection('users').doc(userId).update({
    plan: newPlan,
    maxBrands: planLimits[newPlan].maxBrands,
    features: planLimits[newPlan].features,
    updatedAt: new Date()
  });
}
```

---

### **5. Feature Gating** ⚠️ MISSING

**Features that should be plan-restricted:**

| Feature | Trial | Starter | Pro | Enterprise |
|---------|-------|---------|-----|------------|
| Brand Analyses | 1 | 3 | 10 | Unlimited |
| Slack Alerts | ❌ | ❌ | ✅ | ✅ |
| CSV Export | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |
| Historical Data | 7 days | 30 days | 90 days | Unlimited |

**Implementation Needed:**
```javascript
// Check feature access
function hasFeature(user, feature) {
  const planFeatures = {
    trial: ['basic'],
    starter: ['basic', 'reports'],
    pro: ['basic', 'reports', 'alerts', 'export'],
    enterprise: ['all']
  };
  
  return planFeatures[user.plan]?.includes(feature) || 
         planFeatures[user.plan]?.includes('all');
}

// In components:
{hasFeature(userPlan, 'export') && (
  <Button onClick={exportData}>Export CSV</Button>
)}
```

---

## 🚨 Critical Issues

### **Issue #1: No Backend Enforcement**
**Severity:** 🔴 CRITICAL

**Problem:** Users can analyze unlimited brands regardless of their plan because the backend doesn't check limits.

**Impact:** 
- Free users can use Pro features
- No revenue generation
- Unfair to paying customers

**Fix Required:** Add plan checks to `/api/analyze` endpoint

---

### **Issue #2: No Payment Processing**
**Severity:** 🔴 CRITICAL

**Problem:** No way for users to actually pay and upgrade their plan.

**Impact:**
- No revenue
- Users stuck on trial
- Can't monetize the platform

**Fix Required:** Implement Stripe checkout flow

---

### **Issue #3: No Subscription Management**
**Severity:** 🟡 HIGH

**Problem:** No way to manage subscriptions (upgrade, downgrade, cancel).

**Impact:**
- Poor user experience
- Manual intervention required
- Customer support burden

**Fix Required:** Build billing dashboard and webhook handlers

---

## 📋 Implementation Checklist

### **Phase 1: Backend Enforcement** (CRITICAL)
- [ ] Add plan check to `/api/analyze` endpoint
- [ ] Check brand limit before analysis
- [ ] Check trial expiration
- [ ] Return appropriate error messages
- [ ] Update `brandsUsed` counter after analysis
- [ ] Add plan check to other endpoints (export, alerts, etc.)

### **Phase 2: Stripe Integration** (CRITICAL)
- [ ] Install Stripe SDK (`npm install stripe`)
- [ ] Set up Stripe account and get API keys
- [ ] Create products and prices in Stripe
- [ ] Implement `/api/create-checkout-session` endpoint
- [ ] Implement `/api/billing/webhook` endpoint
- [ ] Test webhook with Stripe CLI
- [ ] Add Stripe publishable key to frontend

### **Phase 3: Frontend Payment Flow** (HIGH)
- [ ] Install Stripe.js (`npm install @stripe/stripe-js`)
- [ ] Add "Upgrade" buttons to dashboard
- [ ] Create checkout flow
- [ ] Handle success/cancel redirects
- [ ] Show plan limits in UI
- [ ] Display upgrade prompts when limits reached

### **Phase 4: Billing Dashboard** (HIGH)
- [ ] Create billing settings page
- [ ] Display current plan and usage
- [ ] Show billing history
- [ ] Add upgrade/downgrade options
- [ ] Implement cancel subscription
- [ ] Add payment method management

### **Phase 5: Feature Gating** (MEDIUM)
- [ ] Implement `hasFeature()` helper
- [ ] Gate Slack alerts (Pro+)
- [ ] Gate CSV export (Pro+)
- [ ] Gate API access (Enterprise)
- [ ] Add upgrade prompts for locked features
- [ ] Show feature comparison in UI

### **Phase 6: Testing** (HIGH)
- [ ] Test trial expiration
- [ ] Test brand limits
- [ ] Test payment flow
- [ ] Test webhook handling
- [ ] Test plan upgrades
- [ ] Test plan downgrades
- [ ] Test cancellations
- [ ] Test edge cases

---

## 🎯 Quick Fix Priority

### **Immediate (This Week)**
1. **Add backend plan enforcement** - Prevents unlimited free usage
2. **Implement Stripe checkout** - Enables revenue generation
3. **Add webhook handler** - Automates plan updates

### **Short Term (This Month)**
4. **Build billing dashboard** - Improves user experience
5. **Add feature gating** - Enforces plan restrictions
6. **Test thoroughly** - Ensures reliability

### **Long Term (Next Quarter)**
7. **Add analytics** - Track plan metrics
8. **Optimize pricing** - Based on usage data
9. **Add enterprise features** - Custom integrations

---

## 💡 Recommended Implementation Order

### **Step 1: Backend Enforcement (2-3 hours)**
```javascript
// Add to server/index.js
const checkUserPlan = async (req, res, next) => {
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  req.userPlan = userDoc.data();
  
  // Check trial expiration
  if (req.userPlan.plan === 'trial') {
    const trialEnd = req.userPlan.trialEndsAt.toDate();
    if (new Date() > trialEnd) {
      return res.status(403).json({ 
        error: 'Trial expired',
        message: 'Your trial has expired. Please upgrade to continue.',
        upgradeUrl: '/pricing'
      });
    }
  }
  
  next();
};

// Use middleware
app.post('/api/analyze', authenticateUser, checkUserPlan, async (req, res) => {
  // Check brand limit
  const analyses = await db.collection('analyses')
    .where('userId', '==', req.user.uid)
    .get();
  
  const uniqueBrands = new Set(analyses.docs.map(d => d.data().brandName));
  
  if (uniqueBrands.size >= req.userPlan.maxBrands) {
    return res.status(403).json({
      error: 'Brand limit reached',
      message: `You've reached your limit of ${req.userPlan.maxBrands} brands.`,
      currentPlan: req.userPlan.plan,
      upgradeUrl: '/pricing'
    });
  }
  
  // Proceed with analysis...
});
```

### **Step 2: Stripe Checkout (3-4 hours)**
```javascript
// Install Stripe
npm install stripe

// Add to server/index.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', authenticateUser, async (req, res) => {
  const { priceId, plan } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
      metadata: {
        userId: req.user.uid,
        plan: plan
      }
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **Step 3: Webhook Handler (2-3 hours)**
```javascript
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
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, plan } = session.metadata;
      
      // Update user plan
      const planLimits = {
        starter: 3,
        pro: 10,
        enterprise: 999999
      };
      
      await db.collection('users').doc(userId).update({
        plan: plan,
        maxBrands: planLimits[plan],
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
        updatedAt: new Date()
      });
    }
    
    res.json({ received: true });
  }
);
```

---

## 📊 Summary

### **Current State:**
- ✅ Plan structure exists in frontend
- ✅ User documents have plan data
- ✅ Helper functions available
- ❌ No backend enforcement
- ❌ No payment processing
- ❌ No subscription management

### **What Works:**
- User signup with trial plan
- Plan data stored in Firestore
- Frontend can check plan limits

### **What Doesn't Work:**
- Backend doesn't enforce limits
- Users can't upgrade/pay
- No subscription management
- No feature gating

### **Estimated Implementation Time:**
- Backend enforcement: 2-3 hours
- Stripe integration: 5-6 hours
- Frontend payment flow: 3-4 hours
- Billing dashboard: 4-5 hours
- Feature gating: 2-3 hours
- Testing: 3-4 hours

**Total: ~20-25 hours of development**

---

## 🚀 Next Steps

1. **Immediate:** Implement backend plan enforcement
2. **This Week:** Set up Stripe and payment flow
3. **This Month:** Build billing dashboard and feature gating
4. **Ongoing:** Monitor, test, and optimize

**Priority:** Start with backend enforcement to prevent unlimited free usage, then add payment processing to enable revenue generation.
