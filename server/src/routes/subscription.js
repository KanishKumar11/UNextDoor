import express from 'express';
import { body, param } from 'express-validator';
import {
  getTransactionHistory,
  getBillingDetails,
  updateAutoRenewal,
  scheduleDowngrade
} from '../controllers/subscriptionController.js';
import subscriptionController from '../controllers/subscriptionController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/subscriptions/payment-page/:orderId
 * @desc    Serve payment page
 * @access  Public (token verified in query)
 */
router.get('/payment-page/:orderId', 
  subscriptionController.servePaymentPage.bind(subscriptionController)
);

/**
 * @route   GET /api/subscriptions/payment-details/:orderId
 * @desc    Get payment details for web payment page
 * @access  Public (token verified in query) 
 */
router.get('/payment-details/:orderId', 
  subscriptionController.getPaymentDetails.bind(subscriptionController)
);

// Apply authentication middleware to all other routes
router.use(authenticateJWT);

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Private
 */
router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));

/**
 * @route   GET /api/subscriptions/current
 * @desc    Get user's current subscription
 * @access  Private
 */
router.get('/current', subscriptionController.getCurrentSubscription.bind(subscriptionController));

/**
 * @route   POST /api/subscriptions/create-order
 * @desc    Create subscription order for payment
 * @access  Private
 */
router.post('/create-order', [
  body('planId')
    .isIn(['basic_monthly', 'standard_quarterly', 'pro_yearly'])
    .withMessage('Invalid subscription plan')
], subscriptionController.createSubscriptionOrder.bind(subscriptionController));

/**
 * @route   POST /api/subscriptions/verify-payment
 * @desc    Verify payment and activate subscription
 * @access  Private
 */
router.post('/verify-payment', [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
], subscriptionController.verifyPaymentAndActivate.bind(subscriptionController));

/**
 * @route   GET /api/subscriptions/upgrade-preview/:planId
 * @desc    Get upgrade preview with proration calculation
 * @access  Private
 */
router.get('/upgrade-preview/:planId', [
  param('planId')
    .isIn(['basic_monthly', 'standard_quarterly', 'pro_yearly'])
    .withMessage('Invalid subscription plan')
], subscriptionController.getUpgradePreview.bind(subscriptionController));

/**
 * @route   POST /api/subscriptions/cancel
 * @desc    Cancel subscription at end of current period
 * @access  Private
 */
router.post('/cancel', subscriptionController.cancelSubscription.bind(subscriptionController));

/**
 * @route   POST /api/subscriptions/reactivate
 * @desc    Reactivate cancelled subscription
 * @access  Private
 */
router.post('/reactivate', subscriptionController.reactivateSubscription.bind(subscriptionController));

/**
 * @route   POST /api/subscriptions/schedule-downgrade
 * @desc    Schedule a downgrade to a lower plan at end of current billing cycle
 * @access  Private
 */
router.post('/schedule-downgrade', [
  body('planId')
    .isIn(['basic_monthly', 'standard_quarterly', 'pro_yearly'])
    .withMessage('Invalid subscription plan')
], scheduleDowngrade);

// Transaction routes
router.get('/transactions', getTransactionHistory);
router.get('/billing-details', getBillingDetails);
router.post('/auto-renewal', updateAutoRenewal);

// Payment verification and recovery routes
router.get('/verify-payment/:orderId', 
  subscriptionController.verifyPaymentStatus.bind(subscriptionController)
);

router.post('/recover-pending', 
  subscriptionController.recoverPendingPayments.bind(subscriptionController)
);

router.post('/recover-payments', 
  subscriptionController.recoverPendingPayments.bind(subscriptionController)
);

export default router;
