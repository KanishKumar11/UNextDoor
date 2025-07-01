import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import {
  Container,
  Heading,
  Text,
  ModernButton,
  ModernCard,
  Row,
  Column,
  Spacer,
  ModernProgressBar,
} from "../../../shared/components";
import MatchWordGameEnhanced from "../components/MatchWordGameEnhanced";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import modernTheme from "../../../shared/styles/modernTheme";
import { vocabularyService } from "../services/vocabularyService";
import { useUserLevel } from "../../level/context/UserLevelContext";

/**
 * MatchWordGameScreen
 * Screen for playing the Match the Word vocabulary game
 */
const MatchWordGameScreen = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const params = useLocalSearchParams();
  const { addXp } = useUserLevel();

  // Get category and difficulty from params or use defaults
  const category = params.category || "general";
  const difficulty = params.difficulty || "beginner";

  // Game state
  const [wordPairs, setWordPairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [vocabularyStats, setVocabularyStats] = useState(null);

  // Load word pairs and vocabulary stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load word pairs
        const pairs = await vocabularyService.getWordPairs(
          category,
          difficulty
        );

        // Limit to 6 pairs for better gameplay
        const limitedPairs = pairs.slice(0, 6);
        setWordPairs(limitedPairs);

        // Load vocabulary statistics
        try {
          const statsResponse =
            await vocabularyService.getVocabularyStatistics();
          if (statsResponse.success) {
            setVocabularyStats(statsResponse.statistics);
          }
        } catch (statsErr) {
          console.error("Error loading vocabulary statistics:", statsErr);
          // Don't fail the whole screen if just stats fail to load
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading word pairs:", err);
        setError("Failed to load vocabulary. Please try again.");
        setIsLoading(false);
      }
    };

    loadData();
  }, [category, difficulty]);

  // Handle game completion
  const handleGameComplete = async (finalScore) => {
    setGameCompleted(true);
    setScore(finalScore);

    try {
      // Save the game result
      await vocabularyService.saveGameResult(category, difficulty, finalScore);

      // Award XP based on score and difficulty
      const difficultyMultiplier =
        difficulty === "beginner" ? 1 : difficulty === "intermediate" ? 2 : 3;
      const xpAmount = Math.round(finalScore * difficultyMultiplier);

      try {
        await addXp(xpAmount, "vocabulary_game");
      } catch (xpErr) {
        console.error("Error awarding XP:", xpErr);
      }

      // Refresh vocabulary statistics
      try {
        const statsResponse = await vocabularyService.getVocabularyStatistics();
        if (statsResponse.success) {
          setVocabularyStats(statsResponse.statistics);
        }
      } catch (statsErr) {
        console.error("Error refreshing vocabulary statistics:", statsErr);
      }
    } catch (err) {
      console.error("Error saving game result:", err);
    }
  };

  // Start a new game
  const handleStartGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
  };

  // Play again with same settings
  const handlePlayAgain = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
  };

  // Change difficulty
  const handleChangeDifficulty = (newDifficulty) => {
    router.push(
      `/vocabulary/match-word?category=${category}&difficulty=${newDifficulty}`
    );
  };

  // Return to vocabulary home
  const handleBackToHome = () => {
    router.push("/vocabulary");
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="hourglass-outline"
              size={48}
              color={modernTheme.colors.primary[500]}
            />
            <Spacer size="md" />
            <Text>Loading vocabulary...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={modernTheme.colors.error[500]}
            />
            <Spacer size="md" />
            <Text>{error}</Text>
            <Spacer size="lg" />
            <ModernButton
              text="Try Again"
              variant="primary"
              onPress={() => router.reload()}
            />
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Heading level="h1">Match the Word</Heading>
            <Text color="neutral.600">
              Match Korean words with their English translations
            </Text>
          </View>

          {/* Game info */}
          <ModernCard style={styles.infoCard}>
            <Row justify="space-between" align="center">
              <Column>
                <Text weight="semibold">Category</Text>
                <Text color="neutral.600" style={styles.infoText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Column>

              <Column>
                <Text weight="semibold">Difficulty</Text>
                <Text
                  color={
                    difficulty === "beginner"
                      ? "success.600"
                      : difficulty === "intermediate"
                      ? "warning.600"
                      : "error.600"
                  }
                  weight="medium"
                  style={styles.infoText}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </Column>

              <Column>
                <Text weight="semibold">Words</Text>
                <Text color="neutral.600" style={styles.infoText}>
                  {wordPairs.length} pairs
                </Text>
              </Column>
            </Row>
          </ModernCard>

          {/* Game content */}
          {!gameStarted ? (
            // Game start screen
            <View style={styles.startContainer}>
              <ModernCard style={styles.instructionsCard}>
                <Heading level="h3">How to Play</Heading>
                <Text color="neutral.600" style={styles.instructionText}>
                  1. Flip cards to reveal Korean words and English translations
                </Text>
                <Text color="neutral.600" style={styles.instructionText}>
                  2. Find matching pairs of Korean words and their translations
                </Text>
                <Text color="neutral.600" style={styles.instructionText}>
                  3. Complete the game with as few moves as possible
                </Text>
              </ModernCard>

              <Spacer size="lg" />

              <ModernButton
                text="Start Game"
                variant="primary"
                size="lg"
                onPress={handleStartGame}
                style={styles.startButton}
              />
            </View>
          ) : gameCompleted ? (
            // Game completion screen
            <View style={styles.completionContainer}>
              <ModernCard style={styles.completionCard}>
                <Heading level="h2" align="center">
                  Game Complete!
                </Heading>

                <View style={styles.scoreContainer}>
                  <Text weight="semibold" align="center">
                    Your Score
                  </Text>
                  <Heading level="h1" align="center" color="primary.500">
                    {score}
                  </Heading>
                </View>

                <Spacer size="md" />

                {/* Vocabulary mastery progress */}
                {vocabularyStats && (
                  <View style={styles.masteryContainer}>
                    <Text weight="semibold" align="center">
                      Vocabulary Mastery
                    </Text>
                    <Spacer size="xs" />
                    <ModernProgressBar
                      progress={
                        vocabularyStats.byLevel[difficulty]?.percentage || 0
                      }
                      height={8}
                      color={
                        difficulty === "beginner"
                          ? modernTheme.colors.success[500]
                          : difficulty === "intermediate"
                          ? modernTheme.colors.warning[500]
                          : modernTheme.colors.error[500]
                      }
                    />
                    <Spacer size="xs" />
                    <Text size="sm" align="center">
                      {vocabularyStats.byLevel[difficulty]?.mastered || 0} of{" "}
                      {vocabularyStats.byLevel[difficulty]?.total || 0} words
                      mastered
                    </Text>
                  </View>
                )}

                <Spacer size="lg" />

                <Row>
                  <ModernButton
                    text="Play Again"
                    variant="primary"
                    onPress={handlePlayAgain}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <ModernButton
                    text="Back to Home"
                    variant="outline"
                    onPress={handleBackToHome}
                    style={{ flex: 1, marginLeft: 8 }}
                  />
                </Row>

                <Spacer size="md" />

                <Row>
                  <ModernButton
                    text="Easier"
                    variant="subtle"
                    onPress={() => handleChangeDifficulty("beginner")}
                    style={{ flex: 1, marginRight: 4 }}
                    disabled={difficulty === "beginner"}
                  />
                  <ModernButton
                    text="Medium"
                    variant="subtle"
                    onPress={() => handleChangeDifficulty("intermediate")}
                    style={{ flex: 1, marginHorizontal: 4 }}
                    disabled={difficulty === "intermediate"}
                  />
                  <ModernButton
                    text="Harder"
                    variant="subtle"
                    onPress={() => handleChangeDifficulty("advanced")}
                    style={{ flex: 1, marginLeft: 4 }}
                    disabled={difficulty === "advanced"}
                  />
                </Row>
              </ModernCard>
            </View>
          ) : (
            // Active game
            <View style={styles.gameContainer}>
              <MatchWordGameEnhanced
                wordPairs={wordPairs}
                difficulty={difficulty}
                onComplete={() => setGameCompleted(true)}
                onScore={setScore}
              />
            </View>
          )}
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoText: {
    marginTop: 4,
  },
  startContainer: {
    padding: 16,
  },
  instructionsCard: {
    padding: 16,
  },
  instructionText: {
    marginTop: 8,
  },
  startButton: {
    alignSelf: "center",
    minWidth: 200,
  },
  gameContainer: {
    flex: 1,
    minHeight: 500,
  },
  completionContainer: {
    padding: 16,
  },
  completionCard: {
    padding: 16,
  },
  scoreContainer: {
    marginTop: 16,
  },
  masteryContainer: {
    marginTop: 16,
    width: "100%",
  },
});

export default MatchWordGameScreen;
