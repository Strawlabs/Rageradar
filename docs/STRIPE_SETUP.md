# 💳 Stripe Integration Setup Guide

RageRadar uses Stripe for secure payment processing. This guide will help you set up billing and subscription management.

## 🚀 Quick Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete business verification
3. Access your Stripe Dashboard

### 2. Get API Keys
1. In Stripe Dashboard, go to **Developers → API Keys**
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)
4. For production, use live keys; for testing, use test keys

### 3. Create Products and Prices
Set up your subscription products in Stripe Dashboard:

#### Free Trial Plan
- **Product Name**: RageRadar Free Trial
- **Price**: Free (no Stripe setup needed)
- **Duration**: 3 days

#### Starter Plan
- **Product Name**: RageRadar Starter
- **Monthly Price**: $19/month (`price_starter_monthly`)
- **Annual Price**: $15/month billed annually (`price_starter_annual`)

#### Pro Plan  
- **Product Name**: RageRadar Pro
- **Monthly Price**: $49/month (`price_pro_monthly`)
- **Annual Price**: $39/month billed annually (`price_pro_annual`)

#### Enterprise Plan
- **Product Name**: RageRadar Enterprise  
- **Monthly Price**: $199/month (`price_enterprise_monthly`)
- **Annual Price**: $159/month billed annually (`price_enterprise_annual`)

### 4. Set Up Webhooks
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/billing/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret**

### 5. Update Environment Variables
Add these to your `server/.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 6. Update Price IDs
In `client/src/components/shared/PricingCards.js`, update the Stripe price IDs:

```javascript
stripeMonthlyId: "price_1234567890", // Your actual Stripe price ID
stripeAnnualId: "price_0987654321",  // Your actual Stripe price ID
```

## 🔧 Configuration

### Price ID Mapping
Make sure your Stripe price IDs match the ones in `PricingCards.js`:

| Plan | Billing | Stripe Price ID | Update In Code |
|------|---------|----------------|----------------|
| Free Trial | N/A | N/A (Free plan) | N/A |
| Starter | Monthly | `price_starter_monthly` | `stripeMonthlyId` |
| Starter | Annual | `price_starter_annual` | `stripeAnnualId` |
| Pro | Monthly | `price_pro_monthly` | `stripeMonthlyId` |
| Pro | Annual | `price_pro_annual` | `stripeAnnualId` |
| Enterprise | Monthly | `price_enterprise_monthly` | `stripeMonthlyId` |
| Enterprise | Annual | `price_enterprise_annual` | `stripeAnnualId` |

### Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Keep webhook secrets secure
- Monitor webhook delivery in Stripe Dashboard

## 🧪 Testing

### Test Mode Setup
1. Use Stripe test keys (start with `sk_test_` and `pk_test_`)
2. Use test webhook endpoint during development
3. Test with Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`

### Test Scenarios
- [ ] Successful subscription creation
- [ ] Failed payment handling
- [ ] Subscription cancellation
- [ ] Webhook delivery
- [ ] User plan updates in database

## 📊 Features Implemented

### Billing Dashboard
- **Current Plan Display**: Shows active subscription
- **Usage Tracking**: Monitor mentions used vs. limits
- **Plan Comparison**: Side-by-side pricing with monthly/annual toggle
- **Payment Method**: Display and update payment info
- **Billing History**: Past invoices and payments

### Subscription Management
- **Plan Upgrades**: Seamless plan changes
- **Billing Cycle Toggle**: Monthly vs. annual pricing
- **Automatic Renewals**: Handled by Stripe
- **Cancellation**: Cancel at period end
- **Prorations**: Automatic when changing plans

### Security Features
- **Webhook Verification**: Secure event processing
- **Customer Isolation**: Each user gets unique Stripe customer
- **Metadata Tracking**: Link Stripe data to user accounts
- **Audit Logging**: Track all billing events

## 🔄 User Flow

### New Subscription
1. User selects plan in Settings → Billing
2. Redirected to Stripe Checkout
3. Payment processed by Stripe
4. Webhook updates user plan in database
5. User redirected back to dashboard

### Plan Changes
1. User selects new plan
2. Stripe handles proration automatically
3. Webhook updates user plan
4. New features/limits applied immediately

### Cancellation
1. User cancels subscription
2. Plan remains active until period end
3. User reverts to trial/free plan
4. Data retention according to plan limits

## 🚨 Error Handling

### Common Issues
- **Invalid Price ID**: Check price IDs match Stripe Dashboard
- **Webhook Failures**: Verify endpoint URL and signing secret
- **Customer Not Found**: Ensure customer creation on first purchase
- **Payment Failures**: Handle gracefully with retry logic

### Monitoring
- Monitor Stripe Dashboard for failed payments
- Set up alerts for webhook failures
- Track subscription metrics and churn
- Monitor usage vs. plan limits

## 🔐 Security Best Practices

### API Keys
- Never expose secret keys in client-side code
- Use environment variables for all keys
- Rotate keys regularly
- Use different keys for test/production

### Webhooks
- Always verify webhook signatures
- Use HTTPS endpoints only
- Implement idempotency for webhook handlers
- Log webhook events for debugging

### Customer Data
- Store minimal customer data
- Use Stripe customer IDs as references
- Encrypt sensitive data at rest
- Comply with PCI DSS requirements

## 📈 Analytics & Reporting

### Stripe Dashboard
- Revenue tracking
- Subscription analytics
- Payment success rates
- Customer lifetime value

### Custom Metrics
- Plan distribution
- Upgrade/downgrade rates
- Churn analysis
- Usage patterns

## 🆘 Troubleshooting

### Webhook Issues
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:5000/api/billing/webhook
```

### Database Sync Issues
- Check webhook delivery in Stripe Dashboard
- Verify user plan updates in Firestore
- Monitor server logs for errors
- Use Stripe CLI for testing

### Payment Failures
- Check card details and limits
- Verify billing address
- Test with different payment methods
- Review Stripe logs for decline reasons

## 🚀 Going Live

### Pre-Launch Checklist
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test complete payment flow
- [ ] Verify webhook delivery
- [ ] Set up monitoring and alerts
- [ ] Test plan upgrades/downgrades
- [ ] Verify billing history display
- [ ] Test cancellation flow

### Post-Launch Monitoring
- Monitor payment success rates
- Track subscription metrics
- Watch for webhook failures
- Monitor customer support tickets
- Review Stripe Dashboard regularly

---

**Next Steps:**
1. Set up your Stripe account and get API keys
2. Create products and prices in Stripe Dashboard
3. Configure webhook endpoint
4. Update environment variables
5. Test the complete billing flow
6. Go live with confidence!

For support with Stripe integration, check the [Stripe Documentation](https://stripe.com/docs) or contact the RageRadar development team.