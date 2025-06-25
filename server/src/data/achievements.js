/**
 * Achievement data structure
 * Contains all achievements that can be earned by users
 */
import { AchievementCategory } from "../models/Achievement.js";

/**
 * Achievement list
 */
export const achievements = [
  // 🥉 BRONZE TIER - Learning Foundations
  {
    title: "First Steps",
    description: "Complete your first lesson",
    category: AchievementCategory.MILESTONE,
    tier: "bronze",
    iconUrl: "footsteps-outline",
    color: "#CD7F32", // Bronze color
    criteria: {
      type: "lessons_completed",
      threshold: 1,
    },
    xpReward: 50,
    isSecret: false,
    displayOrder: 1,
  },
  {
    title: "Alphabet Master",
    description: "Complete the Korean Alphabet lesson",
    category: AchievementCategory.MILESTONE,
    tier: "bronze",
    iconUrl: "text-outline",
    color: "#CD7F32",
    criteria: {
      type: "specific_lesson",
      threshold: 1,
      additionalParams: {
        lessonId: "beginner-korean-alphabet",
      },
    },
    xpReward: 100,
    isSecret: false,
    displayOrder: 2,
  },
  {
    title: "Beginner Communicator",
    description: "Complete all lessons in the Foundations module",
    category: AchievementCategory.MILESTONE,
    tier: "bronze",
    iconUrl: "chatbubble-outline",
    color: "#CD7F32",
    criteria: {
      type: "module_completed",
      threshold: 1,
      additionalParams: {
        moduleId: "beginner-foundations",
      },
    },
    xpReward: 200,
    isSecret: false,
    displayOrder: 3,
  },
  {
    title: "Daily Life Expert",
    description: "Complete all lessons in the Daily Life module",
    category: AchievementCategory.MILESTONE,
    iconUrl: "cafe-outline",
    color: "#6FC935",
    criteria: {
      type: "module_completed",
      threshold: 1,
      additionalParams: {
        moduleId: "beginner-daily-life",
      },
    },
    xpReward: 300,
    isSecret: false,
    displayOrder: 4,
  },
  {
    title: "Beginner Graduate",
    description: "Complete all beginner level modules",
    category: AchievementCategory.MILESTONE,
    iconUrl: "school-outline",
    color: "#3498db", // Blue color
    criteria: {
      type: "level_completed",
      threshold: 1,
      additionalParams: {
        level: "beginner",
      },
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 5,
  },
  {
    title: "Conversation Starter",
    description: "Complete all lessons in the Communication Skills module",
    category: AchievementCategory.MILESTONE,
    iconUrl: "chatbubbles-outline",
    color: "#3498db",
    criteria: {
      type: "module_completed",
      threshold: 1,
      additionalParams: {
        moduleId: "intermediate-communication",
      },
    },
    xpReward: 400,
    isSecret: false,
    displayOrder: 6,
  },
  {
    title: "Practical Korean User",
    description: "Complete all lessons in the Practical Korean module",
    category: AchievementCategory.MILESTONE,
    iconUrl: "briefcase-outline",
    color: "#3498db",
    criteria: {
      type: "module_completed",
      threshold: 1,
      additionalParams: {
        moduleId: "intermediate-practical",
      },
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 7,
  },
  {
    title: "Intermediate Graduate",
    description: "Complete all intermediate level modules",
    category: AchievementCategory.MILESTONE,
    iconUrl: "ribbon-outline",
    color: "#9b59b6", // Purple color
    criteria: {
      type: "level_completed",
      threshold: 1,
      additionalParams: {
        level: "intermediate",
      },
    },
    xpReward: 1000,
    isSecret: false,
    displayOrder: 8,
  },
  {
    title: "Cultural Insider",
    description: "Complete all lessons in the Cultural Fluency module",
    category: AchievementCategory.MILESTONE,
    iconUrl: "globe-outline",
    color: "#9b59b6",
    criteria: {
      type: "module_completed",
      threshold: 1,
      additionalParams: {
        moduleId: "advanced-cultural-fluency",
      },
    },
    xpReward: 600,
    isSecret: false,
    displayOrder: 9,
  },
  {
    title: "Professional Speaker",
    description: "Complete all lessons in the Professional Korean module",
    category: AchievementCategory.MILESTONE,
    iconUrl: "business-outline",
    color: "#9b59b6",
    criteria: {
      type: "module_completed",
      threshold: 1,
      additionalParams: {
        moduleId: "advanced-professional",
      },
    },
    xpReward: 700,
    isSecret: false,
    displayOrder: 10,
  },
  {
    title: "Korean Master",
    description: "Complete the entire Korean curriculum",
    category: AchievementCategory.MILESTONE,
    iconUrl: "trophy-outline",
    color: "#f1c40f", // Gold color
    criteria: {
      type: "curriculum_completed",
      threshold: 1,
    },
    xpReward: 2000,
    isSecret: false,
    displayOrder: 11,
  },

  // Streak Achievements
  {
    title: "Consistent Learner",
    description: "Practice Korean for 3 days in a row",
    category: AchievementCategory.STREAK,
    iconUrl: "calendar-outline",
    color: "#e74c3c", // Red color
    criteria: {
      type: "streak_days",
      threshold: 3,
    },
    xpReward: 50,
    isSecret: false,
    displayOrder: 1,
  },
  {
    title: "Weekly Warrior",
    description: "Practice Korean for 7 days in a row",
    category: AchievementCategory.STREAK,
    iconUrl: "calendar-outline",
    color: "#e74c3c",
    criteria: {
      type: "streak_days",
      threshold: 7,
    },
    xpReward: 100,
    isSecret: false,
    displayOrder: 2,
  },
  {
    title: "Dedicated Student",
    description: "Practice Korean for 14 days in a row",
    category: AchievementCategory.STREAK,
    iconUrl: "calendar-outline",
    color: "#e74c3c",
    criteria: {
      type: "streak_days",
      threshold: 14,
    },
    xpReward: 200,
    isSecret: false,
    displayOrder: 3,
  },
  {
    title: "Monthly Master",
    description: "Practice Korean for 30 days in a row",
    category: AchievementCategory.STREAK,
    iconUrl: "calendar-outline",
    color: "#e74c3c",
    criteria: {
      type: "streak_days",
      threshold: 30,
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 4,
  },
  {
    title: "Language Devotee",
    description: "Practice Korean for 60 days in a row",
    category: AchievementCategory.STREAK,
    iconUrl: "calendar-outline",
    color: "#f1c40f",
    criteria: {
      type: "streak_days",
      threshold: 60,
    },
    xpReward: 1000,
    isSecret: false,
    displayOrder: 5,
  },
  {
    title: "Korean Enthusiast",
    description: "Practice Korean for 100 days in a row",
    category: AchievementCategory.STREAK,
    iconUrl: "calendar-outline",
    color: "#f1c40f",
    criteria: {
      type: "streak_days",
      threshold: 100,
    },
    xpReward: 2000,
    isSecret: false,
    displayOrder: 6,
  },

  // Skill Achievements
  {
    title: "Vocabulary Collector",
    description: "Learn 50 Korean words",
    category: AchievementCategory.SKILL,
    iconUrl: "book-outline",
    color: "#2ecc71", // Green color
    criteria: {
      type: "vocabulary_learned",
      threshold: 50,
    },
    xpReward: 100,
    isSecret: false,
    displayOrder: 1,
  },
  {
    title: "Word Bank",
    description: "Learn 200 Korean words",
    category: AchievementCategory.SKILL,
    iconUrl: "book-outline",
    color: "#2ecc71",
    criteria: {
      type: "vocabulary_learned",
      threshold: 200,
    },
    xpReward: 300,
    isSecret: false,
    displayOrder: 2,
  },
  {
    title: "Lexicon Master",
    description: "Learn 500 Korean words",
    category: AchievementCategory.SKILL,
    iconUrl: "book-outline",
    color: "#f1c40f",
    criteria: {
      type: "vocabulary_learned",
      threshold: 500,
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 3,
  },
  {
    title: "Grammar Novice",
    description: "Master 10 grammar patterns",
    category: AchievementCategory.SKILL,
    iconUrl: "construct-outline",
    color: "#2ecc71",
    criteria: {
      type: "grammar_mastered",
      threshold: 10,
    },
    xpReward: 100,
    isSecret: false,
    displayOrder: 4,
  },
  {
    title: "Grammar Enthusiast",
    description: "Master 30 grammar patterns",
    category: AchievementCategory.SKILL,
    iconUrl: "construct-outline",
    color: "#2ecc71",
    criteria: {
      type: "grammar_mastered",
      threshold: 30,
    },
    xpReward: 300,
    isSecret: false,
    displayOrder: 5,
  },
  {
    title: "Grammar Expert",
    description: "Master 50 grammar patterns",
    category: AchievementCategory.SKILL,
    iconUrl: "construct-outline",
    color: "#f1c40f",
    criteria: {
      type: "grammar_mastered",
      threshold: 50,
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 6,
  },
  {
    title: "Clear Speaker",
    description: "Achieve 80% accuracy in 10 pronunciation exercises",
    category: AchievementCategory.SKILL,
    iconUrl: "mic-outline",
    color: "#2ecc71",
    criteria: {
      type: "pronunciation_accuracy",
      threshold: 80,
      additionalParams: {
        exerciseCount: 10,
      },
    },
    xpReward: 200,
    isSecret: false,
    displayOrder: 7,
  },
  {
    title: "Perfect Pronunciation",
    description: "Achieve 95% accuracy in 20 pronunciation exercises",
    category: AchievementCategory.SKILL,
    iconUrl: "mic-outline",
    color: "#f1c40f",
    criteria: {
      type: "pronunciation_accuracy",
      threshold: 95,
      additionalParams: {
        exerciseCount: 20,
      },
    },
    xpReward: 400,
    isSecret: false,
    displayOrder: 8,
  },

  // Special Achievements
  {
    title: "Early Bird",
    description: "Practice Korean before 8 AM",
    category: AchievementCategory.SPECIAL,
    iconUrl: "sunny-outline",
    color: "#f39c12", // Orange color
    criteria: {
      type: "practice_time",
      threshold: 1,
      additionalParams: {
        beforeHour: 8,
      },
    },
    xpReward: 50,
    isSecret: true,
    displayOrder: 1,
  },
  {
    title: "Night Owl",
    description: "Practice Korean after 10 PM",
    category: AchievementCategory.SPECIAL,
    iconUrl: "moon-outline",
    color: "#34495e", // Dark blue color
    criteria: {
      type: "practice_time",
      threshold: 1,
      additionalParams: {
        afterHour: 22,
      },
    },
    xpReward: 50,
    isSecret: true,
    displayOrder: 2,
  },
  {
    title: "Weekend Warrior",
    description: "Practice Korean on both Saturday and Sunday",
    category: AchievementCategory.SPECIAL,
    iconUrl: "calendar-outline",
    color: "#f39c12",
    criteria: {
      type: "weekend_practice",
      threshold: 1,
    },
    xpReward: 100,
    isSecret: true,
    displayOrder: 3,
  },

  // 🎯 NEW ENHANCED ACHIEVEMENTS FOR BETTER ENGAGEMENT

  // AI Conversation Achievements
  {
    title: "First Chat",
    description: "Complete your first AI conversation with Cooper",
    category: AchievementCategory.MILESTONE,
    tier: "bronze",
    iconUrl: "chatbubble-ellipses",
    color: "#3498db", // Blue color
    criteria: {
      type: "conversations_completed",
      threshold: 1,
    },
    xpReward: 75,
    isSecret: false,
    displayOrder: 12,
  },
  {
    title: "Conversation Enthusiast",
    description: "Complete 10 AI conversations",
    category: AchievementCategory.SKILL,
    iconUrl: "chatbubbles",
    color: "#3498db",
    criteria: {
      type: "conversations_completed",
      threshold: 10,
    },
    xpReward: 200,
    isSecret: false,
    displayOrder: 4,
  },
  {
    title: "Chatterbox",
    description: "Complete 50 AI conversations",
    category: AchievementCategory.SKILL,
    iconUrl: "chatbubbles",
    color: "#f1c40f",
    criteria: {
      type: "conversations_completed",
      threshold: 50,
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 5,
  },

  // Conversation Quest Achievements
  {
    title: "Quest Beginner",
    description: "Complete your first conversation quest",
    category: AchievementCategory.MILESTONE,
    tier: "bronze",
    iconUrl: "compass-outline",
    color: "#CD7F32",
    criteria: {
      type: "game_completed",
      threshold: 1,
      additionalParams: {
        gameType: "conversation-quest",
      },
    },
    xpReward: 100,
    isSecret: false,
    displayOrder: 13,
  },
  {
    title: "Conversation Explorer",
    description: "Complete 5 conversation quests",
    category: AchievementCategory.SKILL,
    iconUrl: "map-outline",
    color: "#3498db",
    criteria: {
      type: "game_completed",
      threshold: 5,
      additionalParams: {
        gameType: "conversation-quest",
      },
    },
    xpReward: 250,
    isSecret: false,
    displayOrder: 6,
  },
  {
    title: "Quest Master",
    description: "Complete 20 conversation quests",
    category: AchievementCategory.SKILL,
    iconUrl: "trophy",
    color: "#f1c40f",
    criteria: {
      type: "game_completed",
      threshold: 20,
      additionalParams: {
        gameType: "conversation-quest",
      },
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 7,
  },
  {
    title: "Vocabulary Champion",
    description: "Use 80% of target vocabulary in a conversation quest",
    category: AchievementCategory.SKILL,
    iconUrl: "library-outline",
    color: "#2ecc71",
    criteria: {
      type: "vocabulary_usage",
      threshold: 80,
      additionalParams: {
        gameType: "conversation-quest",
      },
    },
    xpReward: 150,
    isSecret: false,
    displayOrder: 8,
  },
  {
    title: "Conversation Perfectionist",
    description: "Achieve 90% quality score in a conversation quest",
    category: AchievementCategory.SKILL,
    iconUrl: "star",
    color: "#f1c40f",
    criteria: {
      type: "conversation_quality",
      threshold: 90,
      additionalParams: {
        gameType: "conversation-quest",
      },
    },
    xpReward: 200,
    isSecret: false,
    displayOrder: 9,
  },

  // Game-Based Achievements
  {
    title: "Game Master",
    description: "Complete 20 learning games",
    category: AchievementCategory.SKILL,
    iconUrl: "game-controller",
    color: "#9b59b6", // Purple color
    criteria: {
      type: "games_completed",
      threshold: 20,
    },
    xpReward: 150,
    isSecret: false,
    displayOrder: 6,
  },
  {
    title: "Perfect Match",
    description: "Get 100% accuracy in 5 'Match the Word' games",
    category: AchievementCategory.SKILL,
    iconUrl: "checkmark-circle",
    color: "#2ecc71",
    criteria: {
      type: "perfect_game_scores",
      threshold: 5,
      additionalParams: {
        gameType: "match-the-word",
        accuracy: 100,
      },
    },
    xpReward: 200,
    isSecret: false,
    displayOrder: 7,
  },

  // Learning Consistency Achievements
  {
    title: "Morning Learner",
    description: "Practice Korean 5 times before 9 AM",
    category: AchievementCategory.SPECIAL,
    iconUrl: "sunny",
    color: "#f39c12",
    criteria: {
      type: "practice_time_count",
      threshold: 5,
      additionalParams: {
        beforeHour: 9,
      },
    },
    xpReward: 150,
    isSecret: true,
    displayOrder: 4,
  },
  {
    title: "Study Buddy",
    description: "Practice Korean for 7 consecutive days",
    category: AchievementCategory.STREAK,
    iconUrl: "people",
    color: "#e74c3c",
    criteria: {
      type: "streak_days",
      threshold: 7,
    },
    xpReward: 150,
    isSecret: false,
    displayOrder: 3,
  },
  {
    title: "Dedication Master",
    description: "Practice Korean for 30 consecutive days",
    category: AchievementCategory.STREAK,
    iconUrl: "medal",
    color: "#f1c40f",
    criteria: {
      type: "streak_days",
      threshold: 30,
    },
    xpReward: 750,
    isSecret: false,
    displayOrder: 4,
  },

  // XP and Progress Achievements
  {
    title: "Rising Star",
    description: "Earn 500 XP total",
    category: AchievementCategory.MILESTONE,
    iconUrl: "star",
    color: "#f1c40f",
    criteria: {
      type: "total_xp",
      threshold: 500,
    },
    xpReward: 100,
    isSecret: false,
    displayOrder: 13,
  },
  {
    title: "XP Collector",
    description: "Earn 2000 XP total",
    category: AchievementCategory.MILESTONE,
    iconUrl: "trophy",
    color: "#f1c40f",
    criteria: {
      type: "total_xp",
      threshold: 2000,
    },
    xpReward: 300,
    isSecret: false,
    displayOrder: 14,
  },
  {
    title: "XP Legend",
    description: "Earn 5000 XP total",
    category: AchievementCategory.MILESTONE,
    iconUrl: "trophy",
    color: "#f1c40f",
    criteria: {
      type: "total_xp",
      threshold: 5000,
    },
    xpReward: 500,
    isSecret: false,
    displayOrder: 15,
  },

  // Module Completion Achievements
  {
    title: "Module Pioneer",
    description: "Complete your first learning module",
    category: AchievementCategory.MILESTONE,
    tier: "bronze",
    iconUrl: "library",
    color: "#CD7F32",
    criteria: {
      type: "modules_completed",
      threshold: 1,
    },
    xpReward: 150,
    isSecret: false,
    displayOrder: 16,
  },
  {
    title: "Module Explorer",
    description: "Complete 3 learning modules",
    category: AchievementCategory.MILESTONE,
    iconUrl: "library",
    color: "#2ecc71",
    criteria: {
      type: "modules_completed",
      threshold: 3,
    },
    xpReward: 300,
    isSecret: false,
    displayOrder: 17,
  },

  // Social and Sharing Achievements
  {
    title: "Show Off",
    description: "Share an achievement on social media",
    category: AchievementCategory.SPECIAL,
    iconUrl: "share-social",
    color: "#3498db",
    criteria: {
      type: "achievements_shared",
      threshold: 1,
    },
    xpReward: 50,
    isSecret: true,
    displayOrder: 5,
  },

  // Time-Based Learning Achievements
  {
    title: "Speed Learner",
    description: "Complete a lesson in under 5 minutes",
    category: AchievementCategory.SPECIAL,
    iconUrl: "flash",
    color: "#e74c3c",
    criteria: {
      type: "lesson_completion_time",
      threshold: 1,
      additionalParams: {
        maxTimeMinutes: 5,
      },
    },
    xpReward: 100,
    isSecret: true,
    displayOrder: 6,
  },
  {
    title: "Marathon Learner",
    description: "Study for 60 minutes in a single session",
    category: AchievementCategory.SPECIAL,
    iconUrl: "time",
    color: "#9b59b6",
    criteria: {
      type: "session_duration",
      threshold: 1,
      additionalParams: {
        minTimeMinutes: 60,
      },
    },
    xpReward: 200,
    isSecret: true,
    displayOrder: 7,
  },

  // Pronunciation and Speaking Achievements
  {
    title: "Clear Speaker",
    description: "Achieve 90% pronunciation accuracy in 10 exercises",
    category: AchievementCategory.SKILL,
    iconUrl: "mic",
    color: "#e74c3c",
    criteria: {
      type: "pronunciation_accuracy",
      threshold: 90,
      additionalParams: {
        exerciseCount: 10,
      },
    },
    xpReward: 250,
    isSecret: false,
    displayOrder: 9,
  },
];

export default achievements;
