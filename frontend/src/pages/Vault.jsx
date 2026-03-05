import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaBriefcase, FaMoneyBillWave, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const Vault = () => {
    const { user, authFetch } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (user) fetchContracts();

        // Load Razorpay Script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [user]);

    const fetchContracts = async () => {
        try {
            const res = await authFetch('http://localhost:3000/api/vault/contracts');
            const data = await res.json();
            if (res.ok) {
                setContracts(data);
            }
        } catch (error) {
            console.error('Failed to fetch contracts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (contract, type) => {
        setActionLoading(contract.id);
        try {
            if (type === 'submit') {
                const res = await authFetch(`http://localhost:3000/api/vault/contracts/${contract.id}/submit`, { method: 'POST' });
                const resData = await res.json();
                if (res.ok) fetchContracts();
                else alert(resData.message || 'Failed to submit job.');
                setActionLoading(null);
            } else if (type === 'pay') {
                const orderRes = await authFetch(`http://localhost:3000/api/vault/contracts/${contract.id}/order`, { method: 'POST' });
                const orderData = await orderRes.json();

                if (!orderRes.ok) {
                    alert(orderData.message || 'Failed to generate payment link.');
                    setActionLoading(null);
                    return;
                }

                const options = {
                    key: orderData.key,
                    amount: orderData.order.amount,
                    currency: orderData.order.currency,
                    name: "AgileFlow Vault",
                    description: contract.jobDescription,
                    order_id: orderData.order.id,
                    handler: async function (response) {
                        try {
                            const verifyRes = await authFetch(`http://localhost:3000/api/vault/contracts/${contract.id}/pay`, {
                                method: 'POST',
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });

                            if (verifyRes.ok) {
                                fetchContracts();
                            } else {
                                alert((await verifyRes.json()).message || 'Verification failed.');
                            }
                        } catch (err) {
                            alert('Network error during verification.');
                        } finally {
                            setActionLoading(null);
                        }
                    },
                    prefill: { name: user.username, email: user.email },
                    theme: { color: "#10b981" }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (err) {
                    setActionLoading(null);
                });
                rzp.open();

                // Note: We don't unset actionLoading here; the handler callbacks will unset it.
            }
        } catch (error) {
            console.error('Vault action error:', error);
            alert('Failed to process network request.');
            setActionLoading(null);
        }
    };

    const formatINR = (amount) => {
        if (amount == null) return '₹ 0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active Job': return { bg: '#eef2ff', color: '#4f46e5' };
            case 'Ready for Payment': return { bg: '#fffbeb', color: '#d97706' };
            case 'Paid': return { bg: '#ecfdf5', color: '#10b981' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <FaSpinner className="spin" style={{ fontSize: '2rem', marginBottom: '10px' }} />
            <p>Loading the Vault...</p>
        </div>
    );

    const isSeeker = (contract) => String(contract.seekerId) === String(user?.id || user?._id);
    const isAdmin = (contract) => String(contract.adminId) === String(user?.id || user?._id);

    // Metrics
    const activeJobs = contracts.filter(c => c.status === 'Active Job' && isSeeker(c));
    const expectedEarnings = contracts.filter(c => c.status !== 'Paid' && isSeeker(c))
        .reduce((sum, c) => sum + Number(c.paymentAmount || 0), 0);
    const totalLiabilities = contracts.filter(c => c.status !== 'Paid' && isAdmin(c))
        .reduce((sum, c) => sum + Number(c.paymentAmount || 0), 0);

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 8px', color: '#0f172a' }}>
                        <FaLock style={{ color: '#10b981' }} /> The Vault
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Secure employment contracts and automated payments.</p>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Active Jobs (Seeker)</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{activeJobs.length}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '24px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.9 }}>Pipeline Earnings</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{formatINR(expectedEarnings)}</div>
                </div>
                <div style={{ background: '#fff1f2', padding: '24px', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
                    <div style={{ color: '#e11d48', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Admin Liabilities</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#be123c' }}>{formatINR(totalLiabilities)}</div>
                </div>
            </div>

            <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>Active & Past Contracts</h3>
            {contracts.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    <FaBriefcase style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }} />
                    <p>No contracts found in your Vault. Jobs you accept or offer will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {contracts.map(contract => {
                        const style = getStatusStyle(contract.status);
                        const isPayee = isSeeker(contract);

                        return (
                            <div key={contract.id} style={{
                                display: 'flex', alignItems: 'center', padding: '24px', background: 'white',
                                borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{contract.teamName}</h4>
                                        <span style={{
                                            background: style.bg, color: style.color, padding: '4px 8px',
                                            borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600'
                                        }}>
                                            {contract.status}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: '0.9rem' }}>{contract.jobDescription}</p>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {isPayee ? `Payer: ${contract.adminName}` : `Payee: ${contract.seekerName}`} • Created {new Date(contract.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', marginLeft: '24px' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: contract.status === 'Paid' ? '#10b981' : '#0f172a', marginBottom: '10px' }}>
                                        {formatINR(contract.paymentAmount)}
                                    </div>

                                    {/* Action Buttons entirely based on Role and Status */}
                                    {isPayee && contract.status === 'Active Job' && (
                                        <button
                                            onClick={() => handleAction(contract, 'submit')}
                                            disabled={actionLoading === contract.id}
                                            style={{ padding: '8px 16px', background: 'white', color: '#0052cc', border: '1px solid #0052cc', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                        >
                                            {actionLoading === contract.id ? 'Submitting...' : 'Submit Job'}
                                        </button>
                                    )}

                                    {!isPayee && contract.status !== 'Paid' && (
                                        <button
                                            onClick={() => handleAction(contract, 'pay')}
                                            disabled={actionLoading === contract.id}
                                            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <FaMoneyBillWave /> {actionLoading === contract.id ? 'Processing...' : 'Process Payment'}
                                        </button>
                                    )}

                                    {contract.status === 'Paid' && (
                                        <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                            <FaCheckCircle /> Settled
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Vault;
