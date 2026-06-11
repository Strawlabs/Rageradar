import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PreviewAnalysis from './PreviewAnalysis';
import SmartInput from './SmartInput';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringDesignElement, setIsHoveringDesignElement] = useState(false);
  const [previewBrand, setPreviewBrand] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const scrollRef = useRef(null);
  const mouseRef = useRef(null);

  // Check system preference on initial load and prevent auto-scroll
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Prevent any auto-scrolling behavior
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Disable smooth scrolling temporarily
      const originalScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Restore scroll behavior after a delay
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
      }, 100);
      
      // Prevent automatic focus on page load
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) {
        activeElement.blur();
      }
      
      // Temporarily disable tabindex on all focusable elements
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const originalTabIndexes = [];
      
      focusableElements.forEach((element, index) => {
        originalTabIndexes[index] = element.getAttribute('tabindex');
        element.setAttribute('tabindex', '-1');
      });
      
      // Restore tabindex after a delay
      setTimeout(() => {
        focusableElements.forEach((element, index) => {
          if (originalTabIndexes[index] !== null) {
            element.setAttribute('tabindex', originalTabIndexes[index]);
          } else {
            element.removeAttribute('tabindex');
          }
        });
      }, 1000);
      
      // Additional scroll resets at different intervals to catch any delayed scrolling
      setTimeout(() => {
        window.scrollTo(0, 0);
        // Remove focus from any focused element
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }
      }, 50);
      
      setTimeout(() => {
        window.scrollTo(0, 0);
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }
      }, 200);
      
      setTimeout(() => {
        window.scrollTo(0, 0);
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }
      }, 500);
    }
  }, []);

  // Handle scroll for morphing animation with debounce
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        clearTimeout(scrollRef.current);
      }

      scrollRef.current = setTimeout(() => {
        setScrollY(window.scrollY);
      }, 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (scrollRef.current) clearTimeout(scrollRef.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Track mouse position for magnetic effects with debounce
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (mouseRef.current) {
        clearTimeout(mouseRef.current);
      }

      mouseRef.current = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 10);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      if (mouseRef.current) clearTimeout(mouseRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Calculate morphing progress based on scroll
  const getShapeProgress = () => {
    if (typeof window === "undefined") return { borderRadius: "50%", rotation: "0deg" };

    const windowHeight = window.innerHeight;
    const totalScrollHeight = document.documentElement.scrollHeight - windowHeight;

    if (totalScrollHeight <= 0) return { borderRadius: "50%", rotation: "0deg" };

    // First transition: circle to square (0% to 40% of scroll)
    const firstTransition = Math.min(scrollY / (totalScrollHeight * 0.4), 1);

    // Second transition: square back to circle (60% to 100% of scroll)
    const secondTransitionStart = totalScrollHeight * 0.6;
    const secondTransition = Math.max(0, Math.min((scrollY - secondTransitionStart) / (totalScrollHeight * 0.4), 1));

    // Calculate border radius
    let borderRadius = "50%";
    if (secondTransition > 0) {
      borderRadius = `${secondTransition * 50}%`;
    } else {
      borderRadius = `${(1 - firstTransition) * 50}%`;
    }

    const rotation = `${firstTransition * 20 - secondTransition * 20}deg`;

    return { borderRadius, rotation };
  };

  const { borderRadius, rotation } = getShapeProgress();

  return (
    <div
      className={`landing-page min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white overflow-x-hidden relative transition-colors duration-500 ${
        isHoveringDesignElement ? "cursor-crosshair" : "cursor-default"
      }`}
    >
      {/* Custom CSS for enhanced UX */}
      <style jsx global>{`
        body {
          overflow-x: hidden;
        }
        
        ::selection {
          background: ${isDarkMode ? "rgba(239, 68, 68, 0.3)" : "rgba(220, 38, 38, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? "rgba(15, 23, 42, 0.1)" : "rgba(243, 244, 246, 0.5)"};
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(239, 68, 68, 0.3)" : "rgba(220, 38, 38, 0.3)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(239, 68, 68, 0.5)" : "rgba(220, 38, 38, 0.5)"};
        }

        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        
        .subtle-breathe {
          animation: subtle-breathe 6s ease-in-out infinite;
          will-change: transform;
        }

        .hw-accelerate {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

      {/* Artistic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full">
        <div className="absolute top-[10%] left-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-gradient-to-r from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 blur-3xl subtle-breathe" />
        <div
          className="absolute top-[40%] right-[10%] w-40 md:w-80 h-40 md:h-80 rounded-full bg-gradient-to-r from-pink-500/5 to-red-500/5 dark:from-pink-500/10 dark:to-red-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] w-36 md:w-72 h-36 md:h-72 rounded-full bg-gradient-to-r from-orange-500/5 to-yellow-500/5 dark:from-orange-500/10 dark:to-yellow-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Responsive Navigation */}
      <nav 
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md bg-white/10 dark:bg-black/30 rounded-full px-6 py-3 border border-white/20 dark:border-white/10 shadow-lg" 
        role="navigation" 
        aria-label="Main navigation"
      >
          <div className="flex items-center gap-4 md:gap-6">
            {/* Dark/Light mode toggle - temporarily hidden */}
            {false && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 group"
                aria-label="Toggle between light and dark theme"
              >
                <div className="group-hover:rotate-180 transition-transform duration-500">
                  {isDarkMode ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </div>
              </button>
            )}
            <a
              href="javascript:void(0)"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:block px-3 md:px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-xs md:text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
            >
              Features
            </a>
            <a
              href="javascript:void(0)"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden md:block px-3 md:px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-xs md:text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
            >
              Pricing
            </a>
            <a
              href="javascript:void(0)"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden lg:block px-3 md:px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-xs md:text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
            >
              How It Works
            </a>
            <Link
              to="/login"
              className="hidden sm:block px-3 md:px-4 py-2 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-xs md:text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 dark:from-red-500 dark:via-orange-500 dark:to-yellow-500 text-white text-xs md:text-sm font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Link>
          </div>
        </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Creative Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-8 md:px-12 lg:px-16 relative pt-20">
          {/* Morphing Circles/Squares */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] lg:w-[800px] h-[400px] md:h-[600px] lg:h-[800px] border border-gray-200 dark:border-white/5 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation})`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] lg:w-[600px] h-[300px] md:h-[450px] lg:h-[600px] border border-gray-200 dark:border-white/10 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `-${rotation}`})`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[300px] lg:w-[400px] h-[200px] md:h-[300px] lg:h-[400px] border border-gray-300 dark:border-white/20 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `${parseFloat(rotation) * 0.5}deg`})`,
            }}
          />

          <div className="max-w-7xl mx-auto text-center relative">
            {/* Title and Elephant Container */}
            <div className="flex items-center justify-center relative mb-8 md:mb-12">
              {/* Main heading */}
              <div className="relative z-10">
                <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] xl:text-[7rem] font-bold leading-none tracking-tighter group cursor-default text-center">
                  <span className="block text-gray-900 dark:text-white group-hover:tracking-wide transition-all duration-500">
                    Rage
                  </span>
                  <span className="block bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent group-hover:tracking-wide transition-all duration-500">
                    Radar
                  </span>
                </h1>
              </div>

              {/* Elephant logo - positioned right next to the heading */}
              <div className="absolute -right-2 md:right-2 lg:right-4 xl:right-6 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
                <div className="group">
                  <img 
                    src="/Rageradarlogo.png" 
                    alt="RageRadar Elephant Logo" 
                    className="w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72 object-contain transform transition-all duration-700 ease-out group-hover:rotate-12 group-hover:scale-110 opacity-90 hover:opacity-100"
                    style={{
                      transform: `rotate(-8deg) scale(1)`,
                      filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))'
                    }}
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 dark:from-red-500/30 dark:to-orange-500/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-2xl lg:text-3xl text-gray-700 dark:text-white/80 mb-8 md:mb-12 leading-relaxed font-light">
                From buzz to backlash — track emotional trends in real time.
              </p>

              {/* Smart Input Section */}
              <div className="mb-6">
                <SmartInput
                  onAnalyze={(brand) => {
                    setPreviewBrand(brand);
                    setShowPreview(true);
                  }}
                  onBrandSelect={(suggestion) => {
                    setPreviewBrand(suggestion.name);
                  }}
                  className="mb-4"

                />
              </div>
            </div>

            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <span className="relative z-10 flex items-center">
                Analyze Now
                <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Subtle glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            </Link>
          </div>
        </section>

        {/* Creative Showcase - Problem Section */}
        <section className="py-12 md:py-16 relative" aria-labelledby="problem-heading">
          <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16">
            <div className="flex flex-col">
              {/* Top Section - Heading */}
              <div className="text-center mb-8">
                <h2
                  id="problem-heading"
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 dark:text-white mb-4"
                >
                  Your brand is
                  <br />
                  <span className="text-orange-400 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    under watch.
                  </span>
                </h2>
                
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">
                  Are you listening?
                </p>
                
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
                  Every mention, every review, every social post shapes your reputation. Miss the emotional pulse, and you're reacting instead of responding. Track emotions in real time — from Reddit rants to viral tweets. Stay ahead.
                </p>
              </div>

              {/* Bottom Section - Elephant and Cards Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left - Worried Elephant Mascot */}
                <div className="flex justify-center">
                  <div className="relative group">
                    {/* Pulsing background animation */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 dark:from-red-500/30 dark:to-orange-500/30 blur-xl animate-pulse" />
                    <img 
                      src="/worried-elephant.png" 
                      alt="Worried Elephant" 
                      className="w-56 h-80 md:w-80 md:h-[30rem] lg:w-96 lg:h-[36rem] object-contain transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10"
                    />
                  </div>
                </div>

                {/* Right - Vertical Cards */}
                <div className="space-y-6">
                  {/* Customers Walking Away */}
                  <div className="bg-red-900/30 border-l-4 border-red-500 rounded-xl p-6 shadow-md transition-all duration-500 group hover:scale-[1.02] hover:shadow-xl hover:border-red-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Subtle glow animation */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse opacity-60" />
                    <div className="flex items-center gap-4 relative z-10">
                      <img 
                        src="/angry-icon.png" 
                        alt="Angry 😠" 
                        className="w-24 h-24 min-w-[96px] drop-shadow-md group-hover:rotate-12 transition-transform duration-500"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Customers Walking Away
                        </h3>
                        <p className="text-sm text-gray-300">
                          Frustrated users are venting on Reddit and Twitter. By the time you notice, they've already switched to competitors.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Reputation at Risk */}
                  <div className="bg-orange-900/30 border-l-4 border-orange-500 rounded-xl p-6 shadow-md transition-all duration-500 group hover:scale-[1.02] hover:shadow-xl hover:border-orange-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Subtle glow animation */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full animate-pulse opacity-60" />
                    <div className="flex items-center gap-4 relative z-10">
                      <img 
                        src="/scared-icon.svg" 
                        alt="Scared 😨" 
                        className="w-24 h-24 min-w-[96px] drop-shadow-md group-hover:rotate-12 transition-transform duration-500"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Brand Reputation at Risk
                        </h3>
                        <p className="text-sm text-gray-300">
                          One viral negative post can damage years of brand building. Monitor sentiment before it spirals out of control.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Critical Feedback Ignored */}
                  <div className="bg-yellow-800/30 border-l-4 border-yellow-400 rounded-xl p-6 shadow-md transition-all duration-500 group hover:scale-[1.02] hover:shadow-xl hover:border-yellow-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Subtle glow animation */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-500 rounded-full animate-pulse opacity-60" />
                    <div className="flex items-center gap-4 relative z-10">
                      <img 
                        src="/confused-icon.svg" 
                        alt="Confused 😕" 
                        className="w-24 h-24 min-w-[96px] drop-shadow-md group-hover:rotate-12 transition-transform duration-500"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Critical Feedback Ignored
                        </h3>
                        <p className="text-sm text-gray-300">
                          Game-changing insights are buried in thousands of posts. Without proper monitoring, you're missing opportunities to improve.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analyze & Act Section - Side by Side */}
        <section id="analyze-act" className="py-16 md:py-20 relative" aria-labelledby="analyze-act-heading">
          <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2
                id="analyze-act-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white"
              >
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Analyze
                </span>
                {" & "}
                <span className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                  Act
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed max-w-4xl mx-auto">
                From insight to action — understand emotions, then respond with precision
              </p>
            </div>

            {/* Side by Side Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              
              {/* ANALYZE Section */}
              <div className="relative group">
                {/* Background Glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-700/30 hover:border-blue-300/70 dark:hover:border-blue-600/50 transition-all duration-500">
                  
                  {/* Analyze Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-lg" />
                      <img 
                        src="/search-elephant.jpg" 
                        alt="Elephant analyzing data" 
                        className="w-16 h-16 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Analyze
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        Discover what people really feel
                      </p>
                    </div>
                  </div>

                  {/* Analyze Steps */}
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 group/item hover:scale-[1.02] transition-transform duration-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Multi-Platform Scanning
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          We crawl Reddit, Twitter, Product Hunt, Trustpilot, and more to find every mention of your brand.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group/item hover:scale-[1.02] transition-transform duration-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          AI Emotion Detection
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Advanced AI models analyze emotions beyond positive/negative — detecting anger, joy, frustration, and satisfaction.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group/item hover:scale-[1.02] transition-transform duration-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Visual Insights Dashboard
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Beautiful charts, sentiment trends, and word clouds that make complex data instantly understandable.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analyze CTA */}
                  <div className="mt-8 pt-6 border-t border-blue-200/50 dark:border-blue-700/30">
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Start Analyzing
                    </Link>
                  </div>
                </div>
              </div>

              {/* ACT Section */}
              <div className="relative group">
                {/* Background Glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 border border-orange-200/50 dark:border-orange-700/30 hover:border-orange-300/70 dark:hover:border-orange-600/50 transition-all duration-500">
                  
                  {/* Act Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 blur-lg" />
                      <img 
                        src="/alert-elephant.jpg" 
                        alt="Elephant taking action" 
                        className="w-16 h-16 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Act
                      </h3>
                      <p className="text-orange-600 dark:text-orange-400 font-medium">
                        Respond with precision and speed
                      </p>
                    </div>
                  </div>

                  {/* Act Steps */}
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 group/item hover:scale-[1.02] transition-transform duration-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Real-Time Alerts
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Get instant Slack notifications when negative sentiment spikes — catch issues before they become crises.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group/item hover:scale-[1.02] transition-transform duration-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Export & Share Insights
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Download CSV reports and share visual dashboards with your team to align on customer sentiment.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group/item hover:scale-[1.02] transition-transform duration-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Strategic Response
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Use emotional insights to improve products, adjust messaging, and engage customers at the right moment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Act CTA */}
                  <div className="mt-8 pt-6 border-t border-orange-200/50 dark:border-orange-700/30">
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Take Action Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Connection Visual */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 rounded-full px-8 py-4 border border-gray-200/50 dark:border-gray-700/30">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">Analyze</span>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-orange-600 dark:text-orange-400 font-semibold">Act</span>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-green-600 dark:text-green-400 font-semibold">Results</span>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                The complete workflow for emotional intelligence
              </p>
            </div>
          </div>
        </section>

        {/* Features Section - Superpowers Redesign */}
        <section id="features" className="py-16 md:py-20 relative" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16">
            {/* Hero Visual with Superhero Elephant */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-8">
              {/* Superhero Elephant */}
              <div className="relative group">
                {/* Ambient light/glow around mascot */}
                <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 dark:from-orange-500/30 dark:to-red-500/30 blur-3xl animate-pulse" />
                <img 
                  src="/superhero-elephant.png" 
                  alt="Superhero Elephant with R chest and cape" 
                  className="w-56 h-80 md:w-80 md:h-[30rem] lg:w-96 lg:h-[36rem] object-contain transform transition-all duration-700 group-hover:scale-110 relative z-10 drop-shadow-2xl"
                  style={{
                    animation: 'subtle-float 3s ease-in-out infinite'
                  }}
                />
              </div>

              {/* Heading and Subheading */}
              <div className="text-center lg:text-left">
                <h2
                  id="features-heading"
                  className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight text-gray-900 dark:text-white"
                >
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                    Superpowers
                  </span>{" "}
                  included
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6">
                  What can RageRadar do for you?
                </p>
                <p className="text-lg text-gray-700 dark:text-white/70 leading-relaxed max-w-2xl">
                  Everything you need to understand how your audience really feels across the internet.
                </p>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-16 items-stretch">
              {/* Multi-Platform Search */}
              <div className="group hover:scale-105 transition-all duration-500 cursor-pointer h-full">
                <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 rounded-3xl p-8 md:p-10 border border-red-200/50 dark:border-red-400/20 hover:border-red-400/70 dark:hover:border-red-400/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Elephant Icon */}
                  <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 w-36 h-36 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                      src="/search-elephant.jpg" 
                      alt="Elephant with magnifying glass" 
                      className="w-32 h-32 object-contain group-hover:scale-110 group-hover:bounce transition-all duration-500 relative z-10"
                    />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Multi-Platform Search
                  </h3>
                  <p className="text-gray-700 dark:text-white/70 leading-relaxed flex-1">
                    Automatically searches Reddit, Twitter, Product Hunt, Trustpilot, and more. Get comprehensive coverage of what people are saying.
                  </p>
                </div>
              </div>

              {/* AI Emotion Detection */}
              <div className="group hover:scale-105 transition-all duration-500 cursor-pointer h-full">
                <div className="bg-gradient-to-br from-orange-500/5 to-yellow-500/5 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-3xl p-8 md:p-10 border border-orange-200/50 dark:border-orange-400/20 hover:border-orange-400/70 dark:hover:border-orange-400/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Elephant Icon */}
                  <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 w-44 h-44 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                      src="/emotion-elephant.png" 
                      alt="Elephant with emotion bubbles" 
                      className="w-40 h-40 object-contain group-hover:scale-110 group-hover:bounce transition-all duration-500 relative z-10"
                    />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    AI Emotion Detection
                  </h3>
                  <p className="text-gray-700 dark:text-white/70 leading-relaxed flex-1">
                    Advanced AI models analyze emotions beyond just positive/negative. Detect anger, joy, frustration, satisfaction, and more.
                  </p>
                </div>
              </div>

              {/* Real-Time Alerts */}
              <div className="group hover:scale-105 transition-all duration-500 cursor-pointer h-full">
                <div className="bg-gradient-to-br from-yellow-500/5 to-red-500/5 dark:from-yellow-500/10 dark:to-red-500/10 rounded-3xl p-8 md:p-10 border border-yellow-200/50 dark:border-yellow-400/20 hover:border-yellow-400/70 dark:hover:border-yellow-400/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Elephant Icon */}
                  <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 w-36 h-36 rounded-full bg-gradient-to-r from-yellow-500/20 to-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                      src="/alert-elephant.jpg" 
                      alt="Elephant hitting alert bell" 
                      className="w-32 h-32 object-contain group-hover:scale-110 group-hover:bounce transition-all duration-500 relative z-10"
                    />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Real-Time Alerts
                  </h3>
                  <p className="text-gray-700 dark:text-white/70 leading-relaxed flex-1">
                    Get instant notifications when negative sentiment spikes. Never miss a crisis or opportunity to engage with your audience.
                  </p>
                </div>
              </div>

              {/* Visual Analytics */}
              <div className="group hover:scale-105 transition-all duration-500 cursor-pointer h-full">
                <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 rounded-3xl p-8 md:p-10 border border-red-200/50 dark:border-red-400/20 hover:border-red-400/70 dark:hover:border-red-400/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Elephant Icon */}
                  <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 w-48 h-48 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                      src="/analytics-elephant.png" 
                      alt="Elephant drawing on chart" 
                      className="w-44 h-44 object-contain group-hover:scale-110 group-hover:bounce transition-all duration-500 relative z-10"
                    />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Visual Analytics
                  </h3>
                  <p className="text-gray-700 dark:text-white/70 leading-relaxed flex-1">
                    Beautiful charts and insights that make complex sentiment data easy to understand and act upon.
                  </p>
                </div>
              </div>
            </div>


          </div>

          {/* Custom CSS for floating animation */}
          <style jsx>{`
            @keyframes subtle-float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </section>

        {/* Enhanced Pricing Section */}
        <section id="pricing" className="py-8 md:py-12 relative" aria-labelledby="pricing-heading">
          <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16">
            {/* Header with Pricing Elephant */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-12">
              {/* Pricing Elephant */}
              <div className="relative group">
                <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-r from-yellow-500/20 to-red-500/20 dark:from-yellow-500/30 dark:to-red-500/30 blur-xl animate-pulse" />
                <img 
                  src="/pricing-elephant.png" 
                  alt="Elephant with calculator" 
                  className="w-56 h-80 md:w-80 md:h-[30rem] lg:w-96 lg:h-[36rem] object-contain transform transition-all duration-700 group-hover:scale-110 group-hover:bounce relative z-10 drop-shadow-2xl"
                />
              </div>

              {/* Heading */}
              <div className="text-center lg:text-left">
                <h2
                  id="pricing-heading"
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-gray-900 dark:text-white"
                >
                  Simple{" "}
                  <span className="bg-gradient-to-r from-yellow-600 to-red-600 dark:from-yellow-400 dark:to-red-400 bg-clip-text text-transparent">
                    pricing
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-gray-700 dark:text-white/70 leading-relaxed max-w-2xl">
                  Start free, scale as you grow. No hidden fees, no surprises.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Loved by startups, marketers, and analysts.
                </p>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 mb-12">
              {/* Free Trial */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                  <div className="text-center flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Free Trial</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Perfect for testing</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">Free</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">/3 days</span>
                    </div>
                    <Link
                      to="/signup"
                      className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-2.5 px-4 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 block text-center text-sm"
                    >
                      Start Free
                    </Link>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500 mr-3 text-base">📊</span>
                      1 brand analysis
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-purple-500 mr-3 text-base">🎭</span>
                      Basic emotion insights
                    </li>
                  </ul>
                </div>
              </div>

              {/* Starter */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-200 to-orange-200 dark:from-red-800 dark:to-orange-800 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800 h-full flex flex-col">
                  <div className="text-center flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">For small businesses</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">$19</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">/month</span>
                    </div>
                    <Link
                      to="/signup"
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-red-700 hover:to-orange-700 transition-all duration-200 block text-center text-sm"
                    >
                      Unlock Insights
                    </Link>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500 mr-3 text-base">📊</span>
                      3 brand analyses
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-purple-500 mr-3 text-base">🎭</span>
                      Full emotion dashboard
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-3 text-base">🔍</span>
                      Multi-platform search
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pro - Best for Growth */}
              <div className="relative group mt-6 lg:mt-0">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                    Best for Growth
                  </span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 pt-8 shadow-xl border-2 border-orange-300 dark:border-orange-700 h-full flex flex-col">
                  <div className="text-center flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">For growing teams</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">$49</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">/month</span>
                    </div>
                    <Link
                      to="/signup"
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 block text-center shadow-lg text-sm"
                    >
                      Scale with Pro
                    </Link>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500 mr-3 text-base">📊</span>
                      10 brand analyses
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-red-500 mr-3 text-base">🚨</span>
                      Slack alerts
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-3 text-base">📤</span>
                      CSV exports
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-purple-500 mr-3 text-base">🎭</span>
                      Advanced emotions
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enterprise */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200 to-red-200 dark:from-yellow-800 dark:to-red-800 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-yellow-200 dark:border-yellow-800 h-full flex flex-col">
                  <div className="text-center flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">For large organizations</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">Custom</span>
                    </div>
                    <a
                      href="mailto:hello@rageradar.com"
                      className="w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-yellow-700 hover:to-red-700 transition-all duration-200 block text-center text-sm"
                    >
                      Talk to Experts
                    </a>
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500 mr-3 text-base">♾️</span>
                      Unlimited brands
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mr-3 text-base">🔌</span>
                      API access
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-yellow-500 mr-3 text-base">⚡</span>
                      Priority support
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-purple-500 mr-3 text-base">🎯</span>
                      Custom integrations
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure & Private
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>
        </section>

        {/* Modern Footer */}
        <footer className="py-12 md:py-16 relative">
          <div className="max-w-5xl mx-auto px-8 md:px-12 lg:px-16">
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Turn feedback into fuel. Know what your customers really feel.
                </h2>
                <p className="text-lg text-gray-700 dark:text-white/70 mb-6">
                  Join 100+ businesses already reading the emotional pulse of their customers.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 dark:from-red-500 dark:via-orange-500 dark:to-yellow-500 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analyze My Brand Now
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              
              <div className="border-t border-gray-200 dark:border-white/10 pt-8">
                {/* Social Media Icons */}
                <div className="flex justify-center items-center gap-6 mb-6">
                  <a 
                    href="https://twitter.com/rageradar" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-white/70 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                    aria-label="Follow us on Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://linkedin.com/company/rageradar" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-white/70 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    aria-label="Follow us on LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a 
                    href="mailto:hello@rageradar.com" 
                    className="text-gray-600 dark:text-white/70 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                    aria-label="Contact us via email"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                </div>

                <div className="flex justify-center items-center">
                  <p className="text-sm text-gray-500 dark:text-white/50">
                    © 2025 RageRadar. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Preview Analysis Modal */}
      {showPreview && (
        <PreviewAnalysis 
          brandName={previewBrand}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default LandingPage;