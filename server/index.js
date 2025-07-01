import express from "express";
import cors from "cors";
import http from "http";
import config from "./src/config/index.js";
import { connectDatabase, isDatabaseConnected } from "./src/config/database.js";
import {
  initializeWebSocketServer,
  initializeNamespaces,
} from "./src/config/websocket.js";
import { initializeTutorSocketHandlers } from "./src/services/websocket/tutorSocketService.js";
import { initializeWebRTCSocketHandlers } from "./src/services/websocket/webrtcSocketService.js";
import { initAITutorSocketHandlers } from "./src/services/websocket/aiTutorSocketService.js";
import { initializeRealtimeConversationHandlers } from "./src/services/websocket/realtimeConversationService.js";
import authRoutes from "./src/routes/auth.js";
import tutorRoutes from "./src/routes/tutor.js";
import achievementRoutes from "./src/routes/achievement.js";
import openaiRoutes from "./src/routes/openai.js";
import curriculumRoutes from "./src/routes/curriculum.js";
import gamesRoutes from "./src/routes/games.js";
import vocabularyRoutes from "./src/routes/vocabulary.js";
import levelRoutes from "./src/routes/level.js";
import xpRoutes from "./src/routes/xp.js";
import subscriptionRoutes from "./src/routes/subscription.js";
import webhookRoutes from "./src/routes/webhook.js";
import featureRoutes from "./src/routes/feature.js";
import paymentRecoveryService from "./src/services/paymentRecoveryService.js";
import { sendSuccess, sendError } from "./src/utils/responseUtils.js";

/**
 * Initialize Express application with middleware and routes
 * @returns {express.Application} Express application
 */
const initializeApp = () => {
  // Create Express app
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  // Apply middleware
  app.use(cors(corsOptions));

  // Standard body parsers
  app.use(
    express.json({
      verify: (req, res, buf) => {
        // Store the raw body for debugging
        req.rawBody = buf.toString();
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  // Debug middleware to log request body
  app.use((req, res, next) => {
    if (req.path.includes("/auth/register")) {
      console.log("DEBUG - Register request:");
      console.log("Headers:", JSON.stringify(req.headers));
      console.log("Raw body:", req.rawBody);
      console.log("Parsed body:", req.body);
    }
    next();
  });

  // Serve static files from uploads directory
  app.use("/uploads", express.static("uploads"));

  // Request logger middleware
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Health check route
  app.get("/health", (_req, res) => {
    const dbConnected = isDatabaseConnected();

    if (dbConnected) {
      return sendSuccess(res, 200, "Service is healthy", {
        status: "UP",
        database: "Connected",
        timestamp: new Date().toISOString(),
      });
    }

    return sendError(res, 503, "Service is unhealthy", {
      status: "DOWN",
      database: "Disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  const apiPrefix = `${config.api.prefix}/${config.api.version}`;
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/tutor`, tutorRoutes);
  app.use(`${apiPrefix}/openai`, openaiRoutes);
  app.use(`${apiPrefix}/curriculum`, curriculumRoutes);
  app.use(`${apiPrefix}/games`, gamesRoutes);
  app.use(`${apiPrefix}/vocabulary`, vocabularyRoutes);
  app.use(`${apiPrefix}/levels`, levelRoutes);
  app.use(`${apiPrefix}/xp`, xpRoutes);
  app.use(`${apiPrefix}/achievements`, achievementRoutes);
  app.use(`${apiPrefix}/subscriptions`, subscriptionRoutes);
  app.use(`${apiPrefix}/webhooks`, webhookRoutes);
  app.use(`${apiPrefix}/features`, featureRoutes);

  // Root route
  app.get("/", (_req, res) => {
    sendSuccess(res, 200, `Welcome to UNextDoor API (${config.api.version})`);
  });

  // 404 handler
  app.use((_req, res) => {
    sendError(res, 404, "Route not found");
  });

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error("Server error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    sendError(res, statusCode, message, {
      stack: config.nodeEnv === "development" ? err.stack : undefined,
    });
  });

  return app;
};

/**
 * Start the server
 * @param {express.Application} app - Express application
 * @returns {Promise<void>}
 */
const startServer = async (app) => {
  try {
    // Connect to database
    await connectDatabase();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket server
    const io = initializeWebSocketServer(server);

    // Initialize namespaces
    const { tutorNamespace, webrtcNamespace, realtimeNamespace } =
      initializeNamespaces(io);

    // Initialize WebSocket handlers
    initializeTutorSocketHandlers(tutorNamespace);
    initializeWebRTCSocketHandlers(webrtcNamespace);
    initAITutorSocketHandlers(tutorNamespace);
    initializeRealtimeConversationHandlers(realtimeNamespace);

    // Start payment recovery service
    paymentRecoveryService.start();

    // Start server
    server.listen(config.port, () => {
      console.log(
        `Server running in ${config.nodeEnv} mode on port ${config.port}`
      );
      console.log(
        `API available at: http://localhost:${config.port}${config.api.prefix}/${config.api.version}`
      );
      console.log(
        `WebSocket server available at: ws://localhost:${config.port}/ws`
      );
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("Shutting down server...");
      server.close(() => {
        console.log("Server shut down successfully");
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Initialize and start the server
const app = initializeApp();
startServer(app).catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
