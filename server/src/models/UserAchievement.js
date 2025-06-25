import mongoose from "mongoose";

/**
 * User achievement schema
 * Tracks achievements earned by users
 */
const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for userId and achievementId
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

/**
 * Mark achievement as viewed
 * @returns {Promise<void>}
 */
userAchievementSchema.methods.markAsViewed = async function () {
  this.isViewed = true;
  await this.save();
};

/**
 * Update achievement progress
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Promise<void>}
 */
userAchievementSchema.methods.updateProgress = async function (progress) {
  this.progress = Math.min(Math.max(progress, 0), 100);
  await this.save();
};

/**
 * Find all achievements for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user achievements with populated achievement data
 */
userAchievementSchema.statics.findByUserId = async function (userId) {
  return this.find({ userId })
    .populate("achievementId")
    .sort({ earnedAt: -1 });
};

/**
 * Find unviewed achievements for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of unviewed user achievements
 */
userAchievementSchema.statics.findUnviewedByUserId = async function (userId) {
  return this.find({ userId, isViewed: false })
    .populate("achievementId")
    .sort({ earnedAt: -1 });
};

/**
 * Check if user has earned an achievement
 * @param {string} userId - User ID
 * @param {string} achievementId - Achievement ID
 * @returns {Promise<boolean>} True if user has earned the achievement
 */
userAchievementSchema.statics.hasEarned = async function (userId, achievementId) {
  const count = await this.countDocuments({ userId, achievementId });
  return count > 0;
};

// Create and export the UserAchievement model
const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema);
export default UserAchievement;
