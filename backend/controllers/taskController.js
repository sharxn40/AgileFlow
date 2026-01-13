const Task = require('../models/Task');
const User = require('../models/User'); // Optional: Validation if we link to real users

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            order: [['position', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, status, assigneeId } = req.body;

        // Auto-calculate position (append to end)
        const count = await Task.count({ where: { status: status || 'todo' } });

        const newTask = await Task.create({
            title,
            description,
            priority,
            status,
            assigneeId,
            position: count
        });

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, assigneeId, position } = req.body;

        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.update({
            title,
            description,
            status,
            priority,
            assigneeId,
            position
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.destroy();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};
