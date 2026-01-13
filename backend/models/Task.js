const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('todo', 'inprogress', 'review', 'done'),
        defaultValue: 'todo'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium'
    },
    assigneeId: {
        type: DataTypes.STRING, // Storing User ID (Firebase UID or tailored User ID)
        allowNull: true
    },
    projectId: { // Future proofing for multiple projects
        type: DataTypes.STRING,
        allowNull: true
    },
    position: { // For ordering within columns
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Task;
