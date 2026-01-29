const fetch = require('node-fetch');

async function testUpdateRole() {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@agileflow.com', password: 'admin123' })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login Failed: ${loginData.message}`);
        const token = loginData.token;
        console.log("Login Success. Token received.");

        console.log("2. Fetching Users to find a target...");
        const usersRes = await fetch('http://localhost:3000/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await usersRes.json();
        if (users.length === 0) throw new Error("No users found.");

        const targetUser = users.find(u => u.email !== 'admin@agileflow.com');
        if (!targetUser) throw new Error("No target user found (only admin exists).");

        console.log(`Target User: ${targetUser.email} (ID: ${targetUser.id}, Current Role: ${targetUser.role})`);

        console.log("3. Updating Role to 'project-lead'...");
        const updateRes = await fetch(`http://localhost:3000/api/users/${targetUser.id}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: 'project-lead' })
        });

        if (!updateRes.ok) {
            const text = await updateRes.text();
            throw new Error(`Update Failed:Status ${updateRes.status} - ${text}`);
        }

        const updateData = await updateRes.json();
        console.log("SUCCESS: Role updated.", updateData);

    } catch (error) {
        console.error("TEST FAILED:", error.message);
    }
}

testUpdateRole();
