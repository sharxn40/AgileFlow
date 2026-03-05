const { admin, db } = require('../../config/firebaseAdmin');

class Message {
    static get collection() {
        return db.collection('messages');
    }

    static async create(data) {
        // data should include: teamId, userId, text, type, attachments
        const docRef = await this.collection.add({
            ...data,
            readBy: [data.userId], // Sender inherently read their own message
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...data, readBy: [data.userId], createdAt: new Date().toISOString() };
    }

    static async findAllByTeam(teamId, limit = 50) {
        const snapshot = await this.collection
            .where('teamId', '==', teamId)
            .get();

        let messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        // Sort chronologically and limit in JS to avoid complex Firestore setup for the user
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return messages.slice(-limit);
    }
}

module.exports = Message;
