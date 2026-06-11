/**
 * Cooper Design Principle Testing Utilities
 * Validates adherence to Alan Cooper's Goal-Directed Design principles
 */

class CooperTestingFramework {
  constructor() {
    this.testResults = {
      goalAchievement: [],
      cognitiveLoad: [],
      errorRecovery: [],
      perpetualIntermediate: []
    };
    this.startTime = null;
    this.interactionCount = 0;
    this.errorCount = 0;
    this.recoveryAttempts = 0;
  }

  // Task Completion Timing Tests (Requirement 1.5)
  startGoalAchievementTest(goalType = 'brand_analysis') {
    this.startTime = performance.now();
    this.interactionCount = 0;
    this.currentGoal = goalType;
    
    console.log(`🎯 Starting goal achievement test: ${goalType}`);
    
    // Track user interactions
    this.trackInteractions();
    
    return {
      testId: `goal_${Date.now()}`,
      startTime: this.startTime,
      goalType
    };
  }

  completeGoalAchievementTest(success = true, insights = null) {
    if (!this.startTime) {
      console.warn('Goal achievement test not started');
      return null;
    }

    const endTime = performance.now();
    const duration = (endTime - this.startTime) / 1000; // Convert to seconds
    const target = 30; // 30-second target from requirements
    
    const result = {
      goalType: this.currentGoal,
      duration,
      success,
      interactionCount: this.interactionCount,
      targetMet: duration <= target,
      insights,
      timestamp: new Date().toISOString()
    };

    this.testResults.goalAchievement.push(result);
    
    console.log(`✅ Goal achievement test completed:`, {
      duration: `${duration.toFixed(2)}s`,
      target: `${target}s`,
      success: result.targetMet ? '✅' : '❌',
      interactions: this.interactionCount
    });

    this.resetTest();
    return result;
  }

  // Cognitive Load Testing (Requirement 4.1)
  measureCognitiveLoad() {
    const primaryWorkflowElements = this.countPrimaryWorkflowElements();
    const target = 5; // Maximum 5 elements in primary workflow
    
    const result = {
      elementCount: primaryWorkflowElements.count,
      elements: primaryWorkflowElements.elements,
      targetMet: primaryWorkflowElements.count <= target,
      timestamp: new Date().toISOString()
    };

    this.testResults.cognitiveLoad.push(result);
    
    console.log(`🧠 Cognitive load test:`, {
      elements: primaryWorkflowElements.count,
      target: `≤${target}`,
      success: result.targetMet ? '✅' : '❌'
    });

    return result;
  }

  countPrimaryWorkflowElements() {
    // Count visible interactive elements in primary workflow
    const selectors = [
      'input[type="text"]', // Search input
      'button[type="submit"]', // Primary action button
      '.suggestion-chip', // Brand suggestions
      '.primary-action', // Primary CTAs
      '.navigation-item' // Main navigation items
    ];

    const elements = [];
    let totalCount = 0;

    selectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      const visibleElements = Array.from(found).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
      
      if (visibleElements.length > 0) {
        elements.push({
          selector,
          count: visibleElements.length,
          elements: visibleElements.map(el => ({
            tagName: el.tagName,
            className: el.className,
            text: el.textContent?.trim().substring(0, 50)
          }))
        });
        totalCount += visibleElements.length;
      }
    });

    return { count: totalCount, elements };
  }

  // Error Recovery Testing (Requirement 6.4)
  startErrorRecoveryTest(errorType = 'brand_not_found') {
    this.errorCount = 0;
    this.recoveryAttempts = 0;
    this.errorStartTime = performance.now();
    this.currentErrorType = errorType;
    
    console.log(`🚨 Starting error recovery test: ${errorType}`);
    
    return {
      testId: `error_${Date.now()}`,
      errorType,
      startTime: this.errorStartTime
    };
  }

  recordErrorRecoveryAttempt(successful = false, method = 'unknown') {
    this.recoveryAttempts++;
    
    if (successful) {
      const recoveryTime = (performance.now() - this.errorStartTime) / 1000;
      
      const result = {
        errorType: this.currentErrorType,
        recoveryTime,
        attempts: this.recoveryAttempts,
        successful: true,
        recoveryMethod: method,
        timestamp: new Date().toISOString()
      };

      this.testResults.errorRecovery.push(result);
      
      console.log(`✅ Error recovery successful:`, {
        type: this.currentErrorType,
        time: `${recoveryTime.toFixed(2)}s`,
        attempts: this.recoveryAttempts,
        method
      });

      return result;
    }
    
    console.log(`🔄 Recovery attempt ${this.recoveryAttempts} for ${this.currentErrorType}`);
    return null;
  }

  // Perpetual Intermediate Optimization Testing (Requirement 2.5)
  testPerpetualIntermediateOptimization() {
    const metrics = {
      tutorialElements: this.countTutorialElements(),
      helpTextElements: this.countHelpTextElements(),
      contextualHelpAvailable: this.checkContextualHelp(),
      expertFeaturesHidden: this.checkExpertFeaturesHidden(),
      returnUserOptimizations: this.checkReturnUserOptimizations()
    };

    const score = this.calculatePerpetualIntermediateScore(metrics);
    
    const result = {
      metrics,
      score,
      passed: score >= 80, // 80% threshold for perpetual intermediate optimization
      timestamp: new Date().toISOString()
    };

    this.testResults.perpetualIntermediate.push(result);
    
    console.log(`👥 Perpetual intermediate test:`, {
      score: `${score}%`,
      passed: result.passed ? '✅' : '❌',
      metrics
    });

    return result;
  }

  countTutorialElements() {
    const tutorialSelectors = [
      '.tutorial-overlay',
      '.onboarding-tooltip',
      '.help-bubble',
      '[data-tutorial]',
      '.intro-text'
    ];

    return tutorialSelectors.reduce((count, selector) => {
      const elements = document.querySelectorAll(selector);
      return count + Array.from(elements).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }).length;
    }, 0);
  }

  countHelpTextElements() {
    const helpSelectors = [
      '.help-text',
      '.instruction-text',
      '.explanation',
      '[data-help]',
      '.hint'
    ];

    return helpSelectors.reduce((count, selector) => {
      return count + document.querySelectorAll(selector).length;
    }, 0);
  }

  checkContextualHelp() {
    // Check if contextual help is available but not intrusive
    const contextualHelp = document.querySelectorAll('[data-contextual-help], .contextual-help');
    return {
      available: contextualHelp.length > 0,
      intrusive: Array.from(contextualHelp).some(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
    };
  }

  checkExpertFeaturesHidden() {
    // Check if advanced features are hidden by default
    const expertSelectors = [
      '.advanced-options',
      '.expert-mode',
      '.technical-details',
      '[data-expert]'
    ];

    const hiddenCount = expertSelectors.reduce((count, selector) => {
      const elements = document.querySelectorAll(selector);
      return count + Array.from(elements).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || style.visibility === 'hidden';
      }).length;
    }, 0);

    const totalExpertElements = expertSelectors.reduce((count, selector) => {
      return count + document.querySelectorAll(selector).length;
    }, 0);

    return {
      totalExpertElements,
      hiddenCount,
      percentageHidden: totalExpertElements > 0 ? (hiddenCount / totalExpertElements) * 100 : 100
    };
  }

  checkReturnUserOptimizations() {
    // Check for features that optimize for returning users
    const returnUserFeatures = [
      '.recent-analyses',
      '.quick-access',
      '.saved-searches',
      '[data-recent]',
      '.user-history'
    ];

    const availableFeatures = returnUserFeatures.filter(selector => {
      return document.querySelectorAll(selector).length > 0;
    });

    return {
      availableFeatures: availableFeatures.length,
      totalFeatures: returnUserFeatures.length,
      percentage: (availableFeatures.length / returnUserFeatures.length) * 100
    };
  }

  calculatePerpetualIntermediateScore(metrics) {
    let score = 100;

    // Deduct points for tutorial elements (should be minimal)
    score -= Math.min(metrics.tutorialElements * 10, 30);

    // Deduct points for excessive help text
    score -= Math.min(metrics.helpTextElements * 5, 20);

    // Add points for contextual help availability without intrusiveness
    if (metrics.contextualHelpAvailable.available && !metrics.contextualHelpAvailable.intrusive) {
      score += 10;
    }

    // Add points for hidden expert features
    score += (metrics.expertFeaturesHidden.percentageHidden / 100) * 20;

    // Add points for return user optimizations
    score += (metrics.returnUserOptimizations.percentage / 100) * 20;

    return Math.max(0, Math.min(100, score));
  }

  // Utility Methods
  trackInteractions() {
    const interactionEvents = ['click', 'keydown', 'input', 'change'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.interactionCount++;
      }, { once: false, passive: true });
    });
  }

  resetTest() {
    this.startTime = null;
    this.interactionCount = 0;
    this.errorCount = 0;
    this.recoveryAttempts = 0;
    this.currentGoal = null;
    this.currentErrorType = null;
  }

  // Results and Reporting
  generateReport() {
    const report = {
      summary: {
        totalTests: Object.values(this.testResults).reduce((sum, tests) => sum + tests.length, 0),
        goalAchievementRate: this.calculateGoalAchievementRate(),
        averageCognitiveLoad: this.calculateAverageCognitiveLoad(),
        errorRecoveryRate: this.calculateErrorRecoveryRate(),
        perpetualIntermediateScore: this.calculateAveragePerpetualIntermediateScore()
      },
      details: this.testResults,
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };

    console.log('📊 Cooper Testing Report:', report);
    return report;
  }

  calculateGoalAchievementRate() {
    const tests = this.testResults.goalAchievement;
    if (tests.length === 0) return 0;
    
    const successfulTests = tests.filter(test => test.targetMet && test.success);
    return (successfulTests.length / tests.length) * 100;
  }

  calculateAverageCognitiveLoad() {
    const tests = this.testResults.cognitiveLoad;
    if (tests.length === 0) return 0;
    
    const totalElements = tests.reduce((sum, test) => sum + test.elementCount, 0);
    return totalElements / tests.length;
  }

  calculateErrorRecoveryRate() {
    const tests = this.testResults.errorRecovery;
    if (tests.length === 0) return 0;
    
    const successfulRecoveries = tests.filter(test => test.successful);
    return (successfulRecoveries.length / tests.length) * 100;
  }

  calculateAveragePerpetualIntermediateScore() {
    const tests = this.testResults.perpetualIntermediate;
    if (tests.length === 0) return 0;
    
    const totalScore = tests.reduce((sum, test) => sum + test.score, 0);
    return totalScore / tests.length;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Goal Achievement Recommendations
    const goalRate = this.calculateGoalAchievementRate();
    if (goalRate < 80) {
      recommendations.push({
        category: 'Goal Achievement',
        priority: 'high',
        issue: `Goal achievement rate is ${goalRate.toFixed(1)}% (target: 80%+)`,
        suggestion: 'Simplify primary workflow and reduce steps to first insight'
      });
    }

    // Cognitive Load Recommendations
    const avgCognitiveLoad = this.calculateAverageCognitiveLoad();
    if (avgCognitiveLoad > 5) {
      recommendations.push({
        category: 'Cognitive Load',
        priority: 'high',
        issue: `Average cognitive load is ${avgCognitiveLoad.toFixed(1)} elements (target: ≤5)`,
        suggestion: 'Hide non-essential elements and simplify primary interface'
      });
    }

    // Error Recovery Recommendations
    const errorRecoveryRate = this.calculateErrorRecoveryRate();
    if (errorRecoveryRate < 90) {
      recommendations.push({
        category: 'Error Recovery',
        priority: 'medium',
        issue: `Error recovery rate is ${errorRecoveryRate.toFixed(1)}% (target: 90%+)`,
        suggestion: 'Improve error messages and provide clearer recovery paths'
      });
    }

    // Perpetual Intermediate Recommendations
    const piScore = this.calculateAveragePerpetualIntermediateScore();
    if (piScore < 80) {
      recommendations.push({
        category: 'Perpetual Intermediate',
        priority: 'medium',
        issue: `Perpetual intermediate score is ${piScore.toFixed(1)}% (target: 80%+)`,
        suggestion: 'Reduce tutorial elements and optimize for experienced users'
      });
    }

    return recommendations;
  }

  // Export results for analysis
  exportResults(format = 'json') {
    const report = this.generateReport();
    
    if (format === 'csv') {
      return this.convertToCSV(report);
    }
    
    return JSON.stringify(report, null, 2);
  }

  convertToCSV(report) {
    // Convert test results to CSV format for analysis
    let csv = 'Test Type,Timestamp,Metric,Value,Target Met\n';
    
    // Goal Achievement Tests
    report.details.goalAchievement.forEach(test => {
      csv += `Goal Achievement,${test.timestamp},Duration,${test.duration},${test.targetMet}\n`;
      csv += `Goal Achievement,${test.timestamp},Interactions,${test.interactionCount},N/A\n`;
    });
    
    // Cognitive Load Tests
    report.details.cognitiveLoad.forEach(test => {
      csv += `Cognitive Load,${test.timestamp},Element Count,${test.elementCount},${test.targetMet}\n`;
    });
    
    // Error Recovery Tests
    report.details.errorRecovery.forEach(test => {
      csv += `Error Recovery,${test.timestamp},Recovery Time,${test.recoveryTime},${test.successful}\n`;
      csv += `Error Recovery,${test.timestamp},Attempts,${test.attempts},N/A\n`;
    });
    
    // Perpetual Intermediate Tests
    report.details.perpetualIntermediate.forEach(test => {
      csv += `Perpetual Intermediate,${test.timestamp},Score,${test.score},${test.passed}\n`;
    });
    
    return csv;
  }
}

// Global instance for easy access
window.cooperTesting = new CooperTestingFramework();

export default CooperTestingFramework;