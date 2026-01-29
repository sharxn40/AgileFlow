const { db } = require('./config/firebaseAdmin');

async function promoteAllToAdmin() {
    try {
        console.log("Promoting ALL users to Admin...");
        const snapshot = await db.collection('users').get();

        if (snapshot.size > 0) {
            const batch = db.batch();
            let count = 0;

            snapshot.forEach(doc => {
                const userRef = db.collection('users').doc(doc.id);
                batch.update(userRef, { role: 'admin' });
                console.log(`- Queued update for: ${doc.data().email}`);
                count++;
            });

            await batch.commit();
            console.log(`SUCCESS: Promoted ${count} users to 'admin'.`);
        } else {
            console.log("No users found.");
        }
    } catch (error) {
        console.error("Error updating roles:", error);
    }
}

promoteAllToAdmin();
