import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "../../../shared/utils/audioUtils";
import modernTheme from "../../../shared/styles/modernTheme";
import ModernHeader from "../../../shared/components/ModernHeader";
import ModernChatBubble from "../../../shared/components/ModernChatBubble";
import ModernCard from "../../../shared/components/ModernCard";

/**
 * ModernChatScreen component
 * A modern chat screen implementation based on the UI examples
 */
const ModernChatScreen = () => {
  const router = useRouter();
  const { scenarioId } = useLocalSearchParams();
  const flatListRef = useRef(null);

  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Sample scenario data
  const scenario = {
    id: scenarioId || "1",
    title: "Basic Conversation",
    level: "Beginner",
    description: "Practice everyday conversations in English",
  };

  // Initialize with sample messages
  useEffect(() => {
    // Simulate loading initial messages
    setIsLoading(true);

    // Sample initial messages
    const initialMessages = [
      {
        id: "1",
        text: `Welcome to the ${scenario.title} scenario! I'm Cooper, your AI language tutor. How can I help you practice today?`,
        sender: "assistant",
        timestamp: new Date(Date.now() - 60000),
      },
    ];

    // Simulate API call delay
    setTimeout(() => {
      setMessages(initialMessages);
      setIsLoading(false);
    }, 1000);

    // Clean up audio resources
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [scenarioId]);

  // Start recording
  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access microphone is required!");
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Process the recording
      if (uri) {
        // In a real app, you would send this to your backend for processing
        // For now, we'll simulate receiving a transcript
        processAudioRecording(uri);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }

    setRecording(null);
    setIsRecording(false);
  };

  // Process audio recording (simulated)
  const processAudioRecording = (uri) => {
    // Simulate processing delay
    setIsLoading(true);

    // Simulate receiving a transcript
    setTimeout(() => {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        text: "Can you help me practice ordering food at a restaurant?",
        sender: "user",
        timestamp: new Date(),
        audioUrl: uri,
      };

      addMessage(userMessage);

      // Simulate AI response after a delay
      simulateAiResponse();
    }, 1500);
  };

  // Send text message
  const sendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputText("");

    // Simulate AI response
    simulateAiResponse();
  };

  // Add message to the list
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Simulate AI response
  const simulateAiResponse = () => {
    setIsLoading(false);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const aiMessage = {
        id: Date.now().toString(),
        text: "Sure! Let's practice ordering food at a restaurant. I'll be the server, and you can be the customer. Let's start:\n\nServer: Hello there! Welcome to our restaurant. Here's the menu. Would you like to start with something to drink?",
        sender: "assistant",
        timestamp: new Date(),
      };

      setIsTyping(false);
      addMessage(aiMessage);
    }, 2000);
  };

  // Play audio
  const playAudio = async (messageId, audioUrl) => {
    // Stop any currently playing audio
    if (sound) {
      await sound.stopAsync();
      setSound(null);
      setPlayingMessageId(null);
    }

    // If clicking on already playing message, just stop it
    if (playingMessageId === messageId) {
      return;
    }

    try {
      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (!status.isPlaying && status.didJustFinish) {
            setPlayingMessageId(null);
          }
        }
      );

      setSound(newSound);
      setPlayingMessageId(messageId);
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  };

  // Render message item
  const renderMessageItem = ({ item, index }) => {
    const isNew = index === messages.length - 1;

    return (
      <ModernChatBubble
        text={item.text}
        sender={item.sender}
        timestamp={item.timestamp}
        audioUrl={item.audioUrl}
        isPlaying={playingMessageId === item.id}
        isNew={isNew}
        onPlayAudio={() => item.audioUrl && playAudio(item.id, item.audioUrl)}
        onLongPress={() => {
          /* Handle long press */
        }}
        style={styles.messageBubble}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <ModernHeader
          title={scenario.title}
          subtitle={scenario.level}
          showBackButton
          onBackPress={() => router.back()}
        />

        {/* Messages */}
        {isLoading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={modernTheme.colors.primary[500]}
            />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {/* Typing indicator */}
        {isTyping && (
          <ModernChatBubble
            text="Typing"
            sender="assistant"
            isTyping={true}
            style={styles.typingIndicator}
          />
        )}

        {/* Input area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ModernCard style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isRecording && styles.recordingButton,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic-outline"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor={modernTheme.colors.text.hint}
                multiline
                editable={!isLoading && !isRecording}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.disabledButton,
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </ModernCard>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: modernTheme.colors.background.default,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    padding: modernTheme.spacing.md,
    paddingBottom: modernTheme.spacing.xl,
  },
  messageBubble: {
    marginBottom: modernTheme.spacing.sm,
  },
  typingIndicator: {
    marginHorizontal: modernTheme.spacing.md,
    marginBottom: modernTheme.spacing.sm,
  },
  inputContainer: {
    margin: modernTheme.spacing.md,
    padding: modernTheme.spacing.sm,
    borderRadius: modernTheme.borderRadius.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    marginRight: modernTheme.spacing.sm,
  },
  recordingButton: {
    backgroundColor: modernTheme.colors.error.main,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: modernTheme.typography.fontSize.md,
    color: modernTheme.colors.text.primary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
    marginLeft: modernTheme.spacing.sm,
  },
  disabledButton: {
    backgroundColor: modernTheme.colors.neutral[300],
  },
});

export default ModernChatScreen;
