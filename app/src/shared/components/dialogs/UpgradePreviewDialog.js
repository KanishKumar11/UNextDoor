import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_COLORS } from '../../constants/colors';
import { Text, Heading, ModernButton, Row, Column, Spacer, ModernCard } from '../index';

const { width } = Dimensions.get('window');

const UpgradePreviewDialog = ({
  visible,
  targetPlan,
  currentPlan,
  originalPrice,
  prorationCredit, // Now expects dual-value object: {INR: 166, USD: 1.99}
  finalPrice,
  remainingDays,
  currency,
  onConfirm,
  onCancel,
  onCurrencyChange, // New callback for currency changes
  loading = false,
}) => {
  const { theme } = useTheme();
  const previousCurrencyRef = useRef(currency);

  // Get proration credit value for current currency from dual-value object
  const getCurrentProrationCredit = () => {
    if (!prorationCredit || typeof prorationCredit !== 'object') {
      // Fallback for old single-value format
      return prorationCredit || 0;
    }

    const currentCurrencyCode = currency?.code || currency;

    if (currentCurrencyCode === 'USD' && prorationCredit.USD !== undefined) {
      return prorationCredit.USD;
    } else if (currentCurrencyCode === 'INR' && prorationCredit.INR !== undefined) {
      return prorationCredit.INR;
    }

    // Fallback to INR if currency not found
    return prorationCredit.INR || prorationCredit.USD || 0;
  };

  const currentProrationCredit = getCurrentProrationCredit();

  // Detect currency changes for dual-value proration credit
  useEffect(() => {
    const currentCurrencyCode = currency?.code || currency;
    const previousCurrencyCode = previousCurrencyRef.current?.code || previousCurrencyRef.current;

    // Only log if dialog is visible and currency actually changed
    if (visible && currentCurrencyCode && previousCurrencyCode &&
      currentCurrencyCode !== previousCurrencyCode) {

      console.log('💰 Currency changed in UpgradePreviewDialog (dual-value):', {
        from: previousCurrencyCode,
        to: currentCurrencyCode,
        targetPlan: targetPlan?.id,
        prorationCreditDualValue: prorationCredit,
        selectedProrationCredit: getCurrentProrationCredit(),
        note: 'Using dual-value approach - no API call needed'
      });

      // No need to trigger API call - we have both currency values already
      // The component will re-render automatically with the correct proration credit
    }

    // Update the ref for next comparison
    previousCurrencyRef.current = currency;
  }, [currency, visible, targetPlan?.id, prorationCredit]);

  const formatPrice = (amount) => {
    // Handle null/undefined amounts
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currency && typeof currency === 'object' && currency.symbol
        ? `${currency.symbol}0.00`
        : currency && typeof currency === 'string' && currency === 'INR'
          ? '₹0.00'
          : '$0.00';
    }

    // Handle different currency formats
    if (currency) {
      // If currency is an object with symbol property
      if (typeof currency === 'object' && currency.symbol) {
        return `${currency.symbol}${Number(amount).toFixed(2)}`;
      }
      // If currency is a string (INR/USD)
      if (typeof currency === 'string') {
        const symbol = currency === 'INR' ? '₹' : '$';
        return `${symbol}${Number(amount).toFixed(2)}`;
      }
    }

    // Default fallback
    return `$${Number(amount).toFixed(2)}`;
  };

  const handleBackdropPress = () => {
    if (!loading) {
      onCancel();
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
          backgroundColor: BRAND_COLORS.OCEAN_BLUE + '80', // Modern overlay with brand color
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
            backgroundColor: BRAND_COLORS.WHISPER_WHITE,
            borderRadius: 16, // Consistent with app design system
            width: Math.min(width - 32, 400),
            maxHeight: '85%', // Slightly more space
            elevation: 0, // Modern flat design
            shadowColor: BRAND_COLORS.OCEAN_BLUE,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04, // Subtle shadow
            shadowRadius: 8,
            overflow: 'hidden', // Prevent content overflow
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xl, // Extra bottom padding
            }}>
              {/* Header */}
              <Row justify="space-between" align="flex-start" style={{ marginBottom: 20 }}>
                <Row align="center" style={{ flex: 1, marginRight: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="trending-up"
                      size={24}
                      color={BRAND_COLORS.EXPLORER_TEAL}
                    />
                  </View>
                  <Column style={{ flex: 1 }}>
                    <Heading
                      level="h3"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontFamily: theme.typography.fontFamily.bold,
                        marginBottom: 4,
                      }}
                    >
                      Upgrade Preview
                    </Heading>
                    <Text
                      variant="caption"
                      style={{
                        color: BRAND_COLORS.SHADOW_GREY,
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      Review your upgrade details
                    </Text>
                  </Column>
                </Row>

                {!loading && (
                  <TouchableOpacity
                    onPress={onCancel}
                    style={{
                      backgroundColor: BRAND_COLORS.SHADOW_GREY + '10',
                      borderRadius: 16,
                      padding: 8,
                    }}
                  >
                    <Ionicons name="close" size={16} color={BRAND_COLORS.SHADOW_GREY} />
                  </TouchableOpacity>
                )}
              </Row>

              {/* Plan Upgrade Summary */}
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '10',
                  borderRadius: 16,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: BRAND_COLORS.EXPLORER_TEAL + '20',
                }}
              >
                <Row align="center" style={{ marginBottom: 12 }}>
                  <Ionicons
                    name="arrow-up-circle"
                    size={20}
                    color={BRAND_COLORS.EXPLORER_TEAL}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    weight="semibold"
                    style={{
                      color: BRAND_COLORS.EXPLORER_TEAL,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 16,
                    }}
                  >
                    Upgrading Your Plan
                  </Text>
                </Row>

                <Row justify="space-between" align="center">
                  <Column style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: BRAND_COLORS.SHADOW_GREY,
                        fontFamily: theme.typography.fontFamily.regular,
                        fontSize: 14,
                        marginBottom: 4,
                      }}
                    >
                      From: {currentPlan?.name || 'Current Plan'}
                    </Text>
                    <Text
                      weight="semibold"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontFamily: theme.typography.fontFamily.semibold,
                        fontSize: 16,
                      }}
                    >
                      To: {targetPlan?.name || 'New Plan'}
                    </Text>
                  </Column>

                  <View
                    style={{
                      backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      weight="semibold"
                      style={{
                        color: BRAND_COLORS.WHISPER_WHITE,
                        fontFamily: theme.typography.fontFamily.semibold,
                        fontSize: 12,
                      }}
                    >
                      UPGRADE
                    </Text>
                  </View>
                </Row>
              </ModernCard>

              {/* Pricing Breakdown */}
              <ModernCard
                style={{
                  backgroundColor: BRAND_COLORS.WHISPER_WHITE,
                  borderRadius: 16,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: BRAND_COLORS.SHADOW_GREY + '20',
                }}
              >
                <Text
                  weight="semibold"
                  style={{
                    color: BRAND_COLORS.OCEAN_BLUE,
                    fontFamily: theme.typography.fontFamily.semibold,
                    fontSize: 16,
                    marginBottom: 16,
                  }}
                >
                  Pricing Breakdown
                </Text>

                {/* Original Price */}
                <Row justify="space-between" align="center" style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      color: BRAND_COLORS.SHADOW_GREY,
                      fontFamily: theme.typography.fontFamily.regular,
                      fontSize: 14,
                    }}
                  >
                    {targetPlan?.name} Plan Price:
                  </Text>
                  <Text
                    style={{
                      color: BRAND_COLORS.SHADOW_GREY,
                      fontFamily: theme.typography.fontFamily.medium,
                      fontSize: 14,
                    }}
                  >
                    {formatPrice(originalPrice)}
                  </Text>
                </Row>

                {/* Proration Credit */}
                {getCurrentProrationCredit() > 0 && (
                  <Row justify="space-between" align="center" style={{ marginBottom: 12 }}>
                    <Column style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={{
                          color: BRAND_COLORS.EXPLORER_TEAL,
                          fontFamily: theme.typography.fontFamily.medium,
                          fontSize: 14,
                        }}
                      >
                        Proration Credit:
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: BRAND_COLORS.SHADOW_GREY,
                          fontFamily: theme.typography.fontFamily.regular,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {remainingDays} days remaining
                      </Text>
                    </Column>
                    <Text
                      style={{
                        color: BRAND_COLORS.EXPLORER_TEAL,
                        fontFamily: theme.typography.fontFamily.semibold,
                        fontSize: 14,
                      }}
                    >
                      -{formatPrice(getCurrentProrationCredit())}
                    </Text>
                  </Row>
                )}

                {/* Divider */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: BRAND_COLORS.SHADOW_GREY + '20',
                    marginVertical: 12,
                  }}
                />

                {/* Final Amount */}
                <Row justify="space-between" align="center">
                  <Text
                    weight="semibold"
                    style={{
                      color: BRAND_COLORS.OCEAN_BLUE,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 16,
                    }}
                  >
                    Amount to Pay Today:
                  </Text>
                  <Text
                    weight="bold"
                    style={{
                      color: BRAND_COLORS.EXPLORER_TEAL,
                      fontFamily: theme.typography.fontFamily.bold,
                      fontSize: 18,
                    }}
                  >
                    {formatPrice(finalPrice)}
                  </Text>
                </Row>

                {/* Savings Highlight */}
                {getCurrentProrationCredit() > 0 && (
                  <View
                    style={{
                      backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '10',
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 16,
                      borderWidth: 1,
                      borderColor: BRAND_COLORS.EXPLORER_TEAL + '20',
                    }}
                  >
                    <Row align="center">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={BRAND_COLORS.EXPLORER_TEAL}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: BRAND_COLORS.EXPLORER_TEAL,
                          fontFamily: theme.typography.fontFamily.medium,
                          fontSize: 12,
                          flex: 1,
                          marginLeft: -14,
                          flexWrap: 'wrap',
                        }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        You save {formatPrice(getCurrentProrationCredit())} with this upgrade!
                      </Text>
                    </Row>
                  </View>
                )}
              </ModernCard>

              {/* Action Buttons */}
              <Row style={{ gap: 12 }}>
                <ModernButton
                  text="Cancel"
                  variant="outline"
                  onPress={onCancel}
                  disabled={loading}
                  style={{
                    flex: 1,
                    borderColor: BRAND_COLORS.SHADOW_GREY + '30',
                    borderWidth: 1,
                    borderRadius: 16, // Consistent with app design
                    paddingVertical: 14,
                  }}
                  textStyle={{
                    color: BRAND_COLORS.SHADOW_GREY,
                    fontFamily: theme.typography.fontFamily.medium,
                    fontSize: 15,
                  }}
                />

                <ModernButton
                  text={loading ? "Processing..." : "Conitnue"}
                  variant="solid"
                  onPress={onConfirm}
                  disabled={loading}
                  style={{
                    flex: 2,
                    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
                    borderRadius: 16, // Consistent with app design
                    paddingVertical: 14,
                    minHeight: 48, // Ensure minimum height for text
                  }}
                  textStyle={{
                    color: BRAND_COLORS.WHISPER_WHITE,
                    fontFamily: theme.typography.fontFamily.semibold,
                    fontSize: 15,
                    textAlign: 'center',
                    flexWrap: 'wrap',
                  }}
                />
              </Row>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default UpgradePreviewDialog;
