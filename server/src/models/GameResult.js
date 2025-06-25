import mongoose from "mongoose";

/**
 * Game Result Schema
 * Stores results of games played by users
 */
const gameResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameType: {
      type: String,
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    rewards: [
      {
        type: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          required: true,
        },
        icon: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
gameResultSchema.index({ userId: 1, gameType: 1, lessonId: 1 });
gameResultSchema.index({ gameType: 1, score: -1 });
gameResultSchema.index({ userId: 1, createdAt: -1 });

const GameResult = mongoose.model("GameResult", gameResultSchema);

export default GameResult;
