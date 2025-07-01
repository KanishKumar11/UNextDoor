import {
  ScrollView,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../_layout";
import { useTheme } from "../../shared/context/ThemeContext";
import SafeAreaWrapper from "../../shared/components/SafeAreaWrapper";
import {
  Container,
  Row,
  Column,
  Spacer,
  Text,
  Heading,
  ModernCard,
  ModernButton,
  ModernAvatar,
  ModernProgressBar,
  AchievementBadge,
} from "../../shared/components";
import { curriculumApi, tutorApi } from "../../shared/services/api";
import { curriculumService } from "../../features/curriculum/services/curriculumService";
import { getUserAchievements } from "../../features/achievements/services/achievementService";
import { useContext, useEffect, useState } from "react";
import { useSubscription } from "../../shared/hooks/useSubscription";
import { levelService } from "../../features/level/services/levelService";

const { width } = Dimensions.get("window");

export default function ModernHome() {
  const router = useRouter();
  const auth = useAuth();
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const { user } = auth;
  const isLoading = auth.isLoading || (authContext && authContext.isLoading);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [userProgress, setUserProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [learningScenarios, setLearningScenarios] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allLevels, setAllLevels] = useState([]);

  // Subscription hook
  const {
    currentPlan,
    usage,
    hasActiveSubscription,
    hasReachedLimit,
    loading: subscriptionLoading,
  } = useSubscription();

  const fetchLevels = async () => {
    try {
      const response = await levelService.getAllLevels();
      if (response.success && response.levels) {
        setAllLevels(response.levels);
        console.log("✅ Levels loaded:", response.levels.length);
      }
    } catch (error) {
      console.error("❌ Error fetching levels:", error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      console.log("🔄 Fetching user progress from curriculum service...");
      const response = await curriculumService.getUserProgress();
      console.log("✅ Progress response:", response);

      if (response.data && response.data.progress) {
        setUserProgress(response.data.progress);
        console.log("📊 Progress data:", {
          totalExperience: response.data.progress.totalExperience,
          lessonsCompleted: response.data.progress.lessonsCompleted,
          streak: response.data.progress.streak,
          currentLevel: response.data.progress.level,
        });
        return response.data.progress;
      } else {
        console.warn("⚠️ Invalid progress response structure");
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching user progress:", error);
      return null;
    }
  };

  const fetchCurrentLesson = async () => {
    try {
      const progressData = await fetchUserProgress();
      if (progressData?.currentCurriculum?.currentLessonId) {
        const response = await curriculumApi.getLesson(
          progressData.currentCurriculum.currentLessonId
        );
        setCurrentLesson(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching current lesson:", error);
      return null;
    }
  };

  const fetchUserAchievements = async () => {
    try {
      console.log("🏠 Home: Fetching user achievements...");

      // Get achievements and user progress in parallel (same as achievements page)
      const [achievementsData, progressData] = await Promise.all([
        getUserAchievements(),
        curriculumService.getUserProgress().catch(() => ({ data: null })),
      ]);

      console.log(`🏠 Home: Retrieved ${achievementsData.length} achievements`);

      // Apply the same processing logic as achievements page
      let processedAchievements = achievementsData;

      if (progressData?.data) {
        const userProgress = progressData.data;

        // Update achievements based on real user data (same logic as achievements page)
        processedAchievements = achievementsData.map((achievement) => {
          // Update XP-based achievements
          if (
            achievement.criteria?.type === "total_xp" &&
            userProgress.totalExperience
          ) {
            const currentXP = userProgress.totalExperience;
            const requiredXP = achievement.criteria.threshold;

            if (currentXP >= requiredXP && !achievement.earned) {
              return {
                ...achievement,
                earned: true,
                progress: 100,
                earnedAt: new Date().toISOString(),
              };
            } else if (!achievement.earned) {
              return {
                ...achievement,
                progress: Math.min(
                  Math.round((currentXP / requiredXP) * 100),
                  99
                ),
              };
            }
          }

          // Update lesson-based achievements
          if (
            achievement.criteria?.type === "lessons_completed" &&
            userProgress.lessonsCompleted
          ) {
            const completedLessons = userProgress.lessonsCompleted;
            const requiredLessons = achievement.criteria.threshold;

            if (completedLessons >= requiredLessons && !achievement.earned) {
              return {
                ...achievement,
                earned: true,
                progress: 100,
                earnedAt: new Date().toISOString(),
              };
            } else if (!achievement.earned) {
              return {
                ...achievement,
                progress: Math.min(
                  Math.round((completedLessons / requiredLessons) * 100),
                  99
                ),
              };
            }
          }

          return achievement;
        });
      }

      setUserAchievements(processedAchievements || []);
      console.log(
        `🏠 Home: Set ${processedAchievements.length} processed achievements`
      );

      return processedAchievements;
    } catch (error) {
      console.error("❌ Home: Error fetching user achievements:", error);
      setUserAchievements([]);
      return [];
    }
  };

  const fetchLearningScenarios = async () => {
    try {
      const response = await tutorApi.getScenarios();
      const scenarios = response.data?.scenarios || [];

      // Map scenarios to include UI properties
      const mappedScenarios = scenarios.slice(0, 3).map((scenario, index) => ({
        ...scenario,
        icon: getScenarioIcon(scenario.category || scenario.title),
        color: getScenarioColor(index),
      }));

      setLearningScenarios(mappedScenarios);
      return mappedScenarios;
    } catch (error) {
      console.error("Error fetching learning scenarios:", error);
      // Fallback to default scenarios if API fails
      const fallbackScenarios = [
        {
          id: "s1",
          title: "Greetings & Introductions",
          level: "Beginner",
          icon: "hand-left-outline",
          color: theme.colors.primary[500],
          description: "Learn basic greetings and how to introduce yourself",
        },
        {
          id: "s2",
          title: "Ordering Food",
          level: "Beginner",
          icon: "restaurant-outline",
          color: theme.colors.accent[500],
          description: "Practice ordering food at restaurants",
        },
        {
          id: "s3",
          title: "Making Plans",
          level: "Intermediate",
          icon: "calendar-outline",
          color: theme.colors.info.main,
          description: "Learn to make plans and appointments",
        },
      ];
      setLearningScenarios(fallbackScenarios);
      return fallbackScenarios;
    }
  };

  const getScenarioIcon = (category) => {
    const iconMap = {
      greetings: "hand-left-outline",
      food: "restaurant-outline",
      plans: "calendar-outline",
      shopping: "bag-outline",
      travel: "airplane-outline",
      business: "briefcase-outline",
      family: "people-outline",
      hobbies: "game-controller-outline",
    };

    const key = Object.keys(iconMap).find((k) =>
      category?.toLowerCase().includes(k)
    );
    return iconMap[key] || "chatbubble-outline";
  };

  const getScenarioColor = (index) => {
    const colors = [
      theme.colors.primary[500],
      theme.colors.accent[500],
      theme.colors.info.main,
      theme.colors.warning.main,
      theme.colors.success.main,
    ];
    return colors[index % colors.length];
  };

  const fetchAllData = async () => {
    if (!user) return;

    setDataLoading(true);
    setDataError(null);

    try {
      await Promise.all([
        fetchUserProgress(),
        fetchCurrentLesson(),
        fetchUserAchievements(),
        fetchLearningScenarios(),
      ]);
    } catch (error) {
      console.error("Error fetching home data:", error);
      setDataError("Failed to load data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    if (!user || isRefreshing) return;

    console.log("🔄 Pull-to-refresh triggered");
    setIsRefreshing(true);
    setDataError(null);

    try {
      // Use cache-busting for fresh data
      console.log("🔄 Fetching fresh data with cache-busting...");
      const response = await curriculumService.getUserProgress(true); // bustCache = true

      if (response.data && response.data.progress) {
        setUserProgress(response.data.progress);
        console.log("✅ Fresh progress data loaded:", {
          totalExperience: response.data.progress.totalExperience,
          lessonsCompleted: response.data.progress.lessonsCompleted,
          streak: response.data.progress.streak,
        });
      }

      // Fetch other data in parallel
      await Promise.all([
        fetchCurrentLesson(),
        fetchUserAchievements(),
        fetchLearningScenarios(),
      ]);

      console.log("✅ Pull-to-refresh completed successfully");
    } catch (error) {
      console.error("❌ Error during pull-to-refresh:", error);
      setDataError("Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getProgressData = () => {
    if (!userProgress) {
      return {
        completed: 0,
        total: 8,
        percentage: 0,
        totalXP: 0,
        streak: 0,
        currentLevel: "Beginner",
        xpToNextLevel: 100,
        currentLevelXP: 0,
      };
    }

    // Calculate actual totals from modules data
    const totalLessons =
      userProgress.modules?.reduce(
        (total, module) => total + (module.lessons?.length || 0),
        0
      ) || 8; // Default to 8 if no modules data

    const completed = userProgress.lessonsCompleted || 0;
    const percentage =
      totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    const streak = userProgress.streak?.current || 0;

    // Enhanced XP level calculation using the full 10-level system
    const totalXP = Number(userProgress.totalExperience) || 0;

    let currentLevelNumber = 1;
    let currentLevelName = "Novice";
    let levelProgress = 0;
    let xpToNextLevel = 100;
    let currentLevelXP = totalXP;
    let currentLevelIcon = "leaf-outline";
    let currentLevelColor = "#6FC935";

    // Find current level based on XP using the full level system
    if (allLevels.length > 0) {
      // Find the highest level the user has reached
      const currentLevel = allLevels
        .filter(level => totalXP >= level.xpRequired)
        .sort((a, b) => b.xpRequired - a.xpRequired)[0];

      // Find the next level
      const nextLevel = allLevels
        .filter(level => totalXP < level.xpRequired)
        .sort((a, b) => a.xpRequired - b.xpRequired)[0];

      if (currentLevel) {
        currentLevelNumber = currentLevel.level;
        currentLevelName = currentLevel.name;
        currentLevelIcon = currentLevel.icon;
        currentLevelColor = currentLevel.color;

        if (nextLevel) {
          // Calculate progress to next level
          const xpRange = nextLevel.xpRequired - currentLevel.xpRequired;
          const xpProgress = totalXP - currentLevel.xpRequired;
          levelProgress = Math.round((xpProgress / xpRange) * 100);
          xpToNextLevel = nextLevel.xpRequired - totalXP;
        } else {
          // Max level reached
          levelProgress = 100;
          xpToNextLevel = 0;
        }
      }
    } else {
      // Fallback to simple 3-level system if levels not loaded
      if (totalXP >= 4000) {
        currentLevelNumber = 3;
        currentLevelName = "Advanced";
        levelProgress = 100;
        xpToNextLevel = 0;
      } else if (totalXP >= 2000) {
        currentLevelNumber = 2;
        currentLevelName = "Intermediate";
        const intermediateProgress = totalXP - 2000;
        levelProgress = Math.round((intermediateProgress / 2000) * 100);
        xpToNextLevel = 4000 - totalXP;
      } else {
        currentLevelNumber = 1;
        currentLevelName = "Beginner";
        levelProgress = Math.round((totalXP / 2000) * 100);
        xpToNextLevel = 2000 - totalXP;
      }
    }

    return {
      completed,
      total: totalLessons,
      percentage,
      totalXP,
      streak,
      currentLevel: currentLevelName,
      xpToNextLevel: Math.max(0, xpToNextLevel),
      currentLevelXP,
      currentLevelNumber,
      levelProgress: Math.max(0, Math.min(100, levelProgress)),
      currentLevelIcon,
      currentLevelColor,
    };
  };

  const progressData = getProgressData();

  const navigateToScenario = (scenarioId) => {
    // Define fallback scenarios that match the ones displayed
    const fallbackScenarios = [
      {
        id: "s1",
        title: "Greetings & Introductions",
        level: "Beginner",
        description: "Learn basic greetings and how to introduce yourself",
      },
      {
        id: "s2",
        title: "Ordering Food",
        level: "Beginner",
        description: "Practice ordering food at restaurants",
      },
      {
        id: "s3",
        title: "Making Plans",
        level: "Intermediate",
        description: "Learn to make plans and appointments",
      },
    ];

    // Try to find scenario in API data first, then fallback scenarios
    let scenario = learningScenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      scenario = fallbackScenarios.find((s) => s.id === scenarioId);
    }

    if (!scenario) {
      console.error(`Scenario with ID ${scenarioId} not found`);
      return;
    }

    // Use standalone conversation route for better reliability
    router.push({
      pathname: "/tutor/standalone-conversation",
      params: {
        scenarioId: scenarioId,
        title: scenario.title,
        level: scenario.level,
      },
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    if (user) {
      fetchLevels(); // Fetch levels first for enhanced level system
      fetchAllData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Spacer size="md" />
            <Text>Loading...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  if (dataError && !dataLoading) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={theme.colors.error[500]}
            />
            <Spacer size="md" />
            <Text align="center">{dataError}</Text>
            <Spacer size="lg" />
            <ModernButton
              text="Try Again"
              variant="solid"
              onPress={fetchAllData}
              style={{ backgroundColor: theme.colors.primary[500] }}
            />
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Container>
        {dataLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              zIndex: theme.zIndex.overlay,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Spacer size="sm" />
            <Text weight="medium" color="neutral.600">
              Updating...
            </Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.brandGreen]}
              tintColor={theme.colors.brandGreen}
              title="Pull to refresh"
              titleColor={theme.colors.neutral[600]}
            />
          }
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Row
              justify="space-between"
              align="center"
              style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.brandWhite,
              }}
            >
              <Column>
                <Text variant="caption" weight="medium" color="neutral.600">
                  Welcome back,
                </Text>
                <Heading
                  level="h2"
                  numberOfLines={1}
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  {user?.username || user?.displayName || "User"}
                </Heading>
                <Row align="center" style={{ marginTop: theme.spacing.xs }}>
                  <Ionicons
                    name="flame"
                    size={16}
                    color={theme.colors.brandGreen}
                  />
                  <Text
                    variant="caption"
                    weight="semibold"
                    style={{
                      marginLeft: 4,
                      color: theme.colors.brandGreen,
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    {progressData.streak} day streak
                  </Text>
                </Row>
              </Column>
              <View
                style={{
                  shadowColor: theme.colors.brandNavy,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  // elevation: 4,
                  borderRadius: 32,
                  borderWidth: 2,
                  borderColor: theme.colors.brandWhite,
                }}
              >
                <ModernAvatar
                  source={user?.profilePicture}
                  name={user?.username || user?.displayName || "User"}
                  size={90}
                  interactive
                  showBadge
                  onPress={() => router.push("/profile")}
                />
              </View>
            </Row>
          </Animated.View>

          {/* Enhanced Subscription Display */}
          {!subscriptionLoading && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                paddingHorizontal: theme.spacing.md,
                marginBottom: theme.spacing.sm,
              }}
            >
              <TouchableOpacity onPress={() => router.push("/subscription")}>
                <View
                  style={{
                    backgroundColor: currentPlan.tier === 'free'
                      ? theme.colors.brandGreen + "08"
                      : theme.colors.brandNavy + "08",
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: currentPlan.tier === 'free'
                      ? theme.colors.brandGreen + "20"
                      : theme.colors.brandNavy + "20",
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                  }}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center" style={{ flex: 1 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: currentPlan.tier === 'free'
                            ? theme.colors.brandGreen + "15"
                            : theme.colors.brandGreen + "15",
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: theme.spacing.xs,
                        }}
                      >
                        <Ionicons
                          name={currentPlan.tier === 'free' ? "star-outline" : "star"}
                          size={14}
                          color={currentPlan.tier === 'free' ? theme.colors.brandGreen : theme.colors.brandGreen}
                        />
                      </View>
                      <Column style={{ flex: 1 }}>
                        <Text variant="caption" weight="medium" color="neutral.500" style={{ fontSize: 10,marginBottom:-20 }}>
                          CURRENT PLAN
                        </Text>
                        <Text weight="semibold" numberOfLines={1} style={{ color: theme.colors.brandNavy, fontSize: 14 }}>
                          {currentPlan.name}
                        </Text>
                      </Column>
                    </Row>
                    <Row align="center">
                      {currentPlan.tier === 'free' && hasReachedLimit('lessons') && (
                        <View
                          style={{
                            backgroundColor: theme.colors.warning.main,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: theme.borderRadius.sm,
                            marginRight: theme.spacing.xs,
                          }}
                        >
                          <Text
                            variant="caption"
                            weight="bold"
                            style={{ color: 'white', fontSize: 9 }}
                          >
                            UPGRADE
                          </Text>
                        </View>
                      )}
                      {currentPlan.tier !== 'free' && (
                        <View
                          style={{
                            backgroundColor: theme.colors.brandGreen,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: theme.borderRadius.sm,
                            marginRight: theme.spacing.xs,
                          }}
                        >
                          <Text
                            variant="caption"
                            weight="bold"
                            style={{ color: 'white', fontSize: 9 }}
                          >
                            ACTIVE
                          </Text>
                        </View>
                      )}
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={theme.colors.neutral[400]}
                      />
                    </Row>
                  </Row>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Spacer size="md" />

          {currentLesson && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                paddingHorizontal: theme.spacing.md,
              }}
            >
              <Heading
                level="h3"
                style={{
                  marginBottom: theme.spacing.sm,
                  color: theme.colors.brandNavy,
                  fontFamily: theme.typography.fontFamily.semibold,
                }}
              >
                Continue Learning
              </Heading>
              <ModernCard
                variant="elevated"
                style={{
                  backgroundColor: theme.colors.brandGreen + "10", // 10% opacity
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.brandGreen + "20", // 20% opacity
                }}
                interactive
                onPress={() =>
                  router.push(`/tutor/lesson/${currentLesson.lessonId}`)
                }
              >
                <Row align="center">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.colors.brandGreen,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: theme.spacing.sm,
                    }}
                  >
                    <Ionicons name="book-outline" size={20} color="white" />
                  </View>
                  <Column style={{ flex: 1, marginRight: theme.spacing.sm }}>
                    <Text
                      weight="semibold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {currentLesson.name}
                    </Text>
                    <Text
                      variant="caption"
                      weight="medium"
                      color="neutral.600"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {currentLesson.description}
                    </Text>
                    <Row align="center" style={{ marginTop: theme.spacing.xs }}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={theme.colors.neutral[500]}
                      />
                      <Text
                        variant="caption"
                        color="neutral.500"
                        style={{ marginLeft: 4 }}
                      >
                        {currentLesson.estimatedDuration} min
                      </Text>
                    </Row>
                  </Column>
                  <ModernButton
                    text="Continue"
                    variant="solid"
                    size="sm"
                    style={{ backgroundColor: theme.colors.primary[500] }}
                  />
                </Row>
              </ModernCard>
            </Animated.View>
          )}

          <Spacer size="lg" />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingHorizontal: theme.spacing.md,
            }}
          >
            <Heading
              level="h3"
              style={{
                marginBottom: theme.spacing.sm,
                color: theme.colors.brandNavy,
                fontFamily: theme.typography.fontFamily.semibold,
              }}
            >
              Quick Actions
            </Heading>
            <Row justify="center">
              <ModernCard
                variant="flat"
                interactive
                onPress={() =>
                  router.push({
                    pathname: "/tutor/standalone-conversation",
                    params: {
                      scenarioId: "general-conversation",
                      title: "Talk with Cooper",
                      level: "Beginner",
                    },
                  })
                }
                style={{
                  flex: 1,
                  marginRight: theme.spacing.xs,
                  minHeight: 120, // Better touch target
                  justifyContent: "center",
                  backgroundColor: theme.colors.brandGreen + "08", // 8% opacity
                  borderWidth: 1,
                  borderColor: theme.colors.brandGreen + "20", // 20% opacity
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.colors.brandGreen + "20", // 20% opacity
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: theme.spacing.sm,
                    alignSelf: "center",
                  }}
                >
                  <Ionicons
                    name="mic-outline"
                    size={24}
                    color={theme.colors.brandGreen}
                  />
                </View>
                <Text
                  weight="semibold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  align="center"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  Talk with Cooper
                </Text>
                <Text
                  variant="caption"
                  weight="medium"
                  numberOfLines={1}
                  align="center"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                  }}
                >
                  Practice conversation
                </Text>
              </ModernCard>
              <ModernCard
                variant="flat"
                interactive
                onPress={() => {
                  if (currentLesson) {
                    router.push(`/tutor/lesson/${currentLesson.lessonId}`);
                  } else {
                    router.push("/tutor/lessons");
                  }
                }}
                style={{
                  flex: 1,
                  marginLeft: theme.spacing.xs,
                  minHeight: 120, // Better touch target
                  justifyContent: "center",
                  backgroundColor: theme.colors.brandNavy + "08", // 8% opacity
                  borderWidth: 1,
                  borderColor: theme.colors.brandNavy + "20", // 20% opacity
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.colors.brandNavy + "20", // 20% opacity
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: theme.spacing.sm,
                    alignSelf: "center",
                  }}
                >
                  <Ionicons
                    name="book-outline"
                    size={24}
                    color={theme.colors.brandNavy}
                  />
                </View>
                <Text
                  weight="semibold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  align="center"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  Current Lesson
                </Text>
                <Text
                  variant="caption"
                  weight="medium"
                  numberOfLines={2}
                  align="center"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                  }}
                >
                  {currentLesson ? currentLesson.name : "Start learning"}
                </Text>
              </ModernCard>
            </Row>
          </Animated.View>

          <Spacer size="lg" />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingHorizontal: theme.spacing.md,
            }}
          >
            {/* Enhanced Progress Card */}
            <ModernCard
              variant="elevated"
              style={{
                backgroundColor: theme.colors.brandWhite,
                borderRadius: 16,
                shadowColor: "transparent",
                // shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0,
                // shadowRadius: 8,
                // elevation: 4,
              }}
            >
              {/* Header Section */}
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
                      fontSize: 11,
                      marginBottom: -18,
                    }}
                  >
                    Your Progress
                  </Text>
                  <Heading
                    level="h3"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.bold,
                      fontSize: 20,
                    }}
                  >
                    {progressData.currentLevel} Level
                  </Heading>
                </Column>

                {/* Enhanced Level Badge */}
                <View
                  style={{
                    backgroundColor: (progressData.currentLevelColor || theme.colors.brandGreen) + "15",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: (progressData.currentLevelColor || theme.colors.brandGreen) + "30",
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={progressData.currentLevelIcon || "star-outline"}
                    size={14}
                    color={progressData.currentLevelColor || theme.colors.brandGreen}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    weight="semibold"
                    style={{
                      color: progressData.currentLevelColor || theme.colors.brandGreen,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 12,
                    }}
                  >
                    Level {progressData.currentLevelNumber}
                  </Text>
                </View>
              </Row>

              {/* Progress Section */}
              <View style={{ marginBottom: theme.spacing.lg }}>
                <Row
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 16,
                    }}
                  >
                    {progressData.levelProgress}% Complete
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.neutral[500],
                      fontFamily: theme.typography.fontFamily.medium,
                      fontSize: 12,
                    }}
                  >
                    {progressData.totalXP} /{" "}
                    {progressData.xpToNextLevel === 0
                      ? "∞"
                      : progressData.totalXP + progressData.xpToNextLevel}{" "}
                    XP
                  </Text>
                </Row>

                <ModernProgressBar
                  value={progressData.levelProgress}
                  max={100}
                  height={8}
                  rounded
                  style={{
                    backgroundColor: theme.colors.neutral[200],
                  }}
                  color={theme.colors.brandGreen}
                />

                <Text
                  variant="caption"
                  style={{
                    color: theme.colors.neutral[500],
                    fontFamily: theme.typography.fontFamily.regular,
                    fontSize: 11,
                    marginTop: 6,
                  }}
                >
                  {progressData.xpToNextLevel === 0
                    ? "Maximum level reached! 🎉"
                    : `${progressData.xpToNextLevel} XP to next level`}
                </Text>
              </View>

              {/* Stats Grid */}
              <View style={{ marginBottom: theme.spacing.lg }}>
                <Row justify="space-between">
                  {/* XP Stat */}
                  <Column align="center" style={{ flex: 1 }}>
                    <Text
                      weight="bold"
                      style={{
                        color: theme.colors.brandGreen,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 24,
                        lineHeight: 28,
                      }}
                    >
                      {progressData.totalXP}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      Total XP
                    </Text>
                  </Column>

                  {/* Vertical Divider */}
                  <View
                    style={{
                      width: 1,
                      height: 40,
                      backgroundColor: theme.colors.neutral[200],
                      marginHorizontal: theme.spacing.md,
                    }}
                  />

                  {/* Lessons Stat */}
                  <Column align="center" style={{ flex: 1 }}>
                    <Text
                      weight="bold"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 24,
                        lineHeight: 28,
                      }}
                    >
                      {progressData.completed}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      Lessons Done
                    </Text>
                  </Column>

                  {/* Vertical Divider */}
                  <View
                    style={{
                      width: 1,
                      height: 40,
                      backgroundColor: theme.colors.neutral[200],
                      marginHorizontal: theme.spacing.md,
                    }}
                  />

                  {/* Streak Stat */}
                  <Column align="center" style={{ flex: 1 }}>
                    <Text
                      weight="bold"
                      style={{
                        color: "#FF6B35",
                        fontFamily: theme.typography.fontFamily.bold,
                        fontSize: 24,
                        lineHeight: 28,
                      }}
                    >
                      {progressData.streak}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.medium,
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      Day Streak
                    </Text>
                  </Column>
                </Row>
              </View>

              {/* Action Button */}
              <ModernButton
                text="View Detailed Progress"
                variant="solid"
                iconName="analytics-outline"
                iconPosition="left"
                onPress={() => router.push("/tutor/progress")}
                style={{
                  backgroundColor: theme.colors.brandGreen,
                  borderRadius: 12,
                }}
                textStyle={{
                  fontFamily: theme.typography.fontFamily.semibold,
                }}
              />
            </ModernCard>
          </Animated.View>

          <Spacer size="md" />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingHorizontal: theme.spacing.md,
              marginTop: -theme.spacing.sm,
            }}
          >
            <Row
              justify="space-between"
              align="center"
              style={{ marginBottom: theme.spacing.lg, marginTop: 30 }}
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
                  Practice
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    fontSize: 20,
                  }}
                >
                  Learning Scenarios
                </Heading>
              </Column>
              <TouchableOpacity
                onPress={() => router.push("/tutor/scenarios")}
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
                  See All
                </Text>
              </TouchableOpacity>
            </Row>
            {(learningScenarios.length > 0
              ? learningScenarios
              : [
                  {
                    id: "s1",
                    title: "Greetings & Introductions",
                    level: "Beginner",
                    icon: "hand-left-outline",
                    color: theme.colors.brandGreen,
                    description:
                      "Learn basic greetings and how to introduce yourself",
                  },
                  {
                    id: "s2",
                    title: "Ordering Food",
                    level: "Beginner",
                    icon: "restaurant-outline",
                    color: theme.colors.brandNavy,
                    description: "Practice ordering food at restaurants",
                  },
                  {
                    id: "s3",
                    title: "Making Plans",
                    level: "Intermediate",
                    icon: "calendar-outline",
                    color: "#FF9800",
                    description: "Learn to make plans and appointments",
                  },
                ]
            ).map((scenario) => (
              <ModernCard
                key={scenario.id}
                interactive
                onPress={() => navigateToScenario(scenario.id)}
                style={{
                  marginBottom: theme.spacing.sm,
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: theme.colors.brandWhite,
                  borderWidth: 1,
                  borderColor: scenario.color + "20",
                }}
              >
                <Row align="center">
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: scenario.color + "15",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <Ionicons
                      name={scenario.icon}
                      size={24}
                      color={scenario.color}
                    />
                  </View>
                  <Column
                    style={{
                      flex: 1,
                      maxWidth: "90%",
                      display: "flex",
                      gap: 2,
                    }}
                  >
                    <Text
                      weight="semibold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        color: theme.colors.brandNavy,
                        fontFamily: theme.typography.fontFamily.semibold,
                        marginBottom: -12,
                      }}
                    >
                      {scenario.title}
                    </Text>
                    <Text
                      variant="caption"
                      weight="medium"
                      numberOfLines={1}
                      style={{
                        marginBottom: -14,
                        color: theme.colors.neutral[600],
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
                      {scenario.level}
                    </Text>
                    <Text
                      variant="caption"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{
                        color: theme.colors.neutral[500],
                        fontFamily: theme.typography.fontFamily.regular,
                        lineHeight: 16,
                        maxWidth: "95%",
                      }}
                    >
                      {scenario.description}
                    </Text>
                  </Column>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    style={{ position: "absolute", right: 20 }}
                    color={scenario.color}
                  />
                </Row>
              </ModernCard>
            ))}
            <ModernButton
              text="View all scenarios"
              variant="solid"
              iconName="grid-outline"
              iconPosition="right"
              onPress={() => router.push("/tutor/scenarios")}
              style={{
                marginTop: theme.spacing.sm,
                backgroundColor: theme.colors.brandGreen,
              }}
            />
          </Animated.View>

          <Spacer size="md" />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingHorizontal: theme.spacing.md,
              marginTop: -theme.spacing.sm,
            }}
          >
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
                    marginTop: 30,
                    marginBottom: -18,
                  }}
                >
                  Games
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    fontSize: 20,
                  }}
                >
                  Play and Learn
                </Heading>
              </Column>
              <TouchableOpacity
                onPress={() => router.push("/games")}
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
                  See All
                </Text>
              </TouchableOpacity>
            </Row>
            {/* 2x2 Grid Layout matching games page design */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginHorizontal: -theme.spacing.xs, // Negative margin for consistent spacing
              }}
            >
              {/* Match the Word */}
              <TouchableOpacity
                onPress={() => router.push("/games/match-word")}
                style={[
                  styles.gameCard,
                  {
                    backgroundColor: theme.colors.brandWhite,
                    borderWidth: 1,
                    borderColor: theme.colors.brandGreen + "30",
                  },
                ]}
              >
                <View
                  style={[
                    styles.gameIconContainer,
                    { backgroundColor: theme.colors.brandGreen + "15" },
                  ]}
                >
                  <Ionicons
                    name="link-outline"
                    size={32}
                    color={theme.colors.brandGreen}
                  />
                </View>
                <Text
                  weight="bold"
                  style={[
                    styles.gameName,
                    {
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                    },
                  ]}
                >
                  Match the Word
                </Text>
                <Text
                  style={[
                    styles.gameDescription,
                    {
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.regular,
                    },
                  ]}
                >
                  Match Korean words with meanings
                </Text>
                <View style={[styles.xpBadge, { backgroundColor: "#FFD700" }]}>
                  <Text style={styles.xpText}>+25 XP</Text>
                </View>
              </TouchableOpacity>

              {/* Sentence Scramble */}
              <TouchableOpacity
                onPress={() => router.push("/games/sentence-scramble")}
                style={[
                  styles.gameCard,
                  {
                    backgroundColor: theme.colors.brandWhite,
                    borderWidth: 1,
                    borderColor: "#FF9800" + "30",
                  },
                ]}
              >
                <View
                  style={[
                    styles.gameIconContainer,
                    { backgroundColor: "#FF9800" + "15" },
                  ]}
                >
                  <Ionicons name="shuffle-outline" size={32} color="#FF9800" />
                </View>
                <Text
                  weight="bold"
                  style={[
                    styles.gameName,
                    {
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                    },
                  ]}
                >
                  Sentence Scramble
                </Text>
                <Text
                  style={[
                    styles.gameDescription,
                    {
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.regular,
                    },
                  ]}
                >
                  Arrange words to form sentences
                </Text>
                <View style={[styles.xpBadge, { backgroundColor: "#FFD700" }]}>
                  <Text style={styles.xpText}>+30 XP</Text>
                </View>
              </TouchableOpacity>

              {/* Pronunciation Challenge */}
              <TouchableOpacity
                onPress={() => router.push("/games/pronunciation-challenge")}
                style={[
                  styles.gameCard,
                  {
                    backgroundColor: theme.colors.brandWhite,
                    borderWidth: 1,
                    borderColor: "#2196F3" + "30",
                  },
                ]}
              >
                <View
                  style={[
                    styles.gameIconContainer,
                    { backgroundColor: "#2196F3" + "15" },
                  ]}
                >
                  <Ionicons name="mic-outline" size={32} color="#2196F3" />
                </View>
                <Text
                  weight="bold"
                  style={[
                    styles.gameName,
                    {
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                    },
                  ]}
                >
                  Pronunciation
                </Text>
                <Text
                  style={[
                    styles.gameDescription,
                    {
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.regular,
                    },
                  ]}
                >
                  Practice speaking correctly
                </Text>
                <View style={[styles.xpBadge, { backgroundColor: "#FFD700" }]}>
                  <Text style={styles.xpText}>+35 XP</Text>
                </View>
              </TouchableOpacity>

              {/* Conversation Quest */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/games/conversation-quest",
                    params: { lessonId: "practice" },
                  })
                }
                style={[
                  styles.gameCard,
                  {
                    backgroundColor: theme.colors.brandWhite,
                    borderWidth: 1,
                    borderColor: theme.colors.brandNavy + "30",
                  },
                ]}
              >
                <View
                  style={[
                    styles.gameIconContainer,
                    { backgroundColor: theme.colors.brandNavy + "15" },
                  ]}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={32}
                    color={theme.colors.brandNavy}
                  />
                </View>
                <Text
                  weight="bold"
                  style={[
                    styles.gameName,
                    {
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                    },
                  ]}
                >
                  Conversation Quest
                </Text>
                <Text
                  style={[
                    styles.gameDescription,
                    {
                      color: theme.colors.neutral[600],
                      fontFamily: theme.typography.fontFamily.regular,
                    },
                  ]}
                >
                  Interactive conversation scenarios
                </Text>
                <View style={[styles.xpBadge, { backgroundColor: "#FFD700" }]}>
                  <Text style={styles.xpText}>+40 XP</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Spacer size="md" />

          {/* 🏆 ACHIEVEMENTS SECTION */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingHorizontal: theme.spacing.md,
              marginTop: -theme.spacing.sm,
            }}
          >
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
                  Achievements
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    fontSize: 20,
                  }}
                >
                  Your Rewards
                </Heading>
              </Column>
              <TouchableOpacity
                onPress={() => router.push("/achievements")}
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
                  View All
                </Text>
              </TouchableOpacity>
            </Row>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingRight: theme.spacing.md,
                paddingTop: theme.spacing.md, // Add top padding to prevent badge cropping
              }}
              style={{ marginTop: theme.spacing.xs }}
            >
              {userAchievements.length === 0 ? (
                /* Enhanced Empty State */
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: 280,
                    height: 180,
                    backgroundColor: theme.colors.brandWhite,
                    borderRadius: 20,
                    marginRight: theme.spacing.md,
                    padding: theme.spacing.lg,
                    borderWidth: 2,
                    borderColor: theme.colors.neutral[200],
                    borderStyle: "dashed",
                  }}
                >
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: theme.colors.neutral[100],
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <Ionicons
                      name="trophy-outline"
                      size={36}
                      color={theme.colors.neutral[400]}
                    />
                  </View>
                  <Text
                    weight="semibold"
                    align="center"
                    style={{
                      color: theme.colors.brandNavy,
                      fontFamily: theme.typography.fontFamily.semibold,
                      fontSize: 14,
                      marginBottom: 6,
                      lineHeight: 18,
                    }}
                  >
                    Start Your Journey
                  </Text>
                  <Text
                    variant="caption"
                    align="center"
                    style={{
                      color: theme.colors.neutral[500],
                      fontFamily: theme.typography.fontFamily.regular,
                      fontSize: 11,
                      lineHeight: 16,
                    }}
                  >
                    Complete lessons and practice to unlock your first
                    achievement
                  </Text>
                </View>
              ) : (
                userAchievements
                  .slice(0, 5)
                  .map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      onPress={() =>
                        router.push(`/achievements?highlight=${achievement.id}`)
                      }
                      style={{ marginRight: theme.spacing.md }}
                    />
                  ))
              )}
            </ScrollView>
          </Animated.View>

          <Spacer size="4xl" />
          <Spacer size="4xl" />
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
}

// Styles for game cards matching the games page design
const styles = StyleSheet.create({
  gameCard: {
    width: (width - 48) / 2, // 2 cards per row with proper spacing
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 4, // Small horizontal margin for grid spacing
    position: "relative",
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
    lineHeight: 18,
    marginBottom: 8,
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
});
