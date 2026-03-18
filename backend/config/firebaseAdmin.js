const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin Initialized via local JSON");
    } catch (error) {
        console.error("❌ Firebase Admin Local Init Failed:", error.message);
    }
} else {
    // If no local key, try to use default credentials (standard for Cloud Run/GCP)
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log("🔥 Firebase Admin Initialized via GCP Application Default Credentials");
    } catch (error) {
        console.error("❌ Firebase Admin Default Init Failed!");
        console.error("Error:", error.message);
    }
}

const db = admin.firestore();
module.exports = { admin, db };
