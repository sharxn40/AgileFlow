const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes
router.get('/mine', protect, authorize('worker', 'project-lead', 'admin'), paymentController.getWorkerEarnings);
router.get('/all', protect, authorize('admin'), paymentController.getAllPayments);
router.get('/project/:projectId', protect, authorize('project-lead', 'admin'), paymentController.getProjectPayments);
router.post('/config', protect, authorize('project-lead', 'admin'), paymentController.configureBudget);
router.post('/pay', protect, authorize('project-lead', 'admin'), paymentController.processPayment);
router.post('/verify', protect, authorize('project-lead', 'admin'), paymentController.verifyPayment);
router.post('/webhook', paymentController.razorpayWebhook);

module.exports = router;
