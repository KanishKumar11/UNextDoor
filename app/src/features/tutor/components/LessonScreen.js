import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { Text, ModernButton, ModernAvatar } from "../../../shared/components";
import ScreenPadding from "../../../shared/components/ScreenPadding";
import { AI_TUTOR_NAME } from "../../../shared/constants/appConstants";

/**
 * LessonScreen component
 * Displays a lesson with chat-like interface between AI tutor and user
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Lesson title
 * @param {string} props.subtitle - Lesson subtitle or description
 * @param {Array} props.messages - Array of message objects
 * @param {Function} props.onPractice - Function to call when practice button is pressed
 * @param {Function} props.onClose - Function to call when close button is pressed
 */
const LessonScreen = ({
  title = "Lesson 1",
  subtitle = "Lesson 1: Greetings",
  messages = [],
  onPractice,
  onClose,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const scrollViewRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Render a message bubble
  const renderMessage = (message, index) => {
    const isUser = message.sender === "user";

    return (
      <View
        key={index}
        style={[
          styles.messageBubbleContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../../assets/ai-avatar.png")}
              style={styles.avatar}
              defaultSource={require("../../../assets/ai-avatar.png")}
            />
            <Text style={styles.senderName}>{AI_TUTOR_NAME}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
            ]}
          >
            {message.text}
          </Text>
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            <ModernAvatar
              source={user?.profilePicture}
              name={user?.displayName || user?.username || "You"}
              size={36}
            />
            <Text style={styles.senderName}>You</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose || (() => router.back())}
          activeOpacity={0.7}
        >
          <View style={styles.closeButtonBackground}>
            <Ionicons name="close" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScreenPadding>
        {/* Lesson subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}

          {/* Bottom text */}
          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>
              Great job! Now, let's practice saying it with the correct
              pronunciation.
            </Text>
          </View>
        </ScrollView>

        {/* Practice button */}
        <View style={styles.practiceButtonContainer}>
          <ModernButton
            text="Practice"
            onPress={onPractice}
            style={styles.practiceButton}
          />
        </View>
      </ScreenPadding>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
  },
  headerRight: {
    width: 40,
  },
  subtitleContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#0A2240",
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: "#6FC935",
    borderRadius: 3,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubbleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFEFEF",
  },
  senderName: {
    fontSize: 12,
    marginTop: 4,
    color: "#888",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: "#6FC935", // Primary green color
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: "#F5F5F5",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#fff",
  },
  aiMessageText: {
    color: "#000",
  },
  bottomTextContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  bottomText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
  },
  practiceButtonContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  practiceButton: {
    backgroundColor: "#6FC935",
    borderRadius: 16,
    paddingVertical: 16,
  },
});

export default LessonScreen;
