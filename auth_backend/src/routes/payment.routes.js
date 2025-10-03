const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Webhook endpoint (public - no auth middleware)
router.post('/webhook', paymentController.handleWebhook);

// All other payment routes require authentication
router.use(authMiddleware);

// Create payment order
router.post('/create-order', paymentController.createOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Check payment status
router.get('/status', paymentController.checkPaymentStatus);

// Get payment config (for frontend)
router.get('/config', paymentController.getPaymentConfig);

module.exports = router;
