import * as vocabularyService from '../services/vocabularyService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

/**
 * Get vocabulary mastery for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVocabularyMastery = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await vocabularyService.getVocabularyMastery(userId);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'Vocabulary mastery retrieved successfully', {
      vocabularyMastery: result.vocabularyMastery,
    });
  } catch (error) {
    console.error('Error getting vocabulary mastery:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Update word mastery
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateWordMastery = async (req, res) => {
  try {
    const userId = req.user.id;
    const { wordData, isCorrect } = req.body;
    
    if (!wordData) {
      return sendError(res, 400, 'Word data is required');
    }
    
    const result = await vocabularyService.updateWordMastery(userId, wordData, isCorrect);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'Word mastery updated successfully', {
      vocabularyMastery: result.vocabularyMastery,
    });
  } catch (error) {
    console.error('Error updating word mastery:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Get words due for review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getWordsForReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await vocabularyService.getWordsForReview(userId, limit);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'Words for review retrieved successfully', {
      words: result.words,
    });
  } catch (error) {
    console.error('Error getting words for review:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Save game results and update vocabulary mastery
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const saveGameResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType, wordResults } = req.body;
    
    if (!gameType || !wordResults || !Array.isArray(wordResults)) {
      return sendError(res, 400, 'Game type and word results array are required');
    }
    
    const result = await vocabularyService.saveGameResults(userId, gameType, wordResults);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'Game results saved successfully', {
      vocabularyMastery: result.vocabularyMastery,
    });
  } catch (error) {
    console.error('Error saving game results:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Get vocabulary statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVocabularyStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await vocabularyService.getVocabularyStatistics(userId);
    
    if (result.error) {
      return sendError(res, 400, result.error);
    }
    
    return sendSuccess(res, 200, 'Vocabulary statistics retrieved successfully', {
      statistics: result.statistics,
    });
  } catch (error) {
    console.error('Error getting vocabulary statistics:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Get word pairs for a game
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getWordPairs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, difficulty } = req.query;
    
    // For now, return sample word pairs
    // In a real implementation, this would fetch from a database
    const wordPairs = getSampleWordPairs(category, difficulty);
    
    return sendSuccess(res, 200, 'Word pairs retrieved successfully', {
      wordPairs,
    });
  } catch (error) {
    console.error('Error getting word pairs:', error);
    return sendError(res, 500, 'Server error');
  }
};

/**
 * Get sample word pairs for testing
 * @param {string} category - Word category
 * @param {string} difficulty - Difficulty level
 * @returns {Array} Array of word pairs
 */
const getSampleWordPairs = (category = 'general', difficulty = 'beginner') => {
  const sampleData = {
    general: {
      beginner: [
        { korean: '안녕하세요', english: 'Hello' },
        { korean: '감사합니다', english: 'Thank you' },
        { korean: '미안합니다', english: 'Sorry' },
        { korean: '네', english: 'Yes' },
        { korean: '아니요', english: 'No' },
        { korean: '이름', english: 'Name' },
      ],
      intermediate: [
        { korean: '행복하다', english: 'Happy' },
        { korean: '슬프다', english: 'Sad' },
        { korean: '화나다', english: 'Angry' },
        { korean: '피곤하다', english: 'Tired' },
        { korean: '배고프다', english: 'Hungry' },
        { korean: '목마르다', english: 'Thirsty' },
      ],
      advanced: [
        { korean: '성취하다', english: 'Achieve' },
        { korean: '발전하다', english: 'Develop' },
        { korean: '극복하다', english: 'Overcome' },
        { korean: '분석하다', english: 'Analyze' },
        { korean: '해결하다', english: 'Solve' },
        { korean: '설명하다', english: 'Explain' },
      ],
    },
    // Add more categories as needed
  };
  
  // Get word pairs for the specified category and difficulty
  // Default to general/beginner if not found
  const categoryData = sampleData[category] || sampleData.general;
  return categoryData[difficulty] || categoryData.beginner;
};
