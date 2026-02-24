const http = require('http');

const data = JSON.stringify({ token: "invalid-token-to-force-error" });

const req = http.request('http://localhost:3000/api/auth/google', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', d => process.stdout.write(d));
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
