import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, Heading, ModernButton } from "../../../shared/components";
import { useTheme } from "../../../shared/context/ThemeContext";
import { BRAND_COLORS } from "../../../shared/constants/colors";
import { gameService } from "../../../features/games/services/gameService";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import { useAuth } from "../../../features/auth/context/AuthContext";

const { width } = Dimensions.get("window");

/**
 * Games Screen
 * Displays available games and practice options
 */
const GamesScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [games, setGames] = useState([]);
  const [recentLessons, setRecentLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load games and recent lessons
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Define the 4 specific games we want to show
        const specificGames = [
          {
            id: "match-word",
            name: "Match the Word",
            description: "Match Korean words with their meanings",
            icon: "link-outline",
            color: BRAND_COLORS.EXPLORER_TEAL,
            available: true,
            xpReward: 25,
          },
          {
            id: "sentence-scramble",
            name: "Sentence Scramble",
            description: "Arrange words to form correct sentences",
            icon: "shuffle-outline",
            color: BRAND_COLORS.RUCKSACK_BROWN,
            available: true,
            xpReward: 30,
          },
          {
            id: "pronunciation-challenge",
            name: "Pronunciation Challenge",
            description: "Practice speaking Korean words correctly",
            icon: "mic-outline",
            color: BRAND_COLORS.OCEAN_BLUE,
            available: true,
            xpReward: 35,
          },
          {
            id: "conversation-practice",
            name: "Conversation Quest",
            description: "Interactive conversation scenarios",
            icon: "chatbubbles-outline",
            color: BRAND_COLORS.OCEAN_BLUE,
            available: true,
            xpReward: 40,
          },
        ];

        setGames(specificGames);

        // Load recent lessons
        if (user) {
          try {
            const response = await curriculumService.getUserProgress();
            const lessons = response.data.lessons || [];

            // Get the 3 most recent lessons
            const recent = lessons
              .filter((lesson) => lesson.progress > 0)
              .sort(
                (a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)
              )
              .slice(0, 3);

            setRecentLessons(recent);
          } catch (error) {
            console.error("Error loading user progress:", error);
          }
        }
      } catch (error) {
        console.error("Error loading games data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Navigate to game screen
  const handleGameSelect = (game, lessonId) => {
    if (!game.available) {
      // Show coming soon alert
      Alert.alert(
        "Coming Soon",
        `${game.name} is currently under development and will be available soon!`,
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (game.id === "match-word") {
      router.push({
        pathname: "/games/match-word",
        params: { lessonId: lessonId || "practice" },
      });
    } else if (game.id === "sentence-scramble") {
      router.push({
        pathname: "/games/sentence-scramble",
        params: { lessonId: lessonId || "practice" },
      });
    } else if (game.id === "pronunciation-challenge") {
      router.push({
        pathname: "/games/pronunciation-challenge",
        params: { lessonId: lessonId || "practice" },
      });
    } else if (game.id === "conversation-practice") {
      router.push({
        pathname: "/games/conversation-quest",
        params: { lessonId: lessonId || "practice" },
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Heading level="h1" style={styles.title}>
          Games
        </Heading>
      </View>

      {/* Practice Section */}
      <View style={styles.section}>
        <View style={styles.gamesGrid}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[
                styles.gameCard,
                !game.available && styles.gameCardDisabled,
                { borderWidth: 1, borderColor: `${game.color}30` }, // Brand color border
              ]}
              onPress={() => handleGameSelect(game)}
            >
              <View
                style={[
                  styles.gameIconContainer,
                  { backgroundColor: `${game.color}15` }, // Lighter background
                ]}
              >
                <Ionicons name={game.icon} size={32} color={game.color} />
              </View>
              <Text
                weight="bold"
                style={[styles.gameName, { color: BRAND_COLORS.OCEAN_BLUE }]}
              >
                {game.name}
              </Text>
              <Text style={[styles.gameDescription, { color: "#666" }]}>
                {game.description}
              </Text>
              {game.xpReward && (
                <View style={[styles.xpBadge, { backgroundColor: BRAND_COLORS.RUCKSACK_BROWN }]}>
                  <Text style={styles.xpText}>+{game.xpReward} XP</Text>
                </View>
              )}
              {game.comingSoon && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* More games coming soon message */}
        <View style={styles.comingSoonMessage}>
          <Text style={[styles.comingSoonMessageText, { color: "#666" }]}>
            More games coming soon
          </Text>
        </View>
      </View>

      {/* Recent Lessons Section */}
      {recentLessons.length > 0 && (
        <View style={styles.section}>
          <Text weight="bold" style={styles.sectionTitle}>
            Recent Lessons
          </Text>

          <View style={styles.lessonsList}>
            {recentLessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => router.push(`/curriculum/lesson/${lesson.id}`)}
              >
                <View style={styles.lessonInfo}>
                  <Text weight="bold" style={styles.lessonTitle}>
                    {lesson.title}
                  </Text>
                  <Text style={styles.lessonProgress}>
                    {Math.round(lesson.progress * 100)}% complete
                  </Text>
                </View>

                <View style={styles.lessonActions}>
                  {games
                    .slice(0, 2)
                    .filter((game) => game.available)
                    .map((game) => (
                      <TouchableOpacity
                        key={game.id}
                        style={[
                          styles.gameButton,
                          { backgroundColor: `${game.color}20` },
                        ]}
                        onPress={() => handleGameSelect(game, lesson.id)}
                      >
                        <Ionicons
                          name={game.icon}
                          size={20}
                          color={game.color}
                        />
                      </TouchableOpacity>
                    ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
  },
  settingsButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gameCard: {
    width: (width - 48) / 2,
    // width: "100%",
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: "relative",
  },
  gameCardDisabled: {
    opacity: 0.6,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gameName: {
    fontSize: 16,
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: BRAND_COLORS.OCEAN_BLUE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  xpBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  comingSoonMessage: {
    alignItems: "center",
    marginTop: 16,
  },
  comingSoonMessageText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  lessonsList: {
    marginBottom: 8,
  },
  lessonCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  lessonProgress: {
    fontSize: 12,
    color: "#666",
  },
  lessonActions: {
    flexDirection: "row",
  },
  gameButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  achievementsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 16,
  },
  achievementsContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  achievementsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementsInfo: {
    flex: 1,
  },
  achievementsTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  achievementsDescription: {
    fontSize: 12,
    color: "#666",
  },
});

export default GamesScreen;
