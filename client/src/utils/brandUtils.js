/**
 * Utility functions for brand name handling and formatting
 */

/**
 * Capitalizes brand names properly
 * @param {string} brandName - The brand name to capitalize
 * @returns {string} - Properly capitalized brand name
 */
export const capitalizeBrandName = (brandName) => {
  if (!brandName) return '';
  
  // Handle special cases for well-known brands
  const specialCases = {
    'netflix': 'Netflix',
    'apple': 'Apple',
    'google': 'Google',
    'microsoft': 'Microsoft',
    'amazon': 'Amazon',
    'facebook': 'Facebook',
    'meta': 'Meta',
    'twitter': 'Twitter',
    'x': 'X',
    'tesla': 'Tesla',
    'uber': 'Uber',
    'airbnb': 'Airbnb',
    'spotify': 'Spotify',
    'youtube': 'YouTube',
    'linkedin': 'LinkedIn',
    'instagram': 'Instagram',
    'tiktok': 'TikTok',
    'snapchat': 'Snapchat',
    'whatsapp': 'WhatsApp',
    'zoom': 'Zoom',
    'slack': 'Slack',
    'discord': 'Discord',
    'reddit': 'Reddit',
    'pinterest': 'Pinterest',
    'tumblr': 'Tumblr',
    'twitch': 'Twitch',
    'paypal': 'PayPal',
    'ebay': 'eBay',
    'walmart': 'Walmart',
    'target': 'Target',
    'bestbuy': 'Best Buy',
    'costco': 'Costco',
    'starbucks': 'Starbucks',
    'mcdonalds': "McDonald's",
    'kfc': 'KFC',
    'nike': 'Nike',
    'adidas': 'Adidas',
    'samsung': 'Samsung',
    'sony': 'Sony',
    'nintendo': 'Nintendo',
    'playstation': 'PlayStation',
    'xbox': 'Xbox',
    'coca-cola': 'Coca-Cola',
    'pepsi': 'Pepsi',
    'visa': 'Visa',
    'mastercard': 'Mastercard',
    'american express': 'American Express',
    'jp morgan': 'JP Morgan',
    'goldman sachs': 'Goldman Sachs',
    'wells fargo': 'Wells Fargo',
    'bank of america': 'Bank of America'
  };
  
  const lowerBrandName = brandName.toLowerCase().trim();
  
  // Check if it's a special case
  if (specialCases[lowerBrandName]) {
    return specialCases[lowerBrandName];
  }
  
  // For other brands, capitalize each word
  return brandName
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formats brand name for display in titles and headers
 * @param {string} brandName - The brand name to format
 * @returns {string} - Formatted brand name
 */
export const formatBrandNameForDisplay = (brandName) => {
  return capitalizeBrandName(brandName);
};

/**
 * Formats brand name for file names (removes special characters)
 * @param {string} brandName - The brand name to format
 * @returns {string} - File-safe brand name
 */
export const formatBrandNameForFile = (brandName) => {
  return capitalizeBrandName(brandName)
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_'); // Replace spaces with underscores
};