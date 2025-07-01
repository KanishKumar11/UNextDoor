import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { Text, Heading } from "../../../shared/components";
import SafeAreaWrapper from "../../../shared/components/SafeAreaWrapper";
import CurriculumMap from "../../../features/curriculum/components/CurriculumMap";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";
import { useResponsiveFonts } from "../../../shared/hooks/useResponsiveFonts";

/**
 * LessonsScreen
 * Displays all curriculum modules with progressive unlocking based on user level
 */
export default function LessonsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const fonts = useResponsiveFonts();

  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track if this is the initial mount to prevent double loading
  const isInitialMount = useRef(true);

  // Create responsive styles
  const styles = createStyles(fonts);

  // Function to fetch user progress
  const fetchUserProgress = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching user progress from backend...");

      // If force refresh, make multiple cache-busting calls to ensure fresh data
      if (forceRefresh) {
        console.log(
          "🔄 Force refresh - making multiple cache-busting calls..."
        );
        await curriculumService.getUserProgress(true); // Cache-busting call
        await curriculumService.getUserProgress(true); // Second cache-busting call
      }

      const response = await curriculumService.getUserProgress(forceRefresh);
      console.log("✅ Backend response:", response);
      console.log("✅ Backend response:", response.data.progress.modules[0]);

      if (response.data && response.data.progress) {
        setUserProgress(response.data.progress);
        console.log("📊 User progress updated successfully");

        // Debug: Check the actual progress data
        console.log("🔍 DEBUG: User progress data:", {
          totalExperience: response.data.progress.totalExperience,
          lessonsCompleted: response.data.progress.lessonsCompleted,
          streak: response.data.progress.streak,
          streakCurrent: response.data.progress.streak?.current,
          streakLongest: response.data.progress.streak?.longest,
          level: response.data.progress.level,
        });

        // 🔥 STREAK DISPLAY DEBUG
        console.log("🔥 STREAK DISPLAY DEBUG:", {
          rawStreak: response.data.progress.streak,
          streakType: typeof response.data.progress.streak,
          streakCurrent: response.data.progress.streak?.current,
          streakCurrentType: typeof response.data.progress.streak?.current,
          willDisplay: response.data.progress.streak?.current || 0,
        });

        // Debug: Check lesson progress details
        if (response.data.progress.levels) {
          const currentLevel = response.data.progress.levels.find(
            (l) => l.isCurrentLevel
          );
          if (currentLevel && currentLevel.modules) {
            console.log(
              "🔍 DEBUG: Current level modules:",
              currentLevel.modules.map((m) => ({
                id: m.id,
                name: m.name,
                progress: m.progress,
                lessons: m.lessons.map((l) => ({
                  id: l.id,
                  name: l.name,
                  completed: l.progress?.completed,
                  xpEarned: l.progress?.xpEarned,
                })),
              }))
            );
          }
        }
      } else {
        console.error("❌ Invalid response structure:", response);
        setError("Invalid data received from server");
      }
    } catch (err) {
      console.error("❌ Error fetching user progress:", err);

      let errorMessage = "Failed to load modules";
      if (err.response?.status === 401) {
        errorMessage = "Please log in to view your lessons";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user progress on mount
  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  // Refresh data when screen comes into focus (after returning from lesson)
  // Skip on initial mount to prevent double loading
  useFocusEffect(
    React.useCallback(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (user) {
        console.log("🎯 Screen focused - refreshing curriculum data...");
        // Add a small delay to ensure backend has processed lesson completion
        setTimeout(() => {
          fetchUserProgress(true); // Force refresh when returning to lessons tab
        }, 500);
      }
    }, [user])
  );

  if (isLoading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading modules...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Heading level="h2" style={styles.title}>
            Learning Modules
          </Heading>

          <View style={styles.progressInfo}>
            <View style={styles.progressItem}>
              <Text weight="bold" style={styles.progressValue}>
                {userProgress?.totalExperience || 0}
              </Text>
              <Text
                variant="caption"
                color={theme.colors.text?.secondary || "#666"}
              >
                Total XP
              </Text>
            </View>

            <View style={styles.progressItem}>
              <Text weight="bold" style={styles.progressValue}>
                {userProgress?.lessonsCompleted || 0}
              </Text>
              <Text
                variant="caption"
                color={theme.colors.text?.secondary || "#666"}
              >
                Lessons Completed
              </Text>
            </View>

            <View style={styles.progressItem}>
              <Text weight="bold" style={styles.progressValue}>
                {userProgress?.streak?.current || 0}
              </Text>
              <Text
                variant="caption"
                color={theme.colors.text?.secondary || "#666"}
              >
                Day Streak
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.text?.secondary || "#666" },
            ]}
          >
            Explore your complete Korean learning journey. Progress through
            modules to unlock advanced content and master the language step by
            step.
          </Text>

          {/* Learning Path Overview */}
          <View
            style={[
              styles.pathOverview,
              { backgroundColor: theme.colors.background?.card || "#f9f9f9" },
            ]}
          >
            <View style={styles.pathItem}>
              <View
                style={[
                  styles.pathIcon,
                  { backgroundColor: theme.colors.primary[500] || "#6FC935" },
                ]}
              >
                <Text weight="bold" color="#fff" style={styles.pathIconText}>
                  {userProgress?.levels
                    ?.filter((level) => level.isCurrentLevel)[0]
                    ?.name?.charAt(0) || "B"}
                </Text>
              </View>
              <View style={styles.pathInfo}>
                <Text weight="semibold" style={styles.pathTitle}>
                  Current Level:{" "}
                  {userProgress?.levels?.filter(
                    (level) => level.isCurrentLevel
                  )[0]?.name || "Beginner"}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.text?.secondary || "#666"}
                >
                  {userProgress?.levels?.filter(
                    (level) => level.isCurrentLevel
                  )[0]?.description || "Building your foundation"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Modules Display - Now rendered inline without separate ScrollView */}
        <CurriculumMap
          userProgress={userProgress}
          isLoading={isLoading}
          scrollable={false}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

// Create responsive styles function
const createStyles = (fonts) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    scrollContent: {
      flexGrow: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: fonts.body.medium,
      fontFamily: "Montserrat-Regular",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      color: "red",
      textAlign: "center",
      marginTop: 10,
      fontSize: fonts.body.medium,
      fontFamily: "Montserrat-Regular",
    },
    header: {
      padding: 16,
      paddingBottom: 8, // Reduce bottom padding since content flows continuously
    },
    title: {
      fontSize: fonts.heading.h2,
      fontFamily: "Montserrat-Bold",
      marginBottom: 16,
    },
    subtitle: {
      fontSize: fonts.body.medium,
      fontFamily: "Montserrat-Regular",
      color: "#666",
      marginBottom: 20,
      lineHeight: fonts.body.medium * 1.5,
    },
    progressInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      padding: 20,
    },
    progressItem: {
      alignItems: "center",
    },
    progressValue: {
      fontSize: fonts.heading.h3,
      fontFamily: "Montserrat-ExtraBold",
      marginBottom: 4,
      color: "#6FC935", // Primary green color
      fontWeight: "800",
    },
    // New path overview styles
    pathOverview: {
      borderRadius: 16,
      padding: 20,
      marginTop: 16,
      marginBottom: 8, // Add bottom margin for better flow to modules
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    pathItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    pathIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    pathIconText: {
      fontSize: fonts.body.large,
      fontFamily: "Montserrat-ExtraBold",
      fontWeight: "800",
    },
    pathInfo: {
      flex: 1,
    },
    pathTitle: {
      fontSize: fonts.body.medium,
      fontFamily: "Montserrat-SemiBold",
      marginBottom: 4,
      color: "#2c3e50",
    },
  });
