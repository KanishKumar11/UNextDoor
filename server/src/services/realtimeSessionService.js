/**
 * Realtime Session Service
 * 
 * This service manages OpenAI Realtime API sessions, including creation,
 * retrieval, and cleanup of inactive sessions.
 */

import { v4 as uuidv4 } from 'uuid';

// In-memory store for active sessions
// In a production environment, consider using Redis or a database
const activeSessions = new Map();

// Maximum inactivity time before a session is cleaned up (30 minutes)
const MAX_INACTIVITY_MS = 30 * 60 * 1000;

/**
 * Create a new session
 * @param {string} userId - User ID
 * @param {Object} options - Session options
 * @returns {Promise<Object>} Session information
 */
const createSession = async (userId, options = {}) => {
  try {
    // Generate a unique session ID
    const sessionId = uuidv4();
    
    // Create session data
    const session = {
      id: sessionId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      options,
      status: 'active',
    };
    
    // Store session data
    activeSessions.set(sessionId, session);
    
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Session data
 */
const getSession = async (sessionId) => {
  try {
    const session = activeSessions.get(sessionId);
    
    if (session) {
      // Update last activity time
      session.lastActivity = Date.now();
      activeSessions.set(sessionId, session);
    }
    
    return session || null;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
};

/**
 * Get sessions by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of sessions
 */
const getSessionsByUserId = async (userId) => {
  try {
    const userSessions = [];
    
    for (const session of activeSessions.values()) {
      if (session.userId === userId) {
        userSessions.push(session);
      }
    }
    
    return userSessions;
  } catch (error) {
    console.error('Error getting sessions by user ID:', error);
    throw error;
  }
};

/**
 * End session
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} Success status
 */
const endSession = async (sessionId) => {
  try {
    const session = activeSessions.get(sessionId);
    
    if (session) {
      // Update session status
      session.status = 'ended';
      session.endTime = Date.now();
      activeSessions.set(sessionId, session);
      
      // Schedule removal after a delay (to allow for retrieval of ended sessions)
      setTimeout(() => {
        activeSessions.delete(sessionId);
      }, 5 * 60 * 1000); // 5 minutes
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};

/**
 * Clean up inactive sessions
 */
const cleanupInactiveSessions = () => {
  try {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of activeSessions.entries()) {
      if (now - session.lastActivity > MAX_INACTIVITY_MS) {
        activeSessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} inactive sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up inactive sessions:', error);
  }
};

// Set up periodic cleanup
setInterval(cleanupInactiveSessions, 5 * 60 * 1000); // Run every 5 minutes

export const realtimeSessionService = {
  createSession,
  getSession,
  getSessionsByUserId,
  endSession,
  cleanupInactiveSessions,
};
