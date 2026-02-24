import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';

const AcceptTeamInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading | success | error | login_required
    const [message, setMessage] = useState('');
    const [teamName, setTeamName] = useState('');

    const authToken = localStorage.getItem('token');

    useEffect(() => {
        if (!authToken) {
            // Save the invite link and redirect to login
            sessionStorage.setItem('pendingTeamInvite', token);
            setStatus('login_required');
            return;
        }
        acceptInvite();
    }, [token]);

    const acceptInvite = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/teams/accept-invite/${token}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setTeamName(data.team?.name || 'your new team');
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to accept invitation');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--theme-bg, #f8fafc)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px 40px',
                maxWidth: '440px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                    {status === 'loading' && '⌛'}
                    {status === 'success' && '🎉'}
                    {status === 'error' && '❌'}
                    {status === 'login_required' && '🔒'}
                </div>

                {status === 'loading' && (
                    <>
                        <h2 style={{ margin: '0 0 10px', color: '#172b4d' }}>Joining team...</h2>
                        <p style={{ color: '#6b778c' }}>Please wait while we process your invitation.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2 style={{ margin: '0 0 10px', color: '#172b4d' }}>You're in! 🚀</h2>
                        <p style={{ color: '#6b778c', marginBottom: '24px' }}>
                            You have successfully joined <strong>{teamName}</strong>.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/teams')}
                            style={{
                                padding: '12px 28px', background: '#6366f1', color: 'white',
                                border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
                            }}
                        >
                            <FaUsers style={{ marginRight: '8px' }} />
                            Go to My Teams
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 style={{ margin: '0 0 10px', color: '#172b4d' }}>Invitation Error</h2>
                        <p style={{ color: '#6b778c', marginBottom: '24px' }}>{message}</p>
                        <Link
                            to="/dashboard"
                            style={{
                                display: 'inline-block', padding: '12px 28px', background: '#6366f1', color: 'white',
                                borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem'
                            }}
                        >
                            Back to Dashboard
                        </Link>
                    </>
                )}

                {status === 'login_required' && (
                    <>
                        <h2 style={{ margin: '0 0 10px', color: '#172b4d' }}>Login Required</h2>
                        <p style={{ color: '#6b778c', marginBottom: '24px' }}>
                            You need to sign in first, then you'll be able to accept this team invitation.
                        </p>
                        <Link
                            to={`/login?redirect=/accept-team-invite/${token}`}
                            style={{
                                display: 'inline-block', padding: '12px 28px', background: '#6366f1', color: 'white',
                                borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem'
                            }}
                        >
                            Sign In to Continue
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default AcceptTeamInvite;
