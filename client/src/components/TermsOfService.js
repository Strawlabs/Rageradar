import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalPageTemplate from './LegalPageTemplate';

const TermsOfService = () => {
  useEffect(() => {
    // Populate table of contents
    const toc = document.getElementById('table-of-contents');
    if (toc) {
      toc.innerHTML = `
        <a href="#acceptance-of-terms" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">1. Acceptance of Terms</a>
        <a href="#use-of-service" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">2. Use of Service</a>
        <a href="#acceptable-use" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">3. Acceptable Use</a>
        <a href="#intellectual-property" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">4. Intellectual Property</a>
        <a href="#payment-terms" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">5. Payment Terms</a>
        <a href="#disclaimers" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">6. Disclaimers</a>
        <a href="#limitation-of-liability" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">7. Limitation of Liability</a>
        <a href="#termination" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">8. Termination</a>
        <a href="#governing-law" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">9. Governing Law</a>
        <a href="#contact-us" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">10. Contact Us</a>
      `;
    }
  }, []);

  return (
    <LegalPageTemplate 
      title="Terms of Service" 
      effectiveDate="January 1, 2024"
      currentPage="terms"
    >
      <p className="text-lg text-gray-700 mb-8">
        Welcome to RageRadar! By using our sentiment analysis services, you agree to these Terms of Service. Please read them carefully.
      </p>

      <h2 id="acceptance-of-terms" className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-8">
              By accessing or using RageRadar, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not use our services.
            </p>

      <h2 id="use-of-service" className="text-2xl font-bold text-gray-900 mb-4">2. Use of Service</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Eligibility</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>You must be at least 18 years old to use RageRadar</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>One person or entity per account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Responsibilities</h3>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
              <li>Provide accurate billing and contact information</li>
            </ul>

      <h2 id="acceptable-use" className="text-2xl font-bold text-gray-900 mb-4">3. Acceptable Use</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-red-800 mb-2">You agree NOT to:</h4>
              <ul className="list-disc pl-6 text-red-700">
                <li>Use RageRadar for any unlawful purposes</li>
                <li>Scrape, crawl, or misuse our platform</li>
                <li>Attempt to reverse-engineer our services</li>
                <li>Disrupt or interfere with our systems</li>
                <li>Share your account with others</li>
                <li>Use the service to harass or harm others</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
            <p className="text-gray-700 mb-4">RageRadar provides:</p>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li>AI-powered sentiment analysis across 27+ platforms</li>
              <li>Real-time monitoring and alerts</li>
              <li>Comprehensive reporting and analytics</li>
              <li>Brand reputation insights</li>
              <li>Competitive analysis tools</li>
            </ul>

      <h2 id="intellectual-property" className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Rights</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>RageRadar owns all service content, branding, and technology</li>
              <li>Our algorithms, software, and methodologies are proprietary</li>
              <li>You may not copy, modify, or distribute our intellectual property</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h3>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li>You retain ownership of any data you upload for analysis</li>
              <li>You grant us permission to process your data to provide services</li>
              <li>You can export your data at any time</li>
            </ul>

      <h2 id="payment-terms" className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>Subscription fees are billed in advance</li>
        <li>All fees are non-refundable unless required by law</li>
        <li>We may change pricing with 30 days notice</li>
        <li>Accounts may be suspended for non-payment</li>
        <li>Free trial terms are specified at signup</li>
      </ul>

      <h2 id="disclaimers" className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimers</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <ul className="list-disc pl-6 text-yellow-800">
                <li>RageRadar provides insights "as is" without warranties</li>
                <li>We do not guarantee accuracy of sentiment analysis</li>
                <li>Results should not be the sole basis for business decisions</li>
                <li>Public social media data may be incomplete or biased</li>
                <li>AI analysis may contain errors or limitations</li>
              </ul>
            </div>

      <h2 id="limitation-of-liability" className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
      <p className="text-gray-700 mb-4">
        To the maximum extent permitted by law:
      </p>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>RageRadar shall not be liable for indirect, incidental, or consequential damages</li>
        <li>Our total liability is limited to the fees paid in the last 12 months</li>
        <li>We are not responsible for third-party platform changes or outages</li>
        <li>You use our service at your own risk</li>
      </ul>

      <h2 id="termination" className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>You may cancel your account at any time</li>
        <li>We may terminate accounts for violations of these terms</li>
        <li>Upon termination, your access will cease immediately</li>
        <li>Data may be deleted after account closure</li>
      </ul>

      <h2 id="governing-law" className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
      <p className="text-gray-700 mb-8">
        These Terms are governed by the laws of Delaware, United States. Any disputes will be resolved in Delaware courts.
      </p>

      <h2 id="contact-us" className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
      <div className="bg-gray-50 rounded-xl p-6">
        <p className="text-gray-700 mb-2">
          Questions about these Terms of Service?
        </p>
        <p className="text-gray-900 font-semibold">Email: legal@rageradar.com</p>
        <p className="text-gray-700">Response time: Within 48 hours</p>
      </div>
    </LegalPageTemplate>
  );
};

export default TermsOfService;