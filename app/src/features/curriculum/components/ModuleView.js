import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { curriculumService } from "../services/curriculumService";
import { Text, ModernButton } from "../../../shared/components";
import ScreenPadding from "../../../shared/components/ScreenPadding";
import { BRAND_COLORS } from "../../../shared/constants/colors";

// Helper function for cross-platform font families
const getFontFamily = (weight = 'regular') => {
  if (Platform.OS === 'web') {
    return 'Montserrat, sans-serif';
  }

  const fontMap = {
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extrabold: 'Montserrat-ExtraBold',
  };

  return fontMap[weight] || fontMap.regular;
};

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
                <Ionicons name="checkmark" size={16} color={BRAND_COLORS.WHISPER_WHITE} />
              </View>
            ) : isLocked ? (
              <View style={styles.lockedIcon}>
                <Ionicons name="lock-closed" size={16} color={BRAND_COLORS.SHADOW_GREY} />
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
                  color={isLocked ? BRAND_COLORS.SHADOW_GREY : BRAND_COLORS.SHADOW_GREY}
                />
                <Text style={[styles.metaText, isLocked && styles.lockedText]}>
                  {lesson.estimatedDuration || 15} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="star-outline"
                  size={14}
                  color={isLocked ? BRAND_COLORS.SHADOW_GREY : BRAND_COLORS.EXPLORER_TEAL}
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
                color={isLocked ? BRAND_COLORS.SHADOW_GREY + "60" : BRAND_COLORS.EXPLORER_TEAL}
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
          <ActivityIndicator size="large" color={BRAND_COLORS.EXPLORER_TEAL} />
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
                  <Ionicons name="eye-outline" size={20} color={BRAND_COLORS.EXPLORER_TEAL} />
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
                  { backgroundColor: module.color || BRAND_COLORS.EXPLORER_TEAL },
                ]}
              >
                <Ionicons
                  name={module.icon || "book-outline"}
                  size={28}
                  color={BRAND_COLORS.WHISPER_WHITE}
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
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  content: {
    paddingHorizontal: 16, // theme.spacing.md equivalent
    paddingVertical: 8,    // theme.spacing.sm equivalent
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    fontFamily: getFontFamily('medium'),
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  errorText: {
    fontSize: 16,
    color: BRAND_COLORS.SHADOW_GREY,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: getFontFamily('regular'),
    lineHeight: 24,
  },
  retryButton: {
    minWidth: 120,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
  },
  // Preview Banner Styles
  previewBanner: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "08",
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 0,
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.SHADOW_GREY,
    lineHeight: 20,
  },
  // Module Card Styles
  moduleCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
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
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.SHADOW_GREY,
    lineHeight: 20,
  },
  moduleStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.EXPLORER_TEAL + "20",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.EXPLORER_TEAL,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: getFontFamily('medium'),
    color: BRAND_COLORS.SHADOW_GREY,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "20",
  },
  // Lessons Section Styles
  lessonsSection: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.OCEAN_BLUE,
  },
  lessonCount: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  lessonCountText: {
    fontSize: 12,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.WHISPER_WHITE,
  },
  lessonsList: {
    gap: 12,
  },
  // Lesson Card Styles
  lessonCard: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 16,
    padding: 16,
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
    borderWidth: 1,
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "20",
  },
  completedLessonCard: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "08",
    borderColor: BRAND_COLORS.EXPLORER_TEAL + "40",
    borderWidth: 1,
  },
  lockedLessonCard: {
    opacity: 0.6,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderColor: BRAND_COLORS.SHADOW_GREY + "20",
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
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.SHADOW_GREY + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumberText: {
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.WHISPER_WHITE,
  },
  lessonDetails: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
    color: BRAND_COLORS.OCEAN_BLUE,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: BRAND_COLORS.SHADOW_GREY,
    lineHeight: 18,
    marginBottom: 8,
  },
  completedText: {
    color: BRAND_COLORS.EXPLORER_TEAL,
  },
  lockedText: {
    color: BRAND_COLORS.SHADOW_GREY,
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
    fontFamily: getFontFamily('medium'),
    color: BRAND_COLORS.SHADOW_GREY,
  },
  lessonAction: {
    alignItems: "center",
  },
  completedBadge: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    fontFamily: getFontFamily('bold'),
    color: BRAND_COLORS.WHISPER_WHITE,
  },
});

export default ModuleView;
