import OpenAI from "openai";
import config from "../config/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadAudio, getAudioUrl } from "../utils/storageUtils.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Korean phonemes and their common pronunciation challenges
 */
const koreanPhonemes = {
  vowels: [
    {
      char: "ㅏ",
      romanized: "a",
      commonIssues: "Often confused with 'eo' sound",
    },
    {
      char: "ㅓ",
      romanized: "eo",
      commonIssues: "Often confused with 'o' sound",
    },
    { char: "ㅗ", romanized: "o", commonIssues: "Requires rounded lips" },
    {
      char: "ㅜ",
      romanized: "u",
      commonIssues: "Requires more rounded lips than English 'oo'",
    },
    {
      char: "ㅡ",
      romanized: "eu",
      commonIssues: "No English equivalent, often mispronounced",
    },
    { char: "ㅣ", romanized: "i", commonIssues: "Similar to English 'ee'" },
    {
      char: "ㅐ",
      romanized: "ae",
      commonIssues: "Often confused with 'e' sound",
    },
    {
      char: "ㅔ",
      romanized: "e",
      commonIssues: "Often confused with 'ae' sound",
    },
    {
      char: "ㅚ",
      romanized: "oe",
      commonIssues: "Difficult combination for English speakers",
    },
    {
      char: "ㅟ",
      romanized: "wi",
      commonIssues: "Requires quick transition between sounds",
    },
  ],
  consonants: [
    {
      char: "ㄱ",
      romanized: "g/k",
      commonIssues: "Softer than English 'k', harder than 'g'",
    },
    { char: "ㄴ", romanized: "n", commonIssues: "Similar to English 'n'" },
    {
      char: "ㄷ",
      romanized: "d/t",
      commonIssues: "Between English 'd' and 't'",
    },
    {
      char: "ㄹ",
      romanized: "r/l",
      commonIssues: "Between English 'r' and 'l', often mispronounced",
    },
    { char: "ㅁ", romanized: "m", commonIssues: "Similar to English 'm'" },
    {
      char: "ㅂ",
      romanized: "b/p",
      commonIssues: "Between English 'b' and 'p'",
    },
    { char: "ㅅ", romanized: "s", commonIssues: "Lighter than English 's'" },
    {
      char: "ㅇ",
      romanized: "ng",
      commonIssues: "Silent at beginning, 'ng' sound at end",
    },
    { char: "ㅈ", romanized: "j", commonIssues: "Softer than English 'j'" },
    {
      char: "ㅊ",
      romanized: "ch",
      commonIssues: "Aspirated, stronger than English 'ch'",
    },
    { char: "ㅋ", romanized: "k", commonIssues: "Strongly aspirated 'k'" },
    { char: "ㅌ", romanized: "t", commonIssues: "Strongly aspirated 't'" },
    { char: "ㅍ", romanized: "p", commonIssues: "Strongly aspirated 'p'" },
    { char: "ㅎ", romanized: "h", commonIssues: "Similar to English 'h'" },
    {
      char: "ㄲ",
      romanized: "kk",
      commonIssues: "Tensed 'k', difficult for English speakers",
    },
    {
      char: "ㄸ",
      romanized: "tt",
      commonIssues: "Tensed 't', difficult for English speakers",
    },
    {
      char: "ㅃ",
      romanized: "pp",
      commonIssues: "Tensed 'p', difficult for English speakers",
    },
    {
      char: "ㅆ",
      romanized: "ss",
      commonIssues: "Tensed 's', difficult for English speakers",
    },
    {
      char: "ㅉ",
      romanized: "jj",
      commonIssues: "Tensed 'j', difficult for English speakers",
    },
  ],
};

/**
 * Common pronunciation challenges for English speakers learning Korean
 */
const commonChallenges = [
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
  {
    type: "consonant",
    challenge: "ㄹ (r/l) sound",
    tip: "This sound is between English 'r' and 'l'. Touch the tip of your tongue to the roof of your mouth briefly.",
  },
  {
    type: "rhythm",
    challenge: "Syllable timing",
    tip: "Korean is syllable-timed, with each syllable given roughly equal emphasis. Avoid stressing certain syllables as in English.",
  },
  {
    type: "intonation",
    challenge: "Rising intonation",
    tip: "Korean questions often end with rising intonation. Practice by raising your pitch at the end of questions.",
  },
  {
    type: "consonant",
    challenge: "Final consonants (받침/batchim)",
    tip: "Final consonants in Korean are often unreleased. Practice by not fully pronouncing the final sound.",
  },
  {
    type: "vowel",
    challenge: "Rounded vowels (ㅗ, ㅜ)",
    tip: "These vowels require rounded lips. Practice by exaggerating the lip rounding when pronouncing.",
  },
];

/**
 * Analyze pronunciation from audio
 * @param {Buffer|string} audioData - Audio data buffer or file path
 * @param {string} targetText - Target text that should be pronounced
 * @param {string} userLevel - User's proficiency level
 * @returns {Promise<Object>} Pronunciation analysis results
 */
export const analyzePronunciation = async (
  audioData,
  targetText,
  userLevel = "beginner"
) => {
  try {
    let audioFile;
    let tempFilePath;

    // Check if audio data is empty or too small
    if (!audioData || (Buffer.isBuffer(audioData) && audioData.length < 1000)) {
      console.log("❌ Audio data is empty or too small");
      return {
        success: true,
        transcribedText: "",
        targetText,
        accuracy: 0,
        phonemeAnalysis: [],
        difficultSounds: [],
        accentFeedback:
          "No audio detected. Please try recording again and speak clearly into the microphone.",
        improvementTips: [
          "Make sure your microphone is working",
          "Speak clearly and loudly enough",
          "Try recording in a quiet environment",
        ],
        strengths: [],
        practiceExercises: [
          "Test your microphone first",
          "Practice speaking the phrase out loud before recording",
        ],
      };
    }

    // Handle different audio input types
    if (typeof audioData === "string") {
      // If audioData is a URL or file path
      audioFile = audioData;
    } else {
      // If audioData is a buffer, save to temp file
      tempFilePath = path.join(uploadsDir, `pronunciation-${Date.now()}.m4a`);
      fs.writeFileSync(tempFilePath, audioData);
      audioFile = fs.createReadStream(tempFilePath);
    }

    // Use OpenAI Whisper API to transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ko",
    });

    // Clean up temp file if created
    if (tempFilePath) {
      fs.unlinkSync(tempFilePath);
    }

    // Get the transcribed text
    const transcribedText = transcription.text.trim();

    console.log("🎤 Whisper transcription result:", {
      originalText: transcription.text,
      trimmedText: transcribedText,
      length: transcribedText.length,
      targetText: targetText,
    });

    // Check if transcription is empty or too short
    if (!transcribedText || transcribedText.length < 1) {
      console.log("❌ No speech detected in audio - returning 0% accuracy");
      return {
        success: true,
        transcribedText: "",
        targetText,
        accuracy: 0,
        phonemeAnalysis: [],
        difficultSounds: [],
        accentFeedback:
          "No speech detected in the audio. Please try recording again and speak clearly.",
        improvementTips: [
          "Speak louder and clearer",
          "Make sure you're close to the microphone",
          "Try recording in a quieter environment",
        ],
        strengths: [],
        practiceExercises: [
          "Practice saying the phrase out loud first",
          "Record a longer sample",
        ],
      };
    }

    // Analyze pronunciation using GPT-4
    const analysis = await analyzePronunciationWithAI(
      transcribedText,
      targetText,
      userLevel
    );

    return {
      success: true,
      transcribedText,
      targetText,
      ...analysis,
    };
  } catch (error) {
    console.error("Error analyzing pronunciation:", error);

    // Check if it's a Whisper API error (often means no speech detected)
    if (error.message && error.message.includes("audio")) {
      return {
        success: true,
        transcribedText: "",
        targetText,
        accuracy: 0,
        phonemeAnalysis: [],
        difficultSounds: [],
        accentFeedback:
          "Could not process the audio. Please try recording again with clear speech.",
        improvementTips: [
          "Ensure your microphone is working",
          "Speak clearly and at normal volume",
          "Try recording in a quiet space",
        ],
        strengths: [],
        practiceExercises: [
          "Test your microphone settings",
          "Practice the phrase before recording",
        ],
      };
    }

    return {
      success: false,
      error: "Failed to analyze pronunciation",
      details: error.message,
    };
  }
};

/**
 * Analyze pronunciation using AI
 * @param {string} transcribedText - Transcribed text from audio
 * @param {string} targetText - Target text that should be pronounced
 * @param {string} userLevel - User's proficiency level
 * @returns {Promise<Object>} Pronunciation analysis
 */
const analyzePronunciationWithAI = async (
  transcribedText,
  targetText,
  userLevel
) => {
  try {
    const prompt = `
      As a Korean language pronunciation expert, analyze the pronunciation accuracy between the transcribed text and the target text.

      Target text (what the user should have said): "${targetText}"
      Transcribed text (what the user actually said): "${transcribedText}"
      User's proficiency level: ${userLevel}

      Provide a detailed analysis in the following JSON format:
      {
        "accuracy": 0-100, // Overall accuracy percentage
        "phonemeAnalysis": [
          {
            "phoneme": "specific sound",
            "accuracy": 0-100,
            "issue": "description of the issue",
            "improvement": "specific suggestion for improvement"
          }
        ],
        "difficultSounds": ["sound1", "sound2"], // List of sounds the user struggled with
        "accentFeedback": "feedback on accent and intonation",
        "improvementTips": ["tip1", "tip2"], // 2-3 specific tips for improvement
        "strengths": ["strength1", "strength2"], // What the user did well
        "practiceExercises": ["exercise1", "exercise2"] // 1-2 specific exercises to improve
      }

      Focus on providing constructive, encouraging feedback appropriate for the user's level.
      For beginners, focus on major pronunciation issues.
      For intermediate/advanced users, provide more detailed feedback on subtle pronunciation aspects.
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
    console.error("Error analyzing pronunciation with AI:", error);

    // Return a default analysis if AI analysis fails
    return {
      accuracy: calculateSimpleAccuracy(transcribedText, targetText),
      phonemeAnalysis: [],
      difficultSounds: [],
      accentFeedback: "Unable to provide detailed feedback at this time.",
      improvementTips: ["Practice speaking more slowly and clearly."],
      strengths: ["Attempted to speak in Korean."],
      practiceExercises: [
        "Repeat the phrase multiple times while listening to a native speaker.",
      ],
    };
  }
};

/**
 * Calculate a simple accuracy score based on string similarity
 * @param {string} transcribedText - Transcribed text from audio
 * @param {string} targetText - Target text that should be pronounced
 * @returns {number} Accuracy score (0-100)
 */
const calculateSimpleAccuracy = (transcribedText, targetText) => {
  // Remove spaces and punctuation for comparison
  const cleanTranscribed = transcribedText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g, "")
    .toLowerCase();
  const cleanTarget = targetText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g, "")
    .toLowerCase();

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(cleanTranscribed, cleanTarget);
  const maxLength = Math.max(cleanTranscribed.length, cleanTarget.length);

  // Convert to accuracy percentage
  const accuracy = Math.max(0, 100 - (distance / maxLength) * 100);
  return Math.round(accuracy);
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Levenshtein distance
 */
const levenshteinDistance = (a, b) => {
  const matrix = Array(b.length + 1)
    .fill()
    .map(() => Array(a.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
};

export default {
  analyzePronunciation,
  koreanPhonemes,
  commonChallenges,
};
