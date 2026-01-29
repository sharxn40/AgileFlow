const { db } = require('../../config/firebaseAdmin');

class Task {
    static collection = db.collection('tasks');

    static async create(taskData) {
        const now = new Date().toISOString();

        // Filter out undefined values - Firestore doesn't accept them
        const cleanData = {};
        for (const [key, value] of Object.entries(taskData)) {
            if (value !== undefined) {
                cleanData[key] = value;
            }
        }

        const data = {
            ...cleanData,
            status: cleanData.status || 'To Do',
            createdAt: now,
            updatedAt: now
        };

        const res = await Task.collection.add(data);
        return { id: res.id, ...data };
    }

    static async findAll(query = {}) {
        let localQuery = Task.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        const snapshot = await localQuery.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(id, updates) {
        await Task.collection.doc(id).update({
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return { id, ...updates }; // Mock return
    }

    static async destroy(query) {
        // Mock generic destroy (Usually by ID)
        if (query.where && query.where.id) {
            await Task.collection.doc(query.where.id).delete();
            return 1;
        }
        return 0;
    }
}

module.exports = Task;
