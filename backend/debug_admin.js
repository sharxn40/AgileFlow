const { admin, db } = require('./config/firebaseAdmin');

async function checkAdminUser() {
    try {
        console.log("Checking Firestore for 'admin@agileflow.com'...");
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', 'admin@agileflow.com').get();

        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        console.log(`Found ${snapshot.size} document(s):`);
        snapshot.forEach(doc => {
            console.log(doc.id, '=>', doc.data());
        });

    } catch (error) {
        console.error('Error getting documents', error);
    }
}

checkAdminUser();
