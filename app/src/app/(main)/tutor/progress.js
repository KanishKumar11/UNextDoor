import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernProgressBar,
  ModernBadge,
  AchievementBadge,
} from "../../../shared/components";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import * as achievementService from "../../../features/achievements/services/achievementService";

/**
 * Progress Details Page
 * Shows comprehensive user progress analytics
 */
export default function ProgressDetails() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [userProgress, setUserProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user progress data and achievements
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch progress data
        const progressResponse = await curriculumService.getUserProgress();
        setUserProgress(
          progressResponse.data?.progress || progressResponse.data
        );

        // Fetch achievements using the same approach as achievements page
        try {
          const achievementsData =
            await achievementService.getUserAchievements();

          // Get real user XP from progress data
          const realUserXP =
            progressResponse.data?.progress?.totalExperience ||
            progressResponse.data?.totalExperience ||
            0;

          // Update achievements based on real user data (same logic as achievements page)
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
              const currentStreak =
                progressResponse.data?.progress?.streak?.current ||
                progressResponse.data?.streak?.current ||
                0;
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

          setAchievements(updatedAchievements);
          console.log(
            `🏆 Loaded ${updatedAchievements.length} achievements for progress page`
          );
        } catch (achievementsErr) {
          console.warn("Failed to load achievements:", achievementsErr);
          // Don't fail the whole page if achievements fail
          setAchievements([]);
        }
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user]);

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.displayName) {
      return user.displayName.split(" ")[0]; // Get first name from display name
    }
    if (user?.username) {
      return user.username;
    }
    return "Learner";
  };

  // Calculate statistics
  const getStats = () => {
    if (!userProgress) return {};

    // Handle potential string values by converting to number
    const totalXP = Number(userProgress.totalExperience) || 0;

    const practiceMinutes = Math.floor(totalXP / 10); // 10 XP = 1 minute estimate
    const practiceTimeFormatted =
      practiceMinutes >= 60
        ? `${Math.floor(practiceMinutes / 60)}h ${practiceMinutes % 60}m`
        : `${practiceMinutes}m`;

    // Fixed level calculation logic with correct XP requirements
    // Beginner: 0-1999 XP (2000 XP required to reach Intermediate)
    // Intermediate: 2000-3999 XP (2000 XP total required to reach Advanced)
    // Advanced: 4000+ XP (maximum level)
    let currentLevelNumber = 1;
    let currentLevelName = "Beginner";
    let levelProgress = 0;
    let currentLevelXP = totalXP;
    let xpToNextLevel = 2000 - totalXP;

    if (totalXP >= 4000) {
      // Advanced level (4000+ XP)
      currentLevelNumber = 3;
      currentLevelName = "Advanced";
      levelProgress = 100;
      currentLevelXP = totalXP;
      xpToNextLevel = 0;
    } else if (totalXP >= 2000) {
      // Intermediate level (2000-3999 XP)
      currentLevelNumber = 2;
      currentLevelName = "Intermediate";
      currentLevelXP = totalXP;
      // Progress within Intermediate level: from 2000 XP to 4000 XP (2000 XP range)
      const intermediateProgress = totalXP - 2000;
      levelProgress = Math.round((intermediateProgress / 2000) * 100);
      xpToNextLevel = 4000 - totalXP;
    } else {
      // Beginner level (0-1999 XP)
      currentLevelNumber = 1;
      currentLevelName = "Beginner";
      currentLevelXP = totalXP;
      levelProgress = Math.round((currentLevelXP / 2000) * 100);
      xpToNextLevel = 2000 - totalXP;
    }

    return {
      totalXP,
      currentLevel: currentLevelName,
      currentLevelNumber,
      levelProgress: Math.max(0, Math.min(100, levelProgress)),
      lessonsCompleted: userProgress.lessonsCompleted || 0,
      practiceTime: practiceMinutes,
      practiceTimeFormatted,
      streak: userProgress.streak?.current || 0,
      longestStreak: userProgress.streak?.longest || 0,
      totalLessons:
        userProgress.modules?.reduce(
          (total, module) => total + (module.lessons?.length || 0),
          0
        ) || 8,
      xpToNextLevel: Math.max(0, xpToNextLevel),
      currentLevelXP,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Heading
            level="h3"
            style={{
              marginBottom: theme.spacing.lg,
              color: theme.colors.brandNavy,
              fontFamily: theme.typography.fontFamily.semibold,
            }}
          >
            Progress Details
          </Heading>

          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={theme.colors.brandGreen} />
            <Spacer size="md" />
            <Text style={{ color: theme.colors.neutral[600] }}>
              Loading progress data...
            </Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Heading level="h3" style={{ marginBottom: theme.spacing.lg }}>
            Progress Details
          </Heading>

          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={theme.colors.error[500]}
            />
            <Spacer size="md" />
            <Text align="center">{error}</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Clean Personalized Greeting */}
          <View
            style={{
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <Text
              variant="caption"
              style={{
                color: theme.colors.neutral[500],
                fontFamily: theme.typography.fontFamily.medium,
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Welcome back!
            </Text>
            <Heading
              level="h2"
              style={{
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.bold,
                fontSize: 24,
                marginBottom: 8,
              }}
            >
              Hi {getUserDisplayName()}, here's your progress
            </Heading>
            <Text
              variant="body"
              style={{
                color: theme.colors.neutral[600],
                fontFamily: theme.typography.fontFamily.regular,
                fontSize: 14,
              }}
            >
              Keep up the great work on your Korean learning journey!
            </Text>
          </View>

          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            {/* Clean Level Progress Section */}
            <View style={{ marginBottom: theme.spacing.xl }}>
              <Row
                justify="space-between"
                align="center"
                style={{ marginBottom: theme.spacing.md }}
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
                      fontSize: 12,
                    }}
                  >
                    Current Level
                  </Text>
                  <Heading
                    level="h1"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.bold,
                      fontSize: 28,
                      marginTop: 4,
                    }}
                  >
                    {stats.currentLevel}
                  </Heading>
                </Column>

                <Column align="end">
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[500],
                      fontFamily: theme.typography.fontFamily.medium,
                      fontSize: 12,
                    }}
                  >
                    {stats.currentLevelXP} /{" "}
                    {stats.currentLevelNumber === 3
                      ? "∞"
                      : stats.currentLevelNumber === 2
                      ? "4000"
                      : "2000"}{" "}
                    XP
                  </Text>
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandGreen,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 16,
                      marginTop: 2,
                    }}
                  >
                    {stats.levelProgress}%
                  </Text>
                </Column>
              </Row>

              <ModernProgressBar
                value={stats.levelProgress}
                max={100}
                height={6}
                rounded
                style={{
                  backgroundColor: theme.colors.neutral[200],
                  marginBottom: theme.spacing.xs,
                }}
                color={theme.colors.brandGreen}
              />

              <Text
                variant="caption"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.regular,
                  fontSize: 12,
                }}
              >
                {stats.currentLevelNumber === 3
                  ? "Maximum level reached!"
                  : `${stats.xpToNextLevel} XP to reach ${
                      stats.currentLevelNumber === 1
                        ? "Intermediate"
                        : "Advanced"
                    }`}
              </Text>
            </View>

            {/* Clean Statistics Section */}
            <View style={{ marginBottom: theme.spacing.xl }}>
              <Text
                variant="caption"
                weight="medium"
                style={{
                  color: theme.colors.neutral[500],
                  fontFamily: theme.typography.fontFamily.medium,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontSize: 12,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Your Progress
              </Text>

              {/* Statistics Grid - Clean Layout */}
              <View style={{ gap: theme.spacing.lg }}>
                {/* First Row */}
                <Row justify="space-between" align="center">
                  <Column align="center" style={{ flex: 1 }}>
                    <Text
                      weight="bold"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 32,
                        lineHeight: 36,
                      }}
                    >
                      {stats.totalXP}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      Total XP
                    </Text>
                  </Column>

                  {/* Vertical Divider */}
                  <View
                    style={{
                      width: 1,
                      height: 60,
                      backgroundColor: theme.colors.neutral[200],
                      marginHorizontal: theme.spacing.md,
                    }}
                  />

                  <Column align="center" style={{ flex: 1 }}>
                    <Text
                      weight="bold"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 32,
                        lineHeight: 36,
                      }}
                    >
                      {stats.lessonsCompleted}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      Lessons Completed
                    </Text>
                  </Column>
                </Row>

                {/* Divider */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.neutral[200],
                    marginVertical: theme.spacing.sm,
                  }}
                />

                {/* Second Row */}
                <Row justify="space-between" align="center">
                  <Column align="center" style={{ flex: 1 }}>
                    <Text
                      weight="bold"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 32,
                        lineHeight: 36,
                      }}
                    >
                      {stats.practiceTimeFormatted}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      Practice Time
                    </Text>
                  </Column>

                  {/* Vertical Divider */}
                  <View
                    style={{
                      width: 1,
                      height: 60,
                      backgroundColor: theme.colors.neutral[200],
                      marginHorizontal: theme.spacing.md,
                    }}
                  />

                  <Column align="center" style={{ flex: 1 }}>
                    <Text
                      weight="bold"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 32,
                        lineHeight: 36,
                      }}
                    >
                      {stats.streak}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      Day Streak
                    </Text>
                  </Column>
                </Row>
              </View>
            </View>

            {/* Learning Insights */}
            <ModernCard
              style={{
                marginBottom: theme.spacing.lg,
                backgroundColor: theme.colors.brandWhite,
                borderWidth: 1,
                borderColor: theme.colors.brandNavy + "20",
              }}
            >
              <Heading
                level="h4"
                style={{
                  marginBottom: theme.spacing.md,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.semibold,
                }}
              >
                Learning Insights
              </Heading>

              <Row
                justify="space-between"
                align="center"
                style={{ marginBottom: theme.spacing.sm }}
              >
                <Column>
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                      marginBottom: -16,
                    }}
                  >
                    Current Streak
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[600],

                      fontFamily: theme.typography.fontFamily.regular,
                    }}
                  >
                    Keep it up!
                  </Text>
                </Column>
                <Text
                  weight="bold"
                  style={{
                    color: theme.colors.brandGreen,
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  {stats.streak} days
                </Text>
              </Row>

              <Row
                justify="space-between"
                align="center"
                style={{ marginBottom: theme.spacing.sm }}
              >
                <Column>
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      marginBottom: -16,

                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    Longest Streak
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.regular,
                    }}
                  >
                    Personal best
                  </Text>
                </Column>
                <Text
                  weight="bold"
                  style={{
                    color: theme.colors.brandGreen,
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  {stats.longestStreak} days
                </Text>
              </Row>

              <Row justify="space-between" align="center">
                <Column>
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      marginBottom: -16,

                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    Average XP per Lesson
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.regular,
                    }}
                  >
                    Learning efficiency
                  </Text>
                </Column>
                <Text
                  weight="bold"
                  style={{
                    color: "#FFD700", // Gold color
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  {stats.lessonsCompleted > 0
                    ? Math.round(stats.totalXP / stats.lessonsCompleted)
                    : 0}{" "}
                  XP
                </Text>
              </Row>
            </ModernCard>

            {/* Learning Progress Overview */}
            <ModernCard
              style={{
                marginBottom: theme.spacing.lg,
                backgroundColor: theme.colors.brandWhite,
                borderWidth: 1,
                borderColor: "#2196F3" + "30", // Blue color
              }}
            >
              <Heading
                level="h4"
                style={{
                  marginBottom: theme.spacing.md,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.semibold,
                }}
              >
                Learning Progress Overview
              </Heading>

              {/* Progress bars for different skills */}
              <View style={{ marginBottom: theme.spacing.md }}>
                <Row
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: theme.spacing.xs }}
                >
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    Vocabulary
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.medium,
                    }}
                  >
                    {Math.round(
                      (stats.lessonsCompleted / stats.totalLessons) * 100
                    )}
                    %
                  </Text>
                </Row>
                <ModernProgressBar
                  value={(stats.lessonsCompleted / stats.totalLessons) * 100}
                  max={100}
                  height={8}
                  rounded
                  style={{ backgroundColor: theme.colors.neutral[200] }}
                  color={theme.colors.brandGreen}
                />
              </View>

              <View style={{ marginBottom: theme.spacing.md }}>
                <Row
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: theme.spacing.xs }}
                >
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    Pronunciation
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.medium,
                    }}
                  >
                    {Math.round((((stats.practiceTime || 0) / 60) * 100) / 10)}%
                  </Text>
                </Row>
                <ModernProgressBar
                  value={Math.min(
                    (((stats.practiceTime || 0) / 60) * 100) / 10,
                    100
                  )}
                  max={100}
                  height={8}
                  rounded
                  style={{ backgroundColor: theme.colors.neutral[200] }}
                  color="#2196F3"
                />
              </View>

              <View>
                <Row
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: theme.spacing.xs }}
                >
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    Conversation
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.medium,
                    }}
                  >
                    {Math.round((stats.streak / 7) * 100)}%
                  </Text>
                </Row>
                <ModernProgressBar
                  value={Math.min((stats.streak / 7) * 100, 100)}
                  max={100}
                  height={8}
                  rounded
                  style={{ backgroundColor: theme.colors.neutral[200] }}
                  color="#FF9800"
                />
              </View>
            </ModernCard>

            {/* Study Statistics */}
            <ModernCard
              style={{
                marginBottom: theme.spacing.lg,
                backgroundColor: theme.colors.brandWhite,
                borderWidth: 1,
                borderColor: "#9C27B0" + "30", // Purple color
              }}
            >
              <Heading
                level="h4"
                style={{
                  marginBottom: theme.spacing.md,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.semibold,
                }}
              >
                Study Statistics
              </Heading>

              <Row
                justify="space-between"
                style={{ marginBottom: theme.spacing.sm }}
              >
                <Column style={{ flex: 1, marginRight: theme.spacing.sm }}>
                  <View
                    style={{
                      backgroundColor: "#9C27B0" + "15",
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color="#9C27B0"
                    />
                    <Text
                      weight="bold"
                      style={{
                        marginTop: theme.spacing.xs,
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                      }}
                    >
                      {Math.ceil(stats.totalXP / 50)}
                    </Text>
                    <Text
                      variant="caption"
                      align="center"
                      style={{
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      Study Days
                    </Text>
                  </View>
                </Column>

                <Column style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                  <View
                    style={{
                      backgroundColor: "#FF6B35" + "15",
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="trending-up-outline"
                      size={24}
                      color="#FF6B35"
                    />
                    <Text
                      weight="bold"
                      style={{
                        marginTop: theme.spacing.xs,
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                      }}
                    >
                      {stats.currentLevelNumber}
                    </Text>
                    <Text
                      variant="caption"
                      align="center"
                      style={{
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      Current Level
                    </Text>
                  </View>
                </Column>
              </Row>

              <Row justify="space-between">
                <Column style={{ flex: 1, marginRight: theme.spacing.sm }}>
                  <View
                    style={{
                      backgroundColor: theme.colors.brandGreen + "15",
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color={theme.colors.brandGreen}
                    />
                    <Text
                      weight="bold"
                      style={{
                        marginTop: theme.spacing.xs,
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                      }}
                    >
                      {Math.round(
                        (stats.lessonsCompleted / stats.totalLessons) * 100
                      )}
                      %
                    </Text>
                    <Text
                      variant="caption"
                      align="center"
                      style={{
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      Completion
                    </Text>
                  </View>
                </Column>

                <Column style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                  <View
                    style={{
                      backgroundColor: "#FFD700" + "15",
                      borderRadius: 12,
                      padding: theme.spacing.md,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="star-outline" size={24} color="#FFD700" />
                    <Text
                      weight="bold"
                      style={{
                        marginTop: theme.spacing.xs,
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                      }}
                    >
                      {stats.xpToNextLevel}
                    </Text>
                    <Text
                      variant="caption"
                      align="center"
                      style={{
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.regular,
                      }}
                    >
                      XP to Next Level
                    </Text>
                  </View>
                </Column>
              </Row>
            </ModernCard>

            {/* Clean Achievements Section */}
            <View style={{ marginBottom: theme.spacing.xl }}>
              <Row
                justify="space-between"
                align="center"
                style={{ marginBottom: theme.spacing.lg }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.neutral[500],
                    fontFamily: theme.typography.fontFamily.medium,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontSize: 12,
                  }}
                >
                  Achievements
                </Text>
                <TouchableOpacity onPress={() => router.push("/achievements")}>
                  <Text
                    variant="caption"
                    weight="semibold"
                    style={{
                      color: theme.colors.brandGreen,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 13,
                    }}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
              </Row>

              {achievements.length > 0 ? (
                <>
                  {/* Achievement Progress Summary */}
                  <Row
                    justify="space-between"
                    align="center"
                    style={{ marginBottom: theme.spacing.lg }}
                  >
                    <Column>
                      <Text
                        weight="semibold"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.semibold,
                          fontSize: 16,
                        }}
                      >
                        {achievements.filter((a) => a.earned).length}/
                        {achievements.length} Earned
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: theme.colors.neutral[600],
                          fontFamily: theme.typography.fontFamily.regular,
                          fontSize: 13,
                        }}
                      >
                        Keep going to unlock more!
                      </Text>
                    </Column>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: "#FFD700" + "20",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "#FFD700",
                      }}
                    >
                      <Text
                        weight="bold"
                        style={{
                          color: "#FFD700",
                          fontFamily: theme.typography.fontFamily.bold,
                          fontSize: 14,
                        }}
                      >
                        {Math.round(
                          (achievements.filter((a) => a.earned).length /
                            achievements.length) *
                            100
                        )}
                        %
                      </Text>
                    </View>
                  </Row>

                  {/* Achievement Cards - Same as Home Screen */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingRight: theme.spacing.lg,
                      paddingTop: theme.spacing.md, // Add top padding to prevent XP badge cropping
                      paddingBottom: theme.spacing.sm, // Add bottom padding for shadows
                    }}
                    style={{
                      marginLeft: -theme.spacing.lg,
                      marginTop: -theme.spacing.sm, // Offset the top padding
                    }}
                  >
                    {achievements.length === 0 ? (
                      <View
                        style={{
                          paddingHorizontal: theme.spacing.lg,
                          paddingVertical: theme.spacing.xl,
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 200,
                        }}
                      >
                        <Ionicons
                          name="trophy-outline"
                          size={48}
                          color={theme.colors.neutral[400]}
                        />
                        <Text
                          style={{
                            marginTop: theme.spacing.sm,
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.medium,
                            textAlign: "center",
                          }}
                        >
                          Loading achievements...
                        </Text>
                      </View>
                    ) : (
                      achievements
                        .slice(0, 10) // Show up to 10 achievements (earned and unearned)
                        .map((achievement) => (
                          <AchievementBadge
                            key={achievement.id}
                            achievement={achievement}
                            onPress={() =>
                              router.push(
                                `/achievements?highlight=${achievement.id}`
                              )
                            }
                            style={{ marginRight: theme.spacing.md }}
                          />
                        ))
                    )}
                  </ScrollView>
                </>
              ) : (
                <Column
                  align="center"
                  style={{ paddingVertical: theme.spacing.lg }}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={48}
                    color={theme.colors.neutral[400]}
                  />
                  <Spacer size="sm" />
                  <Text
                    align="center"
                    style={{
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.regular,
                    }}
                  >
                    No achievements yet
                  </Text>
                  <Text
                    variant="caption"
                    align="center"
                    style={{
                      color: theme.colors.neutral[500],
                      fontFamily: theme.typography.fontFamily.regular,
                    }}
                  >
                    Complete lessons to earn your first achievement!
                  </Text>
                </Column>
              )}
            </View>
          </View>

          {/* Bottom spacer to prevent content from being hidden behind floating tab bar */}
          <Spacer size="xl" />
          <Spacer size="xl" />
          <View style={{ height: 100 }} />
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}
