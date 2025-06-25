import express from "express";
import * as curriculumController from "../controllers/curriculumController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

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
 * @access Private
 */
router.get("/modules/:moduleId", authenticate, curriculumController.getModule);

/**
 * @route GET /api/curriculum/lessons/:lessonId
 * @desc Get a specific lesson
 * @access Public
 */
router.get("/lessons/:lessonId", curriculumController.getLesson);

/**
 * @route GET /api/curriculum/progress
 * @desc Get user curriculum progress
 * @access Private
 */
router.get("/progress", authenticate, curriculumController.getUserProgress);

/**
 * @route POST /api/curriculum/lessons/:lessonId/sections/:sectionId/progress
 * @desc Update section progress
 * @access Private
 */
router.post(
  "/lessons/:lessonId/sections/:sectionId/progress",
  authenticate,
  curriculumController.updateSectionProgress
);

/**
 * @route POST /api/curriculum/lessons/:lessonId/progress
 * @desc Update lesson progress
 * @access Private
 */
router.post(
  "/lessons/:lessonId/progress",
  authenticate,
  curriculumController.updateLessonProgress
);

/**
 * @route POST /api/curriculum/lessons/:lessonId/current
 * @desc Set current lesson
 * @access Private
 */
router.post(
  "/lessons/:lessonId/current",
  authenticate,
  curriculumController.setCurrentLesson
);

export default router;
