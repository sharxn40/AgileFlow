const https = require('https');

// API Key from Frontend Config (Hardcoded or Env var - ideally env but hardcoded here to match frontend "no trouble")
const FIREBASE_API_KEY = "AIzaSyB5ydRfvYKnyZMzyXb6sl8y_lMDLuMnSYw";

const verifyFirebaseToken = (idToken) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            idToken: idToken
        });

        const options = {
            hostname: 'identitytoolkit.googleapis.com',
            path: `/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(body);
                    if (response.users && response.users.length > 0) {
                        resolve(response.users[0]);
                    } else {
                        reject(new Error('Invalid Token'));
                    }
                } else {
                    reject(new Error(`Validation Failed: ${body}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

module.exports = verifyFirebaseToken;
