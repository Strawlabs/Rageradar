import React from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  const docSections = [
    {
      title: "Getting Started",
      description: "Learn the basics of RageRadar sentiment analysis",
      articles: [
        { title: "Quick Start Guide", href: "#quick-start", time: "5 min read" },
        { title: "Setting Up Your First Brand", href: "#setup-brand", time: "3 min read" },
        { title: "Understanding Sentiment Scores", href: "#sentiment-scores", time: "7 min read" },
        { title: "Platform Coverage Overview", href: "#platform-coverage", time: "4 min read" }
      ]
    },
    {
      title: "Features & Tools",
      description: "Deep dive into RageRadar's powerful features",
      articles: [
        { title: "Real-time Monitoring", href: "#real-time", time: "6 min read" },
        { title: "AI Emotion Detection", href: "#emotion-detection", time: "8 min read" },
        { title: "Competitive Analysis", href: "#competitive", time: "10 min read" },
        { title: "Custom Alerts & Notifications", href: "#alerts", time: "5 min read" }
      ]
    },
    {
      title: "Reports & Analytics",
      description: "Generate insights and export your data",
      articles: [
        { title: "Creating Custom Reports", href: "#custom-reports", time: "12 min read" },
        { title: "Data Export Options", href: "#data-export", time: "4 min read" },
        { title: "Trend Analysis", href: "#trend-analysis", time: "9 min read" },
        { title: "Sharing & Collaboration", href: "#sharing", time: "6 min read" }
      ]
    },
    {
      title: "API & Integrations",
      description: "Connect RageRadar with your existing tools",
      articles: [
        { title: "API Authentication", href: "#api-auth", time: "8 min read" },
        { title: "Webhook Setup", href: "#webhooks", time: "10 min read" },
        { title: "Slack Integration", href: "#slack", time: "5 min read" },
        { title: "Third-party Connectors", href: "#connectors", time: "7 min read" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block group mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <span className="text-2xl font-black text-gray-900">RageRadar</span>
            </div>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using RageRadar for sentiment analysis and brand monitoring
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full px-6 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-500"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {docSections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600">{section.description}</p>
              </div>
              
              <div className="space-y-4">
                {section.articles.map((article, articleIndex) => (
                  <a
                    key={articleIndex}
                    href={article.href}
                    className="block p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{article.time}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/support" className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 text-sm">Get help from our team</p>
            </Link>

            <Link to="/blog" className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Blog & Updates</h3>
              <p className="text-gray-600 text-sm">Latest news and insights</p>
            </Link>

            <a href="#api" className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">API Reference</h3>
              <p className="text-gray-600 text-sm">Technical documentation</p>
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Documentation;