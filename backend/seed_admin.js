const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs'); // Make sure bcryptjs is used as per package.json
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

async function seedAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Check if admin exists
        const [existing] = await sequelize.query("SELECT * FROM Users WHERE email = 'admin@agileflow.com'");

        if (existing.length > 0) {
            console.log('Update existing admin...');
            await sequelize.query(
                "UPDATE Users SET password = :password, role = 'admin' WHERE email = 'admin@agileflow.com'",
                { replacements: { password: hashedPassword } }
            );
        } else {
            console.log('Creating new admin...');
            await sequelize.query(
                "INSERT INTO Users (username, email, password, role, createdAt, updatedAt) VALUES (:username, :email, :password, 'admin', datetime('now'), datetime('now'))",
                {
                    replacements: {
                        username: 'Admin User',
                        email: 'admin@agileflow.com',
                        password: hashedPassword
                    }
                }
            );
        }
        console.log('Admin user ready: admin@agileflow.com / admin123');
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await sequelize.close();
    }
}

seedAdmin();
