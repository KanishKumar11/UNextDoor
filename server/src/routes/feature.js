import express from 'express';
import { param } from 'express-validator';
import featureController from '../controllers/featureController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/features/user
 * @desc    Get user's subscription info and feature access
 * @access  Private
 */
router.get('/user', featureController.getUserFeatures);

/**
 * @route   GET /api/features/check/:feature
 * @desc    Check access to a specific feature
 * @access  Private
 */
router.get('/check/:feature', [
  param('feature')
    .isLength({ min: 1 })
    .withMessage('Feature name is required')
], featureController.checkFeatureAccess);

/**
 * @route   GET /api/features/lessons/usage
 * @desc    Get lesson usage and limits
 * @access  Private
 */
router.get('/lessons/usage', featureController.getLessonUsage);

/**
 * @route   GET /api/features/upgrade-options
 * @desc    Get available upgrade options
 * @access  Private
 */
router.get('/upgrade-options', featureController.getUpgradeOptions);

/**
 * @route   GET /api/features/comparison
 * @desc    Get feature comparison table
 * @access  Private
 */
router.get('/comparison', featureController.getFeatureComparison);

/**
 * @route   GET /api/features/coming-soon
 * @desc    Get coming soon features
 * @access  Private
 */
router.get('/coming-soon', featureController.getComingSoonFeatures);

export default router;
