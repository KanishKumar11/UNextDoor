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
        <View style={[styles.levelIndicator, { backgroundColor: level.color }]}>
          <Ionicons
            name={level.icon || "school-outline"}
            size={20}
            color="#fff"
          />
        </View>

        <View style={styles.levelInfo}>
          <View style={styles.levelTitleRow}>
            <Heading
              level="h3"
              style={[styles.levelTitle, { color: level.color }]}
            >
              {level.name}
            </Heading>
            {isCurrentLevel && (
              <View
                style={[
                  styles.currentLevelBadge,
                  { backgroundColor: level.color },
                ]}
              >
                <Text variant="caption" color="#fff" weight="bold">
                  Current
                </Text>
              </View>
            )}
            {!isUnlocked && (
              <View style={styles.lockedLevelBadge}>
                <Ionicons name="lock-closed" size={12} color="#999" />
                <Text variant="caption" color="#999" style={{ marginLeft: 4 }}>
                  {level.requiredXp} XP required
                </Text>
              </View>
            )}
          </View>

          <Text
            variant="body2"
            color={theme.colors.text?.secondary || "#666"}
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
                ? theme.colors.neutral?.[400] || "#999"
                : module.color || theme.colors.primary,
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
                color="rgba(255, 255, 255, 0.8)"
              />
            ) : (
              <Ionicons
                name={module.icon || "book-outline"}
                size={24}
                color="#fff"
              />
            )}

            <View style={styles.moduleHeaderText}>
              <Text weight="bold" color="#fff" style={styles.moduleName}>
                {module.name}
              </Text>

              <Text variant="caption" color="rgba(255, 255, 255, 0.8)">
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
                <Ionicons name="checkmark" size={20} color="#fff" />
              </View>
            ) : !isLocked ? (
              // Show progress circle for in-progress modules
              <View style={styles.progressCircle}>
                <Text weight="bold" color="#fff" style={styles.progressText}>
                  {Math.round(moduleProgress.progress)}%
                </Text>
              </View>
            ) : null}

            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.8)"
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
    shadowColor: "#000",
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
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginLeft: 8,
  },
  modulesContainer: {
    marginLeft: 26, // Align with level content
  },
  levelSeparator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginTop: 20,
    marginHorizontal: 20,
  },
  moduleContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    backgroundColor: "#fff",
  },
  lessonItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  currentLessonNumber: {
    backgroundColor: "#6FC935", // Primary green color
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  currentLessonNumberText: {
    color: "#fff",
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
    backgroundColor: "rgba(111, 201, 53, 0.05)", // Light green background
  },
  currentLesson: {
    borderLeftWidth: 4,
    borderLeftColor: "#6FC935", // Primary green color
  },
  lockedLesson: {
    opacity: 0.7,
  },
  lockedText: {
    color: "#999",
  },
  lockedModule: {
    opacity: 0.8,
  },
});

export default CurriculumMap;
