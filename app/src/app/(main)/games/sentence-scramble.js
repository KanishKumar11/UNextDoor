import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import SentenceScrambleGame from "../../../features/games/components/SentenceScrambleGame";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import { useAchievements } from "../../../features/achievements/context/AchievementContext";

/**
 * Sentence Scramble Game Screen
 * Screen for the Sentence Scramble game
 */
const SentenceScrambleGameScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { lessonId = "practice" } = useLocalSearchParams();
  const { checkAchievements } = useAchievements();

  const [isLoading, setIsLoading] = useState(true);
  const [sentences, setSentences] = useState([]);

  // Load sentences for the game
  useEffect(() => {
    const loadSentences = async () => {
      try {
        setIsLoading(true);

        if (lessonId === "practice") {
          // For practice mode, just use default sentences to avoid API complexity
          // This is simpler and more reliable for practice games
          const sentenceItems = [
            {
              korean: "저는 한국어를 공부해요",
              english: "I study Korean",
              words: ["저는", "한국어를", "공부해요"],
            },
            {
              korean: "오늘 날씨가 좋아요",
              english: "The weather is good today",
              words: ["오늘", "날씨가", "좋아요"],
            },
            {
              korean: "내일 친구를 만날 거예요",
              english: "I will meet my friend tomorrow",
              words: ["내일", "친구를", "만날", "거예요"],
            },
            {
              korean: "한국 음식을 좋아해요",
              english: "I like Korean food",
              words: ["한국", "음식을", "좋아해요"],
            },
            {
              korean: "서울에 가고 싶어요",
              english: "I want to go to Seoul",
              words: ["서울에", "가고", "싶어요"],
            },
            {
              korean: "책을 읽는 것을 좋아해요",
              english: "I like reading books",
              words: ["책을", "읽는", "것을", "좋아해요"],
            },
            {
              korean: "커피를 마시고 있어요",
              english: "I am drinking coffee",
              words: ["커피를", "마시고", "있어요"],
            },
            {
              korean: "영화를 보러 갈 거예요",
              english: "I will go to watch a movie",
              words: ["영화를", "보러", "갈", "거예요"],
            },
          ];

          setSentences(sentenceItems);
        } else {
          // Load sentences from specific lesson
          const response = await curriculumService.getLesson(lessonId);
          const lesson = response.data.lesson;

          // Extract sentences from lesson
          const sentenceItems = [];
          lesson.content.sections.forEach((section) => {
            if (section.type === "grammar" || section.type === "conversation") {
              section.examples?.forEach((example) => {
                if (example.korean && example.english) {
                  // Split Korean sentence into words
                  const words = example.korean
                    .split(" ")
                    .filter((word) => word.trim() !== "");

                  sentenceItems.push({
                    korean: example.korean,
                    english: example.english,
                    words: words,
                  });
                }
              });
            }
          });

          setSentences(sentenceItems);
        }
      } catch (error) {
        console.error("Error loading sentences for game:", error);

        // Use default sentences if error occurs
        setSentences([
          {
            korean: "저는 한국어를 공부해요",
            english: "I study Korean",
            words: ["저는", "한국어를", "공부해요"],
          },
          {
            korean: "오늘 날씨가 좋아요",
            english: "The weather is good today",
            words: ["오늘", "날씨가", "좋아요"],
          },
          {
            korean: "내일 친구를 만날 거예요",
            english: "I will meet my friend tomorrow",
            words: ["내일", "친구를", "만날", "거예요"],
          },
          {
            korean: "한국 음식을 좋아해요",
            english: "I like Korean food",
            words: ["한국", "음식을", "좋아해요"],
          },
          {
            korean: "서울에 가고 싶어요",
            english: "I want to go to Seoul",
            words: ["서울에", "가고", "싶어요"],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSentences();
  }, [lessonId]);

  // Handle game completion
  const handleGameComplete = (results) => {
    // Check for achievements
    if (checkAchievements) {
      checkAchievements({
        type: "game_completed",
        gameType: "sentence-scramble",
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
      <SafeAreaWrapper>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.brandWhite,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.brandGreen} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: theme.colors.neutral[600],
              fontFamily: theme.typography.fontFamily.medium,
            }}
          >
            Loading game...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.brandWhite,
        }}
      >
        <SentenceScrambleGame
          key={`sentence-scramble-${lessonId}-${Date.now()}`} // Force remount on each navigation
          lessonId={lessonId}
          sentences={sentences}
          onComplete={handleGameComplete}
          onClose={handleGameClose}
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default SentenceScrambleGameScreen;
