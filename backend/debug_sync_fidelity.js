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

async function syncTest() {
    try {
        console.log("1. Logging in...");
        const lRes = await request('http://localhost:3000/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email: 'admin@agileflow.com', password: 'admin123' }));
        const token = JSON.parse(lRes.b).token;
        const user = JSON.parse(lRes.b).user;

        // Get a project
        const pRes = await request('http://localhost:3000/api/projects', 'GET', { 'Authorization': `Bearer ${token}` });
        const projects = JSON.parse(pRes.b);
        if (projects.length === 0) { console.log("No projects found."); return; }
        const projectId = projects[0].id;

        console.log(`2. Creating Task in Project ${projectId}...`);
        const taskPayload = JSON.stringify({
            projectId,
            title: `Sync Test ${Date.now()}`,
            type: 'Task',
            priority: 'High',
            description: 'Testing sync',
            assigneeId: user.id || user._id // Self assign to ensure it shows in my-issues
        });

        const cRes = await request('http://localhost:3000/api/issues', 'POST', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, taskPayload);
        const newTask = JSON.parse(cRes.b);
        console.log(`Task Created: ${newTask.issueId} (${newTask.id}) Status: ${newTask.status}`);

        console.log("3. Fetching 'My Issues' (Overview)...");
        const oRes = await request('http://localhost:3000/api/issues/my-issues', 'GET', { 'Authorization': `Bearer ${token}` });
        const myIssues = JSON.parse(oRes.b);
        const found = myIssues.find(i => i.id === newTask.id);

        if (!found) {
            console.log("FAIL: Task not found in Overview!");
        } else {
            console.log(`PASS: Task found. Status: ${found.status}`);
        }

        console.log("4. Updating Status to 'Done' (Board Move)...");
        const uRes = await request(`http://localhost:3000/api/issues/${newTask.id}`, 'PUT', { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, JSON.stringify({ status: 'Done' }));

        console.log("5. Fetching 'My Issues' again...");
        const oRes2 = await request('http://localhost:3000/api/issues/my-issues', 'GET', { 'Authorization': `Bearer ${token}` });
        const found2 = JSON.parse(oRes2.b).find(i => i.id === newTask.id);

        if (found2.status === 'Done') {
            console.log("PASS: Status Updated correctly in Overview.");
        } else {
            console.log(`FAIL: Status mismatch! Overview shows: ${found2.status}`);
        }

    } catch (e) { console.error(e); }
}
syncTest();
