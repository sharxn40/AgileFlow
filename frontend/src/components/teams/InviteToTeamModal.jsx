import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaEnvelope, FaLink, FaCopy } from 'react-icons/fa';

const InviteToTeamModal = ({ team, onClose, onInviteSent }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) { setError('Email is required'); return; }

        setLoading(true);
        setError('');
        setSuccess(null);
        try {
            const res = await fetch(`http://localhost:3000/api/teams/${team.id}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(`Invitation sent to ${email}`);
                setInviteLink(data.inviteLink);
                onInviteSent(data.inviteLink);
                setEmail('');
            } else {
                setError(data.message || 'Failed to send invitation');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-project-modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><FaEnvelope style={{ marginRight: '10px', color: 'var(--theme-primary)' }} />Invite to {team.name}</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    {error && (
                        <div style={{ background: '#FFEBE6', color: '#BF2600', padding: '10px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '12px' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '10px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '12px' }}>
                            ✅ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Invite by Email</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    autoFocus
                                    required
                                    style={{ flex: 1 }}
                                />
                                <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                                    {loading ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {inviteLink && (
                        <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--theme-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaLink /> Shareable Invite Link
                            </p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <code style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)', flex: 1, wordBreak: 'break-all', lineHeight: 1.4 }}>
                                    {inviteLink}
                                </code>
                                <button
                                    onClick={copyLink}
                                    style={{ padding: '6px 12px', background: copied ? '#10b981' : 'var(--theme-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, fontSize: '0.8rem' }}
                                >
                                    {copied ? '✓ Copied' : <><FaCopy /> Copy</>}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InviteToTeamModal;
