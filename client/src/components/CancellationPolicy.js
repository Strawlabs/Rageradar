import React, { useEffect } from 'react';
import LegalPageTemplate from './LegalPageTemplate';

const CancellationPolicy = () => {
  useEffect(() => {
    // Populate table of contents
    const toc = document.getElementById('table-of-contents');
    if (toc) {
      toc.innerHTML = `
        <a href="#cancellation-rights" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">1. Cancellation Rights</a>
        <a href="#how-to-cancel" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">2. How to Cancel</a>
        <a href="#refund-policy" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">3. Refund Policy</a>
        <a href="#data-retention" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">4. Data After Cancellation</a>
        <a href="#reactivation" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">5. Account Reactivation</a>
        <a href="#contact-us" class="block py-1 text-gray-600 hover:text-gray-900 transition-colors">6. Contact Us</a>
      `;
    }
  }, []);

  return (
    <LegalPageTemplate 
      title="Cancellation Policy" 
      effectiveDate="January 1, 2024"
      currentPage="cancellation"
    >
      <p className="text-lg text-gray-700 mb-8">
        At RageRadar, we want you to be completely satisfied with our sentiment analysis services. This Cancellation Policy explains your rights and options for canceling your subscription.
      </p>

      <h2 id="cancellation-rights" className="text-2xl font-bold text-gray-900 mb-4">1. Cancellation Rights</h2>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Free Trial</h3>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>Cancel anytime during your 3-day free trial</li>
        <li>No charges if canceled before trial ends</li>
        <li>Immediate access termination upon cancellation</li>
        <li>No cancellation fees or penalties</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mb-3">Paid Subscriptions</h3>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>Cancel your subscription at any time</li>
        <li>Access continues until the end of your current billing period</li>
        <li>No partial refunds for unused time within a billing period</li>
        <li>Automatic renewal stops after cancellation</li>
      </ul>

      <h2 id="how-to-cancel" className="text-2xl font-bold text-gray-900 mb-4">2. How to Cancel</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-blue-800 mb-3">Self-Service Cancellation</h4>
        <ol className="list-decimal pl-6 text-blue-700 space-y-2">
          <li>Log into your RageRadar account</li>
          <li>Go to Settings → Billing & Subscription</li>
          <li>Click "Cancel Subscription"</li>
          <li>Follow the confirmation steps</li>
          <li>You'll receive an email confirmation</li>
        </ol>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <h4 className="font-semibold text-gray-800 mb-3">Email Cancellation</h4>
        <p className="text-gray-700 mb-2">
          Alternatively, email us at: <strong>cancel@rageradar.com</strong>
        </p>
        <p className="text-gray-600 text-sm">
          Include your account email and reason for cancellation (optional)
        </p>
      </div>

      <h2 id="refund-policy" className="text-2xl font-bold text-gray-900 mb-4">3. Refund Policy</h2>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Standard Policy</h3>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>Subscriptions are generally non-refundable</li>
        <li>You retain access until the end of your billing period</li>
        <li>No prorated refunds for partial months</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mb-3">Exceptional Circumstances</h3>
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <p className="text-green-700 mb-3">We may consider refunds in these cases:</p>
        <ul className="list-disc pl-6 text-green-700">
          <li>Technical issues preventing service use for extended periods</li>
          <li>Billing errors or unauthorized charges</li>
          <li>Service not delivered as promised</li>
          <li>Duplicate charges</li>
        </ul>
        <p className="text-green-700 mt-3 text-sm">
          Contact <strong>billing@rageradar.com</strong> to request a refund review
        </p>
      </div>

      <h2 id="data-retention" className="text-2xl font-bold text-gray-900 mb-4">4. Data After Cancellation</h2>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Data</h3>
      <ul className="list-disc pl-6 mb-6 text-gray-700">
        <li>Account remains inactive for 30 days after cancellation</li>
        <li>You can reactivate within this period</li>
        <li>After 30 days, account data may be permanently deleted</li>
        <li>Export your data before canceling if needed</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 mb-3">Analysis Data</h3>
      <ul className="list-disc pl-6 mb-8 text-gray-700">
        <li>Historical reports and insights are deleted after 30 days</li>
        <li>Exported data remains yours to keep</li>
        <li>Anonymized analytics data may be retained for service improvement</li>
      </ul>

      <h2 id="reactivation" className="text-2xl font-bold text-gray-900 mb-4">5. Account Reactivation</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <h4 className="font-semibold text-yellow-800 mb-3">Within 30 Days</h4>
        <ul className="list-disc pl-6 text-yellow-700">
          <li>Full account restoration with all data</li>
          <li>Resume previous subscription plan</li>
          <li>No setup or reactivation fees</li>
          <li>Contact support for assistance</li>
        </ul>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
        <h4 className="font-semibold text-orange-800 mb-3">After 30 Days</h4>
        <ul className="list-disc pl-6 text-orange-700">
          <li>Create a new account</li>
          <li>Previous data cannot be recovered</li>
          <li>Start fresh with new analysis setup</li>
          <li>Eligible for new customer promotions</li>
        </ul>
      </div>

      <h2 id="contact-us" className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
      
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <p className="text-gray-700 mb-4">
          Need help with cancellation or have questions about this policy?
        </p>
        <div className="space-y-2">
          <p><strong>Cancellation Support:</strong> cancel@rageradar.com</p>
          <p><strong>Billing Questions:</strong> billing@rageradar.com</p>
          <p><strong>General Support:</strong> support@rageradar.com</p>
          <p><strong>Response Time:</strong> Within 24 hours</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 mb-2">We're Here to Help</h4>
        <p className="text-blue-700">
          Before canceling, consider reaching out to our support team. We may be able to address your concerns or find a solution that works better for your needs.
        </p>
      </div>
    </LegalPageTemplate>
  );
};

export default CancellationPolicy;