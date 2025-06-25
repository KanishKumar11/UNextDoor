import mongoose from "mongoose";
import { PROFICIENCY_LEVELS } from "../constants/appConstants.js";

// Module schema
const moduleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    level: {
      type: String,
      required: true,
      enum: Object.values(PROFICIENCY_LEVELS),
    },
    requiredXp: { type: Number, required: true, min: 0, default: 0 },
    order: { type: Number, required: true, min: 1 },
    icon: { type: String, default: "book-outline" },
    color: { type: String, default: "#6FC935" }, // Primary green color
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create indexes for better query performance
moduleSchema.index({ level: 1, order: 1 });

// Get all lessons for this module
moduleSchema.methods.getLessons = async function () {
  const Lesson = mongoose.model("Lesson");
  return await Lesson.find({ moduleId: this.moduleId, isActive: true }).sort({
    order: 1,
  });
};

// Get all modules for a specific level
moduleSchema.statics.getModulesByLevel = async function (level) {
  return await this.find({ level, isActive: true }).sort({ order: 1 });
};

// Get module with its lessons
moduleSchema.statics.getModuleWithLessons = async function (moduleId) {
  const module = await this.findOne({ moduleId, isActive: true });
  if (!module) return null;

  const lessons = await module.getLessons();
  return {
    ...module.toObject(),
    lessons,
  };
};

const Module = mongoose.model("Module", moduleSchema);

export default Module;
