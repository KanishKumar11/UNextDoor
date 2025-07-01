import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Pressable } from "react-native";
import { Text, Box } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInRight,
  FadeInLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import modernTheme from "../../../shared/styles/modernTheme";
import AudioResponsePlayer from "./AudioResponsePlayer";
import VoiceWaveAnimation from "./VoiceWaveAnimation";

/**
 * MessageBubble component
 * A reusable component for displaying chat messages with enhanced animations and visual feedback
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Message text content
 * @param {string} props.sender - Message sender ('user' or 'assistant')
 * @param {Date} props.timestamp - Message timestamp
 * @param {string} props.audioUrl - Optional URL to audio recording
 * @param {Function} props.onPlayAudio - Function to call when play audio button is pressed
 * @param {boolean} props.isNew - Whether this is a new message (for highlighting)
 * @param {boolean} props.isTyping - Whether the message is currently being typed
 * @param {Object} props.style - Additional styles to apply
 */
const MessageBubble = ({
  text,
  sender,
  timestamp,
  audioUrl,
  onPlayAudio,
  isNew = false,
  isTyping = false,
  style,
}) => {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const isUser = sender === "user";

  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Animation values
  const highlightOpacity = useSharedValue(isNew ? 1 : 0);
  const bubbleScale = useSharedValue(1);
  const audioIconOpacity = useSharedValue(audioUrl ? 1 : 0);

  // Handle new message highlight effect
  useEffect(() => {
    if (isNew) {
      highlightOpacity.value = withSequence(
        withTiming(0.8, { duration: 300 }),
        withDelay(
          500,
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        )
      );
    }

    // Animate audio icon if present
    if (audioUrl) {
      audioIconOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    }
  }, [isNew, audioUrl]);

  // Toggle audio player visibility
  const toggleAudioPlayer = () => {
    // Animate scale when toggling
    bubbleScale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );

    setShowAudioPlayer(!showAudioPlayer);
  };

  // Handle long press
  const handleLongPress = () => {
    setIsLongPressed(true);
    bubbleScale.value = withSequence(
      withTiming(0.95, { duration: 200 }),
      withTiming(1, { duration: 300 })
    );

    // Reset after a delay
    setTimeout(() => {
      setIsLongPressed(false);
    }, 1500);
  };

  // Animated styles
  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlightOpacity.value,
  }));

  const bubbleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const audioIconStyle = useAnimatedStyle(() => ({
    opacity: audioIconOpacity.value,
    transform: [{ scale: 0.8 + audioIconOpacity.value * 0.2 }],
  }));

  // Determine entrance animation based on sender
  const enterAnimation = isUser ? FadeInRight : FadeInLeft;

  return (
    <Animated.View
      entering={enterAnimation.duration(300).springify()}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        style,
      ]}
    >
      {/* Highlight effect for new messages */}
      {isNew && (
        <Animated.View
          style={[
            styles.highlightEffect,
            isUser ? styles.userHighlight : styles.assistantHighlight,
            highlightStyle,
          ]}
        />
      )}

      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={500}
        accessibilityLabel={`Message from ${
          isUser ? "you" : "assistant"
        }: ${text}`}
        accessibilityHint={
          audioUrl
            ? "Long press to see options, tap audio icon to play"
            : "Long press to see options"
        }
      >
        <Animated.View style={bubbleAnimStyle}>
          <Box
            bg={
              isUser
                ? modernTheme.colors.primary[500]
                : modernTheme.colors.background.paper
            }
            p={modernTheme.spacing.md}
            borderRadius={modernTheme.borderRadius.lg}
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.assistantBubble,
              isLongPressed && styles.bubbleLongPressed,
            ]}
          >
            {/* Typing indicator */}
            {isTyping ? (
              <View style={styles.typingContainer}>
                <Text
                  color={
                    isUser
                      ? modernTheme.colors.text.white
                      : modernTheme.colors.text.primary
                  }
                  fontSize={modernTheme.typography.fontSize.md}
                  style={styles.typingText}
                >
                  {text || "Typing"}
                </Text>
                <VoiceWaveAnimation
                  isActive={true}
                  barCount={3}
                  activeColor={
                    isUser
                      ? modernTheme.colors.text.white
                      : modernTheme.colors.primary[500]
                  }
                  style={styles.typingAnimation}
                />
              </View>
            ) : (
              <Text
                color={
                  isUser
                    ? modernTheme.colors.text.white
                    : modernTheme.colors.text.primary
                }
                fontSize={modernTheme.typography.fontSize.md}
                style={styles.messageText}
              >
                {text}
              </Text>
            )}

            {/* Audio button */}
            {audioUrl && !showAudioPlayer && (
              <Animated.View style={audioIconStyle}>
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={toggleAudioPlayer}
                  activeOpacity={0.7}
                  accessibilityLabel="Play audio message"
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="volume-medium-outline"
                    size={20}
                    color={
                      isUser
                        ? modernTheme.colors.text.white
                        : modernTheme.colors.primary[500]
                    }
                  />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Audio player */}
            {audioUrl && showAudioPlayer && (
              <View style={styles.audioPlayerContainer}>
                <AudioResponsePlayer
                  audioUrl={audioUrl}
                  autoPlay={true}
                  onPlaybackStatusUpdate={(status) => {
                    // When playback finishes, hide the player
                    if (status.didJustFinish) {
                      setShowAudioPlayer(false);
                    }
                  }}
                />
              </View>
            )}

            {/* Timestamp */}
            <Text
              color={
                isUser
                  ? modernTheme.colors.primary[100]
                  : modernTheme.colors.text.secondary
              }
              fontSize={modernTheme.typography.fontSize.xs}
              style={styles.timestamp}
            >
              {formattedTime}
            </Text>
          </Box>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: "85%",
    marginBottom: modernTheme.spacing.md,
    position: "relative",
  },
  userContainer: {
    alignSelf: "flex-end",
    marginLeft: 50,
  },
  assistantContainer: {
    alignSelf: "flex-start",
    marginRight: 50,
  },
  bubble: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    borderTopRightRadius: modernTheme.borderRadius.xs,
  },
  assistantBubble: {
    borderTopLeftRadius: modernTheme.borderRadius.xs,
  },
  bubbleLongPressed: {
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  messageText: {
    lineHeight:
      modernTheme.typography.lineHeight.md * modernTheme.typography.fontSize.md,
  },
  audioButton: {
    marginTop: modernTheme.spacing.sm,
    alignSelf: "flex-end",
    padding: modernTheme.spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: modernTheme.borderRadius.full,
  },
  timestamp: {
    alignSelf: "flex-end",
    marginTop: modernTheme.spacing.xs,
    opacity: 0.8,
  },
  audioPlayerContainer: {
    marginTop: modernTheme.spacing.sm,
    marginBottom: modernTheme.spacing.xs,
    borderRadius: modernTheme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  // New styles
  highlightEffect: {
    position: "absolute",
    top: -5,
    bottom: -5,
    left: -5,
    right: -5,
    borderRadius: modernTheme.borderRadius.xl,
    zIndex: -1,
  },
  userHighlight: {
    backgroundColor: modernTheme.colors.primary[300] + "40", // 25% opacity
  },
  assistantHighlight: {
    backgroundColor: modernTheme.colors.secondary[300] + "40", // 25% opacity
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    marginRight: modernTheme.spacing.sm,
  },
  typingAnimation: {
    height: 20,
    width: 40,
  },
});

export default MessageBubble;
