const { db } = require('./config/firebaseAdmin');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log("Seeding Firestore Database...");

        const adminEmail = 'admin@agileflow.com';
        const snapshot = await db.collection('users').where('email', '==', adminEmail).get();

        if (snapshot.empty) {
            console.log("Creating Admin User...");
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.collection('users').add({
                username: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date().toISOString()
            });
            console.log("Admin User Created.");
        } else {
            console.log("Admin User already exists.");
            // Force role update just in case
            const doc = snapshot.docs[0];
            await doc.ref.update({ role: 'admin' });
            console.log("Admin role enforced.");
        }

    } catch (e) {
        console.error("Seeding Error:", e);
    }
}
seed();
