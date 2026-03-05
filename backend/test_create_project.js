const fetch = require('node-fetch');

async function testCreateProject() {
    try {
        // 1. Login to get token
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful, token retrieved.');

        // 2. Create Project
        const res = await fetch('http://localhost:3000/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'UI testing',
                key: 'UIT',
                description: '',
                leadId: null,
                dueDate: ''
            })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response Body:', text);
    } catch (err) {
        console.error('Test script error:', err);
    }
}

testCreateProject();
