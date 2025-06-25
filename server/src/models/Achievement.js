import mongoose from "mongoose";

/**
 * Achievement category enum
 * @enum {string}
 */
export const AchievementCategory = {
  STREAK: "streak",
  SKILL: "skill",
  COMPLETION: "completion",
  MILESTONE: "milestone",
  SPECIAL: "special",
};

/**
 * Achievement schema
 * Represents an achievement that users can earn
 */
const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(AchievementCategory),
      required: true,
      index: true,
    },
    iconUrl: {
      type: String,
      default: "trophy",
    },
    color: {
      type: String,
      default: "#FFD700", // Gold color
    },
    criteria: {
      type: {
        type: String,
        enum: [
          "streak_days",
          "conversations_completed",
          "grammar_score",
          "pronunciation_score",
          "vocabulary_score",
          "scenarios_completed",
          "total_messages",
          "perfect_scores",
          "lessons_completed",
          "specific_lesson",
          "module_completed",
          "level_completed",
          "curriculum_completed",
          "vocabulary_learned",
          "grammar_mastered",
          "pronunciation_accuracy",
          "practice_time",
          "weekend_practice",
          "custom",
        ],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
      additionalParams: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    xpReward: {
      type: Number,
      default: 50,
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
achievementSchema.index({ category: 1, "criteria.type": 1 });
achievementSchema.index({ isActive: 1, displayOrder: 1 });

/**
 * Check if a user meets the criteria for this achievement
 * @param {Object} userStats - User statistics
 * @returns {boolean} True if criteria is met
 */
achievementSchema.methods.checkCriteria = function (userStats) {
  const { type, threshold, additionalParams } = this.criteria;

  switch (type) {
    case "streak_days":
      return userStats.streakDays >= threshold;

    case "conversations_completed":
      return userStats.conversationCount >= threshold;

    case "grammar_score":
      return userStats.grammarScore >= threshold;

    case "pronunciation_score":
      return userStats.pronunciationScore >= threshold;

    case "vocabulary_score":
      return userStats.vocabularyScore >= threshold;

    case "scenarios_completed":
      if (additionalParams && additionalParams.scenarioId) {
        // Check if specific scenario was completed
        return userStats.completedScenarios.some(
          (s) => s.scenarioId.toString() === additionalParams.scenarioId
        );
      }
      return userStats.completedScenarios.length >= threshold;

    case "total_messages":
      return userStats.messageCount >= threshold;

    case "perfect_scores":
      return userStats.perfectScoreCount >= threshold;

    // Curriculum-based achievements
    case "lessons_completed":
      return userStats.lessonsCompleted >= threshold;

    case "specific_lesson":
      if (additionalParams && additionalParams.lessonId) {
        // Check if specific lesson was completed
        return userStats.lessonProgress.some(
          (lp) => lp.lessonId === additionalParams.lessonId && lp.completed
        );
      }
      return false;

    case "module_completed":
      if (additionalParams && additionalParams.moduleId) {
        // Check if specific module was completed
        const moduleProgress = userStats.moduleProgress.find(
          (mp) => mp.moduleId === additionalParams.moduleId
        );
        return moduleProgress && moduleProgress.completed;
      }
      return false;

    case "level_completed":
      if (additionalParams && additionalParams.level) {
        // Check if all modules in a level are completed
        const levelModules = userStats.moduleProgress.filter((mp) =>
          mp.moduleId.startsWith(additionalParams.level)
        );
        return (
          levelModules.length > 0 && levelModules.every((mp) => mp.completed)
        );
      }
      return false;

    case "curriculum_completed":
      // Check if all modules are completed
      return (
        userStats.moduleProgress.length > 0 &&
        userStats.moduleProgress.every((mp) => mp.completed)
      );

    case "vocabulary_learned":
      // Count vocabulary items marked as learned
      return userStats.vocabularyLearned >= threshold;

    case "grammar_mastered":
      // Count grammar patterns marked as mastered
      return userStats.grammarMastered >= threshold;

    case "pronunciation_accuracy":
      if (additionalParams && additionalParams.exerciseCount) {
        // Check if user has achieved threshold accuracy in required number of exercises
        const accurateExercises = userStats.pronunciationExercises.filter(
          (ex) => ex.accuracy >= threshold
        );
        return accurateExercises.length >= additionalParams.exerciseCount;
      }
      return false;

    case "practice_time":
      if (additionalParams) {
        const now = new Date();
        const hour = now.getHours();

        if (additionalParams.beforeHour && hour < additionalParams.beforeHour) {
          return true;
        }

        if (additionalParams.afterHour && hour >= additionalParams.afterHour) {
          return true;
        }
      }
      return false;

    case "weekend_practice":
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday, 6 = Saturday

      // Check if today is a weekend day
      if (day === 0 || day === 6) {
        // Check if user has practiced on both Saturday and Sunday this week
        const saturdayPractice = userStats.practiceDays.some(
          (date) => new Date(date).getDay() === 6
        );
        const sundayPractice = userStats.practiceDays.some(
          (date) => new Date(date).getDay() === 0
        );

        return saturdayPractice && sundayPractice;
      }
      return false;

    case "custom":
      // Custom criteria would need special handling
      return false;

    default:
      return false;
  }
};

// Create and export the Achievement model
const Achievement = mongoose.model("Achievement", achievementSchema);
export default Achievement;
