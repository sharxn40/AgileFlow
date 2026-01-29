const http = require('http');
const { db } = require('./config/firebaseAdmin');

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

async function testFullFlow() {
    try {
        const timestamp = Date.now();
        const adminEmail = `admin${timestamp}@test.com`;
        const targetEmail = `target${timestamp}@test.com`;

        console.log(`1. Registering Admin User: ${adminEmail}`);
        const regData = JSON.stringify({ username: 'Test Admin', email: adminEmail, password: 'password123' });
        const regRes = await request('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': regData.length }
        }, regData);

        const regBody = JSON.parse(regRes.body);
        if (regRes.status !== 201) throw new Error(`Register Failed: ${regBody.message}`);
        const token = regBody.token;
        const adminId = regBody.user._id;
        console.log(`Admin Registered. ID: ${adminId}`);

        console.log("2. Promoting to Admin via DB...");
        await db.collection('users').doc(adminId).update({ role: 'admin' });
        console.log("Promoted to admin.");

        console.log(`3. Registering Target User: ${targetEmail}`);
        const targetRegData = JSON.stringify({ username: 'Target User', email: targetEmail, password: 'password123' });
        const targetRegRes = await request('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': targetRegData.length }
        }, targetRegData);

        const targetBody = JSON.parse(targetRegRes.body);
        const targetId = targetBody.user._id;
        console.log(`Target Registered. ID: ${targetId}`);

        console.log("4. Attempting Role Update API Call...");
        const updateData = JSON.stringify({ role: 'project-lead' });
        const updateRes = await request(`http://localhost:3000/api/users/${targetId}/role`, {
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
        console.error("TEST FAILED:", e);
    }
}

testFullFlow();
