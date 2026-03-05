const projectController = require('./controllers/projectController');
const { db } = require('./config/firebaseAdmin');

async function debugCreate() {
    try {
        const req = {
            body: {
                name: 'Direct Testing',
                key: 'DIR',
                description: 'test',
                leadId: null,
                dueDate: ''
            },
            user: { id: 'admin123' } // fake user ID
        };
        const res = {
            status: (code) => ({
                json: (data) => console.log('Response:', code, data)
            }),
            json: (data) => console.log('Response JSON:', data)
        };

        await projectController.createProject(req, res);
    } catch (err) {
        console.error('Crash trace:', err);
    }
}

debugCreate().then(() => process.exit(0));
