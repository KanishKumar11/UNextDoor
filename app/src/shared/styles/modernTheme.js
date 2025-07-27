/**
 * Modern Theme Configuration
 * A comprehensive theme with Miles-inspired colors, typography, and spacing
 * Based on UNextDoor brand guidelines and Miles mascot character
 *
 * Miles-Inspired Brand Colors:
 * - Explorer Teal: #5BC4B3 (Primary brand highlight, app accents, key buttons)
 * - Sky Aqua: #A3E8DC (Backgrounds, UI containers, hover effects)
 * - Ocean Blue: #36798A (Headings, text highlights, overlays)
 * - Rucksack Brown: #A46E3E (Borders, shadows, accent details)
 * - Shadow Grey: #4F4F4F (Text, outlines, icons)
 * - Whisper White: #FAFAFA (Background base, UI space, feed balance)
 * - Font: Montserrat (Light, Regular, Medium, SemiBold, Bold, ExtraBold)
 */

import { FONTS } from "../utils/fontUtils";
import { Dimensions } from "react-native";
import {
  BRAND_COLORS,
  NEUTRAL_COLORS,
  SEMANTIC_COLORS,
  BACKGROUND_COLORS,
  TEXT_COLORS,
  BORDER_COLORS
} from "../constants/colors";
import { getBreakpoints } from "../utils/webConfig";
import { responsiveTypography } from "../utils/responsiveFonts";

// Miles-Inspired Color Palette for UNextDoor
const colors = {
  // Primary colors - Explorer Teal
  primary: {
    50: "#E8F8F6",
    100: "#D1F1ED",
    200: "#A3E3DB",
    300: "#75D5C9",
    400: "#47C7B7",
    500: BRAND_COLORS.EXPLORER_TEAL, // Main primary color - Explorer Teal
    600: "#4A9D90",
    700: "#38766D",
    800: "#264E4A",
    900: "#132727",
  },

  // Secondary colors - Ocean Blue
  secondary: {
    50: "#E9F2F4",
    100: "#D3E5E9",
    200: "#A7CBD3",
    300: "#7BB1BD",
    400: "#4F97A7",
    500: BRAND_COLORS.OCEAN_BLUE, // Main secondary color - Ocean Blue
    600: "#2B616E",
    700: "#204953",
    800: "#153137",
    900: "#0A181C",
  },

  // Tertiary colors - Shadow Grey
  tertiary: {
    50: "#F7F7F7",
    100: "#EFEFEF",
    200: "#DFDFDF",
    300: "#CFCFCF",
    400: "#BFBFBF",
    500: BRAND_COLORS.SHADOW_GREY, // Main tertiary color - Shadow Grey
    600: "#3F3F3F",
    700: "#2F2F2F",
    800: "#1F1F1F",
    900: "#0F0F0F",
  },

  // Accent colors - Sky Aqua
  accent: {
    50: "#F4FDFC",
    100: "#E9FBF9",
    200: "#D3F7F3",
    300: "#BDF3ED",
    400: "#A7EFE7",
    500: BRAND_COLORS.SKY_AQUA, // Main accent color - Sky Aqua
    600: "#82BAB0",
    700: "#628B84",
    800: "#415D58",
    900: "#212E2C",
  },

  // Neutral colors - Using constants
  neutral: NEUTRAL_COLORS,

  // Semantic colors - Using constants
  success: {
    light: BRAND_COLORS.SKY_AQUA,
    main: SEMANTIC_COLORS.SUCCESS,
    dark: "#38766D",
  },

  warning: {
    light: BRAND_COLORS.CARD_BACKGROUND + "20",
    main: SEMANTIC_COLORS.WARNING,
    dark: "#836B39",
  },

  error: {
    light: "#FFB3B3",
    main: SEMANTIC_COLORS.ERROR,
    dark: "#E55555",
  },

  info: {
    light: BRAND_COLORS.SKY_AQUA,
    main: SEMANTIC_COLORS.INFO,
    dark: "#204953",
  },

  // Text colors - Using constants
  text: {
    primary: TEXT_COLORS.PRIMARY,
    secondary: TEXT_COLORS.SECONDARY,
    tertiary: TEXT_COLORS.TERTIARY,
    disabled: TEXT_COLORS.DISABLED,
    hint: TEXT_COLORS.DISABLED,
    white: TEXT_COLORS.WHITE,
  },

  // Background colors - Using constants
  background: BACKGROUND_COLORS,

  // Divider color
  divider: BORDER_COLORS.LIGHT,

  // Miles-inspired brand colors - Using constants
  explorerTeal: BRAND_COLORS.EXPLORER_TEAL,
  skyAqua: BRAND_COLORS.SKY_AQUA,
  oceanBlue: BRAND_COLORS.OCEAN_BLUE,
  cardBackground: BRAND_COLORS.CARD_BACKGROUND, // Your new coral red color
  rucksackBrown: BRAND_COLORS.RUCKSACK_BROWN,
  shadowGrey: BRAND_COLORS.SHADOW_GREY,
  whisperWhite: BRAND_COLORS.WHISPER_WHITE,
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

// Shadows for elevation - Using ocean blue for branded shadows with elevation 0
const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0,
  },
  sm: {
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0,
  },
  md: {
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
  },
  lg: {
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 0,
  },
  xl: {
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 0,
  },
  "2xl": {
    shadowColor: BRAND_COLORS.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 0,
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
