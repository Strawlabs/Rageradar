# RageRadar Pricing Model 2.0

## Overview

Updated pricing structure to reflect new advanced features including multi-emotion detection, platform integrations, and automated insights.

---

## Pricing Tiers

### 🆓 Free Tier
**Price:** $0/month  
**Target:** Individual users, hobbyists, testing

**Features:**
- ✅ 5 brand analyses per month
- ✅ Basic sentiment analysis
- ✅ Google search only
- ✅ 7-day data retention
- ✅ Basic Rage Index
- ❌ No multi-emotion detection
- ❌ No platform integrations
- ❌ No insights
- ❌ No event tracking

**Use Case:** Try RageRadar, monitor personal projects

---

### 🚀 Starter Plan
**Price:** $29/month or $290/year (save $58)  
**Target:** Freelancers, small businesses, startups

**Features:**
- ✅ 50 brand analyses per month
- ✅ **Multi-emotion detection** (28+ emotions)
- ✅ **Rage Index 2.0** with severity levels
- ✅ Multi-provider search (Google + Bing fallback)
- ✅ **Reddit integration** (posts + comments)
- ✅ 30-day data retention
- ✅ **Basic Automated Insights** 🆕 (5 types: spike, trend, volume, platform, emotion)
- ✅ Platform breakdown
- ✅ Email support
- ❌ No event tracking
- ❌ No YouTube/Product Hunt
- ❌ No theme extraction
- ❌ No trendline analysis

**Use Case:** Monitor 1-3 brands, basic competitive intelligence

---

### 💼 Pro Plan
**Price:** $99/month or $990/year (save $198)  
**Target:** Growing businesses, agencies, marketing teams

**Features:**
- ✅ **Unlimited brand analyses**
- ✅ **Multi-emotion detection** (28+ emotions)
- ✅ **Rage Index 2.0** with full analytics
- ✅ **All platform integrations:**
  - Reddit (posts + comments)
  - YouTube (video comments)
  - Product Hunt (reviews)
  - App Stores (iOS + Android reviews)
- ✅ Multi-provider search (Google + Bing + SerpAPI)
- ✅ 90-day data retention
- ✅ **Event tracking** (product launches, crises)
- ✅ **Rage Theme Extraction** 🆕 (NLP-powered, identifies recurring complaint topics)
- ✅ **30-Day Trendline Analysis** 🆕 (track sentiment over time, spike detection)
- ✅ **Advanced Automated Insights** 🆕 (all 8 types with actionable recommendations)
- ✅ Spike detection & alerts
- ✅ Platform comparison
- ✅ Export to CSV
- ✅ Priority email support
- ✅ API access (100k requests/month)

**Use Case:** Monitor multiple brands, competitive analysis, crisis management

---

### 🏢 Enterprise Plan
**Price:** Custom pricing  
**Target:** Large corporations, agencies, enterprise teams

**Features:**
- ✅ **Everything in Pro, plus:**
- ✅ Unlimited brand analyses
- ✅ **Custom data retention** (1 year+)
- ✅ **90-Day+ Trendline Analysis** 🆕 (extended historical tracking)
- ✅ **Advanced Theme Analytics** 🆕 (theme evolution tracking, custom theme models)
- ✅ **Custom Insight Models** 🆕 (industry-specific recommendations)
- ✅ **Custom emotion models** (industry-specific)
- ✅ **White-label reports**
- ✅ **Team collaboration** (unlimited users)
- ✅ **SSO (Single Sign-On)**
- ✅ **Role-based access control**
- ✅ **Audit logs**
- ✅ **Custom integrations**
- ✅ **Dedicated account manager**
- ✅ **24/7 phone + email support**
- ✅ **SLA guarantee** (99.9% uptime)
- ✅ **Unlimited API access**
- ✅ **Custom training & onboarding**

**Use Case:** Enterprise brand monitoring, multi-team usage, custom requirements

---

## Feature Comparison Table

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| **Analyses/Month** | 5 | 50 | Unlimited | Unlimited |
| **Multi-Emotion Detection** | ❌ | ✅ 28+ emotions | ✅ 28+ emotions | ✅ Custom models |
| **Rage Index 2.0** | Basic | ✅ Full | ✅ Full | ✅ Full |
| **Search Providers** | Google only | Google + Bing | All 3 | All 3 + Custom |
| **Reddit Integration** | ❌ | ✅ | ✅ | ✅ |
| **YouTube Integration** | ❌ | ❌ | ✅ | ✅ |
| **Product Hunt** | ❌ | ❌ | ✅ | ✅ |
| **App Store Reviews** | ❌ | ❌ | ✅ | ✅ |
| **Event Tracking** | ❌ | ❌ | ✅ | ✅ |
| **Theme Extraction** | ❌ | ❌ | ✅ NLP-powered | ✅ Advanced |
| **Trendline Analysis** | ❌ | ❌ | 30 days | 90+ days |
| **Automated Insights** | ❌ | 5 types | All 8 types | All + Custom |
| **Spike Detection** | ❌ | ❌ | ✅ | ✅ |
| **Data Retention** | 7 days | 30 days | 90 days | Custom |
| **Export** | ❌ | CSV | CSV + PDF | All formats |
| **API Access** | ❌ | ❌ | 100k/month | Unlimited |
| **Team Members** | 1 | 1 | 5 | Unlimited |
| **Support** | Community | Email | Priority Email | 24/7 Phone |
| **SLA** | ❌ | ❌ | ❌ | 99.9% |

---

## Stripe Configuration

### Price IDs (Production)

```javascript
// Starter Plan
STRIPE_PRICE_ID_STARTER_MONTHLY=price_starter_monthly_xxx
STRIPE_PRICE_ID_STARTER_YEARLY=price_starter_yearly_xxx

// Pro Plan
STRIPE_PRICE_ID_PRO_MONTHLY=price_pro_monthly_xxx
STRIPE_PRICE_ID_PRO_YEARLY=price_pro_yearly_xxx

// Enterprise (contact sales)
```

### Feature Flags by Plan

```javascript
const planFeatures = {
  free: {
    maxAnalyses: 5,
    multiEmotion: false,
    platforms: ['google'],
    integrations: [],
    eventTracking: false,
    themeExtraction: false,
    trendlineDays: 0,
    insights: [],
    dataRetentionDays: 7,
    apiAccess: false
  },
  
  starter: {
    maxAnalyses: 50,
    multiEmotion: true,
    platforms: ['google', 'bing'],
    integrations: ['reddit'],
    eventTracking: false,
    themeExtraction: false,
    trendlineDays: 0,
    insights: ['spike', 'trend', 'volume', 'platform', 'emotion'],
    dataRetentionDays: 30,
    apiAccess: false
  },
  
  pro: {
    maxAnalyses: -1, // unlimited
    multiEmotion: true,
    platforms: ['google', 'bing', 'serpapi'],
    integrations: ['reddit', 'youtube', 'producthunt', 'appstore'],
    eventTracking: true,
    themeExtraction: true,
    trendlineDays: 30,
    insights: 'all',
    dataRetentionDays: 90,
    apiAccess: true,
    apiQuota: 100000
  },
  
  enterprise: {
    maxAnalyses: -1,
    multiEmotion: true,
    customModels: true,
    platforms: 'all',
    integrations: 'all',
    eventTracking: true,
    themeExtraction: true,
    trendlineDays: 365,
    insights: 'all',
    dataRetentionDays: 365,
    apiAccess: true,
    apiQuota: -1, // unlimited
    whiteLabel: true,
    sso: true,
    teamMembers: -1
  }
};
```

---

## Pricing Strategy

### Value Proposition

**Starter ($29/month):**
- **Value:** Multi-emotion detection alone worth $50/month
- **Savings:** vs hiring sentiment analyst ($500+/month)
- **ROI:** Identify issues before they escalate

**Pro ($99/month):**
- **Value:** Full platform monitoring worth $500+/month
- **Savings:** vs multiple tools (Brandwatch $800+, Mention $300+)
- **ROI:** Crisis prevention, competitive intelligence, product insights

**Enterprise (Custom):**
- **Value:** Custom solutions, dedicated support
- **Savings:** vs building in-house ($100k+/year)
- **ROI:** Enterprise-grade monitoring, team collaboration

### Competitive Analysis

| Competitor | Price | Our Advantage |
|------------|-------|---------------|
| Brandwatch | $800+/month | 8x cheaper, better emotion AI |
| Mention | $300/month | 3x cheaper, more platforms |
| Brand24 | $99/month | Same price, better insights |
| Sprout Social | $249/month | 2.5x cheaper, specialized for rage |

---

## Migration Plan

### Existing Users

**Current Free Users:**
- Remain on free tier
- Prompted to upgrade for new features
- 30-day trial of Starter plan

**Current Paid Users (if any):**
- Grandfathered into Pro plan
- Same price or discounted
- All new features included

### Launch Promotion

**Early Adopter Discount:**
- 50% off first 3 months (Starter: $14.50, Pro: $49.50)
- Lifetime 20% discount for first 100 customers
- Annual plan: Extra 10% off (total 30% off)

---

## Revenue Projections

### Conservative Estimate (Year 1)

| Plan | Users | MRR | ARR |
|------|-------|-----|-----|
| Free | 1,000 | $0 | $0 |
| Starter | 50 | $1,450 | $17,400 |
| Pro | 20 | $1,980 | $23,760 |
| Enterprise | 2 | $1,000 | $12,000 |
| **Total** | **1,072** | **$4,430** | **$53,160** |

### Optimistic Estimate (Year 1)

| Plan | Users | MRR | ARR |
|------|-------|-----|-----|
| Free | 5,000 | $0 | $0 |
| Starter | 200 | $5,800 | $69,600 |
| Pro | 100 | $9,900 | $118,800 |
| Enterprise | 10 | $5,000 | $60,000 |
| **Total** | **5,310** | **$20,700** | **$248,400** |

---

## Implementation Checklist

- [ ] Create Stripe products and prices
- [ ] Update environment variables
- [ ] Implement plan enforcement middleware
- [ ] Update pricing page UI
- [ ] Add feature comparison table
- [ ] Create upgrade flow
- [ ] Test checkout process
- [ ] Set up webhooks for plan changes
- [ ] Create admin panel for plan management
- [ ] Document API rate limits per plan

---

## Next Steps

1. **Create Stripe Products** (30 min)
2. **Update Backend Plan Enforcement** (2 hours)
3. **Update Frontend Pricing Page** (2 hours)
4. **Test Upgrade/Downgrade Flow** (1 hour)
5. **Launch Promotion Setup** (30 min)

**Total Estimated Time:** 6 hours

---

**Status:** Ready for implementation 🚀
