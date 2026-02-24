const Payment = require('../models/firestore/Payment');
const Project = require('../models/firestore/Project');
const Issue = require('../models/firestore/Issue');
const User = require('../models/firestore/User');
const crypto = require('crypto');
const razorpay = require('../utils/razorpay');

// Get all payments for a project (Project Lead / Admin)
exports.getProjectPayments = async (req, res) => {
    try {
        const { projectId } = req.params;
        const payments = await Payment.findAll({ where: { projectId } });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get worker earnings (Worker)
exports.getWorkerEarnings = async (req, res) => {
    try {
        const workerId = req.user.id;
        const payments = await Payment.findAll({ where: { workerId } });

        let totalEarned = 0;
        let pending = 0;

        payments.forEach(p => {
            if (p.status === 'Paid') totalEarned += p.amount;
            if (p.status === 'Pending' || p.status === 'Created') pending += p.amount;
        });

        res.json({
            payments,
            summary: { totalEarned, pending }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Configure Project Budget
exports.configureBudget = async (req, res) => {
    try {
        const { projectId, budget, paymentModel, budgetDistribution } = req.body;

        // Update Project
        await Project.update(projectId, {
            budget: Number(budget),
            paymentModel,
            budgetDistribution
        });

        res.json({ message: 'Project budget updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Razorpay Order
exports.processPayment = async (req, res) => {
    try {
        const { projectId, taskId, workerId, amount, currency = 'inr' } = req.body;

        if (!razorpay) {
            return res.status(500).json({ message: 'Razorpay not configured' });
        }

        // 1. Create Order
        const options = {
            amount: amount * 100, // Amount in paise
            currency: currency.toUpperCase(),
            receipt: `receipt_task_${taskId}`,
            notes: { projectId, taskId, workerId }
        };

        const order = await razorpay.orders.create(options);

        if (!order) return res.status(500).json({ message: 'Razorpay Order Unavailable' });

        // 2. Create Payment Record (Pending/Created)
        const payment = await Payment.create({
            projectId,
            taskId,
            workerId,
            amount: amount, // Store in actual currency unit, not paise
            currency: currency,
            status: 'Created',
            razorpayOrderId: order.id,
            approvedBy: req.user.id
        });

        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
            payment_db_id: payment.id,
            description: `Payment for Task: ${taskId}`
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Verify Razorpay Payment (Signature Check)
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            payment_db_id
        } = req.body;

        // 1. Generate Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // 2. Compare
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 3. Update DB
            const updatedPayment = await Payment.update(payment_db_id, {
                status: 'Paid',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            // 4. Update Task Status
            if (updatedPayment.taskId) {
                await Issue.update(updatedPayment.taskId, {
                    isPaid: true,
                    paymentStatus: 'Paid'
                });
            }

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            console.error("Signature Mismatch");
            res.status(400).json({ success: false, message: 'Invalid Signature' });
        }

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all payments (Admin Only)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll();
        // Optionally fetch task titles and usernames for better display
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Webhook Handler
exports.razorpayWebhook = async (req, res) => {
    res.json({ status: 'ok' });
};
