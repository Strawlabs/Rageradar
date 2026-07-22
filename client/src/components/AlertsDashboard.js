import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBrand } from '../contexts/BrandContext';
import { generateAlertsFromBrandData, generateAlertRules } from '../utils/alertsUtils';
import ColorfulWidget from './shared/ColorfulWidget';
import PageHeader from './shared/PageHeader';
import axios from 'axios';
import EmptyState from './shared/EmptyState';

const AlertsDashboard = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { currentBrand, analyzedBrands } = useBrand();
  const navigate = useNavigate();

  // Use current brand from context, fallback to URL param
  const brandName = currentBrand?.brandName || searchParams.get('brand');

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [alertRules, setAlertRules] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // active, history, rules
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showEditRule, setShowEditRule] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'rage_spike',
    threshold: 50,
    platforms: [],
    keywords: '',
    enabled: true,
    channels: ['email'] // Only email is available for now
  });

  // No more hardcoded demo data - use only real data or empty state

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        let selectedBrandData = null;

        // Use brands from context instead of making API call
        if (brandName) {
          selectedBrandData = analyzedBrands.find(b => b.brandName === brandName);
        }

        // If no specific brand found, use current brand from context
        if (!selectedBrandData && currentBrand && currentBrand.brandName === brandName) {
          selectedBrandData = currentBrand;
        }

        // If still no specific brand, use the first available brand
        if (!selectedBrandData && analyzedBrands.length > 0) {
          selectedBrandData = analyzedBrands[0];
        }

        if (selectedBrandData && selectedBrandData.totalMentions > 0) {
          // Generate real alerts from brand data using shared logic (same as AI Insights)
          console.log('🚨 AlertsDashboard: Brand data for alerts:', {
            brandName: selectedBrandData.brandName,
            totalMentions: selectedBrandData.totalMentions,
            positivePercentage: selectedBrandData.positivePercentage,
            negativePercentage: selectedBrandData.negativePercentage,
            rageIndex: selectedBrandData.rageIndex
          });

          const realAlerts = generateAlertsFromBrandData(selectedBrandData);
          const realRules = generateAlertRules(selectedBrandData);

          console.log('🚨 AlertsDashboard: Generated alerts:', realAlerts.length, realAlerts);
          console.log('🚨 AlertsDashboard: Generated rules:', realRules.length);

          setAlerts(realAlerts);
          setAlertRules(realRules);
        } else {
          // No data available - show empty state
          console.log('🚨 AlertsDashboard: No brand data available - showing empty state');
          setAlerts([]);
          setAlertRules([]);
        }
      } catch (error) {
        console.error('Error fetching alerts data:', error);
        // Show empty state when there's an error
        setAlerts([]);
        setAlertRules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandName, currentUser, currentBrand, analyzedBrands]);



  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[severity] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-red-500/20 text-red-400',
      acknowledged: 'bg-yellow-500/20 text-yellow-400',
      monitoring: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400'
    };
    return colors[status] || colors.active;
  };

  const getAlertIcon = (type) => {
    const icons = {
      rage_spike: (
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      sentiment_drop: (
        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
      volume_spike: (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      competitor_mention: (
        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      keyword_trend: (
        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    };
    return icons[type] || (
      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId
        ? { ...alert, acknowledged: true, status: 'acknowledged' }
        : alert
    ));
  };

  const handleResolveAlert = (alertId) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'resolved' }
        : alert
    ));
  };

  const handleCreateRule = () => {
    const rule = {
      ...newRule,
      id: Date.now(),
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      triggerCount: 0
    };

    setAlertRules([...alertRules, rule]);
    setNewRule({
      name: '',
      type: 'rage_spike',
      threshold: 50,
      platforms: [],
      keywords: '',
      enabled: true,
      channels: ['email'] // Only email is available for now
    });
    setShowCreateRule(false);
  };

  const handleToggleRule = (ruleId) => {
    setAlertRules(alertRules.map(rule =>
      rule.id === ruleId
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  const handleDropdownToggle = (ruleId) => {
    setOpenDropdown(openDropdown === ruleId ? null : ruleId);
  };

  const handleEditRule = (ruleId) => {
    const ruleToEdit = alertRules.find(rule => rule.id === ruleId);
    if (ruleToEdit) {
      setEditingRule({ ...ruleToEdit });
      setShowEditRule(true);
    }
    setOpenDropdown(null);
  };

  const handleDeleteRule = (ruleId) => {
    setRuleToDelete(ruleId);
    setShowDeleteConfirm(true);
    setOpenDropdown(null);
  };

  const confirmDeleteRule = () => {
    if (ruleToDelete) {
      setAlertRules(alertRules.filter(rule => rule.id !== ruleToDelete));
      setRuleToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDeleteRule = () => {
    setRuleToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleUpdateRule = () => {
    if (editingRule) {
      setAlertRules(alertRules.map(rule =>
        rule.id === editingRule.id ? editingRule : rule
      ));
      setEditingRule(null);
      setShowEditRule(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setShowEditRule(false);
  };

  const handleDuplicateRule = (ruleId) => {
    const ruleToDuplicate = alertRules.find(rule => rule.id === ruleId);
    if (ruleToDuplicate) {
      const duplicatedRule = {
        ...ruleToDuplicate,
        id: Date.now(),
        name: `${ruleToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString(),
        lastTriggered: null,
        triggerCount: 0
      };
      setAlertRules([...alertRules, duplicatedRule]);
    }
    setOpenDropdown(null);
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowAlertDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedAlert(null);
    setShowAlertDetails(false);
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  if (loading) {
    return (
      <div className="h-full bg-slate-900 p-4 lg:p-6">
        <div className="max-w-full mx-auto">
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="text-lg font-medium text-white ml-3">Loading alerts...</span>
            </div>
            <p className="text-slate-400">Fetching alert data and monitoring status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no alerts and not loading
  if (!loading && (!alerts || alerts.length === 0)) {
    return (
      <div className="p-6 w-full">
        <EmptyState title="" message="" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <PageHeader
          title="Alert Management"
          subtitle="Monitor and manage brand sentiment alerts and notifications"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          iconBg="from-red-500 to-orange-500"
          action={
            <button
              onClick={() => setShowCreateRule(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Alert Rule</span>
            </button>
          }
        />

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ColorfulWidget
            title="Active Alerts"
            value={activeAlerts.length.toString()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            color="red"
            size="medium"
          />

          <ColorfulWidget
            title="Acknowledged"
            value={acknowledgedAlerts.length.toString()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            color="orange"
            size="medium"
          />

          <ColorfulWidget
            title="Resolved Today"
            value={resolvedAlerts.length.toString()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
            size="medium"
          />

          <ColorfulWidget
            title="Alert Rules"
            value={alertRules.filter(r => r.enabled).length.toString()}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            color="blue"
            size="medium"
          />
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
            {[
              { id: 'active', label: 'Active Alerts', count: activeAlerts.length },
              { id: 'history', label: 'Alert History', count: alerts.length },
              { id: 'rules', label: 'Alert Rules', count: alertRules.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Active Alerts Tab */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {activeAlerts.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-12 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
                <p className="text-slate-400">All systems are running smoothly. Great job!</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div key={alert.id} className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-200 animate-fade-in">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">{getAlertIcon(alert.type)}</div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTimeAgo(alert.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>{alert.mentions.toLocaleString()} mentions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{alert.estimatedReach.toLocaleString()} reach</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400 mb-1">
                        {alert.currentValue}
                      </div>
                      <div className="text-sm text-slate-400">
                        Threshold: {alert.threshold}
                      </div>
                      <div className="text-sm font-medium text-red-400">
                        {alert.change}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Affected Platforms:</div>
                      <div className="flex flex-wrap gap-2">
                        {alert.platforms.map((platform, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full capitalize">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-400 mb-2">Key Terms:</div>
                      <div className="flex flex-wrap gap-2">
                        {alert.keywords.slice(0, 4).map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                    <div className="flex items-center space-x-4">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleViewDetails(alert)}
                        className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>

                    {alert.assignedTo && (
                      <div className="text-sm text-slate-400">
                        Assigned to: <span className="font-medium text-slate-300">{alert.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alert History Tab */}
        {activeTab === 'history' && (
          <div className="bg-slate-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-600 bg-slate-700">
              <h2 className="text-lg font-semibold text-white">Alert History</h2>
            </div>

            <div className="divide-y divide-slate-600">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-6 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">{getAlertIcon(alert.type)}</div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-white">{alert.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                          <span>{alert.mentions.toLocaleString()} mentions</span>
                          <span>{alert.change}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {alert.currentValue}
                      </div>
                      <div className="text-xs text-slate-400">
                        vs {alert.threshold} threshold
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert Rules Tab */}
        {activeTab === 'rules' && (
          <div className="bg-slate-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-600 bg-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Alert Rules</h2>
                <button
                  onClick={() => setShowCreateRule(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Rule</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-600">
              {alertRules.map((rule) => (
                <div key={rule.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      <div>
                        <h3 className="font-semibold text-white">{rule.name}</h3>
                        <p className="text-sm text-slate-400 capitalize">
                          {rule.type.replace('_', ' ')} • Threshold: {rule.threshold}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${rule.enabled
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                          }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={() => handleDropdownToggle(rule.id)}
                          className="text-slate-400 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {/* Dropdown Content */}
                        {openDropdown === rule.id && (
                          <div className="absolute right-0 top-8 w-48 bg-slate-700 rounded-lg shadow-xl border border-slate-600 z-10 animate-fade-in">
                            <div className="py-2">
                              <button
                                onClick={() => handleEditRule(rule.id)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit Rule</span>
                              </button>

                              <button
                                onClick={() => handleDuplicateRule(rule.id)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Duplicate Rule</span>
                              </button>

                              <div className="border-t border-slate-600 my-1"></div>

                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete Rule</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400 mb-1">Platforms:</div>
                      <div className="text-white">
                        {Array.isArray(rule.platforms) ? rule.platforms.join(', ') : rule.platforms}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">Keywords:</div>
                      <div className="text-white">
                        {rule.keywords || 'All keywords'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">Last Triggered:</div>
                      <div className="text-white">
                        {rule.lastTriggered ? formatTimeAgo(rule.lastTriggered) : 'Never'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600">
                    <div className="text-sm text-slate-400">
                      Created by {rule.createdBy} • Triggered {rule.triggerCount} times
                    </div>

                    <div className="flex items-center space-x-2">
                      {rule.channels.map((channel, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Rule Modal */}
        {showCreateRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Create Alert Rule</h2>
                <button
                  onClick={() => setShowCreateRule(false)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter rule name..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Alert Type</label>
                    <select
                      value={newRule.type}
                      onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="rage_spike">Rage Index Spike</option>
                      <option value="sentiment_drop">Sentiment Drop</option>
                      <option value="volume_spike">Volume Spike</option>
                      <option value="competitor_mention">Competitor Mention</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Threshold</label>
                    <input
                      type="number"
                      value={newRule.threshold}
                      onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Keywords (optional)</label>
                  <input
                    type="text"
                    value={newRule.keywords}
                    onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter keywords separated by commas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notification Channels</label>
                  <div className="space-y-3">
                    {/* Email - Available */}
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newRule.channels.includes('email')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRule({ ...newRule, channels: [...newRule.channels.filter(c => c !== 'email'), 'email'] });
                          } else {
                            setNewRule({ ...newRule, channels: newRule.channels.filter(c => c !== 'email') });
                          }
                        }}
                        className="w-4 h-4 text-red-600 border-slate-500 rounded focus:ring-red-500"
                      />
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-slate-300">Email</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Available</span>
                      </div>
                    </label>

                    {/* Additional Notification Channels */}
                    {[
                      { name: 'slack', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Slack' },
                      { name: 'web_dashboard', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Web Dashboard' },
                      { name: 'webhook', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', label: 'Webhook' }
                    ].map((channel) => (
                      <label key={channel.name} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={newRule.channels.includes(channel.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRule({ ...newRule, channels: [...newRule.channels.filter(c => c !== channel.name), channel.name] });
                            } else {
                              setNewRule({ ...newRule, channels: newRule.channels.filter(c => c !== channel.name) });
                            }
                          }}
                          className="w-4 h-4 text-red-600 border-slate-500 rounded focus:ring-red-500"
                        />
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={channel.icon} />
                          </svg>
                          <span className="text-sm text-slate-300">{channel.label}</span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Available</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-slate-600">
                <button
                  onClick={() => setShowCreateRule(false)}
                  className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRule}
                  disabled={!newRule.name}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Details Modal */}
        {showAlertDetails && selectedAlert && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden animate-fade-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedAlert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                        selectedAlert.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          selectedAlert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                      {getAlertIcon(selectedAlert.type)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedAlert.title}</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Alert detected {formatTimeAgo(selectedAlert.timestamp)} • Brand: {selectedAlert.brand}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                <div className="p-6 space-y-6">

                  {/* Priority Status Banner */}
                  <div className={`rounded-xl p-6 mb-6 shadow-lg ${selectedAlert.severity === 'critical' ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700' :
                      selectedAlert.severity === 'high' ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border-2 border-orange-300 dark:border-orange-700' :
                        selectedAlert.severity === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-700' :
                          'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-700'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-lg font-bold ${selectedAlert.severity === 'critical' ? 'text-red-800 dark:text-red-300' :
                            selectedAlert.severity === 'high' ? 'text-orange-800 dark:text-orange-300' :
                              selectedAlert.severity === 'medium' ? 'text-yellow-800 dark:text-yellow-300' :
                                'text-blue-800 dark:text-blue-300'
                          }`}>
                          {selectedAlert.severity === 'critical' ? '🚨 Critical Alert - Immediate Action Needed' :
                            selectedAlert.severity === 'high' ? '⚠️ High Priority - Attention Required' :
                              selectedAlert.severity === 'medium' ? '📊 Medium Priority - Monitor Closely' :
                                '📋 Low Priority - For Your Information'}
                        </h3>
                        <p className={`text-sm mt-1 ${selectedAlert.severity === 'critical' ? 'text-red-700 dark:text-red-400' :
                            selectedAlert.severity === 'high' ? 'text-orange-700 dark:text-orange-400' :
                              selectedAlert.severity === 'medium' ? 'text-yellow-700 dark:text-yellow-400' :
                                'text-blue-700 dark:text-blue-400'
                          }`}>
                          {selectedAlert.severity === 'critical' ? 'This requires your immediate attention within 1 hour' :
                            selectedAlert.severity === 'high' ? 'Please review and take action within 4 hours' :
                              selectedAlert.severity === 'medium' ? 'Keep an eye on this situation over the next 24 hours' :
                                'This is informational - no immediate action required'}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-semibold ${selectedAlert.severity === 'critical' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' :
                          selectedAlert.severity === 'high' ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' :
                            selectedAlert.severity === 'medium' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                              'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        }`}>
                        {selectedAlert.severity?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* What's Happening */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      What's Happening?
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                      {selectedAlert.description}
                    </p>
                    {/* Evidence Link */}
                    <button
                      onClick={() => {
                        const evidenceUrl = `/dashboard/mentions?brand=${encodeURIComponent(selectedAlert.brand || '')}&severity=${selectedAlert.severity || 'high'}`;
                        navigate(evidenceUrl);
                        handleCloseDetails();
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Evidence Mentions
                    </button>
                  </div>

                  {/* Key Numbers - Simplified for Everyone */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-700 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {selectedAlert.mentions?.toLocaleString() || 0}
                      </div>
                      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">People Talking</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">This is how many people mentioned your brand</div>
                    </div>

                    <div className="bg-white dark:bg-slate-700 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {selectedAlert.currentValue}
                      </div>
                      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Level vs Normal</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Normal is around {selectedAlert.threshold}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-700 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-shadow">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${selectedAlert.change?.includes('+') ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                        <svg className={`w-6 h-6 ${selectedAlert.change?.includes('+') ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedAlert.change?.includes('+') ? "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" : "M7 17l9.2-9.2M17 17H7v-10"} />
                        </svg>
                      </div>
                      <div className={`text-3xl font-bold mb-2 ${selectedAlert.change?.includes('+') ? 'text-red-500' : 'text-green-500'
                        }`}>
                        {selectedAlert.change}
                      </div>
                      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Change from Before</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {selectedAlert.change?.includes('+') ? 'This went up (not good)' : 'This went down (better)'}
                      </div>
                    </div>
                  </div>

                  {/* Where It's Happening */}
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-600">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Where People Are Talking
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedAlert.platforms?.map((platform, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-600 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium capitalize">{platform}</span>
                        </div>
                      )) || (
                          <div className="col-span-full text-center py-4">
                            <span className="text-slate-500 dark:text-slate-400">Platform data not available</span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* What People Are Saying */}
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-600">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Common Words & Phrases
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.keywords?.map((keyword, index) => (
                        <span key={index} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full font-medium border border-purple-200 dark:border-purple-700">
                          #{keyword}
                        </span>
                      )) || (
                          <span className="text-slate-500 dark:text-slate-400 italic">No specific keywords identified</span>
                        )}
                    </div>
                  </div>

                  {/* What Should You Do? */}
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-600">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      What Should You Do?
                    </h3>
                    <div className="space-y-4">
                      {selectedAlert.severity === 'critical' ? (
                        <>
                          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                            <div>
                              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Act Fast (Within 1 Hour)</h4>
                              <p className="text-red-700 dark:text-red-400 text-sm">Find out what's causing people to be upset. Check recent posts, product issues, or customer service problems.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                            <div>
                              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Prepare Your Response</h4>
                              <p className="text-red-700 dark:text-red-400 text-sm">Draft a public response or statement. Be honest, apologetic if needed, and show you're taking action.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                            <div>
                              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Alert Your Team</h4>
                              <p className="text-red-700 dark:text-red-400 text-sm">Tell your manager, PR team, or anyone who handles customer issues. They need to know right away.</p>
                            </div>
                          </div>
                        </>
                      ) : selectedAlert.severity === 'high' ? (
                        <>
                          <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                            <div>
                              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Keep a Close Eye (Next 4 Hours)</h4>
                              <p className="text-orange-700 dark:text-orange-400 text-sm">Watch how this develops. Check if it's getting worse or better.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                            <div>
                              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Look for the Cause</h4>
                              <p className="text-orange-700 dark:text-orange-400 text-sm">Check what you did recently - new products, ads, social posts, or customer service changes.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                            <div>
                              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Get Ready to Respond</h4>
                              <p className="text-orange-700 dark:text-orange-400 text-sm">Think about how you might respond if this gets bigger. Have a plan ready.</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                            <div>
                              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Keep Monitoring</h4>
                              <p className="text-blue-700 dark:text-blue-400 text-sm">This is normal activity. Just keep an eye on it to make sure it doesn't change.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                            <div>
                              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Take Notes</h4>
                              <p className="text-blue-700 dark:text-blue-400 text-sm">Write down what you notice so you can spot patterns later.</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Simple & Clear */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">What would you like to do?</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Choose an action to help us track this alert</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      {!selectedAlert.acknowledged && (
                        <button
                          onClick={() => {
                            handleAcknowledgeAlert(selectedAlert.id);
                            handleCloseDetails();
                          }}
                          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="text-left">
                            <div className="text-lg">I've Seen This</div>
                            <div className="text-sm opacity-90">I'm aware of the situation</div>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleResolveAlert(selectedAlert.id);
                          handleCloseDetails();
                        }}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-left">
                          <div className="text-lg">Problem Fixed</div>
                          <div className="text-sm opacity-90">Issue has been resolved</div>
                        </div>
                      </button>

                      <button
                        onClick={handleCloseDetails}
                        className="w-full sm:w-auto px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 font-semibold flex items-center justify-center gap-3"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <div className="text-left">
                          <div className="text-lg">Just Close</div>
                          <div className="text-sm opacity-75">I'll decide later</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Rule Modal */}
        {showEditRule && editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Edit Alert Rule</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rule Name</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter rule name..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Alert Type</label>
                    <select
                      value={editingRule.type}
                      onChange={(e) => setEditingRule({ ...editingRule, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="rage_spike">Rage Index Spike</option>
                      <option value="sentiment_drop">Sentiment Drop</option>
                      <option value="volume_spike">Volume Spike</option>
                      <option value="competitor_mention">Competitor Mention</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Threshold</label>
                    <input
                      type="number"
                      value={editingRule.threshold}
                      onChange={(e) => setEditingRule({ ...editingRule, threshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Keywords (optional)</label>
                  <input
                    type="text"
                    value={editingRule.keywords}
                    onChange={(e) => setEditingRule({ ...editingRule, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter keywords separated by commas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notification Channels</label>
                  <div className="space-y-3">
                    {/* Email - Available */}
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={editingRule.channels?.includes('email') || false}
                        onChange={(e) => {
                          const currentChannels = editingRule.channels || [];
                          if (e.target.checked) {
                            setEditingRule({ ...editingRule, channels: [...currentChannels.filter(c => c !== 'email'), 'email'] });
                          } else {
                            setEditingRule({ ...editingRule, channels: currentChannels.filter(c => c !== 'email') });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-slate-500 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-slate-300">Email</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Available</span>
                      </div>
                    </label>

                    {/* Additional Notification Channels */}
                    {[
                      { name: 'slack', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Slack' },
                      { name: 'web_dashboard', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Web Dashboard' },
                      { name: 'webhook', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', label: 'Webhook' }
                    ].map((channel) => (
                      <label key={channel.name} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={editingRule.channels?.includes(channel.name) || false}
                          onChange={(e) => {
                            const currentChannels = editingRule.channels || [];
                            if (e.target.checked) {
                              setEditingRule({ ...editingRule, channels: [...currentChannels.filter(c => c !== channel.name), channel.name] });
                            } else {
                              setEditingRule({ ...editingRule, channels: currentChannels.filter(c => c !== channel.name) });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-500 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={channel.icon} />
                          </svg>
                          <span className="text-sm text-slate-300">{channel.label}</span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Available</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingRule.enabled}
                      onChange={(e) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Rule is enabled</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-slate-600">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRule}
                  disabled={!editingRule.name}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Update Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Alert Rule</h3>
                <p className="text-slate-400">
                  Are you sure you want to delete this alert rule? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={cancelDeleteRule}
                  className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteRule}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsDashboard;