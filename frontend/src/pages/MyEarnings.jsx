import React, { useState, useEffect } from 'react';
import './MyEarnings.css';

const MyEarnings = () => {
    const [earnings, setEarnings] = useState({ payments: [], summary: { totalEarned: 0, pending: 0 } });
    const [projects, setProjects] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("MyEarnings mounted");
        const fetchEarnings = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log("Fetching earnings with token:", token ? "Present" : "Missing");
                const res = await fetch('http://localhost:3000/api/payments/mine', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Earnings response status:", res.status);
                if (res.ok) {
                    const data = await res.json();
                    setEarnings(data);

                    // Fetch project names
                    const pIds = [...new Set(data.payments.map(p => p.projectId))];
                    const pMap = {};
                    await Promise.all(pIds.map(async id => {
                        const pRes = await fetch(`http://localhost:3000/api/projects/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (pRes.ok) {
                            const pData = await pRes.json();
                            pMap[id] = pData.name;
                        }
                    }));
                    setProjects(pMap);
                }
            } catch (error) {
                console.error("Failed to fetch earnings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    if (loading) return <div className="p-loading">Loading Earnings...</div>;
    if (!earnings || !earnings.summary) return <div className="p-error">Unable to load earnings data.</div>;

    return (
        <div className="earnings-page">
            <h2>My Earnings & Payouts</h2>

            <div className="earnings-summary">
                <div className="earning-card total">
                    <h3>Total Paid</h3>
                    <div className="amount">${earnings.summary?.totalEarned?.toFixed(2) || '0.00'}</div>
                    <span className="subtitle">Lifecycle Earnings</span>
                </div>
                <div className="earning-card pending">
                    <h3>Pending</h3>
                    <div className="amount">${earnings.summary?.pending?.toFixed(2) || '0.00'}</div>
                    <span className="subtitle">Waiting for Payout</span>
                </div>
            </div>

            <div className="transactions-list">
                <h3>Transaction History</h3>
                <div className="table-responsive">
                    <table className="earnings-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Project</th>
                                <th>Task</th>
                                <th>Amount</th>
                                <th>Currency</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.payments.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">No transactions yet.</td></tr>
                            ) : (
                                earnings.payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                        <td>{projects[p.projectId] || p.projectId}</td>
                                        <td>{p.taskId || 'Manual Bonus'}</td>
                                        <td>{p.currency?.toUpperCase() || 'INR'} ₹{p.amount}</td>
                                        <td>{p.currency?.toUpperCase() || 'INR'}</td>
                                        <td>
                                            <span className={`status-pill ${p.status.toLowerCase()}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyEarnings;
