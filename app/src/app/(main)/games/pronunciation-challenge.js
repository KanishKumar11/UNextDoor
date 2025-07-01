import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";
import PronunciationChallengeGame from "../../../features/games/components/PronunciationChallengeGame";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import { useAchievements } from "../../../features/achievements/context/AchievementContext";

/**
 * Pronunciation Challenge Game Screen
 * Screen for the Pronunciation Challenge game
 */
const PronunciationChallengeGameScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { lessonId = "practice" } = useLocalSearchParams();
  const { checkAchievements } = useAchievements();

  const [isLoading, setIsLoading] = useState(true);
  const [phrases, setPhrases] = useState([]);
  const [lessonTitle, setLessonTitle] = useState("");

  // Load phrases for the game
  useEffect(() => {
    const loadPhrases = async () => {
      try {
        setIsLoading(true);

        if (lessonId === "practice") {
          // For practice mode, use default phrases to avoid API complexity
          const phraseItems = [
            {
              korean: "안녕하세요",
              english: "Hello",
              romanization: "Annyeonghaseyo",
            },
            {
              korean: "감사합니다",
              english: "Thank you",
              romanization: "Gamsahamnida",
            },
            {
              korean: "죄송합니다",
              english: "I am sorry",
              romanization: "Joesonghamnida",
            },
            {
              korean: "괜찮아요",
              english: "It is okay",
              romanization: "Gwaenchanayo",
            },
            {
              korean: "네, 맞아요",
              english: "Yes, that is right",
              romanization: "Ne, majayo",
            },
            {
              korean: "아니에요",
              english: "No, it is not",
              romanization: "Anieyo",
            },
            {
              korean: "잠깐만요",
              english: "Wait a moment",
              romanization: "Jamkkanmanyo",
            },
            {
              korean: "도와주세요",
              english: "Please help me",
              romanization: "Dowajuseyo",
            },
          ];

          setPhrases(phraseItems.slice(0, 8)); // Use 8 practice phrases
          setLessonTitle("Practice");
        } else {
          // Load phrases from specific lesson
          const response = await curriculumService.getLesson(lessonId);
          const lesson = response.data.lesson;

          // Extract phrases from lesson
          const phraseItems = [];
          lesson.content.sections.forEach((section) => {
            if (
              section.type === "vocabulary" ||
              section.type === "conversation"
            ) {
              if (section.type === "vocabulary") {
                section.items.forEach((item) => {
                  phraseItems.push({
                    korean: item.korean,
                    english: item.english,
                    romanization: item.romanization,
                  });
                });
              } else if (section.examples) {
                section.examples.forEach((example) => {
                  if (example.korean && example.english) {
                    phraseItems.push({
                      korean: example.korean,
                      english: example.english,
                      romanization: example.romanization || "",
                    });
                  }
                });
              }
            }
          });

          setPhrases(phraseItems);
          setLessonTitle(lesson.title);
        }
      } catch (error) {
        console.error("Error loading phrases for game:", error);

        // Use default phrases if error occurs
        setPhrases([
          {
            korean: "안녕하세요",
            english: "Hello",
            romanization: "Annyeonghaseyo",
          },
          {
            korean: "감사합니다",
            english: "Thank you",
            romanization: "Gamsahamnida",
          },
          {
            korean: "네",
            english: "Yes",
            romanization: "Ne",
          },
          {
            korean: "아니요",
            english: "No",
            romanization: "Aniyo",
          },
          {
            korean: "저는 한국어를 공부해요",
            english: "I study Korean",
            romanization: "Jeoneun hangugeo-reul gongbuhaeyo",
          },
        ]);

        setLessonTitle("Practice");
      } finally {
        setIsLoading(false);
      }
    };

    loadPhrases();
  }, [lessonId]);

  // Handle game completion
  const handleGameComplete = (results) => {
    // Check for achievements
    if (checkAchievements) {
      checkAchievements({
        type: "game_completed",
        gameType: "pronunciation-challenge",
        score: results.score,
        accuracy: results.accuracy,
      });
    }

    // Navigate back
    router.back();
  };

  // Handle game close
  const handleGameClose = () => {
    router.back();
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PronunciationChallengeGame
        lessonId={lessonId}
        phrases={phrases}
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

export default PronunciationChallengeGameScreen;
