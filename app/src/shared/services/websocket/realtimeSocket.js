/**
 * Realtime Socket Service
 * Handles WebSocket connections for real-time conversations
 */
import { io } from "socket.io-client";
import { getAuthToken } from "../../utils/authUtils";
import { WS_BASE_URL, WS_CONFIG } from "../../config/api";

// Socket instance
let realtimeSocket = null;

/**
 * Initialize the realtime WebSocket connection
 * @returns {Promise<Object>} Socket.IO instance for realtime namespace
 */
export const initializeRealtimeSocket = async () => {
  try {
    if (realtimeSocket && realtimeSocket.connected) {
      return realtimeSocket;
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Initialize Socket.IO connection for realtime namespace
    realtimeSocket = io(`${WS_BASE_URL}/realtime`, {
      ...WS_CONFIG,
      auth: { token },
    });

    // Set up event listeners
    realtimeSocket.on("connect", () => {
      console.log("Realtime WebSocket connected");
    });

    realtimeSocket.on("disconnect", (reason) => {
      console.log(`Realtime WebSocket disconnected: ${reason}`);
    });

    realtimeSocket.on("error", (error) => {
      console.error("Realtime WebSocket error:", error);
    });

    return realtimeSocket;
  } catch (error) {
    console.error("Error initializing realtime WebSocket:", error);
    throw error;
  }
};

/**
 * Get the realtime WebSocket instance
 * @returns {Object|null} Socket.IO instance for realtime namespace
 */
export const getRealtimeSocket = () => {
  return realtimeSocket;
};

/**
 * Disconnect the realtime WebSocket
 */
export const disconnectRealtimeSocket = () => {
  if (realtimeSocket) {
    realtimeSocket.disconnect();
    realtimeSocket = null;
  }
};

/**
 * Reconnect the realtime WebSocket
 * @returns {Promise<Object>} Socket.IO instance
 */
export const reconnectRealtimeSocket = async () => {
  disconnectRealtimeSocket();
  return initializeRealtimeSocket();
};

/**
 * Check if the realtime WebSocket is connected
 * @returns {boolean} Connection status
 */
export const isRealtimeSocketConnected = () => {
  return realtimeSocket && realtimeSocket.connected;
};

/**
 * Add event listener to the realtime WebSocket
 * @param {string} event - Event name
 * @param {Function} callback - Event callback
 */
export const addRealtimeSocketListener = (event, callback) => {
  if (realtimeSocket) {
    realtimeSocket.on(event, callback);
  }
};

/**
 * Remove event listener from the realtime WebSocket
 * @param {string} event - Event name
 * @param {Function} callback - Event callback
 */
export const removeRealtimeSocketListener = (event, callback) => {
  if (realtimeSocket) {
    realtimeSocket.off(event, callback);
  }
};

/**
 * Emit event to the realtime WebSocket
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitRealtimeSocketEvent = (event, data) => {
  if (realtimeSocket && realtimeSocket.connected) {
    realtimeSocket.emit(event, data);
  } else {
    console.error("Realtime WebSocket not connected");
  }
};

export default {
  initializeRealtimeSocket,
  getRealtimeSocket,
  disconnectRealtimeSocket,
  reconnectRealtimeSocket,
  isRealtimeSocketConnected,
  addRealtimeSocketListener,
  removeRealtimeSocketListener,
  emitRealtimeSocketEvent,
};
