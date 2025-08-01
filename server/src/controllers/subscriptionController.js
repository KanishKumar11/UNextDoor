import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import PaymentOrder from '../models/PaymentOrder.js';
import RazorpayGateway from '../services/payment/gateways/RazorpayGateway.js';
import { validationResult } from 'express-validator';
import config from '../config/index.js';
import mongoose from 'mongoose';
import { getUserCurrency, PLAN_PRICES, getPlanPrice } from '../utils/currencyUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SubscriptionController {
  constructor() {
    // Only initialize Razorpay if payments are enabled
    if (config.features.payments) {
      this.razorpay = new RazorpayGateway();
    } else {
      this.razorpay = null;
      console.log('ℹ️ Payment system is disabled - subscription controller running in demo mode');
    }
  }

  /**
   * Get available subscription plans
   */
  async getPlans(req, res) {
    try {
      // Get user's currency preference (saved preference takes priority over location detection)
      let currency = getUserCurrency(req); // Default based on location
      console.log(`💰 Location-based currency for request:`, currency.code);

      // If user is authenticated, check their saved currency preference
      if (req.user) {
        const user = await User.findById(req.user.id);
        console.log(`💰 User preferences:`, user?.preferences);

        if (user && user.preferences && user.preferences.currency) {
          // Use saved preference
          const savedCurrencyCode = user.preferences.currency;
          if (savedCurrencyCode === 'INR') {
            currency = { code: 'INR', symbol: '₹', exchangeRate: 1, name: 'Indian Rupee' };
          } else if (savedCurrencyCode === 'USD') {
            currency = { code: 'USD', symbol: '$', exchangeRate: 0.012, name: 'US Dollar' };
          }
          console.log(`💰 Using saved currency preference for user ${req.user.id}:`, currency.code);
        } else {
          console.log(`💰 No saved currency preference, using location-based:`, currency.code);
        }
      } else {
        console.log(`💰 Anonymous user, using location-based:`, currency.code);
      }

      const plans = [
        {
          id: 'free',
          name: 'Free',
          description: 'Get started with Korean learning basics',
          price: 0,
          currency: currency.code,
          currencySymbol: currency.symbol,
          interval: 'month',
          intervalCount: 1,
          features: {
            lessons: { value: 5, unit: 'per month', label: '5 lessons/month' },
            community: {
              value: 'basic',
              label: 'Basic community access (read-only)'
            },
            support: {
              value: 'email',
              label: 'Email support (no guaranteed response time)'
            },
            bonusContent: { value: false, label: 'No bonus content' },
            certification: { value: false, label: 'No certificates' },
            additionalPerks: []
          },
          popular: false
        },
        {
          id: 'basic_monthly',
          name: 'Basic',
          description: 'Perfect for getting started with Korean learning',
          price: PLAN_PRICES.basic_monthly[currency.code] ?? PLAN_PRICES.basic_monthly.INR,
          currency: currency.code,
          currencySymbol: currency.symbol,
          paymentAmountINR: currency.code === 'USD' ?
            Math.round((PLAN_PRICES.basic_monthly.USD * 83.33) * 100) / 100 :
            PLAN_PRICES.basic_monthly.INR,
          paymentCurrency: 'INR',
          interval: 'month',
          intervalCount: 1,
          features: {
            lessons: { value: 10, unit: 'per month', label: '10 new lessons/month' },
            community: {
              value: 'limited',
              label: 'Limited forum access (read-only threads; one post per week)'
            },
            support: {
              value: '48h',
              label: 'Email support with 48-hour response time'
            },
            bonusContent: { value: false, label: 'No access to Bonus Content' },
            certification: { value: false, label: 'Certification Not included' },
            additionalPerks: ['Access to monthly newsletters only']
          },
          popular: false
        },
        {
          id: 'standard_quarterly',
          name: 'Standard',
          description: 'Most popular choice for serious learners',
          price: PLAN_PRICES.standard_quarterly[currency.code] ?? PLAN_PRICES.standard_quarterly.INR,
          currency: currency.code,
          currencySymbol: currency.symbol,
          paymentAmountINR: currency.code === 'USD' ?
            Math.round((PLAN_PRICES.standard_quarterly.USD * 83.33) * 100) / 100 :
            PLAN_PRICES.standard_quarterly.INR,
          paymentCurrency: 'INR',
          interval: 'month',
          intervalCount: 3,
          features: {
            lessons: {
              value: 30,
              unit: 'per quarter',
              label: '30 new lessons/quarter (10/month equivalent)'
            },
            community: {
              value: 'full',
              label: 'Full forum access (posting and commenting) + moderated study groups'
            },
            support: {
              value: '24h',
              label: 'Priority email support with 24-hour response time'
            },
            bonusContent: {
              value: 'deep_dive',
              label: 'Access to 1 "Deep Dive" bonus lesson per month'
            },
            certification: {
              value: 'module',
              label: 'Certificate of Completion for each module (x3 per quarter)'
            },
            additionalPerks: [
              'Early access to upcoming lessons',
              'Quarterly live Q&A session'
            ]
          },
          popular: true
        },
        {
          id: 'pro_yearly',
          name: 'Pro',
          description: 'Ultimate Korean learning experience with all features',
          price: PLAN_PRICES.pro_yearly[currency.code] ?? PLAN_PRICES.pro_yearly.INR,
          currency: currency.code,
          currencySymbol: currency.symbol,
          paymentAmountINR: currency.code === 'USD' ?
            Math.round((PLAN_PRICES.pro_yearly.USD * 83.33) * 100) / 100 :
            PLAN_PRICES.pro_yearly.INR,
          paymentCurrency: 'INR',
          interval: 'month',
          intervalCount: 12,
          features: {
            lessons: {
              value: 120,
              unit: 'per year',
              label: '120 lessons/year (10/month)'
            },
            community: {
              value: 'premium',
              label: 'Full forum access + invite to exclusive Pro Slack/Discord channels'
            },
            support: {
              value: 'live_chat',
              label: 'Live chat + email support with same-day response'
            },
            bonusContent: {
              value: 'premium',
              label: '"Deep Dive" lesson each month + Monthly guest expert webinar + Resource library'
            },
            certification: {
              value: 'advanced',
              label: 'Module certificates + End-of-year "Advanced Pro" certification'
            },
            additionalPerks: [
              'Early-bird access to new features and lessons',
              '10% discount on workshops, merch, and "Mastery" one-on-one coaching packages'
            ]
          },
          popular: false
        }
      ];

      res.json({
        success: true,
        data: {
          plans,
          userCurrency: currency
        }
      });
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription plans'
      });
    }
  }

  /**
   * Get user's current subscription
   */
  async getCurrentSubscription(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trialing'] }
      }).sort({ createdAt: -1 });

      if (!subscription) {
        return res.json({
          success: true,
          data: { subscription: null, hasActiveSubscription: false }
        });
      }

      // Check if subscription is expired
      const now = new Date();
      const isExpired = now > subscription.currentPeriodEnd;

      if (isExpired && subscription.status === 'active') {
        subscription.status = 'expired';
        await subscription.save();
      }

      res.json({
        success: true,
        data: {
          subscription,
          hasActiveSubscription: !isExpired && subscription.status === 'active'
        }
      });
    } catch (error) {
      console.error('Get current subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current subscription'
      });
    }
  }

  /**
   * Create subscription order (step 1 of payment flow)
   * This creates a temporary order without pending subscription/payment records
   */
  async createSubscriptionOrder(req, res) {
    try {
      // Check if payments are enabled
      if (!config.features.payments || !this.razorpay) {
        return res.status(503).json({
          success: false,
          message: 'Payment system is currently disabled. Please contact support.',
          featureStatus: {
            payments: config.features.payments,
            reason: 'PAYMENTS_DISABLED'
          }
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { planId } = req.body;
      const userId = req.user.id;

      // Validate plan
      const validPlans = ['basic_monthly', 'standard_quarterly', 'pro_yearly'];
      if (!validPlans.includes(planId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      // Get plan details with user's currency
      const planDetails = await this.getPlanDetails(planId, req);

      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check for existing active subscription
      const existingSubscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trialing'] }
      });

      let orderAmount = planDetails.price;
      let prorationCredit = 0;

      // Calculate proration if upgrading
      if (existingSubscription) {
        const upgrade = this.calculateUpgrade(existingSubscription, planDetails);
        if (!upgrade.isUpgrade) {
          return res.status(400).json({
            success: false,
            message: 'Downgrades are not allowed mid-cycle. Please wait until your current subscription expires.'
          });
        }

        prorationCredit = upgrade.prorationCredit;
        orderAmount = Math.max(0, planDetails.price - prorationCredit);
      }

      // Create Razorpay order - amount must be in paise (multiply by 100)
      const amountInPaise = Math.round(orderAmount * 100);
      console.log(`💰 Creating order for amount: ${planDetails.currencySymbol}${orderAmount} (${amountInPaise} paise)`);

      const razorpayOrder = await this.razorpay.createOrder(
        amountInPaise,
        planDetails.currency || 'INR',
        {
          receipt: `sub_${Date.now().toString().slice(-10)}`,
          notes: {
            userId,
            planId,
            subscriptionType: existingSubscription ? 'upgrade' : 'new',
            prorationCredit: prorationCredit.toString()
          }
        }
      );

      if (!razorpayOrder.success) {
        console.error('❌ Failed to create Razorpay order:', razorpayOrder);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment order',
          error: razorpayOrder.error
        });
      }

      // Generate unique order ID (URL-safe)
      const timestamp = Date.now();
      const userIdSuffix = userId.toString().slice(-8);
      const orderId = `ord_${timestamp}_${userIdSuffix}`;

      // Create temporary payment order (no subscription/payment records yet)
      const paymentOrder = new PaymentOrder({
        userId,
        planId,
        orderId,
        razorpayOrderId: razorpayOrder.data.id,
        amount: orderAmount, // Payment amount (may be in INR for Razorpay)
        originalAmount: planDetails.price,
        displayAmount: planDetails.price, // Display amount in user's currency
        displayCurrency: planDetails.currency, // User's selected currency
        paymentAmountINR: orderAmount, // Actual payment amount
        currency: planDetails.currency || 'INR',
        status: 'created',
        planDetails,
        userDetails: {
          name: user.name || user.email,
          email: user.email,
          contact: user.phone || ''
        },
        prorationCredit,
        metadata: new Map([
          ['existingSubscriptionId', existingSubscription?._id?.toString() || ''],
          ['orderCreatedAt', new Date().toISOString()],
          ['userAgent', req.headers['user-agent'] || '']
        ])
      });

      await paymentOrder.save();

      // Generate payment URL with token (use SERVER_URL env or request host fallback)
      const token = req.headers.authorization?.replace('Bearer ', '');
      const baseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
      const paymentUrl = `${baseUrl}/api/v1/subscriptions/payment-page/${orderId}?token=${encodeURIComponent(token)}`;

      res.json({
        success: true,
        data: {
          orderId,
          razorpayOrderId: razorpayOrder.data.id,
          amount: orderAmount,
          currency: 'INR',
          planDetails,
          prorationCredit,
          paymentUrl,
          existingSubscription: existingSubscription ? {
            planId: existingSubscription.planId,
            currentPeriodEnd: existingSubscription.currentPeriodEnd
          } : null
        }
      });

    } catch (error) {
      console.error('Create subscription order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription order'
      });
    }
  }

  /**
   * Verify payment and activate subscription
   */
  async verifyPaymentAndActivate(req, res) {
    try {
      // Check if payments are enabled
      if (!config.features.payments || !this.razorpay) {
        return res.status(503).json({
          success: false,
          message: 'Payment system is currently disabled. Please contact support.',
          featureStatus: {
            payments: config.features.payments,
            reason: 'PAYMENTS_DISABLED'
          }
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const userId = req.user.id;

      // Verify payment signature using Razorpay SDK with enhanced error handling
      let verificationResult;
      try {
        verificationResult = await this.razorpay.verifyPayment(
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature
        );
      } catch (verificationError) {
        console.error('❌ Payment verification error:', verificationError);
        return res.status(500).json({
          success: false,
          message: 'Payment verification failed due to system error',
          error: verificationError.message,
          code: 'VERIFICATION_SYSTEM_ERROR'
        });
      }

      if (!verificationResult.success) {
        console.error('❌ Invalid payment signature:', {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          error: verificationResult.error
        });
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature',
          error: verificationResult.error,
          code: 'INVALID_SIGNATURE'
        });
      }

      // Find payment order with enhanced error handling
      let paymentOrder;
      try {
        paymentOrder = await PaymentOrder.findOne({
          razorpayOrderId: razorpay_order_id,
          userId,
          status: { $in: ['created', 'processing'] }
        });
      } catch (dbError) {
        console.error('❌ Database error finding payment order:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error during payment verification',
          code: 'DATABASE_ERROR'
        });
      }

      if (!paymentOrder) {
        // Try to find any payment order for this Razorpay order ID (for debugging)
        const anyPaymentOrder = await PaymentOrder.findOne({
          razorpayOrderId: razorpay_order_id
        });

        if (anyPaymentOrder) {
          console.error('❌ Payment order found but not for this user or already processed:', {
            orderId: razorpay_order_id,
            orderUserId: anyPaymentOrder.userId,
            requestUserId: userId,
            orderStatus: anyPaymentOrder.status
          });
          return res.status(400).json({
            success: false,
            message: 'Payment order already processed or belongs to different user',
            code: 'ORDER_ALREADY_PROCESSED'
          });
        }

        console.error('❌ Payment order not found:', {
          orderId: razorpay_order_id,
          userId: userId
        });
        return res.status(404).json({
          success: false,
          message: 'Payment order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      // Update payment order status
      paymentOrder.status = 'paid';
      await paymentOrder.save();

      // Check for existing subscription if this is an upgrade
      const existingSubscriptionId = paymentOrder.metadata.get('existingSubscriptionId');
      let existingSubscription = null;

      if (existingSubscriptionId) {
        existingSubscription = await Subscription.findById(existingSubscriptionId);
        if (existingSubscription && existingSubscription.status === 'active') {
          existingSubscription.status = 'cancelled';
          existingSubscription.cancelledAt = new Date();
          existingSubscription.cancelReason = 'upgraded';
          await existingSubscription.save();
        }
      }

      // Extract plan type and duration from planId (e.g., 'basic_monthly' -> 'basic', 'monthly')
      const planParts = paymentOrder.planId.split('_');
      const planType = planParts[0]; // 'basic', 'standard', 'pro'
      const planDuration = planParts[1]; // 'monthly', 'quarterly', 'yearly'

      // Check if transaction already exists for this payment ID
      let transaction = await PaymentTransaction.findOne({
        razorpayPaymentId: razorpay_payment_id
      });

      if (transaction) {
        console.log('📋 Transaction already exists for payment ID:', razorpay_payment_id);

        // Check if subscription is already activated
        if (transaction.status === 'completed') {
          const existingSubscription = await Subscription.findOne({
            userId,
            status: 'active'
          });

          if (existingSubscription) {
            console.log('✅ Subscription already activated for this payment');
            return res.json({
              success: true,
              message: 'Payment already processed and subscription activated',
              data: {
                subscription: {
                  id: existingSubscription._id,
                  planId: existingSubscription.planId,
                  status: existingSubscription.status,
                  currentPeriodStart: existingSubscription.currentPeriodStart,
                  currentPeriodEnd: existingSubscription.currentPeriodEnd,
                  amount: existingSubscription.amount,
                  currency: existingSubscription.currency
                },
                transaction: {
                  id: transaction._id,
                  amount: transaction.amount,
                  status: transaction.status
                }
              }
            });
          }
        }
      } else {
        // Create new payment transaction record
        transaction = new PaymentTransaction({
          userId,
          planId: paymentOrder.planId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          planType: planType,
          planDuration: planDuration,
          type: existingSubscription ? 'subscription_upgrade' : 'subscription_creation',
          status: 'completed',
          completedAt: new Date(),
          metadata: new Map([
            ['planDetails', JSON.stringify(paymentOrder.planDetails)],
            ['existingSubscriptionId', existingSubscriptionId || ''],
            ['paymentOrderId', paymentOrder._id.toString()],
            ['verificationResult', JSON.stringify(verificationResult.data)]
          ])
        });

        await transaction.save();
        console.log('✅ Payment transaction created:', transaction._id);
      }

      // Use the updated processSubscriptionActivation method that handles existing subscriptions and proration credits
      console.log('🔍 Processing subscription activation with proration credit handling...');
      const activationResult = await this.processSubscriptionActivation(transaction);

      console.log(`✅ Subscription activated for user ${userId}: ${activationResult.subscription.planName}`);

      res.json({
        success: true,
        message: 'Subscription activated successfully',
        data: {
          subscription: {
            id: activationResult.subscription._id,
            planId: activationResult.subscription.planId,
            status: activationResult.subscription.status,
            currentPeriodStart: activationResult.subscription.currentPeriodStart,
            currentPeriodEnd: activationResult.subscription.currentPeriodEnd,
            amount: activationResult.subscription.amount,
            currency: activationResult.subscription.currency
          },
          transaction: {
            id: transaction._id,
            amount: transaction.amount,
            prorationCredit: activationResult.prorationCredit || 0
          }
        }
      });

    } catch (error) {
      console.error('Verify payment error:', error);

      // Try to update payment order status to failed if possible
      if (req.body?.razorpay_order_id) {
        try {
          await PaymentOrder.findOneAndUpdate(
            { razorpayOrderId: req.body.razorpay_order_id },
            { status: 'failed' }
          );
        } catch (updateError) {
          console.error('Failed to update payment order status:', updateError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to verify payment and activate subscription'
      });
    }
  }

  /**
   * Cancel subscription (at end of current period)
   */
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        userId,
        status: 'active'
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No active subscription found'
        });
      }

      // Set to cancel at period end
      subscription.cancelAtPeriodEnd = true;
      subscription.cancelledAt = new Date();
      subscription.cancelReason = 'user_requested';
      await subscription.save();

      res.json({
        success: true,
        message: 'Subscription will be cancelled at the end of current period',
        data: {
          subscription,
          activeUntil: subscription.currentPeriodEnd
        }
      });

    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await Subscription.findOne({
        userId,
        status: 'active',
        cancelAtPeriodEnd: true
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No cancelled subscription found to reactivate'
        });
      }

      // Reactivate subscription
      subscription.cancelAtPeriodEnd = false;
      subscription.cancelledAt = null;
      subscription.cancelReason = null;
      await subscription.save();

      res.json({
        success: true,
        message: 'Subscription reactivated successfully',
        data: { subscription }
      });

    } catch (error) {
      console.error('Reactivate subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reactivate subscription'
      });
    }
  }



  /**
   * Verify payment status manually (for recovery)
   * This endpoint can be called when user returns after network failure
   */
  async verifyPaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      // Find transaction
      const transaction = await PaymentTransaction.findOne({
        gatewayOrderId: orderId,
        userId
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // If already completed, return current status
      if (transaction.status === 'completed') {
        const subscription = await Subscription.findOne({
          userId,
          status: 'active'
        }).sort({ createdAt: -1 });

        return res.json({
          success: true,
          data: {
            status: 'completed',
            subscription,
            message: 'Payment already processed and subscription activated'
          }
        });
      }

      // Check payment status with Razorpay
      try {
        const razorpayOrder = await this.razorpay.getOrder(orderId);

        // If order is paid but our transaction is not updated
        if (razorpayOrder.status === 'paid' && transaction.status === 'pending') {
          // Find the payment details
          const payments = await this.razorpay.getOrderPayments(orderId);
          const successfulPayment = payments.find(p => p.status === 'captured');

          if (successfulPayment) {
            // Process the payment (same as webhook would do)
            transaction.gatewayPaymentId = successfulPayment.id;
            transaction.status = 'completed';
            transaction.completedAt = new Date();
            await transaction.save();

            // Activate subscription
            await this.processSubscriptionActivation(transaction);

            return res.json({
              success: true,
              data: {
                status: 'recovered',
                message: 'Payment found and subscription activated successfully'
              }
            });
          }
        }

        return res.json({
          success: true,
          data: {
            status: razorpayOrder.status,
            message: `Payment status: ${razorpayOrder.status}`
          }
        });

      } catch (razorpayError) {
        console.error('Razorpay API error:', razorpayError);
        return res.status(500).json({
          success: false,
          message: 'Unable to verify payment status with payment gateway'
        });
      }

    } catch (error) {
      console.error('Verify payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment status'
      });
    }
  }

  /**
   * Automatic payment recovery - checks pending transactions
   * This can be run as a background job
   */
  async recoverPendingPayments(req, res) {
    try {
      console.log('🔄 Starting payment recovery process...');

      // Find all pending transactions older than 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const pendingTransactions = await PaymentTransaction.find({
        status: 'pending',
        createdAt: { $lt: fiveMinutesAgo }
      }).limit(50); // Process in batches

      console.log(`📊 Found ${pendingTransactions.length} pending transactions to check`);

      const results = {
        checked: 0,
        recovered: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };

      for (const transaction of pendingTransactions) {
        try {
          results.checked++;
          console.log(`🔍 Checking transaction ${transaction.gatewayOrderId}...`);

          // Skip if no gateway order ID
          if (!transaction.gatewayOrderId) {
            console.log(`⚠️ Skipping transaction without gateway order ID: ${transaction._id}`);
            results.skipped++;
            continue;
          }

          // Check with Razorpay
          let razorpayOrder;
          try {
            razorpayOrder = await this.razorpay.getOrder(transaction.gatewayOrderId);
          } catch (razorpayError) {
            console.error(`❌ Failed to fetch Razorpay order ${transaction.gatewayOrderId}:`, razorpayError.message);
            results.errors.push({
              transactionId: transaction._id,
              orderId: transaction.gatewayOrderId,
              error: razorpayError.message
            });
            continue;
          }

          if (razorpayOrder.status === 'paid') {
            console.log(`✅ Order ${transaction.gatewayOrderId} is paid, checking payments...`);

            const payments = await this.razorpay.getOrderPayments(transaction.gatewayOrderId);
            const successfulPayment = payments.find(p => p.status === 'captured');

            if (successfulPayment) {
              console.log(`💰 Found successful payment ${successfulPayment.id}, activating subscription...`);

              // Update transaction
              transaction.gatewayPaymentId = successfulPayment.id;
              transaction.status = 'completed';
              transaction.completedAt = new Date();
              await transaction.save();

              // Activate subscription
              await this.processSubscriptionActivation(transaction);

              results.recovered++;
              console.log(`✅ Recovered payment: ${transaction.gatewayOrderId}`);
            } else {
              console.log(`⚠️ No captured payment found for order ${transaction.gatewayOrderId}`);
            }
          } else if (razorpayOrder.status === 'failed') {
            console.log(`❌ Order ${transaction.gatewayOrderId} failed, marking transaction as failed`);
            transaction.status = 'failed';
            transaction.failureReason = 'Payment failed (auto-recovery check)';
            await transaction.save();
            results.failed++;
          }

        } catch (error) {
          results.errors.push({
            transactionId: transaction._id,
            error: error.message
          });
          console.error(`Error processing transaction ${transaction.gatewayOrderId}:`, error);
        }
      }

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Recover pending payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to recover pending payments'
      });
    }
  }

  /**
   * Process subscription activation (shared between webhook and manual verification)
   */
  async processSubscriptionActivation(transaction) {
    console.log('🔍 Processing subscription activation for user:', transaction.userId);

    // Check if any active subscription already exists for this user
    const existingActiveSubscription = await Subscription.findOne({
      userId: transaction.userId,
      status: 'active'
    });

    console.log('📋 Existing active subscription found:', !!existingActiveSubscription);

    let prorationCredit = 0;

    // Handle existing active subscription
    if (existingActiveSubscription) {
      console.log('📋 Found existing active subscription:', existingActiveSubscription.planId);

      // Calculate proration credit from existing subscription
      prorationCredit = existingActiveSubscription.calculateProrationCredit();
      console.log('💰 Calculated proration credit:', prorationCredit);

      // If this is the same plan and not an upgrade, just return the existing subscription
      if (existingActiveSubscription.planId === transaction.planId && transaction.type !== 'subscription_upgrade') {
        console.log('✅ Same plan already active, no changes needed');
        return {
          subscription: existingActiveSubscription,
          prorationCredit: prorationCredit
        };
      }
    }

    // Get proration credit from transaction metadata if available (from order creation)
    const transactionProrationCredit = parseFloat(transaction.metadata.get('prorationCredit') || '0');
    if (transactionProrationCredit > 0) {
      prorationCredit = Math.max(prorationCredit, transactionProrationCredit);
      console.log('💰 Using proration credit from transaction:', prorationCredit);
    }

    // Cancel existing active subscription if found
    if (existingActiveSubscription) {
      console.log('📋 Cancelling existing active subscription');
      existingActiveSubscription.status = 'cancelled';
      existingActiveSubscription.cancelledAt = new Date();
      existingActiveSubscription.cancelReason = 'upgraded_or_replaced';
      await existingActiveSubscription.save();
      console.log('✅ Cancelled existing subscription:', existingActiveSubscription._id);
    }

    // Prepare subscription data
    const planDetails = JSON.parse(transaction.metadata.get('planDetails') || '{}');
    const now = new Date();
    const currentPeriodEnd = new Date(now);

    // Extract plan type and duration from planId
    const planParts = transaction.planId.split('_');
    const planType = planParts[0]; // 'basic', 'standard', 'pro'
    const planDuration = planParts[1]; // 'monthly', 'quarterly', 'yearly'

    // Calculate subscription duration based on plan
    if (planDuration === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (planDuration === 'quarterly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    } else if (planDuration === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      // Default to monthly
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Calculate subscription dates
    const endDate = new Date(currentPeriodEnd);
    const nextBillingDate = new Date(currentPeriodEnd);

    // Get plan configuration for features
    const planConfig = Subscription.getPlanConfig(planType);
    console.log('🔍 Creating subscription with data:', {
      planType,
      planDuration,
      planConfig: planConfig ? 'found' : 'not found',
      planDetails: planDetails ? 'found' : 'not found',
      prorationCredit: prorationCredit
    });

    const subscriptionData = {
      userId: transaction.userId,
      planId: transaction.planId,
      planType: planType,
      planName: planDetails.name ? `${planDetails.name} ${planDuration === 'monthly' ? 'Monthly' : planDuration === 'quarterly' ? 'Quarterly' : planDuration === 'yearly' ? 'Yearly' : 'Monthly'}` : (planConfig?.name || 'Basic Plan'),
      planPrice: planConfig?.price || Math.round((planDetails.paymentAmountINR || 149) * 100), // Store in paise
      currency: planDetails.currency || 'INR',
      displayPrice: planDetails.price || (planConfig?.price ? planConfig.price / 100 : 149),
      planDuration: planDetails.duration || planConfig?.duration || 'monthly',
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
      amount: planConfig?.price || Math.round((planDetails.paymentAmountINR || 149) * 100), // Store in paise, consistent with planPrice
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
        ['activatedFromTransaction', transaction._id.toString()],
        ['recoveryActivation', 'true'],
        ['prorationCredit', prorationCredit.toString()],
        ['previousSubscriptionId', existingActiveSubscription?._id?.toString() || 'none']
      ])
    };

    // Use findOneAndUpdate with upsert to avoid duplicate key issues
    console.log('📋 Creating/updating subscription using upsert');
    console.log('📋 Subscription data:', JSON.stringify({
      userId: subscriptionData.userId,
      planId: subscriptionData.planId,
      planType: subscriptionData.planType,
      status: subscriptionData.status
    }, null, 2));

    let subscription;
    try {
      // Use findOneAndUpdate with upsert to either update existing or create new
      subscription = await Subscription.findOneAndUpdate(
        { userId: transaction.userId }, // Find by userId
        subscriptionData, // Update with new data
        {
          upsert: true, // Create if doesn't exist
          new: true, // Return the updated document
          runValidators: true // Run schema validators
        }
      );
      console.log('✅ Subscription created/updated successfully:', subscription._id);
    } catch (subscriptionError) {
      console.error('❌ Error creating/updating subscription:', subscriptionError.message);
      if (subscriptionError.code === 11000) {
        console.error('📋 Duplicate key error details:');
        console.error('  - Key Pattern:', subscriptionError.keyPattern);
        console.error('  - Key Value:', subscriptionError.keyValue);
        console.error('  - Error Message:', subscriptionError.errmsg);
      }
      throw subscriptionError;
    }

    // Set subscription tier for user profile (use enum values only)
    const subscriptionTier = planType; // 'basic', 'standard', 'pro' - these are valid enum values

    // Update user profile with subscription information
    console.log('📋 Updating user profile with subscription data');
    await User.findByIdAndUpdate(transaction.userId, {
      currentSubscriptionId: subscription._id,
      subscriptionStatus: 'active',
      subscriptionTier: subscriptionTier // Use only valid enum values: 'free', 'basic', 'standard', 'pro'
    });

    console.log('✅ Subscription activated for user:', transaction.userId);
    console.log('📋 Subscription details:', {
      id: subscription._id,
      planType: subscription.planType,
      planName: subscription.planName,
      status: subscription.status,
      endDate: subscription.endDate,
      prorationCredit: prorationCredit,
      cancelledPreviousSubscription: !!existingActiveSubscription
    });

    return {
      subscription: subscription,
      prorationCredit: prorationCredit
    };
  }

  /**
   * Create recurring subscription with Razorpay subscriptions
   */
  async createRecurringSubscription(req, res) {
    try {
      if (!config.features.payments || !this.razorpay) {
        return res.status(503).json({
          success: false,
          message: 'Payment system is currently disabled'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { planId, customerInfo, currency: requestCurrency } = req.body;
      const userId = req.user.id;

      console.log('🔄 Creating recurring subscription:', {
        planId,
        userId,
        requestCurrency,
        userAgent: req.headers['user-agent']?.substring(0, 100)
      });

      // Import currency utilities for standardized handling
      const { getPlanPriceWithPaymentAmount, getPaymentAmountINR } = await import('../utils/currencyUtils.js');

      // Validate plan
      const validPlans = ['basic_monthly', 'standard_quarterly', 'pro_yearly'];
      if (!validPlans.includes(planId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      // Get user currency - prioritize request body, then detect from headers
      let userCurrency;
      if (requestCurrency) {
        // Use currency from frontend request
        userCurrency = requestCurrency === 'USD' ?
          { code: 'USD', symbol: '$', name: 'US Dollar' } :
          { code: 'INR', symbol: '₹', name: 'Indian Rupee' };
        console.log('💰 Using frontend-provided currency:', userCurrency);
      } else {
        // Fallback to server-side detection
        userCurrency = getUserCurrency(req);
        console.log('💰 Using server-detected currency:', userCurrency);
      }

      // Get plan details with correct currency
      const planDetails = await this.getPlanDetailsWithCurrency(planId, userCurrency);
      const user = await User.findById(userId);

      console.log('📋 Plan details:', {
        name: planDetails.name,
        price: planDetails.price,
        currency: planDetails.currency,
        interval: planDetails.interval,
        intervalCount: planDetails.intervalCount
      });

      // Check for existing active subscription and handle upgrades
      const existingSubscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trialing'] }
      });

      let prorationCredit = 0;
      let isUpgrade = false;

      if (existingSubscription) {
        console.log('📋 Found existing subscription:', existingSubscription.planId);

        // Check if this is the same plan
        if (existingSubscription.planId === planId) {
          return res.status(409).json({
            success: false,
            message: 'User already has this subscription plan',
            existingSubscription: {
              planId: existingSubscription.planId,
              status: existingSubscription.status,
              currentPeriodEnd: existingSubscription.currentPeriodEnd
            }
          });
        }

        // Calculate if this is an upgrade
        const upgrade = this.calculateUpgrade(existingSubscription, planDetails);

        if (!upgrade.isUpgrade) {
          return res.status(400).json({
            success: false,
            message: 'Downgrades are not supported for recurring subscriptions. Please cancel your current subscription and subscribe to the new plan after it expires.',
            existingSubscription: {
              planId: existingSubscription.planId,
              status: existingSubscription.status,
              currentPeriodEnd: existingSubscription.currentPeriodEnd
            }
          });
        }

        // This is an upgrade - calculate proration
        isUpgrade = true;
        prorationCredit = upgrade.prorationCreditDisplay; // Use display value, not dual-value object
        console.log('💰 Calculated proration credit for upgrade:', {
          dualValue: upgrade.prorationCredit,
          displayValue: upgrade.prorationCreditDisplay,
          selectedForPayment: prorationCredit
        });
      }

      // Step 1: Create or get Razorpay customer
      let razorpayCustomerId = user.razorpayCustomerId;

      if (!razorpayCustomerId) {
        const customerResult = await this.razorpay.createCustomer({
          name: user.name || customerInfo?.name || 'User',
          email: user.email,
          contact: customerInfo?.phone || user.phone || '',
          notes: {
            userId: userId,
            source: 'subscription_signup'
          }
        });

        if (!customerResult.success) {
          return res.status(500).json({
            success: false,
            message: 'Failed to create customer profile'
          });
        }

        razorpayCustomerId = customerResult.data.id;

        // Save customer ID to user
        await User.findByIdAndUpdate(userId, {
          razorpayCustomerId: razorpayCustomerId
        });
      }

      // Step 2: Ensure Razorpay subscription plan exists or create a new one
      let razorpayPlan;
      console.log('📋 Creating Razorpay plan with details:', {
        name: `${planDetails.name} Plan`,
        id: planId,
        price: planDetails.price,
        currency: planDetails.currency,
        interval: planDetails.interval,
        intervalCount: planDetails.intervalCount
      });

      const planResult = await this.razorpay.createPlan({
        name: `${planDetails.name} Plan`,
        price: planDetails.price, // This will be converted to INR in RazorpayGateway if needed
        amount: planDetails.price, // Fallback field
        currency: planDetails.currency, // Original currency (USD/INR)
        interval: planDetails.interval,
        intervalCount: planDetails.intervalCount,
        // Add metadata to track the original plan ID and currency
        id: planId, // This will be stored in notes, not as custom ID
      });

      if (!planResult.success) {
        console.error('❌ Failed to create or fetch Razorpay plan:', planResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create or fetch subscription plan',
          error: planResult.error
        });
      }
      razorpayPlan = planResult.data;
      const razorpayPlanId = razorpayPlan.id;
      console.log('✅ Razorpay plan ready:', razorpayPlanId);

      // Step 3: Create Razorpay subscription
      const subscriptionResult = await this.razorpay.createSubscription(
        razorpayCustomerId,
        razorpayPlanId,
        {
          total_count: 0, // Unlimited renewals
          customer_notify: 1,
          notes: {
            userId: userId,
            planId: planId
          }
        }
      );

      if (!subscriptionResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create subscription'
        });
      }

      const razorpaySubscription = subscriptionResult.data;

      // Step 4: Create local subscription record
      const now = new Date();
      const currentPeriodEnd = new Date(now);
      const nextBillingDate = new Date(now);

      if (planDetails.interval === 'month') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + planDetails.intervalCount);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + planDetails.intervalCount);
      } else if (planDetails.interval === 'year') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + planDetails.intervalCount);
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + planDetails.intervalCount);
      }

      // Derive planType and planDuration from planId
      const [type, duration] = planId.split('_');
      // Get plan configuration for feature defaults
      // Subscription.getPlanConfig may not be defined; fallback to planDetails.features
      let planConfig = { features: {} };
      if (typeof Subscription.getPlanConfig === 'function') {
        planConfig = Subscription.getPlanConfig(type) || { features: {} };
      } else {
        planConfig = { features: planDetails.features || {} };
      }

      const subscription = new Subscription({
        userId: userId,
        planId: planId,
        planType: type,
        planDuration: duration,
        planName: planDetails.name,
        planPrice: Math.round(planDetails.paymentAmountINR * 100), // Store in paise (INR smallest unit)
        currency: planDetails.currency, // Store the display currency (USD/INR)
        displayPrice: planDetails.price, // Store the display price for frontend
        status: 'pending', // Initial state before first payment
        startDate: now,
        endDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), // 1 year from now
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        nextBillingDate: nextBillingDate,
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayPlanId: razorpayPlanId,
        razorpayCustomerId: razorpayCustomerId,
        paymentMethod: 'razorpay',
        amount: planDetails.price,
        currency: planDetails.currency,
        interval: planDetails.interval,
        intervalCount: planDetails.intervalCount,
        autoRenewal: true,
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
          ['createdViaRecurring', 'true'],
          ['subscriptionType', existingSubscription ? 'upgrade' : 'new'],
          ['prorationCredit', prorationCredit.toString()],
          ['previousSubscriptionId', existingSubscription?._id?.toString() || 'none']
        ])
      });

      let savedSubscription;
      try {
        savedSubscription = await subscription.save();
      } catch (saveError) {
        // Handle duplicate userId (unique index) by fetching existing subscription
        if (saveError.code === 11000) {
          console.warn('⚠️ Duplicate subscription for user, fetching existing record');
          savedSubscription = await Subscription.findOne({ userId });
        } else {
          throw saveError;
        }
      }

      // Step 5: Create payment order for the first payment (with proration if upgrade)
      // Use the INR payment amount for Razorpay (what user will actually be charged)
      const paymentAmountINR = planDetails.paymentAmountINR || planDetails.price;

      // Validate proration credit is a number
      const validProrationCredit = (typeof prorationCredit === 'number' && !isNaN(prorationCredit)) ? prorationCredit : 0;
      const finalAmount = Math.max(0, paymentAmountINR - validProrationCredit);

      // Validate final amount is a valid number
      if (isNaN(finalAmount) || typeof finalAmount !== 'number') {
        console.error('❌ Invalid final amount calculation:', {
          paymentAmountINR,
          prorationCredit,
          validProrationCredit,
          finalAmount,
          paymentAmountINRType: typeof paymentAmountINR,
          prorationCreditType: typeof prorationCredit
        });
        throw new Error('Invalid final amount calculation for payment order');
      }

      console.log('💳 Creating payment order for subscription:', {
        displayPrice: planDetails.price,
        displayCurrency: planDetails.currency,
        paymentAmountINR: paymentAmountINR,
        prorationCredit: prorationCredit,
        validProrationCredit: validProrationCredit,
        finalAmount: finalAmount,
        finalAmountType: typeof finalAmount,
        isUpgrade: !!existingSubscription
      });

      const amountInPaise = Math.round(finalAmount * 100);
      const orderId = `sub_${Date.now().toString().slice(-10)}`;

      // Validate amount in paise is valid for Razorpay
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        console.error('❌ Invalid amount for Razorpay order:', {
          finalAmount,
          amountInPaise,
          calculation: `${finalAmount} * 100 = ${amountInPaise}`
        });
        throw new Error('Invalid payment amount for Razorpay order creation');
      }

      console.log('💳 Creating Razorpay order:', {
        amountInPaise,
        amountInRupees: finalAmount,
        orderId
      });

      const razorpayOrder = await this.razorpay.createOrder(
        amountInPaise,
        'INR', // Always INR for Razorpay
        {
          receipt: orderId,
          notes: {
            userId: userId,
            planId: planId,
            subscriptionId: savedSubscription._id.toString(),
            razorpaySubscriptionId: razorpaySubscription.id,
            subscriptionType: existingSubscription ? 'recurring_upgrade' : 'recurring_first_payment',
            prorationCredit: prorationCredit.toString(),
            displayAmount: planDetails.price.toString(),
            displayCurrency: planDetails.currency,
            paymentAmountINR: paymentAmountINR.toString(),
            existingSubscriptionId: existingSubscription?._id?.toString() || ''
          }
        }
      );

      if (!razorpayOrder.success) {
        console.error('❌ Failed to create payment order for subscription:', razorpayOrder);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment order for subscription',
          error: razorpayOrder.error
        });
      }

      // Create payment order record
      const paymentOrder = new PaymentOrder({
        userId,
        planId,
        orderId,
        razorpayOrderId: razorpayOrder.data.id,
        amount: finalAmount, // Use final amount after proration (in INR for Razorpay)
        originalAmount: planDetails.price,
        displayAmount: planDetails.price, // Display amount in user's currency
        displayCurrency: planDetails.currency, // User's selected currency
        paymentAmountINR: finalAmount, // Actual payment amount in INR
        currency: 'INR', // Payment currency (always INR for Razorpay)
        status: 'created',
        planDetails,
        userDetails: {
          name: user.name || user.email,
          email: user.email,
          contact: user.phone || ''
        },
        prorationCredit: prorationCredit,
        metadata: new Map([
          ['subscriptionId', savedSubscription._id.toString()],
          ['razorpaySubscriptionId', razorpaySubscription.id],
          ['subscriptionType', existingSubscription ? 'recurring_upgrade' : 'recurring_first_payment'],
          ['orderCreatedAt', new Date().toISOString()],
          ['userAgent', req.headers['user-agent'] || ''],
          ['existingSubscriptionId', existingSubscription?._id?.toString() || ''],
          ['isUpgrade', existingSubscription ? 'true' : 'false']
        ])
      });

      await paymentOrder.save();

      // Generate payment URL with token
      const token = req.headers.authorization?.replace('Bearer ', '');
      const paymentUrl = `${req.protocol}://${req.get('host')}/api/v1/subscriptions/payment-page/${orderId}?token=${encodeURIComponent(token)}`;

      // Use savedSubscription for response
      res.json({
        success: true,
        message: existingSubscription ? 'Subscription upgrade created successfully' : 'Recurring subscription created successfully',
        data: {
          orderId: orderId, // Use payment order ID, not subscription ID
          subscriptionId: savedSubscription._id,
          razorpaySubscriptionId: razorpaySubscription.id,
          razorpayOrderId: razorpayOrder.data.id,
          planDetails: planDetails,
          paymentUrl: paymentUrl, // Use proper payment page URL
          nextBillingDate: nextBillingDate,
          autoRenewal: true,
          amount: finalAmount, // Show final amount after proration (in INR for Razorpay)
          originalAmount: planDetails.price,
          displayAmount: planDetails.price, // Display amount in user's currency
          displayCurrency: planDetails.currency, // User's selected currency
          paymentAmountINR: finalAmount, // Actual payment amount in INR
          prorationCredit: prorationCredit,
          currency: 'INR', // Payment currency (always INR for Razorpay)
          isUpgrade: !!existingSubscription,
          previousSubscription: existingSubscription ? {
            planId: existingSubscription.planId,
            planName: existingSubscription.planName,
            currentPeriodEnd: existingSubscription.currentPeriodEnd
          } : null
        }
      });

    } catch (error) {
      // Enhanced error logging for recurring subscription failures
      console.error('Error creating recurring subscription:', error.message);
      console.error(error.stack);
      // Return error message to frontend for debugging
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create recurring subscription'
      });
    }
  }

  // Helper methods

  async getPlanDetails(planId, req = null) {
    // Get user's currency if request is available
    const currency = req ? getUserCurrency(req) : { code: 'INR', symbol: '₹' };

    // Helper function to get price for specific plan
    const getPriceForPlan = (specificPlanId) => {
      if (req) {
        try {
          const priceInfo = getPlanPrice(specificPlanId, req);
          return priceInfo ? priceInfo.amount : this.getDefaultPrice(specificPlanId);
        } catch (error) {
          console.warn(`Failed to get price for ${specificPlanId}:`, error.message);
          return this.getDefaultPrice(specificPlanId);
        }
      }
      return this.getDefaultPrice(specificPlanId);
    };

    const plans = {
      basic_monthly: {
        id: 'basic_monthly',
        name: 'Basic',
        price: getPriceForPlan('basic_monthly'),
        currency: currency.code,
        currencySymbol: currency.symbol,
        interval: 'month',
        intervalCount: 1,
        features: {
          lessons: 10,
          community: 'limited',
          support: '48h',
          bonusContent: false,
          certification: false
        }
      },
      standard_quarterly: {
        id: 'standard_quarterly',
        name: 'Standard',
        price: getPriceForPlan('standard_quarterly'),
        currency: currency.code,
        currencySymbol: currency.symbol,
        interval: 'month',
        intervalCount: 3,
        features: {
          lessons: 30,
          community: 'full',
          support: '24h',
          bonusContent: 'deep_dive',
          certification: 'module'
        }
      },
      pro_yearly: {
        id: 'pro_yearly',
        name: 'Pro',
        price: getPriceForPlan('pro_yearly'),
        currency: currency.code,
        currencySymbol: currency.symbol,
        interval: 'month',
        intervalCount: 12,
        features: {
          lessons: 120,
          community: 'premium',
          support: 'live_chat',
          bonusContent: 'premium',
          certification: 'advanced'
        }
      }
    };

    return plans[planId];
  }

  /**
   * Get plan details with specific currency (for recurring subscriptions)
   */
  async getPlanDetailsWithCurrency(planId, currency) {
    console.log('💰 Getting plan details for currency:', { planId, currency });

    // Import currency utilities for standardized handling
    const { getPlanPriceWithPaymentAmount, PLAN_PRICES } = await import('../utils/currencyUtils.js');

    // Helper function to get price for specific plan
    const getPriceForPlan = (specificPlanId) => {
      const prices = PLAN_PRICES[specificPlanId];
      if (!prices) {
        console.warn(`Plan ${specificPlanId} not found in PLAN_PRICES`);
        return 149; // Default fallback
      }
      return prices[currency.code] || prices.INR; // Fallback to INR
    };

    // Helper function to get payment amount in INR
    const getPaymentAmountForPlan = (specificPlanId) => {
      const displayPrice = getPriceForPlan(specificPlanId);
      return currency.code === 'USD' ?
        Math.round((displayPrice * 83.33) * 100) / 100 : // Convert USD to INR for payment
        displayPrice;
    };

    console.log(`💰 Getting prices for currency: ${currency.code} (${currency.symbol})`);

    const plans = {
      basic_monthly: {
        id: 'basic_monthly',
        name: 'Basic',
        price: getPriceForPlan('basic_monthly'),
        currency: currency.code,
        currencySymbol: currency.symbol,
        paymentAmountINR: getPaymentAmountForPlan('basic_monthly'),
        paymentCurrency: 'INR',
        interval: 'month',
        intervalCount: 1,
        features: {
          lessons: 10,
          community: 'limited',
          support: '48h',
          bonusContent: false,
          certification: false
        }
      },
      standard_quarterly: {
        id: 'standard_quarterly',
        name: 'Standard',
        price: getPriceForPlan('standard_quarterly'),
        currency: currency.code,
        currencySymbol: currency.symbol,
        paymentAmountINR: getPaymentAmountForPlan('standard_quarterly'),
        paymentCurrency: 'INR',
        interval: 'month',
        intervalCount: 3,
        features: {
          lessons: 30,
          community: 'full',
          support: '24h',
          bonusContent: 'deep_dive',
          certification: 'module'
        }
      },
      pro_yearly: {
        id: 'pro_yearly',
        name: 'Pro',
        price: getPriceForPlan('pro_yearly'),
        currency: currency.code,
        currencySymbol: currency.symbol,
        paymentAmountINR: getPaymentAmountForPlan('pro_yearly'),
        paymentCurrency: 'INR',
        interval: 'month',
        intervalCount: 12,
        features: {
          lessons: 120,
          community: 'premium',
          support: 'live_chat',
          bonusContent: 'premium',
          certification: 'advanced'
        }
      }
    };

    const planDetails = plans[planId];
    if (!planDetails) {
      throw new Error(`Plan ${planId} not found`);
    }

    console.log('📋 Final plan details:', planDetails);
    return planDetails;
  }

  getDefaultPrice(planId) {
    const defaultPrices = {
      basic_monthly: 149,
      standard_quarterly: 399,
      pro_yearly: 999
    };
    return defaultPrices[planId] || 149;
  }



  /**
   * Get payment details for web payment page
   */
  async getPaymentDetails(req, res) {
    try {
      const { orderId } = req.params;
      const { token } = req.query;

      console.log('🔍 Payment details request:', {
        orderId,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        query: req.query,
        params: req.params
      });

      if (!token) {
        console.log('❌ No token provided');
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      // Verify token and get user ID
      let userId;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        console.log('✅ Token verified, userId:', userId);
      } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Find the payment order
      console.log('🔍 Looking for payment order:', { orderId, userId });
      const paymentOrder = await PaymentOrder.findOne({
        orderId: orderId,
        userId: userId,
        status: { $in: ['created', 'processing'] }
      });

      console.log('📋 Payment order found:', !!paymentOrder);
      if (paymentOrder) {
        console.log('📋 Payment order details:', {
          orderId: paymentOrder.orderId,
          status: paymentOrder.status,
          amount: paymentOrder.amount,
          createdAt: paymentOrder.createdAt
        });
      }

      if (!paymentOrder) {
        console.log('❌ Payment order not found');
        return res.status(404).json({
          success: false,
          message: 'Payment order not found or already processed'
        });
      }

      // Check if order has expired (24 hours from creation)
      const expiryTime = new Date(paymentOrder.createdAt.getTime() + 24 * 60 * 60 * 1000);
      if (expiryTime < new Date()) {
        paymentOrder.status = 'expired';
        await paymentOrder.save();

        return res.status(410).json({
          success: false,
          message: 'Payment order has expired. Please create a new order.'
        });
      }

      // Get Razorpay key ID
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;

      res.json({
        success: true,
        data: {
          orderId: paymentOrder.orderId,
          razorpayOrderId: paymentOrder.razorpayOrderId,
          amount: paymentOrder.amount, // Payment amount in INR (for Razorpay)
          currency: paymentOrder.currency, // Payment currency (INR)
          displayAmount: paymentOrder.displayAmount || paymentOrder.amount, // Display amount in user's currency
          displayCurrency: paymentOrder.displayCurrency || paymentOrder.currency, // Display currency
          paymentAmountINR: paymentOrder.paymentAmountINR || paymentOrder.amount, // Actual payment amount in INR
          planDetails: paymentOrder.planDetails,
          userDetails: paymentOrder.userDetails,
          razorpayKeyId: razorpayKeyId
        }
      });
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }
  }

  /**
   * Serve payment page
   */
  async servePaymentPage(req, res) {
    try {
      const { orderId } = req.params;
      const { token } = req.query;

      console.log(`🔍 Payment page requested for orderId: ${orderId}, token: ${token ? 'present' : 'missing'}`);

      if (!token) {
        console.error('❌ No token provided for payment page');
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Invalid Payment Link</h1>
              <p>This payment link is invalid or has expired. Please try again from the app.</p>
              <script>
                // Send error message to React Native WebView if available
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYMENT_FAILED',
                    data: {
                      error: 'Invalid payment link',
                      code: 'INVALID_TOKEN',
                      details: 'Payment link is missing or has expired'
                    }
                  }));
                }
              </script>
            </body>
          </html>
        `);
      }

      // Validate token (basic check - you might want to add JWT validation here)
      try {
        // Decode token to check if it's valid JWT format (jwt is already imported at top of file)
        jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token validation successful');
      } catch (tokenError) {
        console.error('❌ Invalid token:', tokenError.message);
        return res.status(401).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Expired Payment Link</h1>
              <p>This payment link has expired. Please try again from the app.</p>
              <script>
                // Send error message to React Native WebView if available
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYMENT_FAILED',
                    data: {
                      error: 'Payment link expired',
                      code: 'TOKEN_EXPIRED',
                      details: 'Please return to the app and try again'
                    }
                  }));
                }
              </script>
            </body>
          </html>
        `);
      }

      // Serve the payment page
      const paymentPagePath = path.join(__dirname, '../views/payment.html');
      console.log(`📄 Serving payment page from: ${paymentPagePath}`);
      res.sendFile(paymentPagePath);
    } catch (error) {
      console.error('Error serving payment page:', error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Error</h1>
            <p>Something went wrong. Please try again from the app.</p>
          </body>
        </html>
      `);
    }
  }

  // Helper method to attempt data correction for problematic subscriptions
  attemptDataCorrection(subscription, detectedCurrency, calculatedDisplayPrice) {
    console.log('🔧 Attempting data correction for subscription:', {
      amount: subscription.amount,
      detectedCurrency,
      calculatedDisplayPrice
    });

    // Case 1: INR subscription with suspiciously low price - likely a USD subscription
    if (detectedCurrency === 'INR' && calculatedDisplayPrice < 50) {
      // Check if this looks like a USD amount
      if (subscription.amount >= 1 && subscription.amount <= 20) {
        // Amount like 1.99, 4.99 - likely USD stored as dollars
        return {
          corrected: true,
          currency: 'USD',
          displayPrice: subscription.amount,
          reason: 'Corrected INR subscription with low price to USD (amount stored as dollars)'
        };
      } else if (subscription.amount >= 99 && subscription.amount <= 2000) {
        // Amount like 199, 499 - likely USD stored as cents
        return {
          corrected: true,
          currency: 'USD',
          displayPrice: Math.round((subscription.amount / 100) * 100) / 100,
          reason: 'Corrected INR subscription with low price to USD (amount stored as cents)'
        };
      }
    }

    // Case 2: USD subscription with suspiciously low price
    if (detectedCurrency === 'USD' && calculatedDisplayPrice < 0.99) {
      // Check if this might be stored in a different format
      if (subscription.amount >= 99 && subscription.amount <= 2000) {
        // Might be stored as cents
        return {
          corrected: true,
          currency: 'USD',
          displayPrice: Math.round((subscription.amount / 100) * 100) / 100,
          reason: 'Corrected USD subscription (amount stored as cents)'
        };
      } else if (subscription.amount >= 5000) {
        // Might actually be an INR subscription
        return {
          corrected: true,
          currency: 'INR',
          displayPrice: subscription.amount / 100,
          reason: 'Corrected USD subscription to INR (amount stored as paise)'
        };
      }
    }

    // Case 3: Check if we can infer from plan ID
    if (subscription.planId) {
      const planId = subscription.planId.toLowerCase();

      // If plan ID suggests a typical price range
      if (planId.includes('basic') && subscription.amount >= 10000) {
        // Basic plan with high amount - likely INR stored as paise
        return {
          corrected: true,
          currency: 'INR',
          displayPrice: subscription.amount / 100,
          reason: 'Corrected based on plan ID (basic plan, amount as paise)'
        };
      }
    }

    return {
      corrected: false,
      reason: 'No correction pattern matched'
    };
  }

  // Helper method to calculate upgrade and proration
  calculateUpgrade(existingSubscription, newPlanDetails) {
    try {
      // Convert existing subscription amount from paise to display currency
      // existingSubscription.amount is stored in paise, need to convert to display currency
      let existingDisplayPrice = existingSubscription.displayPrice;
      let existingCurrency = existingSubscription.currency;

      // Detect currency if not set (for older subscriptions)
      if (!existingCurrency) {
        // Improved currency detection logic
        // Check if amount looks like it's stored in dollars vs paise

        if (existingSubscription.amount < 100) {
          // Very small amounts (< 100) are likely stored as dollars (e.g., 1.99, 4.99)
          existingCurrency = 'USD';
          console.log('🔍 Detected USD subscription - amount stored as dollars:', existingSubscription.amount);
        } else if (existingSubscription.amount < 1000) {
          // Small amounts (100-999) could be USD stored as cents (e.g., 199 cents = $1.99)
          existingCurrency = 'USD';
          console.log('🔍 Detected USD subscription - amount stored as cents:', existingSubscription.amount);
        } else if (existingSubscription.amount > 10000) {
          // Large amounts (> 10000) are likely INR stored as paise (e.g., 14900 paise = ₹149)
          existingCurrency = 'INR';
          console.log('🔍 Detected INR subscription - amount stored as paise:', existingSubscription.amount);
        } else {
          // Medium amounts (1000-10000) - need more sophisticated detection
          // Check if displayPrice is available to help determine currency
          if (existingSubscription.displayPrice) {
            if (existingSubscription.displayPrice < 20) {
              existingCurrency = 'USD';
              console.log('🔍 Detected USD subscription based on displayPrice:', existingSubscription.displayPrice);
            } else {
              existingCurrency = 'INR';
              console.log('🔍 Detected INR subscription based on displayPrice:', existingSubscription.displayPrice);
            }
          } else {
            // Default to INR for ambiguous cases
            existingCurrency = 'INR';
            console.log('🔍 Defaulting to INR subscription for ambiguous amount:', existingSubscription.amount);
          }
        }
      }

      // If displayPrice is not available, calculate it from amount
      if (!existingDisplayPrice) {
        if (existingCurrency === 'USD') {
          // For USD subscriptions, determine how the amount is stored
          if (existingSubscription.amount < 100) {
            // Amount stored as dollars (e.g., 1.99)
            existingDisplayPrice = existingSubscription.amount;
            console.log('🔍 USD amount stored as dollars:', existingSubscription.amount);
          } else if (existingSubscription.amount < 1000) {
            // Amount stored as cents (e.g., 199 cents = $1.99)
            existingDisplayPrice = Math.round((existingSubscription.amount / 100) * 100) / 100;
            console.log('🔍 USD amount stored as cents:', existingSubscription.amount, '→ $' + existingDisplayPrice);
          } else {
            // Amount stored as INR paise equivalent, convert back to USD
            // Assuming 1 USD = 83.33 INR, so 1 USD = 8333 paise
            existingDisplayPrice = Math.round((existingSubscription.amount / 8333) * 100) / 100;
            console.log('🔍 USD amount stored as INR paise equivalent:', existingSubscription.amount, '→ $' + existingDisplayPrice);
          }
        } else {
          // For INR subscriptions, convert paise to rupees
          if (existingSubscription.amount < 1000) {
            // Unusual case: amount might be stored as rupees already
            existingDisplayPrice = existingSubscription.amount;
            console.log('🔍 INR amount possibly stored as rupees:', existingSubscription.amount);
          } else {
            // Normal case: amount stored as paise
            existingDisplayPrice = existingSubscription.amount / 100;
            console.log('🔍 INR amount stored as paise:', existingSubscription.amount, '→ ₹' + existingDisplayPrice);
          }
        }
      }

      const newCurrency = newPlanDetails.currency || 'INR';

      // Validate the calculated values
      const validationErrors = [];

      if (existingDisplayPrice < 0.01) {
        validationErrors.push(`Existing display price too small: ${existingDisplayPrice}`);
      }

      if (existingCurrency === 'INR' && existingDisplayPrice < 50) {
        validationErrors.push(`INR subscription display price suspiciously low: ₹${existingDisplayPrice}`);
      }

      if (existingCurrency === 'USD' && existingDisplayPrice < 0.99) {
        validationErrors.push(`USD subscription display price suspiciously low: $${existingDisplayPrice}`);
      }

      if (validationErrors.length > 0) {
        console.error('❌ Subscription data validation errors:', validationErrors);
        console.error('❌ Raw subscription data:', {
          amount: existingSubscription.amount,
          displayPrice: existingSubscription.displayPrice,
          currency: existingSubscription.currency,
          planId: existingSubscription.planId
        });

        // Instead of throwing errors, attempt to correct the data
        const correctedData = this.attemptDataCorrection(existingSubscription, existingCurrency, existingDisplayPrice);
        if (correctedData.corrected) {
          console.log('🔧 Applied data correction:', correctedData);
          existingCurrency = correctedData.currency;
          existingDisplayPrice = correctedData.displayPrice;

          // Re-validate after correction
          const stillInvalid = (existingCurrency === 'INR' && existingDisplayPrice < 50) ||
            (existingCurrency === 'USD' && existingDisplayPrice < 0.99);

          if (stillInvalid) {
            console.error('💥 Data correction failed, cannot proceed with upgrade calculation');
            throw new Error(`Cannot calculate upgrade: subscription data correction failed`);
          }
        } else {
          console.error('💥 Cannot correct subscription data, throwing error');
          throw new Error(`Cannot calculate upgrade with invalid subscription data: ${validationErrors.join(', ')}`);
        }
      }

      console.log('🔍 Currency detection and conversion setup:', {
        existingSubscriptionAmount: existingSubscription.amount,
        existingSubscriptionDisplayPrice: existingSubscription.displayPrice,
        calculatedExistingDisplayPrice: existingDisplayPrice,
        existingCurrency,
        newCurrency,
        conversionNeeded: existingCurrency !== newCurrency,
        validationErrors: validationErrors.length > 0 ? validationErrors : 'None'
      });

      console.log('🔍 Calculating upgrade from existing subscription:', {
        currentPlan: existingSubscription.planId,
        currentPriceInPaise: existingSubscription.amount,
        currentDisplayPrice: existingDisplayPrice,
        currentCurrency: existingCurrency,
        newPlan: newPlanDetails.id,
        newPrice: newPlanDetails.price,
        newCurrency: newCurrency
      });

      // Define plan hierarchy (higher number = higher tier)
      const planHierarchy = {
        'basic_monthly': 1,
        'basic_quarterly': 1,
        'basic_yearly': 1,
        'standard_monthly': 2,
        'standard_quarterly': 2,
        'standard_yearly': 2,
        'pro_monthly': 3,
        'pro_quarterly': 3,
        'pro_yearly': 3
      };

      const currentPlanLevel = planHierarchy[existingSubscription.planId] || 0;
      const newPlanLevel = planHierarchy[newPlanDetails.id] || 0;

      // Check if this is an upgrade (higher tier or same tier with higher price)
      // Compare using display prices in the same currency
      const isUpgrade = newPlanLevel > currentPlanLevel ||
        (newPlanLevel === currentPlanLevel && newPlanDetails.price > existingDisplayPrice);

      if (!isUpgrade) {
        return {
          isUpgrade: false,
          prorationCredit: 0,
          reason: 'Not an upgrade - same or lower tier'
        };
      }

      // Calculate proration credit based on remaining time
      const now = new Date();
      const currentPeriodEnd = new Date(existingSubscription.currentPeriodEnd);
      const remainingDays = Math.max(0, Math.ceil((currentPeriodEnd - now) / (1000 * 60 * 60 * 24)));

      // Calculate daily rate of current subscription using display price
      const currentPeriodStart = new Date(existingSubscription.currentPeriodStart || existingSubscription.createdAt);
      const totalDays = Math.ceil((currentPeriodEnd - currentPeriodStart) / (1000 * 60 * 60 * 24));
      const dailyRateInDisplayCurrency = existingDisplayPrice / totalDays;

      // Calculate proration credit in the existing subscription's display currency
      let prorationCreditInExistingCurrency = Math.round(dailyRateInDisplayCurrency * remainingDays * 100) / 100;

      // Convert proration credit to the new plan's currency if different
      let prorationCredit = prorationCreditInExistingCurrency;
      let conversionRate = 1;
      let conversionApplied = false;

      if (existingCurrency !== newCurrency) {
        conversionApplied = true;

        if (existingCurrency === 'INR' && newCurrency === 'USD') {
          // Convert INR to USD (1 USD = 83.33 INR)
          conversionRate = 1 / 83.33;
          prorationCredit = Math.round((prorationCreditInExistingCurrency * conversionRate) * 100) / 100;
          console.log(`💱 Converting INR to USD: ₹${prorationCreditInExistingCurrency} → $${prorationCredit} (rate: ${conversionRate})`);

        } else if (existingCurrency === 'USD' && newCurrency === 'INR') {
          // Convert USD to INR (1 USD = 83.33 INR)
          conversionRate = 83.33;
          prorationCredit = Math.round((prorationCreditInExistingCurrency * conversionRate) * 100) / 100;
          console.log(`💱 Converting USD to INR: $${prorationCreditInExistingCurrency} → ₹${prorationCredit} (rate: ${conversionRate})`);

        } else {
          console.warn(`⚠️ Unsupported currency conversion: ${existingCurrency} → ${newCurrency}`);
        }
      } else {
        console.log(`💰 No currency conversion needed: ${existingCurrency} → ${newCurrency}`);
      }

      console.log('💰 Proration calculation summary:', {
        remainingDays,
        totalDays,
        existingDisplayPrice,
        existingCurrency,
        newCurrency,
        dailyRateInDisplayCurrency,
        prorationCreditInExistingCurrency,
        conversionRate,
        prorationCreditFinal: prorationCredit,
        currencyConversionApplied: existingCurrency !== newCurrency,
        currentAmountInPaise: existingSubscription.amount,
        newAmount: newPlanDetails.price
      });

      // Calculate proration credit in both currencies for dual-value approach
      const prorationCreditINR = existingCurrency === 'INR' ?
        prorationCreditInExistingCurrency :
        Math.round((prorationCreditInExistingCurrency * 83.33) * 100) / 100;

      const prorationCreditUSD = existingCurrency === 'USD' ?
        prorationCreditInExistingCurrency :
        Math.round((prorationCreditInExistingCurrency / 83.33) * 100) / 100;

      console.log('💰 Dual-value proration credits calculated:', {
        existingCurrency,
        prorationCreditInExistingCurrency,
        prorationCreditINR,
        prorationCreditUSD,
        selectedCurrency: newCurrency,
        selectedValue: newCurrency === 'USD' ? prorationCreditUSD : prorationCreditINR
      });

      return {
        isUpgrade: true,
        prorationCredit: {
          INR: prorationCreditINR,
          USD: prorationCreditUSD
        },
        prorationCreditDisplay: newCurrency === 'USD' ? prorationCreditUSD : prorationCreditINR,
        remainingDays: remainingDays,
        dailyRate: dailyRateInDisplayCurrency,
        existingCurrency: existingCurrency,
        newCurrency: newCurrency,
        currencyConverted: existingCurrency !== newCurrency,
        reason: `Upgrade from ${existingSubscription.planId} to ${newPlanDetails.id}`
      };

    } catch (error) {
      console.error('Error calculating upgrade:', error);
      return {
        isUpgrade: false,
        prorationCredit: 0,
        reason: 'Error calculating upgrade'
      };
    }
  }

  /**
   * Get upgrade preview with proration calculation
   */
  async getUpgradePreview(req, res) {
    try {
      const { planId } = req.params;
      const { currency = 'INR' } = req.body;
      const userId = req.user.id;

      console.log('🔍 Getting upgrade preview for:', { userId, planId, currency });

      // Get current active subscription
      const existingSubscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trialing'] }
      });

      if (!existingSubscription) {
        return res.status(400).json({
          success: false,
          message: 'No active subscription found. This is a new subscription, not an upgrade.'
        });
      }

      // Get plan details with the specific currency from request body
      // Create a currency object from the request body parameter
      const requestedCurrency = {
        code: currency,
        symbol: currency === 'USD' ? '$' : '₹'
      };

      console.log('🔍 Using requested currency for plan details:', requestedCurrency);

      // Use getPlanDetailsWithCurrency to get correct pricing for the requested currency
      const planDetails = await this.getPlanDetailsWithCurrency(planId, requestedCurrency);
      console.log('🔍 Plan details retrieved with requested currency:', {
        planId,
        requestedCurrency: currency,
        planDetails: planDetails ? {
          id: planDetails.id,
          name: planDetails.name,
          price: planDetails.price,
          currency: planDetails.currency
        } : null
      });

      if (!planDetails) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan selected'
        });
      }

      // Check if this is the same plan
      if (existingSubscription.planId === planId) {
        return res.status(400).json({
          success: false,
          message: 'You already have this subscription plan'
        });
      }

      // Calculate upgrade details
      const upgrade = this.calculateUpgrade(existingSubscription, planDetails);

      if (!upgrade.isUpgrade) {
        return res.status(400).json({
          success: false,
          message: 'This is not an upgrade. Downgrades are not supported for recurring subscriptions.',
          reason: upgrade.reason
        });
      }

      // Prepare response data with dual-value proration credit
      const previewData = {
        currentPlan: {
          id: existingSubscription.planId,
          name: existingSubscription.planName,
          amount: existingSubscription.amount,
          currentPeriodEnd: existingSubscription.currentPeriodEnd
        },
        targetPlan: {
          id: planDetails.id,
          name: planDetails.name,
          amount: planDetails.price
        },
        originalPrice: planDetails.price,
        prorationCredit: upgrade.prorationCredit, // Dual-value object: {INR: 166, USD: 1.99}
        prorationCreditDisplay: upgrade.prorationCreditDisplay, // Current selected currency value
        finalPrice: Math.max(0, planDetails.price - upgrade.prorationCreditDisplay),
        remainingDays: upgrade.remainingDays,
        dailyRate: upgrade.dailyRate,
        currency: currency,
        savings: upgrade.prorationCreditDisplay,
        upgradeReason: upgrade.reason
      };

      console.log('🔍 Upgrade preview response data (dual-value):', {
        requestedCurrency: currency,
        planId,
        originalPrice: previewData.originalPrice,
        prorationCreditDualValue: previewData.prorationCredit,
        prorationCreditDisplay: previewData.prorationCreditDisplay,
        finalPrice: previewData.finalPrice,
        planDetailsPrice: planDetails.price,
        planDetailsCurrency: planDetails.currency
      });

      console.log('💰 Upgrade preview calculated:', previewData);

      res.json({
        success: true,
        message: 'Upgrade preview calculated successfully',
        data: previewData
      });

    } catch (error) {
      console.error('Error getting upgrade preview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate upgrade preview'
      });
    }
  }
}

export default new SubscriptionController();

/**
 * Get user's transaction history
 */
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    console.log('🔍 Fetching transaction history for user:', userId);

    const offset = (page - 1) * limit;

    // First, let's check all transactions for this user to debug
    const allTransactions = await PaymentTransaction.find({ userId }).lean();
    console.log('🔍 All transactions for user:', allTransactions.length);
    console.log('🔍 Transaction statuses:', allTransactions.map(t => ({ id: t._id, status: t.status, type: t.type })));

    // Get all transactions for this user (don't filter by status initially)
    const transactions = await PaymentTransaction.find({
      userId
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(offset)
      .lean();

    const total = await PaymentTransaction.countDocuments({
      userId
    });

    console.log('✅ Filtered transactions found:', transactions.length);

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
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
};

/**
 * Get billing details for user
 */
export const getBillingDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find active subscription only, same logic as getCurrentSubscription
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing'] }
    }).sort({ createdAt: -1 }).lean();

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          autoRenewal: true,
          subscription: null
        }
      });
    }

    // Check if subscription is expired
    const now = new Date();
    const isExpired = now > subscription.currentPeriodEnd;

    if (isExpired) {
      // If expired, return no subscription
      return res.json({
        success: true,
        data: {
          autoRenewal: true,
          subscription: null
        }
      });
    }

    // Get latest transaction for this subscription
    const latestTransaction = await PaymentTransaction.findOne({
      userId,
      subscriptionId: subscription._id
    }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: {
        autoRenewal: subscription.autoRenewal !== false,
        subscription,
        latestTransaction
      }
    });
  } catch (error) {
    console.error('Error fetching billing details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing details'
    });
  }
};

/**
 * Update auto-renewal setting
 */
export const updateAutoRenewal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { autoRenewal } = req.body;

    if (typeof autoRenewal !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoRenewal must be a boolean value'
      });
    }

    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    subscription.autoRenewal = autoRenewal;
    await subscription.save();

    res.json({
      success: true,
      message: `Auto-renewal ${autoRenewal ? 'enabled' : 'disabled'} successfully`,
      data: { autoRenewal }
    });
  } catch (error) {
    console.error('Error updating auto-renewal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update auto-renewal setting'
    });
  }
};

/**
 * Schedule a downgrade to a lower plan
 * The downgrade will take effect at the end of the current billing cycle
 */
export const scheduleDowngrade = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get current subscription
    const currentSubscription = await Subscription.findOne({
      userId,
      status: 'active'
    });

    if (!currentSubscription) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Get plan details using the controller's method
    const controller = new SubscriptionController();
    const planDetails = await controller.getPlanDetails(planId, req);
    if (!planDetails) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    // Verify this is actually a downgrade
    const planHierarchy = {
      basic_monthly: 1,
      standard_quarterly: 2,
      pro_yearly: 3
    };

    const currentPlanLevel = planHierarchy[currentSubscription.planId] || 0;
    const newPlanLevel = planHierarchy[planId] || 0;

    if (newPlanLevel >= currentPlanLevel) {
      return res.status(400).json({
        success: false,
        message: 'This is not a downgrade. Use the upgrade flow instead.'
      });
    }

    // Schedule the downgrade by updating the subscription
    currentSubscription.scheduledDowngrade = {
      planId: planId,
      planName: planDetails.name,
      scheduledDate: currentSubscription.endDate,
      createdAt: new Date()
    };

    await currentSubscription.save();

    res.json({
      success: true,
      message: 'Downgrade scheduled successfully',
      data: {
        currentPlan: {
          id: currentSubscription.planId,
          name: currentSubscription.planName
        },
        scheduledPlan: {
          id: planId,
          name: planDetails.name
        },
        effectiveDate: currentSubscription.endDate
      }
    });

  } catch (error) {
    console.error('Error scheduling downgrade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule downgrade'
    });
  }
};




