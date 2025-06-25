import OpenAI from "openai";
import config from "../config/index.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Korean grammar rules and common mistakes
 */
const koreanGrammarRules = [
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
      {
        name: "Object Particle (을/를)",
        description: "Used to mark the direct object of a verb",
        examples: [
          { korean: "책을 읽어요", english: "I read a book" },
          { korean: "음식을 먹어요", english: "I eat food" },
        ],
        commonMistakes: "Omitting the object particle",
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
      {
        name: "Future Tense (을/를 거예요)",
        description: "Used for future actions or states",
        examples: [
          { korean: "저는 공부할 거예요", english: "I will study" },
          { korean: "그는 일할 거예요", english: "He will work" },
        ],
        commonMistakes: "Using 겠어요 when 을/를 거예요 is more appropriate",
      },
    ],
  },
  {
    category: "Honorifics",
    rules: [
      {
        name: "Formal Polite (습니다/습니까)",
        description: "Used in formal situations",
        examples: [
          { korean: "저는 학생입니다", english: "I am a student" },
          { korean: "어디에 가십니까?", english: "Where are you going?" },
        ],
        commonMistakes: "Using informal speech in formal situations",
      },
      {
        name: "Informal Polite (아/어요)",
        description: "Used in everyday conversations",
        examples: [
          { korean: "저는 학생이에요", english: "I am a student" },
          { korean: "어디에 가요?", english: "Where are you going?" },
        ],
        commonMistakes: "Using formal speech in casual situations",
      },
    ],
  },
];

/**
 * Analyze grammar in text
 * @param {string} text - Text to analyze
 * @param {string} userLevel - User's proficiency level
 * @returns {Promise<Object>} Grammar analysis results
 */
export const analyzeGrammar = async (text, userLevel = "beginner") => {
  try {
    if (!text) {
      return {
        success: false,
        error: "Text is required",
      };
    }

    // Use OpenAI to analyze grammar
    const analysis = await analyzeGrammarWithAI(text, userLevel);

    return {
      success: true,
      text,
      ...analysis,
    };
  } catch (error) {
    console.error("Error analyzing grammar:", error);
    return {
      success: false,
      error: "Failed to analyze grammar",
      details: error.message,
    };
  }
};

/**
 * Analyze grammar using AI
 * @param {string} text - Text to analyze
 * @param {string} userLevel - User's proficiency level
 * @returns {Promise<Object>} Grammar analysis
 */
const analyzeGrammarWithAI = async (text, userLevel) => {
  try {
    const prompt = `
      As a Korean language grammar expert, analyze the grammar in this Korean text:
      "${text}"
      
      User's proficiency level: ${userLevel}
      
      Provide a detailed analysis in the following JSON format:
      {
        "score": 0-100, // Overall grammar accuracy percentage
        "corrections": [
          {
            "original": "incorrect phrase",
            "corrected": "correct phrase",
            "explanation": "detailed explanation of the grammar rule",
            "rule": "name of the grammar rule",
            "severity": "minor/moderate/major" // How serious the error is
          }
        ],
        "grammarRules": [
          {
            "rule": "name of grammar rule used",
            "explanation": "explanation of how the rule is used in the text",
            "examples": ["example1", "example2"]
          }
        ],
        "strengths": ["strength1", "strength2"], // What the user did well
        "weaknesses": ["weakness1", "weakness2"], // Areas for improvement
        "suggestions": ["suggestion1", "suggestion2"], // 2-3 specific suggestions for improvement
        "nextLevelTips": ["tip1", "tip2"] // Tips for advancing to the next level
      }
      
      Focus on providing constructive, encouraging feedback appropriate for the user's level.
      For beginners, focus on basic grammar rules.
      For intermediate/advanced users, provide more detailed feedback on nuanced grammar aspects.
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
    console.error("Error analyzing grammar with AI:", error);
    
    // Return a default analysis if AI analysis fails
    return {
      score: 0,
      corrections: [],
      grammarRules: [],
      strengths: [],
      weaknesses: ["Unable to analyze grammar at this time."],
      suggestions: ["Try again later."],
      nextLevelTips: [],
    };
  }
};

/**
 * Get grammar rules by category
 * @param {string} category - Grammar rule category
 * @returns {Array} Grammar rules
 */
export const getGrammarRules = (category = null) => {
  if (category) {
    const categoryRules = koreanGrammarRules.find(
      (rule) => rule.category.toLowerCase() === category.toLowerCase()
    );
    return categoryRules ? [categoryRules] : [];
  }
  
  return koreanGrammarRules;
};

export default {
  analyzeGrammar,
  getGrammarRules,
  koreanGrammarRules,
};
