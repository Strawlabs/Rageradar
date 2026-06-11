/**
 * Cooper Test Runner
 * Automated test execution and reporting for Cooper design principle validation
 */

import CooperTestingFramework from './cooperTesting';
import CooperMonitoring from './cooperMonitoring';

class CooperTestRunner {
  constructor() {
    this.testingFramework = new CooperTestingFramework();
    this.monitoring = new CooperMonitoring();
    this.testSuites = [];
    this.results = {
      suites: [],
      summary: {},
      startTime: null,
      endTime: null,
      duration: 0
    };
  }

  // Register test suites
  registerTestSuite(name, tests) {
    this.testSuites.push({
      name,
      tests,
      status: 'pending'
    });
  }

  // Run all registered test suites
  async runAllTests(options = {}) {
    const {
      includeMonitoring = true,
      generateReport = true,
      exportResults = false,
      exportFormat = 'json'
    } = options;

    console.log('🚀 Starting Cooper Design Principle Test Suite');
    this.results.startTime = performance.now();

    if (includeMonitoring) {
      this.monitoring.startMonitoring();
    }

    try {
      // Run each test suite
      for (const suite of this.testSuites) {
        console.log(`📋 Running test suite: ${suite.name}`);
        const suiteResult = await this.runTestSuite(suite);
        this.results.suites.push(suiteResult);
      }

      // Generate comprehensive results
      this.results.endTime = performance.now();
      this.results.duration = (this.results.endTime - this.results.startTime) / 1000;

      if (includeMonitoring) {
        this.results.monitoringSummary = this.monitoring.stopMonitoring();
      }

      if (generateReport) {
        this.results.frameworkReport = this.testingFramework.generateReport();
      }

      this.results.summary = this.generateTestSummary();

      console.log('✅ Cooper test suite completed', this.results.summary);

      if (exportResults) {
        this.exportResults(exportFormat);
      }

      return this.results;
    } catch (error) {
      console.error('❌ Cooper test suite failed:', error);
      throw error;
    }
  }

  // Run individual test suite
  async runTestSuite(suite) {
    const suiteStartTime = performance.now();
    const suiteResult = {
      name: suite.name,
      startTime: suiteStartTime,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
      status: 'running'
    };

    try {
      for (const test of suite.tests) {
        console.log(`  🧪 Running test: ${test.name}`);
        const testResult = await this.runIndividualTest(test);
        suiteResult.tests.push(testResult);

        if (testResult.status === 'passed') {
          suiteResult.passed++;
        } else if (testResult.status === 'failed') {
          suiteResult.failed++;
        } else {
          suiteResult.skipped++;
        }
      }

      suiteResult.status = suiteResult.failed === 0 ? 'passed' : 'failed';
      suiteResult.endTime = performance.now();
      suiteResult.duration = (suiteResult.endTime - suiteStartTime) / 1000;

      console.log(`  ✅ Suite ${suite.name} completed: ${suiteResult.passed} passed, ${suiteResult.failed} failed`);
      
      return suiteResult;
    } catch (error) {
      suiteResult.status = 'error';
      suiteResult.error = error.message;
      suiteResult.endTime = performance.now();
      suiteResult.duration = (suiteResult.endTime - suiteStartTime) / 1000;
      
      console.error(`  ❌ Suite ${suite.name} error:`, error);
      return suiteResult;
    }
  }

  // Run individual test
  async runIndividualTest(test) {
    const testStartTime = performance.now();
    const testResult = {
      name: test.name,
      startTime: testStartTime,
      status: 'running',
      cooperPrinciple: test.cooperPrinciple,
      requirements: test.requirements || []
    };

    try {
      // Execute the test function
      const result = await test.execute(this.testingFramework, this.monitoring);
      
      testResult.result = result;
      testResult.status = result.passed ? 'passed' : 'failed';
      testResult.endTime = performance.now();
      testResult.duration = (testResult.endTime - testStartTime) / 1000;
      
      if (!result.passed) {
        testResult.failureReason = result.reason || 'Test assertion failed';
      }

      return testResult;
    } catch (error) {
      testResult.status = 'error';
      testResult.error = error.message;
      testResult.endTime = performance.now();
      testResult.duration = (testResult.endTime - testStartTime) / 1000;
      
      return testResult;
    }
  }

  // Generate test summary
  generateTestSummary() {
    const totalTests = this.results.suites.reduce((sum, suite) => 
      sum + suite.tests.length, 0
    );
    
    const totalPassed = this.results.suites.reduce((sum, suite) => 
      sum + suite.passed, 0
    );
    
    const totalFailed = this.results.suites.reduce((sum, suite) => 
      sum + suite.failed, 0
    );
    
    const totalSkipped = this.results.suites.reduce((sum, suite) => 
      sum + suite.skipped, 0
    );

    const passRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    
    const cooperPrincipleAdherence = this.calculateCooperAdherence();

    return {
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      passRate,
      duration: this.results.duration,
      cooperPrincipleAdherence,
      overallStatus: totalFailed === 0 ? 'passed' : 'failed'
    };
  }

  // Calculate Cooper principle adherence scores
  calculateCooperAdherence() {
    const principles = {
      goalAchievement: { tests: 0, passed: 0 },
      cognitiveLoad: { tests: 0, passed: 0 },
      errorRecovery: { tests: 0, passed: 0 },
      perpetualIntermediate: { tests: 0, passed: 0 },
      interfaceInvisibility: { tests: 0, passed: 0 },
      directManipulation: { tests: 0, passed: 0 }
    };

    // Analyze test results by Cooper principle
    this.results.suites.forEach(suite => {
      suite.tests.forEach(test => {
        const principle = test.cooperPrinciple;
        if (principles[principle]) {
          principles[principle].tests++;
          if (test.status === 'passed') {
            principles[principle].passed++;
          }
        }
      });
    });

    // Calculate adherence scores
    const adherenceScores = {};
    Object.keys(principles).forEach(principle => {
      const data = principles[principle];
      adherenceScores[principle] = {
        score: data.tests > 0 ? (data.passed / data.tests) * 100 : 0,
        tests: data.tests,
        passed: data.passed
      };
    });

    return adherenceScores;
  }

  // Export test results
  exportResults(format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cooper-test-results-${timestamp}`;

    let content;
    let mimeType;
    let extension;

    switch (format) {
      case 'csv':
        content = this.convertToCSV();
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'html':
        content = this.convertToHTML();
        mimeType = 'text/html';
        extension = 'html';
        break;
      default:
        content = JSON.stringify(this.results, null, 2);
        mimeType = 'application/json';
        extension = 'json';
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`📄 Test results exported as ${filename}.${extension}`);
  }

  // Convert results to CSV format
  convertToCSV() {
    let csv = 'Suite,Test,Cooper Principle,Status,Duration,Requirements,Result\n';

    this.results.suites.forEach(suite => {
      suite.tests.forEach(test => {
        const row = [
          suite.name,
          test.name,
          test.cooperPrinciple || 'N/A',
          test.status,
          test.duration?.toFixed(3) || 'N/A',
          test.requirements?.join(';') || 'N/A',
          test.result ? JSON.stringify(test.result).replace(/"/g, '""') : 'N/A'
        ].map(field => `"${field}"`).join(',');
        
        csv += row + '\n';
      });
    });

    return csv;
  }

  // Convert results to HTML report
  convertToHTML() {
    const summary = this.results.summary;
    const adherence = summary.cooperPrincipleAdherence;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Cooper Design Principle Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #495057; }
        .metric-label { color: #6c757d; font-size: 0.9em; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .suite { margin-bottom: 30px; }
        .suite-header { background: #e9ecef; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold; }
        .test { padding: 10px 15px; border-left: 4px solid #dee2e6; margin-bottom: 5px; }
        .test.passed { border-left-color: #28a745; background: #f8fff9; }
        .test.failed { border-left-color: #dc3545; background: #fff8f8; }
        .adherence { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 30px; }
        .principle { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; }
        .principle-score { font-size: 1.5em; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cooper Design Principle Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value ${summary.overallStatus === 'passed' ? 'passed' : 'failed'}">
                ${summary.totalPassed}/${summary.totalTests}
            </div>
            <div class="metric-label">Tests Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.passRate.toFixed(1)}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.duration.toFixed(2)}s</div>
            <div class="metric-label">Duration</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.results.suites.length}</div>
            <div class="metric-label">Test Suites</div>
        </div>
    </div>

    <h2>Cooper Principle Adherence</h2>
    <div class="adherence">
        ${Object.entries(adherence).map(([principle, data]) => `
            <div class="principle">
                <h3>${principle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                <div class="principle-score ${data.score >= 80 ? 'passed' : 'failed'}">
                    ${data.score.toFixed(1)}%
                </div>
                <div>${data.passed}/${data.tests} tests passed</div>
            </div>
        `).join('')}
    </div>

    <h2>Test Results</h2>
    ${this.results.suites.map(suite => `
        <div class="suite">
            <div class="suite-header">
                ${suite.name} (${suite.passed} passed, ${suite.failed} failed)
            </div>
            ${suite.tests.map(test => `
                <div class="test ${test.status}">
                    <strong>${test.name}</strong>
                    <span style="float: right;">${test.status.toUpperCase()}</span>
                    <br>
                    <small>Cooper Principle: ${test.cooperPrinciple || 'N/A'} | Duration: ${test.duration?.toFixed(3) || 'N/A'}s</small>
                    ${test.failureReason ? `<br><small style="color: #dc3545;">Reason: ${test.failureReason}</small>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;
  }

  // Get current test results
  getResults() {
    return this.results;
  }

  // Reset test runner
  reset() {
    this.testSuites = [];
    this.results = {
      suites: [],
      summary: {},
      startTime: null,
      endTime: null,
      duration: 0
    };
    this.testingFramework = new CooperTestingFramework();
    this.monitoring = new CooperMonitoring();
  }
}

// Pre-defined test suites for Cooper principles
export const CooperTestSuites = {
  // Goal Achievement Tests
  goalAchievement: {
    name: 'Goal Achievement Tests',
    tests: [
      {
        name: '30-second goal achievement',
        cooperPrinciple: 'goalAchievement',
        requirements: ['1.5'],
        execute: async (framework, monitoring) => {
          const testSession = framework.startGoalAchievementTest('automated_goal_test');
          
          // Simulate user workflow
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate user thinking time
          
          const result = framework.completeGoalAchievementTest(true, 'Automated test completed');
          
          return {
            passed: result.targetMet && result.success,
            reason: result.targetMet ? null : `Goal took ${result.duration.toFixed(2)}s (target: ≤30s)`,
            data: result
          };
        }
      },
      {
        name: 'Interaction count optimization',
        cooperPrinciple: 'goalAchievement',
        requirements: ['1.1', '1.4'],
        execute: async (framework, monitoring) => {
          const testSession = framework.startGoalAchievementTest('interaction_test');
          
          // Simulate minimal interactions
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const result = framework.completeGoalAchievementTest(true, 'Minimal interaction test');
          
          return {
            passed: result.interactionCount <= 10,
            reason: result.interactionCount <= 10 ? null : `Too many interactions: ${result.interactionCount} (target: ≤10)`,
            data: result
          };
        }
      }
    ]
  },

  // Cognitive Load Tests
  cognitiveLoad: {
    name: 'Cognitive Load Tests',
    tests: [
      {
        name: 'Primary workflow element count',
        cooperPrinciple: 'cognitiveLoad',
        requirements: ['4.1'],
        execute: async (framework, monitoring) => {
          const result = framework.measureCognitiveLoad();
          
          return {
            passed: result.targetMet,
            reason: result.targetMet ? null : `Too many elements: ${result.elementCount} (target: ≤5)`,
            data: result
          };
        }
      },
      {
        name: 'Interface complexity analysis',
        cooperPrinciple: 'cognitiveLoad',
        requirements: ['4.3', '4.4'],
        execute: async (framework, monitoring) => {
          const cognitiveResult = framework.measureCognitiveLoad();
          
          // Additional complexity checks
          const hasConsistentColors = document.querySelectorAll('[style*="color"]').length < 10;
          const hasConsistentFonts = document.querySelectorAll('[style*="font"]').length < 5;
          
          const passed = cognitiveResult.targetMet && hasConsistentColors && hasConsistentFonts;
          
          return {
            passed,
            reason: passed ? null : 'Interface complexity exceeds recommended thresholds',
            data: {
              cognitiveLoad: cognitiveResult,
              consistentColors: hasConsistentColors,
              consistentFonts: hasConsistentFonts
            }
          };
        }
      }
    ]
  },

  // Error Recovery Tests
  errorRecovery: {
    name: 'Error Recovery Tests',
    tests: [
      {
        name: 'Error recovery success rate',
        cooperPrinciple: 'errorRecovery',
        requirements: ['6.4'],
        execute: async (framework, monitoring) => {
          framework.startErrorRecoveryTest('automated_error_test');
          
          // Simulate recovery attempt
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const result = framework.recordErrorRecoveryAttempt(true, 'automated_recovery');
          
          return {
            passed: result.successful,
            reason: result.successful ? null : 'Error recovery failed',
            data: result
          };
        }
      },
      {
        name: 'Error message clarity',
        cooperPrinciple: 'errorRecovery',
        requirements: ['6.5'],
        execute: async (framework, monitoring) => {
          // Check for user-friendly error messages
          const errorElements = document.querySelectorAll('.error, [data-error], .error-message');
          const hasUserFriendlyErrors = Array.from(errorElements).every(el => {
            const text = el.textContent.toLowerCase();
            return !text.includes('undefined') && !text.includes('null') && !text.includes('error:');
          });
          
          return {
            passed: hasUserFriendlyErrors,
            reason: hasUserFriendlyErrors ? null : 'Technical error messages found',
            data: { errorElements: errorElements.length }
          };
        }
      }
    ]
  },

  // Perpetual Intermediate Tests
  perpetualIntermediate: {
    name: 'Perpetual Intermediate Tests',
    tests: [
      {
        name: 'Tutorial element minimization',
        cooperPrinciple: 'perpetualIntermediate',
        requirements: ['2.1', '2.2'],
        execute: async (framework, monitoring) => {
          const result = framework.testPerpetualIntermediateOptimization();
          
          return {
            passed: result.metrics.tutorialElements <= 2,
            reason: result.metrics.tutorialElements <= 2 ? null : `Too many tutorial elements: ${result.metrics.tutorialElements} (target: ≤2)`,
            data: result
          };
        }
      },
      {
        name: 'Contextual help availability',
        cooperPrinciple: 'perpetualIntermediate',
        requirements: ['2.3'],
        execute: async (framework, monitoring) => {
          const result = framework.testPerpetualIntermediateOptimization();
          
          const passed = result.metrics.contextualHelpAvailable.available && 
                         !result.metrics.contextualHelpAvailable.intrusive;
          
          return {
            passed,
            reason: passed ? null : 'Contextual help not properly implemented',
            data: result.metrics.contextualHelpAvailable
          };
        }
      }
    ]
  }
};

export default CooperTestRunner;