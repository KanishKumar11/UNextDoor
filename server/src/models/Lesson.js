import mongoose from "mongoose";
import { LESSON_TYPES, PROFICIENCY_LEVELS } from "../constants/appConstants.js";

// Schema for vocabulary items in a lesson
const vocabularyItemSchema = new mongoose.Schema(
  {
    korean: { type: String, required: true, trim: true },
    romanization: { type: String, required: true, trim: true },
    english: { type: String, required: true, trim: true },
    example: { type: String, trim: true },
    audioUrl: { type: String, trim: true },
  },
  { _id: false }
);

// Schema for grammar points in a lesson
const grammarPointSchema = new mongoose.Schema(
  {
    pattern: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
    examples: [
      {
        korean: { type: String, required: true, trim: true },
        romanization: { type: String, trim: true },
        english: { type: String, required: true, trim: true },
        explanation: { type: String, trim: true },
      },
    ],
  },
  { _id: false }
);

// Schema for practice activities in a lesson
const practiceActivitySchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: Object.values(LESSON_TYPES) },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    items: [String],
    prompt: String,
    gameType: String,
  },
  { _id: false }
);

// Schema for conversation dialogues in a lesson
const dialogueLineSchema = new mongoose.Schema(
  {
    speaker: { type: String, required: true, enum: ["tutor", "user"] },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// Schema for lesson content sections
const contentSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: Object.values(LESSON_TYPES) },
    explanation: String,
    items: [mongoose.Schema.Types.Mixed],
    examples: [mongoose.Schema.Types.Mixed],
  },
  { _id: false }
);

// Schema for lesson content
const lessonContentSchema = new mongoose.Schema(
  {
    introduction: { type: String, required: true, trim: true },
    sections: [contentSectionSchema],
    practice: { activities: [practiceActivitySchema] },
    conversation: {
      introduction: String,
      dialogue: [dialogueLineSchema],
    },
    review: {
      summary: String,
      keyPoints: [String],
    },
  },
  { _id: false }
);

// Lesson schema
const lessonSchema = new mongoose.Schema(
  {
    lessonId: { type: String, required: true, unique: true, trim: true },
    moduleId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    level: {
      type: String,
      required: true,
      enum: Object.values(PROFICIENCY_LEVELS),
    },
    objectives: [String],
    estimatedDuration: { type: Number, required: true, min: 5 },
    xpReward: { type: Number, required: true, min: 0 },
    requiredXp: { type: Number, required: true, min: 0, default: 0 },
    order: { type: Number, required: true, min: 1 },
    content: lessonContentSchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create indexes for better query performance
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ level: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
