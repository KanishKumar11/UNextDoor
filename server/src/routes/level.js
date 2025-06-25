import express from "express";
import * as levelController from "../controllers/levelController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Level routes
 * Some routes require authentication
 */

// Public routes
router.get("/", levelController.getAllLevels);
router.get("/leaderboard", levelController.getLeaderboard);

// Protected routes
router.get("/user", authenticate, levelController.getUserLevel);
router.post("/xp", authenticate, levelController.addXpToUser);

// Admin routes
router.post(
  "/initialize",
  authenticate,
  authorize("admin"),
  levelController.initializeLevels
);

export default router;
