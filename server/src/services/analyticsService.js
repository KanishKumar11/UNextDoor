/**
 * Analytics Service
 * 
 * This service provides analytics functionality for tracking user actions
 * and system events.
 */

// In-memory store for analytics events
// In a production environment, consider using a database or analytics service
const events = [];

/**
 * Log an event
 * @param {string} userId - User ID
 * @param {string} eventType - Event type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Event object
 */
const logEvent = async (userId, eventType, metadata = {}) => {
  try {
    const event = {
      id: generateEventId(),
      userId,
      eventType,
      metadata,
      timestamp: new Date().toISOString(),
    };
    
    // Store event
    events.push(event);
    
    // Limit events array size to prevent memory issues
    if (events.length > 10000) {
      events.shift(); // Remove oldest event
    }
    
    return event;
  } catch (error) {
    console.error('Error logging event:', error);
    // Don't throw error to prevent disrupting the main application flow
  }
};

/**
 * Get events by user ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of events
 */
const getEventsByUserId = async (userId, options = {}) => {
  try {
    const { limit = 100, eventType, startDate, endDate } = options;
    
    // Filter events
    return events
      .filter(event => {
        // Filter by user ID
        if (event.userId !== userId) return false;
        
        // Filter by event type if specified
        if (eventType && event.eventType !== eventType) return false;
        
        // Filter by date range if specified
        if (startDate && new Date(event.timestamp) < new Date(startDate)) return false;
        if (endDate && new Date(event.timestamp) > new Date(endDate)) return false;
        
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp (newest first)
      .slice(0, limit); // Limit results
  } catch (error) {
    console.error('Error getting events by user ID:', error);
    throw error;
  }
};

/**
 * Generate a unique event ID
 * @returns {string} Event ID
 */
const generateEventId = () => {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const analyticsService = {
  logEvent,
  getEventsByUserId,
};
