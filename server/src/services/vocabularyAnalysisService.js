import OpenAI from "openai";
import config from "../config/index.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Korean vocabulary levels
 */
const vocabularyLevels = {
  beginner: {
    description: "Basic everyday vocabulary for beginners",
    wordCount: "500-1000 words",
    topics: ["Greetings", "Numbers", "Family", "Food", "Time", "Weather", "Basic verbs"],
  },
  intermediate: {
    description: "Expanded vocabulary for intermediate learners",
    wordCount: "1000-3000 words",
    topics: ["Work", "Education", "Travel", "Health", "Entertainment", "Emotions", "Abstract concepts"],
  },
  advanced: {
    description: "Sophisticated vocabulary for advanced learners",
    wordCount: "3000+ words",
    topics: ["Politics", "Economics", "Science", "Literature", "Philosophy", "Idioms", "Slang"],
  },
};

/**
 * Common vocabulary categories
 */
const vocabularyCategories = [
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
  {
    name: "Family",
    words: [
      { korean: "어머니", english: "Mother", level: "beginner" },
      { korean: "아버지", english: "Father", level: "beginner" },
      { korean: "형제", english: "Brothers", level: "beginner" },
      { korean: "자매", english: "Sisters", level: "beginner" },
      { korean: "할머니", english: "Grandmother", level: "beginner" },
    ],
  },
];

/**
 * Analyze vocabulary in text
 * @param {string} text - Text to analyze
 * @param {string} userLevel - User's proficiency level
 * @returns {Promise<Object>} Vocabulary analysis results
 */
export const analyzeVocabulary = async (text, userLevel = "beginner") => {
  try {
    if (!text) {
      return {
        success: false,
        error: "Text is required",
      };
    }

    // Use OpenAI to analyze vocabulary
    const analysis = await analyzeVocabularyWithAI(text, userLevel);

    return {
      success: true,
      text,
      ...analysis,
    };
  } catch (error) {
    console.error("Error analyzing vocabulary:", error);
    return {
      success: false,
      error: "Failed to analyze vocabulary",
      details: error.message,
    };
  }
};

/**
 * Analyze vocabulary using AI
 * @param {string} text - Text to analyze
 * @param {string} userLevel - User's proficiency level
 * @returns {Promise<Object>} Vocabulary analysis
 */
const analyzeVocabularyWithAI = async (text, userLevel) => {
  try {
    const prompt = `
      As a Korean language vocabulary expert, analyze the vocabulary in this Korean text:
      "${text}"
      
      User's proficiency level: ${userLevel}
      
      Provide a detailed analysis in the following JSON format:
      {
        "textLevel": "beginner/intermediate/advanced", // Overall vocabulary level of the text
        "words": [
          {
            "word": "Korean word",
            "meaning": "English meaning",
            "level": "beginner/intermediate/advanced",
            "partOfSpeech": "noun/verb/adjective/etc.",
            "usage": "how the word is used in the text"
          }
        ],
        "suggestions": [
          {
            "original": "original word",
            "alternative": "better or more natural word",
            "reason": "reason for suggestion"
          }
        ],
        "strengths": ["strength1", "strength2"], // What the user did well
        "weaknesses": ["weakness1", "weakness2"], // Areas for improvement
        "newWords": ["word1", "word2"], // Words that might be new to the user based on their level
        "recommendedVocabulary": [
          {
            "word": "Korean word",
            "meaning": "English meaning",
            "example": "example sentence"
          }
        ]
      }
      
      Focus on providing constructive, encouraging feedback appropriate for the user's level.
      For beginners, focus on basic vocabulary.
      For intermediate/advanced users, provide more nuanced vocabulary suggestions.
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    
    const analysisText = completion.choices[0].message.content;
    const analysis = JSON.parse(analysisText);
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing vocabulary with AI:", error);
    
    // Return a default analysis if AI analysis fails
    return {
      textLevel: userLevel,
      words: [],
      suggestions: [],
      strengths: [],
      weaknesses: ["Unable to analyze vocabulary at this time."],
      newWords: [],
      recommendedVocabulary: [],
    };
  }
};

/**
 * Get vocabulary by level
 * @param {string} level - Vocabulary level
 * @returns {Object} Vocabulary level information
 */
export const getVocabularyByLevel = (level = "beginner") => {
  return vocabularyLevels[level] || vocabularyLevels.beginner;
};

/**
 * Get vocabulary categories
 * @param {string} category - Vocabulary category
 * @returns {Array} Vocabulary categories
 */
export const getVocabularyCategories = (category = null) => {
  if (category) {
    const categoryData = vocabularyCategories.find(
      (cat) => cat.name.toLowerCase() === category.toLowerCase()
    );
    return categoryData ? [categoryData] : [];
  }
  
  return vocabularyCategories;
};

export default {
  analyzeVocabulary,
  getVocabularyByLevel,
  getVocabularyCategories,
  vocabularyLevels,
  vocabularyCategories,
};
