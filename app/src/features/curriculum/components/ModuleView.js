import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { curriculumService } from "../services/curriculumService";
import { Text, ModernButton } from "../../../shared/components";
import ScreenPadding from "../../../shared/components/ScreenPadding";

/**
 * ModuleView component
 * Displays a module with its lessons and allows navigation through them
 *
 * @param {Object} props - Component props
 * @param {string} props.moduleId - Module ID to display
 * @param {Function} props.onLessonSelect - Function to call when a lesson is selected
 * @param {boolean} props.isPreviewMode - Whether this is preview mode for locked modules
 */
const ModuleView = ({ moduleId, onLessonSelect, isPreviewMode = false }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch module data
  useEffect(() => {
    const fetchModule = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await curriculumService.getModule(moduleId);
        console.log("🔍 Frontend: Module response:", response);
        if (response.success) {
          console.log("✅ Frontend: Module loaded successfully");

          // Debug: Check lesson lock status
          if (response.data.module.lessons) {
            console.log(
              "🔍 Frontend: Lesson lock status:",
              response.data.module.lessons.map((lesson) => ({
                id: lesson.id,
                name: lesson.name,
                order: lesson.order,
                isLocked: lesson.progress?.isLocked,
                completed: lesson.progress?.completed,
                progress: lesson.progress,
              }))
            );
          }

          setModule(response.data.module);
        } else {
          setError(response.error || "Failed to load module");
        }
      } catch (err) {
        console.error("Error fetching module:", err);
        setError("Failed to load module. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  // Handle lesson selection
  const handleLessonSelect = (lessonId) => {
    if (onLessonSelect) {
      onLessonSelect(lessonId);
    } else {
      router.push(`/tutor/lesson/${lessonId}`);
    }
  };

  // Render lesson item with modern design
  const renderLesson = (lesson) => {
    const isLocked = isPreviewMode || lesson.progress?.isLocked || false;
    const isCompleted = !isPreviewMode && (lesson.progress?.completed || false);

    return (
      <TouchableOpacity
        key={lesson.id}
        style={[
          styles.lessonCard,
          isCompleted && styles.completedLessonCard,
          isLocked && styles.lockedLessonCard,
        ]}
        onPress={() => !isLocked && handleLessonSelect(lesson.id)}
        disabled={isLocked}
        activeOpacity={0.7}
      >
        <View style={styles.lessonContent}>
          {/* Lesson Icon/Status */}
          <View style={styles.lessonIconContainer}>
            {isCompleted ? (
              <View style={styles.completedIcon}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            ) : isLocked ? (
              <View style={styles.lockedIcon}>
                <Ionicons name="lock-closed" size={16} color="#999" />
              </View>
            ) : (
              <View style={styles.lessonNumber}>
                <Text weight="bold" style={styles.lessonNumberText}>
                  {lesson.order}
                </Text>
              </View>
            )}
          </View>

          {/* Lesson Details */}
          <View style={styles.lessonDetails}>
            <Text
              weight="semibold"
              style={[
                styles.lessonTitle,
                isLocked && styles.lockedText,
                isCompleted && styles.completedText,
              ]}
            >
              {lesson.name}
            </Text>
            <Text
              style={[styles.lessonDescription, isLocked && styles.lockedText]}
              numberOfLines={2}
            >
              {lesson.description}
            </Text>

            {/* Lesson Meta */}
            <View style={styles.lessonMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={isLocked ? "#999" : "#666"}
                />
                <Text style={[styles.metaText, isLocked && styles.lockedText]}>
                  {lesson.estimatedDuration || 15} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="star-outline"
                  size={14}
                  color={isLocked ? "#999" : "#6FC935"}
                />
                <Text style={[styles.metaText, isLocked && styles.lockedText]}>
                  {lesson.xpReward || 50} XP
                </Text>
              </View>
            </View>
          </View>

          {/* Action Indicator */}
          <View style={styles.lessonAction}>
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Done</Text>
              </View>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isLocked ? "#ccc" : "#6FC935"}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ScreenPadding>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading module...</Text>
        </View>
      </ScreenPadding>
    );
  }

  if (error) {
    return (
      <ScreenPadding>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <ModernButton
            text="Try Again"
            onPress={() => window.location.reload()}
            style={styles.retryButton}
          />
        </View>
      </ScreenPadding>
    );
  }
  console.log(module);

  if (!module) {
    return (
      <ScreenPadding>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Module not found</Text>
        </View>
      </ScreenPadding>
    );
  }

  return (
    <ScreenPadding>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Preview Mode Banner */}
          {isPreviewMode && (
            <View style={styles.previewBanner}>
              <View style={styles.previewContent}>
                <View style={styles.previewIcon}>
                  <Ionicons name="eye-outline" size={20} color="#856404" />
                </View>
                <View style={styles.previewText}>
                  <Text weight="bold" style={styles.previewTitle}>
                    Preview Mode
                  </Text>
                  <Text variant="body2" style={styles.previewDescription}>
                    This module is locked. Complete previous modules to unlock
                    full access.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Module Header Card */}
          <View style={styles.moduleCard}>
            <View style={styles.moduleHeader}>
              <View
                style={[
                  styles.moduleIcon,
                  { backgroundColor: module.color || "#6FC935" },
                ]}
              >
                <Ionicons
                  name={module.icon || "book-outline"}
                  size={28}
                  color="#fff"
                />
              </View>

              <View style={styles.moduleInfo}>
                <Text weight="bold" style={styles.moduleTitle}>
                  {module.name}
                </Text>
                <Text style={styles.moduleDescription}>
                  {module.description}
                </Text>
              </View>
            </View>

            {/* Module Stats */}
            <View style={styles.moduleStats}>
              <View style={styles.statItem}>
                <Text weight="bold" style={styles.statValue}>
                  {module.lessons?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text weight="bold" style={styles.statValue}>
                  {isPreviewMode ? 0 : module.progress?.lessonsCompleted || 0}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text weight="bold" style={styles.statValue}>
                  {Math.round(
                    isPreviewMode ? 0 : module.progress?.progress || 0
                  )}
                  %
                </Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
          </View>

          {/* Lessons Section */}
          <View style={styles.lessonsSection}>
            <View style={styles.sectionHeader}>
              <Text weight="bold" style={styles.sectionTitle}>
                Lessons
              </Text>
              <View style={styles.lessonCount}>
                <Text style={styles.lessonCountText}>
                  {module.lessons?.length || 0}
                </Text>
              </View>
            </View>

            <View style={styles.lessonsList}>
              {module.lessons?.map(renderLesson)}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenPadding>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
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
    fontFamily: "Montserrat-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Montserrat-Regular",
  },
  retryButton: {
    minWidth: 120,
  },
  // Preview Banner Styles
  previewBanner: {
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#FFEAA7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(133, 100, 4, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: "#856404",
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#856404",
    lineHeight: 20,
  },
  // Module Card Styles
  moduleCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    lineHeight: 20,
  },
  moduleStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#6FC935",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
    color: "#999",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#f0f0f0",
  },
  // Lessons Section Styles
  lessonsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#0A2240",
  },
  lessonCount: {
    backgroundColor: "#6FC935",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  lessonCountText: {
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  lessonsList: {
    gap: 12,
  },
  // Lesson Card Styles
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  completedLessonCard: {
    backgroundColor: "rgba(111, 201, 53, 0.05)",
    borderColor: "#6FC935",
    borderWidth: 1,
  },
  lockedLessonCard: {
    opacity: 0.6,
    backgroundColor: "#f8f9fa",
  },
  lessonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonIconContainer: {
    marginRight: 12,
  },
  completedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6FC935",
    justifyContent: "center",
    alignItems: "center",
  },
  lockedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6FC935",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumberText: {
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
  lessonDetails: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#0A2240",
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#666",
    lineHeight: 18,
    marginBottom: 8,
  },
  completedText: {
    color: "#6FC935",
  },
  lockedText: {
    color: "#999",
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Montserrat-Medium",
    color: "#666",
  },
  lessonAction: {
    alignItems: "center",
  },
  completedBadge: {
    backgroundColor: "#6FC935",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
  },
});

export default ModuleView;
