/**
 * OpenAI API Routes
 *
 * This module provides routes for interacting with OpenAI's APIs,
 * including token generation for the Realtime API.
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getRealtimeToken,
  createRealtimeSession,
  getRealtimeSession,
  endRealtimeSession,
  listRealtimeSessions,
  getApiUsage,
} from "../controllers/openaiController.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/openai/realtime/token
 * @desc    Generate an ephemeral token for OpenAI's Realtime API
 * @access  Private
 */
router.post(
  "/realtime/token",
  rateLimiter("realtime_token", 100), // Increased from 10 to 100 requests per hour
  getRealtimeToken
);

/**
 * @route   POST /api/openai/realtime/sessions
 * @desc    Create a new realtime session
 * @access  Private
 */
router.post("/realtime/sessions", createRealtimeSession);

/**
 * @route   GET /api/openai/realtime/sessions/:sessionId
 * @desc    Get details of a specific realtime session
 * @access  Private
 */
router.get("/realtime/sessions/:sessionId", getRealtimeSession);

/**
 * @route   DELETE /api/openai/realtime/sessions/:sessionId
 * @desc    End a realtime session
 * @access  Private
 */
router.delete("/realtime/sessions/:sessionId", endRealtimeSession);

/**
 * @route   GET /api/openai/realtime/sessions
 * @desc    List all realtime sessions for the authenticated user
 * @access  Private
 */
router.get("/realtime/sessions", listRealtimeSessions);

/**
 * @route   GET /api/openai/status
 * @desc    Check OpenAI API status and available models
 * @access  Public (for development purposes)
 */
router.get("/status", getApiUsage);

export default router;
