import express from 'express';
import paymentWebhookController from '../controllers/paymentWebhookController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/webhooks/razorpay
 * @desc    Handle Razorpay webhooks
 * @access  Public (but verified via signature)
 */
router.post('/razorpay', paymentWebhookController.handleRazorpayWebhook.bind(paymentWebhookController));

/**
 * @route   GET /api/webhooks/logs
 * @desc    Get webhook processing logs (admin only)
 * @access  Private (Admin)
 */
router.get('/logs', authenticate, paymentWebhookController.getWebhookLogs.bind(paymentWebhookController));

export default router;
