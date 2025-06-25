import VocabularyMastery from '../models/VocabularyMastery.js';
import User from '../models/User.js';
import { sendError } from '../utils/responseUtils.js';

/**
 * Get vocabulary mastery for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with vocabulary mastery or error
 */
export const getVocabularyMastery = async (userId) => {
  try {
    // Validate user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return { error: 'User not found' };
    }

    // Get or create vocabulary mastery
    let vocabularyMastery = await VocabularyMastery.findOne({ userId });
    
    if (!vocabularyMastery) {
      vocabularyMastery = new VocabularyMastery({ userId });
      await vocabularyMastery.save();
    }

    return {
      success: true,
      vocabularyMastery,
    };
  } catch (error) {
    console.error('Error getting vocabulary mastery:', error);
    return { error: 'Failed to get vocabulary mastery' };
  }
};

/**
 * Update vocabulary mastery for a word
 * @param {string} userId - User ID
 * @param {Object} wordData - Word data
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {Promise<Object>} Result with updated vocabulary mastery or error
 */
export const updateWordMastery = async (userId, wordData, isCorrect) => {
  try {
    // Validate required fields
    if (!wordData.word || !wordData.translation || !wordData.category || !wordData.level) {
      return { error: 'Missing required word data fields' };
    }

    // Get or create vocabulary mastery
    let vocabularyMastery = await VocabularyMastery.findOne({ userId });
    
    if (!vocabularyMastery) {
      vocabularyMastery = new VocabularyMastery({ userId });
    }

    // Update word mastery
    vocabularyMastery.updateWordMastery(wordData, isCorrect);
    await vocabularyMastery.save();

    return {
      success: true,
      vocabularyMastery,
    };
  } catch (error) {
    console.error('Error updating word mastery:', error);
    return { error: 'Failed to update word mastery' };
  }
};

/**
 * Get words due for review
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of words to return
 * @returns {Promise<Object>} Result with words due for review or error
 */
export const getWordsForReview = async (userId, limit = 10) => {
  try {
    // Get vocabulary mastery
    let vocabularyMastery = await VocabularyMastery.findOne({ userId });
    
    if (!vocabularyMastery) {
      return { error: 'No vocabulary mastery found for user' };
    }

    // Get current date
    const now = new Date();
    
    // Filter words due for review
    const dueWords = vocabularyMastery.masteredWords
      .filter(word => word.nextReviewDate && word.nextReviewDate <= now)
      .sort((a, b) => {
        // Sort by familiarity (ascending) and then by last practiced date (oldest first)
        if (a.familiarity !== b.familiarity) {
          return a.familiarity - b.familiarity;
        }
        return new Date(a.lastPracticed) - new Date(b.lastPracticed);
      })
      .slice(0, limit);

    return {
      success: true,
      words: dueWords,
    };
  } catch (error) {
    console.error('Error getting words for review:', error);
    return { error: 'Failed to get words for review' };
  }
};

/**
 * Save game results and update vocabulary mastery
 * @param {string} userId - User ID
 * @param {string} gameType - Type of game
 * @param {Array} wordResults - Array of word results
 * @returns {Promise<Object>} Result with updated vocabulary mastery or error
 */
export const saveGameResults = async (userId, gameType, wordResults) => {
  try {
    if (gameType !== 'match-word') {
      return { error: 'Invalid game type' };
    }

    // Get vocabulary mastery
    let vocabularyMastery = await VocabularyMastery.findOne({ userId });
    
    if (!vocabularyMastery) {
      vocabularyMastery = new VocabularyMastery({ userId });
    }

    // Update mastery for each word
    for (const result of wordResults) {
      vocabularyMastery.updateWordMastery(result.wordData, result.isCorrect);
    }

    await vocabularyMastery.save();

    return {
      success: true,
      vocabularyMastery,
    };
  } catch (error) {
    console.error('Error saving game results:', error);
    return { error: 'Failed to save game results' };
  }
};

/**
 * Get vocabulary statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with vocabulary statistics or error
 */
export const getVocabularyStatistics = async (userId) => {
  try {
    // Get vocabulary mastery
    let vocabularyMastery = await VocabularyMastery.findOne({ userId });
    
    if (!vocabularyMastery) {
      return { error: 'No vocabulary mastery found for user' };
    }

    // Calculate statistics
    const totalWords = vocabularyMastery.masteredWords.length;
    const masteredWords = vocabularyMastery.totalMastered;
    const masteryPercentage = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

    // Get mastery by level
    const beginnerTotal = vocabularyMastery.masteredWords.filter(word => word.level === 'beginner').length;
    const intermediateTotal = vocabularyMastery.masteredWords.filter(word => word.level === 'intermediate').length;
    const advancedTotal = vocabularyMastery.masteredWords.filter(word => word.level === 'advanced').length;

    return {
      success: true,
      statistics: {
        totalWords,
        masteredWords,
        masteryPercentage,
        byLevel: {
          beginner: {
            total: beginnerTotal,
            mastered: vocabularyMastery.beginnerMastered,
            percentage: beginnerTotal > 0 ? (vocabularyMastery.beginnerMastered / beginnerTotal) * 100 : 0,
          },
          intermediate: {
            total: intermediateTotal,
            mastered: vocabularyMastery.intermediateMastered,
            percentage: intermediateTotal > 0 ? (vocabularyMastery.intermediateMastered / intermediateTotal) * 100 : 0,
          },
          advanced: {
            total: advancedTotal,
            mastered: vocabularyMastery.advancedMastered,
            percentage: advancedTotal > 0 ? (vocabularyMastery.advancedMastered / advancedTotal) * 100 : 0,
          },
        },
      },
    };
  } catch (error) {
    console.error('Error getting vocabulary statistics:', error);
    return { error: 'Failed to get vocabulary statistics' };
  }
};
