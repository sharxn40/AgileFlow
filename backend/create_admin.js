const { db } = require('./config/firebaseAdmin');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    try {
        console.log("Creating 'admin@agileflow.com'...");
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await db.collection('users').add({
            username: 'AgileFlow Admin',
            email: 'admin@agileflow.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        console.log("SUCCESS: Admin user created.");
    } catch (error) {
        console.error("Error creating admin:", error);
    }
}

createAdminUser();
