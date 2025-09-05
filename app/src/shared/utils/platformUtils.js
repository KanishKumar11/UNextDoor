import { Platform } from 'react-native';

/**
 * Platform-specific utilities for handling subscription features
 * This helps comply with Apple App Store guidelines by hiding subscription
 * UI elements on iOS while keeping them visible on Android
 */

/**
 * Check if subscription features should be shown
 * Returns false on iOS to comply with Apple App Store guidelines
 */
export const shouldShowSubscriptionFeatures = () => {
  return Platform.OS !== 'ios';
};

/**
 * Check if payment/billing features should be shown
 * Returns false on iOS to comply with Apple App Store guidelines
 */
export const shouldShowPaymentFeatures = () => {
  return Platform.OS !== 'ios';
};

/**
 * Check if upgrade prompts should be shown
 * Returns false on iOS to comply with Apple App Store guidelines
 */
export const shouldShowUpgradePrompts = () => {
  return Platform.OS !== 'ios';
};

/**
 * Get platform-appropriate messaging for subscription features
 */
export const getSubscriptionMessage = () => {
  if (Platform.OS === 'ios') {
    return {
      title: 'Premium Features',
      message: 'For subscription and premium feature access, please contact our support team.',
      contactInfo: 'Email: support@unextdoor.com',
      buttonText: 'Contact Support'
    };
  }
  return null;
};

/**
 * Get platform-appropriate messaging for upgrade prompts
 */
export const getUpgradeMessage = () => {
  if (Platform.OS === 'ios') {
    return 'Contact support for premium access.';
  }
  return 'Upgrade to continue learning.';
};

/**
 * Get platform-appropriate messaging for limit reached scenarios
 */
export const getLimitReachedMessage = () => {
  if (Platform.OS === 'ios') {
    return 'Usage limit reached. Contact support for more access.';
  }
  return 'Limit reached! Upgrade to continue learning.';
};

/**
 * Check if the current platform is iOS
 */
export const isIOS = () => {
  return Platform.OS === 'ios';
};

/**
 * Check if the current platform is Android
 */
export const isAndroid = () => {
  return Platform.OS === 'android';
};

/**
 * Get platform-specific contact information
 */
export const getContactInfo = () => {
  return {
    email: 'support@unextdoor.com',
    subject: 'Premium Features Inquiry',
    body: 'Hi, I would like to learn more about premium features and subscription options.'
  };
};

/**
 * Handle platform-specific navigation for subscription screens
 * On iOS, shows contact information instead of navigating to subscription
 */
export const handleSubscriptionNavigation = (router, showAlert = null) => {
  if (Platform.OS === 'ios') {
    if (showAlert) {
      const message = getSubscriptionMessage();
      showAlert(
        message.title,
        `${message.message}\n\n${message.contactInfo}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
    return false; // Don't navigate
  } else {
    router.push('/subscription');
    return true; // Navigation handled
  }
};

/**
 * Handle platform-specific upgrade actions
 * On iOS, shows contact information instead of upgrade flow
 */
export const handleUpgradeAction = (showAlert = null) => {
  if (Platform.OS === 'ios') {
    if (showAlert) {
      const message = getSubscriptionMessage();
      showAlert(
        'Premium Features',
        `${message.message}\n\n${message.contactInfo}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
    return false; // Don't proceed with upgrade
  }
  return true; // Proceed with upgrade
};
