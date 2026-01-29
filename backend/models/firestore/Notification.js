const { db } = require('../../config/firebaseAdmin');

class Notification {
    static async create(data) {
        // data: { userId, type (invite/info), message, isRead, metadata, timestamp }
        const docRef = await db.collection('notifications').add({
            ...data,
            isRead: false,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...data };
    }

    static async getByUser(userId) {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .limit(20)
            .get();

        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory to avoid Firestore Index requirement
        return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    static async markAsRead(id) {
        await db.collection('notifications').doc(id).update({ isRead: true });
    }
}

module.exports = Notification;
