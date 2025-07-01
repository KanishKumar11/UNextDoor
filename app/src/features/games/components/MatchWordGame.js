import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Easing,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { useTheme } from "../../../shared/context/ThemeContext";
import {
  Text,
  Heading,
  Row,
  Column,
  ModernCard,
} from "../../../shared/components";
import { useAchievements } from "../../achievements/context/AchievementContext";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import { gameService } from "../services/gameService";
import { xpService } from "../../../shared/services/xpService";
import gameContentService from "../services/gameContentService";
import { useAuth } from "../../auth/hooks/useAuth";

const { width } = Dimensions.get("window");

/**
 * Match Word Game Component
 * A game where users match Korean words with their English translations
 *
 * @param {Object} props - Component props
 * @param {string} props.lessonId - ID of the lesson this game is for
 * @param {Array} props.words - Array of word pairs to match
 * @param {Function} props.onComplete - Function to call when game is completed
 * @param {Function} props.onClose - Function to call when game is closed
 */
const MatchWordGame = ({ lessonId, words = [], onComplete, onClose }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { checkAchievements } = useAchievements();
  const { user } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideInAnim = useRef(new Animated.Value(50)).current;
  // const progressAnim = useRef(new Animated.Value(0)).current;

  // Game state
  const [gameWords, setGameWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(1)).current;

  // Confetti ref
  const confettiRef = useRef(null);

  // Initialize game
  useEffect(() => {
    if (words.length > 0) {
      initializeGame(words);
    } else if (lessonId && lessonId !== "practice") {
      loadWordsFromLesson(lessonId);
    } else {
      // Load content from new content service for practice mode
      loadContentFromService();
    }

    // Start game timer
    setStartTime(Date.now());
  }, [lessonId, words]);

  // Load content from the new game content service
  const loadContentFromService = async () => {
    try {
      setIsLoading(true);

      // Determine user level
      const userLevel = user?.preferences?.languageLevel || "beginner";

      console.log(`🎮 Loading Match Word content for level: ${userLevel}`);

      // Get content from the new service
      const content = await gameContentService.getMatchWordContent({
        level: userLevel,
        count: 10,
      });

      console.log(`✅ Loaded ${content.length} words from content service`);

      if (content && content.length > 0) {
        initializeGame(content);
      } else {
        // Fallback to default words if service fails
        console.warn("⚠️ No content from service, using fallback");
        loadFallbackWords();
      }
    } catch (error) {
      console.error("❌ Error loading content from service:", error);
      // Fallback to default words on error
      loadFallbackWords();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback words if content service fails
  const loadFallbackWords = () => {
    const fallbackWords = [
      {
        korean: "안녕하세요",
        english: "Hello",
        romanization: "annyeonghaseyo",
      },
      {
        korean: "감사합니다",
        english: "Thank you",
        romanization: "gamsahamnida",
      },
      { korean: "네", english: "Yes", romanization: "ne" },
      { korean: "아니요", english: "No", romanization: "aniyo" },
      { korean: "이름", english: "Name", romanization: "ireum" },
      { korean: "물", english: "Water", romanization: "mul" },
      { korean: "밥", english: "Rice", romanization: "bap" },
      { korean: "집", english: "House", romanization: "jip" },
    ];
    initializeGame(fallbackWords);
  };

  // Load words from lesson
  const loadWordsFromLesson = async (lessonId) => {
    try {
      setIsLoading(true);
      const response = await curriculumService.getLesson(lessonId);
      const lesson = response.data.lesson;

      // Extract vocabulary from lesson
      const vocabularyItems = [];
      lesson.content.sections.forEach((section) => {
        if (section.type === "vocabulary") {
          section.items.forEach((item) => {
            vocabularyItems.push({
              korean: item.korean,
              english: item.english,
              romanization: item.romanization,
            });
          });
        }
      });

      if (vocabularyItems.length > 0) {
        initializeGame(vocabularyItems);
      } else {
        // Use default words if no vocabulary found
        initializeGame([
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
          { korean: "이름", english: "Name", romanization: "Ireum" },
        ]);
      }
    } catch (error) {
      console.error("Error loading lesson words:", error);
      // Use default words on error
      initializeGame([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate options for current word
  const generateOptionsForWord = (currentWord, allWords) => {
    const correctOption = currentWord.english;
    const otherOptions = allWords
      .filter((word) => word.english !== correctOption)
      .map((word) => word.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return [correctOption, ...otherOptions].sort(() => Math.random() - 0.5);
  };

  // Initialize game with words
  const initializeGame = (wordList) => {
    // Shuffle words and create game state
    const shuffledWords = [...wordList].sort(() => Math.random() - 0.5);
    const gameWordsList = shuffledWords.slice(0, 10); // Limit to 10 words for game
    setGameWords(gameWordsList);

    // Generate options for first word
    if (gameWordsList.length > 0) {
      const firstWordOptions = generateOptionsForWord(
        gameWordsList[0],
        gameWordsList
      );
      setCurrentOptions(firstWordOptions);
    }

    // Initialize progress animation
    progressAnim.setValue(0);

    setIsLoading(false);
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (isTransitioning) return; // Prevent multiple selections during transition

    setSelectedOption(option);
    setIsTransitioning(true);

    // Check if answer is correct
    const currentWord = gameWords[currentWordIndex];
    const isCorrect = option === currentWord.english;

    // Add subtle feedback animation
    Animated.sequence([
      Animated.timing(feedbackAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (isCorrect) {
      // Increase score and correct answers count
      setScore((prevScore) => prevScore + 100);
      setCorrectAnswers((prev) => prev + 1);
    }

    // Update progress bar animation immediately
    const nextProgress = (currentWordIndex + 1) / gameWords.length;
    Animated.timing(progressAnim, {
      toValue: nextProgress,
      duration: 600,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();

    // Show feedback briefly, then transition smoothly
    setTimeout(() => {
      // Move to next word or end game
      if (currentWordIndex < gameWords.length - 1) {
        const nextWordIndex = currentWordIndex + 1;

        // Prepare next word data before animation
        const nextWordOptions = generateOptionsForWord(
          gameWords[nextWordIndex],
          gameWords
        );

        // Smooth transition animation
        Animated.sequence([
          // Fade out current question
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          // Slide out current question
          Animated.timing(slideAnim, {
            toValue: -width * 0.3,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic),
          }),
        ]).start(() => {
          // Update state for next word
          setCurrentWordIndex(nextWordIndex);
          setSelectedOption(null);
          setCurrentOptions(nextWordOptions);

          // Reset position for slide in
          slideAnim.setValue(width * 0.3);

          // Slide in and fade in new question
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
          ]).start(() => {
            setIsTransitioning(false);
          });
        });
      } else {
        // Game completed - fade out before showing results
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          completeGame();
        });
      }
    }, 800); // Reduced delay for smoother flow
  };

  // Complete game and show results
  const completeGame = () => {
    const endTimeValue = Date.now();
    setEndTime(endTimeValue);

    const totalTime = (endTimeValue - startTime) / 1000; // in seconds
    const accuracy = (correctAnswers / gameWords.length) * 100;

    // Calculate time bonus (faster = more points)
    const timeBonus = Math.max(0, 500 - Math.floor(totalTime) * 2);

    // Calculate accuracy bonus
    const accuracyBonus = Math.floor(accuracy) * 5;

    // Calculate final score
    const finalScore = score + timeBonus + accuracyBonus;

    // Prepare game results
    const results = {
      score: finalScore,
      accuracy: Math.round(accuracy),
      correctAnswers,
      totalQuestions: gameWords.length,
      timeSpent: totalTime,
      rewards: [],
    };

    // Add rewards based on performance
    if (accuracy === 100) {
      results.rewards.push({
        type: "Perfect Score",
        points: 100,
        icon: "trophy",
      });
    }

    if (totalTime < 60) {
      results.rewards.push({
        type: "Fastest Time",
        points: 50,
        icon: "timer",
      });
    }

    // Save game results
    if (lessonId) {
      saveGameResults(lessonId, results);
    }

    // Award XP for game completion
    awardGameXP(results);

    setGameResults(results);
    setGameCompleted(true);

    // Trigger confetti for good performance
    setTimeout(() => {
      if (confettiRef.current && accuracy >= 70) {
        confettiRef.current.start();
      }
    }, 500);

    // Check for achievements
    if (checkAchievements) {
      checkAchievements();
    }
  };

  // Award XP for game completion
  const awardGameXP = async (results) => {
    try {
      console.log("🎮 Awarding XP for match-word game completion");

      const xpResult = await xpService.awardGameXP(
        "match-word",
        results.accuracy, // Use accuracy as score (0-100)
        {
          score: results.score,
          accuracy: results.accuracy,
          timeSpent: results.timeSpent,
          correctAnswers: results.correctAnswers,
          totalQuestions: results.totalQuestions,
        }
      );

      if (xpResult.success) {
        const xpAwarded = xpResult.data?.xpAwarded || xpResult.xpAwarded || 0;
        console.log(`✅ XP awarded: ${xpAwarded} XP`);

        // Show XP notification or update UI if needed
        // You could add a toast notification here
      } else {
        console.warn("⚠️ XP award failed:", xpResult.error);
      }
    } catch (error) {
      console.error("Error awarding game XP:", error);
      // Don't throw error to prevent game from breaking
    }
  };

  // Save game results to backend
  const saveGameResults = async (lessonId, results) => {
    try {
      console.log("🎮 Saving game results for lesson:", lessonId);

      // Only save if we have a valid lesson ID (not "practice")
      if (
        lessonId &&
        lessonId !== "practice" &&
        !lessonId.includes("practice")
      ) {
        // Update lesson progress
        await curriculumService.updateLessonProgress(
          lessonId,
          results.accuracy >= 70, // Mark as completed if accuracy is at least 70%
          results.score,
          results.score, // XP earned equals score
          "game-match-word"
        );

        // Save game-specific results
        await gameService.saveGameResults("match-word", lessonId, results);

        console.log("✅ Game results saved successfully");
      } else {
        console.log("ℹ️ Skipping API save for practice mode");
      }
    } catch (error) {
      console.error("Error saving game results:", error);
      // Don't throw error to prevent game from breaking
    }
  };

  // Handle continue button in results screen
  const handleContinue = () => {
    if (onComplete) {
      onComplete(gameResults);
    } else {
      // Navigate back to lesson or games screen
      router.back();
    }
  };

  // Handle close button
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Handle retry button
  const handleRetry = () => {
    // Reset all game state
    setCurrentWordIndex(0);
    setSelectedOption(null);
    setScore(0);
    setCorrectAnswers(0);
    setGameCompleted(false);
    setGameResults(null);
    setIsTransitioning(false);

    // Reset animations
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    progressAnim.setValue(0);
    feedbackAnim.setValue(1);

    // Regenerate options for first word
    if (gameWords.length > 0) {
      const firstWordOptions = generateOptionsForWord(gameWords[0], gameWords);
      setCurrentOptions(firstWordOptions);
    }

    // Restart timer
    setStartTime(Date.now());
    setEndTime(null);

    console.log("🔄 Game restarted");
  };

  // Render game results screen
  if (gameCompleted && gameResults) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.brandWhite,
        }}
      >
        {/* Enhanced Confetti with multiple triggers */}
        {gameResults.accuracy >= 70 && (
          <ConfettiCannon
            ref={confettiRef}
            count={200}
            origin={{ x: width / 2, y: height * 0.1 }}
            autoStart={false}
            fadeOut={true}
            explosionSpeed={400}
            fallSpeed={1500}
            colors={[
              theme.colors.brandGreen,
              "#FFD700",
              "#FF6B35",
              "#9B59B6",
              "#3498DB",
              "#E74C3C",
            ]}
          />
        )}

        {/* Header with enhanced styling */}
        <View
          style={{
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            backgroundColor: theme.colors.brandWhite,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.neutral[100],
            shadowColor: theme.colors.neutral[200],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Row justify="space-between" align="center">
            <Text
              style={{
                fontSize: 20,
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
              }}
            >
              Game Results
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.neutral[100],
                alignItems: "center",
                justifyContent: "center",
                shadowColor: theme.colors.neutral[300],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Ionicons
                name="close"
                size={20}
                color={theme.colors.neutral[600]}
              />
            </TouchableOpacity>
          </Row>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.lg,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Celebration Card with gradient background */}
          <ModernCard
            style={{
              alignItems: "center",
              padding: theme.spacing.xl,
              // marginBottom: theme.spacing.xl,
              backgroundColor:
                gameResults.accuracy >= 70
                  ? "linear-gradient(135deg, " +
                    theme.colors.brandGreen +
                    "15, " +
                    theme.colors.brandGreen +
                    "05)"
                  : theme.colors.brandWhite,
              borderRadius: 24,
              borderWidth: gameResults.accuracy >= 70 ? 2 : 1,
              borderColor:
                gameResults.accuracy >= 70
                  ? theme.colors.brandGreen
                  : theme.colors.neutral[200],
              shadowColor:
                gameResults.accuracy >= 70
                  ? theme.colors.brandGreen
                  : theme.colors.neutral[300],
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: gameResults.accuracy >= 70 ? 0.2 : 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {/* Animated emoji with pulse effect */}
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <Text
                style={{ fontSize: 80, marginBottom: 20, textAlign: "center" }}
              >
                {gameResults.accuracy >= 90
                  ? "🏆"
                  : gameResults.accuracy >= 70
                  ? "🎉"
                  : gameResults.accuracy >= 50
                  ? "👏"
                  : "💪"}
              </Text>
            </Animated.View>

            <Heading
              level="h1"
              style={{
                textAlign: "center",
                marginBottom: 12,
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
                fontSize: 28,
                letterSpacing: 0.5,
              }}
            >
              {gameResults.accuracy >= 90
                ? "Outstanding!"
                : gameResults.accuracy >= 70
                ? "Excellent!"
                : gameResults.accuracy >= 50
                ? "Well Done!"
                : "Keep Going!"}
            </Heading>

            <Text
              style={{
                textAlign: "center",
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 16,
                lineHeight: 22,
                paddingHorizontal: theme.spacing.sm,
              }}
            >
              {gameResults.accuracy >= 90
                ? "Perfect performance! You're a word master!"
                : gameResults.accuracy >= 70
                ? "Great job mastering the word matching!"
                : gameResults.accuracy >= 50
                ? "Good progress! Keep practicing to improve!"
                : "Every attempt makes you better. Try again!"}
            </Text>

            {/* Progress indicator */}
            <View
              style={{
                width: "100%",
                height: 6,
                backgroundColor: theme.colors.neutral[200],
                borderRadius: 3,
                marginTop: theme.spacing.lg,
                overflow: "hidden",
              }}
            >
              <Animated.View
                style={{
                  width: `${gameResults.accuracy}%`,
                  height: "100%",
                  backgroundColor:
                    gameResults.accuracy >= 70
                      ? theme.colors.brandGreen
                      : theme.colors.neutral[400],
                  borderRadius: 3,
                  transform: [{ scaleX: progressAnim }],
                }}
              />
            </View>
          </ModernCard>

          {/* Enhanced Stats Cards with better spacing and animations */}
          <Row
            justify="space-between"
            style={{ marginBottom: theme.spacing["2xl"] }}
          >
            <Animated.View
              style={{
                flex: 1,
                marginRight: theme.spacing.sm,
                transform: [{ translateY: slideInAnim }],
              }}
            >
              <ModernCard
                variant="outlined"
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 20,
                  padding: theme.spacing.lg,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: theme.colors.brandGreen + "30",
                  shadowColor: theme.colors.brandGreen,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    color: theme.colors.brandGreen,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {gameResults.score}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.semibold,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  SCORE
                </Text>
              </ModernCard>
            </Animated.View>

            <Animated.View
              style={{
                flex: 1,
                marginLeft: theme.spacing.sm,
                transform: [{ translateY: slideInAnim }],
              }}
            >
              <ModernCard
                variant="outlined"
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 20,
                  padding: theme.spacing.lg,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor:
                    gameResults.accuracy >= 70
                      ? theme.colors.brandGreen + "30"
                      : theme.colors.neutral[300],
                  shadowColor:
                    gameResults.accuracy >= 70
                      ? theme.colors.brandGreen
                      : theme.colors.neutral[400],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 36,
                    color:
                      gameResults.accuracy >= 70
                        ? theme.colors.brandGreen
                        : theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {gameResults.accuracy}%
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.semibold,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  ACCURACY
                </Text>
              </ModernCard>
            </Animated.View>
          </Row>

          {/* Enhanced Performance Breakdown */}
          <ModernCard
            style={{
              backgroundColor: theme.colors.brandWhite,
              borderRadius: 20,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              borderWidth: 1,
              borderColor: theme.colors.neutral[200],
              shadowColor: theme.colors.neutral[300],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
                marginBottom: theme.spacing.md,
              }}
            >
              Performance Breakdown
            </Text>

            <Row
              justify="space-between"
              style={{ marginBottom: theme.spacing.sm }}
            >
              <Text
                style={{
                  color: theme.colors.neutral[600],
                  fontSize: 15,
                  fontFamily: theme.typography.fontFamily.medium,
                }}
              >
                Correct Answers
              </Text>
              <Text
                style={{
                  color: theme.colors.brandGreen,
                  fontSize: 15,
                  fontFamily: theme.typography.fontFamily.bold,
                }}
              >
                {Math.round((gameResults.score * gameResults.accuracy) / 100)} /{" "}
                {gameResults.score}
              </Text>
            </Row>

            <Row
              justify="space-between"
              style={{ marginBottom: theme.spacing.sm }}
            >
              <Text
                style={{
                  color: theme.colors.neutral[600],
                  fontSize: 15,
                  fontFamily: theme.typography.fontFamily.medium,
                }}
              >
                Time Bonus
              </Text>
              <Text
                style={{
                  color: theme.colors.brandGreen,
                  fontSize: 15,
                  fontFamily: theme.typography.fontFamily.bold,
                }}
              >
                +{Math.floor(gameResults.score * 0.1)} pts
              </Text>
            </Row>

            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.neutral[200],
                marginVertical: theme.spacing.sm,
              }}
            />

            <Row justify="space-between">
              <Text
                style={{
                  color: theme.colors.brandNavy,
                  fontSize: 16,
                  fontFamily: theme.typography.fontFamily.bold,
                }}
              >
                Performance Level
              </Text>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor:
                    gameResults.accuracy >= 90
                      ? "#FFD700" + "20"
                      : gameResults.accuracy >= 70
                      ? theme.colors.brandGreen + "20"
                      : gameResults.accuracy >= 50
                      ? "#FF6B35" + "20"
                      : theme.colors.neutral[300],
                }}
              >
                <Text
                  style={{
                    color:
                      gameResults.accuracy >= 90
                        ? "#B8860B"
                        : gameResults.accuracy >= 70
                        ? theme.colors.brandGreen
                        : gameResults.accuracy >= 50
                        ? "#FF6B35"
                        : theme.colors.neutral[600],
                    fontSize: 13,
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  {gameResults.accuracy >= 90
                    ? "EXPERT"
                    : gameResults.accuracy >= 70
                    ? "ADVANCED"
                    : gameResults.accuracy >= 50
                    ? "INTERMEDIATE"
                    : "BEGINNER"}
                </Text>
              </View>
            </Row>
          </ModernCard>

          {/* Enhanced Rewards Section */}
          {gameResults.rewards && gameResults.rewards.length > 0 && (
            <ModernCard
              style={{
                backgroundColor: theme.colors.brandWhite,
                borderRadius: 20,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
                shadowColor: theme.colors.neutral[300],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Row align="center" style={{ marginBottom: theme.spacing.md }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    flex: 1,
                  }}
                >
                  Rewards Earned
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.brandGreen,
                    fontFamily: theme.typography.fontFamily.semibold,
                    backgroundColor: theme.colors.brandGreen + "15",
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  +
                  {gameResults.rewards.reduce(
                    (sum, reward) => sum + reward.points,
                    0
                  )}{" "}
                  pts
                </Text>
              </Row>

              {gameResults.rewards.map((reward, index) => (
                <Animated.View
                  key={index}
                  style={{
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 16,
                    padding: theme.spacing.md,
                    marginBottom:
                      index < gameResults.rewards.length - 1 ? 12 : 0,
                    borderWidth: 1,
                    borderColor: theme.colors.neutral[100],
                    // transform: [
                    //   {
                    //     translateX: new Animated.Value(-50).interpolate({
                    //       inputRange: [-50, 0],
                    //       outputRange: [-50, 0],
                    //     }),
                    //   },
                    // ],
                  }}
                >
                  <Row align="center">
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: theme.colors.brandGreen + "20",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 16,
                        borderWidth: 2,
                        borderColor: theme.colors.brandGreen + "30",
                      }}
                    >
                      <Ionicons
                        name={reward.icon || "trophy"}
                        size={24}
                        color={theme.colors.brandGreen}
                      />
                    </View>
                    <Column style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.bold,
                          marginBottom: 4,
                        }}
                      >
                        {reward.type}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.neutral[600],
                          fontFamily: theme.typography.fontFamily.medium,
                        }}
                      >
                        +{reward.points} points earned
                      </Text>
                    </Column>
                    <View
                      style={{
                        backgroundColor: theme.colors.brandGreen,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginLeft: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.brandWhite,
                          fontSize: 12,
                          fontFamily: theme.typography.fontFamily.bold,
                        }}
                      >
                        +{reward.points}
                      </Text>
                    </View>
                  </Row>
                </Animated.View>
              ))}
            </ModernCard>
          )}

          {/* Action Buttons */}
          <Row
            style={{
              marginBottom: theme.spacing.lg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* {gameResults.accuracy < 70 && (
              <TouchableOpacity
                onPress={handleRetry}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.neutral[100],
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                  alignItems: "center",
                  marginRight: theme.spacing.sm,
                  borderWidth: 2,
                  borderColor: theme.colors.neutral[200],
                }}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={theme.colors.neutral[600]}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={{
                    color: theme.colors.neutral[700],
                    fontSize: 15,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  Try Again
                </Text>
              </TouchableOpacity>
            )} */}

            <TouchableOpacity
              onPress={handleContinue}
              style={{
                // flex: gameResults.accuracy < 70 ? 1 : 2,
                backgroundColor: theme.colors.brandGreen,
                borderRadius: 16,
                padding: theme.spacing.lg,

                width: "100%",
                alignItems: "center",
                marginHorizontal: "auto",
                // marginLeft: gameResults.accuracy < 70 ? theme.spacing.sm : 0,
                shadowColor: theme.colors.brandGreen,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Row align="center">
                <Text
                  style={{
                    color: theme.colors.brandWhite,
                    fontSize: 16,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginRight: 8,
                  }}
                >
                  Continue
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.brandWhite}
                />
              </Row>
            </TouchableOpacity>
          </Row>
        </ScrollView>
      </View>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
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
    );
  }

  // Get current word and options
  const currentWord = gameWords[currentWordIndex];

  // Use stable options that don't regenerate on every render
  const options = currentOptions;

  // Safety check - don't render if we don't have current word or options
  if (!currentWord || !options || options.length === 0) {
    return (
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
          Preparing game...
        </Text>
      </View>
    );
  }

  // Render game screen
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.brandWhite,
      }}
    >
      {/* Modern Progress Section */}
      <View
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: theme.colors.brandWhite,
        }}
      >
        {/* Game Title */}
        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 18,
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.bold,
            }}
          >
            Match Word Game
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.neutral[100],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="close"
              size={18}
              color={theme.colors.neutral[600]}
            />
          </TouchableOpacity>
        </Row>

        {/* Progress Info */}
        <Row
          justify="space-between"
          align="center"
          style={{ marginBottom: 12 }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.neutral[600],
              fontFamily: theme.typography.fontFamily.medium,
            }}
          >
            Question {currentWordIndex + 1} of {gameWords.length}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.brandGreen,
              fontFamily: theme.typography.fontFamily.semibold,
            }}
          >
            Score: {score}
          </Text>
        </Row>

        {/* Animated Progress Bar */}
        <View
          style={{
            height: 8,
            backgroundColor: theme.colors.neutral[100],
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              height: "100%",
              backgroundColor: theme.colors.brandGreen,
              borderRadius: 4,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>
      </View>

      {/* Game Content */}
      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.md,
          // paddingTop: theme.spacing.lg,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Korean Word Display */}
        <ModernCard
          style={{
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 16,
            // borderWidth: 2,
            padding: theme.spacing.xl,
            alignItems: "center",
            marginBottom: theme.spacing.lg,
            elevation: 0,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.medium,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            TRANSLATE THIS WORD
          </Text>
          <Text
            style={{
              fontSize: 32,
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.bold,
              textAlign: "center",
              lineHeight: 70,
            }}
          >
            {currentWord.korean}
          </Text>
        </ModernCard>

        {/* Options */}
        <Column style={{ gap: 6 }}>
          {options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentWord.english;
            const showFeedback = isSelected;

            return (
              <Animated.View
                key={`${currentWordIndex}-${option}`}
                style={{
                  transform: [{ scale: isSelected ? feedbackAnim : 1 }],
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: showFeedback
                      ? isCorrect
                        ? theme.colors.brandGreen + "15"
                        : "#FF5757" + "15"
                      : theme.colors.neutral[50],
                    borderRadius: 16,
                    padding: theme.spacing.md,
                    borderWidth: 2,
                    borderColor: showFeedback
                      ? isCorrect
                        ? theme.colors.brandGreen
                        : "#FF5757"
                      : theme.colors.neutral[200],
                  }}
                  onPress={() => handleOptionSelect(option)}
                  disabled={selectedOption !== null || isTransitioning}
                >
                  <Row align="center" justify="center">
                    <Text
                      style={{
                        fontSize: 16,
                        align: "center",
                        justify: "center",
                        color: showFeedback
                          ? isCorrect
                            ? theme.colors.brandGreen
                            : "#FF5757"
                          : theme.colors.brandNavy,
                        fontFamily: showFeedback
                          ? theme.typography.fontFamily.semibold
                          : theme.typography.fontFamily.medium,
                      }}
                    >
                      {option}
                    </Text>
                    {showFeedback && (
                      <Ionicons
                        name={isCorrect ? "checkmark-circle" : "close-circle"}
                        size={24}
                        color={isCorrect ? theme.colors.brandGreen : "#FF5757"}
                      />
                    )}
                  </Row>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Column>

        {/* Bottom Padding */}
        <View style={{ height: 150 }} />
      </Animated.View>
    </View>
  );
};

export default MatchWordGame;
