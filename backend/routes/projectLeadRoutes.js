const express = require('express');
const router = express.Router();
const projectLeadController = require('../controllers/projectLeadController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Middleware to ensure role is project-lead
const isProjectLead = (req, res, next) => {
    if (req.user && req.user.role === 'project-lead') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Project Leads only' });
    }
};

router.get('/stats', protect, isProjectLead, projectLeadController.getDashboardStats);
router.get('/team', protect, isProjectLead, projectLeadController.getTeamOverview);
router.put('/tasks/:taskId/reassign', protect, isProjectLead, projectLeadController.reassignTask);

// Invitation Routes
router.get('/search-users', protect, isProjectLead, projectLeadController.searchUsers);
router.post('/invite', protect, isProjectLead, projectLeadController.inviteUser);

module.exports = router;
