import Razorpay from "razorpay";
import crypto from "crypto";
import { PLAN_PRICES } from "../../../utils/currencyUtils.js";
import { 
  IPaymentGateway, 
  PaymentResult, 
  SubscriptionPlan, 
  Customer 
} from "../interfaces/IPaymentGateway.js";

/**
 * Razorpay Payment Gateway Implementation
 * Implements the IPaymentGateway interface for Razorpay
 * Follows Single Responsibility Principle
 */
export class RazorpayGateway extends IPaymentGateway {
  constructor(keyId = null, keySecret = null) {
    super();
    
    // Use provided keys or fallback to environment variables
    const razorpayKeyId = keyId || process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = keySecret || process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials are required. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    
    this.razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
    this.keySecret = razorpayKeySecret;
  }

  /**
   * Create a customer in Razorpay
   * @param {Customer} customerDetails - Customer information
   * @returns {Promise<PaymentResult>}
   */
  async createCustomer(customerDetails) {
    try {
      console.log("🏗️ Creating Razorpay customer:", customerDetails.email);
      
      const customer = await this.razorpay.customers.create({
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.contact,
        notes: customerDetails.notes,
      });

      console.log("✅ Razorpay customer created:", customer.id);
      return PaymentResult.success(customer);
    } catch (error) {
      console.error("❌ Error creating Razorpay customer:", error);
      // Handle customer already exists error gracefully
      if (error.error?.code === "BAD_REQUEST_ERROR" &&
          error.error?.description?.includes("already exists")) {
        console.log("ℹ️ Customer already exists, fetching existing customer");
        try {
          const result = await this.razorpay.customers.all({ email: customerDetails.email, count: 1 });
          const existing = result.items?.[0];
          if (existing) {
            console.log("✅ Fetched existing Razorpay customer:", existing.id);
            return PaymentResult.success(existing);
          }
          return PaymentResult.failure("Customer exists but not found", error.error?.code);
        } catch (fetchError) {
          console.error("❌ Error fetching existing Razorpay customer:", fetchError);
          return PaymentResult.failure(fetchError.message, fetchError.error?.code);
        }
      }
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Create a subscription plan in Razorpay
   * @param {SubscriptionPlan} planDetails - Plan information
   * @returns {Promise<PaymentResult>}
   */
  async createPlan(planDetails) {
    try {
      console.log("📋 Creating Razorpay plan:", planDetails.name);
      console.log("💰 Plan details:", {
        currency: planDetails.currency,
        price: planDetails.price,
        id: planDetails.id
      });

      // Build plan payload, mapping intervals to Razorpay period values
      const notes = { created_by: "UNextDoor_System" };
      // Determine correct period: Razorpay expects 'monthly' or 'yearly'
      let period = planDetails.interval;
      if (planDetails.interval === 'month') period = 'monthly';
      else if (planDetails.interval === 'year') period = 'yearly';
      // Include plan_type only if planDetails.id is provided
      if (planDetails.id) {
        notes.plan_type = planDetails.id.split("_")[1] || planDetails.id;
        notes.original_currency = planDetails.currency || 'INR';
        notes.original_price = planDetails.price || planDetails.amount;
      }

      // IMPORTANT: Razorpay plans must always be in INR for Indian Razorpay accounts
      // For USD users, we'll create INR plans but handle currency conversion in orders
      let amountInRupees = typeof planDetails.price === 'number' ? planDetails.price : planDetails.amount;
      let planCurrency = 'INR';

      if (planDetails.currency && planDetails.currency !== 'INR') {
        console.log("🔄 Converting USD plan to INR for Razorpay compatibility");
        // Always use configured INR price for plan creation
        const priceConfig = PLAN_PRICES[planDetails.id];
        if (priceConfig && typeof priceConfig.INR === 'number') {
          amountInRupees = priceConfig.INR;
          console.log(`💱 Using INR price: ₹${amountInRupees} for plan ${planDetails.id}`);
        } else {
          // Fallback conversion if no configured price (should not happen)
          amountInRupees = Math.round(planDetails.price * 83); // Approximate USD to INR
          console.warn(`⚠️ Using fallback conversion: $${planDetails.price} → ₹${amountInRupees}`);
        }
      }

      const amountInSubunits = Math.round(amountInRupees * 100);
      console.log(`💰 Final plan amount: ₹${amountInRupees} (${amountInSubunits} paise)`);

      const payload = {
        item: {
          name: planDetails.name,
          amount: amountInSubunits,
          currency: planCurrency, // Always INR for Razorpay plans
        },
        period: period,
        interval: planDetails.intervalCount,
        notes: notes
      };

      // Note: Razorpay doesn't allow custom IDs for plans, so we'll create without ID
      // and track the mapping in our database using the notes field
      console.log(`📋 Creating plan without custom ID (Razorpay limitation)`);

      const plan = await this.razorpay.plans.create(payload);

      console.log("✅ Razorpay plan created:", plan.id);
      return PaymentResult.success(plan);
    } catch (error) {
      console.error("❌ Error creating Razorpay plan:", error);

      // Since we can't use custom IDs, we'll create a new plan each time
      // This is acceptable for Razorpay as plans are lightweight and can be created on-demand
      console.log("ℹ️ Plan creation failed, this is expected behavior for Razorpay");
      console.log("📋 Error details:", error.error?.description || error.message);

      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Create a subscription
   * @param {string} customerId - Razorpay customer ID
   * @param {string} planId - Razorpay plan ID
   * @param {Object} options - Additional options
   * @returns {Promise<PaymentResult>}
   */
  async createSubscription(customerId, planId, options = {}) {
    try {
      console.log("🔄 Creating Razorpay subscription:", { customerId, planId });
      
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        quantity: options.quantity || 1,
        total_count: options.totalCount || 12, // Default to 12 billing cycles
        start_at: options.startAt,
        addons: options.addons || [],
        notes: options.notes || {},
        notify_info: {
          notify_phone: options.notifyPhone,
          notify_email: options.notifyEmail,
        },
      });

      console.log("✅ Razorpay subscription created:", subscription.id);
      return PaymentResult.success(subscription);
    } catch (error) {
      console.error("❌ Error creating Razorpay subscription:", error);
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Create an order for one-time payments or subscription setup
   * @param {number} amount - Amount in smallest currency unit
   * @param {string} currency - Currency code
   * @param {Object} options - Additional options
   * @returns {Promise<PaymentResult>}
   */
  async createOrder(amount, currency = "INR", options = {}) {
    try {
      
      // Validate that amount is a number
      if (typeof amount !== 'number') {
        console.error("❌ Amount must be a number, received:", typeof amount, amount);
        throw new Error(`Amount must be a number, received ${typeof amount}`);
      }
      
      const orderData = {
        amount: amount,
        currency: currency,
        receipt: options.receipt || `order_${Date.now()}`,
        notes: options.notes || {},
        partial_payment: options.partialPayment || false,
      };
      
      
      const order = await this.razorpay.orders.create(orderData);

      console.log("✅ Razorpay order created:", order.id);
      return PaymentResult.success(order);
    } catch (error) {
      console.error("❌ Error creating Razorpay order:", error);
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Verify payment signature
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} orderId - Razorpay order ID
   * @param {string} signature - Payment signature
   * @returns {Promise<PaymentResult>}
   */
  async verifyPayment(paymentId, orderId, signature) {
    try {
      console.log("🔐 Verifying Razorpay payment signature");
      console.log("📋 Input parameters:");
      console.log("  - Payment ID:", paymentId);
      console.log("  - Order ID:", orderId);
      console.log("  - Received Signature:", signature);

      const body = orderId + "|" + paymentId;
      console.log("📋 Body for signature:", body);

      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(body.toString())
        .digest("hex");

      console.log("📋 Expected Signature:", expectedSignature);
      console.log("📋 Signatures match:", expectedSignature === signature);

      const isAuthentic = expectedSignature === signature;

      if (isAuthentic) {
        console.log("✅ Payment signature verified successfully");

        // Try to fetch payment details for additional verification
        // This may fail for test payments or invalid payment IDs
        let payment = null;
        try {
          payment = await this.razorpay.payments.fetch(paymentId);
          console.log("✅ Payment details fetched successfully");
        } catch (fetchError) {
          console.log("⚠️ Could not fetch payment details (may be test payment):", fetchError.message);
          // For signature verification, we don't need the payment details
          // The signature verification is sufficient for security
        }

        return PaymentResult.success({
          verified: true,
          payment: payment,
          signature_match: true,
        });
      } else {
        console.log("❌ Payment signature verification failed");
        return PaymentResult.failure("Invalid payment signature", "SIGNATURE_VERIFICATION_FAILED");
      }
    } catch (error) {
      console.error("❌ Error verifying payment:", error);
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Cancel a subscription
   * @param {string} subscriptionId - Razorpay subscription ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<PaymentResult>}
   */
  async cancelSubscription(subscriptionId, reason = "customer_request") {
    try {
      console.log("🚫 Cancelling Razorpay subscription:", subscriptionId);
      
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, {
        cancel_at_cycle_end: false, // Cancel immediately
      });

      console.log("✅ Razorpay subscription cancelled:", subscription.id);
      return PaymentResult.success(subscription);
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Create a refund
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Refund amount (optional, full refund if not specified)
   * @param {string} reason - Refund reason
   * @returns {Promise<PaymentResult>}
   */
  async createRefund(paymentId, amount = null, reason = "requested_by_customer") {
    try {
      console.log("💰 Creating Razorpay refund:", { paymentId, amount });
      
      const refundData = {
        notes: {
          reason: reason,
          refund_date: new Date().toISOString(),
        },
      };
      
      if (amount) {
        refundData.amount = amount;
      }
      
      const refund = await this.razorpay.payments.refund(paymentId, refundData);

      console.log("✅ Razorpay refund created:", refund.id);
      return PaymentResult.success(refund);
    } catch (error) {
      console.error("❌ Error creating refund:", error);
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Get payment details
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<PaymentResult>}
   */
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return PaymentResult.success(payment);
    } catch (error) {
      console.error("❌ Error fetching payment details:", error);
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Get subscription details
   * @param {string} subscriptionId - Razorpay subscription ID
   * @returns {Promise<PaymentResult>}
   */
  async getSubscriptionDetails(subscriptionId) {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
      return PaymentResult.success(subscription);
    } catch (error) {
      console.error("❌ Error fetching subscription details:", error);
      return PaymentResult.failure(error.message, error.error?.code);
    }
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Webhook payload
   * @param {string} signature - Webhook signature
   * @param {string} secret - Webhook secret
   * @returns {Promise<PaymentResult>}
   */
  async webhookSignatureVerification(payload, signature, secret) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      const isAuthentic = expectedSignature === signature;
      
      return PaymentResult.success({ verified: isAuthentic });
    } catch (error) {
      console.error("❌ Error verifying webhook signature:", error);
      return PaymentResult.failure(error.message, "WEBHOOK_VERIFICATION_FAILED");
    }
  }

  /**
   * Initialize default plans for UNextDoor
   * @returns {Promise<PaymentResult>}
   */
  async initializeDefaultPlans() {
    try {
      console.log("🚀 Initializing UNextDoor default plans...");
      
      const plans = [
        new SubscriptionPlan(
          "udn_basic_monthly",
          "UNextDoor Basic Plan",
          14900, // ₹149 in paise
          "INR",
          "month",
          1
        ),
        new SubscriptionPlan(
          "udn_standard_quarterly",
          "UNextDoor Standard Plan",
          39900, // ₹399 in paise
          "INR",
          "month",
          3
        ),
        new SubscriptionPlan(
          "udn_pro_yearly",
          "UNextDoor Pro Plan",
          99900, // ₹999 in paise
          "INR",
          "month",
          12
        ),
      ];

      const results = [];
      for (const plan of plans) {
        const result = await this.createPlan(plan);
        results.push(result);
      }

      console.log("✅ Default plans initialized successfully");
      return PaymentResult.success(results);
    } catch (error) {
      console.error("❌ Error initializing default plans:", error);
      return PaymentResult.failure(error.message, "PLAN_INITIALIZATION_FAILED");
    }
  }
}

export default RazorpayGateway;
