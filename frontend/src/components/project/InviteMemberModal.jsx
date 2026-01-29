import React, { useState } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

const InviteMemberModal = ({ isOpen, onClose, projectId }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    if (!isOpen) return null;

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/invitations/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email, projectId })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Invitation sent successfully!' });
                setEmail('');
                setTimeout(onClose, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to send invite' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(9, 30, 66, 0.54)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }} onClick={onClose}>
            <div style={{
                background: 'white', padding: '24px', borderRadius: '8px', width: '400px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#172B4D', margin: 0 }}>Invite to Project</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6C84' }}>
                        <FaTimes />
                    </button>
                </div>

                {message && (
                    <div style={{
                        padding: '8px 12px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem',
                        background: message.type === 'success' ? '#E3FCEF' : '#FFEBE6',
                        color: message.type === 'success' ? '#006644' : '#DE350B'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleInvite}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#44546F', marginBottom: '4px' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 12px', borderRadius: '4px',
                                border: '2px solid #DFE1E6', fontSize: '0.9rem',
                                color: '#172B4D', backgroundColor: '#FFFFFF'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '8px 16px', background: 'none', border: 'none', color: '#42526E', cursor: 'pointer', fontWeight: '500'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{
                            padding: '8px 16px', background: '#0052CC', color: 'white', border: 'none', borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            {loading ? 'Sending...' : <><FaPaperPlane size={12} /> Send Invite</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberModal;
