import { apiClient } from '../api/apiClient';

/**
 * Subscription API Service
 * Centralized service for all subscription-related API calls
 */

export class SubscriptionService {
  /**
   * Get current user's subscription
   */
  static async getCurrentSubscription() {
    const response = await apiClient.get('/subscriptions/current');
    return response.data;
  }

  /**
   * Get available subscription plans
   */
  static async getPlans() {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data;
  }

  /**
   * Get user features and usage
   */
  static async getUserFeatures() {
    const response = await apiClient.get('/features/user');
    return response.data;
  }

  /**
   * Get upgrade preview for a plan
   * @param {string} planId - The plan ID to upgrade to
   * @param {object} options - Additional options (currency, etc.)
   */
  static async getUpgradePreview(planId, options = {}) {
    const response = await apiClient.post(`/subscriptions/upgrade-preview/${planId}`, options);
    return response.data;
  }

  /**
   * Create a payment order (legacy one-time payment)
   * @param {string} planId - The plan ID to purchase
   */
  static async createOrder(planId) {
    const response = await apiClient.post('/subscriptions/create-order', { planId });
    return response.data;
  }

  /**
   * Create a recurring subscription
   * @param {string} planId - The plan ID to subscribe to
   * @param {Object} options - Additional options (currency, etc.)
   */
  static async createRecurringSubscription(planId, options = {}) {

    // Ensure currency is included in the request
    const requestData = {
      planId,
      currency: options.currency || 'INR', // Default to INR if not specified
      ...options
    };


    const response = await apiClient.post('/subscriptions/create-recurring', requestData);

    return response.data;
  }

  /**
   * Verify a payment by order ID
   * @param {string} orderId - The order ID to verify
   */
  static async verifyPayment(orderId) {
    const response = await apiClient.get(`/subscriptions/verify-payment/${orderId}`);
    return response.data;
  }

  /**
   * Cancel current subscription
   */
  static async cancelSubscription() {
    const response = await apiClient.post('/subscriptions/cancel');
    return response.data;
  }

  /**
   * Schedule a downgrade to a lower plan
   * @param {string} planId - The plan ID to downgrade to
   */
  static async scheduleDowngrade(planId) {
    const response = await apiClient.post('/subscriptions/schedule-downgrade', { planId });
    return response.data;
  }

  /**
   * Get transaction history
   * @param {Object} params - Query parameters (page, limit, etc.)
   */
  static async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/subscriptions/transactions?${queryString}` : '/subscriptions/transactions';
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Get billing details
   */
  static async getBillingDetails() {
    const response = await apiClient.get('/subscriptions/billing-details');
    return response.data;
  }

  /**
   * Update auto-renewal setting
   * @param {boolean} autoRenewal - Whether to enable auto-renewal
   */
  static async updateAutoRenewal(autoRenewal) {
    const response = await apiClient.post('/subscriptions/auto-renewal', { autoRenewal });
    return response.data;
  }

  /**
   * Reactivate a cancelled subscription
   */
  static async reactivateSubscription() {
    const response = await apiClient.post('/subscriptions/reactivate');
    return response.data;
  }

  /**
   * Get subscription renewal details
   */
  static async getRenewalDetails() {
    const response = await apiClient.get('/subscriptions/renewal-details');
    return response.data;
  }

  /**
   * Recover pending payments (manual recovery)
   */
  static async recoverPendingPayments() {
    const response = await apiClient.post('/subscriptions/recover-payments');
    return response.data;
  }

  /**
   * Get subscription analytics (for admin or user insights)
   */
  static async getSubscriptionAnalytics() {
    const response = await apiClient.get('/subscriptions/analytics');
    return response.data;
  }

  /**
   * Update payment method (if supported)
   * @param {Object} paymentMethodData - Payment method information
   */
  static async updatePaymentMethod(paymentMethodData) {
    const response = await apiClient.post('/subscriptions/payment-method', paymentMethodData);
    return response.data;
  }

  /**
   * Download invoice
   * @param {string} transactionId - Transaction ID
   */
  static async downloadInvoice(transactionId) {
    const response = await apiClient.get(`/subscriptions/invoice/${transactionId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Apply promo code
   * @param {string} promoCode - Promo code to apply
   */
  static async applyPromoCode(promoCode) {
    const response = await apiClient.post('/subscriptions/promo-code', { promoCode });
    return response.data;
  }

  /**
   * Get subscription limits and usage
   */
  static async getUsageLimits() {
    const response = await apiClient.get('/subscriptions/usage-limits');
    return response.data;
  }
}

/**
 * Feature Gating Service
 * Service for checking feature access and usage limits
 */
export class FeatureService {
  /**
   * Check if user has access to a specific feature
   * @param {string} featureName - Name of the feature to check
   */
  static async hasFeatureAccess(featureName) {
    const response = await apiClient.get(`/features/access/${featureName}`);
    return response.data;
  }

  /**
   * Track feature usage
   * @param {string} featureName - Name of the feature used
   * @param {Object} usageData - Additional usage data
   */
  static async trackFeatureUsage(featureName, usageData = {}) {
    const response = await apiClient.post('/features/track-usage', {
      featureName,
      ...usageData
    });
    return response.data;
  }

  /**
   * Get all available features and their status
   */
  static async getAllFeatures() {
    const response = await apiClient.get('/features/all');
    return response.data;
  }

  /**
   * Get coming soon features
   */
  static async getComingSoonFeatures() {
    const response = await apiClient.get('/features/coming-soon');
    return response.data;
  }
}

// Export both services as default for convenience
export default {
  subscription: SubscriptionService,
  features: FeatureService,
};

// Named exports for convenience
export const subscriptionService = SubscriptionService;
export const featureService = FeatureService;
