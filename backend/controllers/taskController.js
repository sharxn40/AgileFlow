const Task = require('../models/firestore/Task');
const User = require('../models/firestore/User');

exports.getAllTasks = async (req, res) => {
    try {
        console.log('=== GET ALL TASKS CALLED ===');
        // 1. Fetch all tasks
        const tasks = await Task.findAll();
        console.log(`Fetched ${tasks.length} tasks from Firestore`);
        console.log('Raw tasks:', JSON.stringify(tasks, null, 2));

        // 2. Fetch Assignees manually (Firestore NoSQL Join)
        const populatedTasks = await Promise.all(tasks.map(async (task) => {
            let assignee = null;
            if (task.assigneeId) {
                assignee = await User.findByPk(task.assigneeId);
                // Sanitize assignee
                if (assignee) {
                    assignee = { id: assignee.id, username: assignee.username, email: assignee.email, picture: assignee.profilePicture };
                }
            }
            return { ...task, assignee };
        }));

        console.log(`GET ALL TASKS (Firestore): Found ${populatedTasks.length} tasks`);
        console.log('Populated tasks being sent:', JSON.stringify(populatedTasks, null, 2));
        res.json(populatedTasks);
    } catch (error) {
        console.error('GET ALL TASKS ERROR:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};
exports.getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.findAll({ where: { assigneeId: userId } });

        // Manual hydration (simpler for 'my tasks', simpler response usually ok too)
        const populatedTasks = await Promise.all(tasks.map(async (task) => {
            // We know assignee is self, but for consistency:
            return { ...task, assignee: { username: req.user.username } };
        }));

        res.json(populatedTasks);
    } catch (error) {
        console.error('GET MY TASKS ERROR:', error);
        res.status(500).json({ message: 'Error fetching your tasks', error: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        console.log('=== CREATE TASK CALLED ===');
        console.log('Request body:', req.body);
        console.log('User from token:', req.user);

        const { title, content, priority, deadline, tag, assigneeId, projectId } = req.body;

        // Ensure we have a valid user ID
        if (!req.user || !req.user.id) {
            console.error('No user ID found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        let effectiveAssigneeId = assigneeId || req.user.id;
        console.log('Effective assignee ID:', effectiveAssigneeId);

        const newTask = await Task.create({
            title,
            content: content || title,
            priority,
            deadline,
            tag,
            assigneeId: effectiveAssigneeId,
            status: 'To Do',
            projectId: req.body.projectId || null, // Fix: Accept projectId from request
            issueId: req.body.issueId // Optional: If frontend generates it or backend should generate it
        });

        console.log('Task created in Firestore:', newTask);

        // Populate assignee to match getAllTasks format
        let assignee = null;
        if (effectiveAssigneeId) {
            try {
                assignee = await User.findByPk(effectiveAssigneeId);
                if (assignee) {
                    assignee = {
                        id: assignee.id,
                        username: assignee.username,
                        email: assignee.email,
                        picture: assignee.profilePicture
                    };
                }
            } catch (userError) {
                console.error('Error fetching assignee:', userError);
                // Continue without assignee if user lookup fails
            }
        }

        const responseTask = { ...newTask, assignee };
        console.log('Sending response:', JSON.stringify(responseTask, null, 2));
        res.status(201).json(responseTask);
    } catch (error) {
        console.error('CREATE TASK ERROR:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Firestore Model update
        const updatedTask = await Task.update(id, updates);
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        // Firestore Model destroy
        await Task.destroy({ where: { id } });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};
