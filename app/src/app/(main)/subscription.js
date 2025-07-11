import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  Easing,
  Linking,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useTheme } from '../../shared/context/ThemeContext';
import { SubscriptionService } from '../../shared/services/subscriptionService';
import { useSubscription } from '../../shared/hooks/useSubscription';
import { CurrencyService, SUPPORTED_CURRENCIES } from '../../shared/services/currencyService';
import { apiClient } from '../../shared/api/apiClient';

// Import UI components
import SafeAreaWrapper from '../../shared/components/SafeAreaWrapper';
import {
  Container,
  Row,
  Column,
  Spacer,
} from '../../shared/components/layout';
import {
  Text,
  Heading,
} from '../../shared/components/typography';
import {
  ModernCard,
  ModernButton,
  ModernErrorMessage,
  ConfirmationDialog,
  RazorpayPaymentDialog,
  PaymentSuccessDialog,
  UpgradePreviewDialog,
} from '../../shared/components';

const { width } = Dimensions.get('window');

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, token, getProfile } = useAuth();
  const { theme } = useTheme();
  
  // Use the subscription hook for real-time data
  const {
    currentPlan,
    usage,
    hasActiveSubscription,
    hasReachedLimit,
    loading: subscriptionLoading,
    refreshSubscription,
  } = useSubscription();

  // Local state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPlansFetch, setLastPlansFetch] = useState(0);
  const [needsPlanRefresh, setNeedsPlanRefresh] = useState(false);
  const [plans, setPlans] = useState([]);
  const [upgradeLoading, setUpgradeLoading] = useState(null);
  const [error, setError] = useState(null);
  const [currentCurrency, setCurrentCurrency] = useState(null);

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    planId: null,
    loading: false,
  });

  // Currency confirmation dialog state
  const [currencyDialog, setCurrencyDialog] = useState({
    visible: false,
    detectedCurrency: null,
    loading: false,
    isManualSelection: false,
  });

  // Payment dialog state
  const [paymentDialog, setPaymentDialog] = useState({
    visible: false,
    orderDetails: null,
    planDetails: null,
  });

  // Upgrade preview dialog state
  const [upgradePreviewDialog, setUpgradePreviewDialog] = useState({
    visible: false,
    targetPlan: null,
    currentPlan: null,
    originalPrice: 0,
    prorationCredit: 0,
    finalPrice: 0,
    remainingDays: 0,
    currency: null,
    planId: null,
    loading: false,
  });

  const [successDialog, setSuccessDialog] = useState({
    visible: false,
    planName: '',
    amount: null,
    message: '',
  });

  // Animation state
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const fetchSubscriptionData = async () => {
    try {
      setError(null);
      console.log('🚀 Starting fetchSubscriptionData...');

      // Check and confirm currency before showing plans
      console.log('🚀 About to check currency...');
      await checkAndConfirmCurrency();
      console.log('🚀 Currency check completed');

      // Fetch available plans
      console.log('🚀 Fetching subscription plans...');
      const plansData = await SubscriptionService.getPlans();
      console.log('📊 Plans Data:', JSON.stringify(plansData, null, 2));

      if (plansData.success) {
        console.log('✅ Plans loaded successfully:', plansData.data.plans.length);
        console.log('📋 Sample plan features:', JSON.stringify(plansData.data.plans[0]?.features, null, 2));
        setPlans(plansData.data.plans);
        setLastPlansFetch(Date.now());
        setNeedsPlanRefresh(false);
      } else {
        console.error('❌ Failed to load plans:', plansData.message);
        setPlans([]);
      }

      // Check for pending payments (recovery mechanism)
      await checkPendingPayments();

    } catch (error) {
      console.error('💥 Error fetching subscription data:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  // Check and confirm user's currency preference
  const checkAndConfirmCurrency = async () => {
    try {
      console.log('🔍 Starting currency preference check...');

      // Check if user has a saved currency preference (backend or local)
      let hasSavedPreference = false;
      let backendCurrency = null;

      try {
        // Check backend first
        console.log('🔍 Checking backend for currency preference...');
        const response = await apiClient.get('/auth/preferences');
        console.log('🔍 Backend response:', response.data);

        if (response.data.success && response.data.data.preferences) {
          backendCurrency = response.data.data.preferences.currency;
          console.log('🔍 Backend currency value:', backendCurrency);

          // Only consider it a saved preference if currency is not null/undefined/empty
          if (backendCurrency && backendCurrency.trim() !== '') {
            console.log('✅ User has valid backend currency preference:', backendCurrency);
            hasSavedPreference = true;
          } else {
            console.log('📍 Backend currency is null/empty, treating as no preference');
          }
        }
      } catch (error) {
        console.log('📍 Backend preference check failed:', error.message);
      }

      if (!hasSavedPreference) {
        // Check local storage
        console.log('🔍 Checking local storage for currency preference...');
        const savedCurrency = await AsyncStorage.getItem('user_selected_currency');
        console.log('🔍 Local storage currency:', savedCurrency);

        if (savedCurrency) {
          try {
            const parsed = JSON.parse(savedCurrency);
            if (parsed && parsed.code && parsed.symbol) {
              console.log('✅ User has valid local currency preference:', parsed);
              hasSavedPreference = true;
            } else {
              console.log('📍 Invalid local currency data, removing...');
              await AsyncStorage.removeItem('user_selected_currency');
            }
          } catch (parseError) {
            console.log('📍 Failed to parse local currency, removing...');
            await AsyncStorage.removeItem('user_selected_currency');
          }
        } else {
          console.log('📍 No local currency preference found');
        }
      }

      // If no saved preference, show currency selection dialog
      if (!hasSavedPreference) {
        console.log('🎯 No valid currency preference found, showing selection dialog');

        // Try to detect currency without location permission (non-intrusive detection)
        let detectedCurrency = null;
        try {
          console.log('🎯 Attempting non-intrusive currency detection...');
          // Use timezone-based detection first (no permission required)
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timezone && (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta'))) {
            detectedCurrency = { code: 'INR', symbol: '₹', name: 'Indian Rupee' };
            console.log('🎯 Detected INR from timezone:', timezone);
          } else {
            // Default to USD for other timezones
            detectedCurrency = { code: 'USD', symbol: '$', name: 'US Dollar' };
            console.log('🎯 Defaulting to USD for timezone:', timezone);
          }
        } catch (error) {
          console.log('🎯 Timezone detection failed, using USD default:', error.message);
          detectedCurrency = { code: 'USD', symbol: '$', name: 'US Dollar' };
        }

        console.log('🎯 Final detected currency for dialog:', detectedCurrency);

        setCurrencyDialog({
          visible: true,
          detectedCurrency: detectedCurrency,
          loading: false,
          isManualSelection: false, // This is automatic detection
        });
        return; // Don't continue loading until currency is confirmed
      }

      // User has saved preference, get and set current currency
      console.log('✅ User has saved preference, loading current currency...');
      const currentCurrency = await CurrencyService.getCurrency();
      setCurrentCurrency(currentCurrency);
      console.log('✅ Using saved currency preference:', currentCurrency);

    } catch (error) {
      console.error('❌ Error checking currency:', error);
      // Continue with default currency if error
      setCurrentCurrency(SUPPORTED_CURRENCIES.DEFAULT);
    }
  };

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const checkPendingPayments = async () => {
    try {
      // Check if there's a pending order ID stored locally
      // This would be set when payment was initiated
      const pendingOrderId = await AsyncStorage.getItem('pending_payment_order_id');

      if (pendingOrderId) {
        console.log('Checking pending payment:', pendingOrderId);

        try {
          const data = await SubscriptionService.verifyPayment(pendingOrderId);

          if (data.success) {
            if (data.data.status === 'completed' || data.data.status === 'recovered') {
              // Payment was successful, clear pending order and refresh data
              await AsyncStorage.removeItem('pending_payment_order_id');

              // Show success dialog
              setSuccessDialog({
                visible: true,
                planName: currentPlan?.name || 'Subscription',
                amount: null,
                message: data.data.status === 'recovered'
                  ? 'Your payment was processed successfully. Your subscription is now active!'
                  : 'Your subscription is active!',
              });

              // Refresh data
              await fetchSubscriptionData();
              if (getProfile) {
                await getProfile();
              }
            }
          }
        } catch (verifyError) {
          // If order not found (404), clear the pending order ID
          if (verifyError.response?.status === 404) {
            console.log('Pending order not found, clearing stored order ID');
            await AsyncStorage.removeItem('pending_payment_order_id');
          } else {
            throw verifyError; // Re-throw other errors
          }
        }
      }
    } catch (error) {
      console.error('Error checking pending payments:', error);
      // Don't show error to user for this background check
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    // Refresh subscription data
    if (typeof refreshSubscription === 'function') {
      refreshSubscription();
    }
    
    await fetchSubscriptionData();
    setRefreshing(false);
  };

  // Helper function to determine plan hierarchy
  const getPlanLevel = (planId) => {
    const planHierarchy = {
      'free': 0,
      'basic_monthly': 1,
      'standard_quarterly': 2,
      'pro_yearly': 3
    };
    return planHierarchy[planId] || 0;
  };

  // Helper function to check if plan change is downgrade
  const isDowngrade = (currentPlanId, targetPlanId) => {
    return getPlanLevel(targetPlanId) < getPlanLevel(currentPlanId);
  };

  const handlePlanChange = async (planId) => {
    setUpgradeLoading(planId);
    try {
      // Get current plan ID - only default to 'free' if no active subscription
      const currentPlanId = hasActiveSubscription && currentPlan?.id ? currentPlan.id : 'free';

      // Check if this is a downgrade
      if (isDowngrade(currentPlanId, planId)) {
        handleDowngrade(planId);
        return;
      }

      // For new subscriptions (no active subscription), proceed directly
      if (!hasActiveSubscription || currentPlanId === 'free') {
        await proceedWithPayment(planId);
        return;
      }

      // For upgrades, show preview with proration details first
      await showUpgradePreview(planId);
    } catch (error) {
      console.error('Error getting plan change preview:', error);
      setConfirmDialog({
        visible: true,
        title: 'Error',
        message: 'Failed to calculate plan change cost. Please try again.',
        planId: null,
        loading: false,
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  // Show upgrade preview with proration details
  const showUpgradePreview = async (planId) => {
    try {
      console.log('🔍 Getting upgrade preview for plan:', planId);

      // Get the target plan details
      const targetPlan = plans.find(p => p.id === planId);
      if (!targetPlan) {
        throw new Error('Target plan not found');
      }

      // Get current currency
      const currency = await CurrencyService.getCurrency();

      // Call backend to get upgrade preview with proration calculation
      const response = await SubscriptionService.getUpgradePreview(planId, {
        currency: currency.code
      });

      if (response.success) {
        const previewData = response.data;

        // Show upgrade preview dialog
        setUpgradePreviewDialog({
          visible: true,
          targetPlan: targetPlan,
          currentPlan: currentPlan,
          originalPrice: previewData.originalPrice,
          prorationCredit: previewData.prorationCredit,
          finalPrice: previewData.finalPrice,
          remainingDays: previewData.remainingDays,
          currency: currency,
          planId: planId,
          loading: false
        });
      } else {
        throw new Error(response.message || 'Failed to get upgrade preview');
      }
    } catch (error) {
      console.error('Error getting upgrade preview:', error);

      // Fallback: proceed directly to payment if preview fails
      console.log('📋 Preview failed, proceeding directly to payment');
      await proceedWithPayment(planId);
    }
  };

  const handleDowngrade = (planId) => {
    const targetPlan = plans.find(p => p.id === planId);
    const currentPlanName = currentPlan?.name || 'Current Plan';
    const targetPlanName = targetPlan?.name || 'Selected Plan';

    setConfirmDialog({
      visible: true,
      title: 'Downgrade Plan',
      message: `Downgrades take effect at the end of your current billing cycle. You'll continue to have access to ${currentPlanName} features until then, and will be charged for ${targetPlanName} on your next billing date.`,
      planId,
      loading: false,
      isDowngrade: true,
    });
  };

  const proceedWithPayment = async (planId) => {
    setUpgradeLoading(planId);

    try {
      // Get current currency for the subscription
      const currency = await CurrencyService.getCurrency();
      console.log('💰 Using currency for subscription:', currency);

      // Create recurring subscription (new flow)
      const subscriptionData = await SubscriptionService.createRecurringSubscription(planId, {
        currency: currency.code
      });

      if (subscriptionData.success) {
        // Store order ID for recovery
        await AsyncStorage.setItem('pending_payment_order_id', subscriptionData.data.orderId);

        // Open payment dialog with subscription details
        const selectedPlan = plans.find(p => p.id === planId);
        console.log('🔍 Looking for plan:', planId, 'in plans:', plans.map(p => ({ id: p.id, name: p.name })));
        console.log('📋 Selected plan:', selectedPlan);

        // Safety check - ensure we have plan details
        if (!selectedPlan) {
          console.error('❌ Selected plan not found:', planId);
          Alert.alert('Error', 'Selected plan not found. Please try again.');
          return;
        }

        console.log('💳 Opening payment dialog with recurring subscription data:', {
          orderDetails: subscriptionData.data,
          planDetails: selectedPlan,
          isRecurring: true
        });

        setPaymentDialog({
          visible: true,
          orderDetails: subscriptionData.data,
          planDetails: selectedPlan,
          isRecurring: true, // Flag to indicate this is a recurring subscription
          paymentStep: 'webview',
          webViewUrl: subscriptionData.data.paymentUrl
        });
      } else {
        Alert.alert('Error', subscriptionData.message || 'Failed to create recurring subscription');
      }
    } catch (error) {
      console.error('Error creating recurring subscription:', error);
      
      // Show better error message based on the error
      let errorMessage = 'Failed to initiate recurring subscription';
      if (error.response?.status === 503) {
        errorMessage = 'Payment system is currently disabled. Please contact support for assistance.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Subscription Error', errorMessage);
    } finally {
      setUpgradeLoading(null);
    }
  };

  // Dialog handlers
  const handleDialogConfirm = () => {
    if (confirmDialog.planId) {
      if (confirmDialog.isDowngrade) {
        handleScheduleDowngrade(confirmDialog.planId);
      } else {
        proceedWithPayment(confirmDialog.planId);
      }
    } else {
      // For error/info dialogs, just close
      setConfirmDialog({ visible: false, title: '', message: '', planId: null, loading: false });
    }
  };

  const handleScheduleDowngrade = async (planId) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));

    try {
      // Call backend to schedule downgrade
      const response = await SubscriptionService.scheduleDowngrade(planId);

      if (response.success) {
        setConfirmDialog({ visible: false, title: '', message: '', planId: null, loading: false });

        // Show success message
        Alert.alert(
          'Downgrade Scheduled',
          'Your plan will be downgraded at the end of your current billing cycle. You can cancel this change anytime before then.',
          [{ text: 'OK' }]
        );

        // Refresh subscription data
        await refreshSubscription();
      } else {
        setConfirmDialog({
          visible: true,
          title: 'Error',
          message: response.message || 'Failed to schedule downgrade. Please try again.',
          planId: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error scheduling downgrade:', error);
      setConfirmDialog({
        visible: true,
        title: 'Error',
        message: 'Failed to schedule downgrade. Please try again.',
        planId: null,
        loading: false,
      });
    }
  };

  const handleDialogCancel = () => {
    setConfirmDialog({ visible: false, title: '', message: '', planId: null, loading: false });
  };

  // Upgrade preview dialog handlers
  const handleUpgradePreviewConfirm = async () => {
    const planId = upgradePreviewDialog.planId;
    setUpgradePreviewDialog(prev => ({ ...prev, visible: false }));

    // Proceed with payment
    await proceedWithPayment(planId);
  };

  const handleUpgradePreviewCancel = () => {
    setUpgradePreviewDialog({
      visible: false,
      targetPlan: null,
      currentPlan: null,
      originalPrice: 0,
      prorationCredit: 0,
      finalPrice: 0,
      remainingDays: 0,
      currency: null,
      planId: null,
      loading: false,
    });
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      console.log('🎉 Payment success data received:', paymentData);

      // Clear pending order
      await AsyncStorage.removeItem('pending_payment_order_id');

      // Refresh subscription data to get updated auto-renewal status
      await refreshSubscription();

      // Refresh user profile to get updated subscription status
      if (getProfile) {
        await getProfile();
      }

      // Use the plan details from the payment dialog (the plan that was just purchased)
      const purchasedPlan = paymentData.planDetails;
      const orderDetails = paymentData.orderDetails;

      console.log('📋 Purchased plan details:', purchasedPlan);
      console.log('📋 Order details:', orderDetails);

      // Check if this was an upgrade
      const isUpgrade = orderDetails?.isUpgrade || false;
      const prorationCredit = orderDetails?.prorationCredit || 0;
      const originalAmount = orderDetails?.originalAmount;
      const previousSubscription = orderDetails?.previousSubscription;

      // Show success dialog with the correct plan information
      setSuccessDialog({
        visible: true,
        planName: purchasedPlan?.name || 'Subscription',
        amount: orderDetails?.amount || paymentData.amount,
        originalAmount: originalAmount,
        prorationCredit: prorationCredit,
        isUpgrade: isUpgrade,
        previousPlan: previousSubscription,
        message: isUpgrade
          ? `Your ${purchasedPlan?.name || 'subscription'} upgrade has been activated! ${prorationCredit > 0 ? `You received ₹${prorationCredit} credit for your previous subscription. ` : ''}Auto-renewal is enabled, and you'll receive email reminders before each payment.`
          : `Your ${purchasedPlan?.name || 'subscription'} plan has been activated! Auto-renewal is enabled, and you'll receive email reminders before each payment.`,
      });
    } catch (error) {
      console.error('Error handling payment success:', error);

      // Fallback success dialog if there's an error
      setSuccessDialog({
        visible: true,
        planName: 'Subscription',
        amount: paymentData.amount,
        message: 'Your subscription has been activated successfully!',
      });
    }
  };

  const handlePaymentFailure = (errorData) => {
    Alert.alert(
      'Payment Failed',
      errorData.error || 'Payment could not be completed. Please try again.',
      [{ text: 'OK' }]
    );
  };

  const handleDialogClose = () => {
    setConfirmDialog({ visible: false, title: '', message: '', planId: null, loading: false });
  };

  // Auto-renewal management handlers
  const handleToggleAutoRenewal = async (enabled) => {
    try {
      const response = await SubscriptionService.updateAutoRenewal(enabled);
      
      if (response.success) {
        // Refresh subscription data to reflect changes
        await refreshSubscription();
        
        Alert.alert(
          'Auto-Renewal Updated',
          enabled 
            ? 'Auto-renewal has been enabled. You\'ll receive email reminders before each payment.'
            : 'Auto-renewal has been disabled. Your subscription will expire at the end of the current billing period.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update auto-renewal setting');
      }
    } catch (error) {
      console.error('Error updating auto-renewal:', error);
      Alert.alert('Error', 'Failed to update auto-renewal setting. Please try again.');
    }
  };

  // Currency confirmation handlers
  const handleCurrencyConfirm = async (selectedCurrency) => {
    try {
      console.log('💰 Currency confirmation:', {
        selectedCurrency,
        isManualSelection: currencyDialog.isManualSelection,
        currentPlansCount: plans.length
      });
      
      setCurrencyDialog(prev => ({ ...prev, loading: true }));
      
      // Save the currency selection
      console.log('💰 Saving currency to backend...', selectedCurrency);
      await CurrencyService.setCurrency(selectedCurrency);
      
      // Update local state
      setCurrentCurrency(selectedCurrency);
      setNeedsPlanRefresh(true); // Mark that plans need to be refreshed
      
      console.log('💰 Currency saved successfully:', selectedCurrency);
      
      // Increased delay to ensure backend has processed the preference update
      console.log('💰 Waiting for backend to process preference update...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close dialog
      setCurrencyDialog({ 
        visible: false, 
        detectedCurrency: null, 
        loading: false, 
        isManualSelection: false 
      });
      
      // Always reload plans when currency is changed to show updated prices
      console.log('💰 Reloading plans with new currency:', selectedCurrency.code);
      setLoading(true);
      
      try {
        // Add debugging to check what plans are returned
        console.log('💰 Making getPlans request...');
        const plansData = await SubscriptionService.getPlans();
        console.log('💰 Plans response:', {
          success: plansData.success,
          plansCount: plansData.data?.plans?.length || 0,
          firstPlanCurrency: plansData.data?.plans?.[0]?.currency,
          firstPlanSymbol: plansData.data?.plans?.[0]?.currencySymbol,
          firstPlanPrice: plansData.data?.plans?.[1]?.price, // Basic plan price
        });
        
        if (plansData.success) {
          setPlans(plansData.data.plans);
          setLastPlansFetch(Date.now());
          setNeedsPlanRefresh(false);
          console.log('💰 Plans reloaded successfully with currency:', 
            plansData.data.plans?.[0]?.currency);
          
          // Show success message if currency actually changed
          const newCurrency = plansData.data.plans?.[0]?.currency;
          if (newCurrency === selectedCurrency.code) {
            console.log('💰 Currency change successful - plans now show', newCurrency);
          } else {
            console.warn('💰 Currency change may not have taken effect - plans still show', newCurrency);
            Alert.alert('Warning', 
              `Plans are still showing ${newCurrency} prices. This might be a temporary delay. Please refresh the page if prices don't update.`);
          }
        } else {
          console.error('💰 Failed to reload plans:', plansData.message);
          Alert.alert('Error', 'Failed to refresh plans with new currency. Please try again.');
        }
        
        // Only check pending payments during first-time setup
        if (!currencyDialog.isManualSelection) {
          await checkPendingPayments();
        }
      } catch (error) {
        console.error('💰 Error reloading plans:', error);
        Alert.alert('Warning', 'Failed to refresh plans with new currency. Please refresh the page.');
      } finally {
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Error confirming currency:', error);
      Alert.alert('Error', 'Failed to save currency preference. Please try again.');
      setCurrencyDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCurrencyDialogClose = () => {
    // If user closes without selecting, use default USD
    if (!currencyDialog.isManualSelection) {
      // First-time setup - save default and continue
      handleCurrencyConfirm(SUPPORTED_CURRENCIES.DEFAULT);
    } else {
      // Manual selection - just close the dialog
      setCurrencyDialog({
        visible: false,
        detectedCurrency: null,
        loading: false,
        isManualSelection: false
      });
    }
  };

  // Force currency check function for testing/debugging
  const forceCurrencyCheck = async () => {
    console.log('🔧 Force currency check triggered');

    // Clear local storage currency
    await AsyncStorage.removeItem('user_selected_currency');
    console.log('🔧 Cleared local storage currency');

    // Directly show currency selection dialog without location detection
    console.log('🔧 Showing currency dialog directly (skipping location detection)');
    setCurrencyDialog({
      visible: true,
      detectedCurrency: null, // No detection, let user choose
      loading: false,
      isManualSelection: false, // Treat as automatic for new user flow
    });

    console.log('🔧 Force currency check completed');
  };

  // Simple function to directly show currency dialog (for console testing)
  const showCurrencyDialog = () => {
    console.log('🎯 Directly showing currency dialog');
    setCurrencyDialog({
      visible: true,
      detectedCurrency: null,
      loading: false,
      isManualSelection: false,
    });
  };

  // Make functions available globally for console testing (development only)
  if (__DEV__) {
    global.forceCurrencyCheck = forceCurrencyCheck;
    global.showCurrencyDialog = showCurrencyDialog;
  }

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll still have access until the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await SubscriptionService.cancelSubscription();
              
              if (response.success) {
                await refreshSubscription();
                Alert.alert(
                  'Subscription Cancelled',
                  'Your subscription has been cancelled. You\'ll continue to have access until the end of your current billing period.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to cancel subscription');
              }
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleReactivateSubscription = async () => {
    try {
      const response = await SubscriptionService.reactivateSubscription();
      
      if (response.success) {
        await refreshSubscription();
        Alert.alert(
          'Subscription Reactivated',
          'Your subscription has been reactivated. Auto-renewal is now enabled.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      Alert.alert('Error', 'Failed to reactivate subscription. Please try again.');
    }
  };

  // Helper functions
  const getPlanIcon = (planId) => {
    const icons = {
      free: 'leaf-outline',
      basic_monthly: 'star-outline',
      standard_quarterly: 'trophy-outline',
      pro_yearly: 'diamond-outline',
    };
    return icons[planId] || 'star-outline';
  };

  const getPlanColor = (planId) => {
    const colors = {
      free: theme.colors.neutral[500],
      basic_monthly: theme.colors.warning.main,
      standard_quarterly: theme.colors.info.main,
      pro_yearly: theme.colors.success.main,
    };
    return colors[planId] || theme.colors.neutral[400];
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩'
    };
    return symbols[currency] || currency + ' ';
  };

  // Format subscription plan price with the currently selected currency symbol
  const formatPrice = (price, interval, intervalCount, currencyArg, currencySymbolArg) => {
    if (price === 0) return 'Free';

    // Prefer the plan's currency symbol to match the price; fallback to currentCurrency or default
    const symbol = currencySymbolArg || currentCurrency?.symbol || getCurrencySymbol(currencyArg);

    if (intervalCount === 3) return `${symbol}${price}/quarter`;
    if (intervalCount === 12) return `${symbol}${price}/year`;
    return `${symbol}${price}/month`;
  };

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        const currency = await CurrencyService.getCurrency();
        setCurrentCurrency(currency);
      } catch (error) {
        console.error('Error initializing currency:', error);
      }
    };
    
    initializeCurrency();
    fetchSubscriptionData();
  }, []);

  // Refetch plans whenever the screen comes into focus
  // This ensures plans are updated after navigation or currency changes
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Subscription screen focused - fetching latest subscription data');
      fetchSubscriptionData();
    }, [])
  );

  // Check for payment status from URL parameters when screen loads
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Check for payment success/failure from URL parameters
        // This would be set when redirecting back from payment page
        const urlParams = new URLSearchParams(window.location?.search || '');
        const paymentStatus = urlParams.get('payment');
        
        if (paymentStatus === 'success') {
          // Show success dialog
          setSuccessDialog({
            visible: true,
            planName: currentPlan?.name || 'Subscription',
            amount: null,
            message: 'Your subscription has been activated successfully.',
          });

          // Clear any pending payment order
          await AsyncStorage.removeItem('pending_payment_order_id');
          // Refresh subscription data
          await fetchSubscriptionData();
          await refreshSubscription();
          // Refresh user profile to get updated subscription status
          if (getProfile) {
            await getProfile();
          }
        } else if (paymentStatus === 'cancelled') {
          Alert.alert(
            'Payment Cancelled',
            'Your payment was cancelled. You can try again anytime.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.log('Error checking payment status:', error);
      }
    };

    checkPaymentStatus();
  }, []);

  if (loading || subscriptionLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={theme.colors.brandGreen} />
            <Spacer size="md" />
            <Text>Loading subscription details...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.brandGreen]}
              tintColor={theme.colors.brandGreen}
              title="Pull to refresh"
              titleColor={theme.colors.neutral[600]}
            />
          }
          style={{ flex: 1 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Modern Header Section */}
            <Row
              justify="space-between"
              align="center"
              style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.brandWhite,
              }}
            >
              <Column style={{ flex: 1, marginRight: 12 }}>
                <Text variant="caption" weight="medium" color="neutral.600">
                  SUBSCRIPTION
                </Text>
                <Heading
                  level="h2"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    flexWrap: 'wrap',
                    flexShrink: 1,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  Choose Your Plan
                </Heading>
              </Column>
              
              <Row align="center">
                {/* Currency Selector */}
                <TouchableOpacity
                  onPress={() => {
                    // When manually opening currency selector, show selection dialog
                    setCurrencyDialog({
                      visible: true,
                      detectedCurrency: null, // Set to null to show manual selection
                      loading: false,
                      isManualSelection: true, // Flag to indicate manual selection
                    });
                  }}
                  style={{
                    backgroundColor: theme.colors.neutral[100],
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginRight: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" weight="medium" color="neutral.700" style={{ marginRight: 4 }}>
                    {currentCurrency?.symbol || (plans.length > 0 && plans[0].currency === 'INR' ? '₹' : '$')}
                  </Text>
                  <Ionicons name="chevron-down" size={12} color={theme.colors.neutral[600]} />
                </TouchableOpacity>

                {/* Debug button for testing currency dialog */}
                {__DEV__ && (
                  <TouchableOpacity
                    onPress={forceCurrencyCheck}
                    style={{
                      backgroundColor: theme.colors.error.main,
                      borderRadius: 16,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      marginRight: 8,
                    }}
                  >
                    <Text variant="caption" weight="medium" color="brandWhite">
                      DEBUG
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    backgroundColor: theme.colors.neutral[100],
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name="close" size={16} color={theme.colors.brandNavy} />
                </TouchableOpacity>
              </Row>
            </Row>

            {/* Error message */}
            {error && (
              <View style={{ paddingHorizontal: theme.spacing.md }}>
                <ModernErrorMessage error={error} />
              </View>
            )}

            <Spacer size="md" />

            {/* Current Plan Section */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  // padding: theme.spacing.lg,
                  elevation:0
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  CURRENT PLAN
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  {currentPlan.name} Plan
                </Heading>

                {/* Current Plan Card */}
                <View
                  style={{
                    // backgroundColor: currentPlan.tier === 'free' 
                    //   ? theme.colors.success.main + "10" 
                    //   : theme.colors.success.main + "10",
                    // borderRadius: 8,
                    // padding: 10,
                    // borderWidth: 2,
                    // borderColor: currentPlan.tier === 'free' 
                    //   ? theme.colors.info.main + "30" 
                    //   : theme.colors.success.main + "30",
                  }}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center" style={{ flex: 1, marginRight: 12 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: currentPlan.tier === 'free' 
                            ? theme.colors.warning.main + "20" 
                            : theme.colors.success.main + "20",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name={currentPlan.tier === 'free' ? "star-outline" : "checkmark-circle"}
                          size={24}
                          color={currentPlan.tier === 'free' ? theme.colors.warning.main : theme.colors.success.main}
                        />
                      </View>
                      <Column style={{ flex: 1, flexShrink: 1 }}>
                        <Text
                          weight="semibold"
                          style={{
                            color: theme.colors.brandNavy,
                            fontFamily: theme.typography.fontFamily.semibold,
                            fontSize: 16,
                            flexWrap: 'wrap',
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {currentPlan.name}
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            color: theme.colors.neutral[600],
                            marginTop: -16,
                            fontFamily: theme.typography.fontFamily.light,
                            flexWrap: 'wrap',
                            flexShrink: 1,
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {currentPlan.tier === 'free' ? 'Free forever' : 'Premium access'}
                        </Text>
                      </Column>
                    </Row>

                    <View
                      style={{
                        backgroundColor: currentPlan.tier === 'free' 
                          ? theme.colors.warning.main 
                          : theme.colors.success.main,
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        flexShrink: 0,
                      }}
                    >
                      <Text
                        weight="semibold"
                        style={{
                          color: theme.colors.brandWhite,
                          fontSize: 12,
                          fontFamily: theme.typography.fontFamily.semibold,
                        }}
                        numberOfLines={1}
                      >
                        {hasActiveSubscription ? 'ACTIVE' : 'CURRENT'}
                      </Text>
                    </View>
                  </Row>

                  {/* Usage Section for Free Users */}
                  {currentPlan.tier === 'free' && (
                    <View style={{ marginTop: 16 }}>
                      <Text
                        variant="caption"
                        weight="medium"
                        style={{
                          color: theme.colors.neutral[600],
                          fontFamily: theme.typography.fontFamily.medium,
                          marginBottom: 12,
                        }}
                      >
                        THIS MONTH'S USAGE
                      </Text>
                      
                      <View
                        style={{
                          backgroundColor: theme.colors.brandWhite,
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
                          <Row align="center" style={{ flex: 1, marginRight: 8 }}>
                            <Ionicons name="book-outline" size={16} color={theme.colors.brandGreen} style={{ marginRight: 8, flexShrink: 0 }} />
                            <Text
                              variant="caption"
                              style={{
                                color: theme.colors.neutral[700],
                                fontFamily: theme.typography.fontFamily.regular,
                                flex: 1,
                                flexShrink: 1,
                              }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              Lessons
                            </Text>
                          </Row>
                          <Text
                            variant="caption"
                            weight="medium"
                            style={{
                              color: hasReachedLimit('lessons') ? theme.colors.error.main : theme.colors.success.main,
                              fontFamily: theme.typography.fontFamily.medium,
                              flexShrink: 0,
                            }}
                            numberOfLines={1}
                          >
                            {usage.lessons.current}/{usage.lessons.limit}
                          </Text>
                        </Row>

                        {/* Only show AI Sessions for non-free plans */}
                        {currentPlan?.tier !== 'free' && (
                          <Row justify="space-between" align="center">
                            <Row align="center" style={{ flex: 1, marginRight: 8 }}>
                              <Ionicons name="chatbubble-outline" size={16} color={theme.colors.brandGreen} style={{ marginRight: 8, flexShrink: 0 }} />
                              <Text
                                variant="caption"
                                style={{
                                  color: theme.colors.neutral[700],
                                  fontFamily: theme.typography.fontFamily.regular,
                                  flex: 1,
                                  flexShrink: 1,
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                AI Sessions
                              </Text>
                            </Row>
                            <Text
                              variant="caption"
                              weight="medium"
                              style={{
                                color: hasReachedLimit('aiSessions') ? theme.colors.error.main : theme.colors.success.main,
                                fontFamily: theme.typography.fontFamily.medium,
                                flexShrink: 0,
                              }}
                              numberOfLines={1}
                            >
                              {usage.aiSessions.current}/{usage.aiSessions.limit}
                            </Text>
                          </Row>
                        )}

                        {/* Show limit reached warning - only check relevant limits based on plan */}
                        {(hasReachedLimit('lessons') || (currentPlan?.tier !== 'free' && hasReachedLimit('aiSessions'))) && (
                          <View
                            style={{
                              backgroundColor: theme.colors.error.main + "10",
                              borderRadius: 6,
                              padding: 8,
                              marginTop: 8,
                              borderWidth: 1,
                              borderColor: theme.colors.error.main + "20",
                            }}
                          >
                            <Text
                              variant="caption"
                              weight="medium"
                              style={{
                                color: theme.colors.error.main,
                                textAlign: "center",
                                fontSize: 11,
                              }}
                            >
                              Limit reached! Upgrade to continue learning.
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </ModernCard>
            </View>

            {/* Auto-Renewal Management Section - only show for active subscriptions */}
            {hasActiveSubscription && currentPlan.tier !== 'free' && (
              <>
                <Spacer size="md" />
                <View style={{ paddingHorizontal: theme.spacing.md }}>
                  <AutoRenewalManagement 
                    currentPlan={currentPlan}
                    onToggleAutoRenewal={handleToggleAutoRenewal}
                    onCancelSubscription={handleCancelSubscription}
                    onReactivateSubscription={handleReactivateSubscription}
                  />
                </View>
              </>
            )}

            {/* Subscription Status Warnings */}
            {currentPlan.tier !== 'free' && (
              <View style={{ paddingHorizontal: theme.spacing.md }}>
                <SubscriptionStatusWarnings currentPlan={currentPlan} />
              </View>
            )}

            <Spacer size="lg" />

            {/* Available Plans Section */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <Text
                variant="caption"
                weight="medium"
                style={{
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.medium,
                  marginBottom: 8,
                }}
              >
                AVAILABLE PLANS
              </Text>
              <Heading
                level="h3"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: theme.spacing.md,
                }}
              >
                Upgrade Your Experience
              </Heading>

              {plans.map((plan, index) => (
                <ModernCard
                  key={plan.id}
                  style={{
                    backgroundColor: theme.colors.brandWhite,
                    borderRadius: 16,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.md,
                    borderWidth: plan.popular ? 2 : 1,
                    borderColor: plan.popular ? theme.colors.brandGreen : theme.colors.neutral[200],
                  }}
                >
                  {plan.popular && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -8,
                        left: 16,
                        backgroundColor: theme.colors.brandGreen,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        weight="semibold"
                        style={{
                          color: theme.colors.brandWhite,
                          fontSize: 10,
                          fontFamily: theme.typography.fontFamily.semibold,
                        }}
                      >
                        MOST POPULAR
                      </Text>
                    </View>
                  )}

                  <View style={{ marginTop: plan.popular ? 8 : 0 ,marginBottom: theme.spacing.sm }}>
                    {/* Plan Header */}
                    <Row align="center" justifyContent="space-between" style={{ marginBottom: 16,}}>
                    <View style={{flexDirection: 'row', alignItems: 'center',}}>
                        <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: getPlanColor(plan.id) + "20",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      >
                        <Ionicons
                          name={getPlanIcon(plan.id)}
                          size={18}
                          color={getPlanColor(plan.id)}
                        />
                      </View>
                      <View style={{ flex: 0, minWidth: 0,marginRight: "auto" }}>
                        <Text
                          weight="semibold"
                          style={{
                            color: theme.colors.brandNavy,
                            fontFamily: theme.typography.fontFamily.bold,
                            fontSize: 22,
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {plan.name}
                        </Text>
                      </View>
                    </View>
                      <Text
                        weight="bold"
                        style={{
                          flex:1,
                          width:"100%",
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.bold,
                          fontSize: 18,
                          marginLeft: "auto",
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {formatPrice(plan.price, plan.interval, plan.intervalCount, plan.currency, plan.currencySymbol)}
                      </Text>
                    </Row>
                    
                    {/* Plan Description */}
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.regular,
                        marginBottom: 8,
                        lineHeight: 16,
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {plan.description}
                    </Text>
                  </View>

                  <Spacer size="md" />

                  {/* Plan Features */}
                  <View style={{ marginBottom: theme.spacing.md,width:"94%" }}>
                    {/* Main Features */}
                    {Object.entries(plan.features || {}).map(([key, feature]) => {
                      // Skip additionalPerks as it's handled separately
                      if (key === 'additionalPerks') return null;
                      
                      return (
                        <Row align="flex-start" key={key} style={{ marginBottom: 10, }}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={theme.colors.success.main}
                            style={{ marginRight: 8, marginTop: 1, flexShrink: 0 }}
                          />
                          <Text
                            variant="caption"
                            style={{
                              color: theme.colors.neutral[700],
                              fontFamily: theme.typography.fontFamily.regular,
                              flex: 1,
                              lineHeight: 20,
                            }}
                            numberOfLines={3}
                            ellipsizeMode="tail"
                          >
                            {typeof feature === 'object' ? feature.label : feature}
                          </Text>
                        </Row>
                      );
                    })}

                    {/* Additional Perks */}
                    {plan.features?.additionalPerks && Array.isArray(plan.features.additionalPerks) && 
                      plan.features.additionalPerks.map((perk, index) => (
                        <Row align="flex-start" key={`perk-${index}`} style={{ marginBottom: 10 }}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={theme.colors.success.main}
                            style={{ marginRight: 8, marginTop: 1, flexShrink: 0 }}
                          />
                          <Text
                            variant="caption"
                            style={{
                              color: theme.colors.neutral[700],
                              fontFamily: theme.typography.fontFamily.regular,
                              flex: 1,
                              lineHeight: 20,
                            }}
                            numberOfLines={3}
                            ellipsizeMode="tail"
                          >
                            {perk}
                          </Text>
                        </Row>
                      ))
                    }
                  </View>

                  {/* Action Button */}
                  <ModernButton
                    text={
                      upgradeLoading === plan.id
                        ? "Processing..."
                        : currentPlan?.id === plan.id
                          ? "Current Plan"
                          : (!hasActiveSubscription && plan.id === 'free')
                            ? "Current Plan"
                            : (() => {
                                const currentPlanId = hasActiveSubscription && currentPlan?.id ? currentPlan.id : 'free';
                                if (isDowngrade(currentPlanId, plan.id)) {
                                  return "Downgrade";
                                } else if (currentPlanId === 'free') {
                                  return "Get Started";
                                } else {
                                  return "Upgrade";
                                }
                              })()
                    }
                    variant={plan.popular ? "solid" : "outline"}
                    size="md"
                    disabled={upgradeLoading === plan.id || currentPlan?.id === plan.id || plan.id === 'free'}
                    style={{
                      backgroundColor: 
                        currentPlan?.id === plan.id || plan.id === 'free'
                          ? theme.colors.neutral[200]
                          : plan.popular 
                            ? theme.colors.brandGreen 
                            : "transparent",
                      borderColor: 
                        currentPlan?.id === plan.id || plan.id === 'free'
                          ? theme.colors.neutral[400]
                          : theme.colors.brandGreen,
                    }}
                    textStyle={{
                      color: 
                        currentPlan?.id === plan.id || plan.id === 'free'
                          ? theme.colors.neutral[600]
                          : plan.popular 
                            ? theme.colors.brandWhite 
                            : theme.colors.brandGreen,
                    }}
                    onPress={() => {
                      if (currentPlan?.id === plan.id || plan.id === 'free') {
                        return; // Do nothing for current plan or free plan
                      }
                      handlePlanChange(plan.id);
                    }}
                  />
                </ModernCard>
              ))}
            </View>

            {/* Bottom Padding */}
            <View style={{ height: 150 }} />
          </Animated.View>
        </ScrollView>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          visible={confirmDialog.visible}
          onClose={handleDialogClose}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.planId ? "Proceed" : "OK"}
          cancelText="Cancel"
          onConfirm={handleDialogConfirm}
          onCancel={handleDialogClose}
          loading={confirmDialog.loading}
          icon={confirmDialog.title.includes('Error') ? 'alert-circle' : 'card-outline'}
          iconColor={confirmDialog.title.includes('Error') ? theme.colors.error.main : theme.colors.brandGreen}
        />

        <RazorpayPaymentDialog
          visible={paymentDialog.visible}
          onClose={() => setPaymentDialog({ visible: false, orderDetails: null, planDetails: null })}
          orderDetails={paymentDialog.orderDetails}
          planDetails={paymentDialog.planDetails}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />

        <PaymentSuccessDialog
          visible={successDialog.visible}
          onClose={() => setSuccessDialog({ visible: false, planName: '', amount: null, message: '' })}
          planName={successDialog.planName}
          amount={successDialog.amount}
          message={successDialog.message}
        />

        <CurrencyConfirmationDialog
          visible={currencyDialog.visible}
          detectedCurrency={currencyDialog.detectedCurrency}
          onConfirm={handleCurrencyConfirm}
          onClose={handleCurrencyDialogClose}
          loading={currencyDialog.loading}
          isManualSelection={currencyDialog.isManualSelection}
        />

        <UpgradePreviewDialog
          visible={upgradePreviewDialog.visible}
          targetPlan={upgradePreviewDialog.targetPlan}
          currentPlan={upgradePreviewDialog.currentPlan}
          originalPrice={upgradePreviewDialog.originalPrice}
          prorationCredit={upgradePreviewDialog.prorationCredit}
          finalPrice={upgradePreviewDialog.finalPrice}
          remainingDays={upgradePreviewDialog.remainingDays}
          currency={upgradePreviewDialog.currency}
          onConfirm={handleUpgradePreviewConfirm}
          onCancel={handleUpgradePreviewCancel}
          loading={upgradePreviewDialog.loading}
        />
      </Container>
    </SafeAreaWrapper>
  );
}

// Auto-Renewal Management Component
const AutoRenewalManagement = ({ currentPlan, onToggleAutoRenewal, onCancelSubscription, onReactivateSubscription }) => {
  const { theme } = useTheme();
  const [autoRenewalEnabled, setAutoRenewalEnabled] = useState(
    currentPlan?.cancelAtPeriodEnd === false // If not cancelled at period end, auto-renewal is enabled
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', // Shorter month format to save space
      day: 'numeric'
    });
  };

  const handleToggleAutoRenewal = async () => {
    const newValue = !autoRenewalEnabled;
    await onToggleAutoRenewal(newValue);
    setAutoRenewalEnabled(newValue);
  };

  return (
    <ModernCard
      style={{
        backgroundColor: theme.colors.brandWhite,
        borderRadius: 16,
        padding: theme.spacing.md, // Reduced padding for better space utilization
        elevation: 0,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
        marginHorizontal: 0, // Ensure full width usage
      }}
    >
      {/* Header Section */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <Text
          variant="caption"
          weight="medium"
          style={{
            color: theme.colors.neutral[600],
            fontFamily: theme.typography.fontFamily.medium,
            fontSize: 11, // Reduced font size
            letterSpacing: 0.5,
            marginBottom: 6,
          }}
        >
          SUBSCRIPTION MANAGEMENT
        </Text>

        <Heading
          level="h4"
          style={{
            color: theme.colors.brandNavy,
            fontFamily: theme.typography.fontFamily.bold,
            fontSize: 18, // Reduced from default h4 size
            lineHeight: 22,
            marginBottom: 0,
          }}
        >
          Auto-Renewal Settings
        </Heading>
      </View>

      {/* Current Period Information - Improved Layout */}
      <View
        style={{
          backgroundColor: theme.colors.brandGreen + '10',
          borderRadius: 12,
          padding: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.brandGreen + '20',
        }}
      >
        <View style={{ marginBottom: 8 }}>
          <Row justify="space-between" align="center">
            <Text
              style={{
                color: theme.colors.neutral[700],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 13, // Reduced font size to prevent overflow
                lineHeight: 16,
              }}
            >
              Current Period Ends:
            </Text>
            <Text
              style={{
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 13, // Consistent font size
                lineHeight: 16,
                textAlign: 'right',
                flex: 1,
                marginLeft: 8,
              }}
            >
              {formatDate(currentPlan?.currentPeriodEnd)}
            </Text>
          </Row>
        </View>

        <Row justify="space-between" align="center">
          <Text
            style={{
              color: theme.colors.neutral[700],
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: 13,
              lineHeight: 16,
            }}
          >
            Status:
          </Text>
          <View
            style={{
              backgroundColor: currentPlan?.cancelAtPeriodEnd ?
                theme.colors.error.main + '20' :
                theme.colors.success.main + '20',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: currentPlan?.cancelAtPeriodEnd ?
                  theme.colors.error.main :
                  theme.colors.success.main,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              {currentPlan?.cancelAtPeriodEnd ? 'Will Cancel' : 'Active'}
            </Text>
          </View>
        </Row>
      </View>

      {/* Auto-Renewal Toggle - Improved Layout */}
      <View
        style={{
          backgroundColor: theme.colors.neutral[50],
          borderRadius: 12,
          padding: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        <Row justify="space-between" align="center">
          <Column style={{ flex: 1, marginRight:10, width:"90%" }}>
            <Text
              style={{
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.semibold,
                fontSize: 15,
                lineHeight: 18,
                marginBottom: 4,
              }}
            >
              Auto-Renewal
            </Text>
            <Text
              style={{
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
                fontSize: 12,
                lineHeight: 16,
                flexWrap: 'wrap',
              }}
            >
              Automatically renew your subscription each billing period
            </Text>
          </Column>

          <TouchableOpacity
            onPress={handleToggleAutoRenewal}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              backgroundColor: autoRenewalEnabled ? theme.colors.success.main : theme.colors.neutral[300],
              justifyContent: 'center',
              paddingHorizontal: 2,
              flexShrink: 0, // Prevent shrinking
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: theme.colors.brandWhite,
                transform: [{ translateX: autoRenewalEnabled ? 18 : 2 }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </TouchableOpacity>
        </Row>
      </View>

      {/* Action Buttons - Improved Styling */}
      <View style={{ marginBottom: theme.spacing.sm }}>
        {currentPlan?.cancelAtPeriodEnd ? (
          <ModernButton
            text="Reactivate Subscription"
            onPress={onReactivateSubscription}
            variant="solid"
            style={{
              backgroundColor: theme.colors.success.main,
              borderRadius: 12,
              paddingVertical: 14,
              width: '100%',
            }}
            textStyle={{
              color: theme.colors.brandWhite,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 15,
            }}
          />
        ) : (
          <ModernButton
            title="Cancel Subscription"
            onPress={onCancelSubscription}
            variant="outline"
            style={{
              borderColor: theme.colors.error.main,
              borderWidth: 1.5,
              borderRadius: 12,
              paddingVertical: 14,
              backgroundColor: theme.colors.brandWhite,
              width: '100%',
            }}
            textStyle={{
              color: theme.colors.error.main,
              fontFamily: theme.typography.fontFamily.semibold,
              fontSize: 15,
            }}
          />
        )}
      </View>

      {/* Email Reminder Info - Improved Styling */}
      {autoRenewalEnabled && (
        <View
          style={{
            backgroundColor: theme.colors.info.main + "10",
            borderRadius: 12,
            padding: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.info.main + "20",
          }}
        >
          <Row align="flex-start" style={{ flexWrap: 'wrap' }}>
            <Ionicons
              name="mail-outline"
              size={16}
              color={theme.colors.info.main}
              style={{ marginRight: 8, marginTop: 1, flexShrink: 0 }}
            />
            <Text
              style={{
                color: theme.colors.info.main,
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 12,
                lineHeight: 16,
                flex: 1,
                flexWrap: 'wrap',
              }}
            >
              You'll receive email reminders 7 days and 1 day before each renewal
            </Text>
          </Row>
        </View>
      )}
    </ModernCard>
  );
};

// Subscription Status Warnings Component
const SubscriptionStatusWarnings = ({ currentPlan }) => {
  const { theme } = useTheme();

  // Don't show warnings for free plan
  if (!currentPlan || currentPlan.tier === 'free') {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysUntilExpiry = () => {
    if (!currentPlan.currentPeriodEnd) return null;
    const now = new Date();
    const expiryDate = new Date(currentPlan.currentPeriodEnd);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const hasExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const willCancel = currentPlan.cancelAtPeriodEnd;

  // Show warning if subscription is expiring soon or will be cancelled
  if (!isExpiringSoon && !hasExpired && !willCancel) {
    return null;
  }

  let warningType = 'info';
  let iconName = 'information-circle-outline';
  let title = '';
  let message = '';

  if (hasExpired) {
    warningType = 'error';
    iconName = 'alert-circle-outline';
    title = 'Subscription Expired';
    message = `Your subscription expired on ${formatDate(currentPlan.currentPeriodEnd)}. Renew now to continue accessing premium features.`;
  } else if (willCancel) {
    warningType = 'warning';
    iconName = 'warning-outline';
    title = 'Subscription Will Cancel';
    message = `Your subscription will end on ${formatDate(currentPlan.currentPeriodEnd)}. You can reactivate it anytime before then.`;
  } else if (isExpiringSoon) {
    warningType = 'warning';
    iconName = 'time-outline';
    title = 'Subscription Expiring Soon';
    message = `Your subscription expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} on ${formatDate(currentPlan.currentPeriodEnd)}.`;
  }

  const colors = {
    info: theme.colors.info.main,
    warning: theme.colors.warning.main,
    error: theme.colors.error.main,
  };

  return (
    <View
      style={{
        backgroundColor: colors[warningType] + '10',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: colors[warningType] + '20',
      }}
    >
      <Row align="center" style={{ marginBottom: 8 }}>
        <Ionicons 
          name={iconName} 
          size={20} 
          color={colors[warningType]} 
          style={{ marginRight: 8 }}
        />
        <Text 
          variant="body1" 
          weight="semibold" 
          style={{ color: colors[warningType], flex: 1 }}
        >
          {title}
        </Text>
      </Row>
      
      <Text 
        variant="body2" 
        color="neutral.700" 
        style={{ lineHeight: 20 }}
      >
        {message}
      </Text>

      {/* Action suggestions */}
      {hasExpired && (
        <Text 
          variant="caption" 
          color="neutral.600" 
          style={{ marginTop: 8, fontStyle: 'italic' }}
        >
          Choose a plan below to reactivate your subscription.
        </Text>
      )}
    </View>
  );
};

// Currency Confirmation Dialog Component
const CurrencyConfirmationDialog = ({ visible, detectedCurrency, onConfirm, onClose, loading, isManualSelection }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  // Always show selection interface for first-time setup or manual selection
  const isIndianDetection = detectedCurrency && detectedCurrency.code === 'INR';

  const dialogTitle = isManualSelection 
    ? "Select Currency" 
    : isIndianDetection 
      ? "Confirm Your Region" 
      : "Select Currency";

  const dialogMessage = isManualSelection
    ? "Choose your preferred currency for subscription pricing:"
    : isIndianDetection
      ? `We detected you're in ${detectedCurrency.country}. INR is your natural currency, but you can choose USD if you prefer:`
      : "We couldn't detect your location automatically. Please choose your preferred currency for subscription pricing:";

  const detectionFailureMessage = !isManualSelection && !isIndianDetection
    ? "💡 Tip: We use location services to suggest the best currency for you. You can change this anytime in settings."
    : null;

  const handleBackdropPress = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        <View
          style={{
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 20,
            padding: theme.spacing.xl,
            maxWidth: 400,
            width: '100%',
            elevation: 10,
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
          }}
        >
          {/* Header */}
          <Row justify="space-between" align="flex-start" style={{ marginBottom: 16 }}>
            <Row align="center" style={{ flex: 1, marginRight: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.info.main + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={theme.colors.info.main}
                />
              </View>
              <Heading
                level="h3"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  flex: 1,
                }}
              >
                {dialogTitle}
              </Heading>
            </Row>
            
            {!loading && (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: theme.colors.neutral[100],
                  borderRadius: 16,
                  padding: 8,
                }}
              >
                <Ionicons name="close" size={16} color={theme.colors.neutral[600]} />
              </TouchableOpacity>
            )}
          </Row>

          {/* Message */}
          <Text
            style={{
              color: theme.colors.neutral[700],
              fontFamily: theme.typography.fontFamily.regular,
              lineHeight: 22,
              marginBottom: detectionFailureMessage ? 12 : 24,
            }}
          >
            {dialogMessage}
          </Text>

          {/* Detection failure tip */}
          {detectionFailureMessage && (
            <View
              style={{
                backgroundColor: theme.colors.info.main + '10',
                borderRadius: 8,
                padding: 12,
                marginBottom: 24,
                borderLeftWidth: 3,
                borderLeftColor: theme.colors.info.main,
              }}
            >
              <Text
                variant="caption"
                style={{
                  color: theme.colors.info.main,
                  fontFamily: theme.typography.fontFamily.medium,
                  lineHeight: 18,
                }}
              >
                {detectionFailureMessage}
              </Text>
            </View>
          )}

          {/* Currency Options */}
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => onConfirm(SUPPORTED_CURRENCIES.IN)}
              disabled={loading}
              style={{
                backgroundColor: isIndianDetection ? theme.colors.brandGreen + '10' : theme.colors.neutral[50],
                borderRadius: 12,
                padding: 18,
                marginBottom: 12,
                borderWidth: isIndianDetection ? 2 : 1,
                borderColor: isIndianDetection ? theme.colors.brandGreen : theme.colors.neutral[200],
              }}
            >
              <Row align="center">
                <Text style={{ fontSize: 28, marginRight: 16 }}>🇮🇳</Text>
                <Column style={{ flex: 1 }}>
                  <Text 
                    weight="semibold" 
                    color="brandNavy" 
                    style={{ 
                      fontSize: 18,
                      // lineHeight: 24,
                      marginBottom: -20,
                    }}
                  >
                    India
                  </Text>
                  <Text 
                    variant="caption" 
                    color="neutral.600"
                    style={{
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {SUPPORTED_CURRENCIES.IN.symbol} {SUPPORTED_CURRENCIES.IN.name} ({SUPPORTED_CURRENCIES.IN.code})
                  </Text>
                </Column>
                {isIndianDetection && (
                  <View
                    style={{
                      backgroundColor: theme.colors.brandGreen,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text 
                      variant="caption" 
                      weight="medium" 
                      style={{ 
                        color: theme.colors.brandWhite,
                        fontSize: 11,
                        lineHeight: 14,
                      }}
                    >
                      DETECTED
                    </Text>
                  </View>
                )}
              </Row>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onConfirm(SUPPORTED_CURRENCIES.DEFAULT)}
              disabled={loading}
              style={{
                backgroundColor: !isIndianDetection ? theme.colors.brandGreen + '10' : theme.colors.neutral[50],
                borderRadius: 12,
                padding: 18,
                borderWidth: !isIndianDetection ? 2 : 1,
                borderColor: !isIndianDetection ? theme.colors.brandGreen : theme.colors.neutral[200],
              }}
            >
              <Row align="center">
                <Text style={{ fontSize: 28, marginRight: 16 }}>🌍</Text>
                <Column style={{ flex: 1 }}>
                  <Text 
                    weight="semibold" 
                    color="brandNavy" 
                    style={{ 
                      fontSize: 18,
                      // lineHeight: 40,
                      marginBottom: -20,
                    }}
                  >
                    International
                  </Text>
                  <Text 
                    variant="caption" 
                    color="neutral.600"
                    style={{
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {SUPPORTED_CURRENCIES.DEFAULT.symbol} {SUPPORTED_CURRENCIES.DEFAULT.name} ({SUPPORTED_CURRENCIES.DEFAULT.code})
                  </Text>
                </Column>
                {!isIndianDetection && (
                  <View
                    style={{
                      backgroundColor: theme.colors.info.main,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text 
                      variant="caption" 
                      weight="medium" 
                      style={{ 
                        color: theme.colors.brandWhite,
                        fontSize: 11,
                        lineHeight: 14,
                      }}
                    >
                      GLOBAL
                    </Text>
                  </View>
                )}
              </Row>
            </TouchableOpacity>
          </View>

          {/* Retry detection button for failed auto-detection */}
          {!isManualSelection && !isIndianDetection && !loading && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  console.log('🔄 Retrying currency detection...');
                  const newDetectedCurrency = await CurrencyService.detectCurrency();
                  console.log('🔄 Retry result:', newDetectedCurrency);

                  if (newDetectedCurrency.code === 'INR') {
                    // Auto-select INR if detected
                    onConfirm(newDetectedCurrency);
                  } else {
                    // Show updated dialog with new detection
                    Alert.alert(
                      'Detection Complete',
                      `We still couldn't detect your exact location. Please select your preferred currency manually.`,
                      [{ text: 'OK' }]
                    );
                  }
                } catch (error) {
                  console.error('❌ Retry detection failed:', error);
                  Alert.alert(
                    'Detection Failed',
                    'Unable to detect your location. Please select your currency manually.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              style={{
                backgroundColor: theme.colors.neutral[100],
                borderRadius: 8,
                padding: 12,
                marginTop: 16,
                alignItems: 'center',
              }}
            >
              <Row align="center">
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={theme.colors.neutral[600]}
                  style={{ marginRight: 8 }}
                />
                <Text
                  variant="caption"
                  weight="medium"
                  style={{ color: theme.colors.neutral[600] }}
                >
                  Try detecting my location again
                </Text>
              </Row>
            </TouchableOpacity>
          )}

          {/* Loading indicator */}
          {loading && (
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <ActivityIndicator size="small" color={theme.colors.brandGreen} />
              <Text variant="caption" color="neutral.600" style={{ marginTop: 8 }}>
                Saving your preference...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
