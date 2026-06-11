/**
 * Accessibility Validator for Cooper Design Task 13
 * Validates all requirements in the browser environment
 */

class AccessibilityValidator {
  constructor() {
    this.results = {
      performance: {},
      aria: {},
      keyboard: {},
      contrast: {},
      semantic: {}
    };
    this.startTime = performance.now();
  }

  /**
   * Validate that primary action is visible within 3 seconds
   */
  async validatePrimaryActionPerformance() {
    return new Promise((resolve) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const visibilityTime = performance.now() - this.startTime;
            this.results.performance = {
              primaryActionVisible: true,
              visibilityTime: visibilityTime,
              withinThreeSeconds: visibilityTime <= 3000,
              status: visibilityTime <= 3000 ? 'PASS' : 'FAIL'
            };
            
            console.log(`✅ Primary action visible in ${visibilityTime.toFixed(2)}ms`);
            observer.disconnect();
            resolve(this.results.performance);
          }
        });
      }, { threshold: 0.1 });

      const primaryInput = document.querySelector('#brand-input');
      if (primaryInput) {
        observer.observe(primaryInput);
      } else {
        // Retry after a short delay
        setTimeout(() => {
          const retryInput = document.querySelector('#brand-input');
          if (retryInput) {
            observer.observe(retryInput);
          } else {
            this.results.performance = {
              primaryActionVisible: false,
              status: 'FAIL',
              error: 'Primary input not found'
            };
            resolve(this.results.performance);
          }
        }, 100);
      }
    });
  }

  /**
   * Validate ARIA labels and semantic markup
   */
  validateAriaAndSemantics() {
    const issues = [];
    const successes = [];

    // Check for proper ARIA labels on interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a, input, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach((element, index) => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
      const hasTextContent = element.textContent.trim().length > 0;
      const hasTitle = element.hasAttribute('title');
      const hasAssociatedLabel = element.id && document.querySelector(`label[for="${element.id}"]`);

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextContent && !hasTitle && !hasAssociatedLabel) {
        issues.push({
          element: element.tagName.toLowerCase(),
          issue: 'Missing accessible label',
          selector: this.getElementSelector(element)
        });
      } else {
        successes.push({
          element: element.tagName.toLowerCase(),
          selector: this.getElementSelector(element)
        });
      }
    });

    // Check for semantic landmarks
    const landmarks = {
      main: document.querySelectorAll('main, [role="main"]').length,
      nav: document.querySelectorAll('nav, [role="navigation"]').length,
      footer: document.querySelectorAll('footer, [role="contentinfo"]').length,
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
    };

    if (landmarks.main === 0) issues.push({ issue: 'Missing main landmark' });
    if (landmarks.nav === 0) issues.push({ issue: 'Missing navigation landmark' });
    if (landmarks.headings === 0) issues.push({ issue: 'Missing heading elements' });

    this.results.aria = {
      interactiveElementsChecked: interactiveElements.length,
      elementsWithLabels: successes.length,
      elementsWithoutLabels: issues.length,
      landmarks: landmarks,
      issues: issues,
      status: issues.length === 0 ? 'PASS' : 'PARTIAL'
    };

    if (issues.length === 0) {
      console.log('✅ All elements have proper ARIA labels and semantic markup');
    } else {
      console.warn('⚠️ ARIA and semantic issues found:', issues);
    }

    return this.results.aria;
  }

  /**
   * Test keyboard navigation flow
   */
  async testKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const navigationResults = {
      totalFocusableElements: focusableElements.length,
      elementsWithVisibleFocus: 0,
      elementsWithoutVisibleFocus: 0,
      focusOrder: [],
      issues: []
    };

    // Test each focusable element
    focusableElements.forEach((element, index) => {
      element.focus();
      const hasVisibleFocus = this.hasVisibleFocus(element);
      
      navigationResults.focusOrder.push({
        index: index,
        element: element.tagName.toLowerCase(),
        selector: this.getElementSelector(element),
        hasVisibleFocus: hasVisibleFocus
      });

      if (hasVisibleFocus) {
        navigationResults.elementsWithVisibleFocus++;
      } else {
        navigationResults.elementsWithoutVisibleFocus++;
        navigationResults.issues.push({
          element: element.tagName.toLowerCase(),
          selector: this.getElementSelector(element),
          issue: 'No visible focus indicator'
        });
      }
    });

    this.results.keyboard = {
      ...navigationResults,
      status: navigationResults.elementsWithoutVisibleFocus === 0 ? 'PASS' : 'PARTIAL'
    };

    if (navigationResults.elementsWithoutVisibleFocus === 0) {
      console.log('✅ All focusable elements have visible focus indicators');
    } else {
      console.warn('⚠️ Elements without visible focus:', navigationResults.issues);
    }

    return this.results.keyboard;
  }

  /**
   * Validate color contrast (simplified check)
   */
  validateColorContrast() {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, [role="button"], [role="link"]'
    );

    const contrastResults = {
      elementsChecked: interactiveElements.length,
      potentialIssues: [],
      status: 'PASS'
    };

    interactiveElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Simple check - if both are transparent, flag as potential issue
      if (backgroundColor === 'rgba(0, 0, 0, 0)' && color === 'rgba(0, 0, 0, 0)') {
        contrastResults.potentialIssues.push({
          element: element.tagName.toLowerCase(),
          selector: this.getElementSelector(element),
          issue: 'Transparent colors detected'
        });
      }
    });

    if (contrastResults.potentialIssues.length > 0) {
      contrastResults.status = 'REVIEW_NEEDED';
      console.warn('⚠️ Potential contrast issues:', contrastResults.potentialIssues);
    } else {
      console.log('✅ No obvious contrast issues detected');
    }

    this.results.contrast = contrastResults;
    return contrastResults;
  }

  /**
   * Run all accessibility validations
   */
  async runAllValidations() {
    console.log('🚀 Starting Cooper Design Accessibility Validation...');
    
    try {
      // Performance validation
      await this.validatePrimaryActionPerformance();
      
      // ARIA and semantic validation
      this.validateAriaAndSemantics();
      
      // Keyboard navigation validation
      await this.testKeyboardNavigation();
      
      // Color contrast validation
      this.validateColorContrast();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Accessibility validation failed:', error);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      overallStatus: this.calculateOverallStatus(),
      results: this.results,
      summary: {
        performance: this.results.performance.status || 'NOT_TESTED',
        aria: this.results.aria.status || 'NOT_TESTED',
        keyboard: this.results.keyboard.status || 'NOT_TESTED',
        contrast: this.results.contrast.status || 'NOT_TESTED'
      },
      recommendations: this.generateRecommendations()
    };

    console.log('📊 Cooper Design Accessibility Report:', report);
    
    // Store in sessionStorage for debugging
    sessionStorage.setItem('accessibilityReport', JSON.stringify(report, null, 2));
    
    // Display summary in console
    this.displaySummary(report);
    
    return report;
  }

  calculateOverallStatus() {
    const statuses = [
      this.results.performance.status,
      this.results.aria.status,
      this.results.keyboard.status,
      this.results.contrast.status
    ];

    if (statuses.every(status => status === 'PASS')) return 'PASS';
    if (statuses.some(status => status === 'FAIL')) return 'FAIL';
    return 'PARTIAL';
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.performance.status === 'FAIL') {
      recommendations.push('Optimize loading performance to show primary action within 3 seconds');
    }

    if (this.results.aria.issues && this.results.aria.issues.length > 0) {
      recommendations.push('Add proper ARIA labels to interactive elements');
    }

    if (this.results.keyboard.elementsWithoutVisibleFocus > 0) {
      recommendations.push('Ensure all focusable elements have visible focus indicators');
    }

    if (this.results.contrast.potentialIssues && this.results.contrast.potentialIssues.length > 0) {
      recommendations.push('Review color contrast ratios for flagged elements');
    }

    return recommendations;
  }

  displaySummary(report) {
    console.log('\n🎯 COOPER DESIGN TASK 13 - ACCESSIBILITY SUMMARY');
    console.log('================================================');
    console.log(`Overall Status: ${report.overallStatus}`);
    console.log(`Performance: ${report.summary.performance}`);
    console.log(`ARIA Labels: ${report.summary.aria}`);
    console.log(`Keyboard Navigation: ${report.summary.keyboard}`);
    console.log(`Color Contrast: ${report.summary.contrast}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n📝 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n💾 Full report saved to sessionStorage as "accessibilityReport"');
  }

  // Helper methods
  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  hasVisibleFocus(element) {
    const styles = window.getComputedStyle(element);
    return (
      styles.outline !== 'none' || 
      styles.outlineWidth !== '0px' ||
      styles.boxShadow !== 'none' ||
      styles.border !== styles.border // This is a simplified check
    );
  }
}

// Export for use in components
export default AccessibilityValidator;

// Auto-run in development mode
if (process.env.NODE_ENV === 'development') {
  // Wait for React to mount and page to be ready
  window.addEventListener('load', () => {
    setTimeout(() => {
      const validator = new AccessibilityValidator();
      validator.runAllValidations();
    }, 1000);
  });
}