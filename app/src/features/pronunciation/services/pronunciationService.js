import { apiClient } from '../../../shared/api/apiClient';
import { ENDPOINTS } from '../../../shared/config/api';
import { getAuthToken } from '../../../shared/utils/authUtils';
import * as FileSystem from 'expo-file-system';

/**
 * Service for pronunciation analysis
 */
class PronunciationService {
  /**
   * Analyze pronunciation from audio recording
   * @param {string} audioUri - URI of the audio recording
   * @param {string} targetText - Text that should have been pronounced
   * @param {string} userLevel - User's proficiency level
   * @returns {Promise<Object>} Analysis results
   */
  async analyzePronunciation(audioUri, targetText, userLevel = 'beginner') {
    try {
      if (!audioUri) {
        throw new Error('Audio URI is required');
      }
      
      if (!targetText) {
        throw new Error('Target text is required');
      }
      
      // Create form data for audio file
      const formData = new FormData();
      
      // Add audio file
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      
      // Add other parameters
      formData.append('targetText', targetText);
      formData.append('userLevel', userLevel);
      
      // Get auth token
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Send to server for analysis
      const response = await fetch(`${apiClient.defaults.baseURL}${ENDPOINTS.TUTOR.ANALYZE_PRONUNCIATION}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze pronunciation');
      }
      
      const data = await response.json();
      
      // Clean up recording file
      try {
        await FileSystem.deleteAsync(audioUri);
      } catch (error) {
        console.warn('Error deleting recording file:', error);
      }
      
      return data;
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      throw error;
    }
  }
  
  /**
   * Get common pronunciation challenges
   * @returns {Promise<Object>} Pronunciation challenges
   */
  async getPronunciationChallenges() {
    try {
      const response = await apiClient.get(ENDPOINTS.TUTOR.PRONUNCIATION_CHALLENGES);
      return response.data;
    } catch (error) {
      console.error('Error getting pronunciation challenges:', error);
      throw error;
    }
  }
  
  /**
   * Generate feedback for pronunciation accuracy
   * @param {number} accuracy - Pronunciation accuracy score (0-100)
   * @returns {Object} Feedback object with message and color
   */
  getFeedbackForAccuracy(accuracy) {
    if (accuracy >= 90) {
      return {
        message: 'Excellent pronunciation!',
        color: '#4CAF50', // Green
        icon: 'checkmark-circle',
      };
    } else if (accuracy >= 75) {
      return {
        message: 'Very good pronunciation!',
        color: '#8BC34A', // Light Green
        icon: 'checkmark-circle',
      };
    } else if (accuracy >= 60) {
      return {
        message: 'Good pronunciation with some areas to improve.',
        color: '#FFC107', // Amber
        icon: 'alert-circle',
      };
    } else if (accuracy >= 40) {
      return {
        message: 'Fair pronunciation. Keep practicing!',
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
   * Get sample pronunciation challenges for development
   * @returns {Object} Sample pronunciation challenges
   */
  getSamplePronunciationChallenges() {
    return {
      phonemes: {
        vowels: [
          { char: "ㅏ", romanized: "a", commonIssues: "Often confused with 'eo' sound" },
          { char: "ㅓ", romanized: "eo", commonIssues: "Often confused with 'o' sound" },
          { char: "ㅗ", romanized: "o", commonIssues: "Requires rounded lips" },
          { char: "ㅜ", romanized: "u", commonIssues: "Requires more rounded lips than English 'oo'" },
          { char: "ㅡ", romanized: "eu", commonIssues: "No English equivalent, often mispronounced" },
        ],
        consonants: [
          { char: "ㄱ", romanized: "g/k", commonIssues: "Softer than English 'k', harder than 'g'" },
          { char: "ㄴ", romanized: "n", commonIssues: "Similar to English 'n'" },
          { char: "ㄷ", romanized: "d/t", commonIssues: "Between English 'd' and 't'" },
          { char: "ㄹ", romanized: "r/l", commonIssues: "Between English 'r' and 'l', often mispronounced" },
          { char: "ㅁ", romanized: "m", commonIssues: "Similar to English 'm'" },
        ],
      },
      commonChallenges: [
        {
          type: "consonant",
          challenge: "Tensed consonants (ㄲ, ㄸ, ㅃ, ㅆ, ㅉ)",
          tip: "Practice by tensing your vocal cords before pronouncing. These sounds require more tension than regular consonants.",
        },
        {
          type: "consonant",
          challenge: "Aspirated consonants (ㅊ, ㅋ, ㅌ, ㅍ)",
          tip: "Practice by adding a puff of air when pronouncing. Place your hand in front of your mouth to feel the air.",
        },
        {
          type: "vowel",
          challenge: "Vowel distinction (ㅐ vs ㅔ)",
          tip: "ㅐ (ae) is pronounced with a wider mouth opening than ㅔ (e). Practice by exaggerating the difference.",
        },
      ],
    };
  }
  
  /**
   * Get sample pronunciation analysis for development
   * @returns {Object} Sample pronunciation analysis
   */
  getSamplePronunciationAnalysis() {
    return {
      success: true,
      transcribedText: "안녕하세요",
      targetText: "안녕하세요",
      accuracy: 85,
      phonemeAnalysis: [
        {
          phoneme: "ㅇ (ng)",
          accuracy: 90,
          issue: "Good pronunciation",
          improvement: "Continue practicing this sound"
        },
        {
          phoneme: "ㅎ (h)",
          accuracy: 75,
          issue: "Slightly weak aspiration",
          improvement: "Practice with more breath for the 'h' sound"
        }
      ],
      difficultSounds: ["ㅎ"],
      accentFeedback: "Your pronunciation is generally good, but your intonation could be more natural.",
      improvementTips: [
        "Practice the rising intonation at the end of questions",
        "Focus on the 'h' sound in '하세요' with more aspiration"
      ],
      strengths: [
        "Good pronunciation of vowels",
        "Clear articulation of syllables"
      ],
      practiceExercises: [
        "Repeat '하세요' slowly, focusing on the 'h' sound",
        "Practice with minimal pairs: '하다' vs '아다'"
      ]
    };
  }
}

export const pronunciationService = new PronunciationService();
