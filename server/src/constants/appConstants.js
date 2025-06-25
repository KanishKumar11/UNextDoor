/**
 * Application-wide constants
 */

// AI Tutor name
export const AI_TUTOR_NAME = 'Cooper';

// User proficiency levels
export const PROFICIENCY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

// Proficiency level descriptions
export const PROFICIENCY_LEVEL_DESCRIPTIONS = {
  [PROFICIENCY_LEVELS.BEGINNER]: "I'm just starting out",
  [PROFICIENCY_LEVELS.INTERMEDIATE]: "I can hold a conversation",
  [PROFICIENCY_LEVELS.ADVANCED]: "I'm fluent",
};

// Lesson types
export const LESSON_TYPES = {
  CONVERSATION: 'conversation',
  VOCABULARY: 'vocabulary',
  GRAMMAR: 'grammar',
  PRONUNCIATION: 'pronunciation',
  READING: 'reading',
  WRITING: 'writing',
  CULTURE: 'culture',
  GAME: 'game',
};

// Lesson statuses
export const LESSON_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Skill categories
export const SKILL_CATEGORIES = {
  VOCABULARY: 'vocabulary',
  GRAMMAR: 'grammar',
  PRONUNCIATION: 'pronunciation',
  CONVERSATION: 'conversation',
  CULTURAL: 'cultural',
};

// Achievement types
export const ACHIEVEMENT_TYPES = {
  STREAK: 'streak',
  COMPLETION: 'completion',
  SKILL: 'skill',
  MILESTONE: 'milestone',
};

// Game types
export const GAME_TYPES = {
  MATCHING: 'matching',
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_BLANK: 'fill_blank',
  WORD_ORDER: 'word_order',
  PRONUNCIATION: 'pronunciation',
  ROLEPLAY: 'roleplay',
  SCENARIO: 'scenario',
};

export default {
  AI_TUTOR_NAME,
  PROFICIENCY_LEVELS,
  PROFICIENCY_LEVEL_DESCRIPTIONS,
  LESSON_TYPES,
  LESSON_STATUS,
  SKILL_CATEGORIES,
  ACHIEVEMENT_TYPES,
  GAME_TYPES,
};
