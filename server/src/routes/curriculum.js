import express from "express";
import * as curriculumController from "../controllers/curriculumController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { 
  requireFeatureAccess, 
  checkUsageLimit, 
  injectSubscriptionInfo 
} from "../middleware/featureGatingMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/curriculum/levels
 * @desc Get all curriculum levels
 * @access Public
 */
router.get("/levels", curriculumController.getCurriculumLevels);

/**
 * @route GET /api/curriculum/levels/:levelId/modules
 * @desc Get modules for a specific level
 * @access Public
 */
router.get("/levels/:levelId/modules", curriculumController.getLevelModules);

/**
 * @route GET /api/curriculum/modules/:moduleId
 * @desc Get a specific module with its lessons
 * @access Private (with subscription check)
 */
router.get("/modules/:moduleId", 
  authenticate, 
  injectSubscriptionInfo,
  curriculumController.getModule
);

/**
 * @route GET /api/curriculum/lessons/:lessonId
 * @desc Get a specific lesson
 * @access Private (with lesson access check)
 */
router.get("/lessons/:lessonId", 
  authenticate,
  requireFeatureAccess('lessons'),
  curriculumController.getLesson
);

/**
 * @route GET /api/curriculum/progress
 * @desc Get user curriculum progress
 * @access Private
 */
router.get("/progress", authenticate, curriculumController.getUserProgress);

/**
 * @route POST /api/curriculum/lessons/:lessonId/sections/:sectionId/progress
 * @desc Update section progress
 * @access Private (with lesson access check)
 */
router.post(
  "/lessons/:lessonId/sections/:sectionId/progress",
  authenticate,
  requireFeatureAccess('lessons'),
  curriculumController.updateSectionProgress
);

/**
 * @route POST /api/curriculum/lessons/:lessonId/progress
 * @desc Update lesson progress
 * @access Private (with lesson access check)
 */
router.post(
  "/lessons/:lessonId/progress",
  authenticate,
  requireFeatureAccess('lessons'),
  curriculumController.updateLessonProgress
);

/**
 * @route POST /api/curriculum/lessons/:lessonId/current
 * @desc Set current lesson
 * @access Private (with lesson access check)
 */
router.post(
  "/lessons/:lessonId/current",
  authenticate,
  requireFeatureAccess('lessons'),
  curriculumController.setCurrentLesson
);

export default router;
