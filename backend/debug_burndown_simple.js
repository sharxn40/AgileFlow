// Debug script for Burndown
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

async function debug() {
    try {
        // Login
        const lRes = await request('http://localhost:3000/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email: 'admin@agileflow.com', password: 'admin123' }));
        const token = JSON.parse(lRes.b).token;
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // 1. Get Project
        const pRes = await request('http://localhost:3000/api/projects', 'GET', headers);
        const projectId = JSON.parse(pRes.b)[0].id;

        // 2. Create Sprint
        const sprintPayload = JSON.stringify({
            name: `Debug Sprint ${Date.now()}`,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            projectId
        });
        const spRes = await request('http://localhost:3000/api/sprints', 'POST', headers, sprintPayload);
        const sprint = JSON.parse(spRes.b);
        console.log("Sprint Created:", sprint.id);

        // 3. Create Task in Sprint
        const taskPayload = JSON.stringify({
            title: "Burndown Test Task",
            projectId,
            storyPoints: 5,
            sprintId: sprint.id,
            status: "To Do"
        });
        const tRes = await request('http://localhost:3000/api/issues', 'POST', headers, taskPayload);
        const task = JSON.parse(tRes.b);
        console.log("Task Created:", task.id);

        // 4. Start Sprint
        await request(`http://localhost:3000/api/sprints/${sprint.id}/start`, 'POST', headers);

        // 5. Move Task to Done
        await request(`http://localhost:3000/api/issues/${task.id}`, 'PUT', headers, JSON.stringify({ status: 'Done' }));
        console.log("Task Moved to Done");

        // 6. Check Burndown
        const bRes = await request(`http://localhost:3000/api/sprints/${sprint.id}/burndown`, 'GET', headers);
        const data = JSON.parse(bRes.b);

        // Find Today's Date in Burndown
        const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        const todayData = data.find(d => d.day === todayStr);

        console.log("Burndown Today:", todayData);

        if (todayData && todayData.remaining === 0) {
            console.log("PASS: Remaining is 0");
        } else {
            console.log("FAIL: Remaining is " + (todayData ? todayData.remaining : 'Not Found'));
        }

    } catch (e) { console.error(e); }
}
debug();
