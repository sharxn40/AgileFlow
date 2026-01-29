const { db } = require('./config/firebaseAdmin');

async function checkAdminUser() {
    try {
        console.log("Checking for 'admin@agileflow.com'...");
        const snapshot = await db.collection('users').where('email', '==', 'admin@agileflow.com').get();

        if (snapshot.size > 0) {
            console.log("User EXISTS.");
            snapshot.forEach(doc => console.log(doc.data()));
        } else {
            console.log("User DOES NOT EXIST.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

checkAdminUser();
