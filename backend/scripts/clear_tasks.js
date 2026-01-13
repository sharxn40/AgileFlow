const { sequelize } = require('../config/database');
const Task = require('../models/Task');

const clearTasks = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');
        await Task.destroy({ where: {}, truncate: true });
        console.log('All tasks cleared.');
    } catch (error) {
        console.error('Error clearing tasks:', error);
    } finally {
        await sequelize.close();
    }
};

clearTasks();
