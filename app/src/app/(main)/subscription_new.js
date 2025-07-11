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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useTheme } from '../../shared/context/ThemeContext';
import { SubscriptionService } from '../../shared/services/subscriptionService';
import { useSubscription } from '../../shared/hooks/useSubscription';
import { CurrencyService } from '../../shared/services/currencyService';

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
} from '../../shared/components';
import SafeAreaWrapper from '../../shared/components/SafeAreaWrapper';

const { width } = Dimensions.get('window');

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
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
  const [userCurrency, setUserCurrency] = useState(null);

  // Animation state
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const fetchSubscriptionData = async () => {
    try {
      setError(null);

      // Detect user currency first
      const currency = await CurrencyService.getUserCurrency();
      setUserCurrency(currency);
      console.log('💰 Using currency:', currency);

      // Fetch available plans
      const plansData = await SubscriptionService.getPlans();

      if (plansData.success) {
        // Convert prices to user's currency if needed
        const plansWithCurrency = plansData.data.plans.map(plan => ({
          ...plan,
          originalPrice: plan.price,
          price: currency.code === 'USD' ? CurrencyService.convertPrice(plan.price, currency) : plan.price,
          currency: currency.code,
          currencySymbol: currency.symbol
        }));
        setPlans(plansWithCurrency);
      } else {
        console.error('Failed to load plans:', plansData.message);
        setPlans([]);
      }

      // Check for pending payments (recovery mechanism)
      await checkPendingPayments();

    } catch (error) {
      console.error('Error fetching subscription data:', error);
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
        
        const data = await SubscriptionService.verifyPayment(pendingOrderId);
        
        if (data.success) {
          if (data.data.status === 'completed' || data.data.status === 'recovered') {
            // Payment was successful, clear pending order and refresh data
            await AsyncStorage.removeItem('pending_payment_order_id');
            Alert.alert(
              'Payment Successful!', 
              data.data.status === 'recovered' 
                ? 'Your payment was processed successfully. Your subscription is now active!'
                : 'Your subscription is active!',
              [{ text: 'OK', onPress: () => fetchSubscriptionData() }]
            );
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

  const handleUpgrade = async (planId) => {
    setUpgradeLoading(planId);
    try {
      // Get upgrade preview first
      const previewData = await SubscriptionService.getUpgradePreview(planId);

      if (previewData.success) {
        const data = previewData.data;
        
        // Handle new purchase (free user) vs upgrade (paid user)
        if (data.purchase) {
          // Free user making first purchase - use dynamic currency
          const currency = userCurrency || await CurrencyService.getUserCurrency();
          const amount = currency.code === 'USD' ? 
            CurrencyService.convertPrice(data.purchase.amountToPay, currency) : 
            data.purchase.amountToPay;
          
          const message = `You'll pay ${currency.symbol}${amount} and get immediate access to all ${data.newPlan.name} plan features.`;
          
          Alert.alert(
            'Confirm Purchase',
            message,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Proceed', 
                onPress: () => proceedWithPayment(planId)
              }
            ]
          );
        } else if (data.upgrade) {
          // Existing user upgrading - use dynamic currency
          const { upgrade } = data;
          const currency = userCurrency || await CurrencyService.getUserCurrency();
          const amount = currency.code === 'USD' ? 
            CurrencyService.convertPrice(upgrade.amountToPay, currency) : 
            upgrade.amountToPay;
          const savings = currency.code === 'USD' ? 
            CurrencyService.convertPrice(upgrade.savings, currency) : 
            upgrade.savings;
            
          const message = upgrade.prorationCredit > 0 
            ? `You'll pay ${currency.symbol}${amount} (${currency.symbol}${savings} credit applied) and get immediate access to all features.`
            : `You'll pay ${currency.symbol}${amount} and get immediate access to all features.`;

          Alert.alert(
            'Confirm Upgrade',
            message,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Proceed', 
                onPress: () => proceedWithPayment(planId)
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error getting upgrade preview:', error);
      Alert.alert('Error', 'Failed to calculate upgrade cost. Please try again.');
    } finally {
      setUpgradeLoading(null);
    }
  };

  const proceedWithPayment = async (planId) => {
    try {
      // If no currency detected yet, ask user to select
      let currency = userCurrency;
      if (!currency) {
        currency = await CurrencyService.showCurrencySelector();
        setUserCurrency(currency);
      }

      // Create recurring subscription (updated flow)
      console.log('🔄 Creating recurring subscription with currency:', currency);
      const subscriptionData = await SubscriptionService.createRecurringSubscription(planId, {
        currency: currency.code
      });

      if (subscriptionData.success) {
        // Store subscription ID for recovery
        await AsyncStorage.setItem('pending_subscription_id', subscriptionData.data.subscriptionId);

        // Calculate display amount in user's currency
        const displayAmount = currency.code === 'USD' ?
          CurrencyService.convertPrice(subscriptionData.data.planDetails.price, currency) :
          subscriptionData.data.planDetails.price;

        // Show recurring subscription information
        Alert.alert(
          'Recurring Subscription Created',
          `Your recurring subscription has been set up successfully!

Subscription ID: ${subscriptionData.data.subscriptionId}
Plan: ${subscriptionData.data.planDetails.name}
Amount: ${currency.symbol}${displayAmount}
Currency: ${currency.name}
Auto-renewal: ${subscriptionData.data.autoRenewal ? 'Enabled' : 'Disabled'}
Next billing: ${new Date(subscriptionData.data.nextBillingDate).toLocaleDateString()}

You will be charged automatically on each billing cycle.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Complete Setup',
              onPress: () => {
                // Navigate to payment authentication if needed
                if (subscriptionData.data.paymentUrl) {
                  console.log('Opening Razorpay authentication:', subscriptionData.data.paymentUrl);
                  // Here you would open the payment URL for authentication
                }
                Alert.alert('Success', 'Recurring subscription activated!', [
                  { text: 'OK', onPress: () => router.push('/(main)/home') }
                ]);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', subscriptionData.message || 'Failed to create recurring subscription');
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      Alert.alert('Error', 'Failed to initiate payment');
    }
  };

  // Helper functions
  const getPlanIcon = (planId) => {
    const icons = {
      basic_monthly: 'star-outline',
      standard_quarterly: 'trophy-outline',
      pro_yearly: 'diamond-outline',
    };
    return icons[planId] || 'star-outline';
  };

  const getPlanColor = (planId) => {
    const colors = {
      basic_monthly: theme.colors.warning.main,
      standard_quarterly: theme.colors.info.main,
      pro_yearly: theme.colors.success.main,
    };
    return colors[planId] || theme.colors.neutral[400];
  };

  const formatPrice = (price, interval, intervalCount, currencySymbol = '₹') => {
    if (intervalCount === 3) return `${currencySymbol}${price}/quarter`;
    if (intervalCount === 12) return `${currencySymbol}${price}/year`;
    return `${currencySymbol}${price}/month`;
  };

  // Add currency change handler
  const handleCurrencyChange = async () => {
    const newCurrency = await CurrencyService.showCurrencySelector();
    setUserCurrency(newCurrency);
    
    // Refresh plans with new currency
    await fetchSubscriptionData();
  };

  useEffect(() => {
    fetchSubscriptionData();
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
              <Column>
                <Text variant="caption" weight="medium" color="neutral.600">
                  SUBSCRIPTION
                </Text>
                <Heading
                  level="h2"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  Choose Your Plan
                </Heading>
              </Column>
              
              <Row align="center">
                {/* Currency Selector */}
                {userCurrency && (
                  <TouchableOpacity
                    onPress={handleCurrencyChange}
                    style={{
                      backgroundColor: theme.colors.neutral[100],
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                    }}
                  >
                    <Text 
                      variant="caption" 
                      weight="medium"
                      style={{ color: theme.colors.brandNavy }}
                    >
                      {userCurrency.symbol} {userCurrency.code}
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
                  padding: theme.spacing.lg,
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
                    backgroundColor: currentPlan.tier === 'free' 
                      ? theme.colors.warning.main + "10" 
                      : theme.colors.success.main + "10",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: currentPlan.tier === 'free' 
                      ? theme.colors.warning.main + "30" 
                      : theme.colors.success.main + "30",
                  }}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
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
                      <Column>
                        <Text
                          weight="semibold"
                          style={{
                            color: theme.colors.brandNavy,
                            fontFamily: theme.typography.fontFamily.semibold,
                            fontSize: 16,
                          }}
                        >
                          {currentPlan.name}
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.regular,
                          }}
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
                      }}
                    >
                      <Text
                        weight="semibold"
                        style={{
                          color: theme.colors.brandWhite,
                          fontSize: 12,
                          fontFamily: theme.typography.fontFamily.semibold,
                        }}
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
                          <Row align="center">
                            <Ionicons name="book-outline" size={16} color={theme.colors.brandGreen} style={{ marginRight: 8 }} />
                            <Text
                              variant="caption"
                              style={{
                                color: theme.colors.neutral[700],
                                fontFamily: theme.typography.fontFamily.regular,
                              }}
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
                            }}
                          >
                            {usage.lessons.current}/{usage.lessons.limit}
                          </Text>
                        </Row>

                        {/* Only show AI Sessions for non-free plans */}
                        {currentPlan?.tier !== 'free' && (
                          <Row justify="space-between" align="center">
                            <Row align="center">
                              <Ionicons name="chatbubble-outline" size={16} color={theme.colors.brandGreen} style={{ marginRight: 8 }} />
                              <Text
                                variant="caption"
                                style={{
                                  color: theme.colors.neutral[700],
                                  fontFamily: theme.typography.fontFamily.regular,
                                }}
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
                              }}
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

                  <Row justify="space-between" align="flex-start" style={{ marginTop: plan.popular ? 8 : 0 }}>
                    <Row align="center">
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: getPlanColor(plan.id) + "20",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name={getPlanIcon(plan.id)}
                          size={24}
                          color={getPlanColor(plan.id)}
                        />
                      </View>
                      <Column style={{ flex: 1 }}>
                        <Text
                          weight="semibold"
                          style={{
                            color: theme.colors.brandNavy,
                            fontFamily: theme.typography.fontFamily.semibold,
                            fontSize: 18,
                          }}
                        >
                          {plan.name}
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.regular,
                            marginTop: 2,
                          }}
                        >
                          {plan.description}
                        </Text>
                      </Column>
                    </Row>

                    <Column align="flex-end">
                      <Text
                        weight="bold"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.bold,
                          fontSize: 20,
                        }}
                      >
                        {formatPrice(plan.price, plan.interval, plan.intervalCount, plan.currencySymbol)}
                      </Text>
                    </Column>
                  </Row>

                  <Spacer size="md" />

                  {/* Plan Features */}
                  <View style={{ marginBottom: theme.spacing.md }}>
                    {Object.entries(plan.features || {}).slice(0, 3).map(([key, feature]) => (
                      <Row align="center" key={key} style={{ marginBottom: 8 }}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={theme.colors.success.main}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          variant="caption"
                          style={{
                            color: theme.colors.neutral[700],
                            fontFamily: theme.typography.fontFamily.regular,
                            flex: 1,
                          }}
                        >
                          {typeof feature === 'object' ? feature.label : feature}
                        </Text>
                      </Row>
                    ))}
                  </View>

                  {/* Action Button */}
                  <ModernButton
                    text={upgradeLoading === plan.id ? "Processing..." : "Get Started"}
                    variant={plan.popular ? "solid" : "outline"}
                    size="md"
                    disabled={upgradeLoading === plan.id}
                    style={{
                      backgroundColor: plan.popular ? theme.colors.brandGreen : "transparent",
                      borderColor: theme.colors.brandGreen,
                    }}
                    textStyle={{
                      color: plan.popular ? theme.colors.brandWhite : theme.colors.brandGreen,
                    }}
                    onPress={() => handleUpgrade(plan.id)}
                  />
                </ModernCard>
              ))}
            </View>

            {/* Bottom Padding */}
            <View style={{ height: 150 }} />
          </Animated.View>
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
