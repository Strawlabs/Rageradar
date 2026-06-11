import React, { useState, useEffect } from 'react';

const AnalysisLoading = ({ brandName = "your brand" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logoRotation, setLogoRotation] = useState(0);
  const [scanningPlatforms, setScanningPlatforms] = useState([]);

  const steps = [
    { 
      name: "Searching", 
      description: `Finding mentions of ${brandName} across the web`, 
      duration: 2000,
      detail: "Scanning Reddit, Twitter, forums, and review sites..."
    },
    { 
      name: "Processing", 
      description: "AI analyzing sentiment and emotions", 
      duration: 2500,
      detail: "Understanding context, tone, and customer feelings..."
    },
    { 
      name: "Insights", 
      description: "Generating actionable insights", 
      duration: 1500,
      detail: "Identifying trends, issues, and opportunities..."
    }
  ];

  const platforms = [
    { name: "Reddit", icon: "🔴", delay: 0 },
    { name: "Twitter", icon: "🐦", delay: 500 },
    { name: "Product Hunt", icon: "🚀", delay: 1000 },
    { name: "Trustpilot", icon: "⭐", delay: 1500 },
    { name: "Google Reviews", icon: "🌟", delay: 2000 }
  ];

  // Progress through steps
  useEffect(() => {
    let totalTime = 0;
    const timeouts = [];

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index);
        setProgress((index / (steps.length - 1)) * 100);
      }, totalTime);
      timeouts.push(timeout);
      totalTime += step.duration;
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Animate scanning platforms
  useEffect(() => {
    if (currentStep === 1) {
      platforms.forEach((platform, index) => {
        setTimeout(() => {
          setScanningPlatforms(prev => [...prev, platform]);
        }, platform.delay);
      });
    }
  }, [currentStep]);

  // Rotate logo
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoRotation(prev => prev + 2);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Animated Logo */}
          <div className="relative mb-6">
            <img 
              src="/Rageradarlogo.png" 
              alt="RageRadar Analyzing" 
              className="w-16 h-16 mx-auto drop-shadow-lg"
              style={{
                transform: `rotate(${logoRotation}deg)`,
                transition: 'none'
              }}
              onError={(e) => {
                // Fallback to a simple icon if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            
            {/* Fallback Icon */}
            <div 
              className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{
                display: 'none',
                transform: `rotate(${logoRotation}deg)`,
                transition: 'none'
              }}
            >
              RR
            </div>
            
            {/* Scanning Ring */}
            <div className="absolute inset-0 w-16 h-16 mx-auto">
              <svg className="w-full h-full animate-spin" style={{ animationDuration: '1.5s' }}>
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="url(#analysisGradient)"
                  strokeWidth="2"
                  strokeDasharray="50 20"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="analysisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF6B6B', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FF4444', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analyzing {brandName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            {steps[currentStep]?.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {steps[currentStep]?.detail}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>{steps[currentStep]?.name}</span>
            <span>
              {Math.round(progress)}% • ~{Math.max(1, Math.round((100 - progress) / 20))}s remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {step.name}
              </span>
            </div>
          ))}
        </div>

        {/* Platform Scanning Animation */}
        {currentStep === 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Scanning Platforms:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform, index) => (
                <div 
                  key={platform.name}
                  className={`flex items-center p-2 rounded-lg transition-all duration-500 ${
                    scanningPlatforms.includes(platform)
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  <span className="mr-2">{platform.icon}</span>
                  <span className="text-xs">{platform.name}</span>
                  {scanningPlatforms.includes(platform) && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Processing Animation */}
        {currentStep === 2 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              AI Processing:
            </h3>
            <div className="space-y-2">
              {['Emotion Detection', 'Sentiment Analysis', 'Context Understanding'].map((process, index) => (
                <div key={process} className="flex items-center">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-3">
                    <div 
                      className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
                      style={{ 
                        width: '100%',
                        animationDelay: `${index * 0.5}s`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{process}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Button */}
        <div className="text-center">
          <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200">
            Cancel Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoading;