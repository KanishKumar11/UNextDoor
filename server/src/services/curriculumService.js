import mongoose from "mongoose";
import curriculum from "../data/curriculum/curriculum.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import UserProgress from "../models/UserProgress.js";
import User from "../models/User.js";

/**
 * Get all curriculum levels
 * @returns {Promise<Object>} Result with levels or error
 */
export const getCurriculumLevels = async () => {
  try {
    // Return simplified level information without modules
    const levels = curriculum.levels.map((level) => ({
      id: level.id,
      name: level.name,
      description: level.description,
      requiredXp: level.requiredXp,
      icon: level.icon,
      color: level.color,
    }));

    return {
      success: true,
      levels,
    };
  } catch (error) {
    console.error("Error getting curriculum levels:", error);
    return { error: "Server error" };
  }
};

/**
 * Get modules for a specific level
 * @param {string} levelId - Level ID
 * @returns {Promise<Object>} Result with level, modules or error
 */
export const getLevelModules = async (levelId) => {
  try {
    const level = curriculum.getLevel(levelId);

    if (!level) {
      return { error: "Level not found" };
    }

    // Return simplified module information without lessons
    const modules = level.modules.map((module) => ({
      id: module.id,
      name: module.name,
      description: module.description,
      requiredXp: module.requiredXp,
      order: module.order,
      icon: module.icon,
      color: module.color,
      lessonCount: module.lessons.length,
    }));

    return {
      success: true,
      level: {
        id: level.id,
        name: level.name,
        description: level.description,
        requiredXp: level.requiredXp,
        icon: level.icon,
        color: level.color,
      },
      modules,
    };
  } catch (error) {
    console.error("Error getting level modules:", error);
    return { error: "Server error" };
  }
};

/**
 * Get user curriculum progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with progress or error
 */
export const getUserProgress = async (userId) => {
  try {
    console.log("Getting user progress for userId:", userId);
    console.log("Curriculum object:", curriculum);
    console.log("Curriculum levels:", curriculum?.levels);

    // Get user to check language level preference
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return { error: "User not found" };
    }

    console.log("User found:", user.email, "preferences:", user.preferences);

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      console.log("Creating new user progress for user:", userId);
      // Create new user progress with default values
      userProgress = new UserProgress({
        userId,
        level: user.preferences?.languageLevel || "beginner",
        totalExperience: 0,
        lessonsCompleted: 0,
        currentCurriculum: {
          level: user.preferences?.languageLevel || "beginner",
          currentModuleId: null,
          currentLessonId: null,
        },
      });

      await userProgress.save();
      console.log("New user progress created:", userProgress);
    }

    console.log("User progress found/created:", userProgress.currentCurriculum);

    // 🔥 UPDATE DAILY ACTIVITY AND STREAK ON EVERY APP ACCESS
    console.log("🎯 Updating daily activity for streak tracking...");
    userProgress.updateDailyActivity();
    await userProgress.save();
    console.log("✅ Daily activity updated successfully");

    // 🎯 DETERMINE CURRENT LEVEL BASED ON XP (FIX FOR XP LEVEL CALCULATION BUG)
    // Beginner: 0-1999 XP, Intermediate: 2000-3999 XP, Advanced: 4000+ XP
    const determineCurrentLevel = (totalXP) => {
      if (totalXP >= 4000) {
        return "advanced";
      } else if (totalXP >= 2000) {
        return "intermediate";
      } else {
        return "beginner";
      }
    };

    const calculatedLevel = determineCurrentLevel(userProgress.totalExperience);
    console.log(
      `🎯 XP Level Calculation: ${userProgress.totalExperience} XP -> ${calculatedLevel} level`
    );

    // Update user's current level if it has changed
    if (userProgress.currentCurriculum.level !== calculatedLevel) {
      console.log(
        `📈 Level up detected! ${userProgress.currentCurriculum.level} -> ${calculatedLevel}`
      );
      userProgress.currentCurriculum.level = calculatedLevel;
      userProgress.level = calculatedLevel; // Also update the main level field
      await userProgress.save();
      console.log("✅ User level updated successfully");
    }

    // Get curriculum structure based on calculated level
    const curriculumLevel = curriculum.getLevel(calculatedLevel);

    console.log("Curriculum level found:", curriculumLevel?.name);

    if (!curriculumLevel) {
      console.log(
        "Curriculum level not found for:",
        userProgress.currentCurriculum.level
      );
      return { error: "Curriculum level not found" };
    }

    // Helper function to check if a module is unlocked
    const isModuleUnlocked = (module, userProgress, curriculumLevel) => {
      console.log(
        `🔍 Checking if module ${module.id} (order: ${module.order}) is unlocked...`
      );

      // For beginners, only unlock modules progressively
      if (userProgress.currentCurriculum.level === "beginner") {
        // First module is always unlocked
        if (module.order === 1) {
          console.log(`✅ Module ${module.id} unlocked - first module`);
          return true;
        }

        // Check if previous module is completed - use DYNAMIC calculation
        const previousModuleOrder = module.order - 1;
        console.log(
          `🔍 Looking for previous module with order: ${previousModuleOrder}`
        );

        const prevModuleData = curriculumLevel.modules.find(
          (m) => m.order === previousModuleOrder
        );

        if (!prevModuleData) {
          console.log(
            `❌ Previous module not found for order: ${previousModuleOrder}`
          );
          return false;
        }

        console.log(`📚 Found previous module: ${prevModuleData.id}`);

        // Calculate if previous module is completed dynamically
        const completedLessonsInPrevModule = userProgress.lessonProgress.filter(
          (lp) => {
            const lesson = prevModuleData.lessons.find(
              (lesson) => lesson.id === lp.lessonId
            );
            return lesson && lp.completed;
          }
        ).length;

        const isPrevModuleCompleted =
          completedLessonsInPrevModule >= prevModuleData.lessons.length;

        console.log(
          `📊 Previous module ${prevModuleData.id}: ${completedLessonsInPrevModule}/${prevModuleData.lessons.length} lessons completed`
        );
        console.log(
          `${isPrevModuleCompleted ? "✅" : "❌"} Previous module ${
            prevModuleData.id
          } ${isPrevModuleCompleted ? "completed" : "not completed"}`
        );
        console.log(
          `${isPrevModuleCompleted ? "✅" : "❌"} Module ${module.id} ${
            isPrevModuleCompleted ? "unlocked" : "locked"
          }`
        );

        return isPrevModuleCompleted;
      }

      // For intermediate and advanced, implement progressive unlocking
      // First module of each level is unlocked if user has sufficient XP for the level
      if (module.order === 1) {
        const levelUnlocked =
          userProgress.totalExperience >= curriculumLevel.requiredXp;
        console.log(
          `${levelUnlocked ? "✅" : "❌"} Module ${module.id} ${
            levelUnlocked ? "unlocked" : "locked"
          } - First module of ${curriculumLevel.name} level (XP requirement: ${
            curriculumLevel.requiredXp
          }, user XP: ${userProgress.totalExperience})`
        );
        return levelUnlocked;
      }

      // For subsequent modules, check if previous module is completed
      const previousModuleOrder = module.order - 1;
      const prevModuleData = curriculumLevel.modules.find(
        (m) => m.order === previousModuleOrder
      );

      if (!prevModuleData) {
        console.log(
          `❌ Previous module not found for order: ${previousModuleOrder}`
        );
        return false;
      }

      // Calculate if previous module is completed dynamically
      const completedLessonsInPrevModule = userProgress.lessonProgress.filter(
        (lp) => {
          const lesson = prevModuleData.lessons.find(
            (lesson) => lesson.id === lp.lessonId
          );
          return lesson && lp.completed;
        }
      ).length;

      const isPrevModuleCompleted =
        completedLessonsInPrevModule >= prevModuleData.lessons.length;

      console.log(
        `📊 Previous module ${prevModuleData.id}: ${completedLessonsInPrevModule}/${prevModuleData.lessons.length} lessons completed`
      );
      console.log(
        `${isPrevModuleCompleted ? "✅" : "❌"} Module ${module.id} ${
          isPrevModuleCompleted ? "unlocked" : "locked"
        } - Previous module ${prevModuleData.id} ${
          isPrevModuleCompleted ? "completed" : "not completed"
        }`
      );

      return isPrevModuleCompleted;
    };

    // Helper function to check if a lesson is unlocked
    const isLessonUnlocked = (lesson, moduleProgress, isModuleUnlocked) => {
      console.log(
        `🔍 Checking if lesson ${lesson.id} (order: ${lesson.order}) is unlocked...`
      );
      console.log(`📋 Module unlocked: ${isModuleUnlocked}`);

      if (!isModuleUnlocked) {
        console.log(`❌ Lesson ${lesson.id} locked - module is locked`);
        return false;
      }

      // First lesson in a module is unlocked if the module is unlocked
      if (lesson.order === 1) {
        console.log(`✅ Lesson ${lesson.id} unlocked - first lesson in module`);
        return true;
      }

      // Check if previous lesson is completed
      const previousLessonOrder = lesson.order - 1;
      console.log(
        `🔍 Looking for previous lesson with order: ${previousLessonOrder}`
      );

      const previousLessonProgress = userProgress.lessonProgress.find((lp) => {
        const prevLessonData = moduleProgress.lessons?.find(
          (l) => l.order === previousLessonOrder
        );
        if (prevLessonData && lp.lessonId === prevLessonData.id) {
          console.log(
            `📚 Found previous lesson: ${prevLessonData.id}, completed: ${lp.completed}`
          );
          return true;
        }
        return false;
      });

      const isUnlocked = previousLessonProgress?.completed || false;
      console.log(
        `${isUnlocked ? "✅" : "❌"} Lesson ${lesson.id} ${
          isUnlocked ? "unlocked" : "locked"
        } - previous lesson completed: ${
          previousLessonProgress?.completed || false
        }`
      );

      return isUnlocked;
    };

    // Map user progress to curriculum structure with unlocking logic for ALL levels
    const allLevels = curriculum.levels.map((level) => {
      const isCurrentLevel = level.id === calculatedLevel; // Use calculated level instead of stored level

      return {
        id: level.id,
        name: level.name,
        description: level.description,
        requiredXp: level.requiredXp,
        icon: level.icon,
        color: level.color,
        isCurrentLevel,
        modules: level.modules.map((module) => {
          // Calculate module progress dynamically from lesson progress
          const completedLessonsInModule = userProgress.lessonProgress.filter(
            (lp) => {
              const lesson = module.lessons.find((l) => l.id === lp.lessonId);
              return lesson && lp.completed;
            }
          ).length;

          const moduleProgress = {
            moduleId: module.id,
            completed: completedLessonsInModule >= module.lessons.length,
            progress:
              module.lessons.length > 0
                ? Math.round(
                    (completedLessonsInModule / module.lessons.length) * 100
                  )
                : 0,
            lessonsCompleted: completedLessonsInModule,
            totalLessons: module.lessons.length,
          };

          // Check if module is unlocked (considering cross-level unlocking)
          const moduleUnlocked = isCurrentLevel
            ? isModuleUnlocked(module, userProgress, level)
            : userProgress.totalExperience >= level.requiredXp &&
              (module.order === 1 ||
                userProgress.totalExperience >= (module.requiredXp || 0));

          // Map lessons with progress and unlocking logic
          const lessons = module.lessons.map((lesson) => {
            // Find lesson progress
            const lessonProgress = userProgress.lessonProgress.find(
              (lp) => lp.lessonId === lesson.id
            ) || {
              lessonId: lesson.id,
              completed: false,
              score: 0,
              attempts: 0,
              xpEarned: 0,
              completedSections: [],
            };

            // Check if lesson is unlocked
            const lessonUnlocked = isLessonUnlocked(
              lesson,
              { lessons: module.lessons },
              moduleUnlocked
            );

            return {
              id: lesson.id,
              name: lesson.name,
              description: lesson.description,
              estimatedDuration: lesson.estimatedDuration,
              xpReward: lesson.xpReward,
              requiredXp: lesson.requiredXp,
              order: lesson.order,
              progress: {
                completed: lessonProgress.completed,
                score: lessonProgress.score,
                attempts: lessonProgress.attempts,
                xpEarned: lessonProgress.xpEarned,
                lastAttemptAt: lessonProgress.lastAttemptAt,
                completedSections: lessonProgress.completedSections,
                isLocked: !lessonUnlocked,
              },
            };
          });

          return {
            id: module.id,
            name: module.name,
            description: module.description,
            requiredXp: module.requiredXp,
            order: module.order,
            icon: module.icon,
            color: module.color,
            progress: {
              completed: moduleProgress.completed,
              progress: moduleProgress.progress,
              lessonsCompleted: moduleProgress.lessonsCompleted,
              totalLessons: moduleProgress.totalLessons,
              lastAccessedAt: moduleProgress.lastAccessedAt,
              isLocked: !moduleUnlocked,
            },
            lessons,
          };
        }),
      };
    });

    // Debug: Check user progress data
    console.log("🔍 DEBUG: Raw user progress from database:", {
      userId: userProgress.userId,
      totalExperience: userProgress.totalExperience,
      lessonsCompleted: userProgress.lessonsCompleted,
      level: userProgress.level,
      lessonProgressCount: userProgress.lessonProgress?.length || 0,
      lessonProgressDetails:
        userProgress.lessonProgress?.map((lp) => ({
          lessonId: lp.lessonId,
          completed: lp.completed,
          xpEarned: lp.xpEarned,
          attempts: lp.attempts,
        })) || [],
    });

    // Debug: Recalculate stats from actual lesson progress
    const actualCompletedLessons =
      userProgress.lessonProgress?.filter((lp) => lp.completed).length || 0;
    const actualTotalXP =
      userProgress.lessonProgress?.reduce(
        (total, lp) => total + (lp.xpEarned || 0),
        0
      ) || 0;

    console.log("🔍 DEBUG: Recalculated stats from lesson progress:", {
      actualCompletedLessons,
      actualTotalXP,
      storedLessonsCompleted: userProgress.lessonsCompleted,
      storedTotalExperience: userProgress.totalExperience,
      discrepancy: {
        lessonsCompleted:
          actualCompletedLessons !== userProgress.lessonsCompleted,
        totalExperience: actualTotalXP !== userProgress.totalExperience,
      },
    });

    // Check for duplicate lesson entries
    const lessonIds =
      userProgress.lessonProgress?.map((lp) => lp.lessonId) || [];
    const uniqueLessonIds = [...new Set(lessonIds)];
    if (lessonIds.length !== uniqueLessonIds.length) {
      console.log("⚠️ WARNING: Duplicate lesson entries found!", {
        totalEntries: lessonIds.length,
        uniqueEntries: uniqueLessonIds.length,
        duplicates: lessonIds.filter(
          (id, index) => lessonIds.indexOf(id) !== index
        ),
      });
    }

    // Fix data inconsistencies automatically
    const correctionsMade = userProgress.fixDataInconsistencies();
    if (correctionsMade) {
      await userProgress.save();
      console.log("💾 Data corrections saved to database");
    }

    const progressData = {
      userId,
      level: userProgress.level,
      totalExperience: userProgress.totalExperience,
      lessonsCompleted: userProgress.lessonsCompleted,
      streak: {
        current: userProgress.streak?.current || 0,
        longest: userProgress.streak?.longest || 0,
        lastPracticeDate: userProgress.streak?.lastPracticeDate || null,
      }, // Return the full streak object for frontend compatibility
      currentCurriculum: userProgress.currentCurriculum,
      showSyllabus: true, // Always show full syllabus now
      levels: allLevels,
      // Keep modules for backward compatibility (current level modules)
      modules: allLevels.find((level) => level.isCurrentLevel)?.modules || [],
    };

    return {
      success: true,
      progress: progressData,
    };
  } catch (error) {
    console.error("Error getting user progress:", error);
    return { error: "Server error" };
  }
};

/**
 * Get a specific module by ID
 * @param {string} moduleId - Module ID
 * @param {string} userId - User ID (optional for authenticated requests)
 * @returns {Promise<Object>} Result with module or error
 */
export const getModule = async (moduleId, userId = null) => {
  try {
    console.log(
      `🎯 getModule called with moduleId: ${moduleId}, userId: ${userId}`
    );
    // Find module across all levels
    let foundModule = null;
    let foundLevel = null;

    for (const level of curriculum.levels) {
      const module = level.modules.find((m) => m.id === moduleId);
      if (module) {
        foundModule = module;
        foundLevel = level;
        break;
      }
    }

    if (!foundModule) {
      return { error: "Module not found" };
    }

    let userProgress = null;
    if (userId) {
      userProgress = await UserProgress.findOne({ userId });

      // Fix data inconsistencies automatically (same as in getUserProgress)
      if (userProgress) {
        console.log("🔧 Checking for data inconsistencies in getModule...");
        console.log("📊 Raw user progress before correction:", {
          totalExperience: userProgress.totalExperience,
          lessonsCompleted: userProgress.lessonsCompleted,
          lessonProgressCount: userProgress.lessonProgress?.length || 0,
        });

        const correctionsMade = userProgress.fixDataInconsistencies();
        if (correctionsMade) {
          await userProgress.save();
          console.log("💾 Data corrections saved to database in getModule");
        } else {
          console.log("ℹ️ No data corrections needed in getModule");
        }

        console.log("📊 User progress after correction:", {
          totalExperience: userProgress.totalExperience,
          lessonsCompleted: userProgress.lessonsCompleted,
        });
      }
    }

    // Get module progress - calculate dynamically instead of using stale data
    let moduleProgress = {
      completed: false,
      progress: 0,
      lessonsCompleted: 0,
      totalLessons: foundModule.lessons.length,
      isLocked: false,
    };

    if (userProgress) {
      console.log(
        `🔍 Calculating module progress for ${moduleId} dynamically...`
      );

      // Count completed lessons in this specific module
      const completedLessonsInModule = userProgress.lessonProgress.filter(
        (lp) => {
          const lesson = foundModule.lessons.find(
            (lesson) => lesson.id === lp.lessonId
          );
          const isCompleted = lesson && lp.completed;
          if (isCompleted) {
            console.log(`✅ Found completed lesson in module: ${lp.lessonId}`);
          }
          return isCompleted;
        }
      ).length;

      console.log(
        `📊 Module ${moduleId}: ${completedLessonsInModule}/${foundModule.lessons.length} lessons completed`
      );

      // Calculate progress dynamically
      moduleProgress.lessonsCompleted = completedLessonsInModule;
      moduleProgress.totalLessons = foundModule.lessons.length;
      moduleProgress.progress =
        foundModule.lessons.length > 0
          ? Math.round(
              (completedLessonsInModule / foundModule.lessons.length) * 100
            )
          : 0;
      moduleProgress.completed =
        completedLessonsInModule >= foundModule.lessons.length;

      console.log(`📈 Calculated module progress:`, moduleProgress);
    }

    // Check if module is unlocked
    const isUnlocked = userProgress
      ? foundLevel.id === "beginner"
        ? foundModule.order === 1 ||
          (foundModule.order > 1 &&
            (() => {
              // Find the previous module
              const prevModule = foundLevel.modules.find(
                (m) => m.order === foundModule.order - 1
              );

              if (!prevModule) {
                console.log(
                  `❌ No previous module found for order ${
                    foundModule.order - 1
                  }`
                );
                return false;
              }

              console.log(
                `🔍 Checking if previous module ${prevModule.id} is completed...`
              );

              // Check if all lessons in the previous module are completed
              const prevModuleLessons = prevModule.lessons || [];
              const completedLessonsInPrevModule =
                userProgress.lessonProgress.filter((lp) => {
                  const lesson = prevModuleLessons.find(
                    (l) => l.id === lp.lessonId
                  );
                  return lesson && lp.completed;
                }).length;

              const isPrevModuleCompleted =
                completedLessonsInPrevModule >= prevModuleLessons.length;

              console.log(
                `📊 Previous module ${prevModule.id}: ${completedLessonsInPrevModule}/${prevModuleLessons.length} lessons completed`
              );
              console.log(
                `${isPrevModuleCompleted ? "✅" : "❌"} Previous module ${
                  prevModule.id
                } ${isPrevModuleCompleted ? "completed" : "not completed"}`
              );

              return isPrevModuleCompleted;
            })())
        : userProgress.totalExperience >= foundModule.requiredXp
      : foundModule.order === 1;

    moduleProgress.isLocked = !isUnlocked;

    // Process lessons with progress
    const lessonsWithProgress = foundModule.lessons.map((lesson) => {
      let lessonProgress = {
        completed: false,
        score: 0,
        attempts: 0,
        xpEarned: 0,
        completedSections: [],
        isLocked: true,
      };

      if (userProgress) {
        const userLessonProgress = userProgress.lessonProgress.find(
          (lp) => lp.lessonId === lesson.id
        );
        if (userLessonProgress) {
          lessonProgress = { ...lessonProgress, ...userLessonProgress };
          console.log(`📚 Found lesson progress for ${lesson.id}:`, {
            completed: userLessonProgress.completed,
            xpEarned: userLessonProgress.xpEarned,
            attempts: userLessonProgress.attempts,
          });
        } else {
          console.log(`📚 No lesson progress found for ${lesson.id}`);
        }
      }

      // Check if lesson is unlocked
      console.log(
        `🔍 Checking unlock status for lesson ${lesson.id} (order: ${lesson.order})`
      );
      console.log(`📋 Module unlocked: ${isUnlocked}`);

      if (isUnlocked) {
        if (lesson.order === 1) {
          lessonProgress.isLocked = false;
          console.log(
            `✅ Lesson ${lesson.id} unlocked - first lesson in module`
          );
        } else {
          // Check if previous lesson is completed
          const previousLessonOrder = lesson.order - 1;
          console.log(
            `🔍 Looking for previous lesson with order: ${previousLessonOrder}`
          );

          // Debug: Show all lesson progress entries
          console.log(
            `🔍 All user lesson progress:`,
            userProgress?.lessonProgress?.map((lp) => ({
              lessonId: lp.lessonId,
              completed: lp.completed,
              xpEarned: lp.xpEarned,
            })) || []
          );

          // Debug: Show what we're looking for
          const expectedPrevLessonId = foundModule.lessons.find(
            (l) => l.order === previousLessonOrder
          )?.id;
          console.log(
            `🔍 Looking for previous lesson ID: ${expectedPrevLessonId}`
          );

          const previousLessonProgress = userProgress?.lessonProgress.find(
            (lp) => {
              const prevLesson = foundModule.lessons.find(
                (l) => l.order === previousLessonOrder
              );
              if (prevLesson && lp.lessonId === prevLesson.id) {
                console.log(
                  `📚 Found previous lesson: ${prevLesson.id}, completed: ${lp.completed}`
                );
                return true;
              }
              return false;
            }
          );

          lessonProgress.isLocked = !previousLessonProgress?.completed;
          console.log(
            `${lessonProgress.isLocked ? "❌" : "✅"} Lesson ${lesson.id} ${
              lessonProgress.isLocked ? "locked" : "unlocked"
            } - previous lesson completed: ${
              previousLessonProgress?.completed || false
            }`
          );
        }
      } else {
        console.log(`❌ Lesson ${lesson.id} locked - module is locked`);
      }

      return {
        ...lesson,
        progress: lessonProgress,
      };
    });

    return {
      success: true,
      module: {
        ...foundModule,
        lessons: lessonsWithProgress,
        progress: moduleProgress,
        level: {
          id: foundLevel.id,
          name: foundLevel.name,
        },
      },
    };
  } catch (error) {
    console.error("Error getting module:", error);
    return { error: "Server error" };
  }
};

/**
 * Get a specific lesson by ID
 * @param {string} lessonId - Lesson ID
 * @param {string} userId - User ID (optional for authenticated requests)
 * @returns {Promise<Object>} Result with lesson or error
 */
export const getLesson = async (lessonId, userId = null) => {
  try {
    // Find lesson across all levels and modules
    let foundLesson = null;
    let foundModule = null;
    let foundLevel = null;

    for (const level of curriculum.levels) {
      for (const module of level.modules) {
        const lesson = module.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          foundLesson = lesson;
          foundModule = module;
          foundLevel = level;
          break;
        }
      }
      if (foundLesson) break;
    }

    if (!foundLesson) {
      return { error: "Lesson not found" };
    }

    let userProgress = null;
    if (userId) {
      userProgress = await UserProgress.findOne({ userId });
    }

    // Get lesson progress
    let lessonProgress = {
      completed: false,
      score: 0,
      attempts: 0,
      xpEarned: 0,
      completedSections: [],
    };

    if (userProgress) {
      const userLessonProgress = userProgress.lessonProgress.find(
        (lp) => lp.lessonId === lessonId
      );
      if (userLessonProgress) {
        lessonProgress = { ...lessonProgress, ...userLessonProgress };
      }
    }

    return {
      success: true,
      lesson: {
        ...foundLesson,
        module: {
          id: foundModule.id,
          name: foundModule.name,
          color: foundModule.color,
        },
        level: {
          id: foundLevel.id,
          name: foundLevel.name,
        },
        progress: lessonProgress,
      },
    };
  } catch (error) {
    console.error("Error getting lesson:", error);
    return { error: "Server error" };
  }
};

/**
 * Update section progress
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @param {string} sectionId - Section ID (introduction, vocabulary, grammar, practice)
 * @param {boolean} completed - Whether the section is completed
 * @param {number} timeSpent - Time spent in section (seconds)
 * @returns {Promise<Object>} Result with updated progress or error
 */
export const updateSectionProgress = async (
  userId,
  lessonId,
  sectionId,
  completed = false,
  timeSpent = 0
) => {
  try {
    console.log(`🎯 Updating section progress: ${lessonId} - ${sectionId}`);

    // Validate lesson exists
    const lesson = curriculum.getLesson(lessonId);
    if (!lesson) {
      return { error: "Lesson not found" };
    }

    // Validate section ID
    const validSections = ["introduction", "vocabulary", "grammar", "practice"];
    if (!validSections.includes(sectionId)) {
      return { error: "Invalid section ID" };
    }

    // Get user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return { error: "User progress not found" };
    }

    // Update section progress
    userProgress.updateSectionProgress(
      lessonId,
      sectionId,
      completed,
      timeSpent
    );
    await userProgress.save();

    console.log(`✅ Section progress updated successfully`);

    // Return updated progress
    return await getUserProgress(userId);
  } catch (error) {
    console.error("Error updating section progress:", error);
    return { error: "Server error" };
  }
};

/**
 * Update lesson progress
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @param {boolean} completed - Whether the lesson is completed
 * @param {number} score - Lesson score
 * @param {number} xpEarned - XP earned
 * @param {string} completedSection - Completed section ID
 * @returns {Promise<Object>} Result with updated progress or error
 */
export const updateLessonProgress = async (
  userId,
  lessonId,
  completed = false,
  score = 0,
  xpEarned = 0,
  completedSection = null
) => {
  try {
    // Validate lesson exists
    const lesson = curriculum.getLesson(lessonId);
    if (!lesson) {
      return { error: "Lesson not found" };
    }

    // Get user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return { error: "User progress not found" };
    }

    // Update lesson progress
    await userProgress.updateLessonProgress(
      lessonId,
      completed,
      score,
      xpEarned,
      completedSection
    );

    await userProgress.save();

    // Check for achievements
    try {
      const achievementService = await import("./achievementService.js");
      await achievementService.checkAndAwardAchievements(userId);
    } catch (achievementError) {
      console.error("Error checking achievements:", achievementError);
      // Continue even if achievement checking fails
    }

    // Return updated progress
    return await getUserProgress(userId);
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return { error: "Server error" };
  }
};

/**
 * Set current lesson
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Result with updated current curriculum or error
 */
export const setCurrentLesson = async (userId, lessonId) => {
  try {
    // Validate lesson exists
    const lesson = curriculum.getLesson(lessonId);
    if (!lesson) {
      return { error: "Lesson not found" };
    }

    // Find the module containing this lesson
    let moduleId = null;
    let levelId = null;

    for (const level of curriculum.levels) {
      for (const module of level.modules) {
        if (module.lessons.some((l) => l.id === lessonId)) {
          moduleId = module.id;
          levelId = level.id;
          break;
        }
      }
      if (moduleId) break;
    }

    if (!moduleId || !levelId) {
      return { error: "Module or level not found for lesson" };
    }

    // Get user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return { error: "User progress not found" };
    }

    // Update current curriculum
    userProgress.currentCurriculum = {
      level: levelId,
      currentModuleId: moduleId,
      currentLessonId: lessonId,
    };

    await userProgress.save();

    // Check for achievements
    try {
      const achievementService = await import("./achievementService.js");
      await achievementService.checkAndAwardAchievements(userId);
    } catch (achievementError) {
      console.error("Error checking achievements:", achievementError);
      // Continue even if achievement checking fails
    }

    return {
      success: true,
      currentCurriculum: userProgress.currentCurriculum,
    };
  } catch (error) {
    console.error("Error setting current lesson:", error);
    return { error: "Server error" };
  }
};

export default {
  getCurriculumLevels,
  getLevelModules,
  getModule,
  getLesson,
  getUserProgress,
  updateSectionProgress,
  updateLessonProgress,
  setCurrentLesson,
};
