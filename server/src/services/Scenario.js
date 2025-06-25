import mongoose from "mongoose";

/**
 * Difficulty level enum
 * @enum {string}
 */
export const DifficultyLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

/**
 * Scenario schema
 * Represents a conversation scenario for the AI tutor
 */
const scenarioSchema = new mongoose.Schema(
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
    level: {
      type: String,
      enum: Object.values(DifficultyLevel),
      default: DifficultyLevel.BEGINNER,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    icon: {
      type: String,
      default: "chatbubble-outline",
    },
    color: {
      type: String,
      default: "#4CAF50",
    },
    order: {
      type: Number,
      default: 0,
    },
    objectives: [{
      type: String,
      trim: true,
    }],
    vocabularyList: [{
      word: {
        type: String,
        required: true,
        trim: true,
      },
      meaning: {
        type: String,
        required: true,
        trim: true,
      },
      example: {
        type: String,
        trim: true,
      },
    }],
    dialogueExamples: [{
      role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
    }],
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
scenarioSchema.index({ level: 1, category: 1 });
scenarioSchema.index({ title: "text", description: "text" });

// Create and export the Scenario model
const Scenario = mongoose.model("Scenario", scenarioSchema);
export default Scenario;
