/**
 * Cooper Analytics - Goal Achievement and User Journey Tracking
 * Tracks user behavior patterns and Cooper principle adherence
 */

class CooperAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.goals = new Map();
    this.journeySteps = [];
    this.frictionPoints = [];
    this.abTestVariants = new Map();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Goal Achievement Tracking
  defineGoal(goalId, description, targetTime = null) {
    this.goals.set(goalId, {
      id: goalId,
      description,
      targetTime,
      startTime: Date.now(),
      completed: false,
      steps: [],
      frictionEncountered: []
    });
  }

  trackGoalStep(goalId, stepName, metadata = {}) {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.steps.push({
        step: stepName,
        timestamp: Date.now(),
        timeFromStart: Date.now() - goal.startTime,
        metadata
      });
    }
  }

  completeGoal(goalId, metadata = {}) {
    const goal = this.goals.get(goalId);
    if (goal) {
      const completionTime = Date.now() - goal.startTime;
      goal.completed = true;
      goal.completionTime = completionTime;
      goal.completionMetadata = metadata;

      // Track time-to-first-insight for analysis goals
      if (goalId.includes('analysis') || goalId.includes('insight')) {
        this.trackTimeToFirstInsight(completionTime);
      }

      this.sendEvent('goal_completed', {
        goalId,
        completionTime,
        targetTime: goal.targetTime,
        achieved: goal.targetTime ? completionTime <= goal.targetTime : true,
        steps: goal.steps.length,
        metadata
      });
    }
  }

  // Time-to-First-Insight Tracking
  trackTimeToFirstInsight(timeMs) {
    const timeToInsight = {
      sessionId: this.sessionId,
      timeMs,
      timestamp: Date.now(),
      userType: this.getUserType(),
      pathway: this.getInsightPathway()
    };

    this.sendEvent('time_to_first_insight', timeToInsight);
    this.storeMetric('timeToFirstInsight', timeToInsight);
  }

  getInsightPathway() {
    const recentSteps = this.journeySteps.slice(-5);
    return recentSteps.map(step => step.action).join(' -> ');
  }

  // User Journey Tracking
  trackJourneyStep(action, context = {}) {
    const step = {
      sessionId: this.sessionId,
      action,
      timestamp: Date.now(),
      timeFromStart: Date.now() - this.startTime,
      context,
      url: window.location.pathname,
      userAgent: navigator.userAgent
    };

    this.journeySteps.push(step);
    this.sendEvent('journey_step', step);

    // Detect potential friction points
    this.detectFriction(step);
  }

  // Friction Point Detection
  detectFriction(currentStep) {
    const recentSteps = this.journeySteps.slice(-3);
    
    // Detect repeated actions (user confusion)
    const repeatedActions = recentSteps.filter(step => 
      step.action === currentStep.action
    ).length;

    if (repeatedActions >= 2) {
      this.recordFrictionPoint('repeated_action', {
        action: currentStep.action,
        count: repeatedActions,
        context: currentStep.context
      });
    }

    // Detect long pauses (user hesitation)
    if (recentSteps.length > 0) {
      const lastStep = recentSteps[recentSteps.length - 1];
      const timeBetween = currentStep.timestamp - lastStep.timestamp;
      
      if (timeBetween > 30000) { // 30 seconds
        this.recordFrictionPoint('long_pause', {
          pauseDuration: timeBetween,
          beforeAction: lastStep.action,
          afterAction: currentStep.action
        });
      }
    }

    // Detect error patterns
    if (currentStep.context.error) {
      this.recordFrictionPoint('error_encountered', {
        error: currentStep.context.error,
        action: currentStep.action,
        context: currentStep.context
      });
    }
  }

  recordFrictionPoint(type, data) {
    const frictionPoint = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data,
      resolved: false
    };

    this.frictionPoints.push(frictionPoint);
    this.sendEvent('friction_point', frictionPoint);
  }

  // Cooper Principle Adherence Tracking
  trackCooperPrinciple(principle, adherenceScore, context = {}) {
    const adherenceData = {
      principle,
      score: adherenceScore, // 0-100
      timestamp: Date.now(),
      sessionId: this.sessionId,
      context,
      userType: this.getUserType()
    };

    this.sendEvent('cooper_adherence', adherenceData);
    this.storeMetric('cooperAdherence', adherenceData);
  }

  // A/B Testing Framework
  initializeABTest(testId, variants) {
    const userVariant = this.assignVariant(testId, variants);
    this.abTestVariants.set(testId, userVariant);
    
    this.sendEvent('ab_test_assignment', {
      testId,
      variant: userVariant,
      sessionId: this.sessionId
    });

    return userVariant;
  }

  assignVariant(testId, variants) {
    // Use consistent hashing based on session ID for stable assignment
    const hash = this.hashString(this.sessionId + testId);
    const variantIndex = hash % variants.length;
    return variants[variantIndex];
  }

  trackABTestConversion(testId, conversionType, value = 1) {
    const variant = this.abTestVariants.get(testId);
    if (variant) {
      this.sendEvent('ab_test_conversion', {
        testId,
        variant,
        conversionType,
        value,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
    }
  }

  // Utility Methods
  getUserType() {
    // Determine user type based on behavior patterns
    const totalSteps = this.journeySteps.length;
    const errorRate = this.frictionPoints.filter(fp => fp.type === 'error_encountered').length / totalSteps;
    const avgStepTime = this.journeySteps.length > 1 ? 
      (Date.now() - this.startTime) / this.journeySteps.length : 0;

    if (errorRate > 0.2 || avgStepTime > 10000) {
      return 'beginner';
    } else if (errorRate < 0.05 && avgStepTime < 3000) {
      return 'expert';
    }
    return 'perpetual_intermediate';
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Data Storage and Transmission
  sendEvent(eventType, data) {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.pathname
    };

    this.events.push(event);

    // Send to analytics endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.warn('Analytics event failed to send:', error);
        // Store locally for retry
        this.storeEventLocally(event);
      });
    }
  }

  storeMetric(metricType, data) {
    const metrics = JSON.parse(localStorage.getItem('cooperMetrics') || '[]');
    metrics.push({
      type: metricType,
      data,
      timestamp: Date.now()
    });
    
    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
    
    localStorage.setItem('cooperMetrics', JSON.stringify(metrics));
  }

  storeEventLocally(event) {
    const pendingEvents = JSON.parse(localStorage.getItem('pendingAnalyticsEvents') || '[]');
    pendingEvents.push(event);
    localStorage.setItem('pendingAnalyticsEvents', JSON.stringify(pendingEvents));
  }

  // Session Summary
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime,
      totalSteps: this.journeySteps.length,
      goalsCompleted: Array.from(this.goals.values()).filter(g => g.completed).length,
      frictionPoints: this.frictionPoints.length,
      userType: this.getUserType(),
      abTests: Array.from(this.abTestVariants.entries())
    };
  }
}

// Global instance
const cooperAnalytics = new CooperAnalytics();

// Auto-track page views
if (typeof window !== 'undefined') {
  cooperAnalytics.trackJourneyStep('page_view', {
    path: window.location.pathname,
    referrer: document.referrer
  });
}

export default cooperAnalytics;