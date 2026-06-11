import React, { useState, useEffect } from 'react';

const EnterpriseIntegrations = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, workflows, api-platform, sso
  const [integrations, setIntegrations] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);

  // Mock enterprise integrations data
  const mockIntegrations = [
    {
      id: 1,
      name: 'Salesforce CRM',
      category: 'crm',
      description: 'Sync sentiment data with customer records and opportunities',
      provider: 'Salesforce',
      status: 'connected',
      icon: '☁️',
      features: ['Contact Sync', 'Opportunity Tracking', 'Lead Scoring', 'Custom Fields'],
      pricing: 'Enterprise Plan Required',
      setup_complexity: 'Medium',
      last_sync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      data_synced: 15420,
      config: {
        instance_url: 'https://company.salesforce.com',
        sync_frequency: 'hourly',
        fields_mapped: 12,
        records_synced: 15420
      }
    },
    {
      id: 2,
      name: 'HubSpot Marketing',
      category: 'marketing',
      description: 'Integrate sentiment insights with marketing campaigns and lead nurturing',
      provider: 'HubSpot',
      status: 'available',
      icon: '🧲',
      features: ['Campaign Tracking', 'Lead Scoring', 'Email Automation', 'Analytics'],
      pricing: 'Free tier available',
      setup_complexity: 'Easy',
      estimated_setup_time: '15 minutes'
    },
    {
      id: 3,
      name: 'Microsoft Teams',
      category: 'communication',
      description: 'Send alerts and reports directly to Teams channels',
      provider: 'Microsoft',
      status: 'connected',
      icon: '👥',
      features: ['Channel Notifications', 'Bot Integration', 'File Sharing', 'Mentions'],
      pricing: 'Free with Teams',
      setup_complexity: 'Easy',
      last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      config: {
        webhook_url: 'https://outlook.office.com/webhook/...',
        channels: ['#alerts', '#reports', '#general'],
        notification_types: ['critical_alerts', 'daily_reports']
      }
    },
    {
      id: 4,
      name: 'Tableau Analytics',
      category: 'bi',
      description: 'Create advanced visualizations and dashboards with sentiment data',
      provider: 'Tableau',
      status: 'available',
      icon: '📊',
      features: ['Data Connector', 'Real-time Updates', 'Custom Dashboards', 'Sharing'],
      pricing: 'Tableau license required',
      setup_complexity: 'High',
      estimated_setup_time: '2-4 hours'
    },
    {
      id: 5,
      name: 'Hootsuite Social',
      category: 'social_media',
      description: 'Monitor sentiment alongside social media management',
      provider: 'Hootsuite',
      status: 'connected',
      icon: '🦉',
      features: ['Post Scheduling', 'Sentiment Overlay', 'Response Management', 'Analytics'],
      pricing: 'Professional plan required',
      setup_complexity: 'Medium',
      last_sync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      config: {
        profiles_connected: 8,
        posts_analyzed: 2340,
        sentiment_overlay: true
      }
    },
    {
      id: 6,
      name: 'Jira Service Desk',
      category: 'support',
      description: 'Create tickets automatically from negative sentiment spikes',
      provider: 'Atlassian',
      status: 'available',
      icon: '🎫',
      features: ['Auto Ticket Creation', 'Priority Mapping', 'SLA Tracking', 'Escalation'],
      pricing: 'Jira license required',
      setup_complexity: 'Medium',
      estimated_setup_time: '1-2 hours'
    }
  ];

  const mockWorkflows = [
    {
      id: 1,
      name: 'Crisis Response Automation',
      description: 'Automatically escalate high rage index alerts to crisis team',
      status: 'active',
      trigger: 'rage_index > 70',
      actions: [
        'Send Slack alert to #crisis-team',
        'Create Jira ticket with high priority',
        'Email executive team',
        'Schedule emergency meeting'
      ],
      last_triggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      trigger_count: 3,
      success_rate: 100,
      created_by: 'Sarah Johnson'
    },
    {
      id: 2,
      name: 'Positive Sentiment Amplification',
      description: 'Share positive mentions with marketing team for amplification',
      status: 'active',
      trigger: 'sentiment > 0.8 AND engagement > 100',
      actions: [
        'Post to #marketing-wins Slack channel',
        'Add to HubSpot campaign list',
        'Create social media amplification task',
        'Update customer success records'
      ],
      last_triggered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      trigger_count: 12,
      success_rate: 95,
      created_by: 'Mike Chen'
    },
    {
      id: 3,
      name: 'Weekly Executive Report',
      description: 'Generate and distribute weekly sentiment summary to executives',
      status: 'active',
      trigger: 'schedule: every Monday 9:00 AM',
      actions: [
        'Generate executive summary report',
        'Email to C-level distribution list',
        'Post summary to #executives Slack',
        'Update Salesforce dashboard'
      ],
      last_triggered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      trigger_count: 8,
      success_rate: 100,
      created_by: 'Alex Rivera'
    }
  ];

  const mockApiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'rr_live_sk_1234567890abcdef',
      created_at: '2024-01-01T00:00:00Z',
      last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      usage_count: 15420,
      rate_limit: 10000,
      permissions: ['read', 'write', 'admin'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'rr_test_sk_abcdef1234567890',
      created_at: '2024-01-10T00:00:00Z',
      last_used: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      usage_count: 892,
      rate_limit: 1000,
      permissions: ['read'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Analytics API Key',
      key: 'rr_analytics_sk_fedcba0987654321',
      created_at: '2024-01-05T00:00:00Z',
      last_used: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      usage_count: 5670,
      rate_limit: 5000,
      permissions: ['read', 'analytics'],
      status: 'active'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(mockIntegrations);
      setWorkflows(mockWorkflows);
      setApiKeys(mockApiKeys);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      connected: 'bg-green-100 text-green-700',
      available: 'bg-blue-100 text-blue-700',
      error: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || colors.available;
  };

  const getStatusIcon = (status) => {
    const icons = {
      connected: '✅',
      available: '🔗',
      error: '❌',
      pending: '⏳'
    };
    return icons[status] || '🔗';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      crm: '👥',
      marketing: '📢',
      communication: '💬',
      bi: '📊',
      social_media: '📱',
      support: '🎧'
    };
    return icons[category] || '🔧';
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      Easy: 'text-green-600',
      Medium: 'text-yellow-600',
      High: 'text-red-600'
    };
    return colors[complexity] || colors.Medium;
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

  const handleConnect = (integrationId) => {
    setIntegrations(integrations.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'pending' }
        : integration
    ));
    
    // Simulate connection process
    setTimeout(() => {
      setIntegrations(integrations.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: 'connected',
              last_sync: new Date().toISOString(),
              config: { ...integration.config, connected_at: new Date().toISOString() }
            }
          : integration
      ));
    }, 3000);
  };

  const handleDisconnect = (integrationId) => {
    setIntegrations(integrations.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'available', config: {} }
        : integration
    ));
  };

  const toggleWorkflow = (workflowId) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
        : workflow
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-600">Loading integrations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔗 Enterprise Integrations
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Connect RageRadar with your enterprise tools and automate workflows
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWorkflowBuilder(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              ⚡ Create Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-blue-600">
                {integrations.filter(i => i.status === 'available').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-purple-600">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Keys</p>
              <p className="text-2xl font-bold text-orange-600">{apiKeys.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'marketplace', label: 'Integration Marketplace' },
            { id: 'workflows', label: 'Automated Workflows' },
            { id: 'api-platform', label: 'API Platform' },
            { id: 'sso', label: 'SSO & Security' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)} {integration.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{integration.description}</p>
                  </div>
                </div>
                
                <div className="text-2xl">{getCategoryIcon(integration.category)}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Pricing:</span>
                    <div className="font-medium text-gray-900">{integration.pricing}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Setup:</span>
                    <div className={`font-medium ${getComplexityColor(integration.setup_complexity)}`}>
                      {integration.setup_complexity}
                    </div>
                  </div>
                </div>

                {integration.status === 'connected' && integration.config && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 mb-2">
                      <strong>Connected:</strong> Last sync {formatTimeAgo(integration.last_sync)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
                      {Object.entries(integration.config).map(([key, value]) => (
                        <div key={key}>
                          <span className="capitalize">{key.replace('_', ' ')}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                {integration.status === 'connected' ? (
                  <div className="flex space-x-3">
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Configure
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : integration.status === 'pending' ? (
                  <button disabled className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Connect {integration.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Automated Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {workflow.status === 'active' ? '✅ Active' : '⏸️ Paused'}
                    </span>
                  </div>
                  <p className="text-gray-600">{workflow.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'active' 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } transition-colors`}
                  >
                    {workflow.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🎯 Trigger Condition</h4>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <code className="text-sm text-blue-900">{workflow.trigger}</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">⚡ Actions</h4>
                  <div className="space-y-2">
                    {workflow.actions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created by:</span>
                    <div className="font-medium text-gray-900">{workflow.created_by}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last triggered:</span>
                    <div className="font-medium text-gray-900">{formatTimeAgo(workflow.last_triggered)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trigger count:</span>
                    <div className="font-medium text-gray-900">{workflow.trigger_count}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Success rate:</span>
                    <div className="font-medium text-green-600">{workflow.success_rate}%</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Platform Tab */}
      {activeTab === 'api-platform' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">API Keys Management</h2>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                🔑 Generate New Key
              </button>
            </div>
            
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{apiKey.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                        <span>Last used: {formatTimeAgo(apiKey.last_used)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apiKey.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {apiKey.status}
                        </span>
                      </div>
                    </div>
                    
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-900">{apiKey.key}</code>
                      <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors">
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Usage</div>
                      <div className="font-semibold text-gray-900">
                        {apiKey.usage_count.toLocaleString()} / {apiKey.rate_limit.toLocaleString()}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(apiKey.usage_count / apiKey.rate_limit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Permissions</div>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((permission, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Rate Limit</div>
                      <div className="font-semibold text-gray-900">
                        {apiKey.rate_limit.toLocaleString()} req/hour
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">API Documentation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📚 REST API</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Complete REST API for accessing sentiment data, creating alerts, and managing integrations.
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  View Documentation
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🔄 GraphQL API</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Flexible GraphQL endpoint for complex queries and real-time subscriptions.
                </p>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  Explore GraphQL
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📦 SDK Libraries</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Official SDKs for JavaScript, Python, PHP, and other popular languages.
                </p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Download SDKs
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🔗 Webhooks</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Real-time event notifications sent directly to your applications.
                </p>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  Setup Webhooks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SSO & Security Tab */}
      {activeTab === 'sso' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Single Sign-On (SSO)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🔐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">SAML 2.0</h3>
                    <p className="text-sm text-gray-600">Enterprise SAML integration</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      ✅ Configured
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span className="text-sm font-medium text-gray-900">Azure AD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Users:</span>
                    <span className="text-sm font-medium text-gray-900">247 active</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Configure SAML
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🔑</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">OAuth 2.0</h3>
                    <p className="text-sm text-gray-600">OAuth integration support</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      🔗 Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Providers:</span>
                    <span className="text-sm font-medium text-gray-900">Google, GitHub, Okta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Setup:</span>
                    <span className="text-sm font-medium text-gray-900">15 minutes</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  Setup OAuth
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security & Compliance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="font-semibold text-gray-900 mb-2">SOC 2 Compliant</h3>
                <p className="text-sm text-gray-600">Type II certification for security and availability</p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="font-semibold text-gray-900 mb-2">GDPR Ready</h3>
                <p className="text-sm text-gray-600">Full compliance with European data protection regulations</p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
                <p className="text-sm text-gray-600">AES-256 encryption for data at rest and in transit</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseIntegrations;