const { db } = require('../../config/firebaseAdmin');

class Project {
    static collection = db.collection('projects');

    static async create(projectData) {
        const now = new Date().toISOString();
        const data = {
            name: projectData.name,
            key: projectData.key ? projectData.key.toUpperCase() : 'PROJ',
            leadId: projectData.leadId,
            description: projectData.description || '',
            workflow: projectData.workflow || ['To Do', 'In Progress', 'Done'],
            members: projectData.members || [projectData.leadId], // Lead is automatically a member
            createdAt: now,
            updatedAt: now
        };
        const res = await Project.collection.add(data);
        return { id: res.id, ...data };
    }

    static async findByPk(id) {
        if (!id) return null;
        const doc = await Project.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findOne(query) {
        let localQuery = Project.collection;
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

    static async findAll(query = {}) {
        let localQuery = Project.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        const snapshot = await localQuery.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(id, updates) {
        await Project.collection.doc(id).update({
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return { id, ...updates };
    }
}

module.exports = Project;
