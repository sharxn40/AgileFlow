const { admin, db } = require('./config/firebaseAdmin');
const bcrypt = require('bcryptjs');

async function createProjectLead() {
    try {
        console.log('🔧 Creating Project Lead User in Firestore...');

        // Project Lead credentials
        const leadEmail = 'lead@agileflow.com';
        const leadPassword = 'lead123'; // Change this to a secure password
        const leadUsername = 'Project Lead';

        // Check if project lead already exists
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', leadEmail).get();

        if (!snapshot.empty) {
            console.log('⚠️  Project Lead user already exists!');
            const leadDoc = snapshot.docs[0];
            console.log('Lead ID:', leadDoc.id);
            console.log('Lead Data:', leadDoc.data());

            // Update role to project-lead if not already
            if (leadDoc.data().role !== 'project-lead') {
                await usersRef.doc(leadDoc.id).update({ role: 'project-lead' });
                console.log('✅ Updated existing user to project-lead role');
            }
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(leadPassword, 10);

        // Create project lead user
        const newLead = {
            username: leadUsername,
            email: leadEmail,
            password: hashedPassword,
            role: 'project-lead',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await usersRef.add(newLead);
        console.log('✅ Project Lead user created successfully!');
        console.log('📧 Email:', leadEmail);
        console.log('🔑 Password:', leadPassword);
        console.log('🆔 User ID:', docRef.id);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating project lead:', error);
    } finally {
        process.exit(0);
    }
}

createProjectLead();
