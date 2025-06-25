import express from "express";
import * as achievementController from "../controllers/achievementController.js";
import * as achievementService from "../services/achievementService.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

const router = express.Router();

// Public routes
router.get("/", achievementController.getAchievements);

// Protected routes
router.get("/user", authenticate, achievementController.getUserAchievements);
router.get(
  "/unviewed",
  authenticate,
  achievementController.getUnviewedAchievements
);
router.post(
  "/mark-viewed",
  authenticate,
  achievementController.markAchievementsAsViewed
);
router.post(
  "/check",
  authenticate,
  achievementController.checkAndAwardAchievements
);

/**
 * Initialize achievements system (for development/deployment)
 * @route POST /api/achievements/initialize
 * @access Private
 */
router.post("/initialize", authenticate, async (req, res) => {
  try {
    console.log("🔧 Initializing achievements system...");

    const result = await achievementService.initializeAchievements();

    if (result.success) {
      sendSuccess(res, 200, result.message, {
        count: result.count,
        duration: result.duration,
      });
    } else {
      sendError(res, 500, result.error);
    }
  } catch (error) {
    console.error("Error initializing achievements:", error);
    sendError(res, 500, "Error initializing achievements");
  }
});

export default router;
