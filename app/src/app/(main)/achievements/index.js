import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  ScrollView,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useAchievements } from "../../../features/achievements/context/AchievementContext";
import { useNotifications } from "../../../shared/context/NotificationContext";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import {
  Container,
  Row,
  Column,
  Text,
  Heading,
  ModernCard,
  Spacer,
  AchievementBadge,
} from "../../../shared/components";
import * as achievementService from "../../../features/achievements/services/achievementService";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import { BRAND_COLORS } from "../../../shared/constants/colors";

/**
 * Modern Achievements Page
 * Displays user achievements with modern design system matching other pages
 */
const AchievementsPage = () => {
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
    { id: "all", label: "All", icon: "grid", color: theme.colors.oceanBlue },
    { id: "milestone", label: "Milestones", icon: "flag", color: theme.colors.canvasBeige },
    { id: "streak", label: "Streaks", icon: "flame", color: theme.colors.rucksackBrown },
    {
      id: "skill",
      label: "Skills",
      icon: "school",
      color: theme.colors.explorerTeal,
    },
    { id: "special", label: "Special", icon: "star", color: theme.colors.skyAqua },
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

        // Get real user XP from progress data
        const realUserXP = progress?.totalExperience || 0;

        // Update achievements based on real user data
        const updatedAchievements = achievementsData.map((achievement) => {
          // Update XP-based achievements
          if (achievement.criteria?.type === "total_xp") {
            const threshold = achievement.criteria.threshold;
            const newProgress = Math.min(
              100,
              Math.round((realUserXP / threshold) * 100)
            );
            const shouldBeEarned = realUserXP >= threshold;

            return {
              ...achievement,
              earned: shouldBeEarned,
              progress: shouldBeEarned ? 100 : newProgress,
              earnedAt:
                shouldBeEarned && !achievement.earned
                  ? new Date()
                  : achievement.earnedAt,
            };
          }

          // Update streak-based achievements
          if (achievement.criteria?.type === "streak_days") {
            const currentStreak = progress?.streak?.current || 0;
            const threshold = achievement.criteria.threshold;
            const newProgress = Math.min(
              100,
              Math.round((currentStreak / threshold) * 100)
            );
            const shouldBeEarned = currentStreak >= threshold;

            return {
              ...achievement,
              earned: shouldBeEarned,
              progress: shouldBeEarned ? 100 : newProgress,
              earnedAt:
                shouldBeEarned && !achievement.earned
                  ? new Date()
                  : achievement.earnedAt,
            };
          }

          return achievement;
        });

        // Filter achievements by category (show all achievements - earned and unearned)
        const filteredAchievements =
          activeCategory === "all"
            ? updatedAchievements // Show all achievements
            : updatedAchievements.filter((a) => a.category === activeCategory); // Show all achievements in category

        setAchievements(filteredAchievements);

        // Calculate statistics - use achievement XP, not total user XP
        const total = updatedAchievements.length;
        const earned = updatedAchievements.filter((a) => a.earned).length;
        const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
        const achievementXP = updatedAchievements
          .filter((a) => a.earned)
          .reduce((sum, a) => sum + (a.xpReward || 0), 0);

        setStats({ total, earned, percentage, totalXP: achievementXP });

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
      // Mark notification as read if coming from notification
      if (params.highlight === achievement.id) {
        markAsRead(`achievement-${achievement.id}`);
      }

      // Navigate to achievement detail or show modal
      console.log("Achievement pressed:", achievement.title);
    },
    [params.highlight, markAsRead]
  );

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
    const thresholdNum = Number(threshold) || 1;

    switch (type) {
      case "lessons_completed":
        return `Complete ${thresholdNum} lesson${thresholdNum > 1 ? "s" : ""}`;
      case "streak_days":
        return `Practice for ${thresholdNum} consecutive days`;
      case "conversations_completed":
        return `Complete ${thresholdNum} AI conversation${thresholdNum > 1 ? "s" : ""
          }`;
      case "total_xp":
        return `Earn ${thresholdNum} XP total`;
      case "games_completed":
        return `Complete ${thresholdNum} learning game${thresholdNum > 1 ? "s" : ""
          }`;
      case "modules_completed":
        return `Complete ${thresholdNum} learning module${thresholdNum > 1 ? "s" : ""
          }`;
      case "practice_time_count":
        const beforeHour = additionalParams?.beforeHour;
        if (beforeHour) {
          return `Practice ${thresholdNum} time${thresholdNum > 1 ? "s" : ""
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
      case "perfect_game_scores":
        const accuracy = additionalParams?.accuracy;
        if (accuracy) {
          return `Achieve ${accuracy}% accuracy in ${thresholdNum} game${thresholdNum > 1 ? "s" : ""
            }`;
        }
        return `Get perfect scores in ${thresholdNum} game${thresholdNum > 1 ? "s" : ""
          }`;
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

  // Define enhanced journey action cards
  const journeyActions = [
    { icon: 'book', title: 'Learn', description: 'Complete lessons', bg: BRAND_COLORS.SKY_AQUA + '15', border: BRAND_COLORS.SKY_AQUA + '30', iconColor: BRAND_COLORS.SKY_AQUA },
    { icon: 'chatbubbles', title: 'Practice', description: 'Chat with Cooper', bg: BRAND_COLORS.GOLDEN_AMBER + '15', border: BRAND_COLORS.GOLDEN_AMBER + '30', iconColor: BRAND_COLORS.GOLDEN_AMBER },
    { icon: 'game-controller', title: 'Play', description: 'Fun games', bg: BRAND_COLORS.WARM_CORAL + '15', border: BRAND_COLORS.WARM_CORAL + '30', iconColor: BRAND_COLORS.WARM_CORAL },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: "Achievements",
        }}
      />
      <SafeAreaWrapper>
        <Container>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.explorerTeal]}
                tintColor={theme.colors.explorerTeal}
              />
            }
            contentContainerStyle={{
              paddingBottom: 120,
              backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
            }}
            style={{ backgroundColor: BRAND_COLORS.CARD_BACKGROUND }}
          >
            <Column style={{
              padding: theme.spacing.md,
              backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
            }}>
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
                      marginBottom: -18,
                    }}
                  >
                    Progress
                  </Text>
                  <Heading
                    level="h3"
                    style={{
                      color: theme.colors.oceanBlue,
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
                    backgroundColor: theme.colors.explorerTeal + "15",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.explorerTeal + "30",
                  }}
                >
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.explorerTeal,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 12,
                    }}
                  >
                    Refresh
                  </Text>
                </TouchableOpacity>
              </Row>

              {/* Simplified Statistics Section */}
              <Row style={{ marginBottom: theme.spacing.lg }} justify="space-around" flexDirection="row">
                <View
                  style={{
                    flex: 1,

                    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + 40,
                    borderRadius: 16,
                    padding: theme.spacing.md,
                    paddingHorizontal: 40,
                    marginRight: theme.spacing.sm,
                    borderWidth: 1,
                    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
                    shadowColor: BRAND_COLORS.OCEAN_BLUE,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 0,
                  }}
                >
                  <Column align="center">
                    <Text
                      style={{
                        color: BRAND_COLORS.SHADOW_GREY,
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 11,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      EARNED
                    </Text>
                    <Text
                      weight="bold"
                      style={{
                        color: BRAND_COLORS.OCEAN_BLUE,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 18,
                      }}
                    >
                      {stats.earned || 0}/{stats.total || 0}
                    </Text>
                  </Column>
                </View>

                <View
                  style={{
                    flex: 1,
                    width: "100%",
                    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                    borderRadius: 16,
                    padding: theme.spacing.md,
                    paddingHorizontal: 40,

                    // marginLeft: theme.spacing.sm,
                    borderWidth: 1,
                    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
                    shadowColor: BRAND_COLORS.OCEAN_BLUE,
                    backgroundColor: BRAND_COLORS.OCEAN_BLUE + 10,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 0,
                  }}
                >
                  <Column align="center">
                    <Text
                      style={{
                        color: BRAND_COLORS.SHADOW_GREY,
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 11,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      TOTAL XP
                    </Text>
                    <Row align="center">
                      <Ionicons
                        name="star"
                        size={16}
                        color={BRAND_COLORS.EXPLORER_TEAL}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        weight="bold"
                        style={{
                          color: BRAND_COLORS.EXPLORER_TEAL,
                          fontFamily: theme.typography.fontFamily.bold,
                          fontSize: 18,
                        }}
                      >
                        {stats.totalXP || 0}
                      </Text>
                    </Row>
                  </Column>
                </View>
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
                <Column
                  align="center"
                  justify="center"
                  style={{ marginTop: 100 }}
                >
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.brandGreen}
                  />
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
              ) : (
                /* Always show achievements - even if none are earned yet */
                <Column>
                  {/* Enhanced Achievement Journey Starter for New Users */}
                  {achievements.length > 0 &&
                    achievements.filter((a) => a.earned).length === 0 && (
                      <View
                        style={{
                          backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
                          borderRadius: 14,
                          padding: theme.spacing.md,
                          paddingVertical: theme.spacing.lg,
                          marginBottom: theme.spacing.lg,
                          // marginHorizontal: theme.spacing.md,
                          borderWidth: 1,
                          borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
                          shadowColor: BRAND_COLORS.EXPLORER_TEAL,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.08,
                          shadowRadius: 8,
                          elevation: 0,
                        }}
                      >
                        {/* Header with Icon */}
                        <Row align="center" style={{ marginBottom: theme.spacing.md }}>
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 24,
                              backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "20",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: theme.spacing.md,
                              borderWidth: 2,
                              borderColor: BRAND_COLORS.EXPLORER_TEAL + "40",
                            }}
                          >
                            <Ionicons
                              name="rocket"
                              size={24}
                              color={BRAND_COLORS.EXPLORER_TEAL}
                            />
                          </View>
                          <Column style={{
                            flex: 1, marginLeft: -15,
                          }}>
                            <Text
                              weight="bold"
                              numberOfLines={2}
                              style={{
                                color: BRAND_COLORS.OCEAN_BLUE,
                                fontFamily: theme.typography.fontFamily.bold,
                                fontSize: 16,
                                marginBottom: 2,
                                lineHeight: 20,
                              }}
                            >
                              Start Your Achievement Journey!
                            </Text>
                            <Text
                              style={{
                                color: BRAND_COLORS.SHADOW_GREY,
                                fontFamily: theme.typography.fontFamily.medium,
                                fontSize: 12,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Ready to unlock rewards?
                            </Text>
                          </Column>
                        </Row>

                        {/* Description */}
                        <Text
                          style={{
                            color: BRAND_COLORS.SHADOW_GREY,
                            fontFamily: theme.typography.fontFamily.regular,
                            fontSize: 14,
                            lineHeight: 20,
                            marginBottom: theme.spacing.lg,
                          }}
                        >
                          Complete lessons, practice with Cooper, and play games to unlock achievements and earn XP! Each milestone brings you closer to mastering your language skills.
                        </Text>

                        {/* Action Cards */}
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ paddingHorizontal: theme.spacing.md }}
                          style={{ marginBottom: theme.spacing.lg }}
                        >
                          <Row style={{ gap: theme.spacing.sm }}>
                            {journeyActions.map((action) => (
                              <View
                                key={action.title}
                                style={{
                                  flex: 1,
                                  backgroundColor: action.bg,
                                  borderRadius: 12,
                                  padding: theme.spacing.md,
                                  borderWidth: 1,
                                  borderColor: action.border,
                                }}
                              >
                                <Ionicons
                                  name={action.icon}
                                  size={20}
                                  color={action.iconColor}
                                  style={{ marginBottom: 4 }}
                                />
                                <Text
                                  weight="semibold"
                                  style={{
                                    color: theme.colors.oceanBlue,
                                    fontFamily: theme.typography.fontFamily.semibold,
                                    fontSize: 12,
                                    marginBottom: 2,
                                  }}
                                >
                                  {action.title}
                                </Text>
                                <Text
                                  style={{
                                    color: BRAND_COLORS.SHADOW_GREY,
                                    fontFamily: theme.typography.fontFamily.regular,
                                    fontSize: 10,
                                    lineHeight: 14,
                                  }}
                                >
                                  {action.description}
                                </Text>
                              </View>
                            ))}
                          </Row>
                        </ScrollView>
                      </View>
                    )}

                  {/* Achievement Badges Grid - Always show all achievements */}
                  {achievements.length > 0 ? (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        marginTop: theme.spacing.md,
                      }}
                    >
                      {achievements.map((achievement) => (
                        <Animated.View
                          key={achievement.id}
                          style={{
                            opacity: fadeAnim,
                            transform: [{ scale: fadeAnim }],
                            width: "48%", // Two cards per row with gap
                            marginBottom: theme.spacing.lg,
                          }}
                        >
                          <AchievementBadge
                            achievement={achievement}
                            onPress={() => handleAchievementPress(achievement)}
                            style={{
                              width: "100%", // Fill the container width
                              borderWidth:
                                params.highlight === achievement.id ? 2 : 1,
                              borderColor:
                                params.highlight === achievement.id
                                  ? theme.colors.brandGreen
                                  : "transparent",
                            }}
                          />
                        </Animated.View>
                      ))}
                    </View>
                  ) : (
                    /* Only show this if no achievements are loaded from API */
                    <Column
                      align="center"
                      justify="center"
                      style={{ marginTop: 100 }}
                    >
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
                        No Achievements Available
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
                        Please check your connection and try again.
                      </Text>
                    </Column>
                  )}
                </Column>
              )}
            </Column>
          </ScrollView>
        </Container>
      </SafeAreaWrapper>
    </>
  );
};

export default AchievementsPage;
