import React, { useState } from 'react';

const HelpCenter = ({ isOpen, onClose, context = 'general' }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickHelp, setShowQuickHelp] = useState(true);

  const helpSections = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          id: 'first-analysis',
          title: 'Running Your First Brand Analysis',
          content: `
            <h3>Welcome to RageRadar!</h3>
            <p>Follow these steps to analyze your first brand:</p>
            <ol>
              <li><strong>Enter Brand Name:</strong> Type your brand name or website URL in the search box</li>
              <li><strong>Click Analyze:</strong> Hit the "Analyze Brand" button to start the process</li>
              <li><strong>Wait for Results:</strong> The analysis takes 30-60 seconds to complete</li>
              <li><strong>Review Dashboard:</strong> Explore your sentiment metrics, emotions, and insights</li>
            </ol>
            <div class="bg-blue-50 p-4 rounded-lg mt-4">
              <p><strong>💡 Pro Tip:</strong> You can analyze competitors too! Just enter their brand name or website.</p>
            </div>
          `
        },
        {
          id: 'understanding-metrics',
          title: 'Understanding Your Sentiment Metrics',
          content: `
            <h3>Sentiment Score Breakdown</h3>
            <ul>
              <li><strong>80-100:</strong> 🟢 Excellent - Very positive sentiment</li>
              <li><strong>60-79:</strong> 🟡 Good - Mostly positive with some neutral</li>
              <li><strong>40-59:</strong> 🟠 Mixed - Balanced positive and negative</li>
              <li><strong>20-39:</strong> 🔴 Concerning - Mostly negative sentiment</li>
              <li><strong>0-19:</strong> 🚨 Critical - Very negative, needs immediate attention</li>
            </ul>
            <h3>Emotion Categories</h3>
            <p><strong>Positive:</strong> Joy, Satisfaction, Curiosity, Anticipation, Excitement</p>
            <p><strong>Negative:</strong> Anger, Sadness, Fear, Disgust, Frustration, Disappointment</p>
            <p><strong>Neutral:</strong> Indifferent, Neutral responses</p>
          `
        },
        {
          id: 'platform-coverage',
          title: 'Platform Coverage & Data Sources',
          content: `
            <h3>Where We Collect Data</h3>
            <p>RageRadar analyzes sentiment from these platforms:</p>
            <ul>
              <li><strong>Reddit:</strong> Community discussions and reviews</li>
              <li><strong>Twitter:</strong> Social media mentions and conversations</li>
              <li><strong>Product Hunt:</strong> Product launches and feedback</li>
              <li><strong>Trustpilot:</strong> Customer reviews and ratings</li>
              <li><strong>Google Reviews:</strong> Business reviews and ratings</li>
              <li><strong>App Stores:</strong> Mobile app reviews</li>
            </ul>
            <div class="bg-yellow-50 p-4 rounded-lg mt-4">
              <p><strong>⚠️ Note:</strong> Results depend on public mentions. New or niche brands may have limited data.</p>
            </div>
          `
        }
      ]
    },
    'features': {
      title: 'Features Guide',
      icon: '⚡',
      articles: [
        {
          id: 'dashboard-widgets',
          title: 'Dashboard Widgets Explained',
          content: `
            <h3>Main Dashboard Widgets</h3>
            <h4>📊 Sentiment Overview</h4>
            <p>Shows your overall sentiment score, trend direction, and key metrics at a glance.</p>
            
            <h4>🎯 Smart Insights</h4>
            <p>AI-powered recommendations based on your sentiment data:</p>
            <ul>
              <li>Actionable improvement suggestions</li>
              <li>Trend analysis and predictions</li>
              <li>Competitive positioning insights</li>
            </ul>
            
            <h4>📈 Emotion Breakdown</h4>
            <p>Detailed analysis of emotions detected in mentions:</p>
            <ul>
              <li>Emotion distribution charts</li>
              <li>Platform-specific emotion trends</li>
              <li>Most impactful emotional responses</li>
            </ul>
            
            <h4>🚨 Negative Posts Alert</h4>
            <p>Critical negative mentions that need immediate attention:</p>
            <ul>
              <li>High-impact negative posts</li>
              <li>Platform and source information</li>
              <li>Confidence scores for each mention</li>
            </ul>
          `
        },
        {
          id: 'real-time-monitoring',
          title: 'Real-Time Sentiment Monitoring',
          content: `
            <h3>Live Sentiment Tracking</h3>
            <p>Monitor your brand sentiment as it happens:</p>
            
            <h4>🔄 Auto-Refresh</h4>
            <p>Dashboard updates automatically every 15 minutes during active monitoring.</p>
            
            <h4>📱 Instant Alerts</h4>
            <p>Get notified when:</p>
            <ul>
              <li>Sentiment score drops significantly</li>
              <li>Negative mentions spike</li>
              <li>New critical issues are detected</li>
            </ul>
            
            <h4>📊 Trend Analysis</h4>
            <p>Track sentiment changes over time:</p>
            <ul>
              <li>7-day, 30-day, and 90-day trends</li>
              <li>Platform-specific performance</li>
              <li>Seasonal pattern recognition</li>
            </ul>
          `
        },
        {
          id: 'competitive-analysis',
          title: 'Competitive Analysis Features',
          content: `
            <h3>Compare Against Competitors</h3>
            <p>Analyze multiple brands to understand your market position:</p>
            
            <h4>📊 Side-by-Side Comparison</h4>
            <ul>
              <li>Sentiment score comparisons</li>
              <li>Emotion profile differences</li>
              <li>Platform performance analysis</li>
            </ul>
            
            <h4>🎯 Market Positioning</h4>
            <ul>
              <li>Industry sentiment benchmarks</li>
              <li>Competitive advantage identification</li>
              <li>Market opportunity analysis</li>
            </ul>
            
            <h4>📈 Trend Comparison</h4>
            <ul>
              <li>Historical performance vs competitors</li>
              <li>Market share sentiment analysis</li>
              <li>Emerging trend identification</li>
            </ul>
          `
        }
      ]
    },
    'troubleshooting': {
      title: 'Troubleshooting',
      icon: '🔧',
      articles: [
        {
          id: 'no-data-found',
          title: 'No Data Found for My Brand',
          content: `
            <h3>Why might this happen?</h3>
            <ul>
              <li><strong>New Brand:</strong> Very new brands may not have enough online mentions yet</li>
              <li><strong>Niche Market:</strong> Specialized B2B products may have limited public discussion</li>
              <li><strong>Spelling Variations:</strong> Try different variations of your brand name</li>
              <li><strong>Domain vs Brand Name:</strong> Try both your website URL and brand name</li>
            </ul>
            
            <h3>Solutions to Try</h3>
            <ol>
              <li><strong>Alternative Names:</strong> Try your company name, product names, or domain</li>
              <li><strong>Wait and Retry:</strong> Sometimes data takes time to index</li>
              <li><strong>Check Spelling:</strong> Ensure correct spelling and capitalization</li>
              <li><strong>Use Full Domain:</strong> Try "example.com" instead of just "example"</li>
            </ol>
            
            <div class="bg-blue-50 p-4 rounded-lg mt-4">
              <p><strong>💡 Still no results?</strong> Contact support with your brand details for manual review.</p>
            </div>
          `
        },
        {
          id: 'inaccurate-results',
          title: 'Results Seem Inaccurate',
          content: `
            <h3>Understanding AI Limitations</h3>
            <p>Our AI is highly accurate but not perfect. Here's what to know:</p>
            
            <h4>🎯 Accuracy Factors</h4>
            <ul>
              <li><strong>Context Matters:</strong> Sarcasm and complex context can be challenging</li>
              <li><strong>Mixed Emotions:</strong> Posts with multiple emotions may be simplified</li>
              <li><strong>Cultural Nuances:</strong> Regional expressions may be interpreted differently</li>
            </ul>
            
            <h4>📊 Confidence Scores</h4>
            <p>Each analysis includes confidence scores:</p>
            <ul>
              <li><strong>High (80%+):</strong> Very reliable results</li>
              <li><strong>Medium (60-79%):</strong> Generally accurate</li>
              <li><strong>Low (<60%):</strong> Take with caution, review manually</li>
            </ul>
            
            <h4>🔄 Improving Accuracy</h4>
            <ul>
              <li>Review individual posts for context</li>
              <li>Focus on high-confidence results</li>
              <li>Look at overall trends rather than individual posts</li>
            </ul>
          `
        },
        {
          id: 'slow-analysis',
          title: 'Analysis Taking Too Long',
          content: `
            <h3>Normal Processing Times</h3>
            <ul>
              <li><strong>Small Brands:</strong> 30-60 seconds</li>
              <li><strong>Popular Brands:</strong> 1-3 minutes</li>
              <li><strong>Very Popular Brands:</strong> 3-5 minutes</li>
            </ul>
            
            <h3>What Affects Speed?</h3>
            <ul>
              <li><strong>Data Volume:</strong> More mentions = longer processing</li>
              <li><strong>Platform Availability:</strong> Some platforms may be slower to respond</li>
              <li><strong>Server Load:</strong> Peak usage times may cause delays</li>
            </ul>
            
            <h3>If Analysis Fails</h3>
            <ol>
              <li><strong>Wait 5 minutes</strong> then try again</li>
              <li><strong>Check your internet connection</strong></li>
              <li><strong>Try a different brand name format</strong></li>
              <li><strong>Contact support</strong> if issues persist</li>
            </ol>
          `
        }
      ]
    },
    'api': {
      title: 'API & Integrations',
      icon: '🔌',
      articles: [
        {
          id: 'api-overview',
          title: 'API Overview',
          content: `
            <h3>RageRadar API</h3>
            <p>Integrate sentiment analysis into your applications:</p>
            
            <h4>🔑 Authentication</h4>
            <p>All API requests require authentication using your Firebase token:</p>
            <pre><code>Authorization: Bearer YOUR_FIREBASE_TOKEN</code></pre>
            
            <h4>📊 Available Endpoints</h4>
            <ul>
              <li><strong>POST /api/analyze</strong> - Analyze brand sentiment</li>
              <li><strong>GET /api/brands</strong> - List analyzed brands</li>
              <li><strong>GET /api/brands/:id</strong> - Get specific brand data</li>
              <li><strong>DELETE /api/brands/:id</strong> - Delete brand analysis</li>
            </ul>
            
            <h4>📝 Example Request</h4>
            <pre><code>
POST /api/analyze
{
  "brandName": "YourBrand"
}
            </code></pre>
          `
        },
        {
          id: 'webhook-setup',
          title: 'Webhook Integration',
          content: `
            <h3>Real-Time Notifications</h3>
            <p>Get instant notifications when sentiment changes:</p>
            
            <h4>🔔 Webhook Events</h4>
            <ul>
              <li><strong>sentiment.negative_spike</strong> - Negative sentiment increases significantly</li>
              <li><strong>sentiment.score_drop</strong> - Overall score drops below threshold</li>
              <li><strong>mention.critical</strong> - Critical negative mention detected</li>
            </ul>
            
            <h4>⚙️ Setup Process</h4>
            <ol>
              <li>Configure webhook URL in dashboard settings</li>
              <li>Choose which events to receive</li>
              <li>Test webhook with sample data</li>
              <li>Handle webhook payload in your application</li>
            </ol>
            
            <div class="bg-yellow-50 p-4 rounded-lg mt-4">
              <p><strong>🔒 Security:</strong> All webhooks are signed with HMAC-SHA256 for verification.</p>
            </div>
          `
        }
      ]
    },
    'billing': {
      title: 'Billing & Plans',
      icon: '💳',
      articles: [
        {
          id: 'plan-comparison',
          title: 'Plan Comparison',
          content: `
            <h3>Choose the Right Plan</h3>
            
            <h4>🆓 Free Trial</h4>
            <ul>
              <li>3 days access</li>
              <li>1 brand analysis</li>
              <li>Basic dashboard features</li>
              <li>Email support</li>
            </ul>
            
            <h4>🚀 Starter ($19/month)</h4>
            <ul>
              <li>3 brand analyses</li>
              <li>7-day data retention</li>
              <li>Basic alerts</li>
              <li>Email support</li>
            </ul>
            
            <h4>⚡ Pro ($49/month)</h4>
            <ul>
              <li>10 brand analyses</li>
              <li>30-day data retention</li>
              <li>Advanced insights</li>
              <li>Real-time monitoring</li>
              <li>API access</li>
              <li>Priority support</li>
            </ul>
            
            <h4>🏢 Enterprise (Custom)</h4>
            <ul>
              <li>Unlimited brands</li>
              <li>Custom data retention</li>
              <li>White-label options</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
            </ul>
          `
        },
        {
          id: 'billing-faq',
          title: 'Billing FAQ',
          content: `
            <h3>Common Billing Questions</h3>
            
            <h4>💳 Payment Methods</h4>
            <p>We accept all major credit cards and PayPal. Payments are processed securely through Stripe.</p>
            
            <h4>🔄 Billing Cycle</h4>
            <p>All plans are billed monthly on the date you subscribed. You can change or cancel anytime.</p>
            
            <h4>📊 Usage Limits</h4>
            <p>Brand limits reset monthly. Unused analyses don't roll over to the next month.</p>
            
            <h4>💰 Refunds</h4>
            <p>We offer full refunds within 7 days of purchase if you're not satisfied.</p>
            
            <h4>⬆️ Upgrades & Downgrades</h4>
            <p>Plan changes take effect immediately. Upgrades are prorated; downgrades apply at next billing cycle.</p>
            
            <div class="bg-green-50 p-4 rounded-lg mt-4">
              <p><strong>💡 Need Help?</strong> Contact our billing team at billing@rageradar.com</p>
            </div>
          `
        }
      ]
    }
  };

  const filteredSections = Object.entries(helpSections).reduce((acc, [key, section]) => {
    if (!searchQuery) {
      acc[key] = section;
    } else {
      const filteredArticles = section.articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredArticles.length > 0) {
        acc[key] = { ...section, articles: filteredArticles };
      }
    }
    return acc;
  }, {});

  // Quick help content for perpetual intermediates
  const quickHelpContent = {
    brand_input: {
      title: "Brand Analysis",
      items: [
        "Enter any brand name (Apple, Tesla, Netflix)",
        "Or use a website URL (apple.com, tesla.com)",
        "Analysis takes 30-60 seconds",
        "Results show sentiment from multiple platforms"
      ]
    },
    general: {
      title: "Quick Help",
      items: [
        "Enter brand names to analyze sentiment",
        "View results from Reddit, Twitter, and more",
        "Analysis typically completes in under a minute",
        "Recent analyses are saved for quick access"
      ]
    }
  };

  if (!isOpen) return null;

  // Show quick help for perpetual intermediates, full help center for detailed needs
  if (showQuickHelp && quickHelpContent[context]) {
    const quickContent = quickHelpContent[context];
    
    return (
      <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              {quickContent.title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 mb-6">
            {quickContent.items.map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item}</p>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowQuickHelp(false)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Need more help?
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help Center</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {Object.entries(filteredSections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSection === key
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{section.icon}</span>
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {section.articles.length} articles
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-8">
            {filteredSections[activeSection] && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl">{filteredSections[activeSection].icon}</span>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {filteredSections[activeSection].title}
                  </h1>
                </div>

                <div className="space-y-8">
                  {filteredSections[activeSection].articles.map((article) => (
                    <article key={article.id} className="border-b border-slate-200 dark:border-slate-700 pb-8 last:border-b-0">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                        {article.title}
                      </h2>
                      <div 
                        className="prose prose-slate dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Still need help? <a href="mailto:support@rageradar.com" className="text-red-600 dark:text-red-400 hover:underline">Contact Support</a>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;