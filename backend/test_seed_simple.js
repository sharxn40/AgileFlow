const { db } = require('./config/firebaseAdmin');

async function testSeed() {
    try {
        console.log("Testing DB Access...");
        const snapshot = await db.collection('users').limit(1).get();
        console.log("Success! Snapshot size:", snapshot.size);
    } catch (error) {
        console.error("Seed Error:", error);
    }
}
testSeed();
