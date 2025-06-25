import mongoose from "mongoose";
import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";
import UserProgress from "../models/UserProgress.js";
import { achievements as achievementData } from "../data/achievements.js";

// Production-ready error classes
class AchievementError extends Error {
  constructor(message, code = "ACHIEVEMENT_ERROR") {
    super(message);
    this.name = "AchievementError";
    this.code = code;
  }
}

class ValidationError extends AchievementError {
  constructor(message) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

class NotFoundError extends AchievementError {
  constructor(message) {
    super(message, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

// Constants for better maintainability
const ACHIEVEMENT_CONSTANTS = {
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_BATCH_SIZE: 100,
  DEFAULT_XP_REWARD: 50,
  MODULE_NAMES: {
    "beginner-foundations": "Foundations",
    "beginner-daily-life": "Daily Life",
    "intermediate-communication": "Communication Skills",
    "intermediate-practical": "Practical Korean",
    "advanced-cultural-fluency": "Cultural Fluency",
    "advanced-professional": "Professional Korean",
  },
};

/**
 * Convert achievement criteria to human-readable text
 * @param {Object} criteria - Achievement criteria object
 * @returns {string} Human-readable criteria description
 */
const getCriteriaDescription = (criteria) => {
  if (!criteria || typeof criteria !== "object") {
    return "Complete the required activities to unlock this achievement.";
  }

  const { type, threshold, additionalParams } = criteria;
  const thresholdNum = Number(threshold) || 1;

  try {
    switch (type) {
      case "lessons_completed":
        return thresholdNum === 1
          ? "Complete your first lesson in any module"
          : `Complete ${thresholdNum} lessons`;

      case "specific_lesson":
        return additionalParams?.lessonId === "beginner-korean-alphabet"
          ? "Complete the Korean Alphabet lesson in the Foundations module"
          : "Complete the specified lesson";

      case "module_completed":
        const moduleName =
          ACHIEVEMENT_CONSTANTS.MODULE_NAMES[additionalParams?.moduleId] ||
          "the specified module";
        return `Complete all lessons in the ${moduleName} module`;

      case "level_completed":
        return `Complete all modules in the ${
          additionalParams?.level || "specified"
        } level`;

      case "curriculum_completed":
        return "Complete all lessons in the entire Korean curriculum";

      case "streak_days":
        return `Practice Korean for ${thresholdNum} consecutive days`;

      case "vocabulary_learned":
        return `Learn ${thresholdNum} Korean words through lessons and practice`;

      case "grammar_mastered":
        return `Master ${thresholdNum} Korean grammar patterns`;

      case "pronunciation_accuracy":
        const exerciseCount = additionalParams?.exerciseCount || 1;
        return `Achieve ${thresholdNum}% accuracy in ${exerciseCount} pronunciation exercises`;

      case "practice_time":
        if (additionalParams?.beforeHour) {
          return `Practice Korean before ${additionalParams.beforeHour}:00 AM`;
        } else if (additionalParams?.afterHour) {
          return `Practice Korean after ${additionalParams.afterHour}:00 PM`;
        }
        return "Practice Korean at the specified time";

      case "weekend_practice":
        return "Practice Korean on both Saturday and Sunday in the same week";

      default:
        return "Complete the required activities to unlock this achievement.";
    }
  } catch (error) {
    console.error("Error generating criteria description:", error);
    return "Complete the required activities to unlock this achievement.";
  }
};

/**
 * Validate achievement data before insertion
 * @param {Object} achievement - Achievement data to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If validation fails
 */
const validateAchievementData = (achievement) => {
  const requiredFields = ["title", "description", "category", "criteria"];

  for (const field of requiredFields) {
    if (!achievement[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (!achievement.criteria.type || !achievement.criteria.threshold) {
    throw new ValidationError(
      "Achievement criteria must have type and threshold"
    );
  }

  if (
    typeof achievement.criteria.threshold !== "number" ||
    achievement.criteria.threshold <= 0
  ) {
    throw new ValidationError(
      "Achievement threshold must be a positive number"
    );
  }

  return true;
};

/**
 * Initialize achievements in the database with production-ready error handling
 * @param {boolean} force - Force re-initialization even if achievements exist
 * @returns {Promise<Object>} Result with success or error
 */
export const initializeAchievements = async (force = false) => {
  const startTime = Date.now();

  try {
    console.log("🔧 Starting achievement initialization...");

    // Check if achievements already exist
    const existingCount = await Achievement.countDocuments();

    if (existingCount > 0 && !force) {
      console.log(`✅ ${existingCount} achievements already exist in database`);
      return {
        success: true,
        message: "Achievements already initialized",
        count: existingCount,
        duration: Date.now() - startTime,
      };
    }

    if (force && existingCount > 0) {
      console.log("🔄 Force flag set, clearing existing achievements...");
      await Achievement.deleteMany({});
      console.log("✅ Existing achievements cleared");
    }

    // Validate achievement data
    console.log("🔍 Validating achievement data...");
    const validatedAchievements = [];

    for (const [index, achievement] of achievementData.entries()) {
      try {
        validateAchievementData(achievement);
        validatedAchievements.push({
          title: achievement.title,
          description: achievement.description,
          category: achievement.category,
          iconUrl: achievement.iconUrl || "trophy-outline",
          color: achievement.color || "#FFD700",
          criteria: achievement.criteria,
          xpReward:
            achievement.xpReward || ACHIEVEMENT_CONSTANTS.DEFAULT_XP_REWARD,
          isSecret: Boolean(achievement.isSecret),
          displayOrder: achievement.displayOrder || index + 1,
          isActive: true,
        });
      } catch (validationError) {
        console.error(
          `❌ Validation failed for achievement ${index + 1}:`,
          validationError.message
        );
        throw new AchievementError(
          `Achievement validation failed: ${validationError.message}`
        );
      }
    }

    console.log(`✅ Validated ${validatedAchievements.length} achievements`);

    // Insert achievements in batches for better performance
    const batchSize = ACHIEVEMENT_CONSTANTS.MAX_BATCH_SIZE;
    const batches = [];

    for (let i = 0; i < validatedAchievements.length; i += batchSize) {
      batches.push(validatedAchievements.slice(i, i + batchSize));
    }

    let totalInserted = 0;

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(
        `📦 Inserting batch ${batchIndex + 1}/${batches.length} (${
          batch.length
        } achievements)...`
      );

      const insertedBatch = await Achievement.insertMany(batch, {
        ordered: false, // Continue on error
        rawResult: true,
      });

      totalInserted += insertedBatch.insertedCount || batch.length;
      console.log(
        `✅ Batch ${batchIndex + 1} completed: ${
          insertedBatch.insertedCount || batch.length
        } inserted`
      );
    }

    const duration = Date.now() - startTime;
    console.log(`🎉 Achievement initialization completed in ${duration}ms`);
    console.log(
      `📊 Total achievements inserted: ${totalInserted}/${validatedAchievements.length}`
    );

    if (totalInserted !== validatedAchievements.length) {
      console.warn(
        `⚠️ Partial insertion: ${totalInserted}/${validatedAchievements.length} achievements inserted`
      );
    }

    return {
      success: true,
      message: `${totalInserted} achievements initialized successfully`,
      count: totalInserted,
      duration,
      batches: batches.length,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ Achievement initialization failed after ${duration}ms:`,
      error
    );

    // Enhanced error logging for production debugging
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      duration,
      timestamp: new Date().toISOString(),
    };

    if (error.name === "MongoBulkWriteError") {
      errorDetails.writeErrors = error.writeErrors?.map((we) => ({
        index: we.index,
        code: we.code,
        errmsg: we.errmsg,
      }));
    }

    console.error("📋 Error details:", JSON.stringify(errorDetails, null, 2));

    return {
      success: false,
      error: "Achievement initialization failed",
      details: errorDetails,
    };
  }
};

/**
 * Get all achievements with production-ready error handling
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Result with achievements or error
 */
export const getAchievements = async (options = {}) => {
  try {
    // Input validation
    if (typeof options !== "object" || options === null) {
      throw new ValidationError("Options must be an object");
    }

    const { category, isActive = true } = options;

    // Validate category if provided
    if (category && typeof category !== "string") {
      throw new ValidationError("Category must be a string");
    }

    const query = { isActive: Boolean(isActive) };

    if (category) {
      query.category = category;
    }

    console.log(`🔍 Fetching achievements with query:`, query);

    const achievements = await Achievement.find(query)
      .sort({
        displayOrder: 1,
        category: 1,
      })
      .lean(); // Use lean() for better performance

    console.log(`✅ Found ${achievements.length} achievements`);

    // Production-ready: Don't auto-initialize, log warning instead
    if (achievements.length === 0) {
      console.warn(
        "⚠️ No achievements found in database. Run initialization script."
      );
    }

    return {
      success: true,
      achievements,
      count: achievements.length,
      query,
    };
  } catch (error) {
    console.error("❌ Error getting achievements:", error);

    // Enhanced error response for production
    const errorResponse = {
      success: false,
      error:
        error instanceof AchievementError
          ? error.message
          : "Failed to retrieve achievements",
      code: error.code || "UNKNOWN_ERROR",
      timestamp: new Date().toISOString(),
    };

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === "development") {
      errorResponse.details = error.stack;
    }

    return errorResponse;
  }
};

/**
 * Calculate achievement progress based on criteria and user progress
 * @param {Object} criteria - Achievement criteria
 * @param {Object} userProgress - User progress data
 * @returns {number} Progress percentage (0-100)
 */
const calculateAchievementProgress = (criteria, userProgress) => {
  if (!criteria || !userProgress) return 0;

  const { type, threshold, additionalParams } = criteria;

  switch (type) {
    case "lessons_completed":
      const completed = userProgress.lessonsCompleted || 0;
      return Math.min(100, Math.round((completed / threshold) * 100));

    case "specific_lesson":
      const lessonProgress = userProgress.lessonProgress || [];
      const targetLesson = lessonProgress.find(
        (lp) => lp.lessonId === additionalParams?.lessonId
      );
      return targetLesson?.completed ? 100 : 0;

    case "module_completed":
      const moduleProgress = userProgress.moduleProgress || [];
      const targetModule = moduleProgress.find(
        (mp) => mp.moduleId === additionalParams?.moduleId
      );
      return targetModule?.completed ? 100 : 0;

    case "streak_days":
      const currentStreak = userProgress.streakDays || 0;
      return Math.min(100, Math.round((currentStreak / threshold) * 100));

    case "vocabulary_learned":
      const vocabLearned = userProgress.vocabularyLearned || 0;
      return Math.min(100, Math.round((vocabLearned / threshold) * 100));

    case "grammar_mastered":
      const grammarMastered = userProgress.grammarMastered || 0;
      return Math.min(100, Math.round((grammarMastered / threshold) * 100));

    case "pronunciation_accuracy":
      const exercises = userProgress.pronunciationExercises || [];
      const accurateExercises = exercises.filter(
        (ex) => ex.accuracy >= threshold
      );
      const requiredCount = additionalParams?.exerciseCount || 1;
      return Math.min(
        100,
        Math.round((accurateExercises.length / requiredCount) * 100)
      );

    default:
      return 0;
  }
};

/**
 * Get user achievements with comprehensive error handling and validation
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with user achievements or error
 */
export const getUserAchievements = async (userId) => {
  const startTime = Date.now();

  try {
    // Input validation
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    if (typeof userId !== "string") {
      throw new ValidationError("User ID must be a string");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ValidationError("Invalid user ID format");
    }

    console.log(`🔍 Fetching achievements for user: ${userId}`);

    // Parallel data fetching for better performance
    const [allAchievements, userAchievements, userProgress] = await Promise.all(
      [
        Achievement.find({ isActive: true })
          .sort({ displayOrder: 1, category: 1 })
          .lean(),
        UserAchievement.find({ userId }).populate("achievementId").lean(),
        UserProgress.findOne({ userId }).lean(),
      ]
    );

    console.log(
      `✅ Data fetched: ${allAchievements.length} total achievements, ${userAchievements.length} user achievements`
    );

    // Validate that achievements exist
    if (allAchievements.length === 0) {
      console.warn("⚠️ No achievements found in database");
      return {
        success: true,
        achievements: [],
        count: 0,
        message: "No achievements available",
      };
    }

    // Create a map for faster lookup
    const userAchievementMap = new Map();
    userAchievements.forEach((ua) => {
      if (ua.achievementId && ua.achievementId._id) {
        userAchievementMap.set(ua.achievementId._id.toString(), ua);
      }
    });

    // Map achievements to include earned status and calculated progress
    const mappedAchievements = allAchievements.map((achievement) => {
      const userAchievement = userAchievementMap.get(
        achievement._id.toString()
      );

      // Calculate real progress for unearned achievements
      let calculatedProgress = 0;
      if (!userAchievement && userProgress && achievement.criteria) {
        try {
          calculatedProgress = calculateAchievementProgress(
            achievement.criteria,
            userProgress
          );
        } catch (progressError) {
          console.warn(
            `⚠️ Error calculating progress for achievement ${achievement._id}:`,
            progressError.message
          );
          calculatedProgress = 0;
        }
      }

      return {
        id: achievement._id,
        title: achievement.title,
        description: achievement.description,
        criteria: getCriteriaDescription(achievement.criteria),
        category: achievement.category,
        iconUrl: achievement.iconUrl,
        color: achievement.color,
        xpReward: achievement.xpReward,
        isSecret: achievement.isSecret,
        earned: !!userAchievement,
        earnedAt: userAchievement ? userAchievement.earnedAt : null,
        progress: userAchievement ? 100 : calculatedProgress,
      };
    });

    const duration = Date.now() - startTime;
    const earnedCount = mappedAchievements.filter((a) => a.earned).length;

    console.log(
      `🎉 User achievements processed in ${duration}ms: ${earnedCount}/${mappedAchievements.length} earned`
    );

    return {
      success: true,
      achievements: mappedAchievements,
      count: mappedAchievements.length,
      earnedCount,
      duration,
      hasUserProgress: !!userProgress,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `❌ Error getting user achievements after ${duration}ms:`,
      error
    );

    // Enhanced error response
    const errorResponse = {
      success: false,
      error:
        error instanceof AchievementError
          ? error.message
          : "Failed to retrieve user achievements",
      code: error.code || "UNKNOWN_ERROR",
      duration,
      timestamp: new Date().toISOString(),
    };

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === "development") {
      errorResponse.details = error.stack;
    }

    return errorResponse;
  }
};

/**
 * Get unviewed achievements for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with unviewed achievements or error
 */
export const getUnviewedAchievements = async (userId) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID format" };
    }

    const unviewedAchievements = await UserAchievement.findUnviewedByUserId(
      userId
    );

    const mappedAchievements = unviewedAchievements.map((ua) => ({
      id: ua.achievementId._id,
      title: ua.achievementId.title,
      description: ua.achievementId.description,
      criteria: getCriteriaDescription(ua.achievementId.criteria),
      category: ua.achievementId.category,
      iconUrl: ua.achievementId.iconUrl,
      color: ua.achievementId.color,
      xpReward: ua.achievementId.xpReward,
      earnedAt: ua.earnedAt,
    }));

    return {
      success: true,
      achievements: mappedAchievements,
    };
  } catch (error) {
    console.error("Error getting unviewed achievements:", error);
    return { error: "Server error" };
  }
};

/**
 * Mark achievements as viewed
 * @param {string} userId - User ID
 * @param {Array} achievementIds - Achievement IDs to mark as viewed
 * @returns {Promise<Object>} Result with success status or error
 */
export const markAchievementsAsViewed = async (userId, achievementIds) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID format" };
    }

    if (
      !achievementIds ||
      !Array.isArray(achievementIds) ||
      achievementIds.length === 0
    ) {
      return { error: "Achievement IDs are required" };
    }

    // Validate achievement IDs
    const validIds = achievementIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length === 0) {
      return { error: "No valid achievement IDs provided" };
    }

    // Update achievements
    await UserAchievement.updateMany(
      {
        userId,
        achievementId: { $in: validIds },
        isViewed: false,
      },
      {
        $set: { isViewed: true },
      }
    );

    return {
      success: true,
      message: `${validIds.length} achievements marked as viewed`,
    };
  } catch (error) {
    console.error("Error marking achievements as viewed:", error);
    return { error: "Server error" };
  }
};

/**
 * Check and award achievements for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with newly earned achievements or error
 */
export const checkAndAwardAchievements = async (userId) => {
  try {
    if (!userId) {
      return { error: "User ID is required" };
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID format" };
    }

    // Get user progress
    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return { error: "User progress not found" };
    }

    // Get all active achievements
    const achievements = await Achievement.find({ isActive: true });

    // Get user's already earned achievements
    const earnedAchievementIds = await UserAchievement.find({
      userId,
    }).distinct("achievementId");

    const earnedIds = earnedAchievementIds.map((id) => id.toString());

    // Check each achievement
    const newlyEarnedAchievements = [];

    for (const achievement of achievements) {
      // Skip if already earned
      if (earnedIds.includes(achievement._id.toString())) {
        continue;
      }

      // Check if criteria is met
      const isMet = achievement.checkCriteria({
        // Existing stats
        streakDays: userProgress.streakDays || 0,
        conversationCount: userProgress.conversationCount || 0,
        grammarScore: userProgress.grammarScore || 0,
        pronunciationScore: userProgress.pronunciationScore || 0,
        vocabularyScore: userProgress.vocabularyScore || 0,
        completedScenarios: userProgress.completedScenarios || [],
        messageCount: userProgress.messageCount || 0,
        perfectScoreCount: userProgress.perfectScoreCount || 0,

        // Curriculum-based stats
        lessonsCompleted: userProgress.lessonsCompleted || 0,
        lessonProgress: userProgress.lessonProgress || [],
        moduleProgress: userProgress.moduleProgress || [],
        totalExperience: userProgress.totalExperience || 0,

        // Additional stats for special achievements
        practiceDays: userProgress.practiceSessions
          ? [
              ...new Set(
                userProgress.practiceSessions.map(
                  (session) => session.date.toISOString().split("T")[0]
                )
              ),
            ]
          : [],
        vocabularyLearned: userProgress.vocabularyLearned || 0,
        grammarMastered: userProgress.grammarMastered || 0,
        pronunciationExercises: userProgress.pronunciationExercises || [],
      });

      if (isMet) {
        console.log(`🏆 Achievement criteria met: ${achievement.title}`);

        // Award achievement
        const userAchievement = new UserAchievement({
          userId,
          achievementId: achievement._id,
          earnedAt: new Date(),
          progress: 100,
        });

        await userAchievement.save();
        console.log(`✅ Achievement saved to database: ${achievement.title}`);

        // 🎁 ENHANCED XP REWARD SYSTEM
        const xpReward = achievement.xpReward || 0;
        console.log(
          `💰 Awarding ${xpReward} XP for achievement: ${achievement.title}`
        );

        // Add XP using the proper method
        if (xpReward > 0) {
          const previousXP = userProgress.totalExperience || 0;
          userProgress.addXp(xpReward);
          await userProgress.save();

          const newXP = userProgress.totalExperience || 0;
          console.log(
            `✨ XP awarded successfully: ${previousXP} → ${newXP} (+${xpReward})`
          );
        }

        newlyEarnedAchievements.push({
          id: achievement._id,
          title: achievement.title,
          description: achievement.description,
          criteria: getCriteriaDescription(achievement.criteria),
          category: achievement.category,
          iconUrl: achievement.iconUrl,
          color: achievement.color,
          xpReward: achievement.xpReward,
          earnedAt: new Date(),
        });

        console.log(`🎉 Achievement fully processed: ${achievement.title}`);
      }
    }

    return {
      success: true,
      achievements: newlyEarnedAchievements,
    };
  } catch (error) {
    console.error("Error checking and awarding achievements:", error);
    return { error: "Server error" };
  }
};
