const { db } = require('./config/firebaseAdmin');

async function listAllUsers() {
    try {
        console.log("Listing ALL Users in Firestore...");
        const snapshot = await db.collection('users').get();
        console.log(`Total Documents: ${snapshot.size}`);

        if (snapshot.size > 0) {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`Found: [${data.email}] - Role: '${data.role}' (ID: ${doc.id})`);
            });
        } else {
            console.log("No users found.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listAllUsers();
