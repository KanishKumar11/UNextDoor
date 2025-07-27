import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  Text,
  Heading,
  ModernButton,
  ModernCard,
  Row,
} from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";
import PersistentConversationView from "../../tutor/components/PersistentConversationView";
import { useAuth } from "../../auth/hooks/useAuth";
import { xpService } from "../../../shared/services/xpService";
import { gameService } from "../services/gameService";

const { width } = Dimensions.get("window");

/**
 * ConversationQuestGame Component
 * A game-like conversation experience with scoring, progress tracking, and results
 */
const ConversationQuestGame = ({ scenario, onComplete, onClose }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [conversationKey, setConversationKey] = useState(Date.now());

  // Scoring state (simplified)
  const [score, setScore] = useState(0);
  const [conversationQuality, setConversationQuality] = useState(0);

  // Refs
  const confettiRef = useRef(null);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setConversationKey(Date.now()); // Force fresh conversation
  };

  // Note: Scoring is now simplified since PersistentConversationView doesn't provide message callbacks
  // We'll award points based on time spent in conversation instead

  // Save game results and award XP
  const saveGameResultsAndAwardXP = async (results) => {
    try {
      console.log("💾 Saving conversation quest results:", results);

      // Award XP for conversation quest completion
      const xpAwarded = await xpService.awardGameXP(
        user.id,
        "conversation-quest",
        results.score,
        results.accuracy
      );

      console.log(`✅ XP awarded: ${xpAwarded} for conversation quest`);

      // Save detailed game results
      const gameData = {
        gameType: "conversation-quest",
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        score: results.score,
        accuracy: results.accuracy,
        duration: results.duration,
        targetDuration: results.targetDuration,
        xpAwarded: xpAwarded,
        completedAt: new Date().toISOString(),
      };

      await gameService.saveGameResults(user.id, gameData);
      console.log("✅ Conversation quest results saved successfully");

      // Update results with actual XP awarded
      results.xpAwarded = xpAwarded;
      results.rewards = [
        {
          type: "Conversation XP",
          points: xpAwarded,
          icon: "chatbubbles",
        },
      ];
    } catch (error) {
      console.error("❌ Error saving conversation quest results:", error);
      // Don't block the UI, just log the error
    }
  };

  // Handle conversation completion
  const handleConversationEnd = () => {
    if (!gameStarted || gameCompleted) return;

    const endTimeValue = Date.now();
    setEndTime(endTimeValue);

    const duration = (endTimeValue - startTime) / 1000; // in seconds
    const targetDuration = scenario.duration * 60; // convert to seconds

    // Calculate conversation quality based on duration (simplified scoring)
    const durationScore = Math.min((duration / targetDuration) * 100, 100);
    const engagementScore = duration >= 30 ? 100 : (duration / 30) * 100; // Minimum 30 seconds for full engagement

    const overallQuality = Math.round((durationScore + engagementScore) / 2);
    setConversationQuality(overallQuality);

    // Calculate final score based on time spent
    let finalScore = Math.round(duration * 2); // 2 points per second

    // Duration bonus (completed within target time)
    if (duration >= targetDuration * 0.8) {
      finalScore += 50;
    }

    // Engagement bonus (spent meaningful time)
    if (duration >= 60) {
      finalScore += 30;
    }

    // Completion bonus
    if (duration >= targetDuration) {
      finalScore += 20;
    }

    // Prepare results
    const results = {
      score: finalScore,
      accuracy: overallQuality,
      duration: Math.round(duration),
      targetDuration: Math.round(targetDuration),
      xpAwarded: scenario.xpReward,
      rewards: [
        {
          type: "Conversation XP",
          points: scenario.xpReward,
          icon: "chatbubbles",
        },
      ],
    };

    setGameResults(results);
    setGameCompleted(true);

    // Save game results and award XP
    saveGameResultsAndAwardXP(results);

    // Trigger confetti for good performance
    setTimeout(() => {
      if (confettiRef.current && overallQuality >= 70) {
        confettiRef.current.start();
      }
    }, 500);
  };

  // Handle manual game completion (when user wants to end early)
  const handleEndGame = () => {
    handleConversationEnd();
  };

  // Handle continue after results
  const handleContinue = () => {
    if (onComplete) {
      onComplete(gameResults);
    }
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Render game introduction
  if (!gameStarted) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversation Quest</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Scenario Introduction */}
        <View style={styles.introContainer}>
          <ModernCard style={styles.scenarioCard}>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.scenarioDescription}>
              {scenario.description}
            </Text>

            <View style={styles.scenarioDetails}>
              <Row justify="space-between" style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>
                  {scenario.duration} minutes
                </Text>
              </Row>
              <Row justify="space-between" style={styles.detailRow}>
                <Text style={styles.detailLabel}>XP Reward:</Text>
                <Text style={styles.detailValue}>+{scenario.xpReward} XP</Text>
              </Row>
            </View>

            {/* Vocabulary Preview */}
            <View style={styles.vocabularySection}>
              <Text style={styles.vocabularyTitle}>Key Vocabulary:</Text>
              <View style={styles.vocabularyList}>
                {scenario.vocabulary.slice(0, 3).map((word, index) => (
                  <View key={index} style={styles.vocabularyItem}>
                    <Text style={styles.vocabularyWord}>{word}</Text>
                  </View>
                ))}
                {scenario.vocabulary.length > 3 && (
                  <Text style={styles.vocabularyMore}>
                    +{scenario.vocabulary.length - 3} more
                  </Text>
                )}
              </View>
            </View>
          </ModernCard>

          <ModernButton
            text="Start Conversation"
            onPress={startGame}
            style={styles.startButton}
          />
        </View>
      </View>
    );
  }

  // Render game results
  if (gameCompleted && gameResults) {
    return (
      <View style={styles.container}>
        {/* Confetti */}
        {gameResults.accuracy >= 70 && (
          <ConfettiCannon
            ref={confettiRef}
            count={150}
            origin={{ x: width / 2, y: 0 }}
            autoStart={false}
            fadeOut={true}
            explosionSpeed={350}
            fallSpeed={2000}
            colors={[
              theme.colors.explorerTeal,
              "#FFD700",
              "#FF6B35",
              "#9B59B6",
              "#3498DB",
            ]}
          />
        )}

        {/* Results Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quest Complete!</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Results Content */}
        <View style={styles.resultsContainer}>
          {/* Celebration Card */}
          <ModernCard
            style={[
              styles.celebrationCard,
              {
                backgroundColor:
                  gameResults.accuracy >= 70
                    ? theme.colors.explorerTeal + "10"
                    : theme.colors.whisperWhite,
                borderColor:
                  gameResults.accuracy >= 70
                    ? theme.colors.explorerTeal
                    : theme.colors.neutral[200],
              },
            ]}
          >
            <Text style={styles.celebrationEmoji}>
              {gameResults.accuracy >= 70 ? "🏆" : "💬"}
            </Text>
            <Heading style={styles.celebrationTitle}>
              {gameResults.accuracy >= 70
                ? "Excellent Conversation!"
                : "Good Practice!"}
            </Heading>
            <Text style={styles.celebrationSubtitle}>
              {gameResults.accuracy >= 70
                ? "You had a great conversation!"
                : "Keep practicing to improve!"}
            </Text>
          </ModernCard>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{gameResults.score}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      gameResults.accuracy >= 70
                        ? theme.colors.explorerTeal
                        : theme.colors.neutral[500],
                  },
                ]}
              >
                {gameResults.accuracy}%
              </Text>
              <Text style={styles.statLabel}>Quality</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(gameResults.duration)}s</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>

          {/* Detailed Stats */}
          <ModernCard style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Conversation Details</Text>

            <Row justify="space-between" style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>
                {Math.floor(gameResults.duration / 60)}:
                {(gameResults.duration % 60).toString().padStart(2, "0")}
              </Text>
            </Row>

            <Row justify="space-between" style={styles.detailRow}>
              <Text style={styles.detailLabel}>XP Earned:</Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.explorerTeal }]}
              >
                +{gameResults.xpAwarded} XP
              </Text>
            </Row>
          </ModernCard>

          {/* Continue Button */}
          <ModernButton
            text="Continue"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>
      </View>
    );
  }

  // Render active conversation
  return (
    <View style={styles.container}>
      {/* Game Header with Score */}
      <View style={styles.gameHeader}>
        <View style={styles.gameInfo}>
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
        <View style={styles.gameActions}>
          <TouchableOpacity style={styles.endButton} onPress={handleEndGame}>
            <Text style={styles.endButtonText}>End Quest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversation Component */}
      <View style={styles.conversationContainer}>
        <PersistentConversationView
          key={conversationKey}
          scenarioId={scenario.id}
          level={user?.proficiencyLevel || "beginner"}
          onSessionEnd={() => {
            // Handle session end if needed
            console.log("Quest conversation session ended");
          }}
          style={styles.conversationComponent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  introContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  scenarioCard: {
    padding: 20,
    marginBottom: 20,
  },
  scenarioTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scenarioDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  scenarioDetails: {
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  vocabularySection: {
    marginTop: 16,
  },
  vocabularyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  vocabularyList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  vocabularyItem: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  vocabularyWord: {
    fontSize: 12,
  },
  vocabularyMore: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  startButton: {
    marginTop: 20,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  gameInfo: {
    flex: 1,
  },
  scoreText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  gameActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  endButton: {
    backgroundColor: "#ff6b35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  endButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  conversationContainer: {
    flex: 1,
  },
  conversationComponent: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  celebrationCard: {
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 20,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  continueButton: {
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: 80,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ConversationQuestGame;
