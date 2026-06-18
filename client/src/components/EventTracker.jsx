import React, { useState } from 'react';
import './EventTracker.css';

const EventTracker = ({ brandId, onEventCreated }) => {
    const [formData, setFormData] = useState({
        eventName: '',
        eventDate: '',
        eventType: 'launch',
        preEventDays: 7,
        postEventDays: 14,
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const eventTypes = [
        { value: 'launch', label: '🚀 Product Launch', icon: '🚀' },
        { value: 'crisis', label: '🔥 Crisis/Incident', icon: '🔥' },
        { value: 'announcement', label: '📢 Announcement', icon: '📢' },
        { value: 'update', label: '🔄 Update/Change', icon: '🔄' },
        { value: 'controversy', label: '⚠️ Controversy', icon: '⚠️' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = await getAuthToken(); // Implement this based on your auth

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brandId,
                    userId: getCurrentUserId(), // Implement this
                    ...formData
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create event');
            }

            const data = await response.json();

            // Reset form
            setFormData({
                eventName: '',
                eventDate: '',
                eventType: 'launch',
                preEventDays: 7,
                postEventDays: 14,
                description: ''
            });

            if (onEventCreated) {
                onEventCreated(data.event);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="event-tracker">
            <div className="tracker-header">
                <h3>Create Event</h3>
                <p>Track emotional changes around specific events</p>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
                {/* Event Name */}
                <div className="form-group">
                    <label htmlFor="eventName">Event Name *</label>
                    <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        value={formData.eventName}
                        onChange={handleChange}
                        placeholder="e.g., iPhone 16 Launch"
                        required
                    />
                </div>

                {/* Event Date */}
                <div className="form-group">
                    <label htmlFor="eventDate">Event Date *</label>
                    <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Event Type */}
                <div className="form-group">
                    <label htmlFor="eventType">Event Type *</label>
                    <div className="event-type-grid">
                        {eventTypes.map(type => (
                            <label
                                key={type.value}
                                className={`event-type-option ${formData.eventType === type.value ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="eventType"
                                    value={type.value}
                                    checked={formData.eventType === type.value}
                                    onChange={handleChange}
                                />
                                <span className="type-icon">{type.icon}</span>
                                <span className="type-label">{type.label.replace(/^.+ /, '')}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Time Windows */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="preEventDays">Pre-Event Days</label>
                        <input
                            type="number"
                            id="preEventDays"
                            name="preEventDays"
                            value={formData.preEventDays}
                            onChange={handleChange}
                            min="1"
                            max="30"
                        />
                        <small>Days before event to analyze</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="postEventDays">Post-Event Days</label>
                        <input
                            type="number"
                            id="postEventDays"
                            name="postEventDays"
                            value={formData.postEventDays}
                            onChange={handleChange}
                            min="1"
                            max="30"
                        />
                        <small>Days after event to analyze</small>
                    </div>
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Add any additional context about this event..."
                        rows="3"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Creating Event...
                        </>
                    ) : (
                        <>
                            <span>✨</span>
                            Create Event & Analyze
                        </>
                    )}
                </button>
            </form>

            {/* Info Box */}
            <div className="info-box">
                <h4>💡 How Event Tracking Works</h4>
                <ul>
                    <li>We analyze mentions before, during, and after your event</li>
                    <li>Compare emotional changes across time periods</li>
                    <li>Identify spikes and shifts in sentiment</li>
                    <li>Generate insights and recommendations</li>
                </ul>
            </div>
        </div>
    );
};

// Helper functions (implement based on your auth setup)
const getAuthToken = async () => {
    // Return Supabase auth token
    return localStorage.getItem('authToken');
};

const getCurrentUserId = () => {
    // Return current user ID
    return localStorage.getItem('userId');
};

export default EventTracker;
