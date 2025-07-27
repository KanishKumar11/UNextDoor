import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import MatchWordGame from "../../../features/games/components/MatchWordGame";
import { useAchievements } from "../../../features/achievements/context/AchievementContext";

/**
 * Match Word Game Screen
 * Screen for the Match Word vocabulary game
 */
const MatchWordGameScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { lessonId = "practice" } = useLocalSearchParams();
  const { checkAchievements } = useAchievements();

  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState([]);

  // Load words for the game
  useEffect(() => {
    // Reset state when component mounts
    setWords([]);
    setIsLoading(true);

    const loadWords = async () => {
      try {
        setIsLoading(true);

        if (lessonId === "practice") {
          // For practice mode, let the MatchWordGame component handle content loading
          setWords([]); // Empty array will trigger content service in MatchWordGame
        } else {
          // For lesson-specific games, also let MatchWordGame handle the loading
          // This ensures consistent behavior and proper error handling
          setWords([]);
        }
      } catch (error) {
        console.error("Error loading words for game:", error);

        // Use default words if error occurs
        setWords([
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
          { korean: "네", english: "Yes", romanization: "Ne" },
          { korean: "아니요", english: "No", romanization: "Aniyo" },
          { korean: "이름", english: "Name", romanization: "Ireum" },
          { korean: "좋아요", english: "Good", romanization: "Joayo" },
          {
            korean: "미안합니다",
            english: "Sorry",
            romanization: "Mianhamnida",
          },
          { korean: "물", english: "Water", romanization: "Mul" },
          { korean: "음식", english: "Food", romanization: "Eumsik" },
          { korean: "친구", english: "Friend", romanization: "Chingu" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, [lessonId]);

  // Handle game completion
  const handleGameComplete = (results) => {
    // Check for achievements
    if (checkAchievements) {
      checkAchievements({
        type: "game_completed",
        gameType: "match-word",
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
            backgroundColor: theme.colors.whisperWhite,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.explorerTeal} />
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
          backgroundColor: theme.colors.whisperWhite,
        }}
      >
        <MatchWordGame
          key={`match-word-${lessonId}-${Date.now()}`} // Force remount on each navigation
          lessonId={lessonId}
          words={words}
          onComplete={handleGameComplete}
          onClose={handleGameClose}
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default MatchWordGameScreen;
