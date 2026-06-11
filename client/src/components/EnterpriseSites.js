import React, { useState } from 'react';
import { ModernIcon, enterpriseDesign } from '../utils/enterpriseDesignSystem';

import { useBrand } from '../contexts/BrandContext';
import { useFilters } from '../contexts/FilterContext';
import { calculateKPIs } from '../utils/kpiCalculations';

const EnterpriseSites = () => {
  const { currentBrand } = useBrand();
  const { filters } = useFilters();
  const kpis = calculateKPIs(currentBrand, filters);

  const [sites, setSites] = useState([
    { id: 'reddit', name: 'Reddit', enabled: true, mentions: Math.floor(kpis.totalMentions * 0.4), sentiment: Math.min(100, kpis.averageSentiment + 5), status: 'active', lastSync: '2 min ago' },
    { id: 'twitter', name: 'Twitter', enabled: true, mentions: Math.floor(kpis.totalMentions * 0.3), sentiment: Math.max(0, kpis.averageSentiment - 5), status: 'active', lastSync: '1 min ago' },
    { id: 'instagram', name: 'Instagram', enabled: true, mentions: Math.floor(kpis.totalMentions * 0.15), sentiment: Math.min(100, kpis.averageSentiment + 10), status: 'active', lastSync: '3 min ago' },
    { id: 'tiktok', name: 'TikTok', enabled: true, mentions: Math.floor(kpis.totalMentions * 0.1), sentiment: Math.min(100, kpis.averageSentiment + 8), status: 'active', lastSync: '5 min ago' },
    { id: 'youtube', name: 'YouTube', enabled: true, mentions: Math.floor(kpis.totalMentions * 0.05), sentiment: Math.min(100, kpis.averageSentiment + 2), status: 'active', lastSync: '4 min ago' },
    { id: 'facebook', name: 'Facebook', enabled: false, mentions: 0, sentiment: 0, status: 'inactive', lastSync: 'Never' },
    { id: 'linkedin', name: 'LinkedIn', enabled: false, mentions: 0, sentiment: 0, status: 'inactive', lastSync: 'Never' },
    { id: 'pinterest', name: 'Pinterest', enabled: false, mentions: 0, sentiment: 0, status: 'inactive', lastSync: 'Never' },
    { id: 'snapchat', name: 'Snapchat', enabled: false, mentions: 0, sentiment: 0, status: 'inactive', lastSync: 'Never' },
    { id: 'discord', name: 'Discord', enabled: false, mentions: 0, sentiment: 0, status: 'inactive', lastSync: 'Never' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  const toggleSite = (siteId) => {
    setSites(prev => prev.map(site =>
      site.id === siteId
        ? { ...site, enabled: !site.enabled, status: !site.enabled ? 'active' : 'inactive' }
        : site
    ));
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 70) return 'text-positive-600 bg-positive-50';
    if (sentiment >= 50) return 'text-secondary-600 bg-secondary-50';
    return 'text-negative-600 bg-negative-50';
  };

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-positive-100 text-positive-800'
      : 'bg-neutral-100 text-neutral-600';
  };

  const SiteCard = ({ site }) => (
    <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">{site.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{site.name}</h3>
            <p className="text-sm text-neutral-600">Social Media Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.status)}`}>
            {site.status}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={site.enabled}
              onChange={() => toggleSite(site.id)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-neutral-600">Mentions</p>
          <p className="text-xl font-bold text-neutral-900">{site.mentions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Sentiment</p>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-neutral-900">{site.sentiment}%</span>
            {site.enabled && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(site.sentiment)}`}>
                {site.sentiment >= 70 ? 'Good' : site.sentiment >= 50 ? 'Fair' : 'Poor'}
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Last Sync</p>
          <p className="text-sm font-medium text-neutral-900">{site.lastSync}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedSite(site)}
          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200"
        >
          Configure
        </button>
        <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors duration-200">
          View Data
        </button>
      </div>
    </div>
  );

  const AddSiteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Add New Site</h3>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            <ModernIcon name="x" className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Platform</label>
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200">
              <option>Select a platform</option>
              <option>Custom RSS Feed</option>
              <option>News Website</option>
              <option>Forum</option>
              <option>Blog Platform</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Site Name</label>
            <input
              type="text"
              placeholder="Enter site name"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">URL/Endpoint</label>
            <input
              type="url"
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">API Key (if required)</label>
            <input
              type="password"
              placeholder="Enter API key"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200"
          >
            Add Site
          </button>
          <button
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const ConfigModal = () => (
    selectedSite && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Configure {selectedSite.name}</h3>
            <button
              onClick={() => setSelectedSite(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <ModernIcon name="x" className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Sync Frequency</label>
              <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200">
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Every 30 minutes</option>
                <option>Every hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Keywords to Track</label>
              <textarea
                placeholder="Enter keywords separated by commas"
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Language Filter</label>
              <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200">
                <option>All Languages</option>
                <option>English Only</option>
                <option>Spanish Only</option>
                <option>French Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Enable Notifications</h4>
                <p className="text-sm text-neutral-600">Get alerts for high-impact mentions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setSelectedSite(null)}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200"
            >
              Save Changes
            </button>
            <button
              onClick={() => setSelectedSite(null)}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );

  const activeSites = sites.filter(site => site.enabled);
  const totalMentions = activeSites.reduce((sum, site) => sum + site.mentions, 0);
  const avgSentiment = activeSites.length > 0
    ? Math.round(activeSites.reduce((sum, site) => sum + site.sentiment, 0) / activeSites.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Sites Management</h1>
          <p className="text-neutral-600 mt-1">Manage your connected platforms and data sources</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-colors duration-200 shadow-sm"
        >
          <ModernIcon name="plus" className="w-4 h-4" strokeWidth={1.5} />
          <span>Add Site</span>
        </button>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <ModernIcon name="sites" className="w-6 h-6 text-primary-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Sites</p>
              <p className="text-2xl font-bold text-neutral-900">{activeSites.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary-50 rounded-lg">
              <ModernIcon name="activity" className="w-6 h-6 text-secondary-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Mentions</p>
              <p className="text-2xl font-bold text-neutral-900">{totalMentions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-positive-50 rounded-lg">
              <ModernIcon name="trendingUp" className="w-6 h-6 text-positive-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Avg Sentiment</p>
              <p className="text-2xl font-bold text-neutral-900">{avgSentiment}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-neutral-50 rounded-lg">
              <ModernIcon name="check" className="w-6 h-6 text-neutral-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Sync Status</p>
              <p className="text-2xl font-bold text-positive-600">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Connected Platforms</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sites..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ModernIcon name="search" className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              </div>
            </div>
            <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors duration-200">
              <ModernIcon name="filter" className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      </div>

      {/* Available Integrations */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Available Integrations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            'Trustpilot', 'G2', 'Capterra', 'Product Hunt', 'Hacker News', 'Medium',
            'Quora', 'Stack Overflow', 'GitHub', 'GitLab', 'Bitbucket', 'Slack'
          ].map((platform) => (
            <button
              key={platform}
              className="p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-center"
            >
              <div className="w-8 h-8 bg-neutral-200 rounded-lg mx-auto mb-2"></div>
              <span className="text-sm font-medium text-neutral-700">{platform}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddSiteModal />}
      {selectedSite && <ConfigModal />}
    </div>
  );
};

export default EnterpriseSites;