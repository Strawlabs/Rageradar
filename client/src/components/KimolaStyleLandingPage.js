import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from './SEOHead';
import FAQSection from './FAQSection';

const KimolaStyleLandingPage = () => {
  const [previewBrand, setPreviewBrand] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simple scroll prevention
  useEffect(() => {
    // Just keep forcing scroll to top
    const forceTop = () => {
      window.scrollTo(0, 0);
    };

    // Force immediately and repeatedly
    forceTop();
    const interval = setInterval(forceTop, 10);

    // Stop after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Structured data for the landing page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://rageradar.com/#webpage",
    "url": "https://rageradar.com/",
    "name": "RageRadar - AI-Powered Brand Sentiment Analysis",
    "description": "Track brand sentiment across Reddit, Twitter, Product Hunt & 27+ platforms with AI emotion detection",
    "publisher": {
      "@type": "Organization",
      "name": "RageRadar",
      "@id": "https://rageradar.com/#organization"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://rageradar.com/"
        }
      ]
    }
  };

  return (
    <>
      <SEOHead 
        title="RageRadar - AI-Powered Brand Sentiment Analysis | Monitor 27+ Platforms"
        description="Track brand sentiment across Reddit, Twitter, Product Hunt & 27+ platforms with AI emotion detection. Real-time alerts, competitive analysis & visual dashboards. Start free trial today."
        keywords="brand sentiment analysis, social media monitoring, AI emotion detection, reputation management, sentiment tracking, brand monitoring tool, customer feedback analysis, social listening, competitive intelligence, rage detection"
        structuredData={structuredData}
      />

      <main className="min-h-screen bg-white">
        {/* Clean Modern Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100" role="navigation" aria-label="Main navigation">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3" aria-label="RageRadar Home">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm" aria-hidden="true">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900">RageRadar</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">How It Works</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">FAQ</a>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign In</Link>
                <Link to="/signup" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-gray-100" role="menu">
                <div className="flex flex-col space-y-4 pt-4">
                  <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)} role="menuitem">Features</a>
                  <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)} role="menuitem">How It Works</a>
                  <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)} role="menuitem">Pricing</a>
                  <a href="#faq" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)} role="menuitem">FAQ</a>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)} role="menuitem">Sign In</Link>
                  <Link to="/signup" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors" onClick={() => setMobileMenuOpen(false)} role="menuitem">
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Enhanced Hero Section */}
        <section className="pt-20 pb-20 px-6 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 relative overflow-hidden" aria-label="Hero section">
          {/* Enhanced Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="relative min-h-[600px] lg:min-h-[700px]">

              {/* Professional Elephant Mascot - Positioned Left */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 lg:left-16">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true"></div>
                  <img
                    src="/Rageradarlogo.png"
                    alt="RageRadar mascot - professional elephant representing brand sentiment monitoring and emotional intelligence"
                    className="w-80 h-80 lg:w-96 lg:h-96 object-contain relative z-10 group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                    width="384"
                    height="384"
                  />
                </div>
              </div>

              {/* Main Content - Positioned Right Near Mascot */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 lg:right-16 max-w-3xl text-left z-20">


                {/* RageRadar Title - Bigger Font */}
                <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 leading-none tracking-tight">
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                    RageRadar
                  </span>
                </h1>

                {/* Enhanced Tagline - Bigger Font */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-gray-700 mb-10 leading-relaxed">
                  <span className="text-gray-800 font-black">Spot the buzz before it bites</span>
                  <br />
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-bold">decode emotions as they happen</span>
                </h2>

                {/* Enhanced Search Interface */}
                <div className="mb-8">
                  <div className="relative max-w-lg">
                    <label htmlFor="brand-search" className="sr-only">Enter brand name to analyze</label>
                    <input
                      id="brand-search"
                      type="text"
                      placeholder="Enter a brand name: Apple, Tesla, Netflix..."
                      className="w-full px-6 py-3 text-base bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-300 text-left font-medium shadow-md text-gray-700 placeholder-gray-400 hover:shadow-lg"
                      value={previewBrand}
                      onChange={(e) => setPreviewBrand(e.target.value)}
                      aria-label="Brand name search input"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2" aria-hidden="true">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced CTA Button */}
                <div className="flex justify-start">
                  <Link
                    to="/signup"
                    className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl overflow-hidden"
                  >
                    <span className="relative z-10">Analyze My Brand Now</span>
                    <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Platform Icons */}
        <PlatformIcons />

        {/* Modern Features Section */}
        <ModernFeatures />

        {/* How It Works */}
        <HowItWorks />

        {/* Premium User Personas */}
        <UserPersonas />

        {/* Stunning Pricing */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final Premium CTA */}
        <FinalCTA />

        {/* Professional Footer */}
        <ProfessionalFooter />
      </main>
    </>
  );
};

// Enhanced Platform Icons Section - All 27+ Platforms
const PlatformIcons = () => {
  const allPlatforms = [
    // Social Media (6 platforms)
    { name: 'Reddit', icon: <RedditIcon />, color: '#FF4500' },
    { name: 'X (Twitter)', icon: <XIcon />, color: '#000000' },
    { name: 'YouTube', icon: <YoutubeIcon />, color: '#FF0000' },
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2' },
    { name: 'Instagram', icon: <InstagramIcon />, color: '#E4405F' },
    { name: 'TikTok', icon: <TikTokIcon />, color: '#000000' },

    // Review Platforms (8 platforms)
    { name: 'Trustpilot', icon: <TrustpilotIcon />, color: '#00B67A' },
    { name: 'Glassdoor', icon: <GlassdoorIcon />, color: '#0CAA41' },
    { name: 'Amazon', icon: <AmazonIcon />, color: '#FF9900' },
    { name: 'Yelp', icon: <YelpIcon />, color: '#FF1A1A' },
    { name: 'Sitejabber', icon: <SiteJabberIcon />, color: '#73A942' },
    { name: 'G2', icon: <G2Icon />, color: '#FF6D2D' },
    { name: 'Capterra', icon: <CapterraIcon />, color: '#FF6D2D' },
    { name: 'Gartner', icon: <GartnerIcon />, color: '#1F4F96' },

    // Professional (6 platforms)
    { name: 'Medium', icon: <MediumIcon />, color: '#000000' },
    { name: 'Quora', icon: <QuoraIcon />, color: '#B92B27' },
    { name: 'Stack Overflow', icon: <StackOverflowIcon />, color: '#F58025' },
    { name: 'TechCrunch', icon: <TechCrunchIcon />, color: '#0F9640' },
    { name: 'The Verge', icon: <TheVergeIcon />, color: '#FA4B2A' },
    { name: 'Hacker News', icon: <HackerNewsIcon />, color: '#FF6600' },

    // Job Platforms (2 platforms)
    { name: 'Indeed', icon: <IndeedIcon />, color: '#2557A7' },
    { name: 'AmbitionBox', icon: <AmbitionBoxIcon />, color: '#FF6B35' },

    // App Stores (2 platforms)
    { name: 'Google Play', icon: <GooglePlayIcon />, color: '#01875F' },
    { name: 'Apple App Store', icon: <AppStoreIcon />, color: '#007AFF' },

    // Local & Discovery (3 platforms)
    { name: 'Google Maps', icon: <GoogleMapsIcon />, color: '#4285F4' },
    { name: 'Product Hunt', icon: <ProductHuntIcon />, color: '#DA552F' },
    { name: 'Google Support', icon: <GoogleSupportIcon />, color: '#4285F4' }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 mb-8 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700 tracking-wide">MONITORING ACROSS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">27+</span>
            <span className="text-gray-900"> Platforms</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Real-time sentiment tracking across the web's most influential platforms and communities
          </p>
        </div>

        {/* Circular Layout with Typing Elephant in Center */}
        <div className="flex justify-center items-center mb-16">
          <div className="relative w-[800px] h-[800px] mx-auto">
            {/* Central Typing Elephant - Made Bigger */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <img
                src="/typing-elephant.png"
                alt="Typing Elephant"
                className="w-80 h-80 object-contain"
              />
            </div>

            {/* Platform Icons in Circle - Increased spacing */}
            {allPlatforms.map((platform, index) => {
              const angle = (index * 360) / allPlatforms.length;
              const radius = 320; // Increased from 280 to 320 for better spacing
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;

              return (
                <div
                  key={index}
                  className="absolute group"
                  style={{
                    left: `calc(50% + ${x}px - 32px)`, // Adjusted for slightly larger icons
                    top: `calc(50% + ${y}px - 32px)`,
                  }}
                  title={platform.name}
                >
                  <div
                    className="flex items-center justify-center rounded-xl hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                    style={{
                      backgroundColor: platform.color,
                      width: '64px', // Slightly larger icons
                      height: '64px'
                    }}
                  >
                    <div className="w-9 h-9 text-white">
                      {platform.icon}
                    </div>
                  </div>

                  {/* Simplified Tooltip - Always appears below icon */}
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-40 shadow-xl">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    {platform.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6l-4 4V8a2 2 0 012-2z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Social Media</h4>
            <p className="text-sm text-gray-600">6 platforms including Reddit, Twitter, YouTube</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Review Sites</h4>
            <p className="text-sm text-gray-600">8 platforms including Trustpilot, G2, Yelp</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Professional</h4>
            <p className="text-sm text-gray-600">6 platforms including Medium, Stack Overflow</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Apps & More</h4>
            <p className="text-sm text-gray-600">7 platforms including App Stores, Maps</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Premium SVG Icons
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const TrustpilotIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0l3.708 7.514L24 8.727l-6 5.845L19.416 24 12 20.229 4.584 24 6 14.572 0 8.727l8.292-1.213L12 0z" />
  </svg>
);

const AmazonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.608-4.544.608-2.295 0-4.508-.267-6.64-.798-2.122-.53-4.098-1.306-5.928-2.334-.075-.042-.12-.096-.15-.16-.03-.065-.03-.136 0-.204.03-.068.075-.122.15-.164zm21.391-1.106c-.287-.135-.658-.198-1.115-.198-.457 0-.854.063-1.191.198-.337.135-.506.324-.506.567 0 .243.169.432.506.567.337.135.734.198 1.191.198.457 0 .828-.063 1.115-.198.287-.135.43-.324.43-.567 0-.243-.143-.432-.43-.567zM8.055 10.76h6.89c.413 0 .75.336.75.75s-.337.75-.75.75H8.055c-.413 0-.75-.336-.75-.75s.337-.75.75-.75z" />
  </svg>
);

const MediumIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const ProductHuntIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M13.604 8.4h-3.405v3.2h3.405a1.6 1.6 0 1 0 0-3.2zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.803a4.4 4.4 0 1 1 0 8.4z" />
  </svg>
);

const GlassdoorIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6 18H6V6h12v12zm-8-10h4v8H10V8zm2 6c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
  </svg>
);

// Additional Platform Icons
const YelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0l3.708 7.514L24 8.727l-6 5.845L19.416 24 12 20.229 4.584 24 6 14.572 0 8.727l8.292-1.213L12 0z" />
  </svg>
);





const AppStoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GooglePlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202c1.308.742 1.308 2.815 0 3.594zM1.337 1.337c-.126.126-.207.324-.207.533v20.26c0 .209.081.407.207.533L12.532 12 1.337 1.337zm11.195 10.663l3.515 3.493-8.13 4.6c-.577.327-1.234.327-1.811 0L1.337 22.663zm0 0L1.337 1.337l4.77 2.7c.577-.327 1.234-.327 1.811 0l8.13 4.6-3.515 3.493z" />
  </svg>
);

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603 0 11.979 0z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const StackOverflowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154z" />
  </svg>
);

const QuoraIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12.738 18.701c-.831 0-1.595-.184-2.236-.504.504-.756.756-1.512.756-2.268 0-.756-.252-1.512-.756-2.268.641-.32 1.405-.504 2.236-.504.831 0 1.595.184 2.236.504-.504.756-.756 1.512-.756 2.268 0 .756.252 1.512.756 2.268-.641.32-1.405.504-2.236.504zm-8.738-6.701c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm13.131-4.158c1.132 0 2.054.922 2.054 2.054 0 1.132-.922 2.054-2.054 2.054s-2.054-.922-2.054-2.054c0-1.132.922-2.054 2.054-2.054zm-2.262 8.316c0-1.132.922-2.054 2.054-2.054s2.054.922 2.054 2.054-.922 2.054-2.054 2.054-2.054-.922-2.054-2.054z" />
  </svg>
);

const HackerNewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M0 24V0h24v24H0zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896h-1.88z" />
  </svg>
);

// Additional Platform Icons
const SlackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

const MastodonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z" />
  </svg>
);

// Additional Platform Icons for RageRadar Supported Platforms
const SiteJabberIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6 18H6V6h12v12zm-2-8H8v2h8v-2zm0 4H8v2h8v-2z" />
  </svg>
);

const G2Icon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 18.5h-11v-13h11v13zm-9-11h7v2h-7v-2zm0 3h7v2h-7v-2zm0 3h5v2h-5v-2z" />
  </svg>
);

const CapterraIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6 18H6V6h12v12zm-8-10h4v2H10V8zm0 3h6v2H10v-2zm0 3h4v2H10v-2z" />
  </svg>
);

const GartnerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5 17H7V7h10v10zm-8-8h6v2H9V9zm0 3h6v2H9v-2z" />
  </svg>
);

const TechCrunchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6 18H6V6h12v12zm-9-10h6v2H9V8zm0 3h6v2H9v-2zm0 3h4v2H9v-2z" />
  </svg>
);

const TheVergeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0L2 12l10 12 10-12L12 0zm0 3.5L19.5 12 12 20.5 4.5 12 12 3.5z" />
  </svg>
);

const IndeedIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z" />
  </svg>
);

const AmbitionBoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6 18H6V6h12v12zm-8-10h4v2H10V8zm0 3h6v2H10v-2zm0 3h4v2H10v-2z" />
  </svg>
);

const GoogleMapsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const GoogleSupportIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export default KimolaStyleLandingPage;

// Enhanced Features Section with Premium Design
const ModernFeatures = () => {
  const features = [
    {
      icon: <SearchIcon />,
      title: "Multi-Platform Intelligence",
      description: "Monitor 27+ platforms including Reddit, Twitter, YouTube, and more with advanced AI crawling technology.",
      benefits: ["Real-time data processing", "Comprehensive coverage", "Zero setup required"],
      iconBg: "bg-blue-500",
      superpower: "X-Ray Vision"
    },
    {
      icon: <BrainIcon />,
      title: "AI Emotion Detection",
      description: "Advanced neural networks analyze complex emotions, context, and sentiment nuances beyond basic positive/negative.",
      benefits: ["94% accuracy rate", "Context-aware analysis", "Emotion mapping"],
      iconBg: "bg-purple-500",
      superpower: "Mind Reading"
    },
    {
      icon: <LightningIcon />,
      title: "Real-Time Alerts",
      description: "Get instant notifications via Slack, email, or webhooks when sentiment shifts occur with customizable thresholds.",
      benefits: ["Instant notifications", "Custom thresholds", "Multiple channels"],
      iconBg: "bg-orange-500",
      superpower: "Lightning Speed"
    },
    {
      icon: <ChartIcon />,
      title: "Visual Analytics",
      description: "Beautiful, interactive dashboards with charts, trends, and insights that make complex data easy to understand.",
      benefits: ["Interactive dashboards", "Trend analysis", "Export capabilities"],
      iconBg: "bg-green-500",
      superpower: "Crystal Vision"
    },
    {
      icon: <TargetIcon />,
      title: "Competitive Intelligence",
      description: "Compare your brand sentiment against competitors and identify market opportunities and threats in real-time.",
      benefits: ["Competitor benchmarking", "Market insights", "Opportunity detection"],
      iconBg: "bg-red-500",
      superpower: "Eagle Eye"
    },
    {
      icon: <TrendIcon />,
      title: "Predictive Analytics",
      description: "Machine learning models predict sentiment trends and potential reputation risks before they become critical issues.",
      benefits: ["Trend prediction", "Risk assessment", "Proactive insights"],
      iconBg: "bg-indigo-500",
      superpower: "Future Sight"
    }
  ];

  return (
    <section id="features" className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header with Superhero Theme */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 mb-8 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700 tracking-wide">SUPERHERO POWERS</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Why Choose RageRadar?
            <br />
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              We're Your Brand's Superhero
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Just like a superhero protects the city, RageRadar protects your brand with powerful abilities that go beyond ordinary monitoring
          </p>
        </div>

        {/* Spacious Hero + Powers Layout */}
        <div className="space-y-20">

          {/* Central Superhero Elephant with Description */}
          <div className="text-center">
            <div className="relative inline-block">
              {/* Superhero Elephant */}
              <img
                src="/superhero-elephant.png"
                alt="RageRadar Superhero Elephant"
                className="w-96 h-96 object-contain relative z-10 mx-auto"
              />

              {/* Heroic Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>

              {/* Floating Power Badges */}
              <div className="absolute -top-8 -right-8 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                X-Ray Vision
              </div>
              <div className="absolute top-1/4 -left-12 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce delay-100">
                Mind Reading
              </div>
              <div className="absolute bottom-1/4 -right-12 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce delay-200">
                Lightning Speed
              </div>
              <div className="absolute -bottom-8 left-1/4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce delay-300">
                Crystal Vision
              </div>
            </div>

            {/* Central Description */}
            <div className="mt-12 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Meet Your Brand's Guardian</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Our AI-powered superhero elephant never sleeps, constantly watching over your brand across the digital universe,
                ready to alert you the moment something needs your attention.
              </p>
            </div>
          </div>

          {/* Spacious Powers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group relative">

                {/* Power Beam Connection to Center */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`w-1 h-8 bg-gradient-to-b ${feature.iconBg.replace('bg-', 'from-')} to-transparent opacity-60`}></div>
                  <div className={`w-3 h-3 ${feature.iconBg} rounded-full mx-auto animate-pulse`}></div>
                </div>

                {/* Feature Card */}
                <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">

                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.iconBg.replace('bg-', 'from-')}-50 to-white opacity-0 group-hover:opacity-15 transition-all duration-500 rounded-2xl`}></div>

                  <div className="relative z-10 text-center">
                    {/* Superpower Badge */}
                    <div className="flex items-center justify-center mb-6">
                      <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                        <div className="w-8 h-8 text-white">
                          {feature.icon}
                        </div>
                      </div>
                    </div>

                    {/* Superpower Name */}
                    <div className={`inline-block ${feature.iconBg} text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse`}>
                      {feature.superpower}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>

                    {/* Benefits List */}
                    <ul className="space-y-3 text-left">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                          <div className={`w-2 h-2 ${feature.iconBg} rounded-full animate-pulse`}></div>
                          <span className="font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action with Superhero Theme */}
        <div className="text-center mt-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Unleash Your Brand's Superhero?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of brands who trust RageRadar to protect their reputation with superhero-level monitoring and insights.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Activate Your Superhero
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Missing Icon Components
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const LightningIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M13 0L6 12h5l-1 12 7-12h-5l1-12z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M3 3v18h18M7 14l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M3 17l6-6 4 4 8-8M21 7v6h-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Enhanced How It Works Section - Scan, Sense, Solve
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Scan",
      subtitle: "Capture Every Signal That Matters",
      description: "RageRadar continuously scans trusted sources like social platforms, review sites, and community forums to collect the raw, unfiltered voice of your audience. From product reviews to event chatter, nothing slips through the cracks.",
      details: [
        "Pulls in product feedback, campaign reactions, and event comments",
        "No setup or training required — just enter your brand or event",
        "Captures hidden frustrations before they escalate"
      ],
      icon: (
        <img src="/search-elephant.jpg" alt="Search Elephant" className="w-full h-full object-contain" />
      ),
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      number: "02",
      title: "Sense",
      subtitle: "Understand the Why Behind Customer Reactions",
      description: "Cut through the noise and focus on what truly matters. RageRadar identifies the emotions and themes driving customer responses — whether it's frustration with a feature, excitement about a launch, or disappointment after an event.",
      details: [
        "Detects emotional spikes in real time",
        "Groups feedback into clear, recurring themes",
        "Surfaces the \"why\" behind feedback, not just the \"what\""
      ],
      icon: (
        <img src="/emotion-elephant.png" alt="Emotion Elephant" className="w-full h-full object-contain" />
      ),
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      number: "03",
      title: "Solve",
      subtitle: "Save 65% of Your Time on Feedback Analysis",
      description: "Turn insights into action — faster. RageRadar highlights the biggest sources of friction so you don't waste time manually sorting reviews or social chatter. Instead, get structured insights in a single view and act before frustrations snowball into bigger problems.",
      details: [
        "Prioritize fixes and responses in minutes, not days",
        "Save hours every week on manual review and reporting",
        "Prevent small frustrations from becoming major issues"
      ],
      icon: (
        <img src="/analytics-elephant.png" alt="Analytics Elephant" className="w-full h-full object-contain" />
      ),
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 mb-8 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700 tracking-wide">HOW IT WORKS</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            Scan, Sense, Solve
            <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Your Complete Sentiment Solution
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-4xl mx-auto leading-relaxed">
            From capturing every mention to actionable insights that save you 65% of your time
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}>
              {/* Content */}
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-3xl flex items-center justify-center shadow-xl`}>
                    <span className="text-2xl font-black text-white">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xl text-gray-600 font-medium">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  {step.description}
                </p>

                <ul className="space-y-4">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-4">
                      <div className={`w-6 h-6 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="flex-1 flex justify-center">
                <div className={`relative bg-gradient-to-br ${step.bgColor} rounded-3xl p-12 shadow-2xl border border-gray-200/50 max-w-md w-full`}>
                  <div className="flex justify-center mx-auto mb-8">
                    <div className={`${step.title === 'Scan' ? 'w-40 h-40' : 'w-48 h-48'} hover:scale-105 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h4>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${step.color} rounded-full`} style={{ width: '85%' }}></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${step.color} rounded-full`} style={{ width: '92%' }}></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${step.color} rounded-full`} style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className={`absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r ${step.color} rounded-full opacity-20`}></div>
                  <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r ${step.color} rounded-full opacity-10`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">Join hundreds of brands already using RageRadar to monitor their reputation.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Let's Start Scanning
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Enhanced User Personas Section
const UserPersonas = () => {
  const personas = [
    {
      title: "Marketing & PR Teams",
      subtitle: "Stay ahead of campaigns and events",
      description: "Real-time brand & campaign monitoring, rage spike detection during launches and live events, competitor & sentiment benchmarking.",
      features: ["Real-time brand & campaign monitoring", "Rage spike detection during launches", "Competitor & sentiment benchmarking"],
      quote: "Know instantly if your campaign sparks joy — or outrage.",
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      title: "Brand & Customer Experience Managers",
      subtitle: "Understand what frustrates customers the most",
      description: "Product feedback rage theme detection, service & support frustration monitoring, customer satisfaction trend analysis.",
      features: ["Product feedback rage theme detection", "Service & support frustration monitoring", "Customer satisfaction trend analysis"],
      quote: "Catch customer frustration before it becomes churn.",
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      title: "Product Managers & Startup Founders",
      subtitle: "Prioritize what to fix, fast",
      description: "Feature-level rage clustering from reviews and forums, beta & launch event reaction analysis, roadmap prioritization based on emotional impact.",
      features: ["Feature-level rage clustering", "Beta & launch event reaction analysis", "Roadmap prioritization based on emotional impact"],
      quote: "See what users hate, fix what matters most.",
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50"
    },
    {
      title: "Analysts & Investors",
      subtitle: "Add emotional intelligence to your research",
      description: "Track sentiment during earnings calls and leadership events, community frustration and rage mapping, early red flag detection for company health.",
      features: ["Sentiment during earnings calls", "Community frustration mapping", "Early red flag detection for company health"],
      quote: "Spot red flags in sentiment before they hit the numbers.",
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      title: "Agencies & Consultants",
      subtitle: "Deliver sharper insights for your clients",
      description: "White-label rage dashboards and reports, campaign & event validation for client presentations, emotion-driven competitive intelligence.",
      features: ["White-label rage dashboards", "Campaign & event validation", "Emotion-driven competitive intelligence"],
      quote: "Turn raw rage into insights your clients will love.",
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "from-indigo-500 to-blue-500",
      bgColor: "from-indigo-50 to-blue-50"
    },
    {
      title: "Enterprises",
      subtitle: "Scale emotional intelligence across global operations",
      description: "Rage detection across multiple brands and geographies, custom integrations with enterprise systems, secure, enterprise-wide emotion analytics.",
      features: ["Multi-brand & geography rage detection", "Custom enterprise integrations", "Secure enterprise-wide analytics"],
      quote: "Monitor customer rage at scale — across brands, markets, and regions.",
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-gray-600 to-gray-700",
      bgColor: "from-gray-50 to-gray-100"
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Modern Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Built for Teams
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Perfect for every team & use case
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From startups to Fortune 500 companies, RageRadar adapts to your team's unique needs
          </p>
        </div>

        {/* Modern Stacked Layout */}
        <div className="space-y-16">
          {personas.map((persona, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
            >
              {/* Content Side */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${persona.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <div className="w-8 h-8 text-white">
                      {persona.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {persona.title}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">
                      {persona.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">
                  {persona.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {persona.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-2 h-2 bg-gradient-to-r ${persona.color} rounded-full`}></div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-red-500">
                  <p className="text-gray-700 font-medium italic">
                    👉 "{persona.quote}"
                  </p>
                </div>
              </div>

              {/* Visual Side */}
              <div className="flex-shrink-0">
                <div className={`relative bg-gradient-to-br ${persona.bgColor} rounded-3xl p-8 w-80 h-64 flex items-center justify-center`}>
                  <div className={`w-24 h-24 bg-gradient-to-r ${persona.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                    <div className="w-12 h-12 text-white">
                      {persona.icon}
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${persona.color} rounded-full opacity-20`}></div>
                  <div className={`absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r ${persona.color} rounded-full opacity-10`}></div>
                  <div className={`absolute top-1/2 left-4 w-4 h-4 bg-gradient-to-r ${persona.color} rounded-full opacity-30`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">Join hundreds of brands already using RageRadar to monitor their reputation.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Search for your usecase
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Enhanced Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Free Trial",
      price: "0",
      period: "3 days",
      description: "Try RageRadar risk-free",
      features: [
        "1 brand monitoring",
        "27+ platform monitoring",
        "AI emotion detection",
        "Basic sentiment analysis",
        "Email alerts",
        "3-day data history"
      ],
      cta: "Start Free Trial",
      popular: false,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-white",
      borderColor: "border-gray-200"
    },
    {
      name: "Starter",
      price: "19",
      period: "month",
      description: "Perfect for small businesses and startups",
      features: [
        "3 brands monitoring",
        "27+ platform monitoring",
        "AI emotion detection",
        "Real-time alerts",
        "Rage spike detection",
        "Basic competitive analysis",
        "Email & Slack alerts",
        "7-day data history"
      ],
      cta: "Get Started",
      popular: false,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-white",
      borderColor: "border-gray-200"
    },
    {
      name: "Pro",
      price: "49",
      period: "month",
      description: "Most popular for growing companies",
      features: [
        "10 brands monitoring",
        "27+ platform monitoring",
        "Advanced AI emotion detection",
        "Predictive analytics",
        "Competitive intelligence",
        "Visual analytics & dashboards",
        "Slack & email alerts",
        "30-day data history",
        "CSV export",
        "Priority support"
      ],
      cta: "Get Started",
      popular: true,
      color: "from-red-500 via-orange-500 to-yellow-500",
      bgColor: "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50",
      borderColor: "border-orange-300"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with custom needs",
      features: [
        "Unlimited brands",
        "Multi-geography monitoring",
        "Custom AI models",
        "White-label dashboards",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "On-premise option",
        "Advanced security"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-white",
      borderColor: "border-gray-200"
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 mb-8 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-700 tracking-wide">SIMPLE PRICING</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            Choose Your
            <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-light max-w-4xl mx-auto leading-relaxed">
            Start with our free trial and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative ${plan.bgColor} ${plan.borderColor} border-2 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${plan.popular ? 'ring-4 ring-orange-200 shadow-2xl scale-105' : 'shadow-lg'
                }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  {plan.price === "Custom" ? (
                    <div className="text-4xl font-black text-gray-900">Custom</div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-black text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  to={plan.cta === "Contact Sales" ? "/contact" : "/signup"}
                  className={`w-full inline-block py-4 px-6 rounded-2xl font-bold text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${plan.popular
                    ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-center mb-4">Everything included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className={`w-5 h-5 bg-gradient-to-r ${plan.popular ? 'from-red-500 to-orange-500' : 'from-green-500 to-green-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Clean Trust Indicators */}
        <div className="text-center mt-16">
          <div className="flex flex-wrap justify-center items-center gap-8 mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">3-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            All plans include our core sentiment analysis features. Upgrade or downgrade at any time as your needs change.
          </p>
        </div>
      </div>
    </section>
  );
};

// Enhanced Final CTA Section
const FinalCTA = () => (
  <section className="py-16 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10"></div>
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

    <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
          Ready to Understand What People
          <span className="block">Really Think About Your Brand?</span>
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
          Join hundreds of brands already using RageRadar to monitor their reputation and stay ahead of sentiment shifts.
        </p>

        <div className="flex justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Let's Start Scanning
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// Professional Footer Component
const ProfessionalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6">
          {/* Company Info - Takes up more space */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <span className="text-xl font-black">RageRadar</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed text-sm max-w-md">
              AI-powered sentiment analysis that helps brands understand what people really think across 27+ platforms.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links - Compact column */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold mb-4 text-white">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm block py-1">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm block py-1">Pricing</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm block py-1">How It Works</a></li>
            </ul>
          </div>

          {/* Support Links - Compact column */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors text-sm block py-1">Documentation</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors text-sm block py-1">Blog</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors text-sm block py-1">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-400 text-xs">
                © {currentYear} RageRadar, Inc. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
                <Link to="/cancellation" className="text-gray-400 hover:text-white transition-colors">Cancellation Policy</Link>
                <Link to="/gdpr" className="text-gray-400 hover:text-white transition-colors">GDPR</Link>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};