import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    ComposedChart
} from 'recharts';
import './TrendlineChart.css';

const TrendlineChart = ({ trendline, height = 400 }) => {
    if (!trendline || !trendline.timeline || trendline.timeline.length === 0) {
        return (
            <div className="trendline-chart">
                <p className="no-data">No trendline data available</p>
            </div>
        );
    }

    const { timeline, movingAverage, movingAverages, spikes, trends } = trendline;

    // Format data for chart
    const chartData = timeline.map((point, index) => ({
        ...point,
        date: new Date(point.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            ...(point.timestamp.includes('T') && !point.timestamp.endsWith('T00:00:00.000Z') ? { hour: '2-digit', minute: '2-digit' } : {})
        }),
        movingAvg7d: movingAverages?.['7d']?.[index]?.value || movingAverage?.[index]?.value || null,
        movingAvg30d: movingAverages?.['30d']?.[index]?.value || null
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const spike = spikes?.find(s => s.timestamp === data.timestamp);
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-date">{data.date}</p>
                    <p className="tooltip-rage">
                        Rage Index: <strong>{data.rageIndex}</strong>
                    </p>
                    {data.movingAvg7d && (
                        <p className="tooltip-avg" style={{ color: '#3B82F6' }}>
                            7-Period Avg: <strong>{Math.round(data.movingAvg7d)}</strong>
                        </p>
                    )}
                    {data.movingAvg30d && (
                        <p className="tooltip-avg" style={{ color: '#8B5CF6' }}>
                            30-Period Avg: <strong>{Math.round(data.movingAvg30d)}</strong>
                        </p>
                    )}
                    <p className="tooltip-mentions">
                        Mentions: {data.mentionCount}
                    </p>
                    {data.severity && (
                        <p className="tooltip-severity">
                            Severity: <span className={`severity-${data.severity}`}>
                                {data.severity}
                            </span>
                        </p>
                    )}
                    {spike && (
                        <div className="tooltip-spike-box" style={{ marginTop: '8px', padding: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px' }}>
                            <p style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '12px', margin: 0 }}>
                                🚨 Rage Spike Alert ({spike.severity.toUpperCase()})
                            </p>
                            <p style={{ color: '#991B1B', fontSize: '11px', margin: '4px 0 0 0' }}>
                                +{spike.deviation} pts over mean ({spike.rollingMean || 'N/A'})
                            </p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    // Trend indicator
    const getTrendIcon = (direction) => {
        if (direction === 'increasing') return '📈';
        if (direction === 'decreasing') return '📉';
        return '➡️';
    };

    const getTrendColor = (direction) => {
        if (direction === 'increasing') return '#DC2626';
        if (direction === 'decreasing') return '#10B981';
        return '#6B7280';
    };

    return (
        <div className="trendline-chart">
            <div className="chart-header">
                <h3>Rage Index Trendline</h3>

                {trends && (
                    <div
                        className="trend-indicator"
                        style={{ color: getTrendColor(trends.direction) }}
                    >
                        <span className="trend-icon">{getTrendIcon(trends.direction)}</span>
                        <span className="trend-text">
                            {trends.percentChange > 0 ? '+' : ''}{trends.percentChange}%
                        </span>
                        <span className="trend-label">{trends.direction}</span>
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={chartData}>
                    <defs>
                        <linearGradient id="rageGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                    <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        style={{ fontSize: '12px' }}
                    />

                    <YAxis
                        domain={[0, 100]}
                        stroke="#6B7280"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Rage Index', angle: -90, position: 'insideLeft' }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="line"
                    />

                    {/* Severity zones */}
                    <ReferenceLine y={80} stroke="#DC2626" strokeDasharray="3 3" label="Critical" />
                    <ReferenceLine y={60} stroke="#EA580C" strokeDasharray="3 3" label="High" />
                    <ReferenceLine y={40} stroke="#F59E0B" strokeDasharray="3 3" label="Moderate" />

                    {/* Spike markers */}
                    {spikes && spikes.map((spike, index) => {
                        const spikeData = chartData.find(d => d.timestamp === spike.timestamp);
                        if (spikeData) {
                            return (
                                <ReferenceLine
                                    key={index}
                                    x={spikeData.date}
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    label={{
                                        value: '⚠️',
                                        position: 'top',
                                        fill: '#EF4444'
                                    }}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Area under curve */}
                    <Area
                        type="monotone"
                        dataKey="rageIndex"
                        fill="url(#rageGradient)"
                        stroke="none"
                    />

                    {/* Main rage index line */}
                    <Line
                        type="monotone"
                        dataKey="rageIndex"
                        stroke="#DC2626"
                        strokeWidth={3}
                        dot={{ fill: '#DC2626', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Rage Index"
                    />

                    {/* 7-Period Moving Average line */}
                    {(movingAverages?.['7d'] || movingAverage) && (
                        <Line
                            type="monotone"
                            dataKey="movingAvg7d"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="7-Period Average"
                        />
                    )}

                    {/* 30-Period Moving Average line */}
                    {movingAverages?.['30d'] && movingAverages['30d'].length > 0 && (
                        <Line
                            type="monotone"
                            dataKey="movingAvg30d"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="30-Period Average"
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            {trendline.summary && (
                <div className="chart-summary">
                    <div className="summary-item">
                        <span className="summary-label">Average</span>
                        <span className="summary-value">{trendline.summary.avgRageIndex}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Peak</span>
                        <span className="summary-value peak">{trendline.summary.peakRageIndex}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Lowest</span>
                        <span className="summary-value low">{trendline.summary.lowestRageIndex}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Volatility</span>
                        <span className={`summary-value volatility-${trendline.summary.volatility}`}>
                            {trendline.summary.volatility}
                        </span>
                    </div>
                </div>
            )}

            {/* Spikes List */}
            {spikes && spikes.length > 0 && (
                <div className="spikes-list">
                    <h4>Detected Rage Spikes (Statistical Anomalies)</h4>
                    {spikes.slice(0, 5).map((spike, index) => (
                        <div key={index} className="spike-item">
                            <span className="spike-icon">⚠️</span>
                            <div className="spike-info" style={{ flex: 1, marginLeft: '8px' }}>
                                <span className="spike-date" style={{ fontWeight: '600' }}>
                                    {new Date(spike.date).toLocaleDateString()} {spike.timestamp?.includes('T') && !spike.timestamp.endsWith('T00:00:00.000Z') ? new Date(spike.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                                <span className="spike-rage" style={{ display: 'block', fontSize: '12px', color: '#6B7280' }}>
                                    Score: {spike.rageIndex} (+{spike.deviation} pts vs rolling mean {spike.rollingMean || 'N/A'})
                                </span>
                            </div>
                            <span className={`spike-severity ${spike.severity}`}>
                                {spike.severity.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrendlineChart;
