/**
 * Centralized Brand Logo Service
 * Provides brand logos from multiple sources with intelligent fallbacks
 */

// Logo API providers (in order of preference)
const LOGO_PROVIDERS = {
    clearbit: (domain) => `https://logo.clearbit.com/${domain}`,
    brandfetch: (domain) => `https://api.brandfetch.io/v2/brands/${domain}`,
    google: (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
};

// Known brand domain mappings
const BRAND_DOMAINS = {
    'apple': 'apple.com',
    'google': 'google.com',
    'microsoft': 'microsoft.com',
    'amazon': 'amazon.com',
    'meta': 'meta.com',
    'facebook': 'facebook.com',
    'netflix': 'netflix.com',
    'tesla': 'tesla.com',
    'twitter': 'twitter.com',
    'x': 'x.com',
    'spotify': 'spotify.com',
    'uber': 'uber.com',
    'airbnb': 'airbnb.com',
    'nike': 'nike.com',
    'adidas': 'adidas.com',
    'coca-cola': 'coca-cola.com',
    'pepsi': 'pepsi.com',
    'starbucks': 'starbucks.com',
    'mcdonalds': 'mcdonalds.com',
    'walmart': 'walmart.com',
    'target': 'target.com',
    'samsung': 'samsung.com',
    'sony': 'sony.com',
    'intel': 'intel.com',
    'amd': 'amd.com',
    'nvidia': 'nvidia.com',
    'ibm': 'ibm.com',
    'oracle': 'oracle.com',
    'salesforce': 'salesforce.com',
    'adobe': 'adobe.com',
    'zoom': 'zoom.us',
    'slack': 'slack.com',
    'discord': 'discord.com',
    'reddit': 'reddit.com',
    'linkedin': 'linkedin.com',
    'tiktok': 'tiktok.com',
    'snapchat': 'snapchat.com',
    'pinterest': 'pinterest.com',
    'youtube': 'youtube.com',
    'instagram': 'instagram.com',
    'whatsapp': 'whatsapp.com',
    'telegram': 'telegram.org',
    'signal': 'signal.org',
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'bitbucket': 'bitbucket.org',
    'dropbox': 'dropbox.com',
    'box': 'box.com',
    'onedrive': 'microsoft.com',
    'gdrive': 'google.com',
    'icloud': 'icloud.com',
    'paypal': 'paypal.com',
    'stripe': 'stripe.com',
    'square': 'squareup.com',
    'venmo': 'venmo.com',
    'cashapp': 'cash.app',
    'coinbase': 'coinbase.com',
    'binance': 'binance.com',
    'robinhood': 'robinhood.com',
    'etsy': 'etsy.com',
    'ebay': 'ebay.com',
    'shopify': 'shopify.com',
    'wix': 'wix.com',
    'squarespace': 'squarespace.com',
    'wordpress': 'wordpress.com',
    'medium': 'medium.com',
    'substack': 'substack.com',
    'patreon': 'patreon.com',
    'twitch': 'twitch.tv',
    'vimeo': 'vimeo.com',
    'dailymotion': 'dailymotion.com',
    'hulu': 'hulu.com',
    'disney': 'disney.com',
    'hbo': 'hbo.com',
    'paramount': 'paramount.com',
    'peacock': 'peacock.com',
    'espn': 'espn.com',
    'cnn': 'cnn.com',
    'bbc': 'bbc.com',
    'nytimes': 'nytimes.com',
    'wsj': 'wsj.com',
    'forbes': 'forbes.com',
    'bloomberg': 'bloomberg.com',
    'reuters': 'reuters.com',
    'ap': 'apnews.com',
    'npr': 'npr.org',
    'booking': 'booking.com',
    'expedia': 'expedia.com',
    'trivago': 'trivago.com',
    'hotels': 'hotels.com',
    'marriott': 'marriott.com',
    'hilton': 'hilton.com',
    'hyatt': 'hyatt.com',
    'delta': 'delta.com',
    'united': 'united.com',
    'american': 'aa.com',
    'southwest': 'southwest.com',
    'jetblue': 'jetblue.com',
    'lyft': 'lyft.com',
    'doordash': 'doordash.com',
    'grubhub': 'grubhub.com',
    'ubereats': 'ubereats.com',
    'instacart': 'instacart.com',
    'whole foods': 'wholefoodsmarket.com',
    'trader joes': 'traderjoes.com',
    'costco': 'costco.com',
    'sams club': 'samsclub.com',
    'bestbuy': 'bestbuy.com',
    'home depot': 'homedepot.com',
    'lowes': 'lowes.com',
    'ikea': 'ikea.com',
    'wayfair': 'wayfair.com',
    'zara': 'zara.com',
    'h&m': 'hm.com',
    'uniqlo': 'uniqlo.com',
    'gap': 'gap.com',
    'old navy': 'oldnavy.com',
    'banana republic': 'bananarepublic.com',
    'lululemon': 'lululemon.com',
    'under armour': 'underarmour.com',
    'puma': 'puma.com',
    'reebok': 'reebok.com',
    'new balance': 'newbalance.com',
    'vans': 'vans.com',
    'converse': 'converse.com',
    'ford': 'ford.com',
    'gm': 'gm.com',
    'toyota': 'toyota.com',
    'honda': 'honda.com',
    'bmw': 'bmw.com',
    'mercedes': 'mercedes-benz.com',
    'audi': 'audi.com',
    'volkswagen': 'vw.com',
    'porsche': 'porsche.com',
    'ferrari': 'ferrari.com',
    'lamborghini': 'lamborghini.com',
    'rolls-royce': 'rolls-roycemotorcars.com',
    'bentley': 'bentleymotors.com',
    'maserati': 'maserati.com',
    'bugatti': 'bugatti.com',
};

// In-memory cache for logo URLs
const logoCache = new Map();

/**
 * Normalize brand name for lookup
 */
const normalizeBrandName = (brandName) => {
    if (!brandName) return '';
    return brandName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ');
};

/**
 * Get domain for a brand name
 */
const getBrandDomain = (brandName) => {
    const normalized = normalizeBrandName(brandName);

    // Check exact match
    if (BRAND_DOMAINS[normalized]) {
        return BRAND_DOMAINS[normalized];
    }

    // Check partial matches
    for (const [key, domain] of Object.entries(BRAND_DOMAINS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return domain;
        }
    }

    // Fallback: assume brand name is the domain
    return `${normalized.replace(/\s+/g, '')}.com`;
};

/**
 * Test if an image URL is accessible
 */
const testImageUrl = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const timeout = setTimeout(() => {
            resolve(false);
        }, 3000); // 3 second timeout

        img.onload = () => {
            clearTimeout(timeout);
            resolve(true);
        };

        img.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
        };

        img.src = url;
    });
};

/**
 * Fetch brand logo from multiple sources with fallbacks
 */
export const fetchBrandLogo = async (brandName) => {
    if (!brandName) return null;

    const normalized = normalizeBrandName(brandName);

    // Check cache first
    if (logoCache.has(normalized)) {
        return logoCache.get(normalized);
    }

    const domain = getBrandDomain(brandName);

    // Try providers in order
    const providers = [
        LOGO_PROVIDERS.clearbit(domain),
        LOGO_PROVIDERS.google(domain),
    ];

    for (const url of providers) {
        const isAccessible = await testImageUrl(url);
        if (isAccessible) {
            logoCache.set(normalized, url);
            return url;
        }
    }

    // All providers failed
    logoCache.set(normalized, null);
    return null;
};

/**
 * Get brand logo synchronously (returns cached or null)
 */
export const getBrandLogoSync = (brandName) => {
    if (!brandName) return null;
    const normalized = normalizeBrandName(brandName);
    return logoCache.get(normalized) || null;
};

/**
 * Preload logos for multiple brands
 */
export const preloadBrandLogos = async (brandNames) => {
    const promises = brandNames.map(name => fetchBrandLogo(name));
    await Promise.allSettled(promises);
};

/**
 * Clear logo cache
 */
export const clearLogoCache = () => {
    logoCache.clear();
};

/**
 * Get initials for brand name (fallback display)
 */
export const getBrandInitials = (brandName) => {
    if (!brandName) return '?';

    const words = brandName.trim().split(/\s+/);
    if (words.length === 1) {
        return brandName.charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get brand color based on name (for fallback backgrounds)
 */
export const getBrandColor = (brandName) => {
    if (!brandName) return '#6B7280'; // gray-500

    const colors = [
        '#EF4444', // red
        '#F59E0B', // amber
        '#10B981', // emerald
        '#3B82F6', // blue
        '#8B5CF6', // violet
        '#EC4899', // pink
        '#14B8A6', // teal
        '#F97316', // orange
    ];

    // Generate consistent color based on brand name
    let hash = 0;
    for (let i = 0; i < brandName.length; i++) {
        hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};
