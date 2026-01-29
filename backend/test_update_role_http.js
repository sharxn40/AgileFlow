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

async function testUpdateRole() {
    try {
        console.log("1. Logging in as Admin...");
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
        const users = JSON.parse(usersRes.body);
        const targetUser = users.find(u => u.email !== 'admin@agileflow.com');
        if (!targetUser) throw new Error("No target user found.");

        console.log(`Target: ${targetUser.email} (${targetUser.id})`);

        console.log("3. Updating Role...");
        const updateData = JSON.stringify({ role: 'project-lead' });
        const updateRes = await request(`http://localhost:3000/api/users/${targetUser.id}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': updateData.length
            }
        }, updateData);

        console.log(`Update Response Status: ${updateRes.status}`);
        console.log(`Update Response Body: ${updateRes.body}`);

    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

testUpdateRole();
