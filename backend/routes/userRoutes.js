const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route to get team members for a specific project lead
// In a real app, this would be protected and pull ID from the token.
// For now, we'll pass the ID in the URL for simplicity in the demo.
router.get('/:userId/team', userController.getTeam);

// Admin Routes
router.route('/')
    .get(protect, authorize('admin'), userController.getAllUsers);

router.route('/:id')
    .delete(protect, authorize('admin'), userController.deleteUser);

router.route('/:id/role')
    .put(protect, authorize('admin'), userController.updateUserRole);

module.exports = router;
