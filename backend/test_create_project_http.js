const http = require('http');

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, res => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: resData }));
        });

        req.on('error', reject);
        if (body) req.write(data);
        req.end();
    });
}

function makeAuthRequest(path, method, body, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': data.length
            }
        };

        const req = http.request(options, res => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: resData }));
        });

        req.on('error', reject);
        if (body) req.write(data);
        req.end();
    });
}

async function testCreateProject() {
    try {
        const loginRes = await makeRequest('/api/auth/login', 'POST', { email: 'lead@demo.com', password: 'lead123' });
        const token = JSON.parse(loginRes.data).token;
        console.log('Login status:', loginRes.status);
        if (!token) {
            console.log('No token! Data:', loginRes.data);
            return;
        }

        const res = await makeAuthRequest('/api/projects', 'POST', {
            name: 'UI testing ' + Math.random(),
            key: 'UIT' + Math.floor(Math.random() * 100),
            description: '',
            leadId: null,
            dueDate: ''
        }, token);

        console.log('Status:', res.status);
        console.log('Response Body:', res.data);
    } catch (err) {
        console.error('Test script error:', err);
    }
}

testCreateProject();
