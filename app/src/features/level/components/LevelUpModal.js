import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Heading, ModernButton, Spacer } from '../../../shared/components';
import modernTheme from '../../../shared/styles/modernTheme';
import LottieView from 'lottie-react-native';

/**
 * LevelUpModal component
 * Displays a modal when the user levels up
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {number} props.level - New level
 * @param {string} props.levelName - Name of the new level
 * @param {string} props.levelDescription - Description of the new level
 * @param {Array} props.rewards - Rewards for the new level
 */
const LevelUpModal = ({
  visible = false,
  onClose,
  level = 1,
  levelName = 'Novice',
  levelDescription = 'Just starting your Korean language journey',
  rewards = [],
}) => {
  // Animation values
  const scaleAnim = new Animated.Value(0.5);
  const opacityAnim = new Animated.Value(0);
  
  // Start animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when modal is hidden
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Confetti animation */}
          <View style={styles.confettiContainer}>
            <LottieView
              source={require('../../../assets/animations/confetti.json')}
              autoPlay
              loop={false}
              style={styles.confetti}
            />
          </View>
          
          {/* Level up content */}
          <View style={styles.levelUpContent}>
            <Heading level="h2" align="center" style={styles.levelUpTitle}>
              Level Up!
            </Heading>
            
            <View style={styles.levelBadge}>
              <Text
                weight="bold"
                size="xl"
                align="center"
                style={styles.levelNumber}
              >
                {level}
              </Text>
            </View>
            
            <Heading level="h3" align="center">
              {levelName}
            </Heading>
            
            <Text align="center" color="neutral.600" style={styles.levelDescription}>
              {levelDescription}
            </Text>
            
            {rewards.length > 0 && (
              <>
                <Spacer size="md" />
                <Heading level="h4" align="center">
                  Rewards Unlocked
                </Heading>
                
                <View style={styles.rewardsContainer}>
                  {rewards.map((reward, index) => (
                    <View key={index} style={styles.rewardItem}>
                      <Ionicons
                        name={reward.icon || 'gift-outline'}
                        size={24}
                        color={modernTheme.colors.primary[500]}
                      />
                      <Text weight="semibold" style={styles.rewardName}>
                        {reward.name}
                      </Text>
                      <Text size="sm" color="neutral.600">
                        {reward.description}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            
            <Spacer size="lg" />
            
            <ModernButton
              text="Continue"
              onPress={onClose}
              style={styles.continueButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    overflow: 'hidden',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  confetti: {
    width: '100%',
    height: '100%',
  },
  levelUpContent: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  levelUpTitle: {
    marginBottom: 16,
    color: modernTheme.colors.primary[700],
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: modernTheme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelNumber: {
    color: modernTheme.colors.primary[700],
    fontSize: 32,
  },
  levelDescription: {
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsContainer: {
    width: '100%',
    marginTop: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: modernTheme.colors.neutral[50],
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardName: {
    marginLeft: 12,
    marginRight: 8,
  },
  continueButton: {
    minWidth: 150,
  },
});

export default LevelUpModal;
