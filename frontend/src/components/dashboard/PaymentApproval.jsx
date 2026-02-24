import React, { useState, useEffect } from 'react';
import './PaymentApproval.css';

const PaymentApproval = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingTasks();
        // Dynamic Load Razorpay SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [projectId]);

    const fetchPendingTasks = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3000/api/issues?projectId=${projectId}&status=Done`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            const unpaid = data.filter(t => !t.isPaid && t.paymentAmount > 0);
            setTasks(unpaid);
        } catch (error) {
            console.error("Failed to fetch pending tasks", error);
        }
    };

    const handleApprovePayment = async (task) => {
        if (!confirm(`Approve payment of $${task.paymentAmount} for task "${task.title}"?`)) return;

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            // 1. Create Order
            const orderRes = await fetch('http://localhost:3000/api/payments/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    taskId: task.id,
                    workerId: task.assigneeId,
                    amount: task.paymentAmount,
                    currency: 'inr' // Changed to INR for Razorpay Test
                })
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok) throw new Error(orderData.message);

            // 2. Open Razorpay Checkout
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "AgileFlow Project",
                description: orderData.description,
                order_id: orderData.order_id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch('http://localhost:3000/api/payments/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                payment_db_id: orderData.payment_db_id
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            alert('Payment Successful & Verified!');
                            fetchPendingTasks();
                        } else {
                            alert('Payment Verification Failed: ' + verifyData.message);
                        }
                    } catch (verifyError) {
                        alert('Verification Error: ' + verifyError.message);
                    }
                },
                prefill: {
                    name: "Worker Name", // Could fetch worker name
                    email: "worker@example.com",
                    contact: "9999999999"
                },
                notes: {
                    taskId: task.id
                },
                theme: {
                    color: "#0052CC"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert('Error initiating payment: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-approval-container">
            <h3>Pending Payment Approvals</h3>
            {tasks.length === 0 ? (
                <p className="no-tasks">No completed tasks waiting for payment.</p>
            ) : (
                <div className="task-list">
                    {tasks.map(task => (
                        <div key={task.id} className="payment-task-card">
                            <div className="task-info">
                                <h4>{task.title}</h4>
                                <span className="assignee">Worker: {task.assigneeId || 'Unassigned'}</span>
                            </div>
                            <div className="payment-actions">
                                <span className="amount">${task.paymentAmount}</span>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleApprovePayment(task)}
                                    disabled={loading}
                                >
                                    Pay Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentApproval;
