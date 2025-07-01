// Import socket.io-client directly - modern versions work with React Native
import { io } from "socket.io-client";
import { getAuthToken } from "../../utils/authUtils";
import { WS_BASE_URL, WS_CONFIG } from "../../config/api";

// WebSocket Service
// ================

// Socket instances
let mainSocket = null;
let tutorSocket = null;
let realtimeSocket = null;

/**
 * Initialize the main WebSocket connection
 * @returns {Promise<Object>} Socket.IO instance
 */
export const initializeMainSocket = async () => {
  try {
    if (mainSocket && mainSocket.connected) {
      return mainSocket;
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Initialize Socket.IO connection
    mainSocket = io(WS_BASE_URL, {
      ...WS_CONFIG,
      auth: { token },
    });

    // Set up event listeners
    mainSocket.on("connect", () => {
      console.log("Main WebSocket connected");
    });

    mainSocket.on("disconnect", (reason) => {
      console.log(`Main WebSocket disconnected: ${reason}`);
    });

    mainSocket.on("error", (error) => {
      console.error("Main WebSocket error:", error);
    });

    return mainSocket;
  } catch (error) {
    console.error("Error initializing main WebSocket:", error);
    throw error;
  }
};

/**
 * Initialize the tutor WebSocket connection
 * @returns {Promise<Object>} Socket.IO instance for tutor namespace
 */
export const initializeTutorSocket = async () => {
  try {
    if (tutorSocket && tutorSocket.connected) {
      return tutorSocket;
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication token is required");
    }

    // Initialize Socket.IO connection for tutor namespace
    tutorSocket = io(`${WS_BASE_URL}/tutor`, {
      ...WS_CONFIG,
      auth: { token },
    });

    // Set up event listeners
    tutorSocket.on("connect", () => {
      console.log("Tutor WebSocket connected");
    });

    tutorSocket.on("disconnect", (reason) => {
      console.log(`Tutor WebSocket disconnected: ${reason}`);
    });

    tutorSocket.on("error", (error) => {
      console.error("Tutor WebSocket error:", error);
    });

    return tutorSocket;
  } catch (error) {
    console.error("Error initializing tutor WebSocket:", error);
    throw error;
  }
};

/**
 * Get the tutor WebSocket instance
 * @returns {Object|null} Socket.IO instance for tutor namespace
 */
export const getTutorSocket = () => {
  return tutorSocket;
};

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
 * Disconnect all WebSocket connections
 */
export const disconnectAllSockets = () => {
  if (mainSocket) {
    mainSocket.disconnect();
    mainSocket = null;
  }

  if (tutorSocket) {
    tutorSocket.disconnect();
    tutorSocket = null;
  }

  if (realtimeSocket) {
    realtimeSocket.disconnect();
    realtimeSocket = null;
  }
};

/**
 * Reconnect all WebSocket connections
 * @returns {Promise<void>}
 */
export const reconnectAllSockets = async () => {
  disconnectAllSockets();
  await initializeMainSocket();
  await initializeTutorSocket();
};
