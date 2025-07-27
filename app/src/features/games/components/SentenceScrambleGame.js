import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Easing,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { useTheme } from "../../../shared/context/ThemeContext";
import { BRAND_COLORS } from "../../../shared/constants/colors";
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
import GameResultsPage from "./GameResultsPage";

const { width, height } = Dimensions.get("window");

// Helper function for cross-platform font families
const getFontFamily = (weight = 'regular') => {
  if (Platform.OS === 'web') {
    return 'Montserrat, sans-serif';
  }

  const fontMap = {
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extrabold: 'Montserrat-ExtraBold',
  };

  return fontMap[weight] || fontMap.regular;
};

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
  userLevel = 1, // Add user level prop for difficulty scaling
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
    // Reset game state when component mounts to ensure fresh start
    setGameCompleted(false);
    setGameResults(null);
    setCurrentSentenceIndex(0);
    setScrambledWords([]);
    setSelectedWords([]);
    setScore(0);
    setCorrectAnswers(0);
    setIsTransitioning(false);
    setStartTime(Date.now());

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

  // Calculate difficulty based on user level and question number
  const getDifficultySettings = (questionNumber) => {
    // Get user level from props or user data
    const actualUserLevel = userLevel || user?.level || user?.preferences?.level || 1;
    const progressionFactor = Math.floor(questionNumber / 3); // Increase difficulty every 3 questions
    const currentDifficulty = Math.min(actualUserLevel + progressionFactor, 5); // Cap at level 5

    return {
      level: currentDifficulty,
      maxQuestions: Math.min(5 + currentDifficulty, 10), // 6-10 questions based on difficulty
      timeLimit: Math.max(30 - (currentDifficulty * 3), 15), // 15-30 seconds based on difficulty
      complexSentences: currentDifficulty >= 3, // Use complex sentences for level 3+
    };
  };

  // Filter sentences based on difficulty
  const filterSentencesByDifficulty = (sentencesToFilter, difficulty) => {
    if (!sentencesToFilter || sentencesToFilter.length === 0) return [];

    return sentencesToFilter.filter(sentence => {
      if (!sentence.words || !Array.isArray(sentence.words)) return false;

      const wordCount = sentence.words.length;

      // Filter by word count based on difficulty
      if (difficulty.level <= 2) {
        return wordCount >= 3 && wordCount <= 5; // Beginner: 3-5 words
      } else if (difficulty.level <= 4) {
        return wordCount >= 4 && wordCount <= 7; // Intermediate: 4-7 words
      } else {
        return wordCount >= 5 && wordCount <= 8; // Advanced: 5-8 words
      }
    });
  };

  // Initialize game with sentences
  const initializeGame = (sentenceList) => {
    console.log("🎮 Initializing game with sentences:", sentenceList.length);
    console.log("🎯 User level:", userLevel);

    // Apply difficulty filtering
    const difficulty = getDifficultySettings(0);
    const filteredSentences = filterSentencesByDifficulty(sentenceList, difficulty);

    console.log(`🎯 Difficulty level ${difficulty.level}: ${filteredSentences.length} suitable sentences`);

    // Use filtered sentences or fall back to original if no suitable ones found
    const sentencesToUse = filteredSentences.length > 0 ? filteredSentences : sentenceList;

    // Shuffle sentences and create game state
    const shuffledSentences = [...sentencesToUse].sort(() => Math.random() - 0.5);
    const gameSentencesList = shuffledSentences.slice(0, difficulty.maxQuestions); // Dynamic question count
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
        setScore((prevScore) => {
          console.log("✅ Correct answer! Score:", prevScore + 200);
          return prevScore + 200;
        });
        setCorrectAnswers((prev) => {
          console.log("✅ Correct answers count:", prev + 1);
          return prev + 1;
        });
      } else {
        console.log("❌ Incorrect answer");
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

    console.log("🎮 Game completion stats:", {
      correctAnswers,
      totalQuestions: gameSentences.length,
      accuracy,
      score,
      totalTime
    });

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

    console.log("🎮 Final game results:", results);

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

  // Render game results screen with standardized GameResultsPage
  if (gameCompleted && gameResults) {
    // Prepare data for the GameResultsPage component
    const resultsData = {
      score: gameResults.score,
      correctAnswers: gameResults.correctAnswers,
      totalQuestions: gameResults.totalQuestions,
      accuracy: gameResults.accuracy,
      timeSpent: gameResults.timeSpent || 120,
      xpEarned: Math.floor(gameResults.score * 0.15), // Calculate XP based on score
      incorrectAnswers: gameResults.totalQuestions - gameResults.correctAnswers,
    };

    console.log("🎮 SentenceScramble - Results data for GameResultsPage:", resultsData);
    console.log("🎮 SentenceScramble - Original gameResults:", gameResults);

    // Custom metrics specific to Sentence Scramble Game
    const customMetrics = {
      averageResponseTime: `${(gameResults.timeSpent / gameResults.totalQuestions).toFixed(1)}s`,
      sentenceStructureLevel: user?.preferences?.languageLevel || "Beginner",
      sentencesCompleted: gameResults.correctAnswers,
      grammarAccuracy: `${gameResults.accuracy}%`,
    };

    // Mock achievements for demonstration (replace with real achievement system)
    const achievements = [];
    if (gameResults.accuracy === 100) {
      achievements.push({
        id: "perfect_scramble",
        name: "Sentence Master!",
        icon: "trophy-outline",
        description: "Got 100% accuracy in sentence scrambling"
      });
    }
    if (gameResults.timeSpent < 90) {
      achievements.push({
        id: "speed_scrambler",
        name: "Speed Scrambler",
        icon: "flash-outline",
        description: "Completed in under 90 seconds"
      });
    }
    if (gameResults.correctAnswers >= 8) {
      achievements.push({
        id: "grammar_guru",
        name: "Grammar Guru",
        icon: "school-outline",
        description: "Excellent sentence structure understanding"
      });
    }

    return (
      <GameResultsPage
        results={resultsData}
        gameType="sentence-scramble"
        onPlayAgain={() => {
          console.log("🔄 Retrying game...");
          // Reset all game state
          setGameCompleted(false);
          setGameResults(null);
          setCurrentSentenceIndex(0);
          setScore(0);
          setCorrectAnswers(0);
          setSelectedWords([]);
          setScrambledWords([]);
          setIsCorrect(null);
          setIsTransitioning(false);
          setStartTime(Date.now());
          setEndTime(null);

          // Reset animations
          fadeAnim.setValue(1);
          slideAnim.setValue(0);
          progressAnim.setValue(0);

          // Reinitialize the game with existing sentences
          if (gameSentences.length > 0) {
            console.log("🎮 Reinitializing game with existing sentences");
            initializeGame(gameSentences);
          } else {
            console.log("🎮 Loading new content for retry");
            // Reload content if no sentences available
            if (sentences.length > 0) {
              initializeGame(sentences);
            } else if (lessonId && lessonId !== "practice") {
              loadSentencesFromLesson(lessonId);
            } else {
              loadContentFromService();
            }
          }
        }}
        onContinue={handleContinue}
        onBackToGames={handleClose}
        achievements={achievements}
        customMetrics={customMetrics}
      />
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
          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
        }}
      >
        <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: BRAND_COLORS.SHADOW_GREY,
            fontFamily: getFontFamily('medium'),
          }}
        >
          Loading game...
        </Text>
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
          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
        }}
      >
        <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: BRAND_COLORS.SHADOW_GREY,
            fontFamily: getFontFamily('medium'),
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
        backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
      }}
    >
      {/* Modern Progress Section */}
      <View
        style={{
          paddingHorizontal: 16, // theme.spacing.md
          paddingVertical: 8,    // theme.spacing.sm
          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
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
          // paddingTop: theme.spacing.lg,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* English Sentence Display */}
        <ModernCard
          style={{
            backgroundColor: theme.colors.brandWhite,
            borderRadius: 16,
            // padding: theme.spacing.xl,
            alignItems: "center",
            // marginBottom: theme.spacing.lg,
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

// Modern Results Page Styles
const styles = StyleSheet.create({
  // Results Container
  resultsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: getFontFamily('bold'),
    color: '#0A2240',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: '#666',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 32,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FFFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  performanceEmoji: {
    fontSize: 64,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: getFontFamily('bold'),
    color: '#0A2240',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  accuracyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6FC935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyPercentage: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  accuracyLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('medium'),
    color: 'white',
    opacity: 0.9,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: '#0A2240',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('medium'),
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Insight Cards
  insightCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('semibold'),
    color: '#0A2240',
    marginLeft: 12,
  },
  insightText: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#666',
    lineHeight: 20,
  },

  // Action Buttons
  actionButtons: {
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: '#666',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6FC935',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
});

export default SentenceScrambleGame;
