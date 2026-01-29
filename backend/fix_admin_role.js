const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

async function forceAdmin() {
    try {
        // Force update role to 'admin' for the email
        await sequelize.query(
            "UPDATE Users SET role = 'admin' WHERE email = 'admin@agileflow.com'"
        );
        console.log('Force updated admin@agileflow.com to role: admin');

        // Check again
        const [results] = await sequelize.query(
            "SELECT * FROM Users WHERE email = 'admin@agileflow.com'"
        );
        console.log('Updated Record:', results);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

forceAdmin();
