const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

// Priority 1: FIREBASE_CREDENTIALS_B64 env variable (base64-encoded JSON, safe for Cloud Run)
console.log("Checking FIREBASE_CREDENTIALS_B64 presence:", !!process.env.FIREBASE_CREDENTIALS_B64);
if (process.env.FIREBASE_CREDENTIALS_B64) {
    try {
        console.log("Attempting base64 initialization...");
        const cleanB64 = process.env.FIREBASE_CREDENTIALS_B64.trim().replace(/\s/g, '');
        const serviceAccount = JSON.parse(
            Buffer.from(cleanB64, 'base64').toString('utf8')
        );
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin Initialized via FIREBASE_CREDENTIALS_B64 env var (Project: " + serviceAccount.project_id + ")");
        initialized = true;
    } catch (error) {
        console.error("❌ Firebase Admin base64 env var init failed:", error.message);
    }
}

// Priority 2: FIREBASE_CREDENTIALS env variable (raw JSON)
if (!initialized && process.env.FIREBASE_CREDENTIALS) {
    try {
        console.log("Attempting raw JSON env var initialization...");
        const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin Initialized via FIREBASE_CREDENTIALS env var");
        initialized = true;
    } catch (error) {
        console.error("❌ Firebase Admin env var init failed:", error.message);
    }
}

// Priority 3: Local serviceAccountKey.json (for local development)
if (!initialized) {
    const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
    console.log("Checking local JSON path:", serviceAccountPath, "Exists:", fs.existsSync(serviceAccountPath));
    if (fs.existsSync(serviceAccountPath)) {
        try {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("🔥 Firebase Admin Initialized via local serviceAccountKey.json");
            initialized = true;
        } catch (error) {
            console.error("❌ Firebase Admin local JSON init failed:", error.message);
        }
    }
}

// Priority 4: GCP Application Default Credentials (fallback)
if (!initialized) {
    try {
        console.log("Attempting GCP Application Default Credentials...");
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log("🔥 Firebase Admin Initialized via GCP Application Default Credentials");
        initialized = true;
    } catch (error) {
        console.error("❌ Firebase Admin ALL init methods failed!", error.message);
    }
}

const db = admin.firestore();
module.exports = { admin, db };
