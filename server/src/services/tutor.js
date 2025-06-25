import express from "express";
import * as tutorController from "../controllers/tutorController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/scenarios", tutorController.getScenarios);
router.get("/scenarios/:id", tutorController.getScenarioById);

// Protected routes
router.post("/conversation", authenticate, tutorController.startConversation);
router.post("/conversation/:id/message", authenticate, tutorController.sendMessage);
router.get("/conversation/:id", authenticate, tutorController.getConversation);
router.get("/conversations", authenticate, tutorController.getUserConversations);

// Speech recognition routes
router.post("/speech/recognize", authenticate, tutorController.recognizeSpeech);
router.post("/speech/synthesize", authenticate, tutorController.synthesizeSpeech);

// Grammar and vocabulary analysis
router.post("/analyze/grammar", authenticate, tutorController.analyzeGrammar);
router.post("/analyze/vocabulary", authenticate, tutorController.analyzeVocabulary);

// Progress tracking
router.get("/progress", authenticate, tutorController.getUserProgress);
router.post("/progress/update", authenticate, tutorController.updateUserProgress);

export default router;
