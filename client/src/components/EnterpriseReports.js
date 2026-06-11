import React, { useState } from 'react';
import { ModernIcon, enterpriseDesign } from '../utils/enterpriseDesignSystem';

const EnterpriseReports = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reportType, setReportType] = useState('scheduled');

  // Report Templates
  const reportTemplates = [
    {
      id: 'weekly-summary',
      name: 'Weekly Summary',
      description: 'Comprehensive weekly sentiment analysis',
      icon: 'reports',
      frequency: 'Weekly',
      lastGenerated: '2 days ago',
      status: 'active'
    },
    {
      id: 'campaign-performance',
      name: 'Campaign Performance',
      description: 'Track campaign sentiment impact',
      icon: 'activity',
      frequency: 'On-demand',
      lastGenerated: '1 week ago',
      status: 'active'
    },
    {
      id: 'crisis-report',
      name: 'Crisis Report',
      description: 'Emergency sentiment monitoring',
      icon: 'bell',
      frequency: 'Triggered',
      lastGenerated: 'Never',
      status: 'inactive'
    },
    {
      id: 'competitive-analysis',
      name: 'Competitive Analysis',
      description: 'Compare against competitors',
      icon: 'users',
      frequency: 'Monthly',
      lastGenerated: '5 days ago',
      status: 'active'
    }
  ];

  const ReportCard = ({ template }) => {
    const getStatusColor = (status) => {
      return status === 'active' ? 'bg-positive-100 text-positive-800' : 'bg-neutral-100 text-neutral-600';
    };

    return (
      <div className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-all duration-200 cursor-pointer"
           onClick={() => setSelectedTemplate(template)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <ModernIcon name={template.icon} className="w-6 h-6 text-primary-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{template.name}</h3>
              <p className="text-sm text-neutral-600">{template.description}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
            {template.status}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Frequency:</span>
            <span className="font-medium text-neutral-900">{template.frequency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Last Generated:</span>
            <span className="font-medium text-neutral-900">{template.lastGenerated}</span>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
            Generate Now
          </button>
          <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors duration-200">
            Configure
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
          <p className="text-neutral-600 mt-1">Generate and manage sentiment analysis reports</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Report Type Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setReportType('scheduled')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                reportType === 'scheduled'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setReportType('ondemand')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                reportType === 'ondemand'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              On-Demand
            </button>
          </div>
          
          <button className="flex items-center space-x-2 px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-colors duration-200 shadow-sm">
            <ModernIcon name="plus" className="w-4 h-4" strokeWidth={1.5} />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <ModernIcon name="reports" className="w-6 h-6 text-primary-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Reports</p>
              <p className="text-2xl font-bold text-neutral-900">247</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-secondary-50 rounded-lg">
              <ModernIcon name="activity" className="w-6 h-6 text-secondary-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">This Month</p>
              <p className="text-2xl font-bold text-neutral-900">23</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-positive-50 rounded-lg">
              <ModernIcon name="check" className="w-6 h-6 text-positive-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Automated</p>
              <p className="text-2xl font-bold text-neutral-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-neutral-50 rounded-lg">
              <ModernIcon name="download" className="w-6 h-6 text-neutral-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Downloads</p>
              <p className="text-2xl font-bold text-neutral-900">1.2K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Report Templates</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTemplates.map((template) => (
            <ReportCard key={template.id} template={template} />
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Reports</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {[
            {
              name: 'Weekly Summary - Apple',
              type: 'PDF',
              size: '2.4 MB',
              generated: '2 hours ago',
              status: 'completed'
            },
            {
              name: 'Campaign Performance - Q4 Launch',
              type: 'CSV',
              size: '856 KB',
              generated: '1 day ago',
              status: 'completed'
            },
            {
              name: 'Competitive Analysis - Tech Sector',
              type: 'PDF',
              size: '4.1 MB',
              generated: '3 days ago',
              status: 'completed'
            }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <ModernIcon name="reports" className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{report.name}</h4>
                  <p className="text-sm text-neutral-600">{report.type} • {report.size} • {report.generated}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-positive-100 text-positive-800 rounded-full text-xs font-medium">
                  {report.status}
                </span>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200">
                  <ModernIcon name="download" className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
                </button>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200">
                  <ModernIcon name="share" className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseReports;