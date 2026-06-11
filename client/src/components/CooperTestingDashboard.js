/**
 * Cooper Testing Dashboard
 * Real-time dashboard for monitoring Cooper design principle adherence
 */

import React, { useState, useEffect, useRef } from 'react';
import CooperTestingFramework from '../utils/cooperTesting';

const CooperTestingDashboard = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState({
    goalAchievementRate: 0,
    averageCognitiveLoad: 0,
    errorRecoveryRate: 0,
    perpetualIntermediateScore: 0
  });
  
  const cooperTestingRef = useRef(new CooperTestingFramework());

  useEffect(() => {
    // Update live metrics every 5 seconds
    const interval = setInterval(() => {
      if (cooperTestingRef.current) {
        const report = cooperTestingRef.current.generateReport();
        setLiveMetrics({
          goalAchievementRate: report.summary.goalAchievementRate,
          averageCognitiveLoad: report.summary.averageCognitiveLoad,
          errorRecoveryRate: report.summary.errorRecoveryRate,
          perpetualIntermediateScore: report.summary.perpetualIntermediateScore
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startGoalAchievementTest = () => {
    setIsRunning(true);
    const testSession = cooperTestingRef.current.startGoalAchievementTest('manual_test');
    setCurrentTest(testSession);
  };

  const completeGoalAchievementTest = (success = true) => {
    if (currentTest) {
      const result = cooperTestingRef.current.completeGoalAchievementTest(success, 'Manual test completed');
      setCurrentTest(null);
      setIsRunning(false);
      updateResults();
    }
  };

  const runCognitiveLoadTest = () => {
    const result = cooperTestingRef.current.measureCognitiveLoad();
    updateResults();
    return result;
  };

  const runPerpetualIntermediateTest = () => {
    const result = cooperTestingRef.current.testPerpetualIntermediateOptimization();
    updateResults();
    return result;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Run cognitive load test
    runCognitiveLoadTest();
    
    // Run perpetual intermediate test
    runPerpetualIntermediateTest();
    
    // Simulate goal achievement test
    const goalTest = cooperTestingRef.current.startGoalAchievementTest('automated_test');
    setTimeout(() => {
      cooperTestingRef.current.completeGoalAchievementTest(true, 'Automated test completed');
      updateResults();
      setIsRunning(false);
    }, 2000);
  };

  const updateResults = () => {
    const report = cooperTestingRef.current.generateReport();
    setTestResults(report);
  };

  const exportResults = (format = 'json') => {
    const results = cooperTestingRef.current.exportResults(format);
    const blob = new Blob([results], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cooper-test-results-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score, threshold = 80) => {
    if (score >= threshold) return 'text-emerald-600';
    if (score >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score, threshold = 80) => {
    if (score >= threshold) return 'bg-emerald-100';
    if (score >= threshold * 0.7) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cooper Design Testing Dashboard</h1>
            <p className="text-slate-600 mt-1">Monitor adherence to Alan Cooper's Goal-Directed Design principles</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-200"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={() => exportResults('json')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => exportResults('csv')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Goal Achievement Rate"
          value={`${liveMetrics.goalAchievementRate.toFixed(1)}%`}
          target="≥80%"
          score={liveMetrics.goalAchievementRate}
          description="Users completing primary goal within 30 seconds"
          icon="🎯"
        />
        <MetricCard
          title="Cognitive Load"
          value={liveMetrics.averageCognitiveLoad.toFixed(1)}
          target="≤5 elements"
          score={liveMetrics.averageCognitiveLoad <= 5 ? 100 : (5 / liveMetrics.averageCognitiveLoad) * 100}
          description="Average interface elements in primary workflow"
          icon="🧠"
        />
        <MetricCard
          title="Error Recovery Rate"
          value={`${liveMetrics.errorRecoveryRate.toFixed(1)}%`}
          target="≥90%"
          score={liveMetrics.errorRecoveryRate}
          description="Users successfully recovering from errors"
          icon="🔄"
        />
        <MetricCard
          title="Perpetual Intermediate Score"
          value={`${liveMetrics.perpetualIntermediateScore.toFixed(1)}%`}
          target="≥80%"
          score={liveMetrics.perpetualIntermediateScore}
          description="Optimization for experienced users"
          icon="👥"
        />
      </div>

      {/* Manual Testing Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Manual Testing Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium text-slate-700">Goal Achievement Test</h3>
            {!currentTest ? (
              <button
                onClick={startGoalAchievementTest}
                className="w-full px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Start Goal Test
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-slate-600">
                  Test running... ({((Date.now() - currentTest.startTime) / 1000).toFixed(1)}s)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => completeGoalAchievementTest(true)}
                    className="flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded text-sm hover:bg-emerald-200"
                  >
                    Success
                  </button>
                  <button
                    onClick={() => completeGoalAchievementTest(false)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Failed
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-slate-700">Cognitive Load Test</h3>
            <button
              onClick={runCognitiveLoadTest}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Measure Cognitive Load
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-slate-700">Perpetual Intermediate Test</h3>
            <button
              onClick={runPerpetualIntermediateTest}
              className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Test PI Optimization
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Test Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{testResults.summary.totalTests}</div>
                <div className="text-sm text-slate-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(testResults.summary.goalAchievementRate)}`}>
                  {testResults.summary.goalAchievementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">Goal Achievement</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(testResults.summary.averageCognitiveLoad <= 5 ? 100 : 0)}`}>
                  {testResults.summary.averageCognitiveLoad.toFixed(1)}
                </div>
                <div className="text-sm text-slate-600">Avg Cognitive Load</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(testResults.summary.errorRecoveryRate)}`}>
                  {testResults.summary.errorRecoveryRate.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">Error Recovery</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {testResults.recommendations.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommendations</h2>
              <div className="space-y-4">
                {testResults.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high'
                        ? 'bg-red-50 border-red-400'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{rec.category}</h3>
                        <p className="text-sm text-slate-600 mt-1">{rec.issue}</p>
                        <p className="text-sm text-slate-700 mt-2 font-medium">{rec.suggestion}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          rec.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Results</h2>
            <div className="space-y-6">
              {/* Goal Achievement Details */}
              {testResults.details.goalAchievement.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Goal Achievement Tests</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2">Goal Type</th>
                          <th className="text-left py-2">Duration</th>
                          <th className="text-left py-2">Interactions</th>
                          <th className="text-left py-2">Target Met</th>
                          <th className="text-left py-2">Success</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.details.goalAchievement.map((test, index) => (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="py-2">{test.goalType}</td>
                            <td className="py-2">{test.duration.toFixed(2)}s</td>
                            <td className="py-2">{test.interactionCount}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${test.targetMet ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {test.targetMet ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${test.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {test.success ? 'Yes' : 'No'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cognitive Load Details */}
              {testResults.details.cognitiveLoad.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Cognitive Load Tests</h3>
                  <div className="space-y-3">
                    {testResults.details.cognitiveLoad.map((test, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Element Count: {test.elementCount}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${test.targetMet ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {test.targetMet ? 'Target Met' : 'Over Target'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Elements found: {test.elements.map(e => `${e.selector} (${e.count})`).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, target, score, description, icon }) => {
  const getScoreColor = (score, threshold = 80) => {
    if (score >= threshold) return 'text-emerald-600';
    if (score >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score, threshold = 80) => {
    if (score >= threshold) return 'bg-emerald-100';
    if (score >= threshold * 0.7) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
          Target: {target}
        </div>
      </div>
      <div className={`text-2xl font-bold mb-1 ${getScoreColor(score)}`}>
        {value}
      </div>
      <div className="text-sm font-medium text-slate-900 mb-1">{title}</div>
      <div className="text-xs text-slate-600">{description}</div>
    </div>
  );
};

export default CooperTestingDashboard;