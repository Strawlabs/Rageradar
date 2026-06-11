import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ArrowRight,
  Calendar,
  Package
} from 'lucide-react';

const BillingDashboard = () => {
  const { currentUser, userPlan } = useAuth();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchPlanData();
  }, [currentUser]);

  const fetchPlanData = async () => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/user/plan`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setPlanData(response.data);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/billing/cancel-subscription`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      alert(response.data.message);
      fetchPlanData();
    } catch (error) {
      console.error('Cancel error:', error);
      alert(error.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const planInfo = {
    trial: {
      name: 'Free Trial',
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600'
    },
    starter: {
      name: 'Starter',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    pro: {
      name: 'Pro',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    enterprise: {
      name: 'Enterprise',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600'
    }
  };

  const currentPlanInfo = planInfo[planData?.plan] || planInfo.trial;
  const usagePercentage = planData?.maxBrands === 999999 
    ? 0 
    : (planData?.brandsUsed / planData?.maxBrands) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your plan and billing information</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 bg-gradient-to-r ${currentPlanInfo.gradient} rounded-xl flex items-center justify-center`}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentPlanInfo.name} Plan</h2>
                <p className="text-gray-600 text-sm">
                  {planData?.subscriptionStatus === 'active' && 'Active subscription'}
                  {planData?.subscriptionStatus === 'canceling' && 'Canceling at period end'}
                  {planData?.subscriptionStatus === 'canceled' && 'Canceled'}
                  {planData?.plan === 'trial' && 'Trial period'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {(planData?.plan === 'pro' || planData?.plan === 'enterprise') && planData?.subscriptionStatus === 'active' && (
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Change Plan
              </button>
            )}
            {planData?.plan !== 'trial' && planData?.subscriptionStatus === 'active' && (
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                {canceling ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Brands Used */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Brands Analyzed</span>
              <span className="text-2xl font-bold text-gray-900">
                {planData?.brandsUsed} / {planData?.maxBrands === 999999 ? '∞' : planData?.maxBrands}
              </span>
            </div>
            {planData?.maxBrands !== 999999 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${currentPlanInfo.gradient}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            )}
            {usagePercentage >= 80 && usagePercentage < 100 && (
              <p className="text-sm text-orange-600 mt-2">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                You're approaching your brand limit
              </p>
            )}
            {usagePercentage >= 100 && (
              <p className="text-sm text-red-600 mt-2">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                You've reached your brand limit
              </p>
            )}
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">Your Features</h3>
            <ul className="space-y-2">
              {Array.isArray(planData?.features) && planData.features.includes('basic') && (
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Basic sentiment analysis
                </li>
              )}
              {Array.isArray(planData?.features) && planData.features.includes('reports') && (
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Advanced reports
                </li>
              )}
              {Array.isArray(planData?.features) && planData.features.includes('alerts') && (
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Slack alerts
                </li>
              )}
              {Array.isArray(planData?.features) && planData.features.includes('export') && (
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  CSV/PDF export
                </li>
              )}
              {Array.isArray(planData?.features) && planData.features.includes('all') && (
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  All features included
                </li>
              )}
              {(!planData?.features || !Array.isArray(planData.features) || planData.features.length === 0) && (
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Basic sentiment analysis
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Trial Expiration Warning */}
        {planData?.plan === 'trial' && planData?.trialEndsAt && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-900 mb-1">Trial Ending Soon</p>
              <p className="text-sm text-orange-700">
                Your trial expires on {new Date(planData.trialEndsAt.seconds * 1000 || planData.trialEndsAt).toLocaleDateString()}. 
                Upgrade now to continue analyzing brands.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        {(planData?.plan === 'trial' || planData?.plan === 'starter') && (
          <button
            onClick={() => navigate('/pricing')}
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Upgrade Your Plan
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Plan Comparison */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Plans</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-bold text-gray-900">Feature</th>
                <th className="text-center py-4 px-4 font-bold text-gray-900">Trial</th>
                <th className="text-center py-4 px-4 font-bold text-gray-900">Starter</th>
                <th className="text-center py-4 px-4 font-bold text-gray-900">Pro</th>
                <th className="text-center py-4 px-4 font-bold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-gray-700">Brand Analyses</td>
                <td className="py-4 px-4 text-center text-gray-600">1</td>
                <td className="py-4 px-4 text-center text-gray-600">3</td>
                <td className="py-4 px-4 text-center text-gray-600">10</td>
                <td className="py-4 px-4 text-center text-gray-600">Unlimited</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-gray-700">Slack Alerts</td>
                <td className="py-4 px-4 text-center">❌</td>
                <td className="py-4 px-4 text-center">❌</td>
                <td className="py-4 px-4 text-center">✅</td>
                <td className="py-4 px-4 text-center">✅</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-gray-700">CSV Export</td>
                <td className="py-4 px-4 text-center">❌</td>
                <td className="py-4 px-4 text-center">✅</td>
                <td className="py-4 px-4 text-center">✅</td>
                <td className="py-4 px-4 text-center">✅</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 text-gray-700">API Access</td>
                <td className="py-4 px-4 text-center">❌</td>
                <td className="py-4 px-4 text-center">❌</td>
                <td className="py-4 px-4 text-center">❌</td>
                <td className="py-4 px-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-gray-700">Price</td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">Free</td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">$19/mo</td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">$49/mo</td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">Custom</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
          >
            View All Plans
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
