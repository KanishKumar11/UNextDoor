/**
 * Match Word Game Component - Modernized with GameResultsPage Integration
 * A game where users match Korean words with their English translations
 * Now uses the reusable GameResultsPage component for consistent results display
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BRAND_COLORS } from "../../../shared/constants/colors";
import {
  Text,
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
 * Match Word Game Component
 * A game where users match Korean words with their English translations
 *
 * @param {Object} props
 * @param {string} props.lessonId - ID of the lesson (optional)
 * @param {Array} props.words - Array of word objects (optional)
 * @param {Function} props.onComplete - Callback when game is completed
 * @param {Function} props.onClose - Callback when game is closed
 */
const MatchWordGame = ({ lessonId, words = [], onComplete, onClose }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { checkAchievements } = useAchievements();

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(1)).current;

  // Initialize game
  useEffect(() => {
    // Reset game state when component mounts to ensure fresh start
    setGameCompleted(false);
    setGameResults(null);
    setCurrentWordIndex(0);
    setSelectedOption(null);
    setScore(0);
    setCorrectAnswers(0);
    setIsTransitioning(false);
    setStartTime(Date.now());

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

  // Load content from the new game content service with comprehensive error handling
  const loadContentFromService = async () => {
    try {
      setIsLoading(true);

      // Determine user level
      const userLevel = user?.preferences?.languageLevel || "beginner";

      console.log(`🎮 Loading Match Word content for level: ${userLevel}`);
      console.log(`🔍 Attempting to connect to game content API...`);

      try {
        // Get content from the new service
        const content = await gameContentService.getMatchWordContent({
          level: userLevel,
          count: 10,
        });

        console.log(`✅ Successfully loaded ${content.length} words from API service`);

        if (content && content.length > 0) {
          console.log(`🎯 Initializing game with fresh API content - server connection successful!`);
          initializeGame(content);
          return;
        } else {
          console.warn(`⚠️ API returned empty content, using fallback`);
        }
      } catch (serviceError) {
        // Categorize the error for better user feedback
        if (serviceError.message.includes('API_ENDPOINT_NOT_FOUND')) {
          console.warn("🔧 API endpoint not available - server may be down or endpoint missing");
        } else if (serviceError.message.includes('API_AUTH_ERROR')) {
          console.warn("🔐 Authentication issue - user may need to log in again");
        } else if (serviceError.message.includes('API_NETWORK_ERROR')) {
          console.warn("🌐 Network connectivity issue - check internet connection");
        } else {
          console.warn("⚠️ Unknown API error:", serviceError.message);
        }

        console.log("🔄 Falling back to offline content to ensure game functionality");
      }

      // Always fallback to ensure game works
      loadFallbackWords();
    } catch (error) {
      console.error("❌ Critical error in content loading:", error);
      // Ensure game always works with fallback content
      loadFallbackWords();
    } finally {
      setIsLoading(false);
    }
  };

  // Comprehensive fallback words if content service fails
  const loadFallbackWords = () => {
    const fallbackWords = [
      // Essential Greetings
      {
        korean: "안녕하세요",
        english: "Hello",
        romanization: "annyeonghaseyo",
      },
      {
        korean: "안녕히 가세요",
        english: "Goodbye",
        romanization: "annyeonghi gaseyo",
      },
      {
        korean: "감사합니다",
        english: "Thank you",
        romanization: "gamsahamnida",
      },
      {
        korean: "죄송합니다",
        english: "I'm sorry",
        romanization: "joesonghamnida",
      },
      {
        korean: "실례합니다",
        english: "Excuse me",
        romanization: "sillyehamnida",
      },

      // Basic Responses
      { korean: "네", english: "Yes", romanization: "ne" },
      { korean: "아니요", english: "No", romanization: "aniyo" },
      { korean: "괜찮아요", english: "It's okay", romanization: "gwaenchanayo" },

      // Essential Nouns
      { korean: "이름", english: "Name", romanization: "ireum" },
      { korean: "물", english: "Water", romanization: "mul" },
      { korean: "밥", english: "Rice/Food", romanization: "bap" },
      { korean: "집", english: "House", romanization: "jip" },
      { korean: "학교", english: "School", romanization: "hakgyo" },
      { korean: "친구", english: "Friend", romanization: "chingu" },
      { korean: "가족", english: "Family", romanization: "gajok" },

      // Numbers (1-5)
      { korean: "하나", english: "One", romanization: "hana" },
      { korean: "둘", english: "Two", romanization: "dul" },
      { korean: "셋", english: "Three", romanization: "set" },
      { korean: "넷", english: "Four", romanization: "net" },
      { korean: "다섯", english: "Five", romanization: "daseot" },
    ];

    console.log(`🔄 Using comprehensive fallback content (${fallbackWords.length} words)`);
    console.log(`📚 Fallback content ensures game functionality when API is unavailable`);
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
    const incorrectOptions = allWords
      .filter((word) => word.english !== correctOption)
      .map((word) => word.english)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [correctOption, ...incorrectOptions].sort(() => 0.5 - Math.random());
  };

  // Initialize game with words
  const initializeGame = (wordsList) => {
    const shuffledWords = [...wordsList].sort(() => 0.5 - Math.random());
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
  const handleOptionSelect = (selectedOption) => {
    if (isTransitioning) return;

    setSelectedOption(selectedOption);
    setIsTransitioning(true);

    const currentWord = gameWords[currentWordIndex];
    const isCorrect = selectedOption === currentWord.english;

    // Animate feedback
    Animated.parallel([
      Animated.timing(feedbackAnim, {
        toValue: 1.1,
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
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Move to next question after delay
    setTimeout(() => {
      if (currentWordIndex < gameWords.length - 1) {
        // Move to next word
        const nextIndex = currentWordIndex + 1;
        const nextWord = gameWords[nextIndex];
        const nextOptions = generateOptionsForWord(nextWord, gameWords);

        // Animate transition
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Update state
          setCurrentWordIndex(nextIndex);
          setCurrentOptions(nextOptions);
          setSelectedOption(null);
          setIsTransitioning(false);

          // Animate in new content
          slideAnim.setValue(50);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
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
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);
    const accuracy = Math.round((correctAnswers / gameWords.length) * 100);

    const results = {
      score: score,
      accuracy: accuracy,
      timeSpent: totalTime,
      correctAnswers: correctAnswers,
      totalQuestions: gameWords.length,
      longestStreak: correctAnswers, // Simplified for now
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

    // Check for achievements
    if (checkAchievements) {
      checkAchievements();
    }
  };

  // Award XP for game completion
  const awardGameXP = async (results) => {
    try {
      console.log("🎯 Awarding XP for game completion...");

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
      console.log("💾 Saving game results...");

      // Only save to API if not practice mode
      if (lessonId !== "practice") {
        // Award XP first
        await xpService.awardXP(
          user.id,
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

  // Render game results screen with new reusable component
  if (gameCompleted && gameResults) {
    // Prepare data for the new GameResultsPage component
    const resultsData = {
      score: gameResults.score,
      totalQuestions: gameWords.length,
      accuracy: gameResults.accuracy,
      timeSpent: gameResults.timeSpent,
      xpEarned: Math.floor(gameResults.score * 0.25), // Calculate XP based on score
      correctAnswers: gameResults.correctAnswers,
      incorrectAnswers: gameWords.length - gameResults.correctAnswers,
    };

    // Custom metrics specific to Match Word Game
    const customMetrics = {
      averageResponseTime: `${(gameResults.timeSpent / gameWords.length).toFixed(1)}s`,
      longestStreak: gameResults.longestStreak || 0,
      vocabularyLevel: user?.preferences?.languageLevel || "Beginner",
      wordsLearned: gameResults.correctAnswers,
    };

    // Mock achievements for demonstration (replace with real achievement system)
    const achievements = [];
    if (gameResults.accuracy === 100) {
      achievements.push({
        id: "perfect_score",
        name: "Perfect Score!",
        icon: "trophy-outline",
        description: "Got 100% accuracy"
      });
    }
    if (gameResults.timeSpent < 60) {
      achievements.push({
        id: "speed_demon",
        name: "Speed Demon",
        icon: "flash-outline",
        description: "Completed in under 1 minute"
      });
    }

    return (
      <GameResultsPage
        results={resultsData}
        gameType="match-word"
        onPlayAgain={() => {
          // Reset game state and start new game
          setGameCompleted(false);
          setGameResults(null);
          setCurrentWordIndex(0);
          setSelectedOption(null);
          setScore(0);
          setCorrectAnswers(0);
          setIsTransitioning(false);
          setStartTime(Date.now());

          // Reinitialize game with current words
          if (gameWords.length > 0) {
            const firstWordOptions = generateOptionsForWord(gameWords[0], gameWords);
            setCurrentOptions(firstWordOptions);
          }

          // Reset animations
          fadeAnim.setValue(1);
          slideAnim.setValue(0);
          progressAnim.setValue(0);
          feedbackAnim.setValue(1);
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
        <Row justify="space-between" align="center" style={{}}>
          <Text
            style={{
              fontSize: 18,
              color: BRAND_COLORS.OCEAN_BLUE,
              fontFamily: getFontFamily('bold'),
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
              backgroundColor: BRAND_COLORS.SHADOW_GREY + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="close"
              size={18}
              color={BRAND_COLORS.SHADOW_GREY}
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
              color: BRAND_COLORS.SHADOW_GREY,
              fontFamily: getFontFamily('medium'),
            }}
          >
            Question {currentWordIndex + 1} of {gameWords.length}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: BRAND_COLORS.EXPLORER_TEAL,
              fontFamily: getFontFamily('semibold'),
            }}
          >
            Score: {score}
          </Text>
        </Row>

        {/* Animated Progress Bar */}
        <View
          style={{
            height: 8,
            backgroundColor: BRAND_COLORS.SHADOW_GREY + "30",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              height: "100%",
              backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
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
          paddingHorizontal: 16, // theme.spacing.md
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Korean Word Display */}
        <ModernCard
          style={{
            backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
            elevation: 0,
            borderRadius: 16,
            alignItems: "center",
            elevation: 0,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: BRAND_COLORS.SHADOW_GREY,
              fontFamily: getFontFamily('medium'),
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
              color: BRAND_COLORS.OCEAN_BLUE,
              fontFamily: getFontFamily('bold'),
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
                        ? BRAND_COLORS.EXPLORER_TEAL + "15"
                        : BRAND_COLORS.WARM_CORAL + "15"
                      : BRAND_COLORS.CARD_BACKGROUND,
                    borderRadius: 16,
                    padding: 16, // theme.spacing.md
                    borderWidth: 2,
                    borderColor: showFeedback
                      ? isCorrect
                        ? BRAND_COLORS.EXPLORER_TEAL
                        : BRAND_COLORS.WARM_CORAL
                      : BRAND_COLORS.EXPLORER_TEAL + "30",
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
                            ? BRAND_COLORS.EXPLORER_TEAL
                            : BRAND_COLORS.WARM_CORAL
                          : BRAND_COLORS.OCEAN_BLUE,
                        fontFamily: showFeedback
                          ? getFontFamily('semibold')
                          : getFontFamily('medium'),
                      }}
                    >
                      {option}
                    </Text>
                    {showFeedback && (
                      <Ionicons
                        name={isCorrect ? "checkmark-circle" : "close-circle"}
                        size={24}
                        color={isCorrect ? BRAND_COLORS.EXPLORER_TEAL : BRAND_COLORS.WARM_CORAL}
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