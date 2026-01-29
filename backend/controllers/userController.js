const User = require('../models/firestore/User');

exports.getTeam = async (req, res) => {
    try {
        const { userId } = req.params;
        const managerId = userId;

        if (!managerId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        // Firestore doesn't support include, so we fetch users and manually aggregate tasks if needed
        const team = await User.findAll({
            where: { managerId }
        });

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        console.log('API: getAllUsers called'); // DEBUG
        const users = await User.findAll({});
        console.log(`API: Found ${users.length} users`); // DEBUG
        // Manually exclude password field
        const sanitizedUsers = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        res.json(sanitizedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            picture: user.profilePicture // Ensure frontend gets 'picture'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            // Delete using Firestore collection
            await User.collection.doc(req.params.id).delete();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        console.log(`API: updateUserRole called for ID: ${req.params.id}, Body:`, req.body); // DEBUG
        const user = await User.findByPk(req.params.id);
        if (user) {
            const newRole = req.body.role || user.role;
            // Update using Firestore collection
            await User.collection.doc(req.params.id).update({ role: newRole });

            res.json({
                _id: req.params.id,
                username: user.username,
                email: user.email,
                role: newRole,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("API Update Error:", error); // DEBUG LOG
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};
