import mongoose from 'mongoose';

/**
 * Challenge type enum
 * @enum {string}
 */
export const ChallengeType = {
  VOCABULARY: 'vocabulary',
  CONVERSATION: 'conversation',
  GRAMMAR: 'grammar',
  PRONUNCIATION: 'pronunciation',
  LISTENING: 'listening',
  READING: 'reading',
  WRITING: 'writing',
  GAME: 'game',
};

/**
 * Challenge difficulty enum
 * @enum {string}
 */
export const ChallengeDifficulty = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ALL_LEVELS: 'all-levels',
};

/**
 * Daily challenge schema
 * Represents a daily challenge that users can complete
 */
const dailyChallengeSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: Object.values(ChallengeType),
      required: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(ChallengeDifficulty),
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
      min: 10,
      default: 50,
    },
    streakPoints: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    content: {
      // Dynamic content based on challenge type
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    requirements: {
      // Requirements to complete the challenge
      type: {
        type: String,
        enum: [
          'complete_conversation',
          'play_game',
          'learn_vocabulary',
          'practice_pronunciation',
          'complete_lesson',
          'answer_questions',
          'custom',
        ],
        required: true,
      },
      count: {
        type: Number,
        default: 1,
        min: 1,
      },
      targetId: {
        // ID of the target (e.g., scenario ID, game ID)
        type: String,
      },
      additionalParams: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availableDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(23, 59, 59, 999);
        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * User challenge progress schema
 * Tracks a user's progress on daily challenges
 */
const userChallengeProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DailyChallenge',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    streakPointsEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
dailyChallengeSchema.index({ type: 1, difficulty: 1 });
dailyChallengeSchema.index({ availableDate: 1, expiryDate: 1 });
userChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
userChallengeProgressSchema.index({ userId: 1, isCompleted: 1 });

// Create and export the models
export const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);
export const UserChallengeProgress = mongoose.model('UserChallengeProgress', userChallengeProgressSchema);

export default { DailyChallenge, UserChallengeProgress };
