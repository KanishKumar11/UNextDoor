/**
 * UNextDoor App Dark Theme
 * A comprehensive dark theme system based on UNextDoor brand guidelines
 */

import lightTheme from "./modernTheme";

// Color palette based on UNextDoor brand guidelines for dark mode
const colors = {
  // Primary colors - Green from brand guidelines (darker shades for dark mode)
  primary: {
    50: "#204311",
    100: "#34651A",
    200: "#478623",
    300: "#5BA82C",
    400: "#6FC935",
    500: "#8FD95F", // Main primary color (lighter for dark mode)
    600: "#A7DF85",
    700: "#BDE7A3",
    800: "#D3EFC2",
    900: "#E9F7E0",
  },

  // Secondary colors - Navy blue from brand guidelines (lighter shades for dark mode)
  secondary: {
    50: "#000A14",
    100: "#001429",
    200: "#001F3D",
    300: "#002952",
    400: "#003366",
    500: "#3385FF", // Main secondary color (lighter for dark mode)
    600: "#66A3FF",
    700: "#99C2FF",
    800: "#CCE0FF",
    900: "#E6F0FF",
  },

  // Tertiary colors - Black from brand guidelines (lighter shades for dark mode)
  tertiary: {
    50: "#000000",
    100: "#000000",
    200: "#000000",
    300: "#000000",
    400: "#000000",
    500: "#757575", // Main tertiary color (lighter for dark mode)
    600: "#9E9E9E",
    700: "#BDBDBD",
    800: "#E0E0E0",
    900: "#F5F5F5",
  },

  // Accent colors - Using primary green (darker shades for dark mode)
  accent: {
    50: "#204311",
    100: "#34651A",
    200: "#478623",
    300: "#5BA82C",
    400: "#6FC935",
    500: "#8FD95F", // Main accent color (same as primary)
    600: "#A7DF85",
    700: "#BDE7A3",
    800: "#D3EFC2",
    900: "#E9F7E0",
  },

  // Neutral colors
  neutral: {
    50: "#121212",
    100: "#1E1E1E",
    200: "#2C2C2C",
    300: "#3A3A3A",
    400: "#484848",
    500: "#5C5C5C",
    600: "#7A7A7A",
    700: "#989898",
    800: "#B6B6B6",
    900: "#D4D4D4",
  },

  // Semantic colors
  success: {
    light: "#478623",
    main: "#6FC935", // Using brand green for success
    dark: "#A7DF85",
  },

  warning: {
    light: "#78350F",
    main: "#F59E0B",
    dark: "#FDE68A",
  },

  error: {
    light: "#7F1D1D",
    main: "#EF4444",
    dark: "#FCA5A5",
  },

  info: {
    light: "#99C2FF",
    main: "#3385FF", // Using secondary navy blue for info
    dark: "#001F3D",
  },

  // Text colors
  text: {
    primary: "#FFFFFF",
    secondary: "#99C2FF", // Navy blue for secondary text
    tertiary: "#B6B6B6", // Gray for tertiary text
    disabled: "#5C5C5C",
    hint: "#7A7A7A",
    white: "#FFFFFF",
  },

  // Background colors
  background: {
    default: "#121212",
    paper: "#1E1E1E",
    card: "#2C2C2C",
    dark: "#000000",
  },

  // Divider color
  divider: "#003366", // Navy blue for dividers

  // Brand-specific colors
  brandGreen: "#6FC935", // Primary Green from brand guidelines
  brandNavy: "#3385FF", // Secondary Navy Blue from brand guidelines (lighter for dark mode)
  brandBlack: "#757575", // Tertiary Black from brand guidelines (lighter for dark mode)
  brandWhite: "#FFFFFF", // White from brand guidelines
};

// Create dark theme by extending the light theme
const darkTheme = {
  ...lightTheme,
  colors,
};

export default darkTheme;
