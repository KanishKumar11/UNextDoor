import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authMiddleware.js";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
});
import {
  startConversation,
  continueConversation,
  getConversationHistory,
  getScenarios,
  getScenarioById,
  getUserProgress,
  getDetailedProgress,
  completeLesson,
  updateLearningPath,
  getDailyChallenge,
  submitFeedback,
  getVocabularyByLevel,
  recordPracticeSession,
  analyzeSpeech,
  analyzeGrammar,
  getGrammarRules,
  analyzeVocabulary,
  getVocabularyLevel,
  getVocabularyCategories,
  analyzePronunciation,
  getPronunciationChallenges,
} from "../controllers/tutorController.js";

const router = express.Router();

/**
 * Tutor routes
 * All routes require authentication
 */

// Conversation routes
router.post("/conversation", authenticate, startConversation);
router.post("/conversation/:id", authenticate, continueConversation);
router.get("/conversation/:id", authenticate, getConversationHistory);

// Speech, pronunciation, and grammar analysis
router.post("/analyze-speech", authenticate, analyzeSpeech);
router.post("/analyze-grammar", authenticate, analyzeGrammar);
router.get("/grammar-rules", authenticate, getGrammarRules);
router.post("/analyze-vocabulary", authenticate, analyzeVocabulary);
router.get("/vocabulary-level/:level", authenticate, getVocabularyLevel);
router.get("/vocabulary-categories", authenticate, getVocabularyCategories);
router.post(
  "/analyze-pronunciation",
  authenticate,
  upload.single("audio"),
  analyzePronunciation
);
router.get(
  "/pronunciation-challenges",
  authenticate,
  getPronunciationChallenges
);

// Scenario routes
router.get("/scenarios", authenticate, getScenarios);
router.get("/scenarios/:id", authenticate, getScenarioById);

// Progress routes
router.get("/progress", authenticate, getUserProgress);
router.get("/progress/detailed", authenticate, getDetailedProgress);
router.post("/complete-lesson", authenticate, completeLesson);
router.put("/learning-path", authenticate, updateLearningPath);

// Miscellaneous routes
router.get("/daily-challenge", authenticate, getDailyChallenge);
router.post("/feedback", authenticate, submitFeedback);
router.get("/vocabulary/:level", authenticate, getVocabularyByLevel);
router.post("/practice-session", authenticate, recordPracticeSession);

export default router;
