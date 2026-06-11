import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfessionalLandingPage = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">RageRadar</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Pricing</a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">FAQ</a>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Sign In</Link>
                <Link to="/signup" className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Monitor Brand Sentiment
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Across 27+ Platforms
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered sentiment analysis that tracks what people really think about your brand across Reddit, Twitter, YouTube, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-6 py-3 border border-gray-300 rounded-lg text-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Link
                to="/signup"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all w-full sm:w-auto"
              >
                Start Free Trial
              </Link>
            </div>
            <p className="text-sm text-gray-500">Free 3-day trial • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to monitor brand sentiment
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology that goes beyond basic sentiment analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Platform Monitoring</h3>
              <p className="text-gray-600">Track sentiment across Reddit, Twitter, YouTube, Facebook, Instagram, TikTok, and 21+ more platforms.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Emotion Detection</h3>
              <p className="text-gray-600">Advanced neural networks detect complex emotions beyond basic positive/negative sentiment.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Alerts</h3>
              <p className="text-gray-600">Get instant notifications when sentiment shifts occur with customizable thresholds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">Simple 3-step process to understand your brand sentiment</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan</h3>
              <p className="text-gray-600">We continuously monitor 27+ platforms for mentions of your brand using advanced AI crawling technology.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyze</h3>
              <p className="text-gray-600">Our AI analyzes each mention for sentiment, emotion, and context to provide deep insights.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Alert</h3>
              <p className="text-gray-600">Get real-time alerts and beautiful dashboards to track sentiment trends and take action.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$19<span className="text-lg text-gray-600">/month</span></div>
              <ul className="text-gray-600 mb-8 space-y-2">
                <li>3 brands</li>
                <li>Basic sentiment analysis</li>
                <li>Email alerts</li>
                <li>7-day data history</li>
              </ul>
              <Link to="/signup" className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors block">
                Get Started
              </Link>
            </div>
            
            <div className="border-2 border-red-500 rounded-lg p-8 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$49<span className="text-lg text-gray-600">/month</span></div>
              <ul className="text-gray-600 mb-8 space-y-2">
                <li>10 brands</li>
                <li>Advanced AI analysis</li>
                <li>Slack & email alerts</li>
                <li>30-day data history</li>
                <li>Competitive analysis</li>
              </ul>
              <Link to="/signup" className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all block">
                Get Started
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">Custom</div>
              <ul className="text-gray-600 mb-8 space-y-2">
                <li>Unlimited brands</li>
                <li>Custom AI models</li>
                <li>API access</li>
                <li>Unlimited history</li>
                <li>Dedicated support</li>
              </ul>
              <Link to="/contact" className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors block">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What platforms do you monitor?</h3>
              <p className="text-gray-600">We monitor 27+ platforms including Reddit, Twitter, YouTube, Facebook, Instagram, TikTok, Trustpilot, Amazon reviews, and many more.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the sentiment analysis?</h3>
              <p className="text-gray-600">Our AI models achieve 94% accuracy in sentiment detection, using advanced neural networks trained on millions of social media posts and reviews.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer a free trial?</h3>
              <p className="text-gray-600">Yes, we offer a 3-day free trial with full access to all features. No credit card required to start.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to understand what people really think?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join hundreds of brands already using RageRadar to monitor their reputation.
          </p>
          <Link
            to="/signup"
            className="bg-white text-red-600 px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all inline-block"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="ml-2 text-xl font-bold">RageRadar</span>
              </div>
              <p className="text-gray-400">
                AI-powered sentiment analysis for modern brands.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link to="/signup" className="hover:text-white">Free Trial</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 RageRadar. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms</a>
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</a>
              <a href="/cookies" className="text-gray-400 hover:text-white text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalLandingPage;