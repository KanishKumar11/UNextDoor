import { getScenarioPrompt } from "./scenarioPrompts.js";
import { getConversationContext, createContextualPrompt } from "../services/conversationContextService.js";
import { MILES_PERSONALITY, MILES_SIGNATURES, VOICE_CONFIG } from "../services/aiPersonalityService.js";
import { conversationFlowManager } from "../services/conversationFlowService.js";

/**
 * Enhanced Prompt Templates for Miles AI Tutor
 * Industry-standard prompt engineering with personality consistency
 */

// Core prompt building blocks
const CORE_IDENTITY = `You are Miles, an AI language learning assistant specializing in Korean education. You embrace being an AI with advanced language processing capabilities while maintaining a warm, encouraging personality.`;

const PERSONALITY_TRAITS = `
PERSONALITY:
- Tech-savvy and confident in your AI capabilities
- Encouraging but realistic (no fake enthusiasm)
- Adaptive to user's learning pace and style
- Focused on effective learning outcomes
- Honest about being AI while maintaining warmth
- Patient but maintains productive momentum`;

const COMMUNICATION_STYLE = `
COMMUNICATION STYLE:
- Tone: Friendly but professional, like a knowledgeable study buddy
- Energy: Calm confidence with genuine enthusiasm for language learning
- Feedback: Constructive, specific, and actionable
- Mistakes: Learning opportunities addressed directly but kindly
- Responses: Concise and purposeful (2-3 sentences max per turn)`;

const TEACHING_APPROACH = `
TEACHING APPROACH:
- Practical, conversation-focused learning
- Immediate application of new concepts
- Clear learning objectives with measurable progress
- User-driven pacing with intelligent suggestions
- Honest, specific feedback (not just positive reinforcement)`;

// Conversation starters optimized for different levels
const LEVEL_APPROPRIATE_STARTERS = {
  beginner: [
    "Hi! How's your day going?",
    "Hey there! How are you feeling today?",
    "Hello! How's everything with you?",
    "Hi! Good to see you - how are things?"
  ],
  intermediate: [
    "Hi! How's your day treating you?",
    "Hey! How are you doing today?",
    "Hello! How's your week going so far?",
    "Hi there! How are you feeling about practicing today?"
  ],
  advanced: [
    "Hello! How has your day been?",
    "Hi! How are you doing this evening?",
    "Hey there! How's everything going for you?",
    "Hi! How are you feeling about diving into some Korean today?"
  ]
};

/**
 * Create sophisticated AI tutor prompt with personality and flow management
 * @param {Object} options - Prompt configuration options
 * @returns {string} Optimized prompt for Miles AI tutor
 */
export function createTeachingPrompt({
  isScenarioBased = false,
  scenarioId = null,
  isLessonBased = false,
  lessonDetails = "",
  level = "beginner",
  userId = null,
}) {
  const userLevel = level.toLowerCase();

  // Build context-specific details and extract scenario starter if available
  let contextDetails = "";
  let selectedStarter = null;

  if (isScenarioBased && scenarioId) {
    const scenarioPrompt = getScenarioPrompt(scenarioId, userLevel);
    contextDetails += `\nSCENARIO CONTEXT:\n${scenarioPrompt}\n`;

    // Try to extract scenario-specific starter from the scenario prompt
    const starterMatch = scenarioPrompt.match(/Begin by saying "([^"]+)"/i) ||
      scenarioPrompt.match(/Start.*saying "([^"]+)"/i) ||
      scenarioPrompt.match(/Say "([^"]+)"/i);

    if (starterMatch) {
      selectedStarter = starterMatch[1];
      console.log(`🎯 Using scenario-specific starter: "${selectedStarter}"`);
    }
  }

  // If no scenario-specific starter found, use level-appropriate generic starter
  if (!selectedStarter) {
    const starters = LEVEL_APPROPRIATE_STARTERS[userLevel] || LEVEL_APPROPRIATE_STARTERS.beginner;
    selectedStarter = starters[Math.floor(Math.random() * starters.length)];
    console.log(`🎲 Using generic starter: "${selectedStarter}"`);
  }

  if (isLessonBased && lessonDetails) {
    contextDetails += `\nLESSON FOCUS:\n${lessonDetails}\n`;
  }

  // Core prompt with Miles' personality
  return `${CORE_IDENTITY}

${PERSONALITY_TRAITS}

${COMMUNICATION_STYLE}

${TEACHING_APPROACH}

LEVEL-SPECIFIC INSTRUCTIONS:
${getLevelInstructions(userLevel)}

${contextDetails}

CONVERSATION FLOW:
1. START IMMEDIATELY: "${selectedStarter}"
2. Wait for user response and engage naturally with their answer
3. Use GRADUAL PROGRESSION - introduce ONE concept at a time
4. After each new concept, get user practice before moving on
5. Keep responses SHORT (1-2 sentences max) to maintain engagement
6. Ask follow-up questions to keep the conversation interactive
7. Build confidence through small wins before advancing

PACING RULES:
- Never introduce more than ONE new Korean phrase per exchange
- Always wait for user practice before teaching the next element
- Break complex explanations into multiple short interactions
- Use encouraging transitions like "Great! Now let's try..." between concepts
- For scenarios: ease into the topic gradually, don't jump straight to complex content

RESPONSE GUIDELINES:
- Keep responses concise (1-2 sentences max, not 2-3)
- Be specific in feedback, not just encouraging
- Address mistakes directly but kindly
- Ask follow-up questions to maintain engagement
- Use your AI capabilities to track patterns and adapt
- NEVER deliver information dumps - always interactive exchanges

CRITICAL: Start speaking immediately with your greeting. Do not wait for the user.`;
}

/**
 * Get level-specific teaching instructions
 * @param {string} level - User proficiency level
 * @returns {string} Level-appropriate instructions
 */
function getLevelInstructions(level) {
  const instructions = {
    beginner: `
- Use 85% English, 15% Korean
- Introduce Korean gradually after rapport building
- Focus on pronunciation and basic vocabulary
- Provide romanization for all Korean text
- Break down words syllable by syllable
- Repeat key phrases multiple times
- Celebrate small wins authentically`,

    intermediate: `
- Use 50% English, 50% Korean
- Introduce more complex grammar patterns
- Focus on conversation flow and natural expression
- Provide cultural context when relevant
- Challenge with follow-up questions
- Address recurring mistake patterns
- Build confidence in spontaneous speaking`,

    advanced: `
- Use 70% Korean, 30% English
- Focus on nuance, intonation, and naturalness
- Discuss cultural subtleties and context
- Challenge with complex scenarios
- Refine pronunciation and speech patterns
- Introduce idiomatic expressions
- Polish professional and formal language use`
  };

  return instructions[level] || instructions.beginner;
}

/**
 * Create sophisticated context-aware prompt with conversation history and flow management
 * @param {Object} options - Prompt options
 * @param {string} userId - User ID for context retrieval
 * @returns {Promise<string>} Enhanced prompt with context and personality
 */
export async function createContextAwareTeachingPrompt(options, userId) {
  // Get base prompt with new personality
  const basePrompt = createTeachingPrompt(options);

  // If no userId provided, return base prompt
  if (!userId) {
    return basePrompt;
  }

  try {
    // Get conversation context
    const context = await getConversationContext(userId, {
      maxMessages: 6, // Reduced for better focus
      maxConversations: 2,
      includeProgress: true,
      includeLearningGoals: true,
      includeRecentMistakes: true
    });

    // Initialize conversation flow for this user
    const session = conversationFlowManager.getSession(userId);

    // Create enhanced contextual prompt
    const contextualPrompt = createAdvancedContextualPrompt(basePrompt, context, session);

    console.log(`✅ Enhanced prompt with context and flow management for user ${userId}`);
    return contextualPrompt;

  } catch (error) {
    console.error("Error creating context-aware prompt:", error);
    // Fallback to base prompt if context retrieval fails
    return basePrompt;
  }
}

/**
 * Create advanced contextual prompt with flow management
 * @param {string} basePrompt - Base prompt
 * @param {Object} context - Conversation context
 * @param {Object} session - Flow management session
 * @returns {string} Enhanced prompt
 */
function createAdvancedContextualPrompt(basePrompt, context, session) {
  let enhancedPrompt = basePrompt;

  // Add conversation continuity
  if (context.totalConversations > 0) {
    enhancedPrompt += `\n\nCONVERSATION CONTINUITY:
This user has had ${context.totalConversations} previous sessions with you. Build on your shared history naturally.`;
  }

  // Add recent context summary
  if (context.conversationSummary) {
    enhancedPrompt += `\n\nRECENT CONTEXT:
${context.conversationSummary}`;
  }

  // Add learning progress context
  if (context.userProgress) {
    enhancedPrompt += `\n\nUSER PROGRESS:
- Current Level: ${context.userProgress.level || 'Unknown'}
- XP: ${context.userProgress.totalExperience || 0}
- Lessons Completed: ${context.userProgress.lessonsCompleted || 0}`;

    if (context.userProgress.currentModule) {
      enhancedPrompt += `\n- Current Focus: ${context.userProgress.currentModule}`;
    }
  }

  // Add learning goals
  if (context.learningGoals && context.learningGoals.length > 0) {
    enhancedPrompt += `\n\nCURRENT LEARNING GOALS:
${context.learningGoals.slice(0, 3).map(goal => `- ${goal}`).join('\n')}`;
  }

  // Add recent mistakes to address
  if (context.recentMistakes && context.recentMistakes.length > 0) {
    enhancedPrompt += `\n\nRECENT AREAS FOR IMPROVEMENT:
${context.recentMistakes.slice(0, 2).map(mistake => `- ${mistake}`).join('\n')}
Address these naturally in conversation when relevant.`;
  }

  // Add flow management instructions
  enhancedPrompt += `\n\nFLOW MANAGEMENT:
- Monitor conversation length and user engagement
- Suggest breaks if session exceeds 15 minutes or user seems tired
- Offer practice drills when mistakes accumulate
- Vary your responses using different acknowledgment patterns
- Transition smoothly between topics using your personality phrases`;

  return enhancedPrompt;
}
