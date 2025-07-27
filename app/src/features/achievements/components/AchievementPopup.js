import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {
  Text,
  Heading,
  ModernButton,
  ModernCard,
  Spacer,
} from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";
import { BRAND_COLORS } from "../../../shared/constants/colors";

const { width, height } = Dimensions.get("window");

/**
 * Get tier color based on achievement tier
 * @param {string} tier - Achievement tier (bronze, silver, gold)
 * @returns {string} Hex color code
 */
const getTierColor = (tier) => {
  switch (tier?.toLowerCase()) {
    case "bronze":
      return "#CD7F32";
    case "silver":
      return "#C0C0C0";
    case "gold":
      return "#FFD700";
    default:
      return BRAND_COLORS.EXPLORER_TEAL; // Default brand color
  }
};

/**
 * AchievementPopup Component
 * Shows a celebratory popup when user earns an achievement
 */
const AchievementPopup = ({
  visible,
  achievement,
  onClose,
  onShare,
  showShareButton = true,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      slideAnim.setValue(50);

      // Use setTimeout to avoid useInsertionEffect warning
      const animationTimeout = setTimeout(() => {
        // Start entrance animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]).start();

        // Play Lottie animation
        if (lottieRef.current) {
          lottieRef.current.play();
        }
      }, 50); // Small delay to avoid insertion effect warning

      return () => {
        clearTimeout(animationTimeout);
      };
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim]);

  const handleClose = () => {
    // Exit animation with timeout to avoid useInsertionEffect warning
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }, 10);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(achievement);
    }
  };

  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Lottie Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={lottieRef}
              source={require("../../../assets/animations/achievement-celebration.json")}
              style={styles.lottieAnimation}
              autoPlay={false}
              loop={false}
              speed={1.2}
            />
          </View>

          <ModernCard style={styles.card}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.neutral[600]}
              />
            </TouchableOpacity>

            {/* Achievement Icon */}
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  {
                    backgroundColor:
                      achievement.color || theme.colors.success[500],
                  },
                ]}
              >
                <Ionicons name="trophy" size={32} color="white" />
              </View>
            </View>

            <Spacer size="md" />

            {/* Achievement Details */}
            <View style={styles.content}>
              <Text
                variant="caption"
                weight="semibold"
                color="success.600"
                align="center"
                style={styles.congratsText}
              >
                🎉 ACHIEVEMENT UNLOCKED! 🎉
              </Text>

              <Spacer size="sm" />

              <Heading level="h3" align="center" style={styles.title}>
                {achievement.title}
              </Heading>

              <Spacer size="sm" />

              <Text
                color="neutral.700"
                align="center"
                style={styles.description}
              >
                {achievement.description}
              </Text>

              <Spacer size="md" />

              {/* 🎁 ENHANCED XP REWARD DISPLAY */}
              <View style={styles.xpContainer}>
                <View
                  style={[
                    styles.xpBadge,
                    { backgroundColor: theme.colors.warning[100] },
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={18}
                    color={theme.colors.warning[600]}
                  />
                  <Text
                    weight="bold"
                    color="warning.700"
                    style={[styles.xpText, { fontSize: 16 }]}
                  >
                    +{achievement.xpReward} XP Earned!
                  </Text>
                </View>

                {/* 🏆 TIER BADGE */}
                {achievement.tier && (
                  <View
                    style={[
                      styles.tierBadge,
                      {
                        backgroundColor: getTierColor(achievement.tier),
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      color="white"
                      weight="bold"
                      style={{ textTransform: "uppercase", letterSpacing: 1 }}
                    >
                      {achievement.tier} Achievement
                    </Text>
                  </View>
                )}
              </View>

              <Spacer size="lg" />

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {showShareButton && (
                  <ModernButton
                    text="Share"
                    variant="outline"
                    size="md"
                    onPress={handleShare}
                    style={[styles.button, styles.shareButton]}
                    icon="share-outline"
                  />
                )}
                <ModernButton
                  text="Continue"
                  variant="solid"
                  size="md"
                  onPress={handleClose}
                  style={[
                    styles.button,
                    styles.continueButton,
                    { backgroundColor: theme.colors.primary[500] },
                  ]}
                />
              </View>
            </View>
          </ModernCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    alignItems: "center",
  },
  animationContainer: {
    position: "absolute",
    top: -60,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 10,
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
  card: {
    width: "100%",
    paddingTop: 80, // Space for animation
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderRadius: 20,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  iconContainer: {
    alignItems: "center",
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: "center",
  },
  congratsText: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
  },
  xpContainer: {
    alignItems: "center",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpText: {
    marginLeft: 4,
    fontSize: 14,
  },
  tierBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
  },
  shareButton: {
    marginRight: 6,
  },
  continueButton: {
    marginLeft: 6,
  },
});

export default AchievementPopup;
