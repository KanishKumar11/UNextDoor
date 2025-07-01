import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../shared/context/ThemeContext";
import { Container, Text, Heading } from "../../../shared/components";
import CurriculumMap from "../../../features/curriculum/components/CurriculumMap";
import { curriculumService } from "../../../features/curriculum/services/curriculumService";

/**
 * CurriculumScreen
 * Displays the curriculum map with levels, modules, and lessons
 */
export default function CurriculumScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user progress
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await curriculumService.getUserProgress();
        setUserProgress(response.data.progress);
      } catch (err) {
        console.error("Error fetching user progress:", err);
        setError("Failed to load curriculum. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProgress();
  }, []);

  // Handle lesson selection
  const handleLessonSelect = async (lessonId) => {
    try {
      // Set current lesson
      await curriculumService.setCurrentLesson(lessonId);

      // Navigate to lesson screen
      router.push(`/tutor/lesson/${lessonId}`);
    } catch (err) {
      console.error("Error selecting lesson:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Container>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              Loading your learning path...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.header}>
              <Heading level="h1" style={styles.title}>
                Your Korean Learning Journey
              </Heading>

              <View style={styles.progressInfo}>
                <View style={styles.progressItem}>
                  <Text weight="bold" style={styles.progressValue}>
                    {userProgress?.totalExperience || 0}
                  </Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Total XP
                  </Text>
                </View>

                <View style={styles.progressItem}>
                  <Text weight="bold" style={styles.progressValue}>
                    {userProgress?.lessonsCompleted || 0}
                  </Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Lessons Completed
                  </Text>
                </View>

                <View style={styles.progressItem}>
                  <Text weight="bold" style={styles.progressValue}>
                    {userProgress?.streak?.current || 0}
                  </Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Day Streak
                  </Text>
                </View>
              </View>

              <Text style={styles.subtitle}>
                Follow your personalized learning path to master Korean step by
                step.
              </Text>
            </View>

            <CurriculumMap
              userProgress={userProgress}
              onLessonSelect={handleLessonSelect}
            />
          </View>
        )}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
  },
  progressItem: {
    alignItems: "center",
  },
  progressValue: {
    fontSize: 24,
    marginBottom: 4,
    color: "#6FC935", // Primary green color
  },
});
