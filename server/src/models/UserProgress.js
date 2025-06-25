import mongoose from "mongoose";
import Level from "./Level.js";

const sectionProgressSchema = new mongoose.Schema(
  {
    sectionId: {
      type: String,
      required: true,
      enum: ["introduction", "vocabulary", "grammar", "practice"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number, // Time spent in seconds
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const lessonProgressSchema = new mongoose.Schema(
  {
    lessonId: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    completedSections: {
      type: [String],
      default: [],
    },
    sectionProgress: {
      type: [sectionProgressSchema],
      default: [],
    },
    currentSection: {
      type: String,
      enum: ["introduction", "vocabulary", "grammar", "practice"],
      default: "introduction",
    },
  },
  { _id: false }
);

const skillProgressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: [
        "grammar",
        "vocabulary",
        "pronunciation",
        "fluency",
        "comprehension",
      ],
    },
    level: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
    nextLevelExperience: {
      type: Number,
      default: 100,
    },
  },
  { _id: false }
);

const practiceSessionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // Duration in seconds
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "conversation",
        "vocabulary",
        "grammar",
        "pronunciation",
        "listening",
      ],
      required: true,
    },
    performance: {
      type: Number, // Performance score (0-100)
      default: 0,
    },
  },
  { _id: false }
);

const moduleProgressSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number, // Percentage of completion (0-100)
      min: 0,
      max: 100,
      default: 0,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    current: {
      type: Number,
      default: 0,
    },
    longest: {
      type: Number,
      default: 0,
    },
    lastPracticeDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    totalExperience: {
      type: Number,
      default: 0,
    },
    xpPoints: {
      type: Number,
      default: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    levelProgress: {
      type: Number, // Percentage to next level (0-100)
      default: 0,
      min: 0,
      max: 100,
    },
    nextLevelXp: {
      type: Number,
      default: 100,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
    },
    totalPracticeTime: {
      type: Number, // Total practice time in seconds
      default: 0,
    },
    streak: {
      type: streakSchema,
      default: () => ({}),
    },
    lessonProgress: [lessonProgressSchema],
    moduleProgress: [moduleProgressSchema],
    skillProgress: [skillProgressSchema],
    practiceSessions: [practiceSessionSchema],
    currentCurriculum: {
      level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      currentModuleId: {
        type: String,
        default: null,
      },
      currentLessonId: {
        type: String,
        default: null,
      },
    },
    learningPath: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Scenario",
      default: [],
    },
    preferences: {
      type: Map,
      of: String,
      default: new Map(),
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add method to update streak - ENHANCED DEBUG VERSION
userProgressSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastPractice = this.streak.lastPracticeDate;

  console.log("🔥 STREAK UPDATE DEBUG:", {
    today: today.toISOString(),
    todayLocal: today.toLocaleDateString(),
    lastPractice: lastPractice ? lastPractice.toISOString() : null,
    lastPracticeLocal: lastPractice ? lastPractice.toLocaleDateString() : null,
    currentStreak: this.streak.current,
    userId: this.userId,
  });

  let diffDays = 0; // Initialize diffDays variable in proper scope
  let isFirstPractice = false;

  if (!lastPractice) {
    // First practice ever, record the date, streak starts at 0
    console.log("✅ First practice - recording date, streak starts at 0");
    this.streak.current = 0;
    this.streak.lastPracticeDate = today;
  } else {
    const lastPracticeDay = new Date(lastPractice);
    lastPracticeDay.setHours(0, 0, 0, 0);

    diffDays = Math.floor((today - lastPracticeDay) / (1000 * 60 * 60 * 24));

    console.log("📊 DETAILED DATE CALCULATION:", {
      today: today.toISOString(),
      lastPracticeDay: lastPracticeDay.toISOString(),
      todayMs: today.getTime(),
      lastPracticeMs: lastPracticeDay.getTime(),
      diffMs: today.getTime() - lastPracticeDay.getTime(),
      diffDays: diffDays,
      calculation: `(${today.getTime()} - ${lastPracticeDay.getTime()}) / ${
        1000 * 60 * 60 * 24
      } = ${diffDays}`,
    });

    if (diffDays === 0) {
      // Already practiced today, no change to streak
      console.log("ℹ️ Already practiced today, streak unchanged");
      return this;
    } else if (diffDays === 1) {
      // Consecutive day - increment streak
      this.streak.current += 1;
      if (this.streak.current > this.streak.longest) {
        this.streak.longest = this.streak.current;
      }
      this.streak.lastPracticeDate = today;
      console.log(
        "🔥 Consecutive day! Streak increased to:",
        this.streak.current
      );
    } else {
      // Streak broken - reset to 1
      this.streak.current = 1;
      this.streak.lastPracticeDate = today;
      console.log("💔 Streak broken! Reset to 1. Days missed:", diffDays - 1);
    }
  }

  // Sync with legacy streak fields for compatibility
  this.streakDays = this.streak.current;
  this.lastStreakDate = this.streak.lastPracticeDate;

  // 🎯 ADD DAILY STREAK XP BONUS (only for consecutive days, not first day)
  if (diffDays === 1) {
    let streakBonus = 10; // Base daily XP
    if (this.streak.current >= 30) streakBonus = 25;
    else if (this.streak.current >= 7) streakBonus = 20;
    else if (this.streak.current >= 3) streakBonus = 15;

    console.log(
      `🎁 Daily streak bonus: +${streakBonus} XP (streak: ${this.streak.current} days)`
    );
    this.addXp(streakBonus);
  }

  console.log("✅ Final streak state:", {
    current: this.streak.current,
    longest: this.streak.longest,
    lastPracticeDate: this.streak.lastPracticeDate,
  });

  return this;
};

// Add method to update daily activity (for login streaks)
userProgressSchema.methods.updateDailyActivity = function () {
  console.log("🎯 Updating daily activity for streak tracking");

  // Update streak based on daily activity (login, lesson access, etc.)
  this.updateStreak();

  // Update last active date
  this.lastUpdated = new Date();

  return this;
};

// Add method to add practice session
userProgressSchema.methods.addPracticeSession = function (
  duration,
  activityType,
  performance = 0
) {
  this.practiceSessions.push({
    date: new Date(),
    duration,
    activityType,
    performance,
  });

  this.totalPracticeTime += duration;
  this.updateStreak();
  this.lastUpdated = new Date();

  return this;
};

// Add method to update skill progress
userProgressSchema.methods.updateSkill = function (
  skillName,
  experienceGained
) {
  let skill = this.skillProgress.find((s) => s.name === skillName);

  if (!skill) {
    skill = {
      name: skillName,
      level: 1,
      experience: 0,
      nextLevelExperience: 100,
    };
    this.skillProgress.push(skill);
  }

  skill.experience += experienceGained;
  this.totalExperience += experienceGained;

  // Level up if enough experience
  while (skill.experience >= skill.nextLevelExperience) {
    skill.experience -= skill.nextLevelExperience;
    skill.level += 1;
    skill.nextLevelExperience = Math.floor(skill.nextLevelExperience * 1.5);
  }

  this.lastUpdated = new Date();
  return this;
};

// Add method to update section progress
userProgressSchema.methods.updateSectionProgress = function (
  lessonId,
  sectionId,
  completed = false,
  timeSpent = 0
) {
  console.log(`📝 Updating section progress: ${lessonId} - ${sectionId}`);

  let lesson = this.lessonProgress.find((l) => l.lessonId === lessonId);

  if (!lesson) {
    lesson = {
      lessonId,
      completed: false,
      score: 0,
      attempts: 0,
      lastAttemptAt: null,
      xpEarned: 0,
      completedSections: [],
      sectionProgress: [],
      currentSection: "introduction",
    };
    this.lessonProgress.push(lesson);
    console.log(`📚 Created new lesson progress for: ${lessonId}`);
  }

  // Find or create section progress
  let sectionProgress = lesson.sectionProgress.find(
    (sp) => sp.sectionId === sectionId
  );

  if (!sectionProgress) {
    sectionProgress = {
      sectionId,
      completed: false,
      timeSpent: 0,
      completedAt: null,
      lastAccessedAt: new Date(),
    };
    lesson.sectionProgress.push(sectionProgress);
    console.log(`📋 Created new section progress for: ${sectionId}`);
  }

  // Update section progress
  sectionProgress.lastAccessedAt = new Date();
  if (timeSpent > 0) {
    sectionProgress.timeSpent += timeSpent;
  }

  if (completed && !sectionProgress.completed) {
    sectionProgress.completed = true;
    sectionProgress.completedAt = new Date();

    // Add to completedSections array for backward compatibility
    if (!lesson.completedSections.includes(sectionId)) {
      lesson.completedSections.push(sectionId);
    }

    console.log(
      `✅ Section ${sectionId} marked as completed for lesson ${lessonId}`
    );
  }

  // Update current section to next section if this one is completed
  if (completed) {
    const sectionOrder = ["introduction", "vocabulary", "grammar", "practice"];
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex >= 0 && currentIndex < sectionOrder.length - 1) {
      lesson.currentSection = sectionOrder[currentIndex + 1];
      console.log(`➡️ Advanced to next section: ${lesson.currentSection}`);
    }
  }

  this.lastUpdated = new Date();
  return this;
};

// Add method to update lesson progress
userProgressSchema.methods.updateLessonProgress = async function (
  lessonId,
  completed = false,
  score = 0,
  xpEarned = 0,
  completedSection = null
) {
  let lesson = this.lessonProgress.find((l) => l.lessonId === lessonId);

  if (!lesson) {
    lesson = {
      lessonId,
      completed: false,
      score: 0,
      attempts: 0,
      lastAttemptAt: null,
      xpEarned: 0,
      completedSections: [],
    };
    this.lessonProgress.push(lesson);
  }

  // Update lesson progress
  lesson.attempts += 1;
  lesson.lastAttemptAt = new Date();

  // Update score if higher than current
  if (score > lesson.score) {
    lesson.score = score;
  }

  // Add XP earned
  if (xpEarned > 0) {
    lesson.xpEarned += xpEarned;
    this.totalExperience += xpEarned;
    this.addXp(xpEarned);
  }

  // Add completed section if provided
  if (
    completedSection &&
    !lesson.completedSections.includes(completedSection)
  ) {
    lesson.completedSections.push(completedSection);
  }

  // Mark as completed if specified (only increment count if not already completed)
  if (completed && !lesson.completed) {
    lesson.completed = true;
    this.lessonsCompleted += 1;

    // Update streak when completing a lesson
    this.updateStreak();

    console.log(
      `✅ Lesson ${lessonId} marked as completed. Total lessons completed: ${this.lessonsCompleted}`
    );
  } else if (completed && lesson.completed) {
    console.log(
      `ℹ️ Lesson ${lessonId} already completed, skipping duplicate completion`
    );
  }

  // Update module progress (async operation)
  await this.updateModuleForLesson(lessonId);

  this.lastUpdated = new Date();
  return this;
};

// Add method to update module progress based on lesson progress
userProgressSchema.methods.updateModuleForLesson = async function (lessonId) {
  try {
    // Import curriculum to find which module contains this lesson
    const { curriculum } = await import("../data/curriculum/curriculum.js");

    // Find the module that contains this lesson
    let moduleId = null;
    let totalLessonsInModule = 0;

    // Search through all levels and modules to find the lesson
    for (const level of curriculum.levels) {
      for (const module of level.modules) {
        if (module.lessons.some((lesson) => lesson.id === lessonId)) {
          moduleId = module.id;
          totalLessonsInModule = module.lessons.length;
          break;
        }
      }
      if (moduleId) break;
    }

    if (!moduleId) {
      // Lesson not found in curriculum, skip module update
      this.lastUpdated = new Date();
      return this;
    }

    // Find or create module progress
    let moduleProgress = this.moduleProgress.find(
      (mp) => mp.moduleId === moduleId
    );
    if (!moduleProgress) {
      moduleProgress = {
        moduleId,
        completed: false,
        progress: 0,
        lessonsCompleted: 0,
        totalLessons: totalLessonsInModule,
        lastAccessedAt: new Date(),
      };
      this.moduleProgress.push(moduleProgress);
    }

    // Count completed lessons in this module
    console.log(`🔍 Counting completed lessons for module: ${moduleId}`);
    console.log(`📚 Total lessons in module: ${totalLessonsInModule}`);
    console.log(
      `📊 User lesson progress:`,
      this.lessonProgress.map((lp) => ({
        lessonId: lp.lessonId,
        completed: lp.completed,
      }))
    );

    const completedLessonsInModule = this.lessonProgress.filter((lp) => {
      // Check if this lesson belongs to the current module and is completed
      const lesson = curriculum.levels
        .flatMap((level) => level.modules)
        .find((module) => module.id === moduleId)
        ?.lessons.find((lesson) => lesson.id === lp.lessonId);

      const belongsToModule = lesson && lp.completed;
      if (belongsToModule) {
        console.log(
          `✅ Lesson ${lp.lessonId} belongs to module ${moduleId} and is completed`
        );
      }
      return belongsToModule;
    }).length;

    console.log(
      `📈 Completed lessons in module ${moduleId}: ${completedLessonsInModule}/${totalLessonsInModule}`
    );

    // Update module progress
    moduleProgress.lessonsCompleted = completedLessonsInModule;
    moduleProgress.totalLessons = totalLessonsInModule;
    moduleProgress.progress =
      totalLessonsInModule > 0
        ? Math.round((completedLessonsInModule / totalLessonsInModule) * 100)
        : 0;
    moduleProgress.completed = completedLessonsInModule >= totalLessonsInModule;
    moduleProgress.lastAccessedAt = new Date();

    console.log(`📊 Updated module progress:`, {
      moduleId,
      lessonsCompleted: moduleProgress.lessonsCompleted,
      totalLessons: moduleProgress.totalLessons,
      progress: moduleProgress.progress,
      completed: moduleProgress.completed,
    });

    this.lastUpdated = new Date();
    return this;
  } catch (error) {
    console.error("Error updating module progress:", error);
    this.lastUpdated = new Date();
    return this;
  }
};

// Add method to add XP and handle level progression
userProgressSchema.methods.addXp = async function (xpAmount) {
  if (!xpAmount || xpAmount <= 0) {
    return this;
  }

  console.log(`💰 Adding ${xpAmount} XP to user progress`);
  console.log(
    `📊 Before: xpPoints=${this.xpPoints}, totalExperience=${this.totalExperience}`
  );

  // Add XP to both fields for consistency
  this.xpPoints += xpAmount;
  this.totalExperience += xpAmount; // 🔧 FIX: Also update totalExperience

  console.log(
    `📊 After: xpPoints=${this.xpPoints}, totalExperience=${this.totalExperience}`
  );

  // Get current and next level
  const currentLevel = await Level.getCurrentLevel(this.xpPoints);
  const nextLevel = await Level.getNextLevel(this.xpPoints);

  if (!currentLevel) {
    // If no level found, default to level 1
    this.currentLevel = 1;
    this.levelProgress = 0;
    this.nextLevelXp = 100;
    return this;
  }

  // Update current level
  this.currentLevel = currentLevel.level;

  // Calculate progress to next level
  if (nextLevel) {
    this.nextLevelXp = nextLevel.xpRequired;
    this.levelProgress = Level.calculateProgress(
      this.xpPoints,
      currentLevel,
      nextLevel
    );
  } else {
    // Max level reached
    this.levelProgress = 100;
  }

  this.lastUpdated = new Date();
  console.log(`✅ XP addition complete. Total XP now: ${this.totalExperience}`);
  return this;
};

// Add method to get level details
userProgressSchema.methods.getLevelDetails = async function () {
  const currentLevel = await Level.getCurrentLevel(this.xpPoints);
  const nextLevel = await Level.getNextLevel(this.xpPoints);

  return {
    currentLevel,
    nextLevel,
    xpPoints: this.xpPoints,
    levelProgress: this.levelProgress,
    nextLevelXp: this.nextLevelXp,
  };
};

// Add method to fix data inconsistencies
userProgressSchema.methods.fixDataInconsistencies = function () {
  console.log("🔧 Fixing data inconsistencies...");

  // Recalculate lessons completed from actual lesson progress
  const actualCompletedLessons = this.lessonProgress.filter(
    (lp) => lp.completed
  ).length;

  // 🔧 ENHANCED: Sync totalExperience with xpPoints for consistency
  // The xpPoints field is the authoritative source as it includes all XP sources
  // (lessons, achievements, streaks, games, etc.)
  const shouldUsexpPoints = this.xpPoints > this.totalExperience;

  console.log("📊 Data correction analysis:", {
    before: {
      lessonsCompleted: this.lessonsCompleted,
      totalExperience: this.totalExperience,
      xpPoints: this.xpPoints,
    },
    calculated: {
      lessonsCompleted: actualCompletedLessons,
    },
    recommendation: {
      syncXPFields: shouldUsexpPoints,
      reason: shouldUsexpPoints
        ? "xpPoints includes achievement XP, totalExperience does not"
        : "totalExperience and xpPoints are in sync",
    },
  });

  // Apply corrections
  let correctionsMade = false;

  if (this.lessonsCompleted !== actualCompletedLessons) {
    this.lessonsCompleted = actualCompletedLessons;
    correctionsMade = true;
    console.log(`✅ Corrected lessonsCompleted: ${this.lessonsCompleted}`);
  }

  // 🔧 FIX: Sync totalExperience with xpPoints if xpPoints is higher
  // This ensures achievement XP is reflected in totalExperience
  if (shouldUsexpPoints) {
    console.log(
      `🔄 Syncing totalExperience (${this.totalExperience}) with xpPoints (${this.xpPoints})`
    );
    this.totalExperience = this.xpPoints;
    correctionsMade = true;
    console.log(
      `✅ Synced totalExperience with xpPoints: ${this.totalExperience}`
    );
  }

  if (correctionsMade) {
    this.lastUpdated = new Date();
    console.log("✅ Data inconsistencies fixed!");
  } else {
    console.log("✅ No data inconsistencies found");
  }

  return correctionsMade;
};

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;
