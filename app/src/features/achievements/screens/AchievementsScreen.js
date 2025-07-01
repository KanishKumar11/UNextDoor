import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { useAchievements } from "../context/AchievementContext";
import { useNotifications } from "../../../shared/context/NotificationContext";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import {
  Container,
  Row,
  Column,
  Text,
  Heading,
  ModernCard,
} from "../../../shared/components";
import * as achievementService from "../services/achievementService";
import { curriculumService } from "../../curriculum/services/curriculumService";

/**
 * Modern Achievements Screen
 * Displays user achievements with modern design system
 */
const AchievementsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { checkAchievements } = useAchievements();
  const { markAsRead } = useNotifications();
  const params = useLocalSearchParams();

  // State management
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [userProgress, setUserProgress] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Achievement statistics
  const [stats, setStats] = useState({
    total: 0,
    earned: 0,
    percentage: 0,
    totalXP: 0,
  });

  // Achievement categories with modern icons
  const categories = [
    { id: "all", label: "All", icon: "grid", color: theme.colors.brandNavy },
    { id: "milestone", label: "Milestones", icon: "flag", color: "#FFD700" },
    { id: "streak", label: "Streaks", icon: "flame", color: "#FF6B35" },
    {
      id: "skill",
      label: "Skills",
      icon: "school",
      color: theme.colors.brandGreen,
    },
    { id: "special", label: "Special", icon: "star", color: "#9B59B6" },
  ];

  // Load achievements and user progress
  const loadAchievements = useCallback(
    async (isRefresh = false) => {
      if (!user) return;

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        // Load user achievements and progress in parallel
        const [achievementsData, progressData] = await Promise.all([
          achievementService.getUserAchievements(),
          curriculumService.getUserProgress().catch(() => ({ data: null })),
        ]);

        // Set user progress
        const progress = progressData.data?.progress || progressData.data;
        setUserProgress(progress);

        // Filter achievements by category
        const filteredAchievements =
          activeCategory === "all"
            ? achievementsData
            : achievementsData.filter((a) => a.category === activeCategory);

        setAchievements(filteredAchievements);

        // Calculate statistics
        const total = achievementsData.length;
        const earned = achievementsData.filter((a) => a.earned).length;
        const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
        const totalXP = achievementsData
          .filter((a) => a.earned)
          .reduce((sum, a) => sum + (a.xpReward || 0), 0);

        setStats({ total, earned, percentage, totalXP });

        // Animate content in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        console.log(
          `🏆 Loaded ${total} achievements, ${earned} earned (${percentage}%)`
        );
      } catch (error) {
        console.error("❌ Error loading achievements:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user, activeCategory, fadeAnim]
  );

  // Load data on mount and when category changes
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await checkAchievements(); // Check for new achievements
    await loadAchievements(true);
  }, [checkAchievements, loadAchievements]);

  // Handle achievement press
  const handleAchievementPress = useCallback(
    (achievement) => {
      setSelectedAchievement(achievement);
      setModalVisible(true);

      // Mark notification as read if coming from notification
      if (params.highlight === achievement.id) {
        markAsRead(`achievement-${achievement.id}`);
      }
    },
    [params.highlight, markAsRead]
  );

  // Close achievement detail modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedAchievement(null);
  }, []);

  // Get achievement icon color
  const getAchievementColor = (achievement) => {
    if (achievement.earned) {
      return achievement.color || "#FFD700";
    }
    return theme.colors.neutral[400];
  };

  // Get achievement progress
  const getAchievementProgress = (achievement) => {
    if (achievement.earned) return 100;
    return achievement.progress || 0;
  };

  // Format achievement criteria for display
  const formatCriteria = (achievement) => {
    // If no criteria object, use description or fallback
    if (!achievement.criteria || typeof achievement.criteria !== "object") {
      return achievement.description || "Complete the required actions";
    }

    const { type, threshold, additionalParams } = achievement.criteria;

    // Ensure threshold is a number
    const thresholdNum = Number(threshold) || 1;

    switch (type) {
      case "lessons_completed":
        return `Complete ${thresholdNum} lesson${thresholdNum > 1 ? "s" : ""}`;
      case "streak_days":
        return `Practice for ${thresholdNum} consecutive days`;
      case "vocabulary_learned":
        return `Learn ${thresholdNum} Korean words`;
      case "conversations_completed":
        return `Complete ${thresholdNum} AI conversation${
          thresholdNum > 1 ? "s" : ""
        }`;
      case "specific_lesson":
        return `Complete the specified lesson`;
      case "module_completed":
        return `Complete a learning module`;
      case "modules_completed":
        return `Complete ${thresholdNum} learning module${
          thresholdNum > 1 ? "s" : ""
        }`;
      case "curriculum_completed":
        return `Complete the entire curriculum`;
      case "total_xp":
        return `Earn ${thresholdNum} XP total`;
      case "games_completed":
        return `Complete ${thresholdNum} learning game${
          thresholdNum > 1 ? "s" : ""
        }`;
      case "practice_time_count":
        const beforeHour = additionalParams?.beforeHour;
        if (beforeHour) {
          return `Practice ${thresholdNum} time${
            thresholdNum > 1 ? "s" : ""
          } before ${beforeHour}:00 AM`;
        }
        return `Practice ${thresholdNum} time${thresholdNum > 1 ? "s" : ""}`;
      case "lesson_completion_time":
        const maxTime = additionalParams?.maxTimeMinutes;
        if (maxTime) {
          return `Complete a lesson in under ${maxTime} minutes`;
        }
        return `Complete lessons quickly`;
      case "pronunciation_accuracy":
        const exerciseCount = additionalParams?.exerciseCount;
        if (exerciseCount) {
          return `Achieve ${thresholdNum}% accuracy in ${exerciseCount} exercises`;
        }
        return `Achieve ${thresholdNum}% pronunciation accuracy`;
      default:
        return achievement.description || "Complete the required actions";
    }
  };

  // Render category filter button
  const renderCategoryButton = ({ item: category }) => {
    const isActive = activeCategory === category.id;
    return (
      <TouchableOpacity
        onPress={() => setActiveCategory(category.id)}
        style={{
          backgroundColor: isActive ? category.color + "15" : "transparent",
          borderWidth: 1,
          borderColor: isActive ? category.color : theme.colors.neutral[300],
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginRight: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons
          name={category.icon}
          size={16}
          color={isActive ? category.color : theme.colors.neutral[500]}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: isActive ? category.color : theme.colors.neutral[600],
            fontFamily: theme.typography.fontFamily.medium,
            fontSize: 12,
          }}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render achievement card
  const renderAchievementCard = ({ item: achievement, index }) => {
    const isEarned = achievement.earned;
    const progress = getAchievementProgress(achievement);
    const isHighlighted = params.highlight === achievement.id;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => handleAchievementPress(achievement)}
          activeOpacity={0.7}
          style={{ marginBottom: theme.spacing.md }}
        >
          <ModernCard
            style={{
              backgroundColor: theme.colors.brandWhite,
              borderRadius: 16,
              padding: theme.spacing.lg,
              borderWidth: isHighlighted ? 2 : 0,
              borderColor: isHighlighted
                ? theme.colors.brandGreen
                : "transparent",
              opacity: isEarned ? 1 : 0.7,
            }}
          >
            <Row align="flex-start">
              {/* Achievement Icon */}
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: getAchievementColor(achievement) + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: getAchievementColor(achievement) + "40",
                }}
              >
                <Ionicons
                  name={achievement.iconUrl || "trophy"}
                  size={28}
                  color={getAchievementColor(achievement)}
                />
              </View>

              {/* Content */}
              <Column style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Row justify="space-between" align="flex-start">
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 16,
                      flex: 1,
                      marginRight: theme.spacing.sm,
                    }}
                    numberOfLines={1}
                  >
                    {achievement.title}
                  </Text>

                  {isEarned && (
                    <View
                      style={{
                        backgroundColor: theme.colors.brandGreen,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontSize: 10,
                          fontFamily: theme.typography.fontFamily.bold,
                        }}
                      >
                        EARNED
                      </Text>
                    </View>
                  )}
                </Row>

                <Text
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.regular,
                    fontSize: 13,
                    marginTop: 4,
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                >
                  {achievement.description}
                </Text>

                {/* Progress Bar */}
                {!isEarned && progress > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    <View
                      style={{
                        height: 4,
                        backgroundColor: theme.colors.neutral[200],
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          backgroundColor: getAchievementColor(achievement),
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: theme.colors.neutral[500],
                        marginTop: 2,
                      }}
                    >
                      {progress || 0}% complete
                    </Text>
                  </View>
                )}

                {/* Footer */}
                <Row justify="space-between" align="center">
                  <Text
                    style={{
                      color: theme.colors.neutral[500],
                      fontFamily: theme.typography.fontFamily.regular,
                      fontSize: 11,
                    }}
                  >
                    {formatCriteria(achievement)}
                  </Text>

                  <Row align="center">
                    <Ionicons
                      name="star"
                      size={12}
                      color="#FFD700"
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: theme.colors.brandGreen,
                        fontFamily: theme.typography.fontFamily.semibold,
                      }}
                    >
                      {achievement.xpReward || 0} XP
                    </Text>
                  </Row>
                </Row>
              </Column>
            </Row>
          </ModernCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaWrapper>
      <Container>
        <Column style={{ padding: theme.spacing.lg }}>
          {/* Modern Header Design */}
          <Row
            justify="space-between"
            align="center"
            style={{ marginBottom: theme.spacing.lg }}
          >
            <Column>
              <Text
                variant="caption"
                weight="medium"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.medium,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                Progress
              </Text>
              <Heading
                level="h3"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.bold,
                  fontSize: 20,
                }}
              >
                Achievements
              </Heading>
            </Column>

            <TouchableOpacity
              onPress={handleRefresh}
              style={{
                backgroundColor: theme.colors.brandGreen + "15",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.brandGreen + "30",
              }}
            >
              <Text
                weight="semibold"
                style={{
                  color: theme.colors.brandGreen,
                  fontFamily: theme.typography.fontFamily.semibold,
                  fontSize: 12,
                }}
              >
                Refresh
              </Text>
            </TouchableOpacity>
          </Row>

          {/* Statistics Cards */}
          <Row style={{ marginBottom: theme.spacing.lg }}>
            <ModernCard
              style={{
                flex: 1,
                backgroundColor: theme.colors.brandWhite,
                borderRadius: 16,
                padding: theme.spacing.md,
                marginRight: theme.spacing.sm,
              }}
            >
              <Column align="center">
                <Text
                  style={{
                    color: theme.colors.neutral[500],
                    fontFamily: theme.typography.fontFamily.medium,
                    fontSize: 11,
                    marginBottom: 4,
                  }}
                >
                  EARNED
                </Text>
                <Text
                  weight="bold"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    fontSize: 18,
                  }}
                >
                  {stats.earned || 0}/{stats.total || 0}
                </Text>
              </Column>
            </ModernCard>

            <ModernCard
              style={{
                flex: 1,
                backgroundColor: theme.colors.brandWhite,
                borderRadius: 16,
                padding: theme.spacing.md,
                marginLeft: theme.spacing.sm,
              }}
            >
              <Column align="center">
                <Text
                  style={{
                    color: theme.colors.neutral[500],
                    fontFamily: theme.typography.fontFamily.medium,
                    fontSize: 11,
                    marginBottom: 4,
                  }}
                >
                  TOTAL XP
                </Text>
                <Row align="center">
                  <Ionicons
                    name="star"
                    size={16}
                    color="#FFD700"
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    weight="bold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.bold,
                      fontSize: 18,
                    }}
                  >
                    {stats.totalXP || 0}
                  </Text>
                </Row>
              </Column>
            </ModernCard>
          </Row>

          {/* Category Filter */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            <FlatList
              horizontal
              data={categories}
              renderItem={renderCategoryButton}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            />
          </View>

          {/* Content Area */}
          {isLoading ? (
            <Column align="center" justify="center" style={{ marginTop: 100 }}>
              <ActivityIndicator size="large" color={theme.colors.brandGreen} />
              <Text
                style={{
                  marginTop: theme.spacing.md,
                  color: theme.colors.neutral[600],
                  fontFamily: theme.typography.fontFamily.medium,
                }}
              >
                Loading achievements...
              </Text>
            </Column>
          ) : achievements.length > 0 ? (
            <FlatList
              data={achievements}
              renderItem={renderAchievementCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.colors.brandGreen]}
                  tintColor={theme.colors.brandGreen}
                />
              }
            />
          ) : (
            /* Enhanced Empty State */
            <Column align="center" justify="center" style={{ marginTop: 100 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.colors.neutral[100],
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Ionicons
                  name="trophy-outline"
                  size={40}
                  color={theme.colors.neutral[400]}
                />
              </View>
              <Text
                weight="semibold"
                style={{
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.semibold,
                  fontSize: 16,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                No Achievements Yet
              </Text>
              <Text
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.regular,
                  fontSize: 13,
                  textAlign: "center",
                  lineHeight: 18,
                  paddingHorizontal: theme.spacing.xl,
                }}
              >
                Complete lessons, practice conversations, and maintain streaks
                to unlock achievements!
              </Text>
            </Column>
          )}
        </Column>
      </Container>
    </SafeAreaWrapper>
  );
};

export default AchievementsScreen;
