const admin = require('firebase-admin');
const path = require('path');

// INSTRUCTION FOR USER:
// 1. Download your Service Account Key from Firebase Console -> Project Settings -> Service Accounts.
// 2. Rename it to "serviceAccountKey.json"
// 3. Place it in the "backend" folder of your project.

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log("🔥 Firebase Admin Initialized (Firestore Connected)");
} catch (error) {
    console.error("❌ Firebase Admin Initialization Failed!");
    console.error("Make sure 'serviceAccountKey.json' is in the 'backend' folder.");
    console.error("Error:", error.message);
    // process.exit(1); // Don't crash immediately, allow troubleshooting
}

const db = admin.firestore();
module.exports = { admin, db };
