import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalPageTemplate from './LegalPageTemplate';

const CookiePolicy = () => {
  useEffect(() => {
    // Populate table of contents
    const toc = document.getElementById('table-of-contents');
    if (toc) {
      toc.innerHTML = `
        <a href="#what-are-cookies" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">1. What Are Cookies?</a>
        <a href="#types-of-cookies" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">2. Types of Cookies</a>
        <a href="#third-party-cookies" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">3. Third-Party Cookies</a>
        <a href="#managing-cookies" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">4. Managing Cookies</a>
        <a href="#cookie-consent" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">5. Cookie Consent</a>
        <a href="#data-retention" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">6. Data Retention</a>
        <a href="#contact-us" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">7. Contact Us</a>
      `;
    }
  }, []);

  return (
    <LegalPageTemplate 
      title="Cookie Policy" 
      effectiveDate="January 1, 2024"
      currentPage="cookies"
    >
      <p className="text-lg text-gray-700 mb-8">
        We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and provide personalized content on RageRadar.
      </p>

      <h2 id="what-are-cookies" className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 mb-8">
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide a better user experience.
            </p>

      <h2 id="types-of-cookies" className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
            
            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Essential Cookies</h3>
                <p className="text-blue-700 mb-3">Required for the website to function properly. Cannot be disabled.</p>
                <ul className="list-disc pl-6 text-blue-700">
                  <li>User authentication and login sessions</li>
                  <li>Security and fraud prevention</li>
                  <li>Basic site functionality</li>
                  <li>Load balancing and performance</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-3">Analytics Cookies</h3>
                <p className="text-green-700 mb-3">Help us understand how visitors use our website.</p>
                <ul className="list-disc pl-6 text-green-700">
                  <li>Page views and user interactions</li>
                  <li>Traffic sources and referrals</li>
                  <li>Feature usage and performance metrics</li>
                  <li>Error tracking and debugging</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-purple-800 mb-3">Preference Cookies</h3>
                <p className="text-purple-700 mb-3">Remember your settings and preferences.</p>
                <ul className="list-disc pl-6 text-purple-700">
                  <li>Language and region settings</li>
                  <li>Theme preferences (light/dark mode)</li>
                  <li>Dashboard layout customizations</li>
                  <li>Notification preferences</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-orange-800 mb-3">Marketing Cookies</h3>
                <p className="text-orange-700 mb-3">Used to deliver relevant advertisements and track campaign effectiveness.</p>
                <ul className="list-disc pl-6 text-orange-700">
                  <li>Targeted advertising</li>
                  <li>Social media integration</li>
                  <li>Campaign tracking</li>
                  <li>Conversion measurement</li>
                </ul>
              </div>
            </div>

      <h2 id="third-party-cookies" className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">We may use third-party services that set their own cookies:</p>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li><strong>Google Analytics:</strong> Website traffic analysis</li>
              <li><strong>Supabase:</strong> Authentication and database services</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Intercom:</strong> Customer support chat</li>
              <li><strong>Social Media Platforms:</strong> Sharing and login features</li>
            </ul>

      <h2 id="managing-cookies" className="text-2xl font-bold text-gray-900 mb-4">4. Managing Cookies</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
            <p className="text-gray-700 mb-4">You can control cookies through your browser settings:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Note:</h4>
              <p className="text-yellow-700">
                Disabling essential cookies may prevent RageRadar from functioning properly. Some features may not work as expected.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Opt-Out Options</h3>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-orange-600 hover:text-orange-700" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
              <li><strong>Do Not Track:</strong> We respect browser Do Not Track signals</li>
              <li><strong>Ad Blockers:</strong> Most ad blockers will prevent marketing cookies</li>
            </ul>

      <h2 id="cookie-consent" className="text-2xl font-bold text-gray-900 mb-4">5. Cookie Consent</h2>
      <p className="text-gray-700 mb-8">
        When you first visit RageRadar, we'll ask for your consent to use non-essential cookies. You can change your preferences at any time through our cookie banner or by contacting us.
      </p>

      <h2 id="data-retention" className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
        <li><strong>Persistent Cookies:</strong> Stored for up to 2 years</li>
        <li><strong>Analytics Data:</strong> Aggregated data retained for up to 26 months</li>
        <li><strong>Marketing Cookies:</strong> Typically expire after 30-90 days</li>
      </ul>

      <h2 id="contact-us" className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
      <div className="bg-gray-50 rounded-xl p-6">
        <p className="text-gray-700 mb-2">
          Questions about our use of cookies?
        </p>
        <p className="text-gray-900 font-semibold">Email: privacy@rageradar.com</p>
        <p className="text-gray-700">Response time: Within 48 hours</p>
      </div>
    </LegalPageTemplate>
  );
};

export default CookiePolicy;