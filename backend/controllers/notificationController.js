const Notification = require('../models/firestore/Notification');

exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getByUser(req.user.id);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.markAsRead(req.params.id);
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error upgrading notification', error: error.message });
    }
};
