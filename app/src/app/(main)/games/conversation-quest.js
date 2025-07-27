import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";
import ConversationQuestGame from "../../../features/games/components/ConversationQuestGame";
import { useAchievements } from "../../../features/achievements/context/AchievementContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { TUTOR_NAME } from "../../../shared/constants/tutorConstants";

/**
 * Conversation Quest Game Screen
 * A game-like conversation experience with automatic scenario selection
 */
const ConversationQuestGameScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { lessonId = "practice" } = useLocalSearchParams();
  const { checkAchievements } = useAchievements();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Available conversation scenarios based on user level
  const scenarios = {
    beginner: [
      {
        id: "basic-greetings",
        title: "Basic Greetings",
        description: "Practice saying hello and introducing yourself",
        systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor. Help the student practice basic greetings in Korean.

        INTERACTIVE CONVERSATION FLOW:
        1. Start with casual English greeting: "Hi! How are you doing today?"
        2. Wait for their response and engage naturally
        3. Ask engagement question: "Have you tried greeting people in Korean before?"
        4. Transition smoothly: "Great! Ready to practice some Korean greetings?"
        5. Introduce ONE greeting at a time with immediate practice
        6. Keep each response to 1-2 sentences maximum
        7. Always wait for user practice between new concepts

        TEACHING APPROACH:
        - Use 85% English, 15% Korean for beginners
        - Start with "안녕하세요" (Hello) first, get them to practice it
        - Then move to one greeting at a time
        - Always provide English translations in parentheses
        - Give lots of encouragement for attempts
        - Never overwhelm with multiple concepts at once

        NEVER deliver long explanations - always short, interactive exchanges.

        Scenario: You meet the student for the first time. Greet them and help them practice basic introductions.`,
        initialMessage:
          `안녕하세요! (Hello!) I'm ${TUTOR_NAME}, your Korean tutor. What's your name? Try to respond in Korean!`,
        vocabulary: ["안녕하세요", "저는", "이름", "만나서 반갑습니다"],
        xpReward: 40,
        duration: 5, // minutes
      },
      {
        id: "ordering-food",
        title: "Ordering Food",
        description: "Learn to order food at a Korean restaurant",
        systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor. Help the student practice ordering food in Korean.

        Guidelines:
        - Act as a restaurant server
        - Help them order food in Korean
        - Provide menu suggestions
        - Correct pronunciation gently
        - Use food-related vocabulary
        - Provide English translations
        - Encourage full sentences

        Scenario: The student is at a Korean restaurant and wants to order food.`,
        initialMessage:
          "안녕하세요! (Hello!) Welcome to our Korean restaurant. 뭘 드시겠어요? (What would you like to eat?)",
        vocabulary: ["음식", "주문", "김치", "비빔밥", "불고기"],
        xpReward: 45,
        duration: 7,
      },
      {
        id: "shopping",
        title: "Shopping",
        description: "Practice shopping conversations in Korean",
        systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor. Help the student practice shopping in Korean.

        Guidelines:
        - Act as a shop clerk
        - Help them ask about prices and items
        - Practice numbers and money
        - Use polite shopping language
        - Provide English translations
        - Encourage questions about products

        Scenario: The student is shopping for clothes in Korea.`,
        initialMessage:
          "안녕하세요! (Hello!) Welcome to our store. 뭘 찾으세요? (What are you looking for?)",
        vocabulary: ["가격", "얼마", "사다", "옷", "신발"],
        xpReward: 40,
        duration: 6,
      },
    ],
    intermediate: [
      {
        id: "asking-directions",
        title: "Asking for Directions",
        description: "Learn to ask for and give directions in Korean",
        systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor. Help the student practice asking for directions in Korean.

        Guidelines:
        - Act as a helpful local person
        - Help them ask for directions
        - Use location vocabulary
        - Practice transportation terms
        - Provide clear directions in Korean
        - Encourage follow-up questions

        Scenario: The student is lost in Seoul and needs directions.`,
        initialMessage:
          "안녕하세요! (Hello!) You look lost. 어디 가세요? (Where are you going?)",
        vocabulary: ["길", "방향", "지하철", "버스", "어디"],
        xpReward: 50,
        duration: 8,
      },
      {
        id: "job-interview",
        title: "Job Interview",
        description: "Practice job interview conversations",
        systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor. Help the student practice job interview Korean.

        Guidelines:
        - Act as an interviewer
        - Ask about experience and skills
        - Use formal business language
        - Help with professional vocabulary
        - Provide feedback on formality
        - Encourage detailed responses

        Scenario: The student is interviewing for a job in Korea.`,
        initialMessage:
          "안녕하세요! (Hello!) Please introduce yourself. 자기소개를 해주세요. (Please introduce yourself.)",
        vocabulary: ["경험", "기술", "회사", "일", "면접"],
        xpReward: 55,
        duration: 10,
      },
    ],
    advanced: [
      {
        id: "business-meeting",
        title: "Business Meeting",
        description: "Practice formal business conversations",
        systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor. Help the student practice business Korean.

        Guidelines:
        - Use formal business language
        - Discuss projects and proposals
        - Practice presentation skills
        - Use advanced vocabulary
        - Encourage complex sentences
        - Provide cultural context

        Scenario: The student is in a business meeting discussing a new project.`,
        initialMessage:
          "안녕하세요! (Hello!) Let's discuss the new project. 새 프로젝트에 대해 이야기해봅시다.",
        vocabulary: ["프로젝트", "제안", "회의", "계획", "결과"],
        xpReward: 60,
        duration: 12,
      },
    ],
  };

  // Auto-select scenario based on user level
  useEffect(() => {
    const selectScenario = () => {
      setIsLoading(true);

      // Get user's proficiency level (default to beginner)
      const userLevel = user?.proficiencyLevel?.toLowerCase() || "beginner";

      // Get scenarios for user's level
      const levelScenarios = scenarios[userLevel] || scenarios.beginner;

      // For practice mode, randomly select a scenario
      if (lessonId === "practice") {
        const randomIndex = Math.floor(Math.random() * levelScenarios.length);
        setSelectedScenario(levelScenarios[randomIndex]);
      } else {
        // For specific lessons, use the first scenario (can be enhanced later)
        setSelectedScenario(levelScenarios[0]);
      }

      setIsLoading(false);
    };

    selectScenario();
  }, [lessonId, user]);

  // Handle game completion
  const handleGameComplete = async (results) => {
    console.log("🎯 Conversation quest completed:", results);

    try {
      // Check for achievements
      if (checkAchievements) {
        await checkAchievements({
          type: "game_completed",
          gameType: "conversation-quest",
          score: results.score,
          accuracy: results.accuracy,
          duration: results.duration,
          xpAwarded: results.xpAwarded,
          messagesCount: results.messagesCount,
          vocabularyUsed: results.vocabularyUsed,
        });
      }

      console.log("✅ Achievements checked for conversation quest");
    } catch (error) {
      console.error("❌ Error checking achievements:", error);
    }

    // Navigate back
    router.back();
  };

  // Handle game close
  const handleGameClose = () => {
    router.back();
  };

  // Render loading state
  if (isLoading || !selectedScenario) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.brandGreen} />
        <Text style={styles.loadingText}>
          Preparing your conversation quest...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ConversationQuestGame
        scenario={selectedScenario}
        onComplete={handleGameComplete}
        onClose={handleGameClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default ConversationQuestGameScreen;
