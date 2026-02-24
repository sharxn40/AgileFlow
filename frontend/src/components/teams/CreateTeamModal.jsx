import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaUsers } from 'react-icons/fa';

const CreateTeamModal = ({ onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setError('Team name is required'); return; }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3000/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: name.trim(), description }),
            });
            const data = await res.json();
            if (res.ok) {
                onCreated(data);
                onClose();
            } else {
                setError(data.message || 'Failed to create team');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-project-modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><FaUsers style={{ marginRight: '10px', color: 'var(--theme-primary)' }} />Create New Team</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    {error && (
                        <div style={{ background: '#FFEBE6', color: '#BF2600', padding: '10px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '12px' }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label>Team Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Design Squad, Backend Team..."
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            className="form-textarea"
                            rows="3"
                            placeholder="What does this team work on?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: 'var(--theme-text-muted)', marginBottom: '8px' }}>
                        💡 You will become the <strong>Team Admin</strong> and can invite members after creation.
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CreateTeamModal;
