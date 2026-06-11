import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PricingCards = ({ 
  showHeader = true, 
  onPlanSelect = null, 
  currentPlan = null,
  showTrialBadge = true,
  className = "",
  darkMode = false
}) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const allPlans = [
    {
      id: 'trial',
      name: "Free Trial",
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Try RageRadar risk-free",
      features: [
        "1 brand monitoring",
        "6+ platform monitoring",
        "AI emotion detection",
        "Basic sentiment analysis",
        "Email alerts",
        "3-day data history"
      ],
      popular: false,
      color: "from-green-500 to-emerald-600",
      bgColor: darkMode ? "bg-slate-700" : "bg-white",
      borderColor: darkMode ? "border-slate-600" : "border-gray-200",
      isFree: true,
      cta: "Start Free Trial"
    },
    {
      id: 'starter',
      name: "Starter",
      monthlyPrice: 19,
      annualPrice: 15, // 20% discount
      description: "Perfect for small businesses and startups",
      features: [
        "3 brands monitoring",
        "6+ platform monitoring",
        "AI emotion detection",
        "Real-time alerts",
        "Rage spike detection",
        "Basic competitive analysis",
        "Email alerts",
        "7-day data history"
      ],
      popular: false,
      color: "from-gray-500 to-gray-600",
      bgColor: darkMode ? "bg-slate-700" : "bg-white",
      borderColor: darkMode ? "border-slate-600" : "border-gray-200",
      stripeMonthlyId: "price_starter_monthly",
      stripeAnnualId: "price_starter_annual"
    },
    {
      id: 'pro',
      name: "Pro",
      monthlyPrice: 49,
      annualPrice: 39, // 20% discount
      description: "Most popular for growing companies",
      features: [
        "10 brands monitoring",
        "All platform monitoring",
        "Advanced AI emotion detection",
        "Predictive analytics",
        "Competitive intelligence",
        "Visual analytics & dashboards",
        "Email alerts & notifications",
        "30-day data history",
        "Export to PDF/Excel/PowerPoint",
        "Priority support"
      ],
      popular: true,
      color: "from-red-500 via-orange-500 to-yellow-500",
      bgColor: darkMode ? "bg-slate-700" : "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50",
      borderColor: darkMode ? "border-slate-600" : "border-orange-300",
      stripeMonthlyId: "price_pro_monthly",
      stripeAnnualId: "price_pro_annual"
    },
    {
      id: 'enterprise',
      name: "Enterprise",
      monthlyPrice: 199,
      annualPrice: 159, // 20% discount
      description: "For large organizations with custom needs",
      features: [
        "Unlimited brands",
        "Geographic analysis",
        "Advanced AI insights",
        "Custom dashboards",
        "Professional exports",
        "Advanced integrations",
        "Dedicated support",
        "SLA guarantee",
        "Enhanced security",
        "Custom reporting"
      ],
      popular: false,
      color: "from-purple-500 to-indigo-600",
      bgColor: darkMode ? "bg-slate-700" : "bg-white",
      borderColor: darkMode ? "border-slate-600" : "border-gray-200",
      stripeMonthlyId: "price_enterprise_monthly",
      stripeAnnualId: "price_enterprise_annual"
    }
  ];

  // Define plan hierarchy for upgrade logic
  const planHierarchy = {
    'trial': 0,
    'starter': 1,
    'pro': 2,
    'enterprise': 3
  };

  // Filter plans based on current plan (show upgrades only in billing context)
  const getFilteredPlans = () => {
    if (!currentPlan || !onPlanSelect) {
      // Show all plans for landing page
      return allPlans;
    }
    
    const currentPlanLevel = planHierarchy[currentPlan] || 0;
    
    // In billing context, show current plan + upgrades only
    return allPlans.filter(plan => {
      const planLevel = planHierarchy[plan.id] || 0;
      return planLevel >= currentPlanLevel;
    });
  };

  const plans = getFilteredPlans();

  const getCurrentPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getAnnualSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice * 12;
    return monthlyCost - annualCost;
  };

  const handlePlanSelect = (plan) => {
    if (onPlanSelect) {
      onPlanSelect({
        ...plan,
        selectedPrice: getCurrentPrice(plan),
        billingCycle,
        stripeId: billingCycle === 'monthly' ? plan.stripeMonthlyId : plan.stripeAnnualId
      });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-black mb-6 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {onPlanSelect && currentPlan ? (
              <>
                Upgrade Your
                <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Plan
                </span>
              </>
            ) : (
              <>
                Choose Your
                <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Perfect Plan
                </span>
              </>
            )}
          </h2>
          <p className={`text-xl font-light max-w-3xl mx-auto leading-relaxed mb-8 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            {onPlanSelect && currentPlan 
              ? "Unlock more features and higher limits with an upgraded plan. Change or cancel anytime."
              : "Start with our free trial and scale as you grow. No hidden fees, cancel anytime."
            }
          </p>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className={`relative p-1 rounded-full flex items-center ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          {/* Sliding Background */}
          <div 
            className={`absolute top-1 bottom-1 rounded-full shadow-md transition-all duration-300 ease-in-out ${
              darkMode ? 'bg-slate-600' : 'bg-white'
            } ${
              billingCycle === 'monthly' 
                ? 'left-1 right-1/2' 
                : 'left-1/2 right-1'
            }`}
          />
          
          {/* Monthly Option */}
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`relative z-10 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
              billingCycle === 'monthly'
                ? darkMode ? 'text-white' : 'text-gray-900'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Monthly
          </button>
          
          {/* Annual Option */}
          <button
            onClick={() => setBillingCycle('annual')}
            className={`relative z-10 px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
              billingCycle === 'annual'
                ? darkMode ? 'text-white' : 'text-gray-900'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Annual
          </button>
          
          {/* Save Badge */}
          {billingCycle === 'annual' && (
            <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              Save 20%
            </div>
          )}
        </div>
      </div>



      {/* Pricing Cards */}
      <div className={`grid gap-8 ${
        plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' :
        plans.length === 3 ? 'md:grid-cols-3 max-w-4xl mx-auto' :
        'md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {plans.map((plan, index) => {
          const currentPrice = getCurrentPrice(plan);
          const isCurrentPlan = currentPlan === plan.id;
          const annualSavings = getAnnualSavings(plan);

          return (
            <div
              key={plan.id}
              className={`relative ${plan.bgColor} ${plan.borderColor} border-2 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                onPlanSelect ? 'shadow-lg' : (plan.popular ? 'ring-4 ring-orange-200 shadow-2xl scale-105' : 'shadow-lg')
              } ${onPlanSelect ? '' : (isCurrentPlan ? 'ring-4 ring-blue-200' : '')}`}
            >
              {/* Popular Badge - Only show on landing page, not in billing */}
              {plan.popular && !onPlanSelect && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Current Plan Badge - Only show on landing page, not in billing */}
              {isCurrentPlan && !onPlanSelect && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Current Plan
                  </div>
                </div>
              )}



              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{plan.description}</p>

                <div className="mb-6">
                  {plan.isFree ? (
                    <div className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Free</div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-5xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>${currentPrice}</span>
                      <span className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>/{billingCycle === 'monthly' ? 'month' : 'month'}</span>
                    </div>
                  )}
                  {billingCycle === 'annual' && !plan.isFree && (
                    <div className="text-center mt-2">
                      <div className="text-sm text-green-600 font-semibold">
                        Save ${annualSavings}/year
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        Billed annually (${currentPrice * 12}/year)
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                {onPlanSelect ? (
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isCurrentPlan || plan.isFree}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      isCurrentPlan
                        ? darkMode 
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.isFree
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : plan.popular
                        ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white shadow-lg'
                        : darkMode
                        ? 'bg-slate-600 text-white hover:bg-slate-500'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isCurrentPlan 
                      ? (onPlanSelect ? 'Current' : 'Current Plan')
                      : plan.isFree 
                      ? 'Start Free Trial' 
                      : onPlanSelect 
                      ? 'Select Plan'
                      : 'Select Plan'}
                  </button>
                ) : (
                  <Link
                    to="/signup"
                    className={`w-full inline-block py-4 px-6 rounded-2xl font-bold text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      plan.isFree
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : plan.popular
                        ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white shadow-lg'
                        : darkMode
                        ? 'bg-slate-600 text-white hover:bg-slate-500'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta || 'Start Free Trial'}
                  </Link>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <h4 className={`font-bold text-center mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Everything included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className={`w-5 h-5 bg-gradient-to-r ${
                        plan.popular 
                          ? 'from-red-500 to-orange-500' 
                          : plan.isFree
                          ? 'from-green-500 to-emerald-600'
                          : 'from-green-500 to-green-600'
                      } rounded-full flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default PricingCards;