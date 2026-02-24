const fs = require('fs');
// require('dotenv').config(); // DISABLED
const { db } = require('./config/firebaseAdmin');

async function testConnection() {
    const logFile = 'firestore_clean_test.log';
    try {
        fs.writeFileSync(logFile, "Starting Clean Firestore Test...\n");
        console.log("Querying Users...");

        const snapshot = await db.collection('users').limit(1).get();

        fs.appendFileSync(logFile, `Success! Snapshot size: ${snapshot.size}\n`);

        console.log("Test Success.");
    } catch (error) {
        console.error("Test Failed:", error);
        fs.appendFileSync(logFile, `ERROR: ${error.message}\nStack: ${error.stack}\n`);
    }
}

testConnection();
