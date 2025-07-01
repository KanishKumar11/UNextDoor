import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import PaymentOrder from '../models/PaymentOrder.js';
import RazorpayGateway from '../services/payment/gateways/RazorpayGateway.js';
import { validationResult } from 'express-validator';
import config from '../config/index.js';
import mongoose from 'mongoose';
import { getUserCurrency, getPlanPrice } from '../utils/currencyUtils.js';
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
      // Get user's currency
      const currency = getUserCurrency(req);
      
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
          price: getPlanPrice('basic_monthly', req),
          currency: currency.code,
          currencySymbol: currency.symbol,
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
          price: getPlanPrice('standard_quarterly', req),
          currency: currency.code,
          currencySymbol: currency.symbol,
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
          price: getPlanPrice('pro_yearly', req),
          currency: currency.code,
          currencySymbol: currency.symbol,
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
        amount: orderAmount,
        originalAmount: planDetails.price,
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

      // Generate payment URL with token
      const token = req.headers.authorization?.replace('Bearer ', '');
      const paymentUrl = `${req.protocol}://${req.get('host')}/api/v1/subscriptions/payment-page/${orderId}?token=${encodeURIComponent(token)}`;

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

      // Verify payment signature using Razorpay SDK
      const verificationResult = await this.razorpay.verifyPayment(
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      );

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature',
          error: verificationResult.error
        });
      }

      // Find payment order
      const paymentOrder = await PaymentOrder.findOne({
        razorpayOrderId: razorpay_order_id,
        userId,
        status: { $in: ['created', 'processing'] }
      });

      if (!paymentOrder) {
        return res.status(404).json({
          success: false,
          message: 'Payment order not found or already processed'
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
   * Get upgrade preview (calculates proration)
   * Handles both active subscriptions (upgrades) and free users (new purchases)
   */
  async getUpgradePreview(req, res) {
    try {
      const { planId } = req.params;
      const userId = req.user.id;

      const currentSubscription = await Subscription.findOne({
        userId,
        status: 'active'
      });

      const newPlanDetails = await this.getPlanDetails(planId);

      // If no active subscription, treat as new purchase (free user upgrading)
      if (!currentSubscription) {
        return res.json({
          success: true,
          data: {
            currentPlan: {
              planId: 'free',
              name: 'Free Plan',
              amount: 0,
              currentPeriodEnd: null
            },
            newPlan: newPlanDetails,
            purchase: {
              amountToPay: newPlanDetails.price,
              savings: 0,
              immediateAccess: true,
              isNewPurchase: true
            }
          }
        });
      }

      // Handle actual upgrade from existing paid subscription
      const upgrade = this.calculateUpgrade(currentSubscription, newPlanDetails);

      if (!upgrade.isUpgrade) {
        return res.status(400).json({
          success: false,
          message: 'Downgrades are not allowed mid-cycle'
        });
      }

      res.json({
        success: true,
        data: {
          currentPlan: {
            planId: currentSubscription.planId,
            amount: currentSubscription.amount,
            currentPeriodEnd: currentSubscription.currentPeriodEnd
          },
          newPlan: newPlanDetails,
          upgrade: {
            prorationCredit: upgrade.prorationCredit,
            amountToPay: Math.max(0, newPlanDetails.price - upgrade.prorationCredit),
            savings: upgrade.prorationCredit,
            immediateAccess: true,
            isNewPurchase: false
          }
        }
      });

    } catch (error) {
      console.error('Get upgrade preview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate upgrade preview'
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
      // Find all pending transactions older than 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const pendingTransactions = await PaymentTransaction.find({
        status: 'pending',
        createdAt: { $lt: fiveMinutesAgo }
      }).limit(50); // Process in batches

      const results = {
        checked: 0,
        recovered: 0,
        failed: 0,
        errors: []
      };

      for (const transaction of pendingTransactions) {
        try {
          results.checked++;

          // Check with Razorpay
          const razorpayOrder = await this.razorpay.getOrder(transaction.gatewayOrderId);
          
          if (razorpayOrder.status === 'paid') {
            const payments = await this.razorpay.getOrderPayments(transaction.gatewayOrderId);
            const successfulPayment = payments.find(p => p.status === 'captured');

            if (successfulPayment) {
              // Update transaction
              transaction.gatewayPaymentId = successfulPayment.id;
              transaction.status = 'completed';
              transaction.completedAt = new Date();
              await transaction.save();

              // Activate subscription
              await this.processSubscriptionActivation(transaction);
              
              results.recovered++;
              console.log(`Recovered payment: ${transaction.gatewayOrderId}`);
            }
          } else if (razorpayOrder.status === 'failed') {
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

    // Determine subscription tier for user profile
    let subscriptionTier = planType; // 'basic', 'standard', 'pro'
    if (planDetails.name) {
      // Create proper display name: "Standard Monthly", "Basic Monthly", etc.
      const tierName = planDetails.name; // "Standard", "Basic", "Pro"
      const intervalName = planDuration === 'monthly' ? 'Monthly' :
                          planDuration === 'quarterly' ? 'Quarterly' :
                          planDuration === 'yearly' ? 'Yearly' : 'Monthly';
      subscriptionTier = `${tierName} ${intervalName}`;
    }

    // Update user profile with subscription information
    console.log('📋 Updating user profile with subscription data');
    await User.findByIdAndUpdate(transaction.userId, {
      currentSubscriptionId: subscription._id,
      subscriptionStatus: 'active',
      subscriptionTier: subscriptionTier
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

  // Helper methods

  async getPlanDetails(planId, req = null) {
    // Get user's currency if request is available
    const currency = req ? getUserCurrency(req) : { code: 'INR', symbol: '₹' };
    const price = req ? getPlanPrice(planId, req) : this.getDefaultPrice(planId);

    const plans = {
      basic_monthly: {
        id: 'basic_monthly',
        name: 'Basic',
        price: price,
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
        price: price,
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
        price: price,
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

  getDefaultPrice(planId) {
    const defaultPrices = {
      basic_monthly: 149,
      standard_quarterly: 399,
      pro_yearly: 999
    };
    return defaultPrices[planId] || 149;
  }

  calculateUpgrade(currentSubscription, newPlan) {
    const planHierarchy = {
      basic_monthly: 1,
      standard_quarterly: 2,
      pro_yearly: 3
    };

    const currentPlanLevel = planHierarchy[currentSubscription.planId];
    const newPlanLevel = planHierarchy[newPlan.id];

    const isUpgrade = newPlanLevel > currentPlanLevel;

    if (!isUpgrade) {
      return { isUpgrade: false, prorationCredit: 0 };
    }

    // Calculate remaining days and daily rate
    const now = new Date();
    const remainingMs = currentSubscription.currentPeriodEnd.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    
    // Calculate daily rate based on subscription period
    const totalDaysInPeriod = currentSubscription.intervalCount * 30; // Approximate
    const dailyRate = currentSubscription.amount / totalDaysInPeriod;
    
    const prorationCredit = Math.round(remainingDays * dailyRate * 100) / 100;

    return {
      isUpgrade: true,
      prorationCredit,
      remainingDays
    };
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
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
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


