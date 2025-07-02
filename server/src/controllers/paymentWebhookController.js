import crypto from 'crypto';
import PaymentTransaction from '../models/PaymentTransaction.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import RazorpayGateway from '../services/payment/gateways/RazorpayGateway.js';

class PaymentWebhookController {
  constructor() {
    this.razorpay = new RazorpayGateway();
  }

  /**
   * Handle Razorpay webhooks
   */
  async handleRazorpayWebhook(req, res) {
    try {
      console.log('🔍 Webhook handler called');
      console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
      console.log('📋 Body:', JSON.stringify(req.body, null, 2));
      console.log('📋 Raw Body length:', req.rawBody?.length || 'undefined');

      const webhookSignature = req.headers['x-razorpay-signature'];

      if (!webhookSignature) {
        console.error('❌ Missing webhook signature');
        return res.status(400).json({
          success: false,
          message: 'Missing webhook signature'
        });
      }

      // Check if webhook secret is configured
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        console.error('❌ RAZORPAY_WEBHOOK_SECRET not configured');
        return res.status(500).json({
          success: false,
          message: 'Webhook secret not configured'
        });
      }

      // Use raw body for signature verification
      const bodyForVerification = req.rawBody || JSON.stringify(req.body);
      console.log('📋 Body for verification length:', bodyForVerification.length);

      // Verify webhook signature using crypto directly to avoid binding issues
      const isValidSignature = this.verifyWebhookSignature ?
        this.verifyWebhookSignature(
          bodyForVerification,
          webhookSignature,
          process.env.RAZORPAY_WEBHOOK_SECRET
        ) :
        this.verifyWebhookSignatureDirect(
          bodyForVerification,
          webhookSignature,
          process.env.RAZORPAY_WEBHOOK_SECRET
        );

      if (!isValidSignature) {
        console.error('❌ Invalid webhook signature');
        console.error('📋 Expected signature calculation failed');
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }

      console.log('✅ Webhook signature verified successfully');

      const event = req.body;
      console.log('Razorpay webhook received:', event.event, event.payload?.payment?.entity?.id);

      // Handle different webhook events
      switch (event.event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(event.payload.payment.entity);
          break;
          
        case 'payment.failed':
          await this.handlePaymentFailed(event.payload.payment.entity);
          break;
          
        case 'payment.authorized':
          await this.handlePaymentAuthorized(event.payload.payment.entity);
          break;
          
        case 'order.paid':
          await this.handleOrderPaid(event.payload.order.entity);
          break;
          
        case 'refund.created':
          await this.handleRefundCreated(event.payload.refund.entity);
          break;
          
        case 'subscription.charged':
          await this.handleSubscriptionCharged(event.payload.subscription.entity);
          break;
          
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(event.payload.subscription.entity);
          break;
          
        default:
          console.log('Unhandled webhook event:', event.event);
      }

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }

  /**
   * Handle successful payment capture
   */
  async handlePaymentCaptured(payment) {
    try {
      const transaction = await PaymentTransaction.findOne({
        gatewayOrderId: payment.order_id
      });

      if (!transaction) {
        console.error('Transaction not found for order:', payment.order_id);
        return;
      }

      // Update transaction status
      transaction.gatewayPaymentId = payment.id;
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.webhookReceivedAt = new Date();
      
      if (payment.method) {
        transaction.paymentMethod = payment.method;
      }

      await transaction.save();

      // If this is a subscription payment and not already processed
      if (transaction.type.includes('subscription') && transaction.status !== 'completed') {
        await this.processSubscriptionActivation(transaction);
      }

      console.log('Payment captured processed:', payment.id);

    } catch (error) {
      console.error('Error handling payment captured:', error);
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(payment) {
    try {
      const transaction = await PaymentTransaction.findOne({
        gatewayOrderId: payment.order_id
      });

      if (!transaction) {
        console.error('Transaction not found for failed payment:', payment.order_id);
        return;
      }

      transaction.gatewayPaymentId = payment.id;
      transaction.status = 'failed';
      transaction.failureReason = payment.error_description || 'Payment failed';
      transaction.webhookReceivedAt = new Date();
      
      await transaction.save();

      console.log('Payment failed processed:', payment.id);

    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }

  /**
   * Handle payment authorization (for two-step payments)
   */
  async handlePaymentAuthorized(payment) {
    try {
      const transaction = await PaymentTransaction.findOne({
        gatewayOrderId: payment.order_id
      });

      if (transaction) {
        transaction.gatewayPaymentId = payment.id;
        transaction.status = 'authorized';
        transaction.webhookReceivedAt = new Date();
        await transaction.save();
      }

      console.log('Payment authorized processed:', payment.id);

    } catch (error) {
      console.error('Error handling payment authorized:', error);
    }
  }

  /**
   * Handle order completion
   */
  async handleOrderPaid(order) {
    try {
      // Additional processing when entire order is marked as paid
      console.log('Order paid processed:', order.id);
    } catch (error) {
      console.error('Error handling order paid:', error);
    }
  }

  /**
   * Handle refund creation
   */
  async handleRefundCreated(refund) {
    try {
      // Find the original transaction
      const originalTransaction = await PaymentTransaction.findOne({
        gatewayPaymentId: refund.payment_id
      });

      if (!originalTransaction) {
        console.error('Original transaction not found for refund:', refund.payment_id);
        return;
      }

      // Extract plan type and duration from original transaction
      const planParts = originalTransaction.planId.split('_');
      const planType = planParts[0]; // 'basic', 'standard', 'pro'
      const planDuration = planParts[1]; // 'monthly', 'quarterly', 'yearly'

      // Create refund transaction record
      const refundTransaction = new PaymentTransaction({
        userId: originalTransaction.userId,
        gatewayPaymentId: refund.payment_id,
        gatewayRefundId: refund.id,
        razorpayOrderId: originalTransaction.razorpayOrderId,
        gatewayOrderId: originalTransaction.gatewayOrderId,
        amount: -(refund.amount / 100), // Negative amount for refund
        currency: refund.currency.toUpperCase(),
        planType: planType,
        planDuration: planDuration,
        type: 'refund',
        status: 'completed',
        completedAt: new Date(),
        webhookProcessedAt: new Date(),
        planId: originalTransaction.planId,
        metadata: new Map([
          ['originalTransactionId', originalTransaction._id.toString()],
          ['refundReason', 'Webhook refund']
        ])
      });

      await refundTransaction.save();

      // Update original transaction
      originalTransaction.refundAmount = (originalTransaction.refundAmount || 0) + (refund.amount / 100);
      originalTransaction.partiallyRefunded = originalTransaction.refundAmount < originalTransaction.amount;
      originalTransaction.fullyRefunded = originalTransaction.refundAmount >= originalTransaction.amount;
      await originalTransaction.save();

      // If subscription was refunded, handle subscription cancellation
      if (originalTransaction.type.includes('subscription')) {
        await this.handleSubscriptionRefund(originalTransaction, refund);
      }

      console.log('Refund processed:', refund.id);

    } catch (error) {
      console.error('Error handling refund created:', error);
    }
  }

  /**
   * Handle subscription charged (for recurring payments)
   */
  async handleSubscriptionCharged(subscription) {
    try {
      // Handle recurring subscription charges
      // This would be used if we implement automatic renewals
      console.log('Subscription charged processed:', subscription.id);
    } catch (error) {
      console.error('Error handling subscription charged:', error);
    }
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCancelled(subscription) {
    try {
      // Handle subscription cancellation from Razorpay side
      const userSubscription = await Subscription.findOne({
        gatewaySubscriptionId: subscription.id
      });

      if (userSubscription && userSubscription.status === 'active') {
        userSubscription.status = 'cancelled';
        userSubscription.cancelledAt = new Date();
        userSubscription.cancelReason = 'gateway_cancelled';
        await userSubscription.save();

        // Update user status
        await User.findByIdAndUpdate(userSubscription.userId, {
          subscriptionStatus: 'cancelled'
        });
      }

      console.log('Subscription cancelled processed:', subscription.id);

    } catch (error) {
      console.error('Error handling subscription cancelled:', error);
    }
  }

  /**
   * Process subscription activation from webhook
   */
  async processSubscriptionActivation(transaction) {
    try {
      // Check if subscription already exists
      const existingSubscription = await Subscription.findOne({
        userId: transaction.userId,
        status: 'active'
      });

      if (existingSubscription) {
        console.log('Subscription already active for user:', transaction.userId);
        return;
      }

      // This should match the logic in subscriptionController.verifyPaymentAndActivate
      // but we need to be careful not to duplicate subscriptions

      const planDetailsStr = transaction.metadata.get('planDetails');
      if (!planDetailsStr) {
        console.error('Plan details not found in transaction metadata');
        return;
      }

      const planDetails = JSON.parse(planDetailsStr);

      // Extract plan type and duration from planId
      const planParts = transaction.planId.split('_');
      const planType = planParts[0]; // 'basic', 'standard', 'pro'
      const planDuration = planParts[1]; // 'monthly', 'quarterly', 'yearly'

      const now = new Date();
      const currentPeriodEnd = new Date(now);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (planDetails.intervalCount || 1));

      // Calculate subscription dates
      const endDate = new Date(currentPeriodEnd);
      const nextBillingDate = new Date(currentPeriodEnd);

      // Get plan configuration for features
      const planConfig = Subscription.getPlanConfig(planType);

      const subscription = new Subscription({
        userId: transaction.userId,
        planId: transaction.planId,
        planType: planType,
        planName: planDetails.name || planConfig?.name || 'Basic Plan',
        planPrice: planDetails.price || planConfig?.price || 14900,
        planDuration: planDuration,
        status: 'active',
        startDate: now,
        endDate: endDate,
        currentPeriodStart: now,
        currentPeriodEnd,
        nextBillingDate: nextBillingDate,
        gatewaySubscriptionId: transaction.gatewayPaymentId,
        razorpayPlanId: transaction.planId,
        razorpayCustomerId: transaction.userId.toString(),
        paymentMethod: 'razorpay',
        amount: planDetails.price || planConfig?.price || 14900,
        currency: 'INR',
        interval: planDetails.interval || (planConfig?.duration === 'monthly' ? 'month' : 'year'),
        intervalCount: planDetails.intervalCount || 1,
        features: {
          lessonsPerPeriod: planConfig?.features?.lessonsPerPeriod || planDetails.features?.lessons?.value || 10,
          hasForumAccess: planConfig?.features?.hasForumAccess || false,
          hasLiveChatSupport: planConfig?.features?.hasLiveChatSupport || false,
          hasBonusContent: planConfig?.features?.hasBonusContent || false,
          hasCertification: planConfig?.features?.hasCertification || false,
          hasEarlyAccess: planConfig?.features?.hasEarlyAccess || false,
          discountPercentage: planConfig?.features?.discountPercentage || 0
        },
        metadata: new Map([
          ['activatedFromWebhook', 'true'],
          ['transactionId', transaction._id.toString()]
        ])
      });

      await subscription.save();

      // Update user - use plan type extracted from planId
      const subscriptionTier = planType; // Use planType extracted from planId: 'basic', 'standard', 'pro'
      await User.findByIdAndUpdate(transaction.userId, {
        currentSubscriptionId: subscription._id,
        subscriptionStatus: 'active',
        subscriptionTier: subscriptionTier // Use valid enum values: 'free', 'basic', 'standard', 'pro'
      });

      console.log('Subscription activated via webhook for user:', transaction.userId);

    } catch (error) {
      console.error('Error processing subscription activation:', error);
    }
  }

  /**
   * Handle subscription refund
   */
  async handleSubscriptionRefund(originalTransaction, refund) {
    try {
      const subscription = await Subscription.findOne({
        userId: originalTransaction.userId,
        status: { $in: ['active', 'cancelled'] }
      }).sort({ createdAt: -1 });

      if (subscription) {
        // If fully refunded, cancel immediately
        if (refund.amount >= (originalTransaction.amount * 100)) {
          subscription.status = 'cancelled';
          subscription.cancelledAt = new Date();
          subscription.cancelReason = 'refunded';
          await subscription.save();

          // Update user status
          await User.findByIdAndUpdate(subscription.userId, {
            subscriptionStatus: 'cancelled'
          });
        }
      }
    } catch (error) {
      console.error('Error handling subscription refund:', error);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body, signature, secret) {
    try {
      console.log('🔐 Verifying webhook signature');
      console.log('📋 Body type:', typeof body);
      console.log('📋 Body length:', body?.length || 'undefined');
      console.log('📋 Signature:', signature);
      console.log('📋 Secret length:', secret?.length || 'undefined');

      // Use body as-is if it's already a string, otherwise stringify
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyString)
        .digest('hex');

      console.log('📋 Expected signature:', expectedSignature);
      console.log('📋 Received signature:', signature);
      console.log('📋 Signatures match:', signature === expectedSignature);

      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Direct webhook signature verification (fallback)
   */
  verifyWebhookSignatureDirect(body, signature, secret) {
    try {
      console.log('🔐 Verifying webhook signature (direct method)');

      // Use body as-is if it's already a string, otherwise stringify
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyString)
        .digest('hex');

      console.log('📋 Expected signature (direct):', expectedSignature);
      console.log('📋 Received signature (direct):', signature);

      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Error verifying webhook signature (direct):', error);
      return false;
    }
  }

  /**
   * Get webhook logs (for debugging)
   */
  async getWebhookLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      const transactions = await PaymentTransaction.find({
        webhookProcessedAt: { $exists: true }
      })
        .sort({ webhookProcessedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('gatewayPaymentId status type amount webhookProcessedAt completedAt');

      const total = await PaymentTransaction.countDocuments({
        webhookProcessedAt: { $exists: true }
      });

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get webhook logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webhook logs'
      });
    }
  }
}

export default new PaymentWebhookController();
