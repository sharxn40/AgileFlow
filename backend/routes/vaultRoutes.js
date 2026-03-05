const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Ensure all vault routes are protected

// Get all active and past contracts for the user (Admin or Seeker)
router.get('/contracts', vaultController.getVaultContracts);

// Seeker submittal endpoint
router.post('/contracts/:id/submit', vaultController.submitJobForReview);

// Admin generates a Razorpay Order
router.post('/contracts/:id/order', vaultController.createRazorpayOrder);

// Admin payment endpoint (handles signature verification)
router.post('/contracts/:id/pay', vaultController.processPayment);

module.exports = router;
