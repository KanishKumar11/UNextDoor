import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text, Heading, ModernButton, Row, Column, Spacer, ModernCard } from '../index';

const { width } = Dimensions.get('window');

const UpgradePreviewDialog = ({
  visible,
  targetPlan,
  currentPlan,
  originalPrice,
  prorationCredit,
  finalPrice,
  remainingDays,
  currency,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const { theme } = useTheme();

  const formatPrice = (amount) => {
    if (!currency) return `$${amount}`;
    return `${currency.symbol}${amount}`;
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
            width: Math.min(width - 32, 400),
            maxHeight: '80%',
            elevation: 10,
            shadowColor: theme.colors.brandNavy,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ padding: theme.spacing.lg }}>
              {/* Header */}
              <Row justify="space-between" align="flex-start" style={{ marginBottom: 20 }}>
                <Row align="center" style={{ flex: 1, marginRight: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: theme.colors.brandGreen + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="trending-up"
                      size={24}
                      color={theme.colors.brandGreen}
                    />
                  </View>
                  <Column style={{ flex: 1 }}>
                    <Heading
                      level="h3"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                        marginBottom: 4,
                      }}
                    >
                      Upgrade Preview
                    </Heading>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[600],
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
                      backgroundColor: theme.colors.neutral[100],
                      borderRadius: 16,
                      padding: 8,
                    }}
                  >
                    <Ionicons name="close" size={16} color={theme.colors.neutral[600]} />
                  </TouchableOpacity>
                )}
              </Row>

              {/* Plan Upgrade Summary */}
              <ModernCard
                style={{
                  backgroundColor: theme.colors.brandGreen + '10',
                  borderRadius: 16,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.brandGreen + '20',
                }}
              >
                <Row align="center" style={{ marginBottom: 12 }}>
                  <Ionicons
                    name="arrow-up-circle"
                    size={20}
                    color={theme.colors.brandGreen}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandGreen,
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
                        color: theme.colors.neutral[600],
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
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.semibold,
                        fontSize: 16,
                      }}
                    >
                      To: {targetPlan?.name || 'New Plan'}
                    </Text>
                  </Column>
                  
                  <View
                    style={{
                      backgroundColor: theme.colors.brandGreen,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      weight="semibold"
                      style={{
                        color: theme.colors.brandWhite,
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
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.neutral[200],
                }}
              >
                <Text
                  weight="semibold"
                  style={{
                    color: theme.colors.brandNavy,
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
                      color: theme.colors.neutral[700],
                      fontFamily: theme.typography.fontFamily.regular,
                      fontSize: 14,
                    }}
                  >
                    {targetPlan?.name} Plan Price:
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.neutral[700],
                      fontFamily: theme.typography.fontFamily.medium,
                      fontSize: 14,
                    }}
                  >
                    {formatPrice(originalPrice)}
                  </Text>
                </Row>

                {/* Proration Credit */}
                {prorationCredit > 0 && (
                  <Row justify="space-between" align="center" style={{ marginBottom: 12 }}>
                    <Column style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={{
                          color: theme.colors.success.main,
                          fontFamily: theme.typography.fontFamily.medium,
                          fontSize: 14,
                        }}
                      >
                        Proration Credit:
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: theme.colors.neutral[600],
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
                        color: theme.colors.success.main,
                        fontFamily: theme.typography.fontFamily.semibold,
                        fontSize: 14,
                      }}
                    >
                      -{formatPrice(prorationCredit)}
                    </Text>
                  </Row>
                )}

                {/* Divider */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.neutral[200],
                    marginVertical: 12,
                  }}
                />

                {/* Final Amount */}
                <Row justify="space-between" align="center">
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 16,
                    }}
                  >
                    Amount to Pay Today:
                  </Text>
                  <Text
                    weight="bold"
                    style={{
                      color: theme.colors.brandGreen,
                      fontFamily: theme.typography.fontFamily.bold,
                      fontSize: 18,
                    }}
                  >
                    {formatPrice(finalPrice)}
                  </Text>
                </Row>

                {/* Savings Highlight */}
                {prorationCredit > 0 && (
                  <View
                    style={{
                      backgroundColor: theme.colors.success.main + '10',
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 16,
                      borderWidth: 1,
                      borderColor: theme.colors.success.main + '20',
                    }}
                  >
                    <Row align="center">
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={theme.colors.success.main}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: theme.colors.success.main,
                          fontFamily: theme.typography.fontFamily.medium,
                          fontSize: 13,
                          flex: 1,
                        }}
                      >
                        You save {formatPrice(prorationCredit)} with this upgrade!
                      </Text>
                    </Row>
                  </View>
                )}
              </ModernCard>

              {/* Action Buttons */}
              <Row style={{ gap: 12 }}>
                <ModernButton
                  title="Cancel"
                  variant="outline"
                  onPress={onCancel}
                  disabled={loading}
                  style={{
                    flex: 1,
                    borderColor: theme.colors.neutral[300],
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingVertical: 14,
                  }}
                  textStyle={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                    fontSize: 15,
                  }}
                />
                
                <ModernButton
                  title={loading ? "Processing..." : "Proceed to Payment"}
                  variant="solid"
                  onPress={onConfirm}
                  disabled={loading}
                  style={{
                    flex: 2,
                    backgroundColor: theme.colors.brandGreen,
                    borderRadius: 12,
                    paddingVertical: 14,
                  }}
                  textStyle={{
                    color: theme.colors.brandWhite,
                    fontFamily: theme.typography.fontFamily.semibold,
                    fontSize: 15,
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
