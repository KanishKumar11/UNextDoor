/**
 * OpenAI Controller
 *
 * This module provides controllers for interacting with OpenAI's APIs,
 * including token generation for the Realtime API and session management.
 */

import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import config from "../config/index.js";
import { realtimeSessionService } from "../services/realtimeSessionService.js";
import { analyticsService } from "../services/analyticsService.js";

/**
 * Generate an ephemeral token for OpenAI's Realtime API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRealtimeToken = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    console.log(userId);

    // Extract options from request body
    const {
      model = "gpt-4o-mini-realtime-preview-2024-12-17", // Use the correct model name for Realtime API
      voice = "alloy",
      scenarioId,
      isScenarioBased,
      conversationId,
      level,
    } = req.body;

    console.log(
      `OpenAI token request: model=${model}, scenarioId=${
        scenarioId || "none"
      }, level=${level || "not specified"}, isScenarioBased=${
        isScenarioBased || false
      }`
    );

    // Import scenario prompts
    const { getScenarioPrompt } = await import("../data/scenarioPrompts.js");

    // Determine the appropriate instructions based on scenario
    let instructions =
      "You are a helpful AI language tutor specializing in teaching Korean to English speakers. Respond in Korean with English translations when appropriate.";

    // If this is a scenario-based conversation, use the appropriate prompt
    if (isScenarioBased && scenarioId) {
      // Get the user's proficiency level (use the provided level or default to beginner)
      const userLevel = level ? level.toLowerCase() : "beginner";

      // Get the scenario-specific prompt
      instructions = getScenarioPrompt(scenarioId, userLevel);
      console.log(
        `Using scenario prompt for ${scenarioId}, level: ${userLevel}`
      );
      console.log(
        `Prompt instructions (first 100 chars): ${instructions.substring(
          0,
          100
        )}...`
      );
    }

    // Call OpenAI API to generate token
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.openai.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          voice,
          instructions,
        }),
      }
    );

    if (!response.ok) {
      // Try to get detailed error information
      let errorText = "";
      let errorData = {};

      try {
        errorText = await response.text();
        console.error("OpenAI API error response text:", errorText);

        try {
          // Try to parse as JSON if possible
          errorData = JSON.parse(errorText);
        } catch (parseErr) {
          console.error("Error parsing error response as JSON:", parseErr);
          // Keep the text version if it can't be parsed
          errorData = { raw_error: errorText };
        }
      } catch (textErr) {
        console.error("Error reading error response text:", textErr);
      }

      console.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        url: "https://api.openai.com/v1/realtime/sessions",
        requestBody: {
          model,
          voice,
          instructions: instructions.substring(0, 100) + "...", // Truncate for logging
        },
        error: errorData,
      });

      return res.status(response.status).json({
        error: "Failed to generate OpenAI token",
        details: errorData.error || errorText || response.statusText,
        status: response.status,
        model: model,
      });
    }

    const data = await response.json();

    // Log token generation for analytics
    analyticsService.logEvent(userId, "realtime_token_generated", {
      model,
      voice,
    });

    // Return token with short expiry for client-side caching
    res.set("Cache-Control", "private, max-age=60"); // 1 minute cache
    res.json({ token: data.client_secret.value });
  } catch (error) {
    console.error("Error generating realtime token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};

/**
 * Create a new realtime session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createRealtimeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { options = {} } = req.body;

    // Create session
    const session = await realtimeSessionService.createSession(userId, options);

    // Log session creation
    analyticsService.logEvent(userId, "realtime_session_created", {
      sessionId: session.id,
      options,
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating realtime session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
};

/**
 * Get details of a specific realtime session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRealtimeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    // Get session
    const session = await realtimeSessionService.getSession(sessionId);

    // Check if session exists and belongs to the user
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to session" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error getting realtime session:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
};

/**
 * End a realtime session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const endRealtimeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    // Get session
    const session = await realtimeSessionService.getSession(sessionId);

    // Check if session exists and belongs to the user
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to session" });
    }

    // End session
    await realtimeSessionService.endSession(sessionId);

    // Log session end
    analyticsService.logEvent(userId, "realtime_session_ended", {
      sessionId,
      duration: Date.now() - session.startTime,
    });

    res.json({ success: true, message: "Session ended successfully" });
  } catch (error) {
    console.error("Error ending realtime session:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
};

/**
 * List all realtime sessions for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const listRealtimeSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // List sessions
    const sessions = await realtimeSessionService.getSessionsByUserId(userId);

    res.json(sessions);
  } catch (error) {
    console.error("Error listing realtime sessions:", error);
    res.status(500).json({ error: "Failed to list sessions" });
  }
};

/**
 * Get OpenAI API usage and credits information
 * For development purposes only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getApiUsage = async (req, res) => {
  try {
    // Instead of trying to access the dashboard endpoints, which are browser-only,
    // we'll create a simple test that checks if the API key is valid and working

    // Make a simple API call to test the API key
    const testResponse = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", {
        status: testResponse.status,
        statusText: testResponse.statusText,
        error: errorData,
      });

      return res.status(testResponse.status).json({
        error: "Failed to connect to OpenAI API",
        details: errorData.error || testResponse.statusText,
        status: "ERROR",
      });
    }

    const modelsData = await testResponse.json();

    // Create a simple response with API status and available models
    const apiStatusResponse = {
      status: "OK",
      api_key: {
        is_valid: true,
        organization: config.openai.organization || "Not specified",
      },
      models: {
        count: modelsData.data.length,
        available: modelsData.data.map((model) => model.id).slice(0, 10), // Just show first 10 models
      },
      note: "OpenAI billing dashboard endpoints are not accessible via API. Please check your usage at https://platform.openai.com/usage",
      timestamp: new Date().toISOString(),
    };

    // Log API usage check for analytics
    if (req.user) {
      analyticsService.logEvent(req.user.id, "api_usage_checked", {
        timestamp: new Date().toISOString(),
      });
    }

    res.json(apiStatusResponse);
  } catch (error) {
    console.error("Error checking OpenAI API status:", error);
    res.status(500).json({
      error: "Failed to check OpenAI API status",
      message: error.message,
      status: "ERROR",
    });
  }
};
