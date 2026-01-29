import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Verifying invitation...');

    useEffect(() => {
        const accept = async () => {
            try {
                const authToken = localStorage.getItem('token');

                if (!authToken) {
                    setStatus('error');
                    setMessage('Please log in to accept this invitation.');
                    // Optionally redirect to login with return URL
                    setTimeout(() => navigate(`/login?returnUrl=/accept-invite/${token}`), 2000);
                    return;
                }

                const res = await fetch('http://localhost:3000/api/invitations/accept', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage('Invitation accepted! Redirecting to project...');
                    setTimeout(() => navigate(`/project/${data.projectId}`), 2000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Failed to accept invitation.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            }
        };

        accept();
    }, [token, navigate]);

    return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F4F5F7'
        }}>
            <div style={{
                background: 'white', padding: '40px', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px'
            }}>
                {status === 'processing' && (
                    <>
                        <FaSpinner className="spin" size={48} color="#0052CC" style={{ marginBottom: '20px' }} />
                        <h2 style={{ color: '#172B4D' }}>Joining Project...</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FaCheckCircle size={48} color="#36B37E" style={{ marginBottom: '20px' }} />
                        <h2 style={{ color: '#172B4D' }}>Welcome Aboard!</h2>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FaExclamationTriangle size={48} color="#FF5630" style={{ marginBottom: '20px' }} />
                        <h2 style={{ color: '#172B4D' }}>Invitation Failed</h2>
                    </>
                )}

                <p style={{ color: '#5E6C84', marginTop: '8px' }}>{message}</p>

                {status === 'error' && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            marginTop: '20px', padding: '10px 20px', background: '#0052CC', color: 'white',
                            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'
                        }}
                    >
                        Go to Dashboard
                    </button>
                )}
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AcceptInvite;
