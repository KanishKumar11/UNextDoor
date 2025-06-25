import mongoose from "mongoose";

/**
 * User progress schema
 * Tracks a user's progress in the AI tutor
 */
const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fluencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    grammarScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    pronunciationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    vocabularyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastStreakDate: {
      type: Date,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    conversationCount: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number, // Total duration in seconds
      default: 0,
    },
    completedScenarios: [
      {
        scenarioId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Scenario",
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
    weakAreas: [
      {
        area: {
          type: String,
          enum: ["grammar", "vocabulary", "pronunciation", "fluency"],
        },
        details: {
          type: String,
        },
      },
    ],
    historicalData: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        fluencyScore: {
          type: Number,
          default: 0,
        },
        grammarScore: {
          type: Number,
          default: 0,
        },
        pronunciationScore: {
          type: Number,
          default: 0,
        },
        vocabularyScore: {
          type: Number,
          default: 0,
        },
        overallScore: {
          type: Number,
          default: 0,
        },
      },
    ],
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate overall score
userProgressSchema.pre("save", function (next) {
  // Calculate overall score as weighted average of individual scores
  this.overallScore = (
    this.fluencyScore * 0.25 +
    this.grammarScore * 0.25 +
    this.pronunciationScore * 0.25 +
    this.vocabularyScore * 0.25
  ).toFixed(1);
  
  // Determine level based on overall score
  if (this.overallScore >= 80) {
    this.level = "advanced";
  } else if (this.overallScore >= 50) {
    this.level = "intermediate";
  } else {
    this.level = "beginner";
  }
  
  // Update streak
  if (this.lastActiveDate) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastActiveDay = new Date(this.lastActiveDate);
    
    // Reset dates to start of day for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    lastActiveDay.setHours(0, 0, 0, 0);
    
    // If last active was yesterday, increment streak
    if (lastActiveDay.getTime() === yesterday.getTime()) {
      this.streakDays += 1;
      this.lastStreakDate = today;
    }
    // If last active was before yesterday, reset streak
    else if (lastActiveDay < yesterday) {
      this.streakDays = 1;
      this.lastStreakDate = today;
    }
    // If last active was today, don't change streak
  }
  
  next();
});

/**
 * Add historical data point
 * @returns {Promise<void>}
 */
userProgressSchema.methods.addHistoricalDataPoint = async function () {
  // Add current scores to historical data
  this.historicalData.push({
    date: new Date(),
    fluencyScore: this.fluencyScore,
    grammarScore: this.grammarScore,
    pronunciationScore: this.pronunciationScore,
    vocabularyScore: this.vocabularyScore,
    overallScore: this.overallScore,
  });
  
  // Limit historical data to last 30 points
  if (this.historicalData.length > 30) {
    this.historicalData = this.historicalData.slice(-30);
  }
  
  await this.save();
};

/**
 * Add completed scenario
 * @param {string} scenarioId - Scenario ID
 * @param {number} score - Score for the scenario
 * @returns {Promise<void>}
 */
userProgressSchema.methods.addCompletedScenario = async function (scenarioId, score) {
  // Check if scenario already completed
  const existingIndex = this.completedScenarios.findIndex(
    s => s.scenarioId.toString() === scenarioId.toString()
  );
  
  if (existingIndex >= 0) {
    // Update existing entry if score is higher
    if (score > this.completedScenarios[existingIndex].score) {
      this.completedScenarios[existingIndex].score = score;
      this.completedScenarios[existingIndex].completedAt = new Date();
    }
  } else {
    // Add new entry
    this.completedScenarios.push({
      scenarioId,
      completedAt: new Date(),
      score,
    });
    
    // Increment conversation count
    this.conversationCount += 1;
  }
  
  await this.save();
};

// Create and export the UserProgress model
const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;
