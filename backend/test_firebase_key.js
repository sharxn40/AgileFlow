const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
const fs = require('fs');

console.log('project_id:', sa.project_id);
console.log('client_email:', sa.client_email);

try {
    const app = admin.initializeApp({ credential: admin.credential.cert(sa) }, 'test-app-' + Date.now());
    const db = admin.firestore(app);

    db.collection('users').limit(1).get()
        .then(snapshot => {
            const msg = 'SUCCESS: Firebase connected! Docs: ' + snapshot.size;
            console.log(msg);
            fs.writeFileSync('firebase_test_result.log', msg);
            process.exit(0);
        })
        .catch(err => {
            const msg = `FAIL\ncode: ${err.code}\nmessage: ${err.message}`;
            console.log(msg);
            fs.writeFileSync('firebase_test_result.log', msg);
            process.exit(1);
        });
} catch (initErr) {
    const msg = 'INIT FAIL: ' + initErr.message;
    console.log(msg);
    fs.writeFileSync('firebase_test_result.log', msg);
    process.exit(1);
}
