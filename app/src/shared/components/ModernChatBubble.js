import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../styles/modernTheme";

/**
 * ModernChatBubble component
 * A chat bubble component with modern styling
 *
 * @param {Object} props - Component props
 * @param {string} props.text - Message text
 * @param {string} props.sender - Message sender ('user' or 'assistant')
 * @param {Date} props.timestamp - Message timestamp
 * @param {string} props.audioUrl - Audio URL for playback
 * @param {Function} props.onPlayAudio - Audio playback handler
 * @param {boolean} props.isPlaying - Is audio playing
 * @param {boolean} props.isNew - Is this a new message
 * @param {boolean} props.isTyping - Is typing animation shown
 * @param {Function} props.onLongPress - Long press handler
 * @param {Object} props.style - Additional styles
 */
const ModernChatBubble = ({
  text,
  sender = "user",
  timestamp,
  audioUrl,
  onPlayAudio,
  isPlaying = false,
  isNew = false,
  isTyping = false,
  onLongPress,
  style,
  ...props
}) => {
  // Determine if message is from user
  const isUser = sender === "user";

  // Animation values
  const highlightOpacity = new Animated.Value(isNew ? 1 : 0);
  const audioIconOpacity = new Animated.Value(audioUrl ? 1 : 0);

  // Format timestamp
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Highlight animation for new messages
  useEffect(() => {
    if (isNew) {
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(highlightOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNew, highlightOpacity]);

  // Audio icon animation
  useEffect(() => {
    if (audioUrl) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(audioIconOpacity, {
            toValue: isPlaying ? 0.6 : 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(audioIconOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [audioUrl, isPlaying, audioIconOpacity]);

  // Animated styles
  const highlightStyle = {
    opacity: highlightOpacity,
  };

  // Handle long press
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress({ text, sender, timestamp, audioUrl });
    }
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        style,
      ]}
      {...props}
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

      <Pressable onLongPress={handleLongPress} delayLongPress={500}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {/* Message text */}
          {isTyping ? (
            <View style={styles.typingContainer}>
              <Text
                style={[
                  styles.messageText,
                  isUser ? styles.userText : styles.assistantText,
                ]}
              >
                {text || "Typing"}
              </Text>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          ) : (
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.assistantText,
              ]}
            >
              {text}
            </Text>
          )}

          {/* Audio playback button */}
          {audioUrl && (
            <TouchableOpacity style={styles.audioButton} onPress={onPlayAudio}>
              <Animated.View style={{ opacity: audioIconOpacity }}>
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={18}
                  color={
                    isUser
                      ? modernTheme.colors.text.white
                      : modernTheme.colors.primary[500]
                  }
                />
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* Timestamp */}
          {timestamp && (
            <Text
              style={[
                styles.timestamp,
                isUser ? styles.userTimestamp : styles.assistantTimestamp,
              ]}
            >
              {formattedTime}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: modernTheme.spacing.xs,
    maxWidth: "80%",
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
    borderRadius: modernTheme.borderRadius.lg,
    padding: modernTheme.spacing.md,
    minHeight: 40,
  },
  userBubble: {
    backgroundColor: modernTheme.colors.primary[500],
    borderBottomRightRadius: modernTheme.borderRadius.xs,
  },
  assistantBubble: {
    backgroundColor: modernTheme.colors.background.card,
    borderBottomLeftRadius: modernTheme.borderRadius.xs,
    ...modernTheme.shadows.xs,
  },
  messageText: {
    fontSize: modernTheme.typography.fontSize.md,
    lineHeight:
      modernTheme.typography.lineHeight.md * modernTheme.typography.fontSize.md,
  },
  userText: {
    color: modernTheme.colors.text.white,
  },
  assistantText: {
    color: modernTheme.colors.text.primary,
  },
  timestamp: {
    fontSize: modernTheme.typography.fontSize.xs,
    marginTop: modernTheme.spacing.xs,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: modernTheme.colors.primary[100],
  },
  assistantTimestamp: {
    color: modernTheme.colors.text.secondary,
  },
  audioButton: {
    marginTop: modernTheme.spacing.sm,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  highlightEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: modernTheme.borderRadius.lg,
  },
  userHighlight: {
    backgroundColor: modernTheme.colors.primary[300],
  },
  assistantHighlight: {
    backgroundColor: modernTheme.colors.neutral[300],
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDots: {
    flexDirection: "row",
    marginLeft: modernTheme.spacing.xs,
    alignItems: "center",
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
    backgroundColor: "currentColor",
  },
  typingDot1: {
    animationName: "bounce",
    animationDuration: "0.6s",
    animationDelay: "0s",
    animationIterationCount: "infinite",
  },
  typingDot2: {
    animationName: "bounce",
    animationDuration: "0.6s",
    animationDelay: "0.2s",
    animationIterationCount: "infinite",
  },
  typingDot3: {
    animationName: "bounce",
    animationDuration: "0.6s",
    animationDelay: "0.4s",
    animationIterationCount: "infinite",
  },
});

export default ModernChatBubble;
