import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  Heading,
  ModernCard,
  Spacer,
  ModernButton,
} from "../../../shared/components";
import modernTheme from "../../../shared/styles/modernTheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import PronunciationPractice from "../components/PronunciationPractice";
import PronunciationGuide from "../components/PronunciationGuide";
import { useAuth } from "../../../features/auth/context/AuthContext";

// Sample practice phrases by difficulty
const practicePhrases = {
  beginner: [
    { text: "안녕하세요", translation: "Hello" },
    { text: "감사합니다", translation: "Thank you" },
    { text: "저는 학생이에요", translation: "I am a student" },
    { text: "이것은 무엇입니까?", translation: "What is this?" },
    { text: "맛있어요", translation: "It's delicious" },
  ],
  intermediate: [
    { text: "오늘 날씨가 어때요?", translation: "How is the weather today?" },
    { text: "한국어를 배우고 있어요", translation: "I am learning Korean" },
    {
      text: "내일 시간이 있으세요?",
      translation: "Do you have time tomorrow?",
    },
    { text: "이 책은 재미있어요", translation: "This book is interesting" },
    { text: "어디에서 왔어요?", translation: "Where are you from?" },
  ],
  advanced: [
    {
      text: "한국 문화에 관심이 많아요",
      translation: "I am very interested in Korean culture",
    },
    {
      text: "이 문제를 어떻게 해결할 수 있을까요?",
      translation: "How can we solve this problem?",
    },
    {
      text: "다음 주에 회의가 있을 예정입니다",
      translation: "There will be a meeting next week",
    },
    {
      text: "그 영화는 기대 이상으로 좋았어요",
      translation: "The movie was better than expected",
    },
    {
      text: "언어를 배우는 것은 시간이 걸리지만 보람 있어요",
      translation: "Learning a language takes time but is rewarding",
    },
  ],
};

/**
 * PronunciationScreen component
 * Screen for pronunciation practice and guides
 */
const PronunciationScreen = () => {
  // Hooks
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState("practice");
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    params.difficulty || "beginner"
  );
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [showPractice, setShowPractice] = useState(false);
  const [completedPhrases, setCompletedPhrases] = useState([]);

  // Get phrases for current difficulty
  const phrases =
    practicePhrases[selectedDifficulty] || practicePhrases.beginner;
  const currentPhrase = phrases[currentPhraseIndex];

  // Handle practice completion
  const handlePracticeComplete = (result) => {
    // Mark phrase as completed
    if (!completedPhrases.includes(currentPhraseIndex)) {
      setCompletedPhrases([...completedPhrases, currentPhraseIndex]);
    }

    // Hide practice component
    setShowPractice(false);
  };

  // Start practice for a phrase
  const startPractice = (index) => {
    setCurrentPhraseIndex(index);
    setShowPractice(true);
  };

  // Get next phrase
  const getNextPhrase = () => {
    const nextIndex = (currentPhraseIndex + 1) % phrases.length;
    setCurrentPhraseIndex(nextIndex);
    setShowPractice(true);
  };

  // Get previous phrase
  const getPreviousPhrase = () => {
    const prevIndex =
      (currentPhraseIndex - 1 + phrases.length) % phrases.length;
    setCurrentPhraseIndex(prevIndex);
    setShowPractice(true);
  };

  // If showing practice, render the practice component
  if (showPractice) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowPractice(false)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={modernTheme.colors.neutral[800]}
            />
          </TouchableOpacity>

          <Heading level="h4">Pronunciation Practice</Heading>

          <View style={styles.backButton} />
        </View>

        <View style={styles.practiceContainer}>
          <PronunciationPractice
            text={currentPhrase.text}
            translation={currentPhrase.translation}
            difficulty={selectedDifficulty}
            onComplete={handlePracticeComplete}
          />
        </View>

        <View style={styles.navigationButtons}>
          <ModernButton
            text="Previous"
            onPress={getPreviousPhrase}
            variant="outlined"
            leftIcon={
              <Ionicons
                name="arrow-back"
                size={18}
                color={modernTheme.colors.primary[500]}
              />
            }
            style={styles.navButton}
          />

          <ModernButton
            text="Next"
            onPress={getNextPhrase}
            variant="outlined"
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={modernTheme.colors.primary[500]}
              />
            }
            style={styles.navButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={modernTheme.colors.neutral[800]}
          />
        </TouchableOpacity>

        <Heading level="h4">Pronunciation</Heading>

        <View style={styles.backButton} />
      </View>

      {/* Tabs for practice and guide */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "practice" && styles.activeTab]}
          onPress={() => setActiveTab("practice")}
          activeOpacity={0.7}
        >
          <Text
            weight={activeTab === "practice" ? "semibold" : "regular"}
            color={activeTab === "practice" ? "primary.700" : "neutral.600"}
          >
            Practice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "guide" && styles.activeTab]}
          onPress={() => setActiveTab("guide")}
          activeOpacity={0.7}
        >
          <Text
            weight={activeTab === "guide" ? "semibold" : "regular"}
            color={activeTab === "guide" ? "primary.700" : "neutral.600"}
          >
            Pronunciation Guide
          </Text>
        </TouchableOpacity>
      </View>

      {/* Practice tab content */}
      {activeTab === "practice" && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ModernCard style={styles.difficultyCard}>
            <Heading level="h4" gutterBottom>
              Select Difficulty
            </Heading>

            <View style={styles.difficultyButtons}>
              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === "beginner" &&
                    styles.selectedDifficulty,
                ]}
                onPress={() => setSelectedDifficulty("beginner")}
                activeOpacity={0.7}
              >
                <Text
                  weight={
                    selectedDifficulty === "beginner" ? "semibold" : "regular"
                  }
                  color={
                    selectedDifficulty === "beginner"
                      ? "primary.700"
                      : "neutral.600"
                  }
                >
                  Beginner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === "intermediate" &&
                    styles.selectedDifficulty,
                ]}
                onPress={() => setSelectedDifficulty("intermediate")}
                activeOpacity={0.7}
              >
                <Text
                  weight={
                    selectedDifficulty === "intermediate"
                      ? "semibold"
                      : "regular"
                  }
                  color={
                    selectedDifficulty === "intermediate"
                      ? "primary.700"
                      : "neutral.600"
                  }
                >
                  Intermediate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === "advanced" &&
                    styles.selectedDifficulty,
                ]}
                onPress={() => setSelectedDifficulty("advanced")}
                activeOpacity={0.7}
              >
                <Text
                  weight={
                    selectedDifficulty === "advanced" ? "semibold" : "regular"
                  }
                  color={
                    selectedDifficulty === "advanced"
                      ? "primary.700"
                      : "neutral.600"
                  }
                >
                  Advanced
                </Text>
              </TouchableOpacity>
            </View>
          </ModernCard>

          <Heading level="h4" style={styles.phrasesTitle}>
            Practice Phrases
          </Heading>

          {phrases.map((phrase, index) => (
            <ModernCard key={index} style={styles.phraseCard}>
              <View style={styles.phraseContent}>
                <View>
                  <Text size="lg" weight="semibold">
                    {phrase.text}
                  </Text>
                  <Text color="neutral.600" style={styles.translation}>
                    {phrase.translation}
                  </Text>
                </View>

                {completedPhrases.includes(index) && (
                  <View style={styles.completedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={modernTheme.colors.success.main}
                    />
                  </View>
                )}
              </View>

              <ModernButton
                text="Practice"
                onPress={() => startPractice(index)}
                style={styles.practiceButton}
              />
            </ModernCard>
          ))}

          <Spacer size="xl" />
        </ScrollView>
      )}

      {/* Guide tab content */}
      {activeTab === "guide" && <PronunciationGuide />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: modernTheme.colors.primary[500],
  },
  content: {
    flex: 1,
  },
  difficultyCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  difficultyButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: modernTheme.colors.neutral[100],
  },
  selectedDifficulty: {
    backgroundColor: modernTheme.colors.primary[100],
  },
  phrasesTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  phraseCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  phraseContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  translation: {
    marginTop: 4,
    fontStyle: "italic",
  },
  completedBadge: {
    marginLeft: 8,
  },
  practiceButton: {
    marginTop: 16,
  },
  practiceContainer: {
    flex: 1,
    padding: 16,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.neutral[200],
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default PronunciationScreen;
