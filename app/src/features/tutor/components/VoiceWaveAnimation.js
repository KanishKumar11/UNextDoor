import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
} from "react-native-reanimated";

/**
 * VoiceWaveAnimation component
 * Displays an animated voice wave visualization based on active speaking state
 *
 * @param {Object} props
 * @param {boolean} props.isActive - Whether the animation is active (speaking)
 * @param {number} props.barCount - Number of bars to display (default: 7)
 * @param {string} props.activeColor - Color of the bars when active (default: primary color)
 * @param {string} props.inactiveColor - Color of the bars when inactive (default: gray)
 * @param {Object} props.style - Additional styles for the container
 */
const VoiceWaveAnimation = ({
  isActive = false,
  barCount = 7,
  activeColor = "#4361EE",
  inactiveColor = "#D1D5DB",
  style,
}) => {
  // Animation progress value for color interpolation
  const colorProgress = useSharedValue(0);

  // Store calculated levels for each bar
  const [barLevels, setBarLevels] = useState([]);

  // Create an array of animated values for each bar with different base heights
  const barValues = Array.from({ length: barCount }).map(() =>
    useSharedValue(0.2)
  );

  // Generate a distribution pattern for bars - taller in middle, shorter on edges
  useEffect(() => {
    const calculateBarDistribution = () => {
      return Array.from({ length: barCount }, (_, i) => {
        // Create bell curve distribution with middle bars being more responsive
        const position = i / (barCount - 1);
        const bellCurve = Math.exp(-Math.pow((position - 0.5) * 2.5, 2));
        return 0.7 + bellCurve * 0.3; // Scale between 0.7 and 1
      });
    };

    setBarLevels(calculateBarDistribution());
  }, [barCount]);

  // Handle active/inactive state transitions
  useEffect(() => {
    // Animate color transition
    colorProgress.value = withTiming(isActive ? 1 : 0, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });

    // Animation function for active bars
    const animateBars = () => {
      if (!isActive) return;

      barValues.forEach((bar, index) => {
        const distributionFactor = barLevels[index] || 0.7;

        // Calculate a random target height with natural variation
        const baseHeight = 0.4 + distributionFactor * 0.4; // Base height between 0.4 and 0.8
        const randomVariance = Math.random() * 0.3 - 0.15; // Random variation between -0.15 and 0.15
        const targetHeight = Math.max(
          0.2,
          Math.min(0.9, baseHeight + randomVariance)
        );

        // Animate to the new height
        bar.value = withSequence(
          withTiming(targetHeight, {
            duration: 200 + Math.random() * 300, // Random duration for natural effect
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          withTiming(baseHeight - 0.1, {
            duration: 200 + Math.random() * 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        );
      });

      // Continue animation loop if still active
      if (isActive) {
        setTimeout(animateBars, 500);
      }
    };

    if (isActive) {
      // Start the animation for active state
      animateBars();
    } else {
      // Reset all bars to inactive state with a smooth transition
      barValues.forEach((bar, index) => {
        const delay = index * 30; // Stagger the reset for a wave-out effect
        bar.value = withTiming(0.2 + (index % 2) * 0.05, {
          duration: 400 + delay,
        });
      });
    }

    // Cleanup function
    return () => {
      // No specific cleanup needed
    };
  }, [isActive, barLevels, barValues]);

  // Create animated styles for each bar with color interpolation
  const barStyles = barValues.map((value) =>
    useAnimatedStyle(() => {
      return {
        height: `${20 + value.value * 80}%`, // Height between 20% and 100%
        opacity: 0.4 + value.value * 0.6, // Opacity between 0.4 and 1
        backgroundColor: interpolateColor(
          colorProgress.value,
          [0, 1],
          [inactiveColor, activeColor]
        ),
        transform: [
          { scaleY: 0.9 + value.value * 0.1 }, // Subtle scaling effect
        ],
      };
    })
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.waveContainer}>
        {barStyles.map((animatedStyle, index) => (
          <Animated.View
            key={index}
            style={[styles.bar, animatedStyle]}
            accessibilityLabel={`Voice wave bar ${index + 1} of ${barCount}`}
          />
        ))}
      </View>

      {/* Optional label for accessibility */}
      {isActive && (
        <View
          style={styles.accessibilityContainer}
          accessibilityLiveRegion="polite"
        >
          <View
            style={{ width: 1, height: 1, opacity: 0 }}
            accessibilityLabel={
              isActive ? "Voice is active" : "Voice is inactive"
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: "100%",
    overflow: "hidden",
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  bar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
  },
  accessibilityContainer: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default VoiceWaveAnimation;
