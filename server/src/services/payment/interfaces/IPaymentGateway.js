/**
 * Payment Gateway Interface (Interface Segregation Principle)
 * Defines the contract for payment gateway implementations
 */

export class IPaymentGateway {
  async createCustomer(userDetails) {
    throw new Error("Method 'createCustomer' must be implemented");
  }

  async createPlan(planDetails) {
    throw new Error("Method 'createPlan' must be implemented");
  }

  async createSubscription(customerId, planId, options) {
    throw new Error("Method 'createSubscription' must be implemented");
  }

  async createOrder(amount, currency, options) {
    throw new Error("Method 'createOrder' must be implemented");
  }

  async verifyPayment(paymentId, orderId, signature) {
    throw new Error("Method 'verifyPayment' must be implemented");
  }

  async cancelSubscription(subscriptionId, reason) {
    throw new Error("Method 'cancelSubscription' must be implemented");
  }

  async createRefund(paymentId, amount, reason) {
    throw new Error("Method 'createRefund' must be implemented");
  }

  async getPaymentDetails(paymentId) {
    throw new Error("Method 'getPaymentDetails' must be implemented");
  }

  async getSubscriptionDetails(subscriptionId) {
    throw new Error("Method 'getSubscriptionDetails' must be implemented");
  }

  async webhookSignatureVerification(payload, signature, secret) {
    throw new Error("Method 'webhookSignatureVerification' must be implemented");
  }
}

/**
 * Payment Result Interface for consistent response format
 */
export class PaymentResult {
  constructor(success, data = null, error = null, errorCode = null) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.errorCode = errorCode;
    this.timestamp = new Date();
  }

  static success(data) {
    return new PaymentResult(true, data);
  }

  static failure(error, errorCode = null) {
    return new PaymentResult(false, null, error, errorCode);
  }
}

/**
 * Subscription Plan Interface
 */
export class SubscriptionPlan {
  constructor(id, name, amount, currency, interval, intervalCount) {
    this.id = id;
    this.name = name;
    this.amount = amount; // Amount in smallest currency unit
    this.currency = currency;
    this.interval = interval; // day, week, month, year
    this.intervalCount = intervalCount; // Number of intervals
  }
}

/**
 * Customer Interface
 */
export class Customer {
  constructor(name, email, contact, notes = {}) {
    this.name = name;
    this.email = email;
    this.contact = contact;
    this.notes = notes;
  }
}

export default {
  IPaymentGateway,
  PaymentResult,
  SubscriptionPlan,
  Customer,
};
