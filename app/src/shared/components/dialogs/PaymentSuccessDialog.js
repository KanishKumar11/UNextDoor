import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text, Heading, ModernButton, Row, Column, Spacer, ModernCard } from '../index';

const { width, height } = Dimensions.get('window');

const PaymentSuccessDialog = ({
  visible,
  onClose,
  planName = 'Subscription',
  amount = null,
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
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
              padding: theme.spacing.xl,
              alignItems: 'center',
              backgroundColor: theme.colors.brandWhite,
              borderRadius: 24,
              elevation: 20,
              shadowColor: theme.colors.brandNavy,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
            }}
          >
            {/* Success Icon with Animation */}
            <View style={{ position: 'relative', marginBottom: theme.spacing.lg }}>
              <Animated.View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.colors.brandGreen + '20',
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
                    color={theme.colors.brandGreen} 
                  />
                </Animated.View>
              </Animated.View>
              
              {renderConfetti()}
            </View>

            {/* Success Message */}
            <Heading 
              level="h2" 
              style={{ 
                color: theme.colors.brandNavy, 
                textAlign: 'center',
                marginBottom: theme.spacing.sm,
                fontFamily: theme.typography.fontFamily.bold,
              }}
            >
              Payment Successful! 🎉
            </Heading>

            <Text
              style={{
                color: theme.colors.neutral[600],
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: theme.spacing.md,
                fontFamily: theme.typography.fontFamily.regular,
              }}
            >
              {message}
            </Text>

            {/* Plan Details */}
            {(planName || amount) && (
              <View
                style={{
                  backgroundColor: theme.colors.brandGreen + '10',
                  borderRadius: 12,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                  width: '100%',
                }}
              >
                {planName && (
                  <Row justify="space-between" align="center" style={{ marginBottom: amount ? 8 : 0 }}>
                    <Text
                      style={{
                        color: theme.colors.neutral[700],
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
                      Plan:
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.semibold,
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
                        color: theme.colors.neutral[700],
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
                      Amount Paid:
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.brandGreen,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 16,
                      }}
                    >
                      ₹{amount}
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
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.medium,
                            fontSize: 13,
                            textDecorationLine: 'line-through',
                          }}
                        >
                          ₹{originalAmount}
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
                          color: theme.colors.success.main,
                          fontFamily: theme.typography.fontFamily.semibold,
                          fontSize: 13,
                        }}
                      >
                        -₹{prorationCredit}
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
                backgroundColor: theme.colors.brandGreen,
                borderRadius: 12,
              }}
              textStyle={{
                color: theme.colors.brandWhite,
                fontFamily: theme.typography.fontFamily.semibold,
              }}
            />
          </ModernCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default PaymentSuccessDialog;
