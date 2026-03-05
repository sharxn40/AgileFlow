import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import './ScheduleMeetingModal.css';

const ScheduleMeetingModal = ({ team, onClose, onSchedule }) => {
    const [title, setTitle] = useState(`${team?.name} Sync`);
    const [meetingLink, setMeetingLink] = useState('');
    const [scheduledFor, setScheduledFor] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSchedule({ title, meetingLink, scheduledFor });
        setLoading(false);
    };

    return (
        <div className="modal-overlay">
            <div className="meeting-modal">
                <div className="modal-header">
                    <h2>Schedule Team Meeting</h2>
                    <button className="btn-close" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Meeting Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Weekly Standup"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Google Meet Link
                            <button
                                type="button"
                                className="inline-action-btn"
                                onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                title="Generate new Google Meet room"
                            >
                                Generate New <FaExternalLinkAlt size={10} />
                            </button>
                        </label>
                        <div className="input-with-icon">
                            <FaLink className="input-icon" />
                            <input
                                type="url"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Date & Time</label>
                        <div className="input-with-icon">
                            <FaCalendarAlt className="input-icon" />
                            <input
                                type="datetime-local"
                                value={scheduledFor}
                                onChange={(e) => setScheduledFor(e.target.value)}
                                required
                            />
                        </div>
                        <small className="help-text">AgileFlow will automatically notify all {team?.members?.length || 0} team members and add it to their Dashboards.</small>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading || !title || !meetingLink || !scheduledFor}>
                            {loading ? 'Scheduling...' : 'Schedule Meeting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleMeetingModal;
