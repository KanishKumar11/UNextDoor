import express from "express";
import * as gamesController from "../controllers/gamesController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Games routes
 * Most routes require authentication
 */

// Public routes
router.get("/", gamesController.getAvailableGames);

// Protected routes
router.get(
  "/results/:gameType/:lessonId",
  authenticate,
  gamesController.getGameResults
);
router.post("/results", authenticate, gamesController.saveGameResults);
router.get(
  "/leaderboard/:gameType",
  authenticate,
  gamesController.getLeaderboard
);
router.get("/progress", authenticate, gamesController.getUserGameProgress);

// New content routes
router.get("/content/:gameType", authenticate, gamesController.getGameContent);
router.get(
  "/lesson-content/:gameType/:lessonId",
  authenticate,
  gamesController.getLessonGameContent
);

export default router;
