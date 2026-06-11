import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LegalPageTemplate from './LegalPageTemplate';

const GDPRCompliance = () => {
  useEffect(() => {
    // Populate table of contents
    const toc = document.getElementById('table-of-contents');
    if (toc) {
      toc.innerHTML = `
        <a href="#your-gdpr-rights" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">1. Your GDPR Rights</a>
        <a href="#legal-basis" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">2. Legal Basis for Processing</a>
        <a href="#data-transfers" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">3. Data Transfers</a>
        <a href="#data-protection-officer" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">4. Data Protection Officer</a>
        <a href="#exercise-rights" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">5. How to Exercise Rights</a>
        <a href="#automated-decision-making" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">6. Automated Decision-Making</a>
        <a href="#supervisory-authority" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">7. Supervisory Authority</a>
        <a href="#contact-information" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">8. Contact Information</a>
      `;
    }
  }, []);

  return (
    <LegalPageTemplate 
      title="GDPR Compliance" 
      effectiveDate="Your Data Protection Rights Under EU Law"
      currentPage="gdpr"
    >
      <p className="text-lg text-gray-700 mb-8">
        RageRadar complies with the EU General Data Protection Regulation (GDPR). This page explains your rights and how we protect your personal data.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">🇪🇺 EU Residents</h3>
        <p className="text-blue-700">
          If you are located in the European Union, you have additional rights under GDPR. We are committed to protecting your privacy and ensuring compliance with EU data protection laws.
        </p>
      </div>

      <h2 id="your-gdpr-rights" className="text-2xl font-bold text-gray-900 mb-4">1. Your GDPR Rights</h2>
            
            <div className="space-y-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-3">Right of Access</h3>
                <p className="text-green-700 mb-3">You have the right to request a copy of your personal data.</p>
                <ul className="list-disc pl-6 text-green-700">
                  <li>What personal data we process</li>
                  <li>Why we process it</li>
                  <li>How long we keep it</li>
                  <li>Who we share it with</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-purple-800 mb-3">Right to Rectification</h3>
                <p className="text-purple-700 mb-3">You can request correction of inaccurate personal data.</p>
                <ul className="list-disc pl-6 text-purple-700">
                  <li>Update your profile information</li>
                  <li>Correct billing details</li>
                  <li>Fix contact information</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-3">Right to Erasure ("Right to be Forgotten")</h3>
                <p className="text-red-700 mb-3">You can request deletion of your personal data in certain circumstances.</p>
                <ul className="list-disc pl-6 text-red-700">
                  <li>When data is no longer necessary</li>
                  <li>When you withdraw consent</li>
                  <li>When data has been unlawfully processed</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-orange-800 mb-3">Right to Data Portability</h3>
                <p className="text-orange-700 mb-3">You can receive your personal data in a portable format.</p>
                <ul className="list-disc pl-6 text-orange-700">
                  <li>Machine-readable format (JSON, CSV)</li>
                  <li>Transfer to another service provider</li>
                  <li>Export your analysis data</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3">Right to Object</h3>
                <p className="text-yellow-700 mb-3">You can object to certain types of processing.</p>
                <ul className="list-disc pl-6 text-yellow-700">
                  <li>Direct marketing communications</li>
                  <li>Processing based on legitimate interests</li>
                  <li>Automated decision-making</li>
                </ul>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-indigo-800 mb-3">Right to Restrict Processing</h3>
                <p className="text-indigo-700 mb-3">You can request limitation of processing in certain situations.</p>
                <ul className="list-disc pl-6 text-indigo-700">
                  <li>While we verify data accuracy</li>
                  <li>When processing is unlawful</li>
                  <li>When you object to processing</li>
                </ul>
              </div>
            </div>

      <h2 id="legal-basis" className="text-2xl font-bold text-gray-900 mb-4">2. Legal Basis for Processing</h2>
            <p className="text-gray-700 mb-4">We process your personal data based on:</p>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li><strong>Contract:</strong> To provide our sentiment analysis services</li>
              <li><strong>Consent:</strong> For marketing communications and optional features</li>
              <li><strong>Legitimate Interest:</strong> For security, fraud prevention, and service improvement</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
            </ul>

      <h2 id="data-transfers" className="text-2xl font-bold text-gray-900 mb-4">3. Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              RageRadar is based in the United States. When you use our services, your data may be transferred to and processed in the US. We ensure adequate protection through:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions where applicable</li>
              <li>Strong technical and organizational measures</li>
              <li>Regular compliance assessments</li>
            </ul>

      <h2 id="data-protection-officer" className="text-2xl font-bold text-gray-900 mb-4">4. Data Protection Officer</h2>
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-gray-700 mb-2">
                For GDPR-related inquiries, contact our Data Protection Officer:
              </p>
              <p className="text-gray-900 font-semibold">Email: dpo@rageradar.com</p>
              <p className="text-gray-700">Response time: Within 72 hours</p>
            </div>

      <h2 id="exercise-rights" className="text-2xl font-bold text-gray-900 mb-4">5. How to Exercise Your Rights</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-blue-800 mb-3">To exercise any of your GDPR rights:</h4>
              <ol className="list-decimal pl-6 text-blue-700 space-y-2">
                <li>Send an email to <strong>gdpr@rageradar.com</strong></li>
                <li>Include your full name and email address</li>
                <li>Specify which right you want to exercise</li>
                <li>Provide any additional details if needed</li>
                <li>We will respond within 30 days</li>
              </ol>
            </div>

      <h2 id="automated-decision-making" className="text-2xl font-bold text-gray-900 mb-4">6. Automated Decision-Making</h2>
            <p className="text-gray-700 mb-8">
              RageRadar uses automated processing for sentiment analysis. This does not involve profiling or decisions that significantly affect you. Our AI analyzes public social media content to provide insights about brand sentiment.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Breach Notification</h2>
            <p className="text-gray-700 mb-8">
              In the unlikely event of a data breach that poses a high risk to your rights and freedoms, we will notify you within 72 hours of becoming aware of the breach, as required by GDPR.
            </p>

      <h2 id="supervisory-authority" className="text-2xl font-bold text-gray-900 mb-4">7. Supervisory Authority</h2>
            <p className="text-gray-700 mb-4">
              If you believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your local data protection authority:
            </p>
            <ul className="list-disc pl-6 mb-8 text-gray-700">
              <li><strong>Germany:</strong> Bundesbeauftragte für den Datenschutz und die Informationsfreiheit</li>
              <li><strong>France:</strong> Commission Nationale de l'Informatique et des Libertés (CNIL)</li>
              <li><strong>UK:</strong> Information Commissioner's Office (ICO)</li>
              <li><strong>Other EU countries:</strong> Your national data protection authority</li>
            </ul>

      <h2 id="contact-information" className="text-2xl font-bold text-gray-900 mb-4">8. Contact Information</h2>
      <div className="bg-gray-50 rounded-xl p-6">
        <p className="text-gray-700 mb-4">
          For any GDPR-related questions or to exercise your rights:
        </p>
        <div className="space-y-2">
          <p><strong>GDPR Requests:</strong> gdpr@rageradar.com</p>
          <p><strong>Data Protection Officer:</strong> dpo@rageradar.com</p>
          <p><strong>General Privacy:</strong> privacy@rageradar.com</p>
          <p><strong>Response Time:</strong> Within 30 days (72 hours for urgent matters)</p>
        </div>
      </div>
    </LegalPageTemplate>
  );
};

export default GDPRCompliance;