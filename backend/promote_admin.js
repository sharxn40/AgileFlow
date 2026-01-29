const { db } = require('./config/firebaseAdmin');

async function promoteToAdmin() {
    try {
        console.log("Promoting user to Admin...");
        const snapshot = await db.collection('users').limit(1).get(); // Just grab the first user found

        if (snapshot.size > 0) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            console.log(`Found User: ${data.email} (${doc.id})`);

            await db.collection('users').doc(doc.id).update({ role: 'admin' });
            console.log(`SUCCESS: Updated ${data.email} role to 'admin'`);
        } else {
            console.log("No users found to promote.");
        }
    } catch (error) {
        console.error("Error updating role:", error);
    }
}

promoteToAdmin();
