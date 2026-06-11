import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from './shared/BrandLogo';
import { TrendingUp, TrendingDown, MessageSquare, BarChart3, X } from 'lucide-react';

const PreviewAnalysis = ({ brandName, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Dynamic data for preview - derived from brandName
  const getPreviewData = () => {
    const hash = brandName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const positive = 40 + (hash % 40);
    const negative = 5 + (hash % 15);
    const neutral = 100 - positive - negative;

    return {
      overallSentiment: {
        positive,
        neutral,
        negative
      },
      totalMentions: 500 + (hash % 5000),
      platforms: [
        { name: 'Reddit', mentions: 200 + (hash % 400), sentiment: 'positive' },
        { name: 'Twitter', mentions: 150 + (hash % 300), sentiment: 'neutral' },
        { name: 'Product Hunt', mentions: 100 + (hash % 200), sentiment: 'positive' },
        { name: 'Trustpilot', mentions: 50 + (hash % 100), sentiment: 'mixed' }
      ],
      sampleMentions: [
        {
          platform: 'Reddit',
          text: `Just tried ${brandName} and honestly impressed with the quality and attention to detail.Definitely recommend checking them out.`,
          sentiment: 'positive',
          score: 0.85
        },
        {
          platform: 'Twitter',
          text: `${brandName} customer service was slightly slow today, but the product itself is solid and does exactly what it says.`,
          sentiment: 'neutral',
          score: 0.1
        },
        {
          platform: 'Product Hunt',
          text: `${brandName} is absolutely revolutionizing this space! The new innovation they just dropped is a total game changer.`,
          sentiment: 'positive',
          score: 0.95
        }
      ]
    };
  };

  const previewData = getPreviewData();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <img
                src="/Rageradarlogo.png"
                alt="RageRadar"
                className="w-full h-full animate-spin"
                style={{ animationDuration: '2s' }}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Analyzing {brandName}...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Scanning social platforms for sentiment data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full mx-auto shadow-2xl border border-gray-200 dark:border-gray-700 mt-8 mb-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Brand Logo */}
            <div className="flex-shrink-0">
              <BrandLogo brandName={brandName} size="lg" />
            </div>

            {/* Brand Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {brandName} Sentiment Preview
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Limited preview • Sign up for full analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Overall Sentiment */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Overall Sentiment
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {previewData.overallSentiment.positive}%
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Positive</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {previewData.overallSentiment.neutral}%
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Neutral</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {previewData.overallSentiment.negative}%
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Negative</div>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Platform Breakdown
            </h3>
            <div className="space-y-3">
              {previewData.platforms.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                      {platform.name[0]}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">{platform.mentions}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">mentions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Mentions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sample Mentions
            </h3>
            <div className="space-y-3">
              {previewData.sampleMentions.map((mention, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {mention.platform}
                    </span>
                    <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${mention.sentiment === 'positive'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : mention.sentiment === 'negative'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      } `}>
                      {mention.sentiment}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{mention.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 text-center border border-red-200 dark:border-red-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Want the Full Analysis?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get detailed insights, emotion analysis, trending topics, and export capabilities
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                Sign Up for Full Report
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Already have an account?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewAnalysis;