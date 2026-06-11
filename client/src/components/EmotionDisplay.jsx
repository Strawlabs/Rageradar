import React from 'react';
import './EmotionDisplay.css';

const EmotionDisplay = ({ emotions, primaryEmotion }) => {
    const emotionColors = {
        anger: '#DC2626',
        fury: '#991B1B',
        frustration: '#EA580C',
        annoyance: '#F97316',
        disgust: '#7C2D12',
        disappointment: '#92400E',
        sadness: '#1E40AF',
        fear: '#4C1D95',
        joy: '#10B981',
        love: '#EC4899',
        admiration: '#8B5CF6',
        excitement: '#F59E0B',
        gratitude: '#14B8A6',
        surprise: '#6366F1',
        confusion: '#64748B',
        realization: '#0EA5E9'
    };

    const getConfidenceBadge = (confidence) => {
        const badges = {
            high: { color: '#10B981', text: 'High' },
            medium: { color: '#F59E0B', text: 'Medium' },
            low: { color: '#6B7280', text: 'Low' }
        };
        return badges[confidence] || badges.low;
    };

    if (!emotions || emotions.length === 0) {
        return (
            <div className="emotion-display">
                <p className="no-emotions">No emotions detected</p>
            </div>
        );
    }

    return (
        <div className="emotion-display">
            <h3 className="emotion-title">Detected Emotions</h3>

            {/* Primary Emotion */}
            {primaryEmotion && (
                <div
                    className="primary-emotion"
                    style={{ borderColor: emotionColors[primaryEmotion] }}
                >
                    <div className="emotion-header">
                        <span className="emotion-label">{primaryEmotion}</span>
                        <span className="primary-badge">Primary</span>
                    </div>
                </div>
            )}

            {/* All Emotions */}
            <div className="emotion-list">
                {emotions.map((emotion, index) => {
                    const badge = getConfidenceBadge(emotion.confidence);

                    return (
                        <div
                            key={index}
                            className="emotion-item"
                            style={{ borderLeftColor: emotionColors[emotion.label] }}
                        >
                            <div className="emotion-info">
                                <span className="label">{emotion.label}</span>
                                <span
                                    className="confidence-badge"
                                    style={{ backgroundColor: badge.color }}
                                >
                                    {badge.text}
                                </span>
                            </div>

                            <div className="score-container">
                                <div className="score-bar">
                                    <div
                                        className="score-fill"
                                        style={{
                                            width: `${emotion.score * 100}%`,
                                            backgroundColor: emotionColors[emotion.label]
                                        }}
                                    />
                                </div>
                                <span className="score-text">
                                    {Math.round(emotion.score * 100)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Emotion Distribution */}
            {emotions.length > 1 && (
                <div className="emotion-distribution">
                    <h4>Distribution</h4>
                    <div className="distribution-bars">
                        {emotions.slice(0, 5).map((emotion, index) => (
                            <div key={index} className="distribution-item">
                                <span className="dist-label">{emotion.label}</span>
                                <div className="dist-bar">
                                    <div
                                        className="dist-fill"
                                        style={{
                                            width: `${(emotion.score / emotions[0].score) * 100}%`,
                                            backgroundColor: emotionColors[emotion.label]
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmotionDisplay;
