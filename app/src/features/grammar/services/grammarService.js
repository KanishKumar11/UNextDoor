import { apiClient } from '../../../shared/api/apiClient';
import { ENDPOINTS } from '../../../shared/config/api';
import { getAuthToken } from '../../../shared/utils/authUtils';

/**
 * Service for grammar analysis
 */
class GrammarService {
  /**
   * Analyze grammar in text
   * @param {string} text - Text to analyze
   * @param {string} userLevel - User's proficiency level
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeGrammar(text, userLevel = 'beginner') {
    try {
      if (!text) {
        throw new Error('Text is required');
      }
      
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.post(
        ENDPOINTS.TUTOR.ANALYZE_GRAMMAR,
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
      console.error('Error analyzing grammar:', error);
      throw error;
    }
  }
  
  /**
   * Get grammar rules
   * @param {string} category - Grammar rule category
   * @returns {Promise<Object>} Grammar rules
   */
  async getGrammarRules(category = null) {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const params = category ? { category } : {};
      
      const response = await apiClient.get(ENDPOINTS.TUTOR.GRAMMAR_RULES, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting grammar rules:', error);
      throw error;
    }
  }
  
  /**
   * Get feedback for grammar score
   * @param {number} score - Grammar score (0-100)
   * @returns {Object} Feedback object with message and color
   */
  getFeedbackForScore(score) {
    if (score >= 90) {
      return {
        message: 'Excellent grammar!',
        color: '#4CAF50', // Green
        icon: 'checkmark-circle',
      };
    } else if (score >= 75) {
      return {
        message: 'Very good grammar!',
        color: '#8BC34A', // Light Green
        icon: 'checkmark-circle',
      };
    } else if (score >= 60) {
      return {
        message: 'Good grammar with some areas to improve.',
        color: '#FFC107', // Amber
        icon: 'alert-circle',
      };
    } else if (score >= 40) {
      return {
        message: 'Fair grammar. Keep practicing!',
        color: '#FF9800', // Orange
        icon: 'alert-circle',
      };
    } else {
      return {
        message: 'Needs improvement. Try again!',
        color: '#F44336', // Red
        icon: 'close-circle',
      };
    }
  }
  
  /**
   * Get sample grammar analysis for development
   * @returns {Object} Sample grammar analysis
   */
  getSampleGrammarAnalysis() {
    return {
      success: true,
      text: "저는 학생이에요.",
      score: 85,
      corrections: [
        {
          original: "저는 학생이에요.",
          corrected: "저는 학생이에요.",
          explanation: "This sentence is grammatically correct.",
          rule: "Basic sentence structure",
          severity: "none"
        }
      ],
      grammarRules: [
        {
          rule: "Topic particle (는/은)",
          explanation: "Used to mark the topic of the sentence",
          examples: ["저는 학생이에요.", "그는 의사예요."]
        },
        {
          rule: "Copula (이다/이에요)",
          explanation: "Used to indicate that something is something else",
          examples: ["학생이에요.", "의사예요."]
        }
      ],
      strengths: [
        "Correct use of topic particle",
        "Proper sentence structure"
      ],
      weaknesses: [],
      suggestions: [
        "Try using more complex sentence structures",
        "Practice using different particles"
      ],
      nextLevelTips: [
        "Learn how to use conjunctions to connect sentences",
        "Practice using different verb tenses"
      ]
    };
  }
  
  /**
   * Get sample grammar rules for development
   * @returns {Object} Sample grammar rules
   */
  getSampleGrammarRules() {
    return {
      success: true,
      rules: [
        {
          category: "Particles",
          rules: [
            {
              name: "Subject Particle (이/가)",
              description: "Used to mark the subject of a sentence",
              examples: [
                { korean: "저는 학생이에요", english: "I am a student" },
                { korean: "그는 의사가 아니에요", english: "He is not a doctor" },
              ],
              commonMistakes: "Using 은/는 when 이/가 is more appropriate",
            },
            {
              name: "Topic Particle (은/는)",
              description: "Used to mark the topic of a sentence or for contrast",
              examples: [
                { korean: "저는 한국어를 공부해요", english: "I study Korean" },
                { korean: "이것은 책이에요", english: "This is a book" },
              ],
              commonMistakes: "Using 이/가 when 은/는 is more appropriate",
            },
          ],
        },
        {
          category: "Verb Endings",
          rules: [
            {
              name: "Present Tense (아/어요)",
              description: "Used for present actions or states",
              examples: [
                { korean: "저는 공부해요", english: "I study" },
                { korean: "그는 일해요", english: "He works" },
              ],
              commonMistakes: "Incorrect vowel harmony (using 아요 instead of 어요 or vice versa)",
            },
            {
              name: "Past Tense (았/었어요)",
              description: "Used for past actions or states",
              examples: [
                { korean: "저는 공부했어요", english: "I studied" },
                { korean: "그는 일했어요", english: "He worked" },
              ],
              commonMistakes: "Incorrect vowel harmony or irregular verb conjugation",
            },
          ],
        },
      ],
    };
  }
}

export const grammarService = new GrammarService();
