import { apiClient } from '../../../shared/api/apiClient';
import { ENDPOINTS } from '../../../shared/config/api';
import { getAuthToken } from '../../../shared/utils/authUtils';

/**
 * Service for vocabulary analysis
 */
class VocabularyAnalysisService {
  /**
   * Analyze vocabulary in text
   * @param {string} text - Text to analyze
   * @param {string} userLevel - User's proficiency level
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeVocabulary(text, userLevel = 'beginner') {
    try {
      if (!text) {
        throw new Error('Text is required');
      }
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.post(
        ENDPOINTS.TUTOR.ANALYZE_VOCABULARY,
        {
          text,
          userLevel,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing vocabulary:', error);
      throw error;
    }
  }
  
  /**
   * Get vocabulary by level
   * @param {string} level - Vocabulary level
   * @returns {Promise<Object>} Vocabulary level information
   */
  async getVocabularyByLevel(level = 'beginner') {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.get(
        `${ENDPOINTS.TUTOR.VOCABULARY_LEVEL}/${level}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting vocabulary by level:', error);
      throw error;
    }
  }
  
  /**
   * Get vocabulary categories
   * @param {string} category - Vocabulary category
   * @returns {Promise<Object>} Vocabulary categories
   */
  async getVocabularyCategories(category = null) {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const params = category ? { category } : {};
      
      const response = await apiClient.get(
        ENDPOINTS.TUTOR.VOCABULARY_CATEGORIES,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting vocabulary categories:', error);
      throw error;
    }
  }
  
  /**
   * Get feedback for vocabulary level
   * @param {string} textLevel - Vocabulary level of text
   * @param {string} userLevel - User's proficiency level
   * @returns {Object} Feedback object with message and color
   */
  getFeedbackForLevel(textLevel, userLevel) {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const textLevelIndex = levels.indexOf(textLevel.toLowerCase());
    const userLevelIndex = levels.indexOf(userLevel.toLowerCase());
    
    if (textLevelIndex === -1 || userLevelIndex === -1) {
      return {
        message: 'Unable to determine vocabulary level',
        color: '#9E9E9E', // Gray
        icon: 'help-circle',
      };
    }
    
    if (textLevelIndex > userLevelIndex + 1) {
      return {
        message: 'Vocabulary is too advanced for your level',
        color: '#F44336', // Red
        icon: 'alert-circle',
      };
    } else if (textLevelIndex > userLevelIndex) {
      return {
        message: 'Vocabulary is challenging but appropriate',
        color: '#FF9800', // Orange
        icon: 'trending-up',
      };
    } else if (textLevelIndex === userLevelIndex) {
      return {
        message: 'Vocabulary is appropriate for your level',
        color: '#4CAF50', // Green
        icon: 'checkmark-circle',
      };
    } else {
      return {
        message: 'Vocabulary is below your level',
        color: '#2196F3', // Blue
        icon: 'information-circle',
      };
    }
  }
  
  /**
   * Get sample vocabulary analysis for development
   * @returns {Object} Sample vocabulary analysis
   */
  getSampleVocabularyAnalysis() {
    return {
      success: true,
      text: "저는 학생이에요.",
      textLevel: "beginner",
      words: [
        {
          word: "저",
          meaning: "I, me",
          level: "beginner",
          partOfSpeech: "pronoun",
          usage: "Used as the subject of the sentence"
        },
        {
          word: "는",
          meaning: "topic particle",
          level: "beginner",
          partOfSpeech: "particle",
          usage: "Marks the topic of the sentence"
        },
        {
          word: "학생",
          meaning: "student",
          level: "beginner",
          partOfSpeech: "noun",
          usage: "Used as a predicate noun"
        },
        {
          word: "이에요",
          meaning: "to be (polite form)",
          level: "beginner",
          partOfSpeech: "copula",
          usage: "Connects the subject to the predicate"
        }
      ],
      suggestions: [],
      strengths: [
        "Using appropriate beginner-level vocabulary",
        "Correct use of basic sentence structure"
      ],
      weaknesses: [],
      newWords: [],
      recommendedVocabulary: [
        {
          word: "선생님",
          meaning: "teacher",
          example: "저는 선생님이에요."
        },
        {
          word: "의사",
          meaning: "doctor",
          example: "그는 의사예요."
        },
        {
          word: "회사원",
          meaning: "office worker",
          example: "저는 회사원이에요."
        }
      ]
    };
  }
  
  /**
   * Get sample vocabulary level for development
   * @returns {Object} Sample vocabulary level
   */
  getSampleVocabularyLevel() {
    return {
      success: true,
      level: "beginner",
      description: "Basic everyday vocabulary for beginners",
      wordCount: "500-1000 words",
      topics: ["Greetings", "Numbers", "Family", "Food", "Time", "Weather", "Basic verbs"],
    };
  }
  
  /**
   * Get sample vocabulary categories for development
   * @returns {Object} Sample vocabulary categories
   */
  getSampleVocabularyCategories() {
    return {
      success: true,
      categories: [
        {
          name: "Greetings",
          words: [
            { korean: "안녕하세요", english: "Hello", level: "beginner" },
            { korean: "안녕히 계세요", english: "Goodbye (to person staying)", level: "beginner" },
            { korean: "안녕히 가세요", english: "Goodbye (to person leaving)", level: "beginner" },
            { korean: "만나서 반갑습니다", english: "Nice to meet you", level: "beginner" },
            { korean: "오랜만이에요", english: "Long time no see", level: "intermediate" },
          ],
        },
        {
          name: "Food",
          words: [
            { korean: "밥", english: "Rice", level: "beginner" },
            { korean: "김치", english: "Kimchi", level: "beginner" },
            { korean: "물", english: "Water", level: "beginner" },
            { korean: "불고기", english: "Bulgogi", level: "beginner" },
            { korean: "비빔밥", english: "Bibimbap", level: "beginner" },
          ],
        },
      ],
    };
  }
}

export const vocabularyAnalysisService = new VocabularyAnalysisService();
