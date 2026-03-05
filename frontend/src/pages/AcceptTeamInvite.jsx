import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaBriefcase, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AcceptTeamInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading_offer'); // loading_offer | viewing_offer | accepting | success | error
    const [message, setMessage] = useState('');
    const [inviteDetails, setInviteDetails] = useState(null);
    const [teamDetails, setTeamDetails] = useState(null);

    const authToken = localStorage.getItem('token');

    useEffect(() => {
        fetchOfferDetails();
    }, [token]);

    const fetchOfferDetails = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/teams/invite/${token}`);
            const data = await res.json();

            if (res.ok) {
                setInviteDetails(data.invitation);
                setTeamDetails(data.team);
                setStatus('viewing_offer');
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to load offer details');
            }
        } catch {
            setStatus('error');
            setMessage('Network error while validating the invitation link.');
        }
    };

    const handleAcceptClick = () => {
        if (!authToken) {
            sessionStorage.setItem('pendingTeamInvite', token);
            navigate(`/login?redirect=/accept-team-invite/${token}`);
            return;
        }
        processAcceptance();
    };

    const handleDeclineClick = () => {
        // Just redirect home for now; could also ping a decline endpoint.
        navigate('/');
    };

    const processAcceptance = async () => {
        setStatus('accepting');
        try {
            const res = await fetch(`http://localhost:3000/api/teams/accept-invite/${token}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to accept the offer');
            }
        } catch {
            setStatus('error');
            setMessage('Network error while trying to accept the offer.');
        }
    };

    // Helper to format INR securely
    const formatINR = (amount) => {
        if (!amount && amount !== 0) return '₹ 0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--theme-bg, #f4f5f7)', fontFamily: "'Inter', sans-serif", padding: '20px'
        }}>
            <div style={{
                background: 'white', borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '100%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)'
            }}>
                {status === 'loading_offer' || status === 'accepting' ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>⌛</div>
                        <h2 style={{ color: '#172b4d' }}>{status === 'loading_offer' ? 'Loading Offer...' : 'Processing Contract...'}</h2>
                        <p style={{ color: '#6b778c' }}>Please wait a moment.</p>
                    </div>
                ) : status === 'error' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px', color: '#ff5630' }}><FaTimesCircle /></div>
                        <h2 style={{ margin: '0 0 10px', color: '#172b4d' }}>Offer Unavailable</h2>
                        <p style={{ color: '#6b778c', marginBottom: '24px' }}>{message}</p>
                        <Link to="/" style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--theme-primary, #0052cc)', color: 'white', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>
                            Return Home
                        </Link>
                    </div>
                ) : status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px', color: '#36b37e' }}><FaCheckCircle /></div>
                        <h2 style={{ margin: '0 0 10px', color: '#172b4d' }}>Offer Accepted! 🎉</h2>
                        <p style={{ color: '#6b778c', marginBottom: '24px' }}>
                            You have joined <strong>{teamDetails?.name}</strong> and your Payment Contract is now active.
                        </p>
                        <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', background: 'var(--theme-primary, #0052cc)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <FaBriefcase /> Go to Dashboard
                        </button>
                    </div>
                ) : status === 'viewing_offer' && inviteDetails && teamDetails ? (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h2 style={{ margin: '0 0 8px', color: '#172b4d', fontSize: '1.5rem' }}>You've received a Job Offer</h2>
                            <p style={{ color: '#6b778c', margin: 0, fontSize: '0.95rem' }}>
                                from the team <strong>{teamDetails.name}</strong>
                            </p>
                        </div>

                        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '24px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaBriefcase /> Job Description
                                </div>
                                <div style={{ color: '#0f172a', lineHeight: '1.5', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                    {inviteDetails.jobDescription || "Standard team membership workflow. Assist the team in achieving project goals."}
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '20px 0' }} />

                            <div>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaMoneyBillWave /> Payment Offer
                                </div>
                                <div style={{ color: '#059669', fontSize: '1.8rem', fontWeight: '800' }}>
                                    {formatINR(inviteDetails.paymentAmount)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                    Paid upon secure completion of the contract.
                                </div>
                            </div>
                        </div>

                        {!authToken && (
                            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#0284c7', borderRadius: '8px', fontSize: '0.85rem' }}>
                                🔒 You will be asked to sign in or create an account to accept this contract.
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleDeclineClick} style={{ flex: 1, padding: '14px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem' }}>
                                Decline
                            </button>
                            <button onClick={handleAcceptClick} style={{ flex: 2, padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
                                Accept Offer
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AcceptTeamInvite;
