import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './InsightsPanel.css';

const InsightsPanel = ({ insights, summary }) => {
    const [expandedInsight, setExpandedInsight] = useState(null);

    if (!insights || insights.length === 0) {
        return (
            <div className="insights-panel">
                <p className="no-insights">No insights available yet. Run an analysis to generate insights.</p>
            </div>
        );
    }

    const getPriorityClass = (priority) => {
        const classes = {
            high: 'priority-high',
            medium: 'priority-medium',
            low: 'priority-low'
        };
        return classes[priority] || classes.low;
    };

    const getCategoryClass = (category) => {
        const classes = {
            alert: 'category-alert',
            positive: 'category-positive',
            trend: 'category-trend',
            platform: 'category-platform',
            theme: 'category-theme',
            volume: 'category-volume'
        };
        return classes[category] || 'category-default';
    };

    return (
        <div className="insights-panel">
            {/* Summary */}
            {summary && (
                <div className="insights-summary">
                    <span className="summary-icon">{summary.icon}</span>
                    <div className="summary-content">
                        <p className="summary-text">{summary.text}</p>
                        {summary.breakdown && (
                            <div className="summary-breakdown">
                                <span className="breakdown-item high">
                                    {summary.breakdown.highPriority} High Priority
                                </span>
                                <span className="breakdown-item alert">
                                    {summary.breakdown.alerts} Alerts
                                </span>
                                <span className="breakdown-item positive">
                                    {summary.breakdown.positive} Positive
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Insights List */}
            <div className="insights-list">
                <AnimatePresence>
                    {insights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className={`insight-card ${getPriorityClass(insight.priority)} ${getCategoryClass(insight.category)}`}
                        >
                            <div className="insight-header">
                                <div className="header-left">
                                    <span className="insight-icon">{insight.icon}</span>
                                    <h4 className="insight-title">{insight.title}</h4>
                                </div>
                                <div className="header-right">
                                    <span className={`priority-badge ${insight.priority}`}>
                                        {insight.priority}
                                    </span>
                                </div>
                            </div>

                            <p className="insight-description">{insight.description}</p>

                            {/* Recommendation */}
                            <div className="insight-recommendation">
                                <div className="recommendation-header">
                                    <span className="rec-icon">💡</span>
                                    <strong>Recommendation</strong>
                                </div>
                                <p>{insight.recommendation}</p>
                            </div>

                            {/* Data Details (Expandable) */}
                            {insight.data && (
                                <div className="insight-data">
                                    <button
                                        className="data-toggle"
                                        onClick={() => setExpandedInsight(
                                            expandedInsight === index ? null : index
                                        )}
                                    >
                                        {expandedInsight === index ? '▼' : '▶'} View Details
                                    </button>

                                    <AnimatePresence>
                                        {expandedInsight === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="data-content"
                                            >
                                                <pre>{JSON.stringify(insight.data, null, 2)}</pre>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Score Indicator */}
                            {insight.score && (
                                <div className="insight-score">
                                    <div className="score-bar">
                                        <div
                                            className="score-fill"
                                            style={{ width: `${insight.score}%` }}
                                        />
                                    </div>
                                    <span className="score-text">Score: {insight.score}/100</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Filter/Sort Options */}
            <div className="insights-controls">
                <button className="control-btn">
                    <span>🔽</span> Sort by Priority
                </button>
                <button className="control-btn">
                    <span>🔍</span> Filter by Category
                </button>
            </div>
        </div>
    );
};

export default InsightsPanel;
