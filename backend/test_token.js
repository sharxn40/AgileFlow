const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
const fs = require('fs');

const credential = admin.credential.cert(sa);

// Try to get an access token directly - this tests if the key/IAM is valid
credential.getAccessToken()
    .then(token => {
        const msg = `TOKEN OK: got token starting with ${token.access_token.substring(0, 30)}...`;
        console.log(msg);
        fs.writeFileSync('token_test.log', msg);
    })
    .catch(err => {
        const msg = `TOKEN FAIL:\ncode: ${err.code || 'none'}\nmessage: ${err.message}`;
        console.log(msg);
        fs.writeFileSync('token_test.log', msg);
    });
