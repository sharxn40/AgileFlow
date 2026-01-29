const { db } = require('../../config/firebaseAdmin');

class SprintSnapshot {
    constructor(id, data) {
        this.id = id;
        this.sprintId = data.sprintId;
        this.projectId = data.projectId;
        this.date = data.date; // YYYY-MM-DD
        this.totalPoints = data.totalPoints || 0;
        this.completedPoints = data.completedPoints || 0;
        this.remainingPoints = data.remainingPoints || 0;
        this.timestamp = data.timestamp || new Date().toISOString();
    }

    static async create(data) {
        const docRef = db.collection('sprint_snapshots').doc();
        const snapshot = {
            ...data,
            timestamp: new Date().toISOString()
        };
        await docRef.set(snapshot);
        return new SprintSnapshot(docRef.id, snapshot);
    }

    static async findBySprintId(sprintId) {
        const snapshot = await db.collection('sprint_snapshots')
            .where('sprintId', '==', sprintId)
            .orderBy('date', 'asc')
            .get();

        return snapshot.docs.map(doc => new SprintSnapshot(doc.id, doc.data()));
    }
}

module.exports = SprintSnapshot;
