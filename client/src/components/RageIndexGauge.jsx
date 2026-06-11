import React from 'react';
import './RageIndexGauge.css';

const RageIndexGauge = ({ rageIndex, severity, showDetails = true }) => {
    const getSeverityConfig = (severity) => {
        const configs = {
            critical: {
                color: '#DC2626',
                icon: '🔴',
                label: 'Critical',
                description: 'Immediate action required'
            },
            high: {
                color: '#EA580C',
                icon: '🟠',
                label: 'High',
                description: 'Take action soon'
            },
            moderate: {
                color: '#F59E0B',
                icon: '🟡',
                label: 'Moderate',
                description: 'Monitor closely'
            },
            low: {
                color: '#10B981',
                icon: '🟢',
                label: 'Low',
                description: 'Situation stable'
            },
            minimal: {
                color: '#6B7280',
                icon: '⚪',
                label: 'Minimal',
                description: 'All good'
            }
        };
        return configs[severity] || configs.minimal;
    };

    const config = getSeverityConfig(severity);
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (rageIndex / 100) * circumference;

    return (
        <div className="rage-index-gauge">
            <div className="gauge-container">
                {/* SVG Circular Gauge */}
                <svg width="200" height="200" viewBox="0 0 200 200" className="gauge-svg">
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="20"
                    />

                    {/* Progress circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={config.color}
                        strokeWidth="20"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                        className="gauge-progress"
                    />

                    {/* Center text */}
                    <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        className="gauge-value"
                        fill={config.color}
                    >
                        {rageIndex}
                    </text>

                    <text
                        x="100"
                        y="115"
                        textAnchor="middle"
                        className="gauge-label"
                        fill="#6B7280"
                    >
                        Rage Index
                    </text>
                </svg>
            </div>

            {/* Severity Info */}
            <div className="severity-info" style={{ borderColor: config.color }}>
                <div className="severity-header">
                    <span className="severity-icon">{config.icon}</span>
                    <span
                        className="severity-label"
                        style={{ color: config.color }}
                    >
                        {config.label}
                    </span>
                </div>
                {showDetails && (
                    <p className="severity-description">{config.description}</p>
                )}
            </div>

            {/* Scale Reference */}
            {showDetails && (
                <div className="scale-reference">
                    <div className="scale-item">
                        <span className="scale-range">0-19</span>
                        <span className="scale-label">Minimal</span>
                    </div>
                    <div className="scale-item">
                        <span className="scale-range">20-39</span>
                        <span className="scale-label">Low</span>
                    </div>
                    <div className="scale-item">
                        <span className="scale-range">40-59</span>
                        <span className="scale-label">Moderate</span>
                    </div>
                    <div className="scale-item">
                        <span className="scale-range">60-79</span>
                        <span className="scale-label">High</span>
                    </div>
                    <div className="scale-item">
                        <span className="scale-range">80-100</span>
                        <span className="scale-label">Critical</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RageIndexGauge;
