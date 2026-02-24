const { db } = require('../../config/firebaseAdmin');

class Team {
    static collection = db.collection('teams');

    static async create(teamData) {
        const now = new Date().toISOString();
        const data = {
            name: teamData.name,
            description: teamData.description || '',
            adminId: teamData.adminId,
            members: [teamData.adminId], // Creator is automatically a member
            createdAt: now,
            updatedAt: now,
        };
        const res = await Team.collection.add(data);
        return { id: res.id, ...data };
    }

    static async findByPk(id) {
        if (!id) return null;
        const doc = await Team.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findAll(query = {}) {
        let localQuery = Team.collection;
        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }
        const snapshot = await localQuery.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(id, updates) {
        await Team.collection.doc(id).update({
            ...updates,
            updatedAt: new Date().toISOString(),
        });
        return { id, ...updates };
    }

    static async addMember(teamId, userId) {
        const team = await Team.findByPk(teamId);
        if (!team) throw new Error('Team not found');
        const members = team.members || [];
        if (!members.includes(userId)) {
            members.push(userId);
            await Team.collection.doc(teamId).update({ members, updatedAt: new Date().toISOString() });
        }
        return { id: teamId, members };
    }

    static async removeMember(teamId, userId) {
        const team = await Team.findByPk(teamId);
        if (!team) throw new Error('Team not found');
        const members = (team.members || []).filter(m => m !== userId);
        await Team.collection.doc(teamId).update({ members, updatedAt: new Date().toISOString() });
        return { id: teamId, members };
    }
}

module.exports = Team;
