/**
 * Conversation Service
 * Handles conversation-related operations
 */

import Conversation from '../models/Conversation.js';
import UserProgress from '../models/UserProgress.js';
import OpenAI from 'openai';
import config from '../config/index.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Save user transcript to conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {string} transcript - User transcript
 * @returns {Promise<Object>} Updated conversation
 */
export const saveTranscriptToConversation = async (conversationId, userId, transcript) => {
  try {
    // Find conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: transcript,
      timestamp: new Date(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return conversation;
  } catch (error) {
    console.error('Error saving transcript to conversation:', error);
    throw error;
  }
};

/**
 * Save AI response to conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} response - AI response
 * @returns {Promise<Object>} Updated conversation
 */
export const saveAIResponseToConversation = async (conversationId, response) => {
  try {
    // Find conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add AI message to conversation
    conversation.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return conversation;
  } catch (error) {
    console.error('Error saving AI response to conversation:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 * @param {string} userId - User ID
 * @param {Object} data - Conversation data
 * @returns {Promise<Object>} Created conversation
 */
export const createConversation = async (userId, data) => {
  try {
    const { title, level, scenarioId } = data;

    // Validate required fields
    if (!level || !title || !scenarioId) {
      throw new Error('Level, title, and scenarioId are required');
    }

    // Create conversation
    const conversation = new Conversation({
      userId,
      title,
      level,
      scenarioId,
      messages: [],
      startedAt: new Date(),
      lastMessageAt: new Date(),
    });

    await conversation.save();

    return conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Get conversation by ID
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Conversation
 */
export const getConversationById = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

/**
 * Generate AI response for a message
 * @param {string} conversationId - Conversation ID
 * @param {string} userMessage - User message
 * @returns {Promise<string>} AI response
 */
export const generateAIResponse = async (conversationId, userMessage) => {
  try {
    // Get conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get conversation history for context
    const messageHistory = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system message if not present
    if (!messageHistory.some(msg => msg.role === 'system')) {
      messageHistory.unshift({
        role: 'system',
        content: 'You are a helpful Korean language tutor. Respond in Korean and English to help the student learn.',
      });
    }

    // Add user message
    messageHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Generate AI response using OpenAI
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: messageHistory,
      temperature: config.openai.temperature,
      max_tokens: config.openai.maxTokens, // Now uses the REDUCED limit from config (300)
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

/**
 * Update user progress based on conversation
 * @param {string} userId - User ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated user progress
 */
export const updateUserProgressFromConversation = async (userId, conversationId) => {
  try {
    // Get conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        level: conversation.level,
        completedScenarios: [],
        vocabulary: [],
        grammar: [],
        pronunciation: {
          score: 0,
          lastAssessment: null,
        },
        fluency: {
          score: 0,
          lastAssessment: null,
        },
        lastPracticeAt: new Date(),
      });
    }

    // Update last practice time
    userProgress.lastPracticeAt = new Date();

    // Add scenario to completed scenarios if not already present
    if (conversation.scenarioId &&
      !userProgress.completedScenarios.includes(conversation.scenarioId)) {
      userProgress.completedScenarios.push(conversation.scenarioId);
    }

    await userProgress.save();

    return userProgress;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};
