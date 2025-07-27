/**
 * Conversation Context Service
 * Provides conversation memory and context for AI sessions
 */

import Conversation from "../models/Conversation.js";
import UserProgress from "../models/UserProgress.js";
import User from "../models/User.js";

/**
 * Get recent conversation context for a user
 * @param {string} userId - User ID
 * @param {Object} options - Context options
 * @returns {Promise<Object>} Conversation context
 */
export const getConversationContext = async (userId, options = {}) => {
  const {
    maxMessages = 10,
    maxConversations = 3,
    includeProgress = true,
    includeLearningGoals = true,
    includeRecentMistakes = true,
    scenarioId = null
  } = options;

  try {
    console.log(`🧠 Building conversation context for user: ${userId}`);

    const context = {
      recentMessages: [],
      conversationSummary: "",
      userProgress: null,
      learningGoals: [],
      recentMistakes: [],
      userLevel: "beginner",
      totalConversations: 0
    };

    // Get user's basic info and level
    const user = await User.findById(userId).select('preferences.languageLevel');
    if (user) {
      context.userLevel = user.preferences?.languageLevel || "beginner";
    }

    // Get recent conversations
    const recentConversations = await Conversation.find({ userId })
      .sort({ lastMessageAt: -1 })
      .limit(maxConversations)
      .select('messages title level scenarioId lastMessageAt');

    context.totalConversations = await Conversation.countDocuments({ userId });

    // Extract recent messages from conversations
    const allRecentMessages = [];
    for (const conversation of recentConversations) {
      // Get last few messages from each conversation
      const conversationMessages = conversation.messages
        .slice(-Math.ceil(maxMessages / maxConversations))
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          conversationTitle: conversation.title,
          scenarioId: conversation.scenarioId
        }));
      
      allRecentMessages.push(...conversationMessages);
    }

    // Sort all messages by timestamp and take the most recent
    context.recentMessages = allRecentMessages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, maxMessages);

    // Create conversation summary
    if (context.recentMessages.length > 0) {
      context.conversationSummary = createConversationSummary(context.recentMessages, context.userLevel);
    }

    // Get user progress if requested
    if (includeProgress) {
      const userProgress = await UserProgress.findOne({ userId })
        .select('level totalExperience lessonsCompleted currentCurriculum skillProgress');
      
      if (userProgress) {
        context.userProgress = {
          level: userProgress.level,
          totalExperience: userProgress.totalExperience,
          lessonsCompleted: userProgress.lessonsCompleted,
          currentModule: userProgress.currentCurriculum?.currentModuleId,
          currentLesson: userProgress.currentCurriculum?.currentLessonId,
          skillProgress: userProgress.skillProgress
        };
      }
    }

    // Extract learning goals if requested
    if (includeLearningGoals && context.userProgress) {
      context.learningGoals = extractLearningGoals(context.userProgress);
    }

    // Extract recent mistakes if requested
    if (includeRecentMistakes) {
      context.recentMistakes = extractRecentMistakes(context.recentMessages);
    }

    console.log(`✅ Context built: ${context.recentMessages.length} messages, ${context.totalConversations} total conversations`);
    return context;

  } catch (error) {
    console.error("Error building conversation context:", error);
    return {
      recentMessages: [],
      conversationSummary: "",
      userProgress: null,
      learningGoals: [],
      recentMistakes: [],
      userLevel: "beginner",
      totalConversations: 0,
      error: error.message
    };
  }
};

/**
 * Create a conversation summary from recent messages
 * @param {Array} messages - Recent messages
 * @param {string} userLevel - User's proficiency level
 * @returns {string} Conversation summary
 */
const createConversationSummary = (messages, userLevel) => {
  if (messages.length === 0) return "";

  const userMessages = messages.filter(msg => msg.role === 'user');
  const assistantMessages = messages.filter(msg => msg.role === 'assistant');

  const topics = extractTopicsFromMessages(messages);
  const lastConversationTitle = messages[0]?.conversationTitle || "General conversation";

  return `Recent conversation context:
- Last topic: ${lastConversationTitle}
- User level: ${userLevel}
- Recent topics discussed: ${topics.join(', ')}
- User has sent ${userMessages.length} messages recently
- Last user message: "${userMessages[0]?.content?.substring(0, 100) || 'No recent messages'}..."
- Conversation style: ${assistantMessages.length > 0 ? 'Interactive' : 'New user'}`;
};

/**
 * Extract topics from conversation messages
 * @param {Array} messages - Messages to analyze
 * @returns {Array} Array of topics
 */
const extractTopicsFromMessages = (messages) => {
  const topics = new Set();
  
  // Simple keyword extraction - could be enhanced with NLP
  const keywords = [
    'greeting', 'introduction', 'family', 'food', 'travel', 'work', 'school',
    'weather', 'hobbies', 'shopping', 'restaurant', 'directions', 'time',
    'numbers', 'colors', 'animals', 'body parts', 'clothing', 'transportation'
  ];

  messages.forEach(msg => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase();
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          topics.add(keyword);
        }
      });
    }
  });

  return Array.from(topics).slice(0, 5); // Return top 5 topics
};

/**
 * Extract learning goals from user progress
 * @param {Object} userProgress - User progress data
 * @returns {Array} Array of learning goals
 */
const extractLearningGoals = (userProgress) => {
  const goals = [];

  if (userProgress.skillProgress) {
    userProgress.skillProgress.forEach(skill => {
      if (skill.level < 3) { // Focus on skills below level 3
        goals.push(`Improve ${skill.name} (currently level ${skill.level})`);
      }
    });
  }

  if (userProgress.currentModule) {
    goals.push(`Complete current module: ${userProgress.currentModule}`);
  }

  if (userProgress.lessonsCompleted < 10) {
    goals.push("Build foundation with basic lessons");
  }

  return goals.slice(0, 3); // Return top 3 goals
};

/**
 * Extract recent mistakes from conversation messages
 * @param {Array} messages - Recent messages
 * @returns {Array} Array of common mistakes
 */
const extractRecentMistakes = (messages) => {
  const mistakes = [];

  // Simple pattern matching for common Korean learning mistakes
  const commonMistakes = [
    { pattern: /안녕하세요.*안녕하세요/, mistake: "Repeating greetings unnecessarily" },
    { pattern: /은\/는.*이\/가/, mistake: "Mixing topic and subject particles" },
    { pattern: /했어요.*했습니다/, mistake: "Inconsistent formality levels" }
  ];

  messages.forEach(msg => {
    if (msg.role === 'user') {
      commonMistakes.forEach(({ pattern, mistake }) => {
        if (pattern.test(msg.content)) {
          mistakes.push(mistake);
        }
      });
    }
  });

  return [...new Set(mistakes)].slice(0, 3); // Return unique mistakes, max 3
};

/**
 * Create enhanced prompt with conversation context
 * @param {string} basePrompt - Base prompt template
 * @param {Object} context - Conversation context
 * @param {Object} options - Additional options
 * @returns {string} Enhanced prompt with context
 */
export const createContextualPrompt = (basePrompt, context, options = {}) => {
  const {
    includeRecentMessages = true,
    includeProgress = true,
    includeLearningGoals = true,
    includeRecentMistakes = true
  } = options;

  let contextualPrompt = basePrompt;

  // Add conversation context
  if (includeRecentMessages && context.conversationSummary) {
    contextualPrompt += `\n\n${context.conversationSummary}`;
  }

  // Add user progress context
  if (includeProgress && context.userProgress) {
    contextualPrompt += `\n\nUser Progress:
- Experience Level: ${context.userProgress.level}
- Total XP: ${context.userProgress.totalExperience}
- Lessons Completed: ${context.userProgress.lessonsCompleted}
- Current Focus: ${context.userProgress.currentModule || 'General practice'}`;
  }

  // Add learning goals
  if (includeLearningGoals && context.learningGoals.length > 0) {
    contextualPrompt += `\n\nCurrent Learning Goals:
${context.learningGoals.map(goal => `- ${goal}`).join('\n')}`;
  }

  // Add recent mistakes to address
  if (includeRecentMistakes && context.recentMistakes.length > 0) {
    contextualPrompt += `\n\nRecent Areas for Improvement:
${context.recentMistakes.map(mistake => `- ${mistake}`).join('\n')}`;
  }

  // Add conversation continuity instruction
  if (context.totalConversations > 0) {
    contextualPrompt += `\n\nIMPORTANT: This user has had ${context.totalConversations} previous conversations with you. Acknowledge this history and build upon previous interactions naturally. Don't start from scratch - continue the learning journey.`;
  }

  return contextualPrompt;
};

/**
 * Get conversation context for a specific scenario
 * @param {string} userId - User ID
 * @param {string} scenarioId - Scenario ID
 * @returns {Promise<Object>} Scenario-specific context
 */
export const getScenarioContext = async (userId, scenarioId) => {
  const context = await getConversationContext(userId, {
    maxMessages: 5,
    maxConversations: 2,
    scenarioId
  });

  // Add scenario-specific context
  const scenarioConversations = await Conversation.find({ 
    userId, 
    scenarioId 
  })
  .sort({ lastMessageAt: -1 })
  .limit(1)
  .select('messages performance');

  if (scenarioConversations.length > 0) {
    const lastScenarioConversation = scenarioConversations[0];
    context.scenarioHistory = {
      lastPerformance: lastScenarioConversation.performance,
      lastMessages: lastScenarioConversation.messages.slice(-3),
      hasPlayedBefore: true
    };
  } else {
    context.scenarioHistory = {
      hasPlayedBefore: false
    };
  }

  return context;
};

export default {
  getConversationContext,
  createContextualPrompt,
  getScenarioContext
};
