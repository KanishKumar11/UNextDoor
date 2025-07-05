import mongoose from "mongoose";
import UserProgress from "../models/UserProgress.js";
import { checkAndAwardAchievements } from "./achievementService.js";

/**
 * Production-ready user initialization service
 * Handles setting up new users with proper achievement tracking
 */

// Constants for user initialization
const INITIALIZATION_CONSTANTS = {
  DEFAULT_LEVEL: "beginner",
  DEFAULT_XP: 0,
  DEFAULT_LESSONS_COMPLETED: 0,
  INITIALIZATION_TIMEOUT: 30000, // 30 seconds
};

/**
 * Initialize a new user with proper achievement tracking setup
 * @param {string} userId - User ID
 * @param {Object} userPreferences - User preferences from registration
 * @returns {Promise<Object>} Result with success status or error
 */
export const initializeNewUser = async (userId, userPreferences = {}) => {
  const startTime = Date.now();
  
  try {
    console.log(`🔧 Initializing new user: ${userId}`);
    
    // Input validation
    if (!userId) {
      throw new Error("User ID is required for initialization");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    // Check if user progress already exists
    const existingProgress = await UserProgress.findOne({ userId });
    
    if (existingProgress) {
      console.log(`✅ User ${userId} already has progress initialized`);
      return {
        success: true,
        message: "User already initialized",
        userProgress: existingProgress,
        duration: Date.now() - startTime
      };
    }

    // Create new user progress with comprehensive defaults
    const userLevel = userPreferences?.languageLevel || INITIALIZATION_CONSTANTS.DEFAULT_LEVEL;
    
    const newUserProgress = new UserProgress({
      userId,
      level: userLevel,
      totalExperience: INITIALIZATION_CONSTANTS.DEFAULT_XP,
      xpPoints: INITIALIZATION_CONSTANTS.DEFAULT_XP,
      lessonsCompleted: INITIALIZATION_CONSTANTS.DEFAULT_LESSONS_COMPLETED,
      currentCurriculum: {
        level: userLevel,
        currentModuleId: null,
        currentLessonId: null,
      },
      // Initialize empty arrays for tracking
      lessonProgress: [],
      moduleProgress: [],
      skillProgress: [
        { name: "grammar", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "vocabulary", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "pronunciation", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "fluency", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "comprehension", level: 1, experience: 0, nextLevelExperience: 100 },
      ],
      practiceSessions: [],
      // Initialize streak tracking
      streak: {
        current: 0,
        longest: 0,
        lastPracticeDate: null,
      },
      // Initialize preferences
      preferences: new Map(Object.entries(userPreferences || {})),
      lastUpdated: new Date(),
    });

    // Save user progress
    await newUserProgress.save();
    console.log(`✅ User progress created for user: ${userId}`);

    // Check for any initial achievements (like "Welcome" achievements)
    console.log(`🏆 Checking initial achievements for user: ${userId}`);
    
    try {
      const initialAchievements = await checkAndAwardAchievements(userId);
      
      if (initialAchievements.success && initialAchievements.achievements.length > 0) {
        console.log(`🎉 Awarded ${initialAchievements.achievements.length} initial achievements`);
      }
    } catch (achievementError) {
      // Don't fail user initialization if achievement check fails
      console.warn(`⚠️ Initial achievement check failed for user ${userId}:`, achievementError.message);
    }

    const duration = Date.now() - startTime;
    console.log(`🎉 User initialization completed in ${duration}ms`);

    return {
      success: true,
      message: "User initialized successfully",
      userProgress: newUserProgress,
      duration,
      initialAchievementsChecked: true
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ User initialization failed after ${duration}ms:`, error);
    
    // Enhanced error logging
    const errorDetails = {
      userId,
      error: error.message,
      duration,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };


    return {
      success: false,
      error: "User initialization failed",
      details: errorDetails
    };
  }
};

/**
 * Ensure user has proper achievement tracking setup
 * This can be called for existing users to backfill missing data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with success status or error
 */
export const ensureUserAchievementTracking = async (userId) => {
  try {
    console.log(`🔍 Ensuring achievement tracking for user: ${userId}`);
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      console.log(`⚠️ User ${userId} has no progress record, initializing...`);
      return await initializeNewUser(userId);
    }

    // Check if user progress has all required fields for achievement tracking
    let needsUpdate = false;
    const updates = {};

    // Ensure skill progress is initialized
    if (!userProgress.skillProgress || userProgress.skillProgress.length === 0) {
      updates.skillProgress = [
        { name: "grammar", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "vocabulary", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "pronunciation", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "fluency", level: 1, experience: 0, nextLevelExperience: 100 },
        { name: "comprehension", level: 1, experience: 0, nextLevelExperience: 100 },
      ];
      needsUpdate = true;
    }

    // Ensure streak tracking is initialized
    if (!userProgress.streak) {
      updates.streak = {
        current: 0,
        longest: 0,
        lastPracticeDate: null,
      };
      needsUpdate = true;
    }

    // Ensure arrays are initialized
    if (!userProgress.lessonProgress) {
      updates.lessonProgress = [];
      needsUpdate = true;
    }

    if (!userProgress.moduleProgress) {
      updates.moduleProgress = [];
      needsUpdate = true;
    }

    if (!userProgress.practiceSessions) {
      updates.practiceSessions = [];
      needsUpdate = true;
    }

    if (needsUpdate) {
      await UserProgress.updateOne({ userId }, { $set: updates });
      console.log(`✅ Updated achievement tracking fields for user: ${userId}`);
    }

    return {
      success: true,
      message: needsUpdate ? "Achievement tracking updated" : "Achievement tracking already complete",
      updated: needsUpdate,
      userProgress: await UserProgress.findOne({ userId })
    };

  } catch (error) {
    console.error(`❌ Error ensuring achievement tracking for user ${userId}:`, error);
    
    return {
      success: false,
      error: "Failed to ensure achievement tracking",
      details: error.message
    };
  }
};

/**
 * Batch initialize multiple users (for migration purposes)
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Object>} Result with batch processing stats
 */
export const batchInitializeUsers = async (userIds) => {
  const startTime = Date.now();
  
  try {
    console.log(`🔧 Starting batch initialization for ${userIds.length} users`);
    
    const results = {
      total: userIds.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const userId of userIds) {
      try {
        const result = await ensureUserAchievementTracking(userId);
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({ userId, error: result.error });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ userId, error: error.message });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`🎉 Batch initialization completed in ${duration}ms: ${results.successful}/${results.total} successful`);

    return {
      success: true,
      results,
      duration
    };

  } catch (error) {
    console.error('❌ Batch initialization failed:', error);
    
    return {
      success: false,
      error: "Batch initialization failed",
      details: error.message
    };
  }
};
