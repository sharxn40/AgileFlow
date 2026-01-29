const { db } = require('../../config/firebaseAdmin');

class Sprint {
    static collection = db.collection('sprints');

    static async create(data) {
        const now = new Date().toISOString();
        const sprintData = {
            name: data.name,
            goal: data.goal || '',
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            status: data.status || 'planned', // planned, active, completed
            projectId: data.projectId,
            createdAt: now,
            updatedAt: now
        };
        const res = await Sprint.collection.add(sprintData);
        return { id: res.id, ...sprintData };
    }

    static async findByPk(id) {
        if (!id) return null;
        const doc = await Sprint.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findOne(query) {
        let localQuery = Sprint.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        if (query.order) {
            const field = query.order[0][0];
            const direction = query.order[0][1];
            localQuery = localQuery.orderBy(field, direction.toLowerCase());
        }

        const snapshot = await localQuery.limit(1).get();
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async findAll(query = {}) {
        let localQuery = Sprint.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        const snapshot = await localQuery.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(id, updates) {
        await Sprint.collection.doc(id).update({
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return { id, ...updates };
    }
}

module.exports = Sprint;
