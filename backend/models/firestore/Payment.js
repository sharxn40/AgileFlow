const { db } = require('../../config/firebaseAdmin');

class Payment {
    static collection = db.collection('payments');

    static async create(paymentData) {
        const now = new Date().toISOString();
        const data = {
            projectId: paymentData.projectId,
            taskId: paymentData.taskId || null,
            workerId: paymentData.workerId,
            amount: paymentData.amount,
            currency: paymentData.currency || 'inr', // Default to INR for Razorpay
            status: paymentData.status || 'Pending', // 'Pending', 'Created', 'Paid', 'Failed'
            stripePaymentIntentId: null, // Deprecated
            razorpayOrderId: paymentData.razorpayOrderId || null,
            razorpayPaymentId: paymentData.razorpayPaymentId || null,
            razorpaySignature: paymentData.razorpaySignature || null,
            approvedBy: paymentData.approvedBy || null,
            createdAt: now,
            updatedAt: now,
            history: [{
                status: paymentData.status || 'Pending',
                timestamp: now,
                note: 'Payment record created'
            }]
        };

        const res = await Payment.collection.add(data);
        return { id: res.id, ...data };
    }

    static async findAll(query = {}) {
        let localQuery = Payment.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        // Limit to 100 for safety, can be paginated later
        const snapshot = await localQuery.orderBy('createdAt', 'desc').limit(100).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async findByPk(id) {
        if (!id) return null;
        const doc = await Payment.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async update(id, updates) {
        const docRef = Payment.collection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) throw new Error('Payment not found');
        const currentData = doc.data();

        // Update history if status changes
        let history = currentData.history || [];
        if (updates.status && updates.status !== currentData.status) {
            history.push({
                status: updates.status,
                timestamp: new Date().toISOString(),
                note: updates.note || 'Status updated'
            });
        }

        const cleanUpdates = { ...updates, updatedAt: new Date().toISOString(), history };
        delete cleanUpdates.note; // Don't save note field directly

        await docRef.update(cleanUpdates);
        return { id, ...currentData, ...cleanUpdates };
    }
}

module.exports = Payment;
