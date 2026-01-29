const { db } = require('../../config/firebaseAdmin');

class User {
    static collection = db.collection('users');

    static async findOne(query) {
        // Mocking Sequelize 'findOne' API for easier refactoring
        // query is object like { where: { email: '...' } }

        let localQuery = User.collection;

        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }

        const snapshot = await localQuery.limit(1).get();
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        const data = doc.data();

        // Return object with 'id' and data to match Sequelize structure
        return {
            id: doc.id,
            ...data,
            save: async function () {
                // Mock instance .save()
                await User.collection.doc(doc.id).update(this);
            }
        };
    }

    static async findByPk(id) {
        if (!id) return null;
        const doc = await User.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    static async findByEmail(email) {
        const snapshot = await User.collection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    static async create(userData) {
        // Firestore auto-ID or custom ID
        // If userData has googleId, maybe we use that? But auto-id is safer for generic usage.

        // Add timestamps
        const now = new Date().toISOString();
        const data = {
            ...userData,
            createdAt: now,
            updatedAt: now,
            role: userData.role || 'user' // Default role
        };

        const res = await User.collection.add(data);

        return {
            id: res.id,
            ...data
        };
    }

    // Sequelize 'findAll' equivalent
    static async findAll(query = {}) {
        let localQuery = User.collection;

        if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
                localQuery = localQuery.where(key, '==', value);
            }
        }

        const snapshot = await localQuery.get();
        console.log(`User.findAll: Snapshot size: ${snapshot.size}`); // DEBUG
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = User;
