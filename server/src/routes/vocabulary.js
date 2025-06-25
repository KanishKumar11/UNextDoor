import express from 'express';
import * as vocabularyController from '../controllers/vocabularyController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Vocabulary routes
 * All routes require authentication
 */

// Get vocabulary mastery
router.get('/mastery', authenticate, vocabularyController.getVocabularyMastery);

// Update word mastery
router.post('/mastery/update', authenticate, vocabularyController.updateWordMastery);

// Get words due for review
router.get('/review', authenticate, vocabularyController.getWordsForReview);

// Save game results
router.post('/game-results', authenticate, vocabularyController.saveGameResults);

// Get vocabulary statistics
router.get('/statistics', authenticate, vocabularyController.getVocabularyStatistics);

// Get word pairs for a game
router.get('/pairs', authenticate, vocabularyController.getWordPairs);

export default router;
