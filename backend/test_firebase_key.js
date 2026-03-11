const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');

console.log('Testing with project_id:', sa.project_id);
console.log('client_email:', sa.client_email);
console.log('private_key starts with:', sa.private_key.substring(0, 40));

const app = admin.initializeApp({ credential: admin.credential.cert(sa) }, 'test-app');
const db = admin.firestore(app);

db.collection('users').limit(1).get()
    .then(snapshot => {
        console.log('SUCCESS: Firebase connected! Docs:', snapshot.size);
        process.exit(0);
    })
    .catch(err => {
        console.error('FAIL CODE:', err.code);
        console.error('FAIL MSG:', err.message.substring(0, 200));
        process.exit(1);
    });
