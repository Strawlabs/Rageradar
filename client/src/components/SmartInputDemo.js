import React, { useState } from 'react';
import SmartInput from './SmartInput';

const SmartInputDemo = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userContext, setUserContext] = useState({
    industry: 'technology',
    recentBrands: [],
    preferences: ['innovation', 'growth']
  });

  const handleAnalyze = async (brand) => {
    console.log('Analyzing brand:', brand);
    
    // Simulate analysis
    setAnalysisResult({
      brand,
      sentiment: Math.floor(Math.random() * 100),
      trend: ['up', 'down', 'stable', 'volatile'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toLocaleTimeString(),
      contextualScore: Math.floor(Math.random() * 100)
    });
  };

  const handleBrandSelect = (suggestion) => {
    console.log('Brand selected:', suggestion);
    console.log('Contextual score:', suggestion.contextualScore);
  };

  const handleContextChange = (newContext) => {
    setUserContext(prev => ({ ...prev, ...newContext }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Smart Input Component Demo
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Contextual Brand Suggestions System
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✅ <strong>Smart contextual algorithm:</strong> Suggestions based on user context and industry trends</li>
            <li>✅ <strong>Visual trend indicators:</strong> Real-time sentiment scores and trend arrows</li>
            <li>✅ <strong>Limited suggestions:</strong> Maximum 4 suggestions to prevent choice paralysis</li>
            <li>✅ <strong>Smart ordering:</strong> Ranked by popularity, relevance, and recent news</li>
            <li>✅ <strong>Industry leadership:</strong> Crown icons for market leaders</li>
            <li>✅ <strong>Recent activity indicators:</strong> Blue dots for brands with recent news</li>
          </ul>
        </div>

        {/* Context Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            User Context Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry Focus
              </label>
              <select
                value={userContext.industry}
                onChange={(e) => handleContextChange({ industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="technology">Technology</option>
                <option value="automotive">Automotive</option>
                <option value="entertainment">Entertainment</option>
                <option value="retail">Retail</option>
                <option value="consumer-goods">Consumer Goods</option>
                <option value="food-service">Food Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recent Brands
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {userContext.recentBrands.join(', ')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Context
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Industry: {userContext.industry}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <SmartInput
            onAnalyze={handleAnalyze}
            onBrandSelect={handleBrandSelect}
            userContext={userContext}
            autoFocus={true}
          />
        </div>

        {analysisResult && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Analysis Result for "{analysisResult.brand}"
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analysisResult.sentiment}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Sentiment Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analysisResult.trend}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Trend Direction
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {analysisResult.contextualScore}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Contextual Relevance
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analysisResult.timestamp}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Analysis Time
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartInputDemo;