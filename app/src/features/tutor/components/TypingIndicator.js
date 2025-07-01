import React, { useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Text } from "@gluestack-ui/themed";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import modernTheme from "../../../shared/styles/modernTheme";

/**
 * TypingIndicator component
 * Shows an animated indicator when the AI is typing
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the indicator should be visible
 * @param {Object} props.style - Additional styles to apply
 */
const TypingIndicator = ({ isVisible, style }) => {
  // Animation values for each dot
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  // Start animations when component is visible
  useEffect(() => {
    if (isVisible) {
      // Animate first dot
      dot1Opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.ease }),
          withTiming(0.3, { duration: 400, easing: Easing.ease })
        ),
        -1, // Infinite repeat
        false // Don't reverse
      );

      // Animate second dot with delay
      dot2Opacity.value = withDelay(
        150,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.ease }),
            withTiming(0.3, { duration: 400, easing: Easing.ease })
          ),
          -1, // Infinite repeat
          false // Don't reverse
        )
      );

      // Animate third dot with more delay
      dot3Opacity.value = withDelay(
        300,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.ease }),
            withTiming(0.3, { duration: 400, easing: Easing.ease })
          ),
          -1, // Infinite repeat
          false // Don't reverse
        )
      );
    } else {
      // Reset animations when not visible
      dot1Opacity.value = withTiming(0.3);
      dot2Opacity.value = withTiming(0.3);
      dot3Opacity.value = withTiming(0.3);
    }
  }, [isVisible]);

  // Animated styles for each dot
  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
    transform: [{ scale: 0.8 + dot1Opacity.value * 0.2 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
    transform: [{ scale: 0.8 + dot2Opacity.value * 0.2 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
    transform: [{ scale: 0.8 + dot3Opacity.value * 0.2 }],
  }));

  // If not visible, don't render
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.container, style]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>AI is thinking</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingVertical: modernTheme.spacing.sm,
    alignItems: "flex-start",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: modernTheme.colors.background.paper,
    paddingHorizontal: modernTheme.spacing.md,
    paddingVertical: modernTheme.spacing.sm,
    borderRadius: modernTheme.borderRadius.full,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  text: {
    fontSize: modernTheme.typography.fontSize.sm,
    color: modernTheme.colors.text.secondary,
    marginRight: modernTheme.spacing.xs,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: modernTheme.colors.primary[500],
    marginHorizontal: 2,
  },
});

export default TypingIndicator;
