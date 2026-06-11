import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import PricingCards from './shared/PricingCards';

const SettingsDashboard = () => {
  const { currentUser, userPlan, refreshUserPlan } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Get initial tab from URL or default to 'profile'
  const getInitialTab = () => {
    const hash = location.hash.replace('#', '');
    return hash || 'profile';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab()); // profile, notifications, integrations, billing, security
  const [settings, setSettings] = useState({
    profile: {
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      company: currentUser?.company || 'Your Company',
      role: currentUser?.role || 'User',
      timezone: 'America/New_York',
      language: 'en',
      avatar: null
    },
    notifications: {
      rageAlerts: { enabled: true },
      weeklyReports: { enabled: true },
      mentionAlerts: { enabled: true },
      systemAlerts: { enabled: true }
    },
    integrations: {
      slack: {
        connected: false,
        workspace: '',
        channel: '#alerts'
      },
      teams: {
        connected: false,
        webhook_url: ''
      },
      zapier: {
        connected: true,
        active_zaps: 3
      },
      api: {
        enabled: true,
        key: 'rr_live_••••••••••••••••',
        rate_limit: 1000,
        usage: 247
      }
    },
    billing: {
      plan: userPlan?.plan || 'trial',
      billing_cycle: 'monthly',
      next_billing: null,
      amount: 0,
      payment_method: null,
      hasPaymentMethod: false,
      usage: {
        mentions: 0,
        limit: userPlan?.plan === 'trial' ? 100 : userPlan?.plan === 'starter' ? 1000 : userPlan?.plan === 'pro' ? 50000 : 'unlimited',
        overage: false
      }
    },
    security: {
      login_notifications: true,
      session_timeout: 24
    }
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Update tab when URL hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && hash !== activeTab) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Function to change tab and update URL
  const changeTab = (tabId) => {
    setActiveTab(tabId);
    navigate(`/dashboard/settings#${tabId}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);

      try {
        // Fetch billing information from backend
        if (currentUser) {
          const token = await currentUser.getIdToken();
          const response = await fetch('/api/billing/info', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const billingData = await response.json();

            // Update settings with real billing data
            setSettings(prev => ({
              ...prev,
              billing: {
                ...prev.billing,
                plan: billingData.plan || userPlan?.plan || 'trial',
                billing_cycle: billingData.subscription?.billingCycle || 'monthly',
                next_billing: billingData.subscription?.currentPeriodEnd || '2024-02-16',
                amount: getPlanAmount(billingData.plan || userPlan?.plan || 'trial'),
                usage: {
                  mentions: userPlan?.brandsUsed || 0,
                  limit: getPlanLimit(billingData.plan || userPlan?.plan || 'trial'),
                  overage: false
                }
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching billing info:', error);
        // Use userPlan data as fallback
        if (userPlan) {
          setSettings(prev => ({
            ...prev,
            billing: {
              ...prev.billing,
              plan: userPlan.plan || 'trial',
              amount: getPlanAmount(userPlan.plan || 'trial'),
              usage: {
                mentions: userPlan.brandsUsed || 0,
                limit: getPlanLimit(userPlan.plan || 'trial'),
                overage: false
              }
            }
          }));
        }
      }

      setLoading(false);
    };

    fetchSettings();
  }, [currentUser, userPlan]);

  // Helper functions to get plan details
  const getPlanAmount = (plan) => {
    switch (plan) {
      case 'trial': return 0;
      case 'starter': return 19;
      case 'pro': return 49;
      case 'enterprise': return 199;
      default: return 0;
    }
  };

  const getPlanLimit = (plan) => {
    switch (plan) {
      case 'trial': return 100;
      case 'starter': return 1000;
      case 'pro': return 50000;
      case 'enterprise': return 'unlimited';
      default: return 100;
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveSettings = async (section) => {
    setSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For profile section, exclude email from being saved (security measure)
      if (section === 'profile') {
        const profileDataToSave = {
          displayName: settings.profile.displayName,
          company: settings.profile.company,
          role: settings.profile.role,
          timezone: settings.profile.timezone,
          language: settings.profile.language,
          avatar: settings.profile.avatar
          // email is intentionally excluded as it's read-only for security
        };
        console.log(`Saving ${section} settings (email excluded for security):`, profileDataToSave);
        setSaveMessage('✅ Profile updated successfully! (Email unchanged for security)');
      } else if (section === 'notifications') {
        console.log(`Saving ${section} settings:`, settings[section]);
        setSaveMessage('✅ Notification preferences saved successfully!');
      } else if (section === 'security') {
        console.log(`Saving ${section} settings:`, settings[section]);
        setSaveMessage('✅ Security settings updated successfully!');
      } else {
        console.log(`Saving ${section} settings:`, settings[section]);
        setSaveMessage('✅ Settings saved successfully!');
      }

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSettings(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              avatar: e.target.result
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRemoveAvatar = () => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        avatar: null
      }
    }));
  };

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = () => {
    setShowChangePassword(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);

      // Get current user and update password
      const user = currentUser;
      if (!user) {
        setPasswordError('Please log in to change your password');
        return;
      }

      // Re-authenticate user with current password first
      const { signInWithEmailAndPassword, updatePassword } = await import('firebase/auth');
      const { auth } = await import('../firebase');

      // Re-authenticate
      await signInWithEmailAndPassword(auth, user.email, passwordForm.currentPassword);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      setPasswordSuccess('Password updated successfully!');
      setShowChangePassword(false);

      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Show success message
      setSaveMessage('✅ Password updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Password change error:', error);

      let errorMessage = 'Failed to update password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in before changing your password';
      }

      setPasswordError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      setSaving(true);

      const user = currentUser;
      if (!user || !user.email) {
        setSaveMessage('❌ Unable to send reset email - no email found');
        return;
      }

      const response = await fetch('/api/notifications/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage('✅ Password reset email sent! Check your inbox.');
      } else {
        setSaveMessage(`❌ Failed to send reset email: ${result.error}`);
      }

      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      console.error('Error sending password reset:', error);
      setSaveMessage('❌ Failed to send password reset email');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePlanSelect = async (selectedPlan) => {
    try {
      setSaving(true);

      console.log('Selected plan:', selectedPlan);

      // Get user token
      const token = await currentUser.getIdToken();

      // Create Stripe checkout session
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId: selectedPlan.stripeId,
          planId: selectedPlan.id,
          billingCycle: selectedPlan.billingCycle
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to Stripe checkout
        window.location.href = result.sessionUrl;
      } else {
        // Handle error
        if (result.error === 'Stripe not configured') {
          setSaveMessage('💳 Stripe integration is being set up. Please contact support for manual billing setup.');
        } else {
          setSaveMessage(`❌ Failed to process payment: ${result.message || result.error}`);
        }
        setTimeout(() => setSaveMessage(''), 5000);
      }

    } catch (error) {
      console.error('Error selecting plan:', error);
      setSaveMessage('❌ Failed to process plan selection. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Simulate account deletion
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Account deletion initiated. You will receive a confirmation email.');
      } catch (error) {
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  const handleTestNotification = async (type) => {
    try {
      setSaving(true);

      // Get auth token
      const user = currentUser;
      if (!user) {
        setSaveMessage('❌ Please log in to test notifications');
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage(`✅ Test ${type.replace('_', ' ')} notification sent! Check your email.`);
      } else {
        setSaveMessage(`❌ Failed to send test notification: ${result.error}`);
      }

      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setSaveMessage('❌ Failed to send test notification');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = () => {
    const newKey = 'rr_live_' + Math.random().toString(36).substring(2, 18);
    setSettings({
      ...settings,
      integrations: {
        ...settings.integrations,
        api: {
          ...settings.integrations.api,
          key: newKey
        }
      }
    });
  };

  const handleUpdatePaymentMethod = () => {
    if (activeTab === 'billing') {
      // Already on billing tab, scroll to pricing plans section
      setSaveMessage('💳 Scrolling to pricing plans...');
      setTimeout(() => {
        const pricingSection = document.querySelector('[data-section="pricing-plans"]');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setSaveMessage('');
      }, 100);
    } else {
      // Switch to billing tab
      setSaveMessage('💳 Switched to Billing tab');
      changeTab('billing');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      setSaving(true);

      if (!currentUser) {
        setSaveMessage('❌ Please log in to download invoices');
        return;
      }

      const invoiceData = {
        invoiceNumber: `INV-${invoice.date.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: invoice.date,
        amount: invoice.amount,
        plan: invoice.plan,
        status: invoice.status,
        customerEmail: currentUser.email,
        customerName: userPlan?.firstName && userPlan?.lastName
          ? `${userPlan.firstName} ${userPlan.lastName}`
          : currentUser.displayName || 'Customer'
      };

      // Generate PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('RAGERADAR', 20, 30);

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Invoice', 20, 45);

      // Invoice details
      doc.setFontSize(10);
      doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, 60);
      doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, 20, 70);
      doc.text(`Status: ${invoiceData.status.toUpperCase()}`, 20, 80);

      // Bill to section
      doc.setFont(undefined, 'bold');
      doc.text('Bill To:', 20, 100);
      doc.setFont(undefined, 'normal');
      doc.text(invoiceData.customerName, 20, 110);
      doc.text(invoiceData.customerEmail, 20, 120);

      // Service details
      doc.setFont(undefined, 'bold');
      doc.text('Description', 20, 140);
      doc.text('Amount', 150, 140);

      // Line
      doc.line(20, 145, 190, 145);

      doc.setFont(undefined, 'normal');
      doc.text(`${invoiceData.plan} Plan - Monthly Subscription`, 20, 155);
      doc.text(`$${invoiceData.amount}.00`, 150, 155);

      // Total
      doc.line(20, 165, 190, 165);
      doc.setFont(undefined, 'bold');
      doc.text('Total:', 130, 175);
      doc.text(`$${invoiceData.amount}.00`, 150, 175);

      // Footer
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.text('Thank you for your business!', 20, 200);
      doc.text('RageRadar Inc. | support@rageradar.com', 20, 210);

      // Save the PDF
      doc.save(`RageRadar-Invoice-${invoiceData.invoiceNumber}.pdf`);

      setSaveMessage('✅ Invoice PDF downloaded successfully!');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Error downloading invoice:', error);
      setSaveMessage('❌ Failed to download invoice. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-600">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-6">
      {/* Toast Notification */}
      {saveMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${saveMessage.includes('Failed')
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
            }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {saveMessage.includes('Failed') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <div>
              <div className="font-medium">{saveMessage}</div>
              {saveMessage.includes('Email unchanged') && (
                <div className="text-xs mt-0.5 opacity-90">Email protected for security</div>
              )}
            </div>
            <button
              onClick={() => setSaveMessage('')}
              className="ml-2 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-slate-300">Manage your account, notifications, integrations, and preferences</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-slate-800 rounded-xl p-4">
              <nav className="space-y-1">
                {[
                  {
                    id: 'profile', label: 'Profile', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )
                  },
                  {
                    id: 'notifications', label: 'Notifications', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718A10.951 10.951 0 0112 17c2.037 0 3.952.56 5.592 1.534M12 2a8.5 8.5 0 00-8.5 8.5c0 1.5.4 2.9 1.1 4.1L3 21l6.6-1.6c1.2.7 2.6 1.1 4.1 1.1a8.5 8.5 0 008.5-8.5A8.5 8.5 0 0012 2z" />
                      </svg>
                    )
                  },
                  {
                    id: 'integrations', label: 'Integrations', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                      </svg>
                    )
                  },
                  {
                    id: 'billing', label: 'Billing', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )
                  },
                  {
                    id: 'security', label: 'Security', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => changeTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Success Message */}
            {saveMessage && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${saveMessage.includes('Failed')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border border-green-500/30 text-green-400'
                }`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {saveMessage.includes('Failed') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <div>
                  <div className="font-medium">{saveMessage}</div>
                  {saveMessage.includes('Email unchanged') && (
                    <div className="text-xs mt-1 opacity-80">Your email address remains protected for security reasons.</div>
                  )}
                </div>
              </div>
            )}
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-slate-800 rounded-xl p-6 animate-fade-in">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>

                {/* Email Security Notice */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-400 mb-1">Email Address Security</h3>
                      <p className="text-sm text-blue-300/80">
                        Your email address is protected and cannot be changed directly as it's your primary authentication method.
                        This helps keep your account secure and prevents unauthorized access.
                      </p>
                      <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline">
                        Need to change your email? Contact Support →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {settings.profile.displayName?.charAt(0) || settings.profile.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={handleChangeAvatar}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
                      >
                        Change Avatar
                      </button>
                      <button
                        onClick={handleRemoveAvatar}
                        className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={settings.profile.displayName}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, displayName: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={settings.profile.email}
                          readOnly
                          className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-600 text-slate-300 rounded-lg cursor-not-allowed opacity-75"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Email cannot be changed as it's used for account authentication. Contact support if needed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                      <input
                        type="text"
                        value={settings.profile.company}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, company: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                      <input
                        type="text"
                        value={settings.profile.role}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, role: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
                      <select
                        value={settings.profile.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, timezone: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                      <select
                        value={settings.profile.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, language: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-600">
                    <button
                      onClick={() => handleSaveSettings('profile')}
                      disabled={saving}
                      className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${saving
                          ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                      {saving && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      )}
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Email Notification Controls */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-400">Resend Service Active</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Rage Spike Alerts */}
                    <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          🚨 Rage Spike Alerts
                        </div>
                        <div className="text-sm text-slate-300">
                          Get notified when sentiment drops significantly (20%+ decline)
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.rageAlerts?.enabled || false}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            rageAlerts: { enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                    </label>

                    {/* Weekly Reports */}
                    <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          📊 Weekly Reports
                        </div>
                        <div className="text-sm text-slate-300">
                          Receive comprehensive weekly summaries every Monday at 9 AM
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.weeklyReports?.enabled || false}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            weeklyReports: { enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                    </label>

                    {/* Mention Alerts */}
                    <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          🔍 New Mention Alerts
                        </div>
                        <div className="text-sm text-slate-300">
                          Get notified about important negative mentions and high-impact positive ones
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.mentionAlerts?.enabled || false}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            mentionAlerts: { enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                    </label>

                    {/* System Notifications */}
                    <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          📢 System Notifications
                        </div>
                        <div className="text-sm text-slate-300">
                          Account updates, billing alerts, and security notifications
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.systemAlerts?.enabled !== false}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            systemAlerts: { enabled: e.target.checked }
                          }
                        })}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Test Notifications */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Test Notifications</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Send test emails to see how notifications will look in your inbox.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleTestNotification('rage_spike')}
                      className="px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      🚨 Test Rage Alert
                    </button>
                    <button
                      onClick={() => handleTestNotification('weekly_report')}
                      className="px-4 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      📊 Test Weekly Report
                    </button>
                    <button
                      onClick={() => handleTestNotification('new_mention')}
                      className="px-4 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                    >
                      🔍 Test Mention Alert
                    </button>
                    <button
                      onClick={() => handleTestNotification('system')}
                      className="px-4 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                    >
                      📢 Test System Alert
                    </button>
                  </div>
                </div>



                <div className="pt-6">
                  <button
                    onClick={() => handleSaveSettings('notifications')}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${saving
                        ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <span>{saving ? 'Saving...' : 'Save Notification Settings'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                {/* API Access */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">API Access</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="font-medium text-white">API Key</div>
                        <div className="text-sm text-slate-300">Use this key to access the RageRadar API</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <code className="px-3 py-1 bg-slate-900 rounded text-sm font-mono text-slate-300">
                          {showApiKey ? settings.integrations.api.key : settings.integrations.api.key.replace(/[^_]/g, '•')}
                        </code>
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {showApiKey ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={handleGenerateApiKey}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-300">Rate Limit</div>
                        <div className="text-lg font-semibold text-white">
                          {settings.integrations.api.rate_limit}/hour
                        </div>
                      </div>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-300">Usage This Hour</div>
                        <div className="text-lg font-semibold text-white">
                          {settings.integrations.api.usage}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third-party Integrations */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Third-party Integrations</h3>

                  <div className="space-y-4">
                    {/* Slack */}
                    <div className="flex items-center justify-between p-4 border border-slate-600 rounded-lg hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400 text-lg">💬</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">Slack</div>
                          <div className="text-sm text-slate-300">
                            {settings.integrations.slack.connected
                              ? `Connected to ${settings.integrations.slack.workspace}`
                              : 'Send alerts and reports to Slack'
                            }
                          </div>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.integrations.slack.connected
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                          : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                        }`}>
                        {settings.integrations.slack.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {/* Microsoft Teams */}
                    <div className="flex items-center justify-between p-4 border border-slate-600 rounded-lg hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 text-lg">👥</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">Microsoft Teams</div>
                          <div className="text-sm text-slate-300">
                            {settings.integrations.teams.connected
                              ? 'Connected and active'
                              : 'Send notifications to Teams channels'
                            }
                          </div>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.integrations.teams.connected
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                          : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                        }`}>
                        {settings.integrations.teams.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {/* Zapier */}
                    <div className="flex items-center justify-between p-4 border border-slate-600 rounded-lg hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-orange-400 text-lg">⚡</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">Zapier</div>
                          <div className="text-sm text-slate-300">
                            {settings.integrations.zapier.connected
                              ? `${settings.integrations.zapier.active_zaps} active Zaps`
                              : 'Automate workflows with 5000+ apps'
                            }
                          </div>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.integrations.zapier.connected
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                          : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                        }`}>
                        {settings.integrations.zapier.connected ? 'Manage' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Current Plan Status */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-white mb-2">Current Plan</h3>
                        <button
                          onClick={async () => {
                            setLoading(true);
                            await refreshUserPlan();
                            // Refetch billing info
                            if (currentUser) {
                              try {
                                const token = await currentUser.getIdToken();
                                const response = await fetch('/api/billing/info', {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (response.ok) {
                                  const billingData = await response.json();
                                  setSettings(prev => ({
                                    ...prev,
                                    billing: {
                                      ...prev.billing,
                                      plan: billingData.plan || userPlan?.plan || 'trial',
                                      amount: getPlanAmount(billingData.plan || userPlan?.plan || 'trial')
                                    }
                                  }));
                                }
                              } catch (error) {
                                console.error('Error refreshing billing:', error);
                              }
                            }
                            setLoading(false);
                          }}
                          className="text-slate-400 hover:text-white transition-colors p-1 rounded"
                          title="Refresh plan data"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-white">{settings.billing.plan.charAt(0).toUpperCase() + settings.billing.plan.slice(1)} Plan</div>
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm font-medium">
                          Active
                        </div>
                      </div>
                      <div className="text-slate-300 mt-1">
                        ${settings.billing.amount}/{settings.billing.billing_cycle}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Next billing</div>
                      <div className="text-white font-medium">
                        {new Date(settings.billing.next_billing).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">Mentions Used This Month</span>
                      <span className="text-sm font-medium text-white">
                        {settings.billing.usage.mentions.toLocaleString()} / {settings.billing.usage.limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${(settings.billing.usage.mentions / settings.billing.usage.limit) > 0.8 ? 'bg-red-500' :
                            (settings.billing.usage.mentions / settings.billing.usage.limit) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${(settings.billing.usage.mentions / settings.billing.usage.limit) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Payment Method - Only show for paid plans */}
                  {settings.billing.plan !== 'trial' && (
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <div>
                          <div className="text-white font-medium">Payment & Billing</div>
                          <div className="text-sm text-slate-300">Manage your subscription and payment methods</div>
                        </div>
                      </div>
                      <button
                        onClick={handleUpdatePaymentMethod}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        {activeTab === 'billing' ? 'View Plans' : 'Manage'}
                      </button>
                    </div>
                  )}

                  {/* Trial Plan Notice */}
                  {settings.billing.plan === 'trial' && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="text-blue-400 font-medium mb-1">Free Trial Plan</div>
                          <div className="text-sm text-blue-300/80">
                            You're currently on the free trial. Upgrade to a paid plan to add payment methods and unlock additional features.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Plans */}
                <div data-section="pricing-plans" className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-6">Available Plans</h3>
                  <div className="bg-slate-900 rounded-xl p-6">
                    <PricingCards
                      showHeader={false}
                      showTrialBadge={false}
                      currentPlan={settings.billing.plan.toLowerCase()}
                      onPlanSelect={handlePlanSelect}
                      darkMode={true}
                      className="text-white"
                    />
                  </div>
                </div>

                {/* Billing History - Only show for paid plans */}
                {settings.billing.plan !== 'trial' && (
                  <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>

                    <div className="space-y-3">
                      {[
                        { date: '2024-01-16', amount: 49, status: 'paid', plan: 'Pro' },
                        { date: '2023-12-16', amount: 49, status: 'paid', plan: 'Pro' },
                        { date: '2023-11-16', amount: 49, status: 'paid', plan: 'Pro' }
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                ${invoice.amount} - {invoice.plan} Plan
                              </div>
                              <div className="text-sm text-slate-300">
                                {new Date(invoice.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-xs font-medium capitalize">
                              {invoice.status}
                            </span>
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Password */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Password & Authentication</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">Password</div>
                        <div className="text-sm text-slate-300">Keep your account secure with a strong password</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={handleSendPasswordReset}
                          className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                        >
                          Email Reset Link
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-300">
                        <strong>MVP Note:</strong> Two-factor authentication will be available in a future update.
                        For now, focus on using a strong password to secure your account.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Preferences */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Security Preferences</h3>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">Login Notifications</div>
                        <div className="text-sm text-slate-300">Get notified when someone logs into your account</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.login_notifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, login_notifications: e.target.checked }
                        })}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                    </label>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">Session Timeout</div>
                        <div className="text-sm text-slate-300">Automatically log out after inactivity</div>
                      </div>
                      <select
                        value={settings.security.session_timeout}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, session_timeout: parseInt(e.target.value) }
                        })}
                        className="px-3 py-1 bg-slate-700 border border-slate-600 text-white rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value={1}>1 hour</option>
                        <option value={8}>8 hours</option>
                        <option value={24}>24 hours</option>
                        <option value={168}>1 week</option>
                        <option value={0}>Never</option>
                      </select>
                    </div>

                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">API Access</div>
                        <div className="text-sm text-slate-300">Allow API access to your account</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.api_access}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, api_access: e.target.checked }
                        })}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">Data Export</div>
                        <div className="text-sm text-slate-300">Allow downloading of your data</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.data_export}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, data_export: e.target.checked }
                        })}
                        className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-red-500/30">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div>
                        <div className="font-medium text-red-400">Delete Account</div>
                        <div className="text-sm text-red-300">Permanently delete your account and all data</div>
                      </div>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSaveSettings('security')}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${saving
                        ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <span>{saving ? 'Saving...' : 'Save Security Settings'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Change Password</h3>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${saving
                        ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    <span>{saving ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>

              {/* Security Tips */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-2">Password Security Tips</h4>
                <ul className="text-xs text-blue-300/80 space-y-1">
                  <li>• Use at least 8 characters with mixed case, numbers, and symbols</li>
                  <li>• Don't reuse passwords from other accounts</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsDashboard;