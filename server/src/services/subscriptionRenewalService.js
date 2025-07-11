import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import RazorpayGateway from './payment/gateways/RazorpayGateway.js';
import emailService from './emailService.js';
import config from '../config/index.js';

/**
 * Subscription Renewal Service
 * Handles automatic subscription renewals, notifications, and payment processing
 */
class SubscriptionRenewalService {
  constructor() {
    this.razorpay = new RazorpayGateway();
    this.isRunning = false;
  }

  /**
   * Start the subscription renewal service
   */
  start() {
    if (!config.features.payments) {
      console.log('💳 Subscription renewal service disabled (payments not enabled)');
      return;
    }

    console.log('🔄 Starting subscription renewal service...');

    // Send payment reminders (runs daily at 9 AM)
    cron.schedule('0 9 * * *', async () => {
      console.log('📧 Running daily payment reminder check...');
      await this.sendPaymentReminders();
    });

    // Process subscription renewals (runs every hour)
    cron.schedule('0 * * * *', async () => {
      if (this.isRunning) {
        console.log('🔄 Renewal service already running, skipping...');
        return;
      }

      console.log('🔄 Running subscription renewal check...');
      await this.processSubscriptionRenewals();
    });

    // Handle expired subscriptions (runs daily at midnight)
    cron.schedule('0 0 * * *', async () => {
      console.log('⏰ Running expired subscription check...');
      await this.handleExpiredSubscriptions();
    });

    // Retry failed payments (runs every 4 hours)
    cron.schedule('0 */4 * * *', async () => {
      console.log('🔄 Running failed payment retry...');
      await this.retryFailedPayments();
    });
  }

  /**
   * Send payment reminders to users before renewal
   */
  async sendPaymentReminders() {
    try {
      const now = new Date();
      const reminderDays = [7, 3, 1]; // Send reminders 7, 3, and 1 day before renewal

      for (const days of reminderDays) {
        const reminderDate = new Date(now);
        reminderDate.setDate(reminderDate.getDate() + days);
        reminderDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(reminderDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find subscriptions due for renewal in 'days' time
        const subscriptions = await Subscription.find({
          status: 'active',
          autoRenewal: true,
          cancelAtPeriodEnd: false,
          nextBillingDate: {
            $gte: reminderDate,
            $lt: nextDay
          },
          // Don't send reminder if we already sent one today
          lastReminderSent: {
            $not: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          }
        }).populate('userId');

        console.log(`📧 Found ${subscriptions.length} subscriptions for ${days}-day reminder`);

        for (const subscription of subscriptions) {
          try {
            await emailService.sendPaymentReminder(
              subscription.userId,
              subscription,
              days
            );

            // Update last reminder sent date
            subscription.lastReminderSent = now;
            await subscription.save();

          } catch (error) {
            console.error(`❌ Failed to send reminder for subscription ${subscription._id}:`, error);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error in sendPaymentReminders:', error);
    }
  }

  /**
   * Process subscription renewals
   */
  async processSubscriptionRenewals() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = new Date();
      
      // Find subscriptions that are due for renewal
      const subscriptionsToRenew = await Subscription.find({
        status: 'active',
        autoRenewal: true,
        cancelAtPeriodEnd: false,
        nextBillingDate: { $lte: now },
        // Avoid processing the same subscription multiple times
        lastRenewalAttempt: {
          $not: {
            $gte: new Date(now.getTime() - 1000 * 60 * 60) // Not attempted in the last hour
          }
        }
      }).populate('userId');

      console.log(`🔄 Found ${subscriptionsToRenew.length} subscriptions to renew`);

      for (const subscription of subscriptionsToRenew) {
        try {
          await this.renewSubscription(subscription);
        } catch (error) {
          console.error(`❌ Failed to renew subscription ${subscription._id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error in processSubscriptionRenewals:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Renew individual subscription
   */
  async renewSubscription(subscription) {
    try {
      console.log(`🔄 Attempting to renew subscription ${subscription._id} for user ${subscription.userId.email}`);

      // Update renewal attempt timestamp
      subscription.lastRenewalAttempt = new Date();
      await subscription.save();

      // Create a new payment transaction for the renewal
      const transaction = new PaymentTransaction({
        userId: subscription.userId._id,
        planId: subscription.planId,
        amount: subscription.amount,
        currency: subscription.currency,
        type: 'subscription_renewal',
        status: 'pending',
        gatewayOrderId: null, // Will be set when order is created
        subscriptionId: subscription._id,
        metadata: new Map([
          ['renewalFor', subscription._id.toString()],
          ['originalPlan', subscription.planId]
        ])
      });

      await transaction.save();

      // Create Razorpay order for the renewal payment
      const orderResult = await this.razorpay.createOrder({
        amount: subscription.amount,
        currency: subscription.currency,
        receipt: `renewal_${subscription._id}_${Date.now()}`,
        notes: {
          subscription_id: subscription._id.toString(),
          user_id: subscription.userId._id.toString(),
          renewal: 'true'
        }
      });

      if (!orderResult.success) {
        throw new Error(`Failed to create renewal order: ${orderResult.error}`);
      }

      // Update transaction with order details
      transaction.gatewayOrderId = orderResult.data.id;
      transaction.status = 'processing';
      await transaction.save();

      // Try to charge the existing payment method
      // Note: For Razorpay, this typically involves creating a subscription or using saved payment methods
      // The actual charging would be handled through webhooks when the payment succeeds

      console.log(`✅ Renewal process initiated for subscription ${subscription._id}`);

    } catch (error) {
      console.error(`❌ Error renewing subscription ${subscription._id}:`, error);
      
      // Mark the renewal as failed
      subscription.renewalFailedAt = new Date();
      subscription.renewalFailureCount = (subscription.renewalFailureCount || 0) + 1;
      await subscription.save();

      // Send payment failed notification
      await emailService.sendPaymentFailedNotification(
        subscription.userId,
        subscription,
        error.message
      );

      throw error;
    }
  }

  /**
   * Handle expired subscriptions
   */
  async handleExpiredSubscriptions() {
    try {
      const now = new Date();
      const gracePeriod = 7; // 7 days grace period

      // Find subscriptions that have expired (past grace period)
      const expiredSubscriptions = await Subscription.find({
        status: 'active',
        currentPeriodEnd: { $lt: new Date(now.getTime() - gracePeriod * 24 * 60 * 60 * 1000) },
        $or: [
          { autoRenewal: false },
          { cancelAtPeriodEnd: true },
          { renewalFailureCount: { $gte: 3 } } // Failed 3 renewal attempts
        ]
      }).populate('userId');

      console.log(`⏰ Found ${expiredSubscriptions.length} expired subscriptions`);

      for (const subscription of expiredSubscriptions) {
        try {
          // Cancel the subscription
          subscription.status = 'expired';
          subscription.expiredAt = now;
          await subscription.save();

          // Update user subscription status
          await User.findByIdAndUpdate(subscription.userId._id, {
            subscriptionStatus: 'expired',
            subscriptionTier: 'free'
          });

          // Send cancellation notification
          await emailService.sendSubscriptionCancelledNotification(
            subscription.userId,
            subscription,
            subscription.renewalFailureCount >= 3 ? 'Payment failures' : 'Subscription expired'
          );

          console.log(`✅ Expired subscription ${subscription._id} for user ${subscription.userId.email}`);

        } catch (error) {
          console.error(`❌ Failed to expire subscription ${subscription._id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error in handleExpiredSubscriptions:', error);
    }
  }

  /**
   * Retry failed payments
   */
  async retryFailedPayments() {
    try {
      const now = new Date();
      const retryWindow = 3 * 24 * 60 * 60 * 1000; // 3 days

      // Find subscriptions with recent renewal failures
      const failedSubscriptions = await Subscription.find({
        status: 'active',
        renewalFailedAt: { $gte: new Date(now.getTime() - retryWindow) },
        renewalFailureCount: { $lt: 3 }, // Don't retry more than 3 times
        lastRetryAttempt: {
          $not: {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Not retried in the last 24 hours
          }
        }
      }).populate('userId');

      console.log(`🔄 Found ${failedSubscriptions.length} subscriptions to retry payment`);

      for (const subscription of failedSubscriptions) {
        try {
          subscription.lastRetryAttempt = now;
          await subscription.save();

          await this.renewSubscription(subscription);
          
        } catch (error) {
          console.error(`❌ Failed to retry payment for subscription ${subscription._id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error in retryFailedPayments:', error);
    }
  }

  /**
   * Process successful renewal payment (called from webhook)
   */
  async processSuccessfulRenewal(subscription, paymentData) {
    try {
      console.log(`✅ Processing successful renewal for subscription ${subscription._id}`);

      // Calculate next billing period
      const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
      const nextPeriodStart = new Date(currentPeriodEnd);
      const nextPeriodEnd = new Date(nextPeriodStart);

      // Add the interval to get the next period
      if (subscription.interval === 'month') {
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + subscription.intervalCount);
      } else if (subscription.interval === 'year') {
        nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + subscription.intervalCount);
      }

      // Update subscription with new period
      subscription.currentPeriodStart = nextPeriodStart;
      subscription.currentPeriodEnd = nextPeriodEnd;
      subscription.nextBillingDate = nextPeriodEnd;
      subscription.lastPaymentDate = new Date();
      subscription.lastPaymentId = paymentData.paymentId;
      
      // Reset failure counters
      subscription.renewalFailedAt = null;
      subscription.renewalFailureCount = 0;
      subscription.lastRetryAttempt = null;

      await subscription.save();

      console.log(`✅ Subscription ${subscription._id} renewed until ${nextPeriodEnd}`);

    } catch (error) {
      console.error(`❌ Error processing successful renewal for subscription ${subscription._id}:`, error);
      throw error;
    }
  }
}

export default new SubscriptionRenewalService();
