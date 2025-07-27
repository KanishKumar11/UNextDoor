import React from "react";
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
import { Text, Heading, Spacer } from "../../../shared/components";
import { BRAND_COLORS } from "../../../shared/constants/colors";
import { mapBackendColor } from "../../../shared/utils/colorMapping";

/**
 * CurriculumMap component
 * Displays the learning path with levels, modules, and lessons
 * Now shows all levels with visual separators and level indicators
 *
 * @param {Object} props - Component props
 * @param {Object} props.userProgress - User progress data
 * @param {Function} props.onLessonSelect - Function to call when a lesson is selected
 * @param {boolean} props.isLoading - Whether the curriculum data is loading
 * @param {boolean} props.scrollable - Whether to render as scrollable (default: true)
 */
const CurriculumMap = ({
  userProgress,
  isLoading = false,
  scrollable = true,
}) => {
  const router = useRouter();
  const { theme } = useTheme();

  // Handle module selection
  const handleModuleSelect = (moduleId, isLocked = false) => {
    if (isLocked && userProgress?.showSyllabus) {
      // Navigate to preview mode
      router.push(`/tutor/module/${moduleId}?preview=true`);
    } else if (!isLocked) {
      // Navigate to normal module view
      router.push(`/tutor/module/${moduleId}`);
    }
    // If locked and no preview available, do nothing (disabled state)
  };

  // Check if a module is locked (now handled by backend)
  const isModuleLocked = (module) => {
    return module.progress?.isLocked || false;
  };

  // Render level header with visual indicator
  const renderLevelHeader = (level) => {
    const isCurrentLevel = level.isCurrentLevel;
    const isUnlocked = userProgress?.totalExperience >= level.requiredXp;

    return (
      <View key={`level-${level.id}`} style={styles.levelHeader}>
        <View style={[styles.levelIndicator, { backgroundColor: mapBackendColor(level.color, BRAND_COLORS.EXPLORER_TEAL) }]}>
          <Ionicons
            name={level.icon || "school-outline"}
            size={20}
            color={BRAND_COLORS.WHISPER_WHITE}
          />
        </View>

        <View style={styles.levelInfo}>
          <View style={styles.levelTitleRow}>
            <Heading
              level="h3"
              style={[styles.levelTitle, { color: mapBackendColor(level.color, BRAND_COLORS.OCEAN_BLUE) }]}
            >
              {level.name}
            </Heading>
            {isCurrentLevel && (
              <View
                style={[
                  styles.currentLevelBadge,
                  { backgroundColor: mapBackendColor(level.color, BRAND_COLORS.EXPLORER_TEAL) },
                ]}
              >
                <Text variant="caption" color={BRAND_COLORS.WHISPER_WHITE} weight="bold">
                  Current
                </Text>
              </View>
            )}
            {!isUnlocked && (
              <View style={styles.lockedLevelBadge}>
                <Ionicons name="lock-closed" size={12} color={BRAND_COLORS.SHADOW_GREY} />
                <Text variant="caption" color={BRAND_COLORS.SHADOW_GREY} style={{ marginLeft: 4 }}>
                  {level.requiredXp} XP required
                </Text>
              </View>
            )}
          </View>

          <Text
            variant="body2"
            color={BRAND_COLORS.SHADOW_GREY}
            style={styles.levelDescription}
          >
            {level.description}
          </Text>
        </View>
      </View>
    );
  };

  // Render a module with its lessons
  const renderModule = (module) => {
    const moduleProgress = module.progress || {
      completed: false,
      progress: 0,
      isLocked: false,
      lessonsCompleted: 0,
      totalLessons: module.lessons?.length || 0,
    };
    const isLocked = isModuleLocked(module);

    return (
      <View
        key={module.id}
        style={[styles.moduleContainer, isLocked && styles.lockedModule]}
      >
        <TouchableOpacity
          style={[
            styles.moduleHeader,
            {
              backgroundColor: isLocked
                ? BRAND_COLORS.SHADOW_GREY + "30"
                : mapBackendColor(module.color, BRAND_COLORS.EXPLORER_TEAL),
            },
          ]}
          onPress={() => handleModuleSelect(module.id, isLocked)}
          disabled={isLocked && !userProgress?.showSyllabus}
        >
          <View style={styles.moduleHeaderContent}>
            {isLocked ? (
              <Ionicons
                name="lock-closed"
                size={24}
                color={BRAND_COLORS.SHADOW_GREY}
              />
            ) : (
              <Ionicons
                name={module.icon || "book-outline"}
                size={24}
                color={BRAND_COLORS.WHISPER_WHITE}
              />
            )}

            <View style={styles.moduleHeaderText}>
              <Text
                weight="bold"
                color={isLocked ? BRAND_COLORS.SHADOW_GREY : BRAND_COLORS.WHISPER_WHITE}
                style={styles.moduleName}
              >
                {module.name}
              </Text>

              <Text
                variant="caption"
                color={isLocked ? BRAND_COLORS.SHADOW_GREY : BRAND_COLORS.WHISPER_WHITE + "CC"}
              >
                {isLocked
                  ? userProgress?.showSyllabus
                    ? "Tap to preview content"
                    : "Complete previous module to unlock"
                  : `${moduleProgress.lessonsCompleted}/${moduleProgress.totalLessons} lessons completed`}
              </Text>
            </View>
          </View>

          <View style={styles.moduleHeaderRight}>
            {!isLocked && moduleProgress.completed ? (
              // Show completion badge for completed modules
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={20} color={BRAND_COLORS.WHISPER_WHITE} />
              </View>
            ) : !isLocked ? (
              // Show progress circle for in-progress modules
              <View style={styles.progressCircle}>
                <Text weight="bold" color={BRAND_COLORS.WHISPER_WHITE} style={styles.progressText}>
                  {Math.round(moduleProgress.progress)}%
                </Text>
              </View>
            ) : null}

            <Ionicons
              name="chevron-forward"
              size={24}
              color={isLocked ? BRAND_COLORS.SHADOW_GREY : BRAND_COLORS.WHISPER_WHITE + "CC"}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading curriculum...</Text>
      </View>
    );
  }

  // Render content
  const renderContent = () => (
    <View style={scrollable ? styles.content : styles.inlineContent}>
      {userProgress?.levels?.map((level) => (
        <View key={level.id} style={styles.levelSection}>
          {renderLevelHeader(level)}
          <View style={styles.modulesContainer}>
            {level.modules?.map(renderModule)}
          </View>
          {/* Add visual separator between levels */}
          <View style={styles.levelSeparator} />
        </View>
      ))}
      <Spacer height={16} />
    </View>
  );

  // Return scrollable or inline version based on prop
  if (scrollable) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    );
  }

  return <View style={styles.inlineContainer}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  inlineContainer: {
    // No flex: 1 to allow natural height
  },
  inlineContent: {
    paddingHorizontal: 16,
    paddingTop: 8, // Reduced top padding for seamless flow
    paddingBottom: 16,
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
  // Level-related styles
  levelSection: {
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  levelIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: BRAND_COLORS.SHADOW_GREY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 8,
  },
  levelDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  currentLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  lockedLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    marginLeft: 8,
  },
  modulesContainer: {
    marginLeft: 26, // Align with level content
  },
  levelSeparator: {
    height: 1,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "20",
    marginTop: 20,
    marginHorizontal: 20,
  },
  moduleContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    minHeight: 80,
  },
  moduleHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  moduleHeaderText: {
    marginLeft: 12,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: "700",
  },
  moduleHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
  },
  completedBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  lessonList: {
    backgroundColor: BRAND_COLORS.CARD_BACKGROUND,
  },
  lessonItem: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.EXPLORER_TEAL + "15",
    padding: 16,
  },
  lessonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  lessonNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  currentLessonNumber: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND_COLORS.SHADOW_GREY,
  },
  currentLessonNumberText: {
    color: BRAND_COLORS.WHISPER_WHITE,
  },
  lessonDetails: {
    flex: 1,
    marginRight: 8,
  },
  lessonTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  lessonDescription: {
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  completedLesson: {
    backgroundColor: BRAND_COLORS.EXPLORER_TEAL + "10", // Light Explorer Teal background
  },
  currentLesson: {
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLORS.EXPLORER_TEAL, // Explorer Teal color
  },
  lockedLesson: {
    opacity: 0.7,
  },
  lockedText: {
    color: BRAND_COLORS.SHADOW_GREY,
  },
  lockedModule: {
    opacity: 0.9,
  },
});

export default CurriculumMap;
