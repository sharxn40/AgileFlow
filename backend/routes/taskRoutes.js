const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Add auth middleware later if needed, generally good practice.
const { protect } = require('../middleware/authMiddleware');

router.get('/my-tasks', protect, taskController.getMyTasks);
router.get('/', protect, taskController.getAllTasks);
router.post('/', protect, taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
