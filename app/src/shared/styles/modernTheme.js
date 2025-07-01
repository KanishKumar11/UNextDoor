/**
 * Modern Theme Configuration
 * A comprehensive theme with modern colors, typography, and spacing
 * Based on UNextDoor brand guidelines
 *
 * Brand Colors:
 * - Primary Green: C59 M0 Y100 K0 / R111 G201 B53 (#6FC935)
 * - Secondary Navy Blue: C100 M80 Y0 K20 / R0 G51 B102 (#003366)
 * - Tertiary Black: C0 M0 Y0 K100 / R0 G0 B0 (#000000)
 * - White: #FFFFFF
 * - Font: Montserrat (Light, Regular, Medium, SemiBold, Bold, ExtraBold)
 */

import { FONTS } from "../utils/fontUtils";
import { Dimensions } from "react-native";
import { getBreakpoints } from "../utils/webConfig";
import { responsiveTypography } from "../utils/responsiveFonts";

// Color palette based on UNextDoor brand guidelines
const colors = {
  // Primary colors - Green from brand guidelines
  primary: {
    50: "#E9F7E0",
    100: "#D3EFC2",
    200: "#BDE7A3",
    300: "#A7DF85",
    400: "#91D766",
    500: "#6FC935", // Main primary color - C59 M0 Y100 K0 / R111 G201 B53
    600: "#5BA82C",
    700: "#478623",
    800: "#34651A",
    900: "#204311",
  },

  // Secondary colors - Navy Blue from brand guidelines (C100 M80 Y0 K20)
  secondary: {
    50: "#E6F0FF",
    100: "#CCE0FF",
    200: "#99C2FF",
    300: "#66A3FF",
    400: "#3385FF",
    500: "#003366", // Main secondary color - Navy Blue from brand guidelines
    600: "#002952",
    700: "#001F3D",
    800: "#001429",
    900: "#000A14",
  },

  // Tertiary colors - Black from brand guidelines (C0 M0 Y0 K100)
  tertiary: {
    50: "#F5F5F5",
    100: "#E0E0E0",
    200: "#BDBDBD",
    300: "#9E9E9E",
    400: "#757575",
    500: "#000000", // Main tertiary color - Black from brand guidelines
    600: "#000000",
    700: "#000000",
    800: "#000000",
    900: "#000000",
  },

  // Accent colors - Using primary green
  accent: {
    50: "#E9F7E0",
    100: "#D3EFC2",
    200: "#BDE7A3",
    300: "#A7DF85",
    400: "#91D766",
    500: "#6FC935", // Main accent color - Same as primary
    600: "#5BA82C",
    700: "#478623",
    800: "#34651A",
    900: "#204311",
  },

  // Neutral colors
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // Semantic colors
  success: {
    light: "#A7DF85",
    main: "#6FC935", // Using brand green for success
    dark: "#5BA82C",
  },

  warning: {
    light: "#FFB74D",
    main: "#FF9800",
    dark: "#F57C00",
  },

  error: {
    light: "#E57373",
    main: "#F44336",
    dark: "#D32F2F",
  },

  info: {
    light: "#99C2FF",
    main: "#003366", // Using secondary navy blue for info
    dark: "#001F3D",
  },

  // Text colors
  text: {
    primary: "#000000", // Black text from brand guidelines
    secondary: "#003366", // Navy blue for secondary text
    tertiary: "#757575", // Gray for tertiary text
    disabled: "#9E9E9E",
    hint: "#9E9E9E",
    white: "#FFFFFF",
  },

  // Background colors
  background: {
    default: "#FFFFFF", // White background from brand guidelines
    paper: "#FFFFFF",
    card: "#F8F9FA",
    dark: "#003366", // Navy blue for dark backgrounds
  },

  // Divider color
  divider: "#E0E0E0", // Light gray for dividers

  // Brand-specific colors
  brandGreen: "#6FC935", // Primary Green from brand guidelines
  brandNavy: "#003366", // Secondary Navy Blue from brand guidelines
  brandBlack: "#000000", // Tertiary Black from brand guidelines
  brandWhite: "#FFFFFF", // White from brand guidelines
};

// Typography scale with proper hierarchy - Using Montserrat from brand guidelines
const typography = {
  fontFamily: {
    primary: FONTS.MONTSERRAT_REGULAR,
    secondary: FONTS.MONTSERRAT_REGULAR,
    light: FONTS.MONTSERRAT_LIGHT,
    regular: FONTS.MONTSERRAT_REGULAR,
    medium: FONTS.MONTSERRAT_MEDIUM,
    semibold: FONTS.MONTSERRAT_SEMIBOLD,
    bold: FONTS.MONTSERRAT_BOLD,
    extrabold: FONTS.MONTSERRAT_EXTRABOLD,
    italic: FONTS.MONTSERRAT_ITALIC,
  },

  // Responsive font sizes that scale with device size
  fontSize: responsiveTypography.fontSize,

  fontWeight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  lineHeight: {
    xs: 1.2,
    sm: 1.4,
    md: 1.5,
    lg: 1.8,
    xl: 2,
  },

  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
};

// Spacing scale for consistent layout
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 80,
};

// Border radius scale
const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

// Shadows for elevation - Using navy blue for branded shadows
const shadows = {
  none: "none",
  xs: {
    shadowColor: "#003366", // Navy blue shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: "#003366", // Navy blue shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#003366", // Navy blue shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#003366", // Navy blue shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  xl: {
    shadowColor: "#003366", // Navy blue shadow
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  "2xl": {
    shadowColor: "#003366", // Navy blue shadow
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
};

// Animation timing
const animation = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  timing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// Z-index scale
const zIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1700,
  tooltip: 1800,
};

// Screen dimensions - Web compatible
const getScreenDimensions = () => {
  try {
    const { width, height } = Dimensions.get("window");
    return {
      width,
      height,
      isSmall: width < 375,
      isMedium: width >= 375 && width < 768,
      isLarge: width >= 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
    };
  } catch (error) {
    // Fallback for web or when Dimensions is not available
    const width = typeof window !== "undefined" ? window.innerWidth : 375;
    const height = typeof window !== "undefined" ? window.innerHeight : 667;
    return {
      width,
      height,
      isSmall: width < 375,
      isMedium: width >= 375 && width < 768,
      isLarge: width >= 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
    };
  }
};

// Use web-compatible screen dimensions
const screen = (() => {
  try {
    return getScreenDimensions();
  } catch (error) {
    // Additional fallback using web config if available
    try {
      return getBreakpoints();
    } catch (webError) {
      // Final fallback
      return {
        width: 375,
        height: 667,
        isSmall: false,
        isMedium: true,
        isLarge: false,
        isTablet: false,
        isDesktop: false,
      };
    }
  }
})();

// Export the complete theme
const modernTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  zIndex,
  screen,
};

export default modernTheme;
