import { sendSuccess, sendError } from "../utils/responseUtils.js";
import * as curriculumService from "../services/curriculumService.js";

/**
 * Get all curriculum levels
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCurriculumLevels = async (req, res) => {
  try {
    const result = await curriculumService.getCurriculumLevels();

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Curriculum levels retrieved successfully", {
      levels: result.levels,
    });
  } catch (error) {
    console.error("Controller error getting curriculum levels:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get modules for a specific level
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLevelModules = async (req, res) => {
  try {
    const { levelId } = req.params;
    const result = await curriculumService.getLevelModules(levelId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Level modules retrieved successfully", {
      level: result.level,
      modules: result.modules,
    });
  } catch (error) {
    console.error("Controller error getting level modules:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get a specific module with its lessons
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user?.id || null; // Optional user ID for progress tracking
    const result = await curriculumService.getModule(moduleId, userId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Module retrieved successfully", {
      module: result.module,
    });
  } catch (error) {
    console.error("Controller error getting module:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get a specific lesson
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const result = await curriculumService.getLesson(lessonId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Lesson retrieved successfully", {
      lesson: result.lesson,
    });
  } catch (error) {
    console.error("Controller error getting lesson:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Get user curriculum progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await curriculumService.getUserProgress(userId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "User progress retrieved successfully", {
      progress: result.progress,
    });
  } catch (error) {
    console.error("Controller error getting user progress:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Update section progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateSectionProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, sectionId } = req.params;
    const { completed, timeSpent } = req.body;

    console.log(`🎯 Controller: Updating section progress`, {
      userId,
      lessonId,
      sectionId,
      completed,
      timeSpent,
    });

    const result = await curriculumService.updateSectionProgress(
      userId,
      lessonId,
      sectionId,
      completed,
      timeSpent
    );

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Section progress updated successfully", {
      progress: result.progress,
    });
  } catch (error) {
    console.error("Controller error updating section progress:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Update lesson progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;
    const { completed, score, xpEarned, completedSection } = req.body;

    const result = await curriculumService.updateLessonProgress(
      userId,
      lessonId,
      completed,
      score,
      xpEarned,
      completedSection
    );

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Lesson progress updated successfully", {
      progress: result.progress,
    });
  } catch (error) {
    console.error("Controller error updating lesson progress:", error);
    return sendError(res, 500, "Server error");
  }
};

/**
 * Set current lesson
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const setCurrentLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;

    const result = await curriculumService.setCurrentLesson(userId, lessonId);

    if (result.error) {
      return sendError(res, 400, result.error);
    }

    return sendSuccess(res, 200, "Current lesson set successfully", {
      currentCurriculum: result.currentCurriculum,
    });
  } catch (error) {
    console.error("Controller error setting current lesson:", error);
    return sendError(res, 500, "Server error");
  }
};

export default {
  getCurriculumLevels,
  getLevelModules,
  getModule,
  getLesson,
  getUserProgress,
  updateSectionProgress,
  updateLessonProgress,
  setCurrentLesson,
};
