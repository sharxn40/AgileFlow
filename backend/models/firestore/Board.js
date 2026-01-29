const { db } = require('../../config/firebaseAdmin');

class Board {
    static collection = db.collection('boards');

    static async create(data) {
        const now = new Date().toISOString();
        const boardData = {
            name: data.name,
            projectId: data.projectId,
            columns: data.columns || ['To Do', 'In Progress', 'Done'], // Default columns
            createdAt: now,
            updatedAt: now
        };
        const res = await Board.collection.add(boardData);
        return { id: res.id, ...boardData };
    }

    static async findByPk(id) {
        if (!id) return null;
        const doc = await Board.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findOne(query) {
        let localQuery = Board.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        const snapshot = await localQuery.limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async update(id, updates) {
        await Board.collection.doc(id).update({
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return { id, ...updates };
    }
}

module.exports = Board;
