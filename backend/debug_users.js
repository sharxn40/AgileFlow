const { db } = require('./config/firebaseAdmin');

async function checkUsers() {
    try {
        console.log("Checking Firestore Users Collection...");
        const snapshot = await db.collection('users').get();
        console.log(`Total Users Found: ${snapshot.size}`);

        if (snapshot.size > 0) {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`- User: ${data.email} | Role: ${data.role} | ID: ${doc.id}`);
            });
        } else {
            console.log("Collection is EMPTY.");
        }
    } catch (error) {
        console.error("Error accessing Firestore:", error);
    }
}

checkUsers();
