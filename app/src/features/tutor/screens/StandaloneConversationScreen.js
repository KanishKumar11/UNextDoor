import React from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PersistentConversationView from "../components/PersistentConversationView";
import { BRAND_COLORS } from "../../../shared/constants/colors";
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
          size={18}
          color={BRAND_COLORS.SHADOW_GREY}
          onPress={handleBack}
          style={styles.backButton}
        />
        <Text style={styles.title}>{scenarioTitle}</Text>
      </View>

      {/* <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{proficiencyLevel}</Text>
      </View> */}



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
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: BRAND_COLORS.EXPLORER_TEAL + '20',
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.SHADOW_GREY + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: BRAND_COLORS.OCEAN_BLUE,
    flex: 1,
  },
  levelBadge: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    margin: 16,
    marginTop: 0,
  },
  levelText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: BRAND_COLORS.EXPLORER_TEAL,
  },

  conversationContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  conversationComponent: {
    flex: 1,
    minHeight: 500,
    marginBottom: 100, // Space for bottom navigation
  },
});
