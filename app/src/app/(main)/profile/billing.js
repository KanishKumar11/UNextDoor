import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useSubscription } from "../../../shared/hooks/useSubscription";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import { subscriptionService } from "../../../shared/services/subscriptionService";
import { BRAND_COLORS } from "../../../shared/constants/colors";

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
} from "../../../shared/components";

/**
 * Billing page component
 * Shows billing details, next payment date, and subscription management
 */
const BillingPage = () => {
  const router = useRouter();
  const { theme } = useTheme();

  // Subscription hook
  const {
    currentPlan,
    hasActiveSubscription,
    loading: subscriptionLoading,
    refreshSubscription,
  } = useSubscription();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [billingDetails, setBillingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);

  // Fetch billing details and available plans
  const fetchBillingDetails = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching billing details...');

      const [billingResponse, plansResponse] = await Promise.all([
        subscriptionService.getBillingDetails(),
        subscriptionService.getPlans()
      ]);

      if (billingResponse.success && billingResponse.data) {
        const { subscription, latestTransaction, autoRenewal } = billingResponse.data;

        if (subscription) {
          // Use displayPrice if available (new subscriptions), otherwise convert planPrice from paise
          const displayAmount = subscription.displayPrice || (subscription.planPrice ? (subscription.planPrice / 100) : 0);

          setBillingDetails({
            nextBillingDate: subscription.nextBillingDate ? new Date(subscription.nextBillingDate) : null,
            amount: displayAmount,
            currency: subscription.currency || 'INR',
            autoRenewal: autoRenewal !== false,
            planName: subscription.planName || `${subscription.planType} ${subscription.planDuration}`,
            status: subscription.status,
            currentPlanId: subscription.planId,
          });
          console.log('✅ Billing details loaded successfully');
        } else {
          console.log('ℹ️ No active subscription found');
          setBillingDetails(null);
        }
      } else {
        console.warn('⚠️ No billing data received');
        setBillingDetails(null);
      }

      // Set available plans for upgrade/downgrade options
      if (plansResponse.success && plansResponse.data) {
        const plans = plansResponse.data.plans.filter(plan => plan.id !== 'free');
        setAvailablePlans(plans);
        console.log('✅ Available plans loaded:', plans.length);
      }
    } catch (err) {
      console.error('❌ Error fetching billing details:', err);
      setError('Failed to load billing details');
      setBillingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshSubscription(),
      fetchBillingDetails(),
    ]);
    setIsRefreshing(false);
  };

  // Handle auto-renewal toggle
  const handleAutoRenewalToggle = () => {
    Alert.alert(
      "Auto-Renewal",
      "Auto-renewal settings can be managed through your subscription provider.",
      [{ text: "OK" }]
    );
  };



  // Helper function to determine plan action (upgrade/downgrade)
  const getPlanAction = (targetPlanId, currentPlanId) => {
    const planHierarchy = {
      'basic_monthly': 1,
      'standard_quarterly': 2,
      'pro_yearly': 3
    };

    const currentLevel = planHierarchy[currentPlanId] || 0;
    const targetLevel = planHierarchy[targetPlanId] || 0;

    return targetLevel > currentLevel ? 'Upgrade' : 'Downgrade';
  };

  // Handle plan upgrade/downgrade
  const handlePlanAction = (targetPlanId, currentPlanId) => {
    const action = getPlanAction(targetPlanId, currentPlanId);

    if (action === 'Upgrade') {
      // Navigate to subscription page with the target plan
      router.push(`/subscription?planId=${targetPlanId}`);
    } else {
      // For downgrades, show confirmation and schedule downgrade
      Alert.alert(
        'Schedule Downgrade',
        `Are you sure you want to downgrade to this plan? The change will take effect at the end of your current billing cycle.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Schedule Downgrade',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await subscriptionService.scheduleDowngrade(targetPlanId);
                if (response.success) {
                  Alert.alert('Success', 'Downgrade scheduled successfully');
                  fetchBillingDetails(); // Refresh data
                } else {
                  Alert.alert('Error', response.message || 'Failed to schedule downgrade');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to schedule downgrade');
              }
            }
          }
        ]
      );
    }
  };

  useEffect(() => {
    fetchBillingDetails();
  }, [hasActiveSubscription, currentPlan?.id, currentPlan?.tier]);
  console.log(billingDetails)
  console.log(currentPlan)
  if (subscriptionLoading || loading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
            <Spacer size="md" />
            <Text>Loading billing details...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Heading level="h2" style={{ color: BRAND_COLORS.OCEAN_BLUE }}>
              Billing
            </Heading>
          </View>

          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="card-outline"
              size={64}
              color={BRAND_COLORS.SHADOW_GREY}
            />
            <Spacer size="lg" />
            <Heading level="h3" style={{ color: BRAND_COLORS.OCEAN_BLUE, textAlign: 'center' }}>
              No Active Subscription
            </Heading>
            <Spacer size="sm" />
            <Text style={{ color: BRAND_COLORS.SHADOW_GREY, textAlign: 'center' }}>
              You don't have an active subscription. Subscribe to access billing details.
            </Text>
            <Spacer size="lg" />
            <ModernButton
              title="View Plans"
              onPress={() => router.push("/subscription")}
              variant="primary"
            />
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
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[BRAND_COLORS.EXPLORER_TEAL]}
              tintColor={BRAND_COLORS.EXPLORER_TEAL}
            />
          }
        >
          {/* Modern Header */}
          <View
            style={{
              paddingTop: theme.spacing.lg,
              paddingHorizontal: theme.spacing.md,
              paddingBottom: theme.spacing.xl,
              backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
            }}
          >
            <Row align="center" justify="space-between" style={{ marginBottom: theme.spacing.md }}>
              <Column>
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: BRAND_COLORS.EXPLORER_TEAL,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  SUBSCRIPTION MANAGEMENT
                </Text>
                <Heading
                  level="h1"
                  style={{
                    color: BRAND_COLORS.OCEAN_BLUE,
                    fontSize: 28,
                    fontWeight: '700',
                  }}
                >
                  Billing
                </Heading>
              </Column>

              {/* Status badge */}
              {hasActiveSubscription && (
                <View
                  style={{
                    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '15',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: BRAND_COLORS.EXPLORER_TEAL + '30',
                  }}
                >
                  <Text
                    weight="bold"
                    style={{
                      color: BRAND_COLORS.EXPLORER_TEAL,
                      fontSize: 12,
                    }}
                  >
                    ACTIVE
                  </Text>
                </View>
              )}
            </Row>
          </View>

          {error && (
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernErrorMessage message={error} />
              <Spacer size="md" />
            </View>
          )}

          {/* Current Plan Card - Smaller */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            <ModernCard
              style={{
                backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                borderRadius: 16,
                padding: theme.spacing.md,
                borderWidth: 1,
                borderColor: BRAND_COLORS.OCEAN_BLUE + '30',
                shadowColor: BRAND_COLORS.OCEAN_BLUE,
                shadowOffset: { width: 0, height: 1 },
                // shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 0,
              }}
            >
              {/* Plan header with icon */}
              <Row align="center">
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: theme.spacing.md,
                  }}
                >
                  <Ionicons
                    name="diamond"
                    size={20}
                    color={BRAND_COLORS.EXPLORER_TEAL}
                  />
                </View>

                <Column style={{ flex: 1 }}>
                  <Text
                    variant="caption"
                    weight="medium"
                    style={{
                      color: BRAND_COLORS.EXPLORER_TEAL,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: -15,
                    }}
                  >
                    CURRENT PLAN
                  </Text>
                  <Heading
                    level="h3"
                    style={{
                      color: BRAND_COLORS.OCEAN_BLUE,
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    {currentPlan.name}
                  </Heading>

                </Column>
              </Row>
            </ModernCard>
          </View>

          <Spacer size="md" />

          {/* Billing Details */}
          {billingDetails && (
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                  borderRadius: 20,
                  padding: theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: BRAND_COLORS.EXPLORER_TEAL + '15',
                  shadowColor: BRAND_COLORS.OCEAN_BLUE,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 0,
                }}
              >
                {/* Header with icon */}
                <Row align="center" style={{ marginBottom: theme.spacing.lg }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: BRAND_COLORS.OCEAN_BLUE + '15',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <Ionicons
                      name="card"
                      size={24}
                      color={BRAND_COLORS.OCEAN_BLUE}
                    />
                  </View>

                  <Column>
                    <Text
                      variant="caption"
                      weight="medium"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      BILLING DETAILS
                    </Text>
                    <Heading
                      level="h3"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontSize: 18,
                        fontWeight: '700',
                      }}
                    >
                      Next Payment
                    </Heading>
                  </Column>
                </Row>

                {/* Billing info cards */}
                <Column>
                  {/* Next Billing Date */}
                  <View
                    style={{
                      backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "10",
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        color: BRAND_COLORS.SHADOW_GREY,
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      Next billing date
                    </Text>
                    <Text
                      weight="semibold"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontSize: 16,
                      }}
                    >
                      {billingDetails.nextBillingDate
                        ? new Date(billingDetails.nextBillingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : 'Not available'
                      }
                    </Text>
                  </View>

                  {/* Amount */}
                  <View
                    style={{
                      backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '08',
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        color: BRAND_COLORS.SHADOW_GREY,
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      Amount
                    </Text>
                    <Text
                      weight="bold"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontSize: 20,
                      }}
                    >
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: billingDetails.currency || 'INR',
                      }).format(billingDetails.amount)}
                    </Text>
                  </View>


                </Column>
              </ModernCard>
            </View>
          )}

          <Spacer size="md" />



          {/* Bottom Padding for Floating Tab Bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
};

export default BillingPage;
