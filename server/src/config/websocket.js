import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "./index.js";

/**
 * Configure and initialize the WebSocket server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
export const initializeWebSocketServer = (httpServer) => {
  // Create Socket.IO server with CORS configuration
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ["GET", "POST"],
      credentials: config.cors.credentials,
    },
    path: "/ws",
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);

      if (!decoded || !decoded.id) {
        return next(new Error("Invalid authentication token"));
      }

      // Attach user data to socket
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Handle connection
  io.on("connection", (socket) => {
    console.log(
      `WebSocket client connected: ${socket.id} (User: ${socket.user.id})`
    );

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(
        `WebSocket client disconnected: ${socket.id}, reason: ${reason}`
      );
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`WebSocket error for client ${socket.id}:`, error);
    });
  });

  return io;
};

/**
 * Initialize namespaces for different features
 * @param {Object} io - Socket.IO server instance
 * @returns {Object} Object containing all namespaces
 */
export const initializeNamespaces = (io) => {
  // Create tutor namespace
  const tutorNamespace = io.of("/tutor");

  // Create WebRTC namespace
  const webrtcNamespace = io.of("/webrtc");

  // Create Realtime Conversation namespace
  const realtimeNamespace = io.of("/realtime");

  // Authentication middleware function
  const authMiddleware = async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);

      if (!decoded || !decoded.id) {
        return next(new Error("Invalid authentication token"));
      }

      // Attach user data to socket
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.error("Socket namespace authentication error:", error);
      next(new Error("Authentication failed"));
    }
  };

  // Apply middleware to namespaces
  tutorNamespace.use(authMiddleware);
  webrtcNamespace.use(authMiddleware);
  realtimeNamespace.use(authMiddleware);

  return {
    tutorNamespace,
    webrtcNamespace,
    realtimeNamespace,
  };
};
