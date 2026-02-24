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

async function testAnalytics() {
    try {
        console.log("1. Logging in...");
        const lRes = await request('http://localhost:3000/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email: 'admin@agileflow.com', password: 'admin123' }));
        const token = JSON.parse(lRes.b).token;

        // Get a project
        const pRes = await request('http://localhost:3000/api/projects', 'GET', { 'Authorization': `Bearer ${token}` });
        const projects = JSON.parse(pRes.b);
        if (projects.length === 0) { console.log("No projects."); return; }
        const projectId = projects[0].id;
        console.log(`Project ID: ${projectId}`);

        console.log("2. Fetching Activity...");
        const aRes = await request(`http://localhost:3000/api/projects/${projectId}/activity`, 'GET', { 'Authorization': `Bearer ${token}` });
        console.log(`Activity Status: ${aRes.s}`);
        console.log(`Activity Data Length: ${JSON.parse(aRes.b).length}`);

        console.log("3. Fetching Velocity...");
        const vRes = await request(`http://localhost:3000/api/sprints/${projectId}/velocity`, 'GET', { 'Authorization': `Bearer ${token}` });
        console.log(`Velocity Status: ${vRes.s}`);
        console.log(`Velocity Data:`, vRes.b);

    } catch (e) { console.error(e); }
}
testAnalytics();
