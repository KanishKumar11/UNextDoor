import React from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PersistentConversationView from "../components/PersistentConversationView";
import modernTheme from "../../../shared/styles/modernTheme";
import { Ionicons } from "@expo/vector-icons";

/**
 * StandaloneConversationScreen
 * A screen that uses the persistent WebRTC conversation service
 */
export default function StandaloneConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract scenario parameters from URL params
  const scenarioId = params.scenarioId;
  const scenarioTitle = params.title || "Conversation";
  const proficiencyLevel = params.level || "beginner";

  console.log("📱 StandaloneConversationScreen rendered with params:", {
    scenarioId,
    scenarioTitle,
    proficiencyLevel,
  });

  // Handle session end
  const handleSessionEnd = () => {
    console.log("📱 Session ended, navigating back");
    router.back();
  };

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={modernTheme.colors.text.primary}
          onPress={handleBack}
          style={styles.backButton}
        />
        <Text style={styles.title}>{scenarioTitle}</Text>
      </View>

      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{proficiencyLevel}</Text>
      </View>



      <View style={styles.conversationContainer}>
        <PersistentConversationView
          scenarioId={scenarioId}
          level={proficiencyLevel}
          onSessionEnd={handleSessionEnd}
          style={styles.conversationComponent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: modernTheme.colors.background.main,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.neutral[200],
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontFamily: modernTheme.typography.fontFamily.bold,
    fontSize: modernTheme.typography.fontSize.xl,
    color: modernTheme.colors.text.primary,
    flex: 1,
  },
  levelBadge: {
    backgroundColor: modernTheme.colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: modernTheme.borderRadius.full,
    alignSelf: "flex-start",
    margin: 16,
    marginTop: 0,
  },
  levelText: {
    fontFamily: modernTheme.typography.fontFamily.medium,
    fontSize: modernTheme.typography.fontSize.sm,
    color: modernTheme.colors.primary[700],
  },

  conversationContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  conversationComponent: {
    flex: 1,
    minHeight: 500,
    marginBottom: 16,
  },
});
