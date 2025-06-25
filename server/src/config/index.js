import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 * @param {string[]} required - List of required environment variables
 * @throws {Error} If any required environment variable is missing
 */
const validateEnv = (required) => {
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

// Define required environment variables
const requiredEnvVars = ["JWT_SECRET", "MONGODB_URI", "OPENAI_API_KEY"];

// Optional but recommended environment variables
const recommendedEnvVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "VAPI_API_KEY",
];

try {
  // Validate required environment variables
  validateEnv(requiredEnvVars);

  // Check for recommended environment variables
  const missingRecommended = recommendedEnvVars.filter(
    (name) => !process.env[name]
  );
  if (missingRecommended.length > 0) {
    console.warn(
      `Warning: Missing recommended environment variables: ${missingRecommended.join(
        ", "
      )}`
    );
  }
} catch (error) {
  console.error(`Environment validation error: ${error.message}`);
  process.exit(1); // Exit with failure
}

const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "5001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  // Database configuration
  db: {
    uri: process.env.MONGODB_URI,
    options: {
      // Removed deprecated options: useNewUrlParser and useUnifiedTopology
      // These are no longer needed in MongoDB driver v4.0.0+
    },
  },

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "noreply@UNextDoor.app",
  },

  // OTP configuration
  otp: {
    expiryTime: parseInt(process.env.OTP_EXPIRY_TIME || "300000", 10), // 5 minutes in milliseconds
    length: parseInt(process.env.OTP_LENGTH || "6", 10),
  },

  // API configuration
  api: {
    prefix: process.env.API_PREFIX || "/api",
    version: process.env.API_VERSION || "v1",
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: process.env.CORS_CREDENTIALS === "true",
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },

  // WebSocket configuration
  websocket: {
    path: process.env.WEBSOCKET_PATH || "/ws",
    pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL || "25000", 10),
    pingTimeout: parseInt(process.env.WEBSOCKET_PING_TIMEOUT || "5000", 10),
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o",
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "500", 10),
  },

  // Vapi configuration
  vapi: {
    apiKey: process.env.VAPI_API_KEY,
    assistantId: process.env.VAPI_ASSISTANT_ID,
  },
};

export default config;
