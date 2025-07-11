/**
 * RealtimeConversationScreen
 * Screen for real-time voice conversations with OpenAI's Realtime API
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PersistentConversationView from "../components/PersistentConversationView";
import modernTheme from "../../../shared/styles/modernTheme";
import { useWebRTCConversation } from "../hooks/useWebRTCConversation";

/**
 * RealtimeConversationScreen component
 * @returns {JSX.Element} Component JSX
 */
const RealtimeConversationScreen = () => {
  // Router
  const router = useRouter();

  // State
  const [transcripts, setTranscripts] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Get the resetSessionControlFlags function from the hook
  const { resetSessionControlFlags } = useWebRTCConversation();

  // Available scenarios
  const scenarios = [
    {
      id: "basic-greetings",
      title: "Basic Greetings",
      level: "beginner",
      instructions:
        "You are a helpful Korean language tutor. Help the student practice basic greetings in Korean. Respond in Korean with English translations.",
    },
    {
      id: "ordering-food",
      title: "Ordering Food",
      level: "intermediate",
      instructions:
        "You are a helpful Korean language tutor. Help the student practice ordering food in Korean. Respond in Korean with English translations.",
    },
    {
      id: "asking-directions",
      title: "Asking for Directions",
      level: "intermediate",
      instructions:
        "You are a helpful Korean language tutor. Help the student practice asking for directions in Korean. Respond in Korean with English translations.",
    },
  ];

  // Handle transcript received
  const handleTranscriptReceived = useCallback((transcript, isFinal) => {
    if (isFinal) {
      setTranscripts((prev) => [...prev, { text: transcript, isUser: true }]);
    }
  }, []);

  // Handle error
  const handleError = useCallback((error) => {
    console.error("Realtime conversation error:", error);
  }, []);

  // Handle scenario selection
  const handleScenarioSelect = useCallback((scenario) => {
    // Reset session control flags to allow auto-restart for new scenario
    resetSessionControlFlags();
    setSelectedScenario(scenario);
    setTranscripts([]);
  }, [resetSessionControlFlags]);

  // Render scenario selection
  const renderScenarioSelection = () => (
    <View style={styles.scenarioContainer}>
      <Text style={styles.sectionTitle}>Select a Conversation Scenario</Text>
      {scenarios.map((scenario) => (
        <TouchableOpacity
          key={scenario.id}
          style={styles.scenarioCard}
          onPress={() => handleScenarioSelect(scenario)}
        >
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <Text style={styles.scenarioLevel}>Level: {scenario.level}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={modernTheme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedScenario ? selectedScenario.title : "Realtime Conversation"}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {selectedScenario ? (
          <>
            {/* Conversation history */}
            {transcripts.length > 0 && (
              <View style={styles.transcriptsContainer}>
                {transcripts.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.transcriptItem,
                      item.isUser
                        ? styles.userTranscript
                        : styles.assistantTranscript,
                    ]}
                  >
                    <Text
                      style={[
                        styles.transcriptText,
                        item.isUser
                          ? styles.userTranscriptText
                          : styles.assistantTranscriptText,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Persistent conversation component */}
            <PersistentConversationView
              scenarioId={selectedScenario.id}
              level={selectedScenario.level}
              onSessionEnd={() => {
                console.log("Session ended - returning to scenario selection");
                setSelectedScenario(null);
              }}
              style={styles.conversationComponent}
            />
          </>
        ) : (
          renderScenarioSelection()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    // borderBottomColor: modernTheme.colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: modernTheme.colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  scenarioContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: modernTheme.colors.text.primary,
    marginBottom: 16,
  },
  scenarioCard: {
    backgroundColor: modernTheme.colors.background.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: modernTheme.colors.text.primary,
    marginBottom: 4,
  },
  scenarioLevel: {
    fontSize: 14,
    color: modernTheme.colors.text.secondary,
  },
  transcriptsContainer: {
    marginBottom: 16,
  },
  transcriptItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: "80%",
  },
  userTranscript: {
    backgroundColor: modernTheme.colors.primary[500],
    alignSelf: "flex-end",
  },
  assistantTranscript: {
    backgroundColor: modernTheme.colors.background.card,
    alignSelf: "flex-start",
  },
  transcriptText: {
    fontSize: 16,
  },
  userTranscriptText: {
    color: modernTheme.colors.text.white,
  },
  assistantTranscriptText: {
    color: modernTheme.colors.text.primary,
  },
  conversationComponent: {
    marginTop: 16,
  },
});

export default RealtimeConversationScreen;
