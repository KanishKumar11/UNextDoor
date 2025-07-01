import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Platform, Pressable } from "react-native";
import { Text } from "@gluestack-ui/themed";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  interpolateColor,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../../../shared/styles/modernTheme";
import VoiceWaveAnimation from "./VoiceWaveAnimation";

/**
 * TranscriptDisplay component
 * Displays real-time speech transcription with enhanced animations and visual feedback
 *
 * @param {Object} props - Component props
 * @param {string} props.transcript - The current transcript text
 * @param {boolean} props.isFinal - Whether this is the final transcript
 * @param {boolean} props.isVisible - Whether the component should be visible
 * @param {number} props.confidence - Speech recognition confidence (0-1)
 * @param {Function} props.onDismiss - Callback when transcript is dismissed
 * @param {Object} props.style - Additional styles to apply
 */
const TranscriptDisplay = ({
  transcript,
  isFinal = false,
  isVisible = true,
  confidence = 0.8,
  onDismiss,
  style,
}) => {
  // Local state
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Animation values
  const pulseAnim = useSharedValue(1);
  const dotOpacity = useSharedValue(1);
  const confidenceAnim = useSharedValue(confidence);
  const backgroundAnim = useSharedValue(0);

  // Update confidence animation when confidence changes
  useEffect(() => {
    confidenceAnim.value = withTiming(confidence, { duration: 500 });
  }, [confidence]);

  // Start animations when component mounts or visibility changes
  useEffect(() => {
    if (isVisible && !isFinal) {
      // Reset dismissed state when becoming visible
      setDismissed(false);

      // Pulse animation for container
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.02, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      );

      // Dots animation
      dotOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      );

      // Background animation
      backgroundAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        true
      );
    } else if (isFinal) {
      // Final transcript animations
      pulseAnim.value = withSequence(
        withTiming(1.05, { duration: 200 }),
        withTiming(1, { duration: 300 })
      );

      dotOpacity.value = withTiming(0, { duration: 300 });
      backgroundAnim.value = withTiming(0.5, { duration: 500 });
    } else {
      // Reset animations when not visible
      pulseAnim.value = withTiming(1);
      dotOpacity.value = withTiming(1);
      backgroundAnim.value = withTiming(0);
    }
  }, [isVisible, isFinal]);

  // Handle dismiss
  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);

    // Animate pulse when toggling
    pulseAnim.value = withSequence(
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 200 })
    );
  };

  // Animated styles
  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    backgroundColor: interpolateColor(
      backgroundAnim.value,
      [0, 0.5, 1],
      [
        modernTheme.colors.background.paper,
        isFinal
          ? modernTheme.colors.success.light + "20" // 12% opacity
          : modernTheme.colors.primary[100] + "20", // 12% opacity
        modernTheme.colors.primary[100] + "30", // 18% opacity
      ]
    ),
  }));

  const dotAnimStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const confidenceBarStyle = useAnimatedStyle(() => ({
    width: `${confidenceAnim.value * 100}%`,
    backgroundColor: interpolateColor(
      confidenceAnim.value,
      [0, 0.5, 0.8, 1],
      [
        modernTheme.colors.error.main,
        modernTheme.colors.warning.main,
        modernTheme.colors.success.main,
        modernTheme.colors.success.dark,
      ]
    ),
  }));

  // If there's no transcript, component is not visible, or was dismissed, don't render
  if (!transcript || !isVisible || dismissed) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInDown.duration(400).springify()}
      exiting={SlideOutDown.duration(300)}
      style={[styles.container, style]}
    >
      <Pressable
        onPress={toggleExpanded}
        accessibilityLabel={`Transcript: ${transcript}`}
        accessibilityHint={expanded ? "Tap to collapse" : "Tap to expand"}
        accessibilityRole="button"
      >
        <Animated.View style={[styles.transcriptContainer, containerAnimStyle]}>
          {/* Header with icon and dismiss button */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={isFinal ? "checkmark-circle" : "mic"}
                size={20}
                color={
                  isFinal
                    ? modernTheme.colors.success.main
                    : modernTheme.colors.primary[500]
                }
              />

              {!isFinal && <View style={styles.pulseRing} />}
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
                {isFinal ? "Transcript" : "Listening..."}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              accessibilityLabel="Dismiss transcript"
              accessibilityRole="button"
            >
              <Ionicons
                name="close"
                size={16}
                color={modernTheme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Confidence bar */}
          <View style={styles.confidenceBarContainer}>
            <Animated.View style={[styles.confidenceBar, confidenceBarStyle]} />
          </View>

          {/* Transcript text */}
          <View style={styles.textContainer}>
            <Text
              style={[styles.transcriptText, expanded && styles.expandedText]}
              numberOfLines={expanded ? 0 : 3}
            >
              {transcript}
            </Text>

            {/* Listening indicator */}
            {!isFinal && (
              <View style={styles.indicatorRow}>
                <Animated.View
                  style={[styles.listeningIndicator, dotAnimStyle]}
                >
                  <Text style={styles.listeningText}>Listening</Text>
                  <View style={styles.dots}>
                    <Animated.Text style={[styles.dot, dotAnimStyle]}>
                      .
                    </Animated.Text>
                    <Animated.Text
                      style={[
                        styles.dot,
                        dotAnimStyle,
                        { opacity: dotOpacity.value * 0.8 },
                      ]}
                    >
                      .
                    </Animated.Text>
                    <Animated.Text
                      style={[
                        styles.dot,
                        dotAnimStyle,
                        { opacity: dotOpacity.value * 0.6 },
                      ]}
                    >
                      .
                    </Animated.Text>
                  </View>
                </Animated.View>

                <VoiceWaveAnimation
                  isActive={true}
                  barCount={3}
                  activeColor={modernTheme.colors.primary[500]}
                  style={styles.waveAnimation}
                />
              </View>
            )}

            {/* Expand/collapse indicator */}
            {transcript.length > 100 && (
              <View style={styles.expandIndicator}>
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={modernTheme.colors.text.secondary}
                />
                <Text style={styles.expandText}>
                  {expanded ? "Show less" : "Show more"}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingVertical: modernTheme.spacing.sm,
    marginBottom: modernTheme.spacing.md,
  },
  transcriptContainer: {
    backgroundColor: modernTheme.colors.background.paper,
    borderRadius: modernTheme.borderRadius.lg,
    padding: modernTheme.spacing.md,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: modernTheme.spacing.sm,
  },
  iconContainer: {
    marginRight: modernTheme.spacing.sm,
    position: "relative",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: modernTheme.colors.primary[500] + "20",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: modernTheme.typography.fontSize.sm,
    fontWeight: "600",
    color: modernTheme.colors.text.secondary,
  },
  dismissButton: {
    padding: modernTheme.spacing.xs,
    borderRadius: modernTheme.borderRadius.full,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  // Confidence bar styles
  confidenceBarContainer: {
    height: 3,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: modernTheme.borderRadius.full,
    marginBottom: modernTheme.spacing.sm,
    overflow: "hidden",
  },
  confidenceBar: {
    height: "100%",
    borderRadius: modernTheme.borderRadius.full,
  },
  // Text container styles
  textContainer: {
    flex: 1,
  },
  transcriptText: {
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.text.primary,
    lineHeight:
      modernTheme.typography.lineHeight.md * modernTheme.typography.fontSize.md,
  },
  expandedText: {
    marginBottom: modernTheme.spacing.sm,
  },
  // Listening indicator styles
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: modernTheme.spacing.sm,
  },
  listeningIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  listeningText: {
    fontSize: modernTheme.typography.fontSize.xs,
    color: modernTheme.colors.text.secondary,
  },
  dots: {
    flexDirection: "row",
  },
  dot: {
    fontSize: modernTheme.typography.fontSize.lg,
    color: modernTheme.colors.primary[500],
    marginLeft: -2,
    fontWeight: "bold",
  },
  waveAnimation: {
    height: 20,
    width: 40,
  },
  // Expand indicator styles
  expandIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: modernTheme.spacing.xs,
  },
  expandText: {
    fontSize: modernTheme.typography.fontSize.xs,
    color: modernTheme.colors.text.secondary,
    marginLeft: modernTheme.spacing.xs,
  },
});

export default TranscriptDisplay;
