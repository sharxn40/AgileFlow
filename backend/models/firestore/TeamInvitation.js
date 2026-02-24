const { db } = require('../../config/firebaseAdmin');
const crypto = require('crypto');

class TeamInvitation {
    static collection = db.collection('teamInvitations');

    static async create(inviteData) {
        const now = new Date().toISOString();
        const token = crypto.randomBytes(32).toString('hex');
        const data = {
            teamId: inviteData.teamId,
            inviteeEmail: inviteData.inviteeEmail.toLowerCase().trim(),
            token,
            status: 'pending', // pending | accepted | declined
            createdAt: now,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        };
        const res = await TeamInvitation.collection.add(data);
        return { id: res.id, ...data };
    }

    static async findByToken(token) {
        const snapshot = await TeamInvitation.collection.where('token', '==', token).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async findPending(teamId, email) {
        const snapshot = await TeamInvitation.collection
            .where('teamId', '==', teamId)
            .where('inviteeEmail', '==', email.toLowerCase().trim())
            .where('status', '==', 'pending')
            .limit(1)
            .get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async accept(id) {
        await TeamInvitation.collection.doc(id).update({ status: 'accepted' });
    }

    static async decline(id) {
        await TeamInvitation.collection.doc(id).update({ status: 'declined' });
    }
}

module.exports = TeamInvitation;
