import {
  ScrollView,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
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
  ModernButton,
  ModernAvatar,
  AchievementBadge,
} from "../../shared/components";
import { curriculumApi, tutorApi } from "../../shared/services/api";
import { curriculumService } from "../../features/curriculum/services/curriculumService";
import { getUserAchievements } from "../../features/achievements/services/achievementService";
import { useContext, useEffect, useState } from "react";
import { useSubscription } from "../../shared/hooks/useSubscription";
import { levelService } from "../../features/level/services/levelService";
// Import component sections
import ProgressSection from "./components/ProgressSection";
import QuickActionsSection from "./components/QuickActionsSection";
// import LearningModulesGrid from "./components/LearningModulesGrid"; // Hidden for now
import ScenarioPracticeCards from "./components/ScenarioPracticeCards";
import ContinueLearningSection from "./components/ContinueLearningSection";
import GamesSection from "./components/GamesSection"; // Hidden for now
import { BRAND_COLORS } from "../../shared/constants/colors";

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
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allLevels, setAllLevels] = useState([]);

  // Subscription hook
  const {
    currentPlan,
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
    let currentLevelColor = BRAND_COLORS.EXPLORER_TEAL; // Using constant

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
              style={{ backgroundColor: theme.colors.primary[500], elevation: 0 }}
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
              backgroundColor: BRAND_COLORS.CARD_BACKGROUND + "F2", // Using constant with transparency
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
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.explorerTeal]}
              tintColor={theme.colors.explorerTeal}
              title="Pull to refresh"
              titleColor={theme.colors.neutral[600]}
            />
          }
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Row
              justify="space-between"
              align="center"
              style={{
                padding: theme.spacing.md,
                backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant
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
                    color: theme.colors.oceanBlue,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  {user?.username || user?.displayName || "User"}
                </Heading>
                <Row align="center" style={{ marginTop: theme.spacing.xs }}>
                  <Ionicons
                    name="flame"
                    size={16}
                    color={theme.colors.explorerTeal}
                  />
                  <Text
                    variant="caption"
                    weight="semibold"
                    style={{
                      marginLeft: 4,
                      color: theme.colors.explorerTeal,
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    {progressData.streak} day streak
                  </Text>
                </Row>
              </Column>
              <View
                style={{
                  backgroundColor: BRAND_COLORS.GOLDEN_AMBER,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  padding: 2,
                  shadowRadius: 8,
                  elevation: 0,
                  borderRadius: 400,
                  borderWidth: 2,
                  borderColor: theme.colors.whisperWhite,
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
                backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
              }}
            >
              <TouchableOpacity onPress={() => router.push("/subscription")}>
                <View
                  style={{
                    backgroundColor: currentPlan.tier === 'free'
                      ? theme.colors.explorerTeal + "08"
                      : theme.colors.oceanBlue + "08",
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: currentPlan.tier === 'free'
                      ? theme.colors.explorerTeal + "20"
                      : theme.colors.oceanBlue + "20",
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
                            ? theme.colors.explorerTeal + "15"
                            : theme.colors.explorerTeal + "15",
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: theme.spacing.xs,
                        }}
                      >
                        <Ionicons
                          name={currentPlan.tier === 'free' ? "star-outline" : "star"}
                          size={14}
                          color={currentPlan.tier === 'free' ? theme.colors.explorerTeal : theme.colors.explorerTeal}
                        />
                      </View>
                      <Column style={{ flex: 1 }}>
                        <Text variant="caption" weight="medium" color="neutral.500" style={{ fontSize: 10, marginBottom: -20 }}>
                          CURRENT PLAN
                        </Text>
                        <Text weight="semibold" numberOfLines={1} style={{ color: theme.colors.oceanBlue, fontSize: 14 }}>
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
                            backgroundColor: theme.colors.explorerTeal,
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

          {/* 3. Progress Bar Section */}
          <ProgressSection
            progressData={progressData}
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
          />

          <Spacer size="lg" />

          {/* 4. Quick Actions Section */}
          <QuickActionsSection
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
            currentLesson={currentLesson}
          />

          <Spacer size="lg" />

          {/* 5. Learning Modules Grid Section - Hidden for now */}
          {/* <LearningModulesGrid
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
          /> */}

          {/* <Spacer size="lg" /> */}

          {/* 6. Scenario-based Practice Cards */}
          <ScenarioPracticeCards
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
          />

          <Spacer size="lg" />

          {/* 7. Games Section - Hidden for now */}
          <GamesSection
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
          />

          {/* <Spacer size="lg" /> */}

          {/* Continue Learning Section (if current lesson exists) */}
          <ContinueLearningSection
            currentLesson={currentLesson}
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
          />

          {/* 7. Achievements Section */}
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
                    color: theme.colors.oceanBlue,
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
                  View All
                </Text>
              </TouchableOpacity>
            </Row>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingRight: theme.spacing.md,
                paddingTop: theme.spacing.md,
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
                    backgroundColor: BRAND_COLORS.CARD_BACKGROUND, // Using constant
                    borderRadius: 20,
                    marginRight: theme.spacing.md,
                    padding: theme.spacing.lg,
                    borderWidth: 2,
                    borderColor: BRAND_COLORS.EXPLORER_TEAL + "40",
                    borderStyle: "dashed",
                  }}
                >
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "15",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: theme.spacing.md,
                      borderWidth: 2,
                      borderColor: BRAND_COLORS.EXPLORER_TEAL + "30",
                    }}
                  >
                    <Ionicons
                      name="trophy-outline"
                      size={36}
                      color={BRAND_COLORS.EXPLORER_TEAL}
                    />
                  </View>
                  <Text
                    weight="semibold"
                    align="center"
                    style={{
                      color: theme.colors.oceanBlue,
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


