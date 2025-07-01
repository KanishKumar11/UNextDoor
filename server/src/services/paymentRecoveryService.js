/**
 * Payment Recovery Service
 * 
 * Automatically checks for and recovers pending payments
 * This service runs as a background job to handle cases where:
 * - User's internet connection fails during payment
 * - Webhook delivery fails
 * - Payment was successful but subscription wasn't activated
 */

import cron from 'node-cron';
import PaymentTransaction from '../models/PaymentTransaction.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import RazorpayGateway from './payment/gateways/RazorpayGateway.js';
import config from '../config/index.js';

class PaymentRecoveryService {
  constructor() {
    this.razorpay = new RazorpayGateway();
    this.isRunning = false;
  }

  /**
   * Start the payment recovery service
   */
  start() {
    if (!config.features.payments) {
      console.log('💳 Payment recovery service disabled (payments not enabled)');
      return;
    }

    console.log('🔄 Starting payment recovery service...');

    // Run every 5 minutes to check for pending payments
    cron.schedule('*/5 * * * *', async () => {
      if (this.isRunning) {
        console.log('📋 Payment recovery already running, skipping...');
        return;
      }

      console.log('🔍 Running payment recovery check...');
      await this.recoverPendingPayments();
    });

    // Run a more thorough check every hour for older transactions
    cron.schedule('0 * * * *', async () => {
      console.log('🔍 Running hourly payment recovery check...');
      await this.recoverPendingPayments(60); // Check transactions up to 1 hour old
    });

    console.log('✅ Payment recovery service started');
  }

  /**
   * Recover pending payments
   * @param {number} maxAgeMinutes - Maximum age of transactions to check (default: 10 minutes)
   */
  async recoverPendingPayments(maxAgeMinutes = 10) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
      
      // Find pending transactions older than cutoff time
      const pendingTransactions = await PaymentTransaction.find({
        status: 'pending',
        createdAt: { $lt: cutoffTime }
      }).limit(50); // Process in batches to avoid overwhelming the system

      if (pendingTransactions.length === 0) {
        console.log('📋 No pending payments to recover');
        return;
      }

      console.log(`🔄 Found ${pendingTransactions.length} pending payments to check`);

      const results = {
        checked: 0,
        recovered: 0,
        failed: 0,
        errors: []
      };

      for (const transaction of pendingTransactions) {
        try {
          results.checked++;
          const recovered = await this.recoverSinglePayment(transaction);
          
          if (recovered === 'success') {
            results.recovered++;
          } else if (recovered === 'failed') {
            results.failed++;
          }

        } catch (error) {
          results.errors.push({
            transactionId: transaction._id,
            orderId: transaction.gatewayOrderId,
            error: error.message
          });
          console.error(`❌ Error recovering payment ${transaction.gatewayOrderId}:`, error.message);
        }
      }

      console.log(`✅ Payment recovery completed:`, results);

      // Alert if there are many failures (potential system issue)
      if (results.errors.length > 5) {
        console.error(`🚨 High payment recovery error rate: ${results.errors.length} errors`);
        // Here you could send alerts to monitoring systems
      }

    } catch (error) {
      console.error('❌ Payment recovery service error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Recover a single payment transaction
   * @param {Object} transaction - The pending transaction
   * @returns {string} - 'success', 'failed', or 'pending'
   */
  async recoverSinglePayment(transaction) {
    try {
      // Check payment status with Razorpay
      const razorpayOrder = await this.razorpay.getOrder(transaction.gatewayOrderId);
      
      if (razorpayOrder.status === 'paid') {
        // Order is paid, find the successful payment
        const payments = await this.razorpay.getOrderPayments(transaction.gatewayOrderId);
        const successfulPayment = payments.find(p => p.status === 'captured');

        if (successfulPayment) {
          console.log(`💰 Recovering successful payment: ${transaction.gatewayOrderId}`);
          
          // Update transaction
          transaction.gatewayPaymentId = successfulPayment.id;
          transaction.status = 'completed';
          transaction.completedAt = new Date();
          transaction.recoveredAt = new Date();
          transaction.recoveryMethod = 'auto_recovery_service';
          await transaction.save();

          // Activate subscription
          await this.activateSubscription(transaction);
          
          console.log(`✅ Payment recovered successfully: ${transaction.gatewayOrderId}`);
          return 'success';
        }
      } else if (razorpayOrder.status === 'failed' || razorpayOrder.status === 'cancelled') {
        // Payment failed, update transaction
        console.log(`❌ Payment failed: ${transaction.gatewayOrderId}`);
        
        transaction.status = 'failed';
        transaction.failureReason = `Payment ${razorpayOrder.status} (auto-recovery check)`;
        transaction.recoveredAt = new Date();
        transaction.recoveryMethod = 'auto_recovery_service';
        await transaction.save();
        
        return 'failed';
      } else {
        // Still pending or attempt_processing
        console.log(`⏳ Payment still pending: ${transaction.gatewayOrderId} (${razorpayOrder.status})`);
        return 'pending';
      }

    } catch (error) {
      // If we can't check with Razorpay, mark as unknown after 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (transaction.createdAt < twentyFourHoursAgo) {
        console.log(`🔄 Marking old transaction as failed: ${transaction.gatewayOrderId}`);
        
        transaction.status = 'failed';
        transaction.failureReason = 'Unable to verify after 24 hours';
        transaction.recoveredAt = new Date();
        transaction.recoveryMethod = 'auto_recovery_service';
        await transaction.save();
        
        return 'failed';
      }
      
      throw error;
    }
  }

  /**
   * Activate subscription from recovered payment
   * @param {Object} transaction - The completed transaction
   */
  async activateSubscription(transaction) {
    try {
      // Check if subscription already exists (avoid duplicates)
      const existingSubscription = await Subscription.findOne({
        userId: transaction.userId,
        status: 'active'
      });

      if (existingSubscription && transaction.type !== 'subscription_upgrade') {
        console.log(`📋 Subscription already active for user: ${transaction.userId}`);
        return existingSubscription;
      }

      // Handle existing subscription if upgrading
      if (transaction.type === 'subscription_upgrade' && transaction.metadata.existingSubscriptionId) {
        const oldSubscription = await Subscription.findById(transaction.metadata.existingSubscriptionId);
        if (oldSubscription && oldSubscription.status === 'active') {
          oldSubscription.status = 'cancelled';
          oldSubscription.cancelledAt = new Date();
          oldSubscription.cancelReason = 'upgraded';
          await oldSubscription.save();
          console.log(`📋 Cancelled old subscription for upgrade: ${oldSubscription._id}`);
        }
      }

      // Create new subscription
      const planDetails = transaction.metadata.planDetails;
      const now = new Date();
      const currentPeriodEnd = new Date(now);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + planDetails.intervalCount);

      const subscription = new Subscription({
        userId: transaction.userId,
        planId: transaction.planId,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd,
        gatewaySubscriptionId: transaction.gatewayPaymentId,
        paymentMethod: 'razorpay',
        amount: planDetails.price,
        currency: 'INR',
        interval: planDetails.interval,
        intervalCount: planDetails.intervalCount,
        features: planDetails.features,
        metadata: {
          activatedFromTransaction: transaction._id,
          activatedViaRecovery: true,
          recoveredAt: new Date()
        }
      });

      await subscription.save();

      // Update user
      await User.findByIdAndUpdate(transaction.userId, {
        currentSubscriptionId: subscription._id,
        subscriptionStatus: 'active',
        subscriptionTier: planDetails.name.toLowerCase()
      });

      console.log(`✅ Subscription activated via recovery for user: ${transaction.userId}`);
      return subscription;

    } catch (error) {
      console.error(`❌ Error activating subscription for recovery: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get recovery statistics
   */
  async getRecoveryStats() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        last24Hours: {
          recovered: await PaymentTransaction.countDocuments({
            recoveredAt: { $gte: oneDayAgo },
            recoveryMethod: 'auto_recovery_service',
            status: 'completed'
          }),
          failed: await PaymentTransaction.countDocuments({
            recoveredAt: { $gte: oneDayAgo },
            recoveryMethod: 'auto_recovery_service',
            status: 'failed'
          })
        },
        last7Days: {
          recovered: await PaymentTransaction.countDocuments({
            recoveredAt: { $gte: oneWeekAgo },
            recoveryMethod: 'auto_recovery_service',
            status: 'completed'
          }),
          failed: await PaymentTransaction.countDocuments({
            recoveredAt: { $gte: oneWeekAgo },
            recoveryMethod: 'auto_recovery_service',
            status: 'failed'
          })
        },
        currentPending: await PaymentTransaction.countDocuments({
          status: 'pending'
        })
      };

      return stats;
    } catch (error) {
      console.error('Error getting recovery stats:', error);
      return null;
    }
  }

  /**
   * Manually trigger recovery (for testing or emergency)
   */
  async manualRecovery(orderId = null) {
    if (orderId) {
      // Recover specific transaction
      const transaction = await PaymentTransaction.findOne({
        gatewayOrderId: orderId
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return await this.recoverSinglePayment(transaction);
    } else {
      // Recover all pending payments
      return await this.recoverPendingPayments(120); // Check up to 2 hours old
    }
  }
}

export default new PaymentRecoveryService();
