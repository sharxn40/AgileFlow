const { db } = require('../../config/firebaseAdmin');

class Invitation {
    static collection = db.collection('invitations');

    static async create(data) {
        const now = new Date().toISOString();
        const docRef = Invitation.collection.doc();
        const inviteData = {
            email: data.email,
            projectId: data.projectId,
            token: data.token,
            status: 'pending', // pending, accepted, expired
            invitedBy: data.invitedBy,
            createdAt: now,
            expiresAt: data.expiresAt
        };

        await docRef.set(inviteData);
        return { id: docRef.id, ...inviteData };
    }

    static async findByToken(token) {
        const snapshot = await Invitation.collection.where('token', '==', token).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async update(id, updates) {
        await Invitation.collection.doc(id).update(updates);
    }
}

module.exports = Invitation;
