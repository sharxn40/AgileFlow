const { db } = require('../../config/firebaseAdmin');

class PaymentContract {
    static collection = db.collection('paymentContracts');

    static async create(contractData) {
        const now = new Date().toISOString();
        const data = {
            teamId: contractData.teamId,
            adminId: contractData.adminId, // The Payer
            seekerId: contractData.seekerId, // The Payee
            jobDescription: contractData.jobDescription || 'Standard Team Membership',
            paymentAmount: contractData.paymentAmount || 0,
            status: 'Active Job', // 'Active Job' | 'Ready for Payment' | 'Paid'
            createdAt: now,
            updatedAt: now,
        };
        const res = await PaymentContract.collection.add(data);
        return { id: res.id, ...data };
    }

    static async findByPk(id) {
        if (!id) return null;
        const doc = await PaymentContract.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findAll(query = {}) {
        let localQuery = PaymentContract.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        const snapshot = await localQuery.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(id, updates) {
        if (!id) return null;
        const now = new Date().toISOString();
        await PaymentContract.collection.doc(id).update({
            ...updates,
            updatedAt: now
        });
        return { id, ...updates, updatedAt: now };
    }
}

module.exports = PaymentContract;
