const http = require('http');

function request(url, options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function checkUsers() {
    try {
        console.log("1. Logging in...");
        const loginData = JSON.stringify({ email: 'admin@agileflow.com', password: 'admin123' });
        const loginRes = await request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
        }, loginData);

        const loginBody = JSON.parse(loginRes.body);
        if (loginRes.status !== 200) throw new Error(`Login Failed: ${loginBody.message}`);
        const token = loginBody.token;
        console.log("Login Success.");

        console.log("2. Fetching Users...");
        const usersRes = await request('http://localhost:3000/api/users', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersRes.status !== 200) {
            console.log("Fetch Failed:", usersRes.status, usersRes.body);
            return;
        }

        const users = JSON.parse(usersRes.body);
        console.log(`SUCCESS: Found ${users.length} users.`);
        if (users.length > 0) {
            console.log("First User:", users[0].email, users[0].role);
        }

    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

checkUsers();
