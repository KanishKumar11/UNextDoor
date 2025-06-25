/**
 * Main curriculum structure for Korean language learning
 * This file defines the overall structure of the curriculum with levels and modules
 */

import { beginnerModules } from "./beginner.js";
import { intermediateModules } from "./intermediate.js";
import { advancedModules } from "./advanced.js";

/**
 * Complete curriculum structure with all levels and modules
 */
export const curriculum = {
  levels: [
    {
      id: "beginner",
      name: "Beginner",
      description:
        "Start your Korean language journey with fundamental concepts, basic vocabulary, and essential grammar.",
      requiredXp: 0,
      modules: beginnerModules,
      icon: "school-outline",
      color: "#6FC935", // Primary green color
    },
    {
      id: "intermediate",
      name: "Intermediate",
      description:
        "Build on your foundation with more complex grammar, expanded vocabulary, and practical conversation skills.",
      requiredXp: 2000, // Reduced from 5000 to achievable amount
      modules: intermediateModules,
      icon: "book-outline",
      color: "#3498db", // Blue color
    },
    {
      id: "advanced",
      name: "Advanced",
      description:
        "Refine your Korean language skills with nuanced expressions, cultural fluency, and specialized vocabulary.",
      requiredXp: 4000, // Reduced from 15000 to achievable amount
      modules: advancedModules,
      icon: "ribbon-outline",
      color: "#9b59b6", // Purple color
    },
  ],

  /**
   * Get a specific level by ID
   * @param {string} levelId - The level ID to find
   * @returns {Object|null} The level object or null if not found
   */
  getLevel(levelId) {
    return this.levels.find((level) => level.id === levelId) || null;
  },

  /**
   * Get a specific module by ID
   * @param {string} moduleId - The module ID to find
   * @returns {Object|null} The module object or null if not found
   */
  getModule(moduleId) {
    for (const level of this.levels) {
      const module = level.modules.find((module) => module.id === moduleId);
      if (module) return module;
    }
    return null;
  },

  /**
   * Get a specific lesson by ID
   * @param {string} lessonId - The lesson ID to find
   * @returns {Object|null} The lesson object or null if not found
   */
  getLesson(lessonId) {
    for (const level of this.levels) {
      for (const module of level.modules) {
        const lesson = module.lessons.find((lesson) => lesson.id === lessonId);
        if (lesson) return lesson;
      }
    }
    return null;
  },

  /**
   * Get the next lesson after the specified lesson
   * @param {string} currentLessonId - The current lesson ID
   * @returns {Object|null} The next lesson object or null if not found
   */
  getNextLesson(currentLessonId) {
    let foundCurrent = false;

    for (const level of this.levels) {
      for (const module of level.modules) {
        for (let i = 0; i < module.lessons.length; i++) {
          const lesson = module.lessons[i];

          if (foundCurrent) {
            return lesson;
          }

          if (lesson.id === currentLessonId) {
            foundCurrent = true;

            // If this is the last lesson in the module, we need to check the next module
            if (i === module.lessons.length - 1) {
              break;
            }
          }
        }

        // If we found the current lesson but didn't return, it was the last in its module
        if (foundCurrent) {
          // Find the next module in this level
          const moduleIndex = level.modules.findIndex(
            (m) => m.id === module.id
          );
          if (moduleIndex < level.modules.length - 1) {
            return level.modules[moduleIndex + 1].lessons[0];
          }
          break;
        }
      }

      // If we found the current lesson but didn't return, it was the last in its level
      if (foundCurrent) {
        // Find the next level
        const levelIndex = this.levels.findIndex((l) => l.id === level.id);
        if (levelIndex < this.levels.length - 1) {
          return this.levels[levelIndex + 1].modules[0].lessons[0];
        }
        break;
      }
    }

    return null; // No next lesson (reached the end of the curriculum)
  },
};

// Debug logging
console.log(
  "Curriculum loaded with levels:",
  curriculum.levels.map((l) => ({
    id: l.id,
    name: l.name,
    moduleCount: l.modules.length,
    modules: l.modules.map((m) => ({
      id: m.id,
      name: m.name,
      lessonCount: m.lessons.length,
    })),
  }))
);

export default curriculum;
