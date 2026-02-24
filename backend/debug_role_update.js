const { db } = require('./config/firebaseAdmin');

async function testRoleUpdate() {
    try {
        console.log("Fetching first user...");
        const snapshot = await db.collection('users').limit(1).get();
        if (snapshot.empty) {
            console.log("No users found.");
            return;
        }

        const doc = snapshot.docs[0];
        const userId = doc.id;
        const currentRole = doc.data().role;
        const newRole = currentRole === 'admin' ? 'sprint-lead' : 'admin';

        console.log(`Updating user ${doc.data().email} (${userId}) from ${currentRole} to ${newRole}...`);

        await db.collection('users').doc(userId).update({ role: newRole });
        console.log("Update call complete.");

        const updatedDoc = await db.collection('users').doc(userId).get();
        console.log(`Verification: New Role is ${updatedDoc.data().role}`);

        // Revert
        await db.collection('users').doc(userId).update({ role: currentRole });
        console.log("Reverted role.");
    } catch (e) {
        console.error("Test Error:", e);
    }
}
testRoleUpdate();
