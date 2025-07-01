import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useSubscription } from "../../../shared/hooks/useSubscription";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import { subscriptionService } from "../../../shared/services/subscriptionService";

// Import modern components
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernErrorMessage,
} from "../../../shared/components";

/**
 * Transactions page component
 * Shows transaction history with dates, amounts, and status
 */
const TransactionsPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  
  // Subscription hook
  const {
    hasActiveSubscription,
    loading: subscriptionLoading,
    refreshSubscription,
  } = useSubscription();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching transaction history...');

      const response = await subscriptionService.getTransactions({
        page: 1,
        limit: 20
      });

      if (response.success && response.data) {
        console.log('📊 Raw transaction response:', JSON.stringify(response.data, null, 2));

        const rawTransactions = response.data.transactions || [];
        console.log('📊 Raw transactions count:', rawTransactions.length);

        const formattedTransactions = rawTransactions.map(transaction => ({
          id: transaction._id,
          date: new Date(transaction.createdAt),
          amount: Math.abs(transaction.amount), // Use absolute value for display
          currency: transaction.currency,
          status: transaction.status,
          description: getTransactionDescription(transaction),
          paymentMethod: getPaymentMethod(transaction),
          type: transaction.type,
          razorpayPaymentId: transaction.razorpayPaymentId,
          razorpayOrderId: transaction.razorpayOrderId,
        }));

        setTransactions(formattedTransactions);
        console.log('✅ Transactions loaded:', formattedTransactions.length);
        console.log('📊 Formatted transactions:', JSON.stringify(formattedTransactions, null, 2));
      } else {
        console.warn('⚠️ No transaction data received');
        console.log('📊 Response:', JSON.stringify(response, null, 2));
        setTransactions([]);
      }
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
      setError('Failed to load transaction history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get transaction description
  const getTransactionDescription = (transaction) => {
    const planInfo = transaction.metadata?.planDetails || {};
    const planName = planInfo.name || transaction.planId || 'Subscription';

    if (transaction.type === 'refund') {
      return `Refund - ${planName}`;
    }
    if (transaction.type === 'subscription_upgrade') {
      return `Upgrade to ${planName}`;
    }
    if (transaction.type === 'subscription_creation') {
      return `New Subscription - ${planName}`;
    }
    if (transaction.type === 'subscription_renewal') {
      return `Renewal - ${planName}`;
    }
    return `${planName} Payment`;
  };

  // Helper function to get payment method
  const getPaymentMethod = (transaction) => {
    if (transaction.razorpayPaymentId) {
      // Extract last 4 digits from payment ID for display
      const paymentId = transaction.razorpayPaymentId;
      const last4 = paymentId.slice(-4);
      return `Payment ID ending in ${last4}`;
    }
    return 'Razorpay Payment';
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshSubscription(),
        fetchTransactions(),
      ]);
      console.log('✅ Transactions refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing transactions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get status color with brand color palette
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.colors.brandGreen; // Use brand green for consistency
      case 'failed':
        return '#EF4444'; // Modern red
      case 'pending':
        return '#F59E0B'; // Modern amber
      case 'refunded':
        return '#8B5CF6'; // Modern purple
      default:
        return theme.colors.neutral[500];
    }
  };

  // Get status icon with modern iconography
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'pending':
        return 'time-outline';
      case 'refunded':
        return 'return-up-back-outline';
      default:
        return 'help-circle-outline';
    }
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'subscription_creation':
        return 'add-circle-outline';
      case 'subscription_renewal':
        return 'refresh-circle-outline';
      case 'subscription_upgrade':
        return 'arrow-up-circle-outline';
      case 'subscription_downgrade':
        return 'arrow-down-circle-outline';
      case 'refund':
        return 'return-up-back-outline';
      default:
        return 'card-outline';
    }
  };

  // Clean and contained transaction card with stacked layout
  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        // Future: Navigate to transaction details
        console.log('Transaction details:', item);
      }}
    >
      <ModernCard
        style={{
          backgroundColor: theme.colors.brandWhite,
          borderRadius: 16,
          padding: 0,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.neutral[100],
          shadowColor: theme.colors.brandNavy,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 0,
          overflow: 'hidden',
        }}
      >
        {/* First row: Icon, Title, and Date */}
        <Row align="center" style={{ marginBottom: theme.spacing.md,          padding: theme.spacing.lg,
 }}>
          {/* Transaction icon */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: getStatusColor(item.status) + '15',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing.md,
            }}
          >
            <Ionicons
              name={getTransactionTypeIcon(item.type)}
              size={24}
              color={getStatusColor(item.status)}
            />
          </View>

          {/* Transaction title and date */}
          <Column style={{ flex: 1 }}>
            <Text
              weight="semibold"
              style={{
                color: theme.colors.brandNavy,
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              {item.description}
            </Text>

            <Text
              style={{
                color: theme.colors.neutral[600],
                fontSize: 13,
              }}
            >
              {item.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })} • {item.date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Column>
        </Row>

        {/* Second row: Amount and Transaction ID */}
        <Row justify="space-between" align="center" style={{ marginBottom: theme.spacing.md,          padding: theme.spacing.lg,
 }}>
          <Column>
            <Text
              style={{
                color: theme.colors.neutral[500],
                fontSize: 12,
                marginBottom: 2,
              }}
            >
              Amount
            </Text>
            <Text
              weight="bold"
              style={{
                color: item.type === 'refund' ? '#EF4444' : theme.colors.brandNavy,
                fontSize: 18,
              }}
            >
              {item.type === 'refund' ? '-' : '+'}{item.currency === 'INR' ? '₹' : '$'}{item.amount}
            </Text>
          </Column>

          <Column align="flex-end">
            <Text
              style={{
                color: theme.colors.neutral[500],
                fontSize: 12,
                marginBottom: 2,
              }}
            >
              Transaction ID
            </Text>
            <Text
              weight="medium"
              style={{
                color: theme.colors.neutral[700],
                fontSize: 13,
                fontFamily: 'monospace',
              }}
            >
              {item.id || item.transactionId || 'N/A'}
            </Text>
          </Column>
        </Row>

        {/* Third row: Status at bottom with no bottom padding */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: getStatusColor(item.status),
            paddingHorizontal: 12,
            width: '100%',
            textAlign:"Center",
            paddingVertical: 6,
            // borderRadius: 20,
          
            // marginTop: theme.spacing.sm,
            // marginBottom: -theme.spacing.lg, // Negative margin to remove bottom padding
          }}
        >
          <Text
            weight="medium"
            style={{
              color: theme.colors.brandWhite,
              fontSize: 12,
              textTransform: 'capitalize',
              textAlign:'center',
            }}
          >
            {item.status}
          </Text>
        </View>
      </ModernCard>
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (subscriptionLoading || loading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Spacer size="md" />
            <Text>Loading transactions...</Text>
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
              colors={[theme.colors.brandGreen]}
              tintColor={theme.colors.brandGreen}
            />
          }
        >
          {/* Modern Header with gradient background */}
          <View
            style={{
              paddingTop: theme.spacing.lg,
              paddingHorizontal: theme.spacing.md,
              paddingBottom: theme.spacing.xl,
              backgroundColor: theme.colors.brandWhite,
            }}
          >
            <Row align="center" justify="space-between" style={{ marginBottom: theme.spacing.md }}>
              <Column>
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.brandGreen,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  PAYMENT HISTORY
                </Text>
                <Heading
                  level="h1"
                  style={{
                    color: theme.colors.brandNavy,
                    fontSize: 28,
                    fontWeight: '700',
                  }}
                >
                  Transactions
                </Heading>
              </Column>

              {/* Transaction count badge */}
              {transactions.length > 0 && (
                <View
                  style={{
                    backgroundColor: theme.colors.brandGreen + '15',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.colors.brandGreen + '30',
                  }}
                >
                  <Text
                    weight="bold"
                    style={{
                      color: theme.colors.brandGreen,
                      fontSize: 14,
                    }}
                  >
                    {transactions.length}
                  </Text>
                </View>
              )}
            </Row>


          </View>

          {error && (
            <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
              <ModernErrorMessage message={error} />
            </View>
          )}

          {/* Transaction List */}
          <View style={{ paddingHorizontal: theme.spacing.md }}>
            {transactions.length === 0 ? (
              <Column align="center" justify="center" style={{ paddingVertical: theme.spacing.xl * 2 }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: theme.colors.neutral[100],
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: theme.spacing.xl,
                  }}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={48}
                    color={theme.colors.neutral[400]}
                  />
                </View>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    textAlign: 'center',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  No Transactions Yet
                </Heading>
                <Text
                  style={{
                    color: theme.colors.neutral[600],
                    textAlign: 'center',
                    fontSize: 16,
                    lineHeight: 24,
                    maxWidth: 280,
                  }}
                >
                  {hasActiveSubscription
                    ? "Your payment history will appear here as you make transactions."
                    : "Start your subscription journey to see your transaction history."
                  }
                </Text>
              </Column>
            ) : (
              <>
                <Text
                  weight="bold"
                  style={{
                    color: theme.colors.brandNavy,
                    fontSize: 16,
                    marginBottom: theme.spacing.lg,
                    marginTop: theme.spacing.md,
                  }}
                >
                  Recent Activity
                </Text>
                <FlatList
                  data={transactions}
                  renderItem={renderTransaction}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </View>

          {/* Bottom Padding for Floating Tab Bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
};

export default TransactionsPage;
