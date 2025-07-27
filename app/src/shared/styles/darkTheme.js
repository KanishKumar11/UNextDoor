/**
 * UNextDoor App Dark Theme
 * A comprehensive dark theme system based on UNextDoor brand guidelines
 */

import lightTheme from "./modernTheme";

// Miles-Inspired Color Palette for UNextDoor (Dark Mode)
const colors = {
  // Primary colors - Explorer Teal (darker shades for dark mode)
  primary: {
    50: "#132727",
    100: "#264E4A",
    200: "#38766D",
    300: "#4A9D90",
    400: "#5BC4B3",
    500: "#75D5C9", // Main primary color (lighter for dark mode)
    600: "#A3E3DB",
    700: "#D1F1ED",
    800: "#E8F8F6",
    900: "#F4FDFC",
  },

  // Secondary colors - Ocean Blue (lighter shades for dark mode)
  secondary: {
    50: "#0A181C",
    100: "#153137",
    200: "#204953",
    300: "#2B616E",
    400: "#36798A",
    500: "#4F97A7", // Main secondary color (lighter for dark mode)
    600: "#7BB1BD",
    700: "#A7CBD3",
    800: "#D3E5E9",
    900: "#E9F2F4",
  },

  // Tertiary colors - Shadow Grey (lighter shades for dark mode)
  tertiary: {
    50: "#0F0F0F",
    100: "#1F1F1F",
    200: "#2F2F2F",
    300: "#3F3F3F",
    400: "#4F4F4F",
    500: "#BFBFBF", // Main tertiary color (lighter for dark mode)
    600: "#CFCFCF",
    700: "#DFDFDF",
    800: "#EFEFEF",
    900: "#F7F7F7",
  },

  // Accent colors - Sky Aqua (darker shades for dark mode)
  accent: {
    50: "#212E2C",
    100: "#415D58",
    200: "#628B84",
    300: "#82BAB0",
    400: "#A3E8DC",
    500: "#BDF3ED", // Main accent color (lighter for dark mode)
    600: "#D3F7F3",
    700: "#E9FBF9",
    800: "#F4FDFC",
    900: "#FAFEFE",
  },

  // Neutral colors - Canvas Beige and darker tones
  neutral: {
    50: "#1A1A1A",
    100: "#2A2A2A",
    200: "#3A3A3A",
    300: "#4A4A4A",
    400: "#5A5A5A",
    500: "#6A6A6A",
    600: "#7A7A7A",
    700: "#8A8A8A",
    800: "#9A9A9A",
    900: "#AAAAAA",
  },

  // Semantic colors
  success: {
    light: "#BDF3ED", // Sky Aqua for light success
    main: "#75D5C9", // Explorer Teal for success (lighter for dark mode)
    dark: "#38766D",
  },

  warning: {
    light: "#E2C376", // Canvas Beige for light warning
    main: "#C5A454", // Rucksack Brown for warning (lighter for dark mode)
    dark: "#836B39",
  },

  error: {
    light: "#FFB3B3",
    main: "#FF8888",
    dark: "#CC5555",
  },

  info: {
    light: "#BDF3ED", // Sky Aqua for light info
    main: "#4F97A7", // Ocean Blue for info (lighter for dark mode)
    dark: "#204953",
  },

  // Text colors
  text: {
    primary: "#F7F7F7", // Light Shadow Grey for primary text
    secondary: "#A7CBD3", // Light Ocean Blue for secondary text
    tertiary: "#E2C376", // Light Rucksack Brown for tertiary text
    disabled: "#6A6A6A",
    hint: "#7A7A7A",
    white: "#FAFAFA", // Whisper White
  },

  // Background colors
  background: {
    default: "#1A1A1A", // Dark neutral background
    paper: "#2A2A2A", // Slightly lighter dark background
    card: "#3A3A3A", // Card background
    dark: "#0F0F0F", // Darkest background
  },

  // Divider color
  divider: "#4A4A4A", // Dark neutral for dividers

  // Miles-inspired brand colors (adjusted for dark mode)
  explorerTeal: "#75D5C9", // Primary brand highlight (lighter)
  skyAqua: "#BDF3ED", // Backgrounds, UI containers (lighter)
  oceanBlue: "#4F97A7", // Headings, text highlights (lighter)
  canvasBeige: "#E2C376", // Backgrounds, card elements (lighter)
  rucksackBrown: "#C5A454", // Borders, shadows, accents (lighter)
  shadowGrey: "#BFBFBF", // Text, outlines, icons (lighter)
  whisperWhite: "#FAFAFA", // Background base, UI space
};

// Create dark theme by extending the light theme
const darkTheme = {
  ...lightTheme,
  colors,
};

export default darkTheme;
