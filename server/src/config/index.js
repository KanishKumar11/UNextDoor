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

// Payment-related environment variables (required if payments are enabled)
const paymentEnvVars = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

try {
  // Validate required environment variables
  validateEnv(requiredEnvVars);

  // Validate payment environment variables if payments are enabled
  if (process.env.ENABLE_PAYMENTS === 'true') {
    try {
      validateEnv(paymentEnvVars);
      console.log('✅ Payment system enabled with valid credentials');
    } catch (error) {
      console.error('❌ Payment system is enabled but missing required credentials:');
      console.error(error.message);
      console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
      process.exit(1);
    }
  } else {
    console.log('ℹ️ Payment system is disabled');
  }

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
    service: process.env.EMAIL_SERVICE || "gmail",
    // host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "noreply@UNextDoor.co",
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

  // Payment configuration
  payments: {
    enabled: process.env.ENABLE_PAYMENTS === "true",
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },
  },

  // Google OAuth configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  // Feature flags
  features: {
    payments: process.env.ENABLE_PAYMENTS === "true",
    webhooks: process.env.ENABLE_WEBHOOKS === "true",
    featureGating: process.env.ENABLE_FEATURE_GATING === "true",
    subscriptionUpgrades: process.env.ENABLE_SUBSCRIPTION_UPGRADES === "true",
    proration: process.env.ENABLE_PRORATION === "true",
  },
};

export default config;
