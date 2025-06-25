import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      unique: true, // This creates a unique index
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    xpRequired: {
      type: Number,
      required: true,
      min: 0,
    },
    icon: {
      type: String,
      default: "star-outline",
    },
    color: {
      type: String,
      default: "#6FC935",
    },
    rewards: {
      type: [
        {
          type: {
            type: String,
            enum: ["achievement", "badge", "feature_unlock", "currency"],
            required: true,
          },
          id: {
            type: String,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          icon: {
            type: String,
            default: "gift-outline",
          },
        },
      ],
      default: [],
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

// Keep the index for xpRequired, as it’s not implicitly indexed
levelSchema.index({ xpRequired: 1 });

// Static methods remain unchanged
levelSchema.statics.getNextLevel = async function (xp) {
  return this.findOne({ xpRequired: { $gt: xp }, isActive: true })
    .sort({ xpRequired: 1 })
    .limit(1);
};

levelSchema.statics.getCurrentLevel = async function (xp) {
  return this.findOne({ xpRequired: { $lte: xp }, isActive: true })
    .sort({ xpRequired: -1 })
    .limit(1);
};

levelSchema.statics.calculateProgress = function (
  currentXp,
  currentLevel,
  nextLevel
) {
  if (!currentLevel || !nextLevel) {
    return 0;
  }

  const currentLevelXp = currentLevel.xpRequired;
  const nextLevelXp = nextLevel.xpRequired;
  const xpRange = nextLevelXp - currentLevelXp;

  if (xpRange <= 0) {
    return 100;
  }

  const xpProgress = currentXp - currentLevelXp;
  const progressPercentage = (xpProgress / xpRange) * 100;

  return Math.min(Math.max(progressPercentage, 0), 100);
};

const Level = mongoose.model("Level", levelSchema);
export default Level;
