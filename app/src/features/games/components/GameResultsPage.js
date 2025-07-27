/**
 * GameResultsPage - Modern, Reusable Game Results Component
 * Follows Miles-inspired design system with BRAND_COLORS
 * Supports all game types with flexible data structure
 *
 * PROPS INTERFACE:
 *
 * @param {Object} results - Core game results
 * @param {number} results.score - Points earned (or number of correct answers)
 * @param {number} results.correctAnswers - Number of correct answers (preferred for display)
 * @param {number} results.totalQuestions - Total number of questions
 * @param {number} results.accuracy - Accuracy percentage (0-100)
 * @param {number} results.timeSpent - Time spent in seconds
 * @param {number} results.xpEarned - XP points earned
 * @param {number} results.correctAnswers - Number of correct answers
 * @param {number} results.incorrectAnswers - Number of incorrect answers
 *
 * @param {string} gameType - Game identifier
 * @param {string} gameType - "match-word" | "sentence-scramble" | "pronunciation-challenge"
 *
 * @param {Array} achievements - Unlocked achievements
 * @param {Object} achievement.id - Unique achievement ID
 * @param {string} achievement.name - Achievement display name
 * @param {string} achievement.icon - Ionicons icon name
 * @param {string} achievement.description - Achievement description
 *
 * @param {Object} customMetrics - Game-specific metrics
 * @param {any} customMetrics[key] - Any game-specific data
 *
 * EXAMPLE USAGE:
 *
 * // Match Word Game
 * const matchWordResults = {
 *   score: 8,
 *   totalQuestions: 10,
 *   accuracy: 80,
 *   timeSpent: 120,
 *   xpEarned: 25,
 *   correctAnswers: 8,
 *   incorrectAnswers: 2
 * };
 *
 * const customMetrics = {
 *   averageResponseTime: "3.2s",
 *   longestStreak: 5,
 *   vocabularyLevel: "Beginner"
 * };
 *
 * // Sentence Scramble Game
 * const sentenceResults = {
 *   score: 4,
 *   totalQuestions: 5,
 *   accuracy: 80,
 *   timeSpent: 180,
 *   xpEarned: 30,
 *   correctAnswers: 4,
 *   incorrectAnswers: 1
 * };
 *
 * const sentenceMetrics = {
 *   averageWordsPerSentence: 6,
 *   grammarAccuracy: "85%",
 *   difficultyLevel: "Intermediate"
 * };
 *
 * // Pronunciation Challenge
 * const pronunciationResults = {
 *   score: 3,
 *   totalQuestions: 5,
 *   accuracy: 60,
 *   timeSpent: 240,
 *   xpEarned: 20,
 *   correctAnswers: 3,
 *   incorrectAnswers: 2
 * };
 *
 * const pronunciationMetrics = {
 *   pronunciationAccuracy: "75%",
 *   clarityScore: "Good",
 *   accentImprovement: "+5%"
 * };
 */

import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { BRAND_COLORS } from "../../../shared/constants/colors";
import { Text, Heading } from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

/**
 * GameResultsPage Component
 * @param {Object} props
 * @param {Object} props.results - Game results data
 * @param {string} props.gameType - Type of game (match-word, sentence-scramble, etc.)
 * @param {Function} props.onPlayAgain - Callback for play again action
 * @param {Function} props.onContinue - Callback for continue action
 * @param {Function} props.onBackToGames - Callback for back to games action
 * @param {Array} props.achievements - Array of unlocked achievements
 * @param {Object} props.customMetrics - Game-specific metrics
 */
const GameResultsPage = ({
  results,
  gameType,
  onPlayAgain,
  onContinue,
  onBackToGames,
  achievements = [],
  customMetrics = {},
}) => {
  const theme = useTheme();
  const [animationProgress] = useState(new Animated.Value(0));
  const [showCelebration, setShowCelebration] = useState(false);

  // Determine performance level based on accuracy
  const getPerformanceLevel = (accuracy) => {
    if (accuracy >= 90) return "excellent";
    if (accuracy >= 70) return "good";
    return "needs_improvement";
  };

  const performanceLevel = getPerformanceLevel(results.accuracy);

  // Performance configuration
  const performanceConfig = {
    excellent: {
      color: BRAND_COLORS.EXPLORER_TEAL,
      backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "15",
      icon: "trophy-outline",
      title: "Excellent Work!",
      message: "Outstanding performance! You're mastering Korean beautifully.",
      celebration: true,
    },
    good: {
      color: BRAND_COLORS.OCEAN_BLUE,
      backgroundColor: BRAND_COLORS.OCEAN_BLUE + "15",
      icon: "thumbs-up-outline",
      title: "Great Job!",
      message: "Good progress! Keep practicing to improve further.",
      celebration: false,
    },
    needs_improvement: {
      color: BRAND_COLORS.WARM_CORAL,
      backgroundColor: BRAND_COLORS.WARM_CORAL + "15",
      icon: "school-outline",
      title: "Keep Learning!",
      message: "Practice makes perfect. Try again to improve your score!",
      celebration: false,
    },
  };

  const config = performanceConfig[performanceLevel];

  // Animation effects
  useEffect(() => {
    // Trigger celebration animation for excellent performance
    if (config.celebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Animate progress bars and metrics
    Animated.timing(animationProgress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Render metric card
  const renderMetricCard = (icon, label, value, color = BRAND_COLORS.OCEAN_BLUE) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );

  // Render achievement badge
  const renderAchievementBadge = (achievement) => (
    <View key={achievement.id} style={styles.achievementBadge}>
      <View style={styles.achievementIcon}>
        <Ionicons
          name={achievement.icon && achievement.icon.trim() ? achievement.icon : "star-outline"}
          size={20}
          color={BRAND_COLORS.GOLDEN_AMBER}
        />
      </View>
      <Text style={styles.achievementText}>{achievement.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Celebration Animation Overlay */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <LottieView
            source={require("../../../assets/animations/celebration.json")}
            autoPlay
            loop={false}
            style={styles.celebrationAnimation}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: config.backgroundColor }]}>
          <View style={styles.headerContent}>
            <View style={[styles.performanceIcon, { backgroundColor: config.color + "20" }]}>
              <Ionicons name={config.icon} size={32} color={config.color} />
            </View>

            <Heading style={[styles.performanceTitle, { color: config.color }]}>
              {config.title}
            </Heading>

            <Text style={styles.performanceMessage}>
              {config.message}
            </Text>
          </View>
        </View>

        {/* Main Metrics Card */}
        <View style={styles.metricsCard}>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              "checkmark-circle-outline",
              "Score",
              `${results.correctAnswers !== undefined ? results.correctAnswers : Math.floor(results.score / 100)}/${results.totalQuestions}`,
              config.color
            )}

            {renderMetricCard(
              "analytics-outline",
              "Accuracy",
              `${results.accuracy}%`,
              results.accuracy >= 70 ? BRAND_COLORS.EXPLORER_TEAL : BRAND_COLORS.WARM_CORAL
            )}

            {renderMetricCard(
              "time-outline",
              "Time",
              formatTime(results.timeSpent),
              BRAND_COLORS.OCEAN_BLUE
            )}

            {renderMetricCard(
              "flash-outline",
              "XP Earned",
              `+${results.xpEarned}`,
              BRAND_COLORS.GOLDEN_AMBER
            )}
          </View>
        </View>

        {/* Progress Bar Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Accuracy Progress</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", `${results.accuracy}%`],
                  }),
                  backgroundColor: config.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: config.color }]}>
            {results.accuracy}% Complete
          </Text>
        </View>

        {/* Custom Metrics (Game-specific) */}
        {Object.keys(customMetrics).length > 0 && (
          <View style={styles.customMetricsCard}>
            <Text style={styles.sectionTitle}>Game Details</Text>
            {Object.entries(customMetrics).map(([key, value]) => (
              <View key={key} style={styles.customMetricRow}>
                <Text style={styles.customMetricLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={styles.customMetricValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <View style={styles.achievementsCard}>
            <Text style={styles.sectionTitle}>🏆 Achievements Unlocked</Text>
            <View style={styles.achievementsContainer}>
              {achievements.map(renderAchievementBadge)}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Play Again Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.playAgainButton]}
            onPress={onPlayAgain}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BRAND_COLORS.EXPLORER_TEAL, BRAND_COLORS.OCEAN_BLUE]}
              style={styles.gradientButton}
            >
              <Ionicons name="refresh-outline" size={20} color={BRAND_COLORS.WHISPER_WHITE} />
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward-outline" size={18} color={BRAND_COLORS.OCEAN_BLUE} />
              <Text style={styles.secondaryButtonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onBackToGames}
              activeOpacity={0.8}
            >
              <Ionicons name="grid-outline" size={18} color={BRAND_COLORS.SHADOW_GREY} />
              <Text style={styles.secondaryButtonText}>All Games</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  celebrationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  celebrationAnimation: {
    width: screenWidth,
    height: screenWidth,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 0,
  },
  headerContent: {
    alignItems: "center",
  },
  performanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  performanceMessage: {
    fontSize: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: "center",
    lineHeight: 22,
  },
  metricsCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: BRAND_COLORS.SHADOW_GREY + "20",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  customMetricsCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: BRAND_COLORS.OCEAN_BLUE + "20",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 16,
  },
  customMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.SHADOW_GREY + "20",
  },
  customMetricLabel: {
    fontSize: 14,
    color: BRAND_COLORS.SHADOW_GREY,
  },
  customMetricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.OCEAN_BLUE,
  },
  achievementsCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: BRAND_COLORS.GOLDEN_AMBER + "30",
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.GOLDEN_AMBER + "15",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  achievementIcon: {
    marginRight: 6,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.GOLDEN_AMBER,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 0,
  },
  playAgainButton: {
    marginBottom: 16,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: BRAND_COLORS.WHISPER_WHITE,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "30",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.OCEAN_BLUE,
    marginLeft: 6,
  },
};

export default GameResultsPage;
