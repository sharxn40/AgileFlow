const { db } = require('./config/firebaseAdmin');

async function listUsers() {
    try {
        console.log("Listing ALL Users...");
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            console.log("Database is EMPTY.");
            return;
        }

        console.log(`Success! Found ${snapshot.size} users.`);
    } catch (e) {
        console.error("ERROR:", e);
        require('fs').writeFileSync('debug_v2.log', `ERROR: ${e.message}\nStack: ${e.stack}`);
    }
}
listUsers();
