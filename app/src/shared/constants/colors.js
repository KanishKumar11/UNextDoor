/**
 * Centralized Color Constants
 * ALL COLORS used throughout the app MUST be defined here
 * NO hardcoded colors should exist anywhere else in the codebase
 * This makes it easy to change colors globally by updating them in one place
 */

// Miles-Inspired Brand Colors
export const BRAND_COLORS = {
  // Primary brand colors
  EXPLORER_TEAL: "#5BC4B3",
  SKY_AQUA: "#A3E8DC",
  OCEAN_BLUE: "#36798A",
  RUCKSACK_BROWN: "#A46E3E",
  SHADOW_GREY: "#4F4F4F",
  WHISPER_WHITE: "#FAFAFA",

  // Card background color - easy to change in one place
  CARD_BACKGROUND: "#FAFAFA", // Main background for all cards and containers

  // Extended palette for achievement categories (complementary colors)
  WARM_CORAL: "#FF8A80", // For social/communication achievements
  GOLDEN_AMBER: "#FFB74D", // For special/rare achievements
  DEEP_PURPLE: "#7986CB", // For advanced/mastery achievements
  FOREST_GREEN: "#81C784", // For progress/growth achievements
  SUNSET_ORANGE: "#FFB74D", // For time-based achievements
  ROYAL_BLUE: "#64B5F6", // For skill-based achievements
};

// Common UI Colors - REPLACE ALL HARDCODED COLORS WITH THESE
export const UI_COLORS = {
  // Pure colors
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TRANSPARENT: "transparent",

  // Common hardcoded colors found in app - CENTRALIZE THEM HERE
  LIGHT_GREEN: "#6FC935", // Old brand green - REPLACE WITH BRAND_COLORS.EXPLORER_TEAL
  LIGHT_GREEN_53: "#6FC953", // Variant found in code
  NAVY_BLUE: "#003366", // Old brand navy
  LIGHT_BLUE: "#3498DB",
  PURPLE: "#9B59B6",
  ORANGE: "#FF6B35",
  GOLD: "#FFD700",
  RED: "#E74C3C",
  RED_57: "#FF5757", // Variant found in code
  GREY_999: "#999999", // Common grey
  GREY_666: "#666666", // Common grey
  GREY_333: "#333333", // Common grey

  // Background overlays - COMMONLY USED RGBA VALUES
  WHITE_95: "rgba(255, 255, 255, 0.95)",
  WHITE_90: "rgba(255, 255, 255, 0.9)",
  WHITE_85: "rgba(255, 255, 255, 0.85)",
  WHITE_20: "rgba(255, 255, 255, 0.2)",
  WHITE_15: "rgba(255, 255, 255, 0.15)",
  BLACK_60: "rgba(0, 0, 0, 0.6)",
  BLACK_50: "rgba(0, 0, 0, 0.5)",
  BLACK_30: "rgba(0, 0, 0, 0.3)",
  BLACK_10: "rgba(0, 0, 0, 0.1)",
  DARK_30: "rgba(30, 30, 30, 0.85)",

  // Success/Error colors with transparency
  GREEN_LIGHT: "rgba(111, 201, 53, 0.05)",
  GREEN_MEDIUM: "rgba(111, 201, 83, 0.2)",
  GREEN_BORDER: "rgba(111, 201, 83, 0.1)",
};

// Neutral Colors
export const NEUTRAL_COLORS = {
  50: "#FAFAFA",
  100: "#F8F9FA",
  200: "#E9ECEF",
  300: "#DEE2E6",
  400: "#CED4DA",
  500: "#ADB5BD",
  600: "#6C757D",
  700: "#495057",
  800: "#343A40",
  900: "#212529",
};

// Semantic Colors
export const SEMANTIC_COLORS = {
  SUCCESS: BRAND_COLORS.EXPLORER_TEAL,
  WARNING: BRAND_COLORS.RUCKSACK_BROWN,
  ERROR: "#FF6B6B",
  INFO: BRAND_COLORS.OCEAN_BLUE,
};

// Background Colors
export const BACKGROUND_COLORS = {
  DEFAULT: BRAND_COLORS.WHISPER_WHITE,
  PAPER: BRAND_COLORS.WHISPER_WHITE,
  CARD: BRAND_COLORS.CARD_BACKGROUND,
  DARK: BRAND_COLORS.OCEAN_BLUE,
};

// Text Colors
export const TEXT_COLORS = {
  PRIMARY: BRAND_COLORS.SHADOW_GREY,
  SECONDARY: BRAND_COLORS.OCEAN_BLUE,
  TERTIARY: BRAND_COLORS.RUCKSACK_BROWN,
  WHITE: BRAND_COLORS.WHISPER_WHITE,
  DISABLED: NEUTRAL_COLORS[400],
};

// Border Colors
export const BORDER_COLORS = {
  LIGHT: NEUTRAL_COLORS[200],
  MEDIUM: NEUTRAL_COLORS[300],
  DARK: BRAND_COLORS.SHADOW_GREY + "30",
  ACCENT: BRAND_COLORS.EXPLORER_TEAL + "40",
};

// Shadow Colors
export const SHADOW_COLORS = {
  DEFAULT: BRAND_COLORS.SHADOW_GREY,
  LIGHT: NEUTRAL_COLORS[300],
};
