import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Easing,
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
 * Sentence Scramble Game Component
 * A game where users rearrange words to form a grammatically correct Korean sentence
 *
 * @param {Object} props - Component props
 * @param {string} props.lessonId - ID of the lesson this game is for
 * @param {Array} props.sentences - Array of sentence objects to use in the game
 * @param {Function} props.onComplete - Function to call when game is completed
 * @param {Function} props.onClose - Function to call when game is closed
 */
const SentenceScrambleGame = ({
  lessonId,
  sentences = [],
  onComplete,
  onClose,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { checkAchievements } = useAchievements();
  const { user } = useAuth();

  // Game state
  const [gameSentences, setGameSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Confetti ref
  const confettiRef = useRef(null);

  // Initialize game
  useEffect(() => {
    if (sentences.length > 0) {
      initializeGame(sentences);
    } else if (lessonId && lessonId !== "practice") {
      loadSentencesFromLesson(lessonId);
    } else {
      // Load content from new content service for practice mode
      loadContentFromService();
    }

    // Start game timer
    setStartTime(Date.now());
  }, [lessonId, sentences]);

  // Load content from the new game content service
  const loadContentFromService = async () => {
    try {
      setIsLoading(true);

      // Determine user level
      const userLevel = user?.preferences?.languageLevel || "beginner";

      console.log(
        `🎮 Loading Sentence Scramble content for level: ${userLevel}`
      );

      // Get content from the new service
      const content = await gameContentService.getSentenceScrambleContent({
        level: userLevel,
        count: 5,
      });

      console.log(`✅ Loaded ${content.length} sentences from content service`);

      if (content && content.length > 0) {
        initializeGame(content);
      } else {
        // Fallback to default sentences if service fails
        console.warn("⚠️ No content from service, using fallback");
        loadFallbackSentences();
      }
    } catch (error) {
      console.error("❌ Error loading content from service:", error);
      // Fallback to default sentences on error
      loadFallbackSentences();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback sentences if content service fails
  const loadFallbackSentences = () => {
    const fallbackSentences = [
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
        korean: "매일 운동을 해요",
        english: "I exercise every day",
        words: ["매일", "운동을", "해요"],
      },
    ];
    initializeGame(fallbackSentences);
  };

  // Load sentences from lesson
  const loadSentencesFromLesson = async (lessonId) => {
    try {
      setIsLoading(true);
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

      if (sentenceItems.length > 0) {
        initializeGame(sentenceItems);
      } else {
        // Use default sentences if no sentences found
        initializeGame([
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
        ]);
      }
    } catch (error) {
      console.error("Error loading lesson sentences:", error);
      // Use default sentences on error
      initializeGame([
        {
          korean: "저는 한국어를 공부해요",
          english: "I study Korean",
          words: ["저는", "한국어를", "공부해요"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize game with sentences
  const initializeGame = (sentenceList) => {
    // Shuffle sentences and create game state
    const shuffledSentences = [...sentenceList].sort(() => Math.random() - 0.5);
    const gameSentencesList = shuffledSentences.slice(0, 5); // Limit to 5 sentences for game
    setGameSentences(gameSentencesList);

    // Set up first sentence
    setupCurrentSentence(shuffledSentences[0]);

    // Initialize progress animation
    progressAnim.setValue(0);

    setIsLoading(false);
  };

  // Set up current sentence
  const setupCurrentSentence = (sentence) => {
    // Shuffle words for the current sentence
    const shuffled = [...sentence.words].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(null);
  };

  // Handle word selection
  const handleWordSelect = (word, index) => {
    if (isTransitioning || isCorrect !== null) return; // Prevent selection during transition or after completion

    // Add word to selected words
    const newSelectedWords = [...selectedWords, { word, originalIndex: index }];
    setSelectedWords(newSelectedWords);

    // Remove word from scrambled words
    const newScrambledWords = [...scrambledWords];
    newScrambledWords.splice(index, 1);
    setScrambledWords(newScrambledWords);

    // Check if all words have been selected
    if (newScrambledWords.length === 0) {
      // Check if sentence is correct
      const currentSentence = gameSentences[currentSentenceIndex];
      const selectedSentence = newSelectedWords
        .map((item) => item.word)
        .join(" ");

      const isAnswerCorrect =
        selectedSentence === currentSentence.words.join(" ");
      setIsCorrect(isAnswerCorrect);
      setIsTransitioning(true);

      if (isAnswerCorrect) {
        // Increase score and correct answers count
        setScore((prevScore) => prevScore + 200);
        setCorrectAnswers((prev) => prev + 1);
      }

      // Wait 1.5 seconds before moving to next sentence
      setTimeout(() => {
        moveToNextSentence();
      }, 1500);
    }
  };

  // Handle word deselection
  const handleWordDeselect = (index) => {
    if (isTransitioning || isCorrect !== null) return; // Prevent deselection during transition or after completion

    // Get the word and add it back to scrambled words
    const { word, originalIndex } = selectedWords[index];

    // Remove word from selected words
    const newSelectedWords = [...selectedWords];
    newSelectedWords.splice(index, 1);
    setSelectedWords(newSelectedWords);

    // Add word back to scrambled words
    setScrambledWords([...scrambledWords, word]);
  };

  // Move to next sentence
  const moveToNextSentence = () => {
    // Update progress bar animation
    const nextProgress = (currentSentenceIndex + 1) / gameSentences.length;
    Animated.timing(progressAnim, {
      toValue: nextProgress,
      duration: 400,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();

    // Animate transition to next sentence
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Move to next sentence or end game
      if (currentSentenceIndex < gameSentences.length - 1) {
        setCurrentSentenceIndex((prevIndex) => prevIndex + 1);

        // Set up next sentence
        setupCurrentSentence(gameSentences[currentSentenceIndex + 1]);
        setIsTransitioning(false);

        // Reset animations for next sentence
        slideAnim.setValue(width);

        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]).start();
      } else {
        // Game completed
        completeGame();
      }
    });
  };

  // Complete game and show results
  const completeGame = () => {
    const endTimeValue = Date.now();
    setEndTime(endTimeValue);

    const totalTime = (endTimeValue - startTime) / 1000; // in seconds
    const accuracy = (correctAnswers / gameSentences.length) * 100;

    // Calculate time bonus (faster = more points)
    const timeBonus = Math.max(0, 500 - Math.floor(totalTime) * 2);

    // Calculate accuracy bonus
    const accuracyBonus = Math.floor(accuracy) * 10;

    // Calculate final score
    const finalScore = score + timeBonus + accuracyBonus;

    // Prepare game results
    const results = {
      score: finalScore,
      accuracy: Math.round(accuracy),
      correctAnswers,
      totalQuestions: gameSentences.length,
      timeSpent: totalTime,
      rewards: [],
    };

    // Add rewards based on performance
    if (accuracy === 100) {
      results.rewards.push({
        type: "Perfect Score",
        points: 200,
        icon: "trophy",
      });
    }

    if (totalTime < 60) {
      results.rewards.push({
        type: "Fastest Time",
        points: 100,
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
      console.log("🎮 Awarding XP for sentence-scramble game completion");

      const xpResult = await xpService.awardGameXP(
        "sentence-scramble",
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
          "game-sentence-scramble"
        );

        // Save game-specific results
        await gameService.saveGameResults(
          "sentence-scramble",
          lessonId,
          results
        );

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

  // Render game results screen
  if (gameCompleted && gameResults) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.brandWhite,
        }}
      >
        {/* Enhanced Confetti */}
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

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header */}
          <Row
            justify="space-between"
            align="center"
            style={{
              marginBottom: theme.spacing.xl,
              paddingBottom: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.neutral[100],
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
              }}
            >
              Sentence Scramble Results
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

          {/* Enhanced Celebration Card */}
          <ModernCard
            style={{
              alignItems: "center",
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.xl,
              backgroundColor:
                gameResults.accuracy >= 90
                  ? "#FFD700" + "10"
                  : gameResults.accuracy >= 70
                  ? theme.colors.brandGreen + "10"
                  : theme.colors.brandWhite,
              borderRadius: 24,
              borderWidth: gameResults.accuracy >= 70 ? 2 : 1,
              borderColor:
                gameResults.accuracy >= 90
                  ? "#FFD700"
                  : gameResults.accuracy >= 70
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
            {/* Dynamic Emoji based on performance */}
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
                marginBottom: theme.spacing.lg,
              }}
            >
              {gameResults.accuracy >= 90
                ? "Perfect performance! You're a sentence master!"
                : gameResults.accuracy >= 70
                ? "Great job mastering sentence scrambling!"
                : gameResults.accuracy >= 50
                ? "Good progress! Keep practicing to improve!"
                : "Every attempt makes you better. Try again!"}
            </Text>

            {/* Progress Bar */}
            <View
              style={{
                width: "100%",
                height: 8,
                backgroundColor: theme.colors.neutral[200],
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${gameResults.accuracy}%`,
                  height: "100%",
                  backgroundColor:
                    gameResults.accuracy >= 90
                      ? "#FFD700"
                      : gameResults.accuracy >= 70
                      ? theme.colors.brandGreen
                      : theme.colors.neutral[400],
                  borderRadius: 4,
                }}
              />
            </View>

            {/* Performance Level Badge */}
            <View
              style={{
                marginTop: theme.spacing.md,
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor:
                  gameResults.accuracy >= 90
                    ? "#FFD700" + "20"
                    : gameResults.accuracy >= 70
                    ? theme.colors.brandGreen + "20"
                    : gameResults.accuracy >= 50
                    ? "#FF6B35" + "20"
                    : theme.colors.neutral[200],
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
                  fontSize: 14,
                  fontFamily: theme.typography.fontFamily.bold,
                  textAlign: "center",
                }}
              >
                {gameResults.accuracy >= 90
                  ? "EXPERT LEVEL"
                  : gameResults.accuracy >= 70
                  ? "ADVANCED LEVEL"
                  : gameResults.accuracy >= 50
                  ? "INTERMEDIATE LEVEL"
                  : "BEGINNER LEVEL"}
              </Text>
            </View>
          </ModernCard>

          {/* Enhanced Main Stats Cards */}
          <Row
            justify="space-between"
            style={{ marginBottom: theme.spacing.lg }}
          >
            <ModernCard
              style={{
                flex: 1,
                alignItems: "center",
                padding: theme.spacing.lg,
                marginRight: theme.spacing.sm,
                backgroundColor: "#FFD700" + "10",
                borderRadius: 20,
                borderWidth: 2,
                borderColor: "#FFD700" + "40",
                shadowColor: "#FFD700",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#FFD700" + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: "#FFD700" + "30",
                }}
              >
                <Ionicons name="star" size={28} color="#FFD700" />
              </View>
              <Text
                style={{
                  fontSize: 32,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 4,
                }}
              >
                {gameResults.score}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.semibold,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                TOTAL SCORE
              </Text>
            </ModernCard>

            <ModernCard
              style={{
                flex: 1,
                alignItems: "center",
                padding: theme.spacing.lg,
                marginLeft: theme.spacing.sm,
                backgroundColor:
                  gameResults.accuracy >= 70
                    ? theme.colors.brandGreen + "10"
                    : theme.colors.neutral[100],
                borderRadius: 20,
                borderWidth: 2,
                borderColor:
                  gameResults.accuracy >= 70
                    ? theme.colors.brandGreen + "40"
                    : theme.colors.neutral[300],
                shadowColor:
                  gameResults.accuracy >= 70
                    ? theme.colors.brandGreen
                    : theme.colors.neutral[400],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor:
                    gameResults.accuracy >= 70
                      ? theme.colors.brandGreen + "20"
                      : theme.colors.neutral[200],
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor:
                    gameResults.accuracy >= 70
                      ? theme.colors.brandGreen + "30"
                      : theme.colors.neutral[300],
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={
                    gameResults.accuracy >= 70
                      ? theme.colors.brandGreen
                      : theme.colors.neutral[500]
                  }
                />
              </View>
              <Text
                style={{
                  fontSize: 32,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 4,
                }}
              >
                {gameResults.accuracy}%
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.semibold,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                ACCURACY
              </Text>
            </ModernCard>
          </Row>

          {/* Enhanced Secondary Stats */}
          <Row
            justify="space-between"
            style={{ marginBottom: theme.spacing.xl }}
          >
            <ModernCard
              style={{
                flex: 1,
                alignItems: "center",
                padding: theme.spacing.md,
                marginRight: theme.spacing.xs,
                backgroundColor: theme.colors.neutral[50],
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 2,
                }}
              >
                {gameResults.correctAnswers ||
                  Math.round((gameResults.score * gameResults.accuracy) / 100)}
                /{gameResults.totalQuestions || 10}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.semibold,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                CORRECT
              </Text>
            </ModernCard>

            <ModernCard
              style={{
                flex: 1,
                alignItems: "center",
                padding: theme.spacing.md,
                marginHorizontal: theme.spacing.xs,
                backgroundColor: theme.colors.neutral[50],
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 2,
                }}
              >
                {Math.round(gameResults.timeSpent || 120)}s
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.semibold,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                TIME
              </Text>
            </ModernCard>

            <ModernCard
              style={{
                flex: 1,
                alignItems: "center",
                padding: theme.spacing.md,
                marginLeft: theme.spacing.xs,
                backgroundColor: theme.colors.neutral[50],
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.neutral[200],
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginBottom: 2,
                }}
              >
                +{Math.floor(gameResults.score * 0.15)}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.semibold,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                BONUS
              </Text>
            </ModernCard>
          </Row>

          {/* Enhanced Rewards Section */}
          {gameResults.rewards && gameResults.rewards.length > 0 && (
            <ModernCard
              style={{
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
                backgroundColor: theme.colors.brandWhite,
                borderRadius: 20,
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
                    fontFamily: theme.typography.fontFamily.bold,
                    color: theme.colors.brandNavy,
                    flex: 1,
                  }}
                >
                  🎁 Rewards Earned
                </Text>
                <View
                  style={{
                    backgroundColor: theme.colors.brandGreen + "15",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.brandGreen + "30",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.brandGreen,
                      fontFamily: theme.typography.fontFamily.bold,
                    }}
                  >
                    +
                    {gameResults.rewards.reduce(
                      (sum, reward) => sum + reward.points,
                      0
                    )}{" "}
                    pts
                  </Text>
                </View>
              </Row>

              {gameResults.rewards.map((reward, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: theme.colors.neutral[50],
                    borderRadius: 16,
                    padding: theme.spacing.md,
                    marginBottom:
                      index < gameResults.rewards.length - 1 ? 12 : 0,
                    borderWidth: 1,
                    borderColor: theme.colors.neutral[100],
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
                          fontFamily: theme.typography.fontFamily.bold,
                          color: theme.colors.brandNavy,
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
                        Earned +{reward.points} points
                      </Text>
                    </Column>
                    <View
                      style={{
                        backgroundColor: theme.colors.brandGreen,
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.brandWhite,
                          fontSize: 14,
                          fontFamily: theme.typography.fontFamily.bold,
                        }}
                      >
                        +{reward.points}
                      </Text>
                    </View>
                  </Row>
                </View>
              ))}
            </ModernCard>
          )}

          {/* Enhanced Action Buttons */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            {gameResults.accuracy < 70 && (
              <TouchableOpacity
                onPress={() => {
                  /* handle retry */
                }}
                style={{
                  backgroundColor: theme.colors.neutral[100],
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                  alignItems: "center",
                  marginBottom: theme.spacing.md,
                  borderWidth: 2,
                  borderColor: theme.colors.neutral[200],
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={theme.colors.neutral[600]}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: theme.colors.neutral[700],
                    fontSize: 16,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  Try Again
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleContinue}
              style={{
                backgroundColor: theme.colors.brandGreen,
                borderRadius: 16,
                padding: theme.spacing.lg,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                shadowColor: theme.colors.brandGreen,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  color: theme.colors.brandWhite,
                  fontSize: 16,
                  fontFamily: theme.typography.fontFamily.bold,
                  marginRight: 8,
                }}
              >
                Continue Learning
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.brandWhite}
              />
            </TouchableOpacity>
          </View>
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

  // Get current sentence
  const currentSentence = gameSentences[currentSentenceIndex];

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
            Sentence Scramble
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
            Sentence {currentSentenceIndex + 1} of {gameSentences.length}
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
          paddingTop: theme.spacing.lg,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* English Sentence Display */}
        <ModernCard
          style={{
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 16,
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
            REARRANGE TO FORM KOREAN SENTENCE
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            "{currentSentence.english}"
          </Text>
        </ModernCard>

        {/* Selected words area */}
        <ModernCard
          style={{
            minHeight: 80,
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.neutral[25],
            borderRadius: 16,
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
            YOUR SENTENCE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              minHeight: 44,
            }}
          >
            {selectedWords.map((item, index) => (
              <TouchableOpacity
                key={`selected-${index}-${item.word}`}
                style={{
                  backgroundColor:
                    isCorrect !== null
                      ? isCorrect
                        ? theme.colors.brandGreen + "15"
                        : "#FF5757" + "15"
                      : theme.colors.brandGreen + "10",
                  borderRadius: 20,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  margin: 4,
                  borderWidth: 2,
                  borderColor:
                    isCorrect !== null
                      ? isCorrect
                        ? theme.colors.brandGreen
                        : "#FF5757"
                      : theme.colors.brandGreen + "30",
                }}
                onPress={() => handleWordDeselect(index)}
                disabled={isCorrect !== null || isTransitioning}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color:
                      isCorrect !== null
                        ? isCorrect
                          ? theme.colors.brandGreen
                          : "#FF5757"
                        : theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.medium,
                  }}
                >
                  {item.word}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ModernCard>

        {/* Scrambled words area */}
        <Column style={{ flex: 1, gap: 12 }}>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.neutral[500],
              fontFamily: theme.typography.fontFamily.medium,
              textTransform: "uppercase",
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            TAP WORDS TO BUILD SENTENCE
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {scrambledWords.map((word, index) => (
              <TouchableOpacity
                key={`scrambled-${index}-${word}`}
                style={{
                  backgroundColor: theme.colors.neutral[50],
                  borderRadius: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderWidth: 2,
                  borderColor: theme.colors.neutral[200],
                }}
                onPress={() => handleWordSelect(word, index)}
                disabled={isCorrect !== null || isTransitioning}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.medium,
                  }}
                >
                  {word}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Column>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </Animated.View>
    </View>
  );
};

export default SentenceScrambleGame;
