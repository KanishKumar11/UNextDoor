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
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PersistentConversationView from "../components/PersistentConversationView";
import { BRAND_COLORS } from "../../../shared/constants/colors";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useWebRTCConversation } from "../hooks/useWebRTCConversation";
import {
  Text as ThemedText,
  Row,
  Column,
  ModernCard,
} from "../../../shared/components";
import characterIconService from "../../../shared/services/characterIconService";

// Helper function for cross-platform font families
const getFontFamily = (weight = 'regular') => {
  const fontMap = {
    light: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Light',
    regular: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Regular',
    medium: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Medium',
    semibold: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-SemiBold',
    bold: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-Bold',
    extrabold: Platform.OS === 'web' ? 'Montserrat, sans-serif' : 'Montserrat-ExtraBold',
  };

  return fontMap[weight] || fontMap.regular;
};

/**
 * RealtimeConversationScreen component
 * @returns {JSX.Element} Component JSX
 */
const RealtimeConversationScreen = () => {
  // Router and theme
  const router = useRouter();
  const theme = useTheme();

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
      <ThemedText style={styles.sectionTitle}>Select a Conversation Scenario</ThemedText>
      {scenarios.map((scenario) => {
        // Get character for this scenario
        const scenarioCharacter = characterIconService.getCharacterForScenario(scenario.id);

        return (
          <ModernCard
            key={scenario.id}
            style={styles.scenarioCard}
            onPress={() => handleScenarioSelect(scenario)}
          >
            <Row justify="space-between" align="center">
              <Row align="center" style={{ flex: 1 }}>
                {/* Character Preview */}
                <View style={styles.scenarioCharacterPreview}>
                  <Image
                    source={scenarioCharacter.icon}
                    style={styles.scenarioCharacterIcon}
                    resizeMode="contain"
                  />
                </View>
                <Column style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText style={styles.scenarioTitle}>{scenario.title}</ThemedText>
                  <ThemedText style={styles.scenarioLevel}>Level: {scenario.level}</ThemedText>
                  <ThemedText style={styles.scenarioCharacterName}>
                    with {scenarioCharacter.profile.name}
                  </ThemedText>
                </Column>
              </Row>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={BRAND_COLORS.EXPLORER_TEAL}
              />
            </Row>
          </ModernCard>
        );
      })}
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
            size={18}
            color={BRAND_COLORS.SHADOW_GREY}
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
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.SHADOW_GREY + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.OCEAN_BLUE,
    fontFamily: getFontFamily("bold"),
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  scenarioContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: BRAND_COLORS.SHADOW_GREY,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: getFontFamily("medium"),
  },
  scenarioCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "30",
    elevation: 0,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 4,
    fontFamily: "Montserrat-SemiBold",
  },
  scenarioLevel: {
    fontSize: 14,
    color: BRAND_COLORS.SHADOW_GREY,
    fontFamily: "Montserrat-Medium",
  },
  scenarioCharacterPreview: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioCharacterIcon: {
    width: 36,
    height: 36,
  },
  scenarioCharacterName: {
    fontSize: 12,
    color: BRAND_COLORS.EXPLORER_TEAL,
    fontFamily: "Montserrat-Medium",
    marginTop: 2,
  },
  transcriptsContainer: {
    marginBottom: 16,
  },
  transcriptItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  userTranscript: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    alignSelf: "flex-end",
  },
  assistantTranscript: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: BRAND_COLORS.OCEAN_BLUE + "30",
  },
  transcriptText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  userTranscriptText: {
    color: BRAND_COLORS.CARD_BACKGROUND,
  },
  assistantTranscriptText: {
    color: BRAND_COLORS.OCEAN_BLUE,
  },
  conversationComponent: {
    marginTop: 16,
  },
});

export default RealtimeConversationScreen;
