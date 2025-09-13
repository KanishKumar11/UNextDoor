/**
 * API Configuration
 * Centralized configuration for API and WebSocket services
 */
// Import Platform safely with a try-catch to handle Hermes engine issues
let Platform;
try {
  Platform = require("react-native").Platform;
} catch (error) {
  // Create a fallback Platform object if the import fails
  Platform = { OS: "mobile" };
}

// Environment detection
const isDev = __DEV__;

// Fetch production API URLs from environment variables if available
const PROD_HTTP = process.env.EXPO_PUBLIC_API_HTTP || "https://api.unextdoor.co/api/v1";
const PROD_WS = process.env.EXPO_PUBLIC_API_WS || "wss://api.unextdoor.co/api/v1";

const CONFIG = {
  production: {
    http: PROD_HTTP,
    ws: PROD_WS,
  },
  development: {
    web: {
      http: "http://192.168.1.4:5001/api/v1",
      ws: "ws://localhost:5001",
    },
    mobile: {
      http: "http://192.168.1.4:5001/api/v1", // Android emulator localhost
      ws: "ws://10.0.2.2:5001",
    },
  },
};

// Determine the appropriate configuration based on environment and platform
const getConfig = () => {
  if (isDev) {
    // Default to mobile config if Platform is not available
    return Platform && Platform.OS === "web"
      ? CONFIG.development.web
      : CONFIG.development.mobile;
  }
  return {
    http: CONFIG.production.http,
    ws: CONFIG.production.ws,
  };
};

// Export the configuration
const currentConfig = getConfig();

export const API_BASE_URL = currentConfig.http;
export const WS_BASE_URL = currentConfig.ws;

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    CHECK_EMAIL: "/auth/check-email",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh-token",
    GOOGLE_AUTH: "/auth/google",
    APPLE_AUTH: "/auth/apple",
    PROFILE: "/auth/profile",
    LOGOUT: "/auth/logout",
  },
  TUTOR: {
    SCENARIOS: "/tutor/scenarios",
    CONVERSATION: "/tutor/conversation",
    CONVERSATIONS: "/tutor/conversations",
    SPEECH_RECOGNIZE: "/tutor/speech/recognize",
    SPEECH_SYNTHESIZE: "/tutor/speech/synthesize",
    ANALYZE_GRAMMAR: "/tutor/analyze-grammar",
    GRAMMAR_RULES: "/tutor/grammar-rules",
    ANALYZE_VOCABULARY: "/tutor/analyze-vocabulary",
    VOCABULARY_LEVEL: "/tutor/vocabulary-level",
    VOCABULARY_CATEGORIES: "/tutor/vocabulary-categories",
    ANALYZE_PRONUNCIATION: "/tutor/analyze-pronunciation",
    PRONUNCIATION_CHALLENGES: "/tutor/pronunciation-challenges",
    PROGRESS: "/tutor/progress",
    PRACTICE_SESSION: "/tutor/practice-session",
  },
  ACHIEVEMENTS: {
    LIST: "/achievements",
    USER: "/achievements/user",
    UNVIEWED: "/achievements/unviewed",
    MARK_VIEWED: "/achievements/mark-viewed",
    CHECK: "/achievements/check",
    INITIALIZE: "/achievements/initialize",
  },
  CURRICULUM: {
    LEVELS: "/curriculum/levels",
    MODULES: "/curriculum/modules",
    LESSONS: "/curriculum/lessons",
    PROGRESS: "/curriculum/progress",
  },
  GAMES: {
    LIST: "/games",
    RESULTS: "/games/results",
    LEADERBOARD: "/games/leaderboard",
    PROGRESS: "/games/progress",
  },
  XP: {
    AWARD_LESSON: "/xp/lesson",
    AWARD_GAME: "/xp/game",
    AWARD_PRACTICE: "/xp/practice",
    AWARD_DAILY: "/xp/daily",
    SUMMARY: "/xp/summary",
  },
  SUBSCRIPTIONS: {
    PLANS: "/subscriptions/plans",
    CURRENT: "/subscriptions/current",
    CREATE_ORDER: "/subscriptions/create-order",
    VERIFY_PAYMENT: "/subscriptions/verify-payment",
    UPGRADE_PREVIEW: "/subscriptions/upgrade-preview",
    CANCEL: "/subscriptions/cancel",
    REACTIVATE: "/subscriptions/reactivate",
    TRANSACTIONS: "/subscriptions/transactions",
    BILLING_DETAILS: "/subscriptions/billing-details",
    AUTO_RENEWAL: "/subscriptions/auto-renewal",
  },
};

// HTTP Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// WebSocket Configuration
export const WS_CONFIG = {
  path: "/ws",
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};

// Export default configuration object
export default {
  API_BASE_URL,
  WS_BASE_URL,
  ENDPOINTS,
  STATUS_CODES,
  WS_CONFIG,
  isDev,
};
