/**
 * Cooper Design Principle Real-time Monitoring
 * Continuously monitors adherence to Cooper principles during user sessions
 */

class CooperMonitoring {
  constructor() {
    this.isMonitoring = false;
    this.sessionData = {
      startTime: null,
      interactions: [],
      errors: [],
      goalAttempts: [],
      cognitiveLoadMeasurements: []
    };
    this.observers = [];
    this.performanceMetrics = {
      timeToFirstInteraction: null,
      timeToFirstInsight: null,
      totalInteractions: 0,
      errorCount: 0,
      recoveryAttempts: 0
    };
  }

  // Start monitoring user session
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.sessionData.startTime = performance.now();
    
    console.log('🔍 Cooper monitoring started');
    
    // Set up event listeners
    this.setupInteractionTracking();
    this.setupErrorTracking();
    this.setupPerformanceTracking();
    this.setupMutationObserver();
    
    // Initial cognitive load measurement
    this.measureCognitiveLoad();
    
    return this.sessionData.startTime;
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return null;
    
    this.isMonitoring = false;
    
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Remove event listeners
    this.removeEventListeners();
    
    const sessionSummary = this.generateSessionSummary();
    console.log('🔍 Cooper monitoring stopped', sessionSummary);
    
    return sessionSummary;
  }

  // Track user interactions for goal achievement analysis
  setupInteractionTracking() {
    const trackInteraction = (event) => {
      if (!this.isMonitoring) return;
      
      const interaction = {
        type: event.type,
        target: this.getElementInfo(event.target),
        timestamp: performance.now(),
        relativeTime: performance.now() - this.sessionData.startTime
      };
      
      this.sessionData.interactions.push(interaction);
      this.performanceMetrics.totalInteractions++;
      
      // Track time to first interaction
      if (this.performanceMetrics.timeToFirstInteraction === null) {
        this.performanceMetrics.timeToFirstInteraction = interaction.relativeTime;
      }
      
      // Check if this interaction indicates goal achievement
      this.checkGoalAchievement(interaction);
    };

    // Track meaningful interactions
    const events = ['click', 'input', 'keydown', 'submit'];
    events.forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, { passive: true });
    });
    
    this.trackInteraction = trackInteraction; // Store for cleanup
  }

  // Track errors and recovery attempts
  setupErrorTracking() {
    // Track JavaScript errors
    const errorHandler = (event) => {
      if (!this.isMonitoring) return;
      
      const error = {
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        timestamp: performance.now(),
        relativeTime: performance.now() - this.sessionData.startTime
      };
      
      this.sessionData.errors.push(error);
      this.performanceMetrics.errorCount++;
    };

    // Track network errors
    const networkErrorHandler = (event) => {
      if (!this.isMonitoring) return;
      
      const error = {
        type: 'network_error',
        target: event.target.src || event.target.href,
        timestamp: performance.now(),
        relativeTime: performance.now() - this.sessionData.startTime
      };
      
      this.sessionData.errors.push(error);
      this.performanceMetrics.errorCount++;
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', errorHandler);
    document.addEventListener('error', networkErrorHandler, true);
    
    this.errorHandler = errorHandler;
    this.networkErrorHandler = networkErrorHandler;
  }

  // Track performance metrics
  setupPerformanceTracking() {
    // Track page load performance
    if (document.readyState === 'complete') {
      this.recordPageLoadMetrics();
    } else {
      window.addEventListener('load', () => this.recordPageLoadMetrics());
    }

    // Track navigation timing
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (navTiming) {
        this.sessionData.navigationTiming = {
          domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
          loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
          firstPaint: this.getFirstPaintTime(),
          firstContentfulPaint: this.getFirstContentfulPaintTime()
        };
      }
    }
  }

  // Monitor DOM changes for cognitive load analysis
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      if (!this.isMonitoring) return;
      
      let significantChange = false;
      
      mutations.forEach(mutation => {
        // Check for significant DOM changes that might affect cognitive load
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const addedElements = Array.from(mutation.addedNodes).filter(node => 
            node.nodeType === Node.ELEMENT_NODE
          );
          
          if (addedElements.length > 0) {
            significantChange = true;
          }
        }
      });
      
      if (significantChange) {
        // Re-measure cognitive load after significant changes
        setTimeout(() => this.measureCognitiveLoad(), 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    this.observers.push(observer);
  }

  // Measure cognitive load in real-time
  measureCognitiveLoad() {
    if (!this.isMonitoring) return;
    
    const measurement = {
      timestamp: performance.now(),
      relativeTime: performance.now() - this.sessionData.startTime,
      elements: this.countPrimaryWorkflowElements(),
      complexity: this.calculateInterfaceComplexity()
    };
    
    this.sessionData.cognitiveLoadMeasurements.push(measurement);
    
    // Alert if cognitive load exceeds threshold
    if (measurement.elements.count > 5) {
      console.warn(`🧠 Cognitive load warning: ${measurement.elements.count} elements (target: ≤5)`);
    }
    
    return measurement;
  }

  // Count elements in primary workflow
  countPrimaryWorkflowElements() {
    const selectors = [
      'input[type="text"]:not([style*="display: none"])',
      'button[type="submit"]:not([style*="display: none"])',
      '.suggestion-chip:not([style*="display: none"])',
      '.primary-action:not([style*="display: none"])',
      '.navigation-item:not([style*="display: none"])'
    ];

    const elements = [];
    let totalCount = 0;

    selectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      const visibleElements = Array.from(found).filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
          rect.width > 0 && 
          rect.height > 0 && 
          style.visibility !== 'hidden' && 
          style.opacity !== '0' &&
          style.display !== 'none'
        );
      });
      
      if (visibleElements.length > 0) {
        elements.push({
          selector,
          count: visibleElements.length,
          elements: visibleElements.map(el => this.getElementInfo(el))
        });
        totalCount += visibleElements.length;
      }
    });

    return { count: totalCount, elements };
  }

  // Calculate interface complexity score
  calculateInterfaceComplexity() {
    const allInteractiveElements = document.querySelectorAll(
      'button, input, select, textarea, a, [onclick], [tabindex]'
    );
    
    const visibleElements = Array.from(allInteractiveElements).filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        rect.width > 0 && 
        rect.height > 0 && 
        style.visibility !== 'hidden' && 
        style.opacity !== '0' &&
        style.display !== 'none'
      );
    });

    const colorVariations = this.countColorVariations();
    const fontVariations = this.countFontVariations();
    
    return {
      totalInteractiveElements: visibleElements.length,
      colorVariations,
      fontVariations,
      complexityScore: this.calculateComplexityScore(visibleElements.length, colorVariations, fontVariations)
    };
  }

  // Check if user achieved their goal
  checkGoalAchievement(interaction) {
    // Look for patterns that indicate goal achievement
    const goalIndicators = [
      'analyze', 'submit', 'search', 'get-insights', 'view-results'
    ];
    
    const elementInfo = interaction.target;
    const isGoalAction = goalIndicators.some(indicator => 
      elementInfo.className.toLowerCase().includes(indicator) ||
      elementInfo.textContent.toLowerCase().includes(indicator) ||
      elementInfo.id.toLowerCase().includes(indicator)
    );
    
    if (isGoalAction) {
      const goalAttempt = {
        type: 'goal_attempt',
        action: elementInfo.textContent || elementInfo.className,
        timestamp: interaction.timestamp,
        relativeTime: interaction.relativeTime,
        interactionCount: this.performanceMetrics.totalInteractions
      };
      
      this.sessionData.goalAttempts.push(goalAttempt);
      
      // Record time to first insight if this is the first goal attempt
      if (this.performanceMetrics.timeToFirstInsight === null) {
        this.performanceMetrics.timeToFirstInsight = interaction.relativeTime;
      }
      
      console.log('🎯 Goal attempt detected:', goalAttempt);
    }
  }

  // Utility methods
  getElementInfo(element) {
    return {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      textContent: element.textContent?.trim().substring(0, 50),
      type: element.type,
      role: element.getAttribute('role')
    };
  }

  countColorVariations() {
    const elements = document.querySelectorAll('*');
    const colors = new Set();
    
    Array.from(elements).forEach(el => {
      const style = window.getComputedStyle(el);
      colors.add(style.color);
      colors.add(style.backgroundColor);
      colors.add(style.borderColor);
    });
    
    // Filter out transparent and default colors
    const significantColors = Array.from(colors).filter(color => 
      color !== 'rgba(0, 0, 0, 0)' && 
      color !== 'transparent' && 
      color !== 'initial' && 
      color !== 'inherit'
    );
    
    return significantColors.length;
  }

  countFontVariations() {
    const elements = document.querySelectorAll('*');
    const fonts = new Set();
    
    Array.from(elements).forEach(el => {
      const style = window.getComputedStyle(el);
      fonts.add(`${style.fontFamily}-${style.fontSize}-${style.fontWeight}`);
    });
    
    return fonts.size;
  }

  calculateComplexityScore(interactiveElements, colors, fonts) {
    // Simple complexity scoring algorithm
    let score = 0;
    
    // Interactive elements contribute to complexity
    score += interactiveElements * 2;
    
    // Too many colors increase complexity
    if (colors > 10) score += (colors - 10) * 3;
    
    // Too many font variations increase complexity
    if (fonts > 5) score += (fonts - 5) * 2;
    
    return Math.min(100, score); // Cap at 100
  }

  recordPageLoadMetrics() {
    if ('performance' in window) {
      const timing = performance.timing;
      this.sessionData.pageLoadMetrics = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstPaint: this.getFirstPaintTime(),
        firstContentfulPaint: this.getFirstContentfulPaintTime()
      };
    }
  }

  getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : null;
  }

  // Generate session summary
  generateSessionSummary() {
    const sessionDuration = performance.now() - this.sessionData.startTime;
    
    const summary = {
      sessionDuration: sessionDuration / 1000, // Convert to seconds
      performanceMetrics: this.performanceMetrics,
      cooperPrincipleAdherence: {
        goalAchievement: this.analyzeGoalAchievement(),
        cognitiveLoad: this.analyzeCognitiveLoad(),
        errorRecovery: this.analyzeErrorRecovery(),
        perpetualIntermediate: this.analyzePerpetualIntermediate()
      },
      recommendations: this.generateRealtimeRecommendations(),
      rawData: {
        interactions: this.sessionData.interactions.length,
        errors: this.sessionData.errors.length,
        goalAttempts: this.sessionData.goalAttempts.length,
        cognitiveLoadMeasurements: this.sessionData.cognitiveLoadMeasurements.length
      }
    };
    
    return summary;
  }

  analyzeGoalAchievement() {
    const timeToFirstInsight = this.performanceMetrics.timeToFirstInsight;
    const goalAttempts = this.sessionData.goalAttempts.length;
    
    return {
      timeToFirstInsight: timeToFirstInsight ? timeToFirstInsight / 1000 : null,
      goalAttempts,
      achievedWithin30Seconds: timeToFirstInsight ? (timeToFirstInsight / 1000) <= 30 : false,
      interactionsToGoal: goalAttempts > 0 ? this.sessionData.goalAttempts[0].interactionCount : null
    };
  }

  analyzeCognitiveLoad() {
    const measurements = this.sessionData.cognitiveLoadMeasurements;
    if (measurements.length === 0) return { average: 0, max: 0, violations: 0 };
    
    const elementCounts = measurements.map(m => m.elements.count);
    const average = elementCounts.reduce((sum, count) => sum + count, 0) / elementCounts.length;
    const max = Math.max(...elementCounts);
    const violations = elementCounts.filter(count => count > 5).length;
    
    return {
      average,
      max,
      violations,
      violationRate: violations / measurements.length,
      targetMet: average <= 5
    };
  }

  analyzeErrorRecovery() {
    const errors = this.sessionData.errors;
    const recoveryAttempts = this.performanceMetrics.recoveryAttempts;
    
    return {
      totalErrors: errors.length,
      recoveryAttempts,
      errorRate: errors.length / (this.sessionData.interactions.length || 1),
      hasErrors: errors.length > 0
    };
  }

  analyzePerpetualIntermediate() {
    // Analyze if interface is optimized for perpetual intermediates
    const tutorialElements = document.querySelectorAll('.tutorial, .onboarding, .help-text').length;
    const contextualHelp = document.querySelectorAll('[data-help], .contextual-help').length;
    
    return {
      tutorialElements,
      contextualHelp,
      optimizedForPI: tutorialElements <= 2 && contextualHelp > 0
    };
  }

  generateRealtimeRecommendations() {
    const recommendations = [];
    
    // Goal achievement recommendations
    const goalAnalysis = this.analyzeGoalAchievement();
    if (goalAnalysis.timeToFirstInsight && goalAnalysis.timeToFirstInsight > 30) {
      recommendations.push({
        type: 'goal_achievement',
        priority: 'high',
        message: `Time to first insight (${goalAnalysis.timeToFirstInsight.toFixed(1)}s) exceeds 30-second target`,
        suggestion: 'Simplify primary workflow and reduce steps to first insight'
      });
    }
    
    // Cognitive load recommendations
    const cognitiveAnalysis = this.analyzeCognitiveLoad();
    if (cognitiveAnalysis.average > 5) {
      recommendations.push({
        type: 'cognitive_load',
        priority: 'high',
        message: `Average cognitive load (${cognitiveAnalysis.average.toFixed(1)}) exceeds 5-element target`,
        suggestion: 'Hide non-essential interface elements in primary workflow'
      });
    }
    
    // Error recommendations
    const errorAnalysis = this.analyzeErrorRecovery();
    if (errorAnalysis.errorRate > 0.1) {
      recommendations.push({
        type: 'error_recovery',
        priority: 'medium',
        message: `High error rate detected (${(errorAnalysis.errorRate * 100).toFixed(1)}%)`,
        suggestion: 'Improve error handling and user guidance'
      });
    }
    
    return recommendations;
  }

  // Clean up event listeners
  removeEventListeners() {
    if (this.trackInteraction) {
      const events = ['click', 'input', 'keydown', 'submit'];
      events.forEach(eventType => {
        document.removeEventListener(eventType, this.trackInteraction);
      });
    }
    
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
      window.removeEventListener('unhandledrejection', this.errorHandler);
    }
    
    if (this.networkErrorHandler) {
      document.removeEventListener('error', this.networkErrorHandler, true);
    }
  }

  // Export session data
  exportSessionData() {
    return {
      sessionData: this.sessionData,
      performanceMetrics: this.performanceMetrics,
      summary: this.generateSessionSummary()
    };
  }
}

// Global instance for easy access
window.cooperMonitoring = new CooperMonitoring();

export default CooperMonitoring;