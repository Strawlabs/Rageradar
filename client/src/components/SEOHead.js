import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title = "RageRadar - AI-Powered Brand Sentiment Analysis | Monitor 27+ Platforms",
  description = "Track brand sentiment across Reddit, Twitter, Product Hunt & 27+ platforms with AI emotion detection. Real-time alerts, competitive analysis & visual dashboards.",
  keywords = "brand sentiment analysis, social media monitoring, AI emotion detection, reputation management",
  ogImage = "https://rageradar.com/og-image.png",
  canonical = null,
  structuredData = null
}) => {
  const location = useLocation();
  const currentUrl = `https://rageradar.com${location.pathname}`;
  const canonicalUrl = canonical || currentUrl;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', currentUrl);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'twitter:title', title);
    updateMetaTag('property', 'twitter:description', description);
    updateMetaTag('property', 'twitter:image', ogImage);

    // Update canonical link
    updateCanonicalLink(canonicalUrl);

    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    }
  }, [title, description, keywords, ogImage, currentUrl, canonicalUrl, structuredData]);

  return null;
};

// Helper function to update meta tags
const updateMetaTag = (attribute, key, content) => {
  if (!content) return;
  
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

// Helper function to update canonical link
const updateCanonicalLink = (url) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (link) {
    link.setAttribute('href', url);
  } else {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
};

// Helper function to add structured data
const addStructuredData = (data) => {
  const scriptId = 'structured-data-script';
  let script = document.getElementById(scriptId);
  
  if (script) {
    script.innerHTML = JSON.stringify(data);
  } else {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);
  }
};

export default SEOHead;
