import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useTheme } from '../../shared/context/ThemeContext';
import { SubscriptionService } from '../../shared/services/subscriptionService';
import { useSubscription } from '../../shared/hooks/useSubscription';

// Import modern components
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernButton,
  ModernErrorMessage,
  ConfirmationDialog,
  RazorpayPaymentDialog,
  PaymentSuccessDialog,
} from '../../shared/components';
import SafeAreaWrapper from '../../shared/components/SafeAreaWrapper';

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
  const [plans, setPlans] = useState([]);
  const [upgradeLoading, setUpgradeLoading] = useState(null);
  const [error, setError] = useState(null);

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    planId: null,
    loading: false,
  });

  // Payment dialog state
  const [paymentDialog, setPaymentDialog] = useState({
    visible: false,
    orderDetails: null,
    planDetails: null,
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

      // Fetch available plans
      const plansData = await SubscriptionService.getPlans();
      console.log('📊 Plans Data:', JSON.stringify(plansData, null, 2));

      if (plansData.success) {
        console.log('✅ Plans loaded successfully:', plansData.data.plans.length);
        console.log('📋 Sample plan features:', JSON.stringify(plansData.data.plans[0]?.features, null, 2));
        setPlans(plansData.data.plans);
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

      // Handle upgrade/new purchase - directly proceed to payment
      await proceedWithPayment(planId);
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
      // Create order
      const orderData = await SubscriptionService.createOrder(planId);

      if (orderData.success) {
        // Store order ID for recovery
        await AsyncStorage.setItem('pending_payment_order_id', orderData.data.orderId);

        // Open payment dialog with order details
        const selectedPlan = plans.find(p => p.id === planId);
        console.log('🔍 Looking for plan:', planId, 'in plans:', plans.map(p => ({ id: p.id, name: p.name })));
        console.log('📋 Selected plan:', selectedPlan);

        // Safety check - ensure we have plan details
        if (!selectedPlan) {
          console.error('❌ Selected plan not found:', planId);
          Alert.alert('Error', 'Selected plan not found. Please try again.');
          return;
        }

        console.log('💳 Opening payment dialog with data:', {
          orderDetails: orderData.data,
          planDetails: selectedPlan
        });

        setPaymentDialog({
          visible: true,
          orderDetails: orderData.data,
          planDetails: selectedPlan,
        });
      } else {
        Alert.alert('Error', orderData.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      
      // Show better error message based on the error
      let errorMessage = 'Failed to initiate payment';
      if (error.response?.status === 503) {
        errorMessage = 'Payment system is currently disabled. Please contact support for assistance.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Payment Error', errorMessage);
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

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Clear pending order
      await AsyncStorage.removeItem('pending_payment_order_id');

      // Refresh subscription data
      await refreshSubscription();

      // Refresh user profile to get updated subscription status
      if (getProfile) {
        await getProfile();
      }

      // Show success dialog
      setSuccessDialog({
        visible: true,
        planName: currentPlan?.name || 'Subscription',
        amount: null,
        message: 'Your subscription has been activated successfully.',
      });
    } catch (error) {
      console.error('Error handling payment success:', error);
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

  const formatPrice = (price, interval, intervalCount, currency = 'INR', currencySymbol = '₹') => {
    if (price === 0) return 'Free';
    
    const symbol = currencySymbol || getCurrencySymbol(currency);
    
    if (intervalCount === 3) return `${symbol}${price}/quarter`;
    if (intervalCount === 12) return `${symbol}${price}/year`;
    return `${symbol}${price}/month`;
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

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

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

                        {(hasReachedLimit('lessons') || hasReachedLimit('aiSessions')) && (
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
      </Container>
    </SafeAreaWrapper>
  );
}
