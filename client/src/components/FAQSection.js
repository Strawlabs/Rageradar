import React, { useState } from 'react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is RageRadar and how does it work?",
      answer: "RageRadar is an AI-powered sentiment analysis platform that monitors your brand across 27+ platforms including Reddit, Twitter, Product Hunt, Trustpilot, and more. It uses advanced Hugging Face AI models to detect emotions in real-time, providing you with actionable insights about how people feel about your brand."
    },
    {
      question: "Which platforms does RageRadar monitor?",
      answer: "RageRadar monitors 27+ platforms including social media (Reddit, Twitter, YouTube, Facebook, Instagram, TikTok), review sites (Trustpilot, Glassdoor, Amazon, Yelp, G2, Capterra), professional networks (Medium, Quora, Stack Overflow), job platforms (Indeed, AmbitionBox), app stores (Google Play, Apple App Store), and more."
    },
    {
      question: "How accurate is the sentiment analysis?",
      answer: "Our AI-powered emotion detection achieves 94% accuracy using state-of-the-art Hugging Face transformer models. The system analyzes context, sarcasm, and complex emotions beyond simple positive/negative classification, providing nuanced insights with confidence scores."
    },
    {
      question: "How long does it take to analyze a brand?",
      answer: "Initial brand analysis typically takes 2-5 minutes depending on the volume of mentions. Once set up, RageRadar continuously monitors your brand in real-time, with alerts delivered instantly when sentiment shifts occur."
    },
    {
      question: "What's included in the free trial?",
      answer: "The free 3-day trial includes 1 brand analysis with full access to our emotion dashboard, sentiment tracking, and platform analytics. You can see exactly how RageRadar works before committing to a paid plan."
    },
    {
      question: "Can I monitor multiple brands?",
      answer: "Yes! Our Starter plan includes 3 brands, Pro plan includes 10 brands, and Enterprise plan offers unlimited brand monitoring. You can track your own brand plus competitors for comprehensive market intelligence."
    },
    {
      question: "Do I need technical knowledge to use RageRadar?",
      answer: "No technical knowledge required! Simply enter your brand name or website URL, and RageRadar handles everything automatically. Our intuitive dashboard makes it easy to understand sentiment trends and take action."
    },
    {
      question: "How do real-time alerts work?",
      answer: "Pro and Enterprise plans include real-time Slack alerts that notify you when negative sentiment spikes occur. You can customize alert thresholds and channels to ensure you never miss critical brand mentions."
    },
    {
      question: "Can I export the data?",
      answer: "Yes! Pro and Enterprise plans include CSV export functionality, allowing you to download detailed reports with all mentions, sentiment scores, emotions, and platform data for further analysis or presentations."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We use enterprise-grade security with Firebase authentication and encryption. Your data is stored securely and never shared with third parties. We're fully GDPR compliant and take data privacy seriously."
    },
    {
      question: "What makes RageRadar different from other monitoring tools?",
      answer: "Unlike basic monitoring tools, RageRadar specializes in emotion detection and rage analysis. We don't just tell you what people are saying - we tell you how they feel and why. Our AI detects frustration, anger, and negative sentiment patterns before they escalate into major issues."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time with no penalties or fees. Your access continues until the end of your current billing period. We also offer a 30-day money-back guarantee if you're not satisfied."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Structured data for FAQ
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // Add structured data to page
  React.useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-structured-data';
    script.innerHTML = JSON.stringify(faqStructuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-structured-data');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/20" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 mb-8 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700 tracking-wide">FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Got Questions?
            <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              We've Got Answers
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about RageRadar and how it can help protect your brand
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-bold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6 pt-2">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-bold transition-colors"
          >
            Contact our support team
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
