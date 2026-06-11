import React, { useState } from 'react';
import './ThemeCloud.css';

const ThemeCloud = ({ themes }) => {
    const [selectedTheme, setSelectedTheme] = useState(null);

    if (!themes || themes.length === 0) {
        return (
            <div className="theme-cloud">
                <p className="no-themes">No themes detected yet. Analyze more mentions to extract themes.</p>
            </div>
        );
    }

    const getThemeSize = (intensityScore, maxScore) => {
        // Scale font size between 14px and 48px based on intensity
        const minSize = 14;
        const maxSize = 48;
        const normalized = intensityScore / maxScore;
        return minSize + (normalized * (maxSize - minSize));
    };

    const getThemeColor = (avgRageIndex) => {
        if (avgRageIndex >= 80) return '#DC2626';
        if (avgRageIndex >= 60) return '#EA580C';
        if (avgRageIndex >= 40) return '#F59E0B';
        return '#6B7280';
    };

    const maxScore = Math.max(...themes.map(t => t.intensityScore));

    return (
        <div className="theme-cloud">
            <div className="cloud-header">
                <h3>Top Rage Themes</h3>
                <p>Click a theme to see details</p>
            </div>

            {/* Word Cloud */}
            <div className="cloud-container">
                {themes.map((theme, index) => (
                    <span
                        key={index}
                        className={`theme-word ${selectedTheme === index ? 'selected' : ''}`}
                        style={{
                            fontSize: `${getThemeSize(theme.intensityScore, maxScore)}px`,
                            color: getThemeColor(theme.avgRageIndex),
                            opacity: 0.6 + (theme.intensityScore / maxScore) * 0.4
                        }}
                        onClick={() => setSelectedTheme(selectedTheme === index ? null : index)}
                    >
                        {theme.theme}
                    </span>
                ))}
            </div>

            {/* Theme Details */}
            <div className="theme-list">
                <h4>Theme Details</h4>
                {themes.map((theme, index) => (
                    <div
                        key={index}
                        className={`theme-detail ${selectedTheme === index ? 'expanded' : ''}`}
                        onClick={() => setSelectedTheme(selectedTheme === index ? null : index)}
                    >
                        <div className="detail-header">
                            <div className="header-left">
                                <span className="theme-rank">#{index + 1}</span>
                                <h5>{theme.theme}</h5>
                            </div>
                            <div className="header-right">
                                <span className="expand-icon">
                                    {selectedTheme === index ? '▼' : '▶'}
                                </span>
                            </div>
                        </div>

                        <div className="theme-stats">
                            <div className="stat-item">
                                <span className="stat-label">Frequency</span>
                                <span className="stat-value">{theme.frequency}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Rage Index</span>
                                <span
                                    className="stat-value"
                                    style={{ color: getThemeColor(theme.avgRageIndex) }}
                                >
                                    {theme.avgRageIndex}
                                </span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Intensity</span>
                                <span className="stat-value">{theme.intensityScore.toFixed(1)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">% of Mentions</span>
                                <span className="stat-value">{theme.percentage}%</span>
                            </div>
                        </div>

                        {/* Keywords */}
                        {theme.keywords && theme.keywords.length > 0 && (
                            <div className="theme-keywords">
                                <strong>Related Keywords:</strong>
                                <div className="keyword-tags">
                                    {theme.keywords.slice(0, 5).map((keyword, i) => (
                                        <span key={i} className="keyword-tag">{keyword}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Examples */}
                        {selectedTheme === index && theme.examples && (
                            <div className="theme-examples">
                                <strong>Example Mentions:</strong>
                                {theme.examples.map((example, i) => (
                                    <blockquote key={i} className="example-quote">
                                        <p>"{example.text}"</p>
                                        <footer>
                                            <span className="example-platform">{example.platform}</span>
                                            <span className="example-rage">Rage: {example.rageIndex}</span>
                                        </footer>
                                    </blockquote>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="theme-summary">
                <div className="summary-stat">
                    <span className="summary-label">Total Themes</span>
                    <span className="summary-value">{themes.length}</span>
                </div>
                <div className="summary-stat">
                    <span className="summary-label">Top Theme</span>
                    <span className="summary-value">{themes[0]?.theme}</span>
                </div>
                <div className="summary-stat">
                    <span className="summary-label">Avg Rage</span>
                    <span className="summary-value">
                        {Math.round(themes.reduce((sum, t) => sum + t.avgRageIndex, 0) / themes.length)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ThemeCloud;
