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

async function debugBurndown() {
    try {
        console.log("1. Logging in...");
        const lRes = await request('http://localhost:3000/api/auth/login', 'POST', { 'Content-Type': 'application/json' }, JSON.stringify({ email: 'admin@agileflow.com', password: 'admin123' }));
        const token = JSON.parse(lRes.b).token;

        // Get Active Sprint
        console.log("2. Finding Active Sprint...");
        // Need a project ID first
        const pRes = await request('http://localhost:3000/api/projects', 'GET', { 'Authorization': `Bearer ${token}` });
        const projects = JSON.parse(pRes.b);
        if (projects.length === 0) return;
        const projectId = projects[0].id;

        const sRes = await request(`http://localhost:3000/api/sprints/active?projectId=${projectId}`, 'GET', { 'Authorization': `Bearer ${token}` });
        if (sRes.s !== 200) { console.log("No active sprint"); return; }
        const sprint = JSON.parse(sRes.b);
        console.log(`Active Sprint: ${sprint.name} (ID: ${sprint.id})`);

        // Get Issues for Sprint
        // Can't easily filter by sprint via API efficiently unless we use getMyIssues? No.
        // But getBurndownData does the logic. Let's call IT and see the result.
        console.log("3. Fetching Burndown Data...");
        const bRes = await request(`http://localhost:3000/api/sprints/${sprint.id}/burndown`, 'GET', { 'Authorization': `Bearer ${token}` });
        console.log("Burndown Response:", bRes.b);

        // Also fetch issues directly to check history
        console.log("4. Checking Issue History...");
        const iRes = await request(`http://localhost:3000/api/projects/${projectId}/board`, 'GET', { 'Authorization': `Bearer ${token}` });
        const allIssues = JSON.parse(iRes.b).issues;
        const sprintIssues = allIssues.filter(i => i.sprintId === sprint.id);

        sprintIssues.forEach(i => {
            console.log(`Issue ${i.issueId}: Status=${i.status}, History Events=${i.history ? i.history.length : 0}`);
            if (i.history) {
                console.log(JSON.stringify(i.history));
            }
        });

    } catch (e) { console.error(e); }
}
debugBurndown();
