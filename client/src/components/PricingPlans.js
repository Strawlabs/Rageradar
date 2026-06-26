import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { Check, Zap, TrendingUp, Crown, Loader2 } from 'lucide-react';

// Initialize Stripe (use your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const PricingPlans = () => {
  const { currentUser, userPlan } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      name: 'Trial',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for trying out RageRadar',
      features: [
        '1 brand analysis',
        '3 days access',
        'All 27+ platforms',
        'Basic sentiment analysis',
        'Emotion detection',
        'Platform breakdown'
      ],
      maxBrands: 1,
      popular: false,
      cta: 'Current Plan',
      disabled: true,
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Starter',
      price: { monthly: 19, annual: 15 },
      priceId: {
        monthly: process.env.REACT_APP_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
        annual: process.env.REACT_APP_STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual'
      },
      description: 'Great for small businesses and startups',
      features: [
        '3 brand analyses',
        'Unlimited re-analysis',
        'All 27+ platforms',
        'Advanced sentiment analysis',
        'Emotion detection',
        'Platform breakdown',
        'Trend analysis',
        'Export to CSV',
        'Email support'
      ],
      maxBrands: 3,
      popular: false,
      cta: 'Get Started',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Pro',
      price: { monthly: 49, annual: 39 },
      priceId: {
        monthly: process.env.REACT_APP_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        annual: process.env.REACT_APP_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual'
      },
      description: 'Perfect for growing businesses',
      features: [
        '10 brand analyses',
        'Unlimited re-analysis',
        'All 27+ platforms',
        'Advanced sentiment analysis',
        'Emotion detection',
        'Platform breakdown',
        'Trend analysis',
        'Competitive analysis',
        'Slack alerts',
        'Export to CSV & PDF',
        'Priority support',
        'API access (coming soon)'
      ],
      maxBrands: 10,
      popular: true,
      cta: 'Go Pro',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Enterprise',
      price: { monthly: 199, annual: 159 },
      priceId: {
        monthly: process.env.REACT_APP_STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
        annual: process.env.REACT_APP_STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual'
      },
      description: 'For large organizations',
      features: [
        'Unlimited brand analyses',
        'Unlimited re-analysis',
        'All 27+ platforms',
        'Advanced sentiment analysis',
        'Emotion detection',
        'Platform breakdown',
        'Trend analysis',
        'Competitive analysis',
        'Custom integrations',
        'Slack & Teams alerts',
        'Export to all formats',
        'Dedicated support',
        'Full API access',
        'Custom reports',
        'SLA guarantee'
      ],
      maxBrands: 'Unlimited',
      popular: false,
      cta: 'Contact Sales',
      gradient: 'from-purple-500 to-indigo-600'
    }
  ];

  const handleSelectPlan = async (plan) => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }

    if (plan.name === 'Trial' || plan.disabled) {
      return;
    }

    if (plan.name === 'Enterprise') {
      window.location.href = 'mailto:sales@rageradar.com?subject=Enterprise Plan Inquiry';
      return;
    }

    setLoading(plan.name);

    try {
      const priceId = plan.priceId[billingCycle];
      
      // Get Supabase auth token
      const token = await currentUser.getIdToken();
      
      // Create checkout session
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/create-checkout-session`,
        {
          priceId: priceId,
          plan: plan.name.toLowerCase(),
          billingCycle: billingCycle
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.error || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planName) => {
    return userPlan?.plan === planName.toLowerCase();
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start with a free trial, upgrade anytime. No credit card required for trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 ${
                plan.popular
                  ? 'border-orange-500 shadow-xl scale-105'
                  : 'border-gray-200 shadow-lg'
              } p-8 hover:shadow-2xl transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan(plan.name) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Current Plan
                  </div>
                </div>
              )}

              {/* Plan Icon */}
              <div className={`w-12 h-12 bg-gradient-to-r ${plan.gradient} rounded-xl flex items-center justify-center mb-4`}>
                {plan.name === 'Trial' && <Zap className="w-6 h-6 text-white" />}
                {plan.name === 'Starter' && <TrendingUp className="w-6 h-6 text-white" />}
                {plan.name === 'Pro' && <Check className="w-6 h-6 text-white" />}
                {plan.name === 'Enterprise' && <Crown className="w-6 h-6 text-white" />}
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-gray-900">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'annual' ? 'mo' : 'month'}
                  </span>
                </div>
                {billingCycle === 'annual' && plan.price.annual > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Billed ${plan.price.annual * 12}/year
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loading === plan.name || isCurrentPlan(plan.name) || plan.disabled}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isCurrentPlan(plan.name)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${loading === plan.name ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading === plan.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : isCurrentPlan(plan.name) ? (
                  'Current Plan'
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include access to 27+ platforms, AI sentiment analysis, and emotion detection.
          </p>
          <p className="text-gray-600">
            Need help choosing? <a href="/support" className="text-orange-500 hover:text-orange-600 font-medium">Contact our team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
