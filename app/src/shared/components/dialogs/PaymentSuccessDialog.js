import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text, Heading, ModernButton, Row, Column, Spacer, ModernCard } from '../index';
import { BRAND_COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

// Helper function for cross-platform font families
const getFontFamily = (weight = 'regular') => {
  if (Platform.OS === 'web') {
    return 'Montserrat, sans-serif';
  }

  const fontMap = {
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extrabold: 'Montserrat-ExtraBold',
  };

  return fontMap[weight] || fontMap.regular;
};

const PaymentSuccessDialog = ({
  visible,
  onClose,
  planName = 'Subscription',
  amount = null,
  currency = 'INR', // Add currency prop
  currencySymbol = '₹', // Add currency symbol prop
  originalAmount = null,
  prorationCredit = 0,
  isUpgrade = false,
  previousPlan = null,
  message = 'Your subscription has been activated successfully!',
  showConfetti = true,
}) => {
  const { theme } = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      checkmarkAnim.setValue(0);
      confettiAnim.setValue(0);
      fadeAnim.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // Fade in backdrop
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale in dialog
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Animate checkmark
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        // Show confetti if enabled
        ...(showConfetti ? [
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ] : [])
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  const renderConfetti = () => {
    if (!showConfetti) return null;

    const confettiPieces = Array.from({ length: 12 }, (_, i) => {
      const randomDelay = Math.random() * 400;
      const randomX = (Math.random() - 0.5) * 200;
      const randomRotation = Math.random() * 360;

      return (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            width: 8,
            height: 8,
            backgroundColor: i % 3 === 0 ? theme.colors.brandGreen :
              i % 3 === 1 ? '#FFD700' : '#FF6B6B',
            borderRadius: 4,
            transform: [
              {
                translateX: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, randomX],
                })
              },
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150 + Math.random() * 100],
                })
              },
              {
                rotate: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${randomRotation}deg`],
                })
              }
            ],
            opacity: confettiAnim.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            })
          }}
        />
      );
    });

    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {confettiPieces}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: `${BRAND_COLORS.OCEAN_BLUE}99`, // Using brand navy with opacity
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: '100%',
            maxWidth: width * 0.9,
          }}
        >
          <ModernCard
            style={{
              padding: 32,
              alignItems: 'center',
              backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
              borderRadius: 16, // Consistent with design system
              elevation: 0, // Consistent with design system
              shadowColor: BRAND_COLORS.SHADOW_GREY,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
            }}
          >
            {/* Success Icon with Animation */}
            <View style={{ position: 'relative', marginBottom: 24 }}>
              <Animated.View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [
                    {
                      scale: checkmarkAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.2, 1],
                      })
                    }
                  ]
                }}
              >
                <Animated.View
                  style={{
                    opacity: checkmarkAnim,
                    transform: [
                      {
                        scale: checkmarkAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        })
                      }
                    ]
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={60}
                    color={BRAND_COLORS.EXPLORER_TEAL}
                  />
                </Animated.View>
              </Animated.View>

              {renderConfetti()}
            </View>

            {/* Success Message */}
            <Text
              style={{
                fontSize: 24,
                fontFamily: getFontFamily('bold'),
                color: BRAND_COLORS.OCEAN_BLUE,
                textAlign: 'center',
                marginBottom: 8,
                lineHeight: 32,
              }}
            >
              Payment Successful! 🎉
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: getFontFamily('regular'),
                color: BRAND_COLORS.SHADOW_GREY,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              {message}
            </Text>

            {/* Plan Details */}
            {(planName || amount) && (
              <View
                style={{
                  backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '15',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: BRAND_COLORS.EXPLORER_TEAL + '30',
                }}
              >
                {planName && (
                  <Row justify="space-between" align="center" style={{ marginBottom: amount ? 8 : 0 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('medium'),
                        color: BRAND_COLORS.SHADOW_GREY,
                      }}
                    >
                      Plan:
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: getFontFamily('semibold'),
                        color: BRAND_COLORS.OCEAN_BLUE,
                      }}
                    >
                      {planName}
                    </Text>
                  </Row>
                )}

                {amount && (
                  <Row justify="space-between" align="center" style={{ marginBottom: isUpgrade && prorationCredit > 0 ? 8 : 0 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('medium'),
                        color: BRAND_COLORS.SHADOW_GREY,
                      }}
                    >
                      Amount Paid:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: getFontFamily('bold'),
                        color: BRAND_COLORS.EXPLORER_TEAL,
                      }}
                    >
                      {currencySymbol}{amount}
                    </Text>
                  </Row>
                )}

                {/* Upgrade Information */}
                {isUpgrade && prorationCredit > 0 && (
                  <>
                    {originalAmount && originalAmount !== amount && (
                      <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
                        <Text
                          style={{
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.regular,
                            fontSize: 13,
                          }}
                        >
                          Original Price:
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: getFontFamily('medium'),
                            color: BRAND_COLORS.SHADOW_GREY,
                            textDecorationLine: 'line-through',
                          }}
                        >
                          {currencySymbol}{originalAmount}
                        </Text>
                      </Row>
                    )}

                    <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
                      <Text
                        style={{
                          color: theme.colors.success.main,
                          fontFamily: theme.typography.fontFamily.medium,
                          fontSize: 13,
                        }}
                      >
                        Proration Credit:
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: getFontFamily('semibold'),
                          color: BRAND_COLORS.EXPLORER_TEAL,
                        }}
                      >
                        -{currencySymbol}{prorationCredit}
                      </Text>
                    </Row>

                    {previousPlan && (
                      <View
                        style={{
                          backgroundColor: theme.colors.info.main + '10',
                          borderRadius: 8,
                          padding: 8,
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.info.main,
                            fontFamily: theme.typography.fontFamily.medium,
                            fontSize: 12,
                            textAlign: 'center',
                          }}
                        >
                          Upgraded from {previousPlan.planName || previousPlan.planId}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Action Button */}
            <ModernButton
              text="Continue"
              onPress={handleClose}
              variant="solid"
              style={{
                width: '100%',
                backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
                borderRadius: 16,
                elevation: 0,
                paddingVertical: 8
              }}
              textStyle={{
                fontSize: 16,
                fontFamily: getFontFamily('semibold'),
                color: BRAND_COLORS.WHISPER_WHITE,
              }}
            />
          </ModernCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default PaymentSuccessDialog;
