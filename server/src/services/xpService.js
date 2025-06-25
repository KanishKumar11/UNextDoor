import UserProgress from "../models/UserProgress.js";

/**
 * Comprehensive XP Service
 * Handles all XP rewards for different activities
 */

// XP Reward Constants
export const XP_REWARDS = {
  // Lessons
  LESSON_COMPLETION: {
    beginner: 100,
    intermediate: 150,
    advanced: 200,
  },

  // Games
  GAMES: {
    "match-word": 25,
    "sentence-scramble": 30,
    "pronunciation-challenge": 35,
    "vocabulary-quiz": 25,
    "conversation-quest": 40, // Higher reward for conversation practice
    perfect_score_bonus: 10,
  },

  // Practice Sessions
  PRACTICE: {
    conversation: 15,
    vocabulary: 10,
    pronunciation: 20,
    grammar: 15,
  },

  // Daily Activities
  DAILY: {
    streak_base: 10,
    streak_3_days: 15,
    streak_7_days: 20,
    streak_30_days: 25,
    first_login: 5,
    daily_challenge: 50,
  },

  // Achievements (handled separately in achievement system)
  ACHIEVEMENTS: {
    first_steps: 50,
    alphabet_master: 100,
    beginner_communicator: 200,
    daily_life_expert: 300,
    beginner_graduate: 500,
    korean_master: 2000,
  },
};

/**
 * Award XP for lesson completion
 * @param {string} userId - User ID
 * @param {string} lessonId - Lesson ID
 * @param {string} level - Lesson level (beginner/intermediate/advanced)
 * @returns {Promise<Object>} Result with XP awarded
 */
export const awardLessonXP = async (userId, lessonId, level = "beginner") => {
  try {
    const xpAmount = XP_REWARDS.LESSON_COMPLETION[level] || 100;

    console.log(
      `🎁 Awarding lesson XP: ${xpAmount} XP for lesson ${lessonId} (${level})`
    );

    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      throw new Error("User progress not found");
    }

    userProgress.addXp(xpAmount);
    await userProgress.save();

    console.log(`✅ Lesson XP awarded: ${xpAmount} XP`);

    // Check for achievements after XP award
    try {
      const achievementService = await import("./achievementService.js");
      await achievementService.checkAndAwardAchievements(userId);
      console.log("🏆 Achievement check completed after lesson XP award");
    } catch (achievementError) {
      console.error(
        "Error checking achievements after lesson XP:",
        achievementError
      );
      // Continue even if achievement checking fails
    }

    return {
      success: true,
      xpAwarded: xpAmount,
      source: "lesson_completion",
      details: { lessonId, level },
    };
  } catch (error) {
    console.error("Error awarding lesson XP:", error);
    return { error: "Failed to award lesson XP" };
  }
};

/**
 * Award XP for game completion
 * @param {string} userId - User ID
 * @param {string} gameType - Type of game
 * @param {number} score - Game score (0-100)
 * @param {Object} gameData - Additional game data
 * @returns {Promise<Object>} Result with XP awarded
 */
export const awardGameXP = async (
  userId,
  gameType,
  score = 0,
  gameData = {}
) => {
  try {
    const baseXP = XP_REWARDS.GAMES[gameType] || 20;
    const perfectBonus =
      score >= 100 ? XP_REWARDS.GAMES.perfect_score_bonus : 0;
    const totalXP = baseXP + perfectBonus;

    console.log(
      `🎮 Awarding game XP: ${totalXP} XP for ${gameType} (score: ${score})`
    );

    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      throw new Error("User progress not found");
    }

    userProgress.addXp(totalXP);
    await userProgress.save();

    console.log(
      `✅ Game XP awarded: ${totalXP} XP (base: ${baseXP}, bonus: ${perfectBonus})`
    );

    // Check for achievements after game XP award
    try {
      const achievementService = await import("./achievementService.js");
      await achievementService.checkAndAwardAchievements(userId);
      console.log("🏆 Achievement check completed after game XP award");
    } catch (achievementError) {
      console.error(
        "Error checking achievements after game XP:",
        achievementError
      );
      // Continue even if achievement checking fails
    }

    return {
      success: true,
      xpAwarded: totalXP,
      source: "game_completion",
      details: { gameType, score, baseXP, perfectBonus },
    };
  } catch (error) {
    console.error("Error awarding game XP:", error);
    return { error: "Failed to award game XP" };
  }
};

/**
 * Award XP for practice session
 * @param {string} userId - User ID
 * @param {string} practiceType - Type of practice
 * @param {number} duration - Duration in seconds
 * @param {Object} practiceData - Additional practice data
 * @returns {Promise<Object>} Result with XP awarded
 */
export const awardPracticeXP = async (
  userId,
  practiceType,
  duration = 0,
  practiceData = {}
) => {
  try {
    const baseXP = XP_REWARDS.PRACTICE[practiceType] || 10;

    // Bonus XP for longer practice sessions (1 XP per minute over 1 minute)
    const durationBonus = Math.max(0, Math.floor(duration / 60) - 1);
    const totalXP = baseXP + durationBonus;

    console.log(
      `🎯 Awarding practice XP: ${totalXP} XP for ${practiceType} (${duration}s)`
    );

    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      throw new Error("User progress not found");
    }

    userProgress.addXp(totalXP);
    await userProgress.save();

    console.log(
      `✅ Practice XP awarded: ${totalXP} XP (base: ${baseXP}, duration bonus: ${durationBonus})`
    );

    // Check for achievements after practice XP award
    try {
      const achievementService = await import("./achievementService.js");
      await achievementService.checkAndAwardAchievements(userId);
      console.log("🏆 Achievement check completed after practice XP award");
    } catch (achievementError) {
      console.error(
        "Error checking achievements after practice XP:",
        achievementError
      );
      // Continue even if achievement checking fails
    }

    return {
      success: true,
      xpAwarded: totalXP,
      source: "practice_session",
      details: { practiceType, duration, baseXP, durationBonus },
    };
  } catch (error) {
    console.error("Error awarding practice XP:", error);
    return { error: "Failed to award practice XP" };
  }
};

/**
 * Award XP for daily challenge completion
 * @param {string} userId - User ID
 * @param {string} challengeType - Type of challenge
 * @param {Object} challengeData - Challenge completion data
 * @returns {Promise<Object>} Result with XP awarded
 */
export const awardDailyChallengeXP = async (
  userId,
  challengeType,
  challengeData = {}
) => {
  try {
    const xpAmount = XP_REWARDS.DAILY.daily_challenge;

    console.log(
      `📅 Awarding daily challenge XP: ${xpAmount} XP for ${challengeType}`
    );

    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      throw new Error("User progress not found");
    }

    userProgress.addXp(xpAmount);
    await userProgress.save();

    console.log(`✅ Daily challenge XP awarded: ${xpAmount} XP`);

    return {
      success: true,
      xpAwarded: xpAmount,
      source: "daily_challenge",
      details: { challengeType, ...challengeData },
    };
  } catch (error) {
    console.error("Error awarding daily challenge XP:", error);
    return { error: "Failed to award daily challenge XP" };
  }
};

/**
 * Get XP summary for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} XP summary
 */
export const getXPSummary = async (userId) => {
  try {
    const userProgress = await UserProgress.findOne({ userId });
    if (!userProgress) {
      throw new Error("User progress not found");
    }

    return {
      success: true,
      summary: {
        totalXP: userProgress.totalExperience,
        currentLevel: userProgress.currentLevel,
        levelProgress: userProgress.levelProgress,
        nextLevelXP: userProgress.nextLevelXp,
        streak: userProgress.streak,
        lastUpdated: userProgress.lastUpdated,
      },
    };
  } catch (error) {
    console.error("Error getting XP summary:", error);
    return { error: "Failed to get XP summary" };
  }
};

export default {
  awardLessonXP,
  awardGameXP,
  awardPracticeXP,
  awardDailyChallengeXP,
  getXPSummary,
  XP_REWARDS,
};
