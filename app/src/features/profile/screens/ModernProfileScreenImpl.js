import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { curriculumService } from "../../curriculum/services/curriculumService";
import { updateUserProfile } from "../../../shared/api/authApi";
import { SUPPORT_EMAIL } from "../../../shared/constants/appConstants";
import { useSubscription } from "../../../shared/hooks/useSubscription";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";

// Import modern components
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
  ModernBadge,
  ModernErrorMessage,
  ModernDivider,
} from "../../../shared/components";

const { width } = Dimensions.get("window");

/**
 * ModernProfileScreenImpl component
 * A modern implementation of the profile screen
 */
const ModernProfileScreenImpl = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isLoading, signOut } = useAuth();

  // Subscription hook
  const {
    currentPlan,
    usage,
    hasActiveSubscription,
    hasReachedLimit,
    loading: subscriptionLoading,
    refreshSubscription,
  } = useSubscription();

  // Calculate user level based on XP (matching home page logic)
  const getUserLevel = (totalXp) => {
    if (totalXp >= 4000) return "Advanced";
    if (totalXp >= 2000) return "Intermediate";
    return "Beginner";
  };

  // Animation state
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  // State
  const [error, setError] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(theme.mode === "dark");
  const [notifications, setNotifications] = useState(
    user?.preferences?.notifications?.push || true
  );
  const [userProgress, setUserProgress] = useState(null);
  const [stats, setStats] = useState({
    conversations: 0,
    learningTime: "0h 0m",
    completedScenarios: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch user progress and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setIsLoadingStats(true);
        setError(null);

        // Fetch user progress from curriculum service
        const progressResponse = await curriculumService.getUserProgress();
        if (progressResponse.data && progressResponse.data.progress) {
          const progress = progressResponse.data.progress;
          setUserProgress(progress);

          // Calculate stats from real data
          const totalLessons =
            progress.modules?.reduce(
              (total, module) => total + (module.lessons?.length || 0),
              0
            ) || 0;
          const completedLessons = progress.lessonsCompleted || 0;
          const totalXp = progress.totalExperience || 0;

          // Convert XP to learning time (rough estimate: 1 XP = 1 minute)
          const totalMinutes = Math.floor(totalXp / 10); // More realistic conversion
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          setStats({
            conversations: completedLessons,
            learningTime: `${hours}h ${minutes}m`,
            completedScenarios: completedLessons,
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user statistics");
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Animation setup
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
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    if (!user || isRefreshing) return;

    console.log("🔄 Profile pull-to-refresh triggered");
    setIsRefreshing(true);
    setError(null);

    try {
      // Refresh subscription data
      if (typeof refreshSubscription === 'function') {
        refreshSubscription();
      }

      // Use cache-busting for fresh data
      const response = await curriculumService.getUserProgress(true);

      if (response.data && response.data.progress) {
        const progress = response.data.progress;
        setUserProgress(progress);

        // Calculate fresh stats
        const totalLessons =
          progress.modules?.reduce(
            (total, module) => total + (module.lessons?.length || 0),
            0
          ) || 0;
        const completedLessons = progress.lessonsCompleted || 0;
        const totalXp = progress.totalExperience || 0;

        const totalMinutes = Math.floor(totalXp / 10);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        setStats({
          conversations: completedLessons,
          learningTime: `${hours}h ${minutes}m`,
          completedScenarios: completedLessons,
        });

        console.log("✅ Profile data refreshed successfully");
      }
    } catch (error) {
      console.error("❌ Error during profile refresh:", error);
      setError("Failed to refresh profile data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle dark mode toggle - make it functional
  const handleDarkModeToggle = async (value) => {
    setDarkMode(value);

    try {
      // Update user preferences in backend
      await updateUserProfile({
        preferences: {
          ...user?.preferences,
          theme: value ? "dark" : "light",
        },
      });
    } catch (err) {
      console.error("Error updating theme preference:", err);
      // Revert the toggle if API call fails
      setDarkMode(!value);
    }
  };

  // Handle notifications toggle
  const handleNotificationsToggle = async (value) => {
    setNotifications(value);

    try {
      // Update user preferences in backend
      await updateUserProfile({
        preferences: {
          ...user?.preferences,
          notifications: {
            ...user?.preferences?.notifications,
            push: value,
          },
        },
      });
    } catch (err) {
      console.error("Error updating notification preference:", err);
      // Revert the toggle if API call fails
      setNotifications(!value);
    }
  };

  // Handle upgrade button press
  const handleUpgrade = () => {
    Alert.alert("Coming Soon", "Stay tuned for premium features!", [
      { text: "OK", style: "default" },
    ]);
  };

  // Handle help & support
  const handleHelp = () => {
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=Help & Support - UNextDoor App`;
    Linking.openURL(emailUrl).catch((err) => {
      console.error("Error opening email:", err);
      Alert.alert(
        "Contact Support",
        `Please email us at ${SUPPORT_EMAIL} for help and support.`,
        [{ text: "OK", style: "default" }]
      );
    });
  };

  // Subscription plan based on real subscription data from useSubscription hook
  // This replaces the static user?.subscription data with actual backend data

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      setError("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  // If loading, show spinner
  if (isLoading && !isSigningOut) {
    return (
      <SafeAreaWrapper>
        <Container withPadding>
          <Column align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator size="large" color={theme.colors.brandGreen} />
            <Spacer size="md" />
            <Text>Loading...</Text>
          </Column>
        </Container>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Container>
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
          style={{ flex: 1 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Modern Header Section */}
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
                  PROFILE
                </Text>
                <Heading
                  level="h2"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                  }}
                >
                  Your Progress
                </Heading>
              </Column>
              <TouchableOpacity
                onPress={() => router.push("/profile/edit")}
                style={{
                  backgroundColor: theme.colors.brandGreen,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Text
                  weight="semibold"
                  style={{
                    color: theme.colors.brandWhite,
                    fontSize: 12,
                    fontFamily: theme.typography.fontFamily.semibold,
                  }}
                >
                  EDIT
                </Text>
              </TouchableOpacity>
            </Row>

            {/* Error message */}
            {error && (
              <View style={{ paddingHorizontal: theme.spacing.md }}>
                <ModernErrorMessage error={error} />
              </View>
            )}

            <Spacer size="md" />

            {/* Profile Card */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                  alignItems: "center",
                  elevation: 0,
                }}
              >
                <View
                  style={{
                    shadowColor: theme.colors.brandNavy,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    borderRadius: 50,
                    borderWidth: 3,
                    borderColor: theme.colors.brandWhite,
                  }}
                >
                  <ModernAvatar
                    source={user?.profilePicture}
                    name={
                      user?.displayName ||
                      user?.username ||
                      user?.email ||
                      "User"
                    }
                    size={100}
                    interactive
                    onPress={() => router.push("/profile/edit")}
                  />
                </View>

                <Spacer size="md" />

                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    textAlign: "center",
                  }}
                >
                  {user?.displayName || user?.username || "User"}
                </Heading>

                <Text
                  variant="caption"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.regular,
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {user?.email || ""}
                </Text>

                <Spacer size="sm" />

                {/* Level Badge */}
                <View
                  style={{
                    backgroundColor: theme.colors.brandNavy,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    weight="semibold"
                    style={{
                      color: theme.colors.brandWhite,
                      fontSize: 12,
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    {getUserLevel(userProgress?.totalExperience || 0)} Level
                  </Text>
                </View>
              </ModernCard>
            </View>

            <Spacer size="md" />

            {/* Stats Section */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  YOUR PROGRESS
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Learning Statistics
                </Heading>

                {isLoadingStats ? (
                  <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.brandGreen}
                    />
                    <Text
                      variant="caption"
                      style={{
                        marginTop: 8,
                        color: theme.colors.neutral[600],
                      }}
                    >
                      Loading your progress...
                    </Text>
                  </View>
                ) : (
                  <Row justify="space-between" align="center">
                    <Column align="center" style={{ flex: 1 }}>
                      <Text
                        weight="bold"
                        style={{
                          fontSize: 24,
                          color: theme.colors.brandGreen,
                          fontFamily: theme.typography.fontFamily.bold,
                        }}
                      >
                        {stats.conversations}
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: theme.colors.neutral[600],
                          fontFamily: theme.typography.fontFamily.regular,
                        }}
                      >
                        Lessons
                      </Text>
                    </Column>

                    <View
                      style={{
                        width: 1,
                        height: 40,
                        backgroundColor: theme.colors.neutral[200],
                      }}
                    />

                    <Column align="center" style={{ flex: 1 }}>
                      <Text
                        weight="bold"
                        style={{
                          fontSize: 24,
                          color: theme.colors.brandGreen,
                          fontFamily: theme.typography.fontFamily.bold,
                        }}
                      >
                        {stats.learningTime}
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: theme.colors.neutral[600],
                          fontFamily: theme.typography.fontFamily.regular,
                        }}
                      >
                        Study Time
                      </Text>
                    </Column>

                    <View
                      style={{
                        width: 1,
                        height: 40,
                        backgroundColor: theme.colors.neutral[200],
                      }}
                    />

                    <Column align="center" style={{ flex: 1 }}>
                      <Text
                        weight="bold"
                        style={{
                          fontSize: 24,
                          color: theme.colors.brandGreen,
                          fontFamily: theme.typography.fontFamily.bold,
                        }}
                      >
                        {userProgress?.totalExperience || 0}
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: theme.colors.neutral[600],
                          fontFamily: theme.typography.fontFamily.regular,
                        }}
                      >
                        Total XP
                      </Text>
                    </Column>
                  </Row>
                )}
              </ModernCard>
            </View>

            <Spacer size="md" />

            {/* Subscription Section */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <ModernCard
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  SUBSCRIPTION
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Current Plan
                </Heading>

                {subscriptionLoading ? (
                  <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.brandGreen}
                    />
                    <Text
                      variant="caption"
                      style={{
                        marginTop: 8,
                        color: theme.colors.neutral[600],
                      }}
                    >
                      Loading subscription data...
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Current Plan */}
                    <Row
                      justify="space-between"
                      align="center"
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.neutral[100],
                      }}
                    >
                      <Row align="center">
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: currentPlan.tier === 'free' ? theme.colors.warning.main + "20" : theme.colors.success.main + "20",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons
                            name={currentPlan.tier === 'free' ? "star-outline" : "checkmark-circle-outline"}
                            size={20}
                            color={currentPlan.tier === 'free' ? theme.colors.warning.main : theme.colors.success.main}
                          />
                        </View>
                        <Column>
                          <Text
                            weight="medium"
                            style={{
                              color: theme.colors.brandNavy,
                              fontFamily: theme.typography.fontFamily.medium,
                            }}
                          >
                            {currentPlan.name} Plan
                          </Text>
                          <Text
                            variant="caption"
                            style={{
                              color: theme.colors.neutral[600],
                              fontFamily: theme.typography.fontFamily.regular,
                            }}
                          >
                            {currentPlan.tier === 'free' 
                              ? `${usage.lessons.remaining}/${usage.lessons.limit} lessons left` 
                              : hasActiveSubscription 
                                ? 'Active subscription' 
                                : 'Inactive subscription'
                            }
                          </Text>
                        </Column>
                      </Row>

                      {currentPlan.tier === 'free' ? (
                        <ModernButton
                          text="Upgrade"
                          variant="solid"
                          size="sm"
                          style={{ 
                            backgroundColor: theme.colors.warning.main,
                            paddingHorizontal: theme.spacing.md,
                          }}
                          onPress={() => router.push("/subscription")}
                        />
                      ) : (
                        <TouchableOpacity onPress={() => router.push("/subscription")}>
                          <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
                        </TouchableOpacity>
                      )}
                    </Row>

                    {/* Usage Stats for Free Users */}
                    {currentPlan.tier === 'free' && (
                      <View style={{ marginTop: theme.spacing.md }}>
                        <Text
                          variant="caption"
                          weight="medium"
                          style={{
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.medium,
                            marginBottom: 8,
                          }}
                        >
                          USAGE THIS MONTH
                        </Text>
                        
                        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
                          <Text
                            variant="caption"
                            style={{
                              color: theme.colors.neutral[700],
                              fontFamily: theme.typography.fontFamily.regular,
                            }}
                          >
                            Lessons
                          </Text>
                          <Text
                            variant="caption"
                            weight="medium"
                            style={{
                              color: hasReachedLimit('lessons') ? theme.colors.error.main : theme.colors.success.main,
                              fontFamily: theme.typography.fontFamily.medium,
                            }}
                          >
                            {usage.lessons.current}/{usage.lessons.limit}
                          </Text>
                        </Row>

                        <Row justify="space-between" align="center">
                          <Text
                            variant="caption"
                            style={{
                              color: theme.colors.neutral[700],
                              fontFamily: theme.typography.fontFamily.regular,
                            }}
                          >
                            AI Sessions
                          </Text>
                          <Text
                            variant="caption"
                            weight="medium"
                            style={{
                              color: hasReachedLimit('aiSessions') ? theme.colors.error.main : theme.colors.success.main,
                              fontFamily: theme.typography.fontFamily.medium,
                            }}
                          >
                            {usage.aiSessions.current}/{usage.aiSessions.limit}
                          </Text>
                        </Row>

                        {(hasReachedLimit('lessons') || hasReachedLimit('aiSessions')) && (
                          <View
                            style={{
                              backgroundColor: theme.colors.error.main + "10",
                              borderRadius: 8,
                              padding: 12,
                              marginTop: 12,
                              borderWidth: 1,
                              borderColor: theme.colors.error.main + "20",
                            }}
                          >
                            <Text
                              variant="caption"
                              weight="medium"
                              style={{
                                color: theme.colors.error.main,
                                textAlign: "center",
                              }}
                            >
                              Usage limit reached. Upgrade to continue learning!
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </>
                )}
              </ModernCard>
            </View>

            <Spacer size="md" />

            {/* Settings Section */}
            <View style={{ paddingHorizontal: theme.spacing.md,elevation:0 }}>
              <ModernCard
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  padding: theme.spacing.lg,
                  elevation:0
                }}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: theme.colors.neutral[600],
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: 8,
                  }}
                >
                  PREFERENCES
                </Text>
                <Heading
                  level="h3"
                  style={{
                    color: theme.colors.brandNavy,
                    fontFamily: theme.typography.fontFamily.bold,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Settings
                </Heading>

                {/* Notifications Setting */}
                <Row
                  justify="space-between"
                  align="center"
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.neutral[100],
                  }}
                >
                  <Row align="center">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme.colors.neutral[100],
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name="notifications-outline"
                        size={20}
                        color={theme.colors.brandNavy}
                      />
                    </View>
                    <Column>
                      <Text
                        weight="medium"
                        style={{
                          color: theme.colors.brandNavy,
                          fontFamily: theme.typography.fontFamily.medium,
                        }}
                      >
                        Notifications
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: theme.colors.neutral[600],
                          fontFamily: theme.typography.fontFamily.regular,
                        }}
                      >
                        Push notifications
                      </Text>
                    </Column>
                  </Row>

                  <Switch
                    value={notifications}
                    onValueChange={handleNotificationsToggle}
                    trackColor={{
                      false: theme.colors.neutral[300],
                      true: theme.colors.brandGreen,
                    }}
                    thumbColor={theme.colors.brandWhite}
                  />
                </Row>

                {/* Help & Support */}
                <TouchableOpacity
                  onPress={handleHelp}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.neutral[100],
                  }}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: theme.colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="help-circle-outline"
                          size={20}
                          color={theme.colors.brandNavy}
                        />
                      </View>
                      <Column>
                        <Text
                          weight="medium"
                          style={{
                            color: theme.colors.brandNavy,
                            fontFamily: theme.typography.fontFamily.medium,
                          }}
                        >
                          Help & Support
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.regular,
                          }}
                        >
                          Get help and contact us
                        </Text>
                      </Column>
                    </Row>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.neutral[400]}
                    />
                  </Row>
                </TouchableOpacity>

                {/* Billing - Only show for subscribed users */}
                {hasActiveSubscription && (
                  <TouchableOpacity
                    onPress={() => router.push("/profile/billing")}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.neutral[100],
                    }}
                  >
                    <Row justify="space-between" align="center">
                      <Row align="center" style={{width: "75%"}}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.colors.neutral[100],
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons
                            name="card-outline"
                            size={20}
                            color={theme.colors.brandNavy}
                          />
                        </View>
                        <Column>
                          <Text
                            weight="medium"
                            style={{
                              color: theme.colors.brandNavy,
                              fontFamily: theme.typography.fontFamily.medium,
                            }}
                          >
                            Billing
                          </Text>
                          <Text
                            variant="caption"
                            style={{
                              color: theme.colors.neutral[600],

                              fontFamily: theme.typography.fontFamily.regular,
                            }}
                          >
                            Next bill date and payment method
                          </Text>
                        </Column>
                      </Row>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.neutral[400]}
                      />
                    </Row>
                  </TouchableOpacity>
                )}

                {/* Transactions - Only show for subscribed users */}
                {hasActiveSubscription && (
                  <TouchableOpacity
                    onPress={() => router.push("/profile/transactions")}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      width: "75%",
                      borderBottomColor: theme.colors.neutral[100],
                    }}
                  >
                    <Row justify="space-between" align="center">
                      <Row align="center">
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.colors.neutral[100],
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons
                            name="receipt-outline"
                            size={20}
                            color={theme.colors.brandNavy}
                          />
                        </View>
                        <Column>
                          <Text
                            weight="medium"
                            style={{
                              color: theme.colors.brandNavy,
                              fontFamily: theme.typography.fontFamily.medium,
                            }}
                          >
                            Transactions
                          </Text>
                          <Text
                            variant="caption"
                            style={{
                              color: theme.colors.neutral[600],
                              fontFamily: theme.typography.fontFamily.regular,
                            }}
                          >
                            Transaction history and receipts
                          </Text>
                        </Column>
                      </Row>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.neutral[400]}
                      />
                    </Row>
                  </TouchableOpacity>
                )}

                {/* About */}
                <TouchableOpacity
                  onPress={() => router.push("/profile/about")}
                  style={{ paddingVertical: 12 }}
                >
                  <Row justify="space-between" align="center">
                    <Row align="center">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: theme.colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="information-circle-outline"
                          size={20}
                          color={theme.colors.brandNavy}
                        />
                      </View>
                      <Column>
                        <Text
                          weight="medium"
                          style={{
                            color: theme.colors.brandNavy,
                            fontFamily: theme.typography.fontFamily.medium,
                          }}
                        >
                          About
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            color: theme.colors.neutral[600],
                            fontFamily: theme.typography.fontFamily.regular,
                          }}
                        >
                          App information
                        </Text>
                      </Column>
                    </Row>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.colors.neutral[400]}
                    />
                  </Row>
                </TouchableOpacity>
              </ModernCard>
            </View>

            <Spacer size="md" />

            {/* Sign Out Button */}
            <View style={{ paddingHorizontal: theme.spacing.md }}>
              <TouchableOpacity
                onPress={handleSignOut}
                disabled={isSigningOut}
                style={{
                  backgroundColor: theme.colors.brandWhite,
                  borderRadius: 16,
                  padding: theme.spacing.sm,
                  borderWidth: 2,
                  borderColor: "#FF4444",
                  alignItems: "center",
                  opacity: isSigningOut ? 0.7 : 1,
                }}
              >
                <Row align="center">
                  {isSigningOut ? (
                    <ActivityIndicator size="small" color="#FF4444" />
                  ) : (
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#FF4444"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    weight="semibold"
                    style={{
                      color: "#FF4444",
                      fontFamily: theme.typography.fontFamily.semibold,
                    }}
                  >
                    {isSigningOut ? "Signing Out..." : "Sign Out"}
                  </Text>
                </Row>
              </TouchableOpacity>
            </View>

            {/* Bottom Padding for Floating Tab Bar */}
            <View style={{ height: 150 }} />
          </Animated.View>
        </ScrollView>
      </Container>
    </SafeAreaWrapper>
  );
};

// Modern profile design with inline styles for better maintainability

export default ModernProfileScreenImpl;
