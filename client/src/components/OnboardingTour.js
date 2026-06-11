import React, { useState, useEffect } from 'react';

const OnboardingTour = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [userWantsFullTour, setUserWantsFullTour] = useState(false);

  // Minimal tour steps - assumes domain knowledge
  const minimalTourSteps = [
    {
      title: "Welcome to RageRadar",
      content: "Ready to analyze brand sentiment? Enter any brand name to get started.",
      target: "[data-tour='brand-input']",
      position: "bottom"
    },
    {
      title: "You're all set!",
      content: "Analysis takes 30-60 seconds. Results show sentiment from Reddit, Twitter, and more.",
      target: null,
      position: "center"
    }
  ];

  // Full tour steps - only when explicitly requested
  const fullTourSteps = [
    {
      title: "Welcome to RageRadar! 🎉",
      content: "Your AI-powered sentiment analysis dashboard. Let's take a quick tour to get you started.",
      target: null,
      position: "center"
    },
    {
      title: "Brand Analysis",
      content: "Start by entering your brand name or website URL here. RageRadar will analyze sentiment across multiple platforms.",
      target: "[data-tour='brand-input']",
      position: "bottom"
    },
    {
      title: "Sentiment Overview",
      content: "Your main sentiment score appears here. Green means positive, yellow is neutral, and red indicates negative sentiment.",
      target: "[data-tour='sentiment-score']",
      position: "bottom"
    },
    {
      title: "Emotion Breakdown",
      content: "See detailed emotions detected in mentions of your brand. This helps you understand the 'why' behind the sentiment.",
      target: "[data-tour='emotion-chart']",
      position: "left"
    },
    {
      title: "Smart Insights",
      content: "AI-powered recommendations appear here. These actionable insights help you improve your brand perception.",
      target: "[data-tour='insights-panel']",
      position: "left"
    },
    {
      title: "Negative Alerts",
      content: "Critical negative mentions are highlighted here. Address these quickly to prevent reputation damage.",
      target: "[data-tour='negative-posts']",
      position: "top"
    },
    {
      title: "Platform Breakdown",
      content: "See which platforms are talking about your brand and their sentiment distribution.",
      target: "[data-tour='platform-stats']",
      position: "top"
    },
    {
      title: "Help & Support",
      content: "Click here anytime for detailed help documentation, tutorials, and support.",
      target: "[data-tour='help-button']",
      position: "bottom"
    },
    {
      title: "You're All Set! 🚀",
      content: "You're ready to start monitoring your brand sentiment. Remember, consistent monitoring helps you stay ahead of issues and capitalize on positive trends.",
      target: null,
      position: "center"
    }
  ];

  // Use minimal tour by default, full tour only when requested
  const tourSteps = userWantsFullTour ? fullTourSteps : minimalTourSteps;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
    setCurrentStep(0);
  };

  const completeTour = () => {
    onComplete?.();
    onClose();
    setCurrentStep(0);
    // Mark tour as completed in localStorage
    localStorage.setItem('rageradar-tour-completed', 'true');
  };

  const getTooltipPosition = (target, position) => {
    if (!target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const element = document.querySelector(target);
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          transform: 'none'
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          transform: 'none'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - 20,
          transform: 'none'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + 20,
          transform: 'none'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const highlightElement = (target) => {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    if (target) {
      const element = document.querySelector(target);
      if (element) {
        element.classList.add('tour-highlight');
      }
    }
  };

  useEffect(() => {
    if (isVisible && tourSteps[currentStep]) {
      highlightElement(tourSteps[currentStep].target);
    }

    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const tooltipStyle = getTooltipPosition(currentStepData.target, currentStepData.position);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity">
        {/* Spotlight effect for highlighted elements */}
        <style jsx>{`
          .tour-highlight {
            position: relative;
            z-index: 51;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
            border-radius: 8px;
          }
        `}</style>

        {/* Tooltip */}
        <div
          className="fixed bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-52 max-w-sm"
          style={tooltipStyle}
        >
          {/* Progress bar */}
          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            {/* Step counter */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
              <button
                onClick={skipTour}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Skip tour
              </button>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {currentStepData.content}
            </p>

            {/* Option for detailed tour - only on first step */}
            {currentStep === 0 && !userWantsFullTour && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <button
                  onClick={() => setUserWantsFullTour(true)}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Want a detailed walkthrough? Click here
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-red-500'
                        : index < currentStep
                        ? 'bg-red-300'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>

          {/* Arrow pointer */}
          {currentStepData.target && (
            <div className={`absolute w-3 h-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transform rotate-45 ${
              currentStepData.position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2' :
              currentStepData.position === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2' :
              currentStepData.position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2' :
              'hidden'
            }`} />
          )}
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;