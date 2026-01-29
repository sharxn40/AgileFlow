import React, { useState, useEffect } from 'react';
import { FaClock, FaHistory, FaCheck, FaSave } from 'react-icons/fa';
import './TimeTracker.css';

const TimeTracker = ({ issue, onUpdate }) => {
    // Expect issue to have: timeSpent (mins), originalEstimate (mins), remainingEstimate (mins)

    const [timeSpentInput, setTimeSpentInput] = useState('');
    const [remainingInput, setRemainingInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [mode, setMode] = useState('view'); // 'view' or 'log'

    useEffect(() => {
        if (issue) {
            setTimeSpentInput(formatTime(issue.timeSpent || 0));
            setRemainingInput(formatTime(issue.remainingEstimate || 0));
        }
    }, [issue]);

    const formatTime = (minutes) => {
        if (!minutes) return '0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    };

    const parseTime = (str) => {
        // Simple parser: "2h 30m" -> 150
        let total = 0;
        const matchesH = str.match(/(\d+)h/);
        const matchesM = str.match(/(\d+)m/);

        if (matchesH) total += parseInt(matchesH[1]) * 60;
        if (matchesM) total += parseInt(matchesM[1]);

        // If just a number, assume minutes (or hours if < 8? Let's assume minutes for consistency)
        if (!matchesH && !matchesM) {
            const num = parseInt(str);
            if (!isNaN(num)) total += num;
        }
        return total;
    };

    const handleSave = async () => {
        const newTimeSpent = parseTime(timeSpentInput);
        const newRemaining = parseTime(remainingInput);
        // If original estimate is 0/null and we are setting remaining, set original to remaining (initial case)
        const currentOriginal = issue.originalEstimate || 0;

        const updates = {
            timeSpent: newTimeSpent,
            remainingEstimate: newRemaining,
            originalEstimate: currentOriginal === 0 && newRemaining > 0 ? newRemaining : currentOriginal
        };

        // Call parent update
        if (onUpdate) {
            await onUpdate({ ...issue, ...updates });
        }
        setIsEditing(false);
    };

    // Progress Calculation
    const original = issue.originalEstimate || 0;
    const spent = issue.timeSpent || 0;
    const remaining = issue.remainingEstimate || 0;

    // Progress bar logic usually: spent / (spent + remaining) ? Or spent / original ?
    // Jira uses: progress = spent / (spent + remaining)
    const totalWork = spent + remaining;
    const progress = totalWork > 0 ? Math.round((spent / totalWork) * 100) : 0;

    return (
        <div className="time-tracker-container">
            <div className="time-tracker-header">
                <h3><FaClock /> Time Tracking</h3>
                {!isEditing && (
                    <button className="btn-link" onClick={() => setIsEditing(true)}>Edit</button>
                )}
            </div>

            {isEditing ? (
                <div className="time-edit-form">
                    <div className="form-group small">
                        <label>Time Spent</label>
                        <input
                            type="text"
                            value={timeSpentInput}
                            onChange={(e) => setTimeSpentInput(e.target.value)}
                            placeholder="e.g. 2h 30m"
                        />
                    </div>
                    <div className="form-group small">
                        <label>Remaining</label>
                        <input
                            type="text"
                            value={remainingInput}
                            onChange={(e) => setRemainingInput(e.target.value)}
                            placeholder="e.g. 4h"
                        />
                    </div>
                    <div className="edit-actions">
                        <button className="btn-primary small" onClick={handleSave}><FaSave /> Save</button>
                        <button className="btn-secondary small" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="time-display">
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="time-stats">
                        <div className="stat-item">
                            <span className="stat-value">{formatTime(spent)}</span>
                            <span className="stat-label">Logged</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{formatTime(remaining)}</span>
                            <span className="stat-label">Remaining</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{formatTime(original)}</span>
                            <span className="stat-label">Original</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeTracker;
