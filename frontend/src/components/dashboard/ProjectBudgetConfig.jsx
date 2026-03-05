import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import PaymentApproval from './PaymentApproval'; // Import Approval Component
import ConfirmModal from '../common/ConfirmModal';
import './ProjectBudgetConfig.css';

const ProjectBudgetConfig = ({ onUpdate }) => {
    const { project } = useOutletContext() || {}; // Get project from Outlet
    const [budget, setBudget] = useState(project?.budget || 0);
    const [paymentModel, setPaymentModel] = useState(project?.paymentModel || 'None');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchPayments = async () => {
        if (!project?.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/payments/project/${project.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (error) {
            console.error("Failed to load payments", error);
        }
    };

    useEffect(() => {
        if (project) {
            setBudget(project.budget || 0);
            setPaymentModel(project.paymentModel || 'None');
            fetchPayments();
        }
        // eslint-disable-next-line
    }, [project?.id]);

    if (!project) {
        return <div className="p-dashboard-loading">Loading configuration...</div>;
    }

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:3000/api/payments/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: project.id,
                    budget,
                    paymentModel
                })
            });
            alert('Budget Settings Saved');
            if (onUpdate) onUpdate();
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (payment) => {
        if (!confirm(`Confirm payment of $${payment.amount} to worker?`)) return;

        // In a real flow, this would trigger the backend to make the Stripe transfer
        // For this demo, we assume the "Payment" record already exists in "Pending/Approved" state 
        // and we are just moving it to "Processing/Paid".
        // HOWEVER, the backend processPayment actually CREATES the record.
        // So we need a list of TASKS that are "Done" but not "Paid".

        // This component view is likely "Transaction History".
        // The "Approval" view should be separate.
    };

    const handleDeleteProject = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/projects/${project.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                // Successfully deleted
                setIsDeleteModalOpen(false);
                navigate('/dashboard'); // Kick them back to dashboard
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete project.');
            }
        } catch (error) {
            console.error('Delete project error:', error);
            alert('A network error occurred while trying to delete the project.');
        }
    };

    return (
        <div className="budget-config-container">
            <h3>Budget & Payment Settings</h3>

            <div className="config-section">
                <div className="form-group">
                    <label>Total Project Budget ($)</label>
                    <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Payment Model</label>
                    <select value={paymentModel} onChange={(e) => setPaymentModel(e.target.value)}>
                        <option value="None">None</option>
                        <option value="Fixed">Fixed Project Price</option>
                        <option value="PerTask">Per Task</option>
                        <option value="PerStoryPoint">Per Story Point</option>
                        <option value="Milestone">Milestone Based</option>
                    </select>
                </div>

                <button className="btn-primary" onClick={handleSaveConfig} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <h3>Payment Approvals</h3>
            <PaymentApproval projectId={project.id} />

            <hr />

            <h3>Payment History</h3>
            <div className="payment-list">
                <table className="payment-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Worker</th>
                            <th>Task</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td>{p.workerId}</td>
                                <td>{p.taskId || '-'}</td>
                                <td>${p.amount}</td>
                                <td>
                                    <span className={`status-badge ${p.status.toLowerCase()}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan="5">No payments found.</td></tr>}
                    </tbody>
                </table>
            </div>

            <hr style={{ margin: '40px 0', borderColor: 'rgba(255, 60, 60, 0.2)' }} />

            <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>
                    Permanently delete this project and all of its associated boards, sprints, and issues. This action cannot be undone.
                </p>
                <button
                    className="btn-danger"
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    Delete Project
                </button>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                message={<>Are you sure you want to delete the project <strong>{project.name}</strong>? All associated boards, sprints, and issues will be permanently wiped.</>}
                confirmText="Yes, Delete Project"
                type="danger"
            />
        </div>
    );
};

export default ProjectBudgetConfig;
