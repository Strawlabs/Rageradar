import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalPageTemplate from './LegalPageTemplate';

const PrivacyPolicy = () => {
  useEffect(() => {
    // Populate table of contents
    const toc = document.getElementById('table-of-contents');
    if (toc) {
      toc.innerHTML = `
        <a href="#information-we-collect" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">1. Information We Collect</a>
        <a href="#how-we-use-data" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">2. How We Use Your Data</a>
        <a href="#data-sharing" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">3. Data Sharing</a>
        <a href="#data-retention" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">4. Data Retention</a>
        <a href="#security" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">5. Security</a>
        <a href="#your-rights" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">6. Your Rights</a>
        <a href="#cookies" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">7. Cookies</a>
        <a href="#contact-us" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">8. Contact Us</a>
      `;
    }
  }, []);

  return (
    <LegalPageTemplate 
      title="Privacy Policy" 
      effectiveDate="January 1, 2024"
      currentPage="privacy"
    >
      <p className="text-lg text-gray-700 mb-8">
        RageRadar ("we," "our," "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website, dashboard, and sentiment analysis services.
      </p>

      <h2 id="information-we-collect" className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Data</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Name and email address</li>
              <li>Company name and details</li>
              <li>Login credentials (encrypted)</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Data</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Pages visited and features used</li>
              <li>Time spent on platform</li>
              <li>Error logs and performance data</li>
              <li>Device and browser information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Analysis Data</h3>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li>Brand names and keywords you monitor</li>
              <li>Public social media data we analyze</li>
              <li>Generated sentiment reports and insights</li>
            </ul>

      <h2 id="how-we-use-data" className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Data</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>To provide and improve our sentiment analysis services</li>
        <li>To send product updates and support responses</li>
        <li>To generate aggregate, anonymized analytics</li>
        <li>To detect and prevent fraud or abuse</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 id="data-sharing" className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <p className="text-green-800 font-semibold">We never sell your personal data.</p>
            </div>
            <p className="text-gray-700 mb-4">We may share data with:</p>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li><strong>Service Providers:</strong> Third-party vendors (hosting, analytics, email) who help us operate our services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
            </ul>

      <h2 id="data-retention" className="text-2xl font-bold text-gray-900 mb-4">4. Data Retention</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>We keep user data as long as your account is active</li>
        <li>You may request deletion of your data at any time</li>
        <li>Some data may be retained for legal or security purposes</li>
        <li>Anonymized analytics data may be retained indefinitely</li>
      </ul>

      <h2 id="security" className="text-2xl font-bold text-gray-900 mb-4">5. Security</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>Industry-standard SSL encryption for data in transit</li>
        <li>Encryption of sensitive data at rest</li>
        <li>Role-based access controls for our team</li>
        <li>Regular security audits and updates</li>
        <li>Secure data centers with physical access controls</li>
      </ul>

      <h2 id="your-rights" className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Correct:</strong> Update or correct inaccurate information</li>
        <li><strong>Delete:</strong> Request deletion of your personal data</li>
        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
        <li><strong>Portability:</strong> Receive your data in a portable format</li>
      </ul>

      <h2 id="cookies" className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
      <p className="text-gray-700 mb-8">
        We use cookies to enhance your experience. See our <Link to="/cookies" className="text-orange-600 hover:text-orange-700 font-semibold">Cookie Policy</Link> for details.
      </p>

      <h2 id="contact-us" className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
      <div className="bg-gray-50 rounded-xl p-6">
        <p className="text-gray-700 mb-2">
          If you have questions about this Privacy Policy or want to exercise your rights, contact us:
        </p>
        <p className="text-gray-900 font-semibold">Email: privacy@rageradar.com</p>
        <p className="text-gray-700">Response time: Within 48 hours</p>
      </div>
    </LegalPageTemplate>
  );
};

export default PrivacyPolicy;