const http = require('http');

function request(url, method, headers, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, { method, headers }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ s: res.statusCode, b: body }));
        });
        if (data) req.write(data);
        req.end();
    });
}

async function raceTest() {
    try {
        // Login
        const lRes = await request('http://localhost:3000/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email: 'admin@agileflow.com', password: 'admin123' }));
        const token = JSON.parse(lRes.b).token;

        // Get User
        const uRes = await request('http://localhost:3000/api/users', 'GET', { 'Authorization': `Bearer ${token}` });
        const user = JSON.parse(uRes.b).find(u => u.email !== 'admin@agileflow.com');

        console.log(`Initial Role: ${user.role}`);

        // Update
        const nextRole = user.role === 'user' ? 'project-lead' : 'user';
        await request(`http://localhost:3000/api/users/${user.id}/role`, 'PUT', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify({ role: nextRole }));

        // IMMEDIATE Fetch (Simulating frontend calling fetchUsers() right after await response)
        const checkRes = await request('http://localhost:3000/api/users', 'GET', { 'Authorization': `Bearer ${token}` });
        const checkedUser = JSON.parse(checkRes.b).find(u => u.id === user.id);

        console.log(`Immediate Fetch Role: ${checkedUser.role}`);

        if (checkedUser.role === user.role) {
            console.log("FAIL: Race condition detected! API returned old role.");
        } else {
            console.log("PASS: Role updated correctly.");
        }

    } catch (e) { console.error(e); }
}
raceTest();
