import { Dimensions, PixelRatio } from 'react-native';

/**
 * Responsive Font Scaling Utility
 * Automatically scales font sizes based on screen dimensions
 * Ensures consistent readability across all device sizes
 */

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale font size based on screen width
 * @param {number} size - Base font size
 * @returns {number} Scaled font size
 */
export const scaleFont = (size) => {
  // Calculate scale factor based on screen width
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  
  // Apply scaling with limits to prevent extreme sizes
  const newSize = size * scale;
  
  // Set minimum and maximum scale factors
  const minScale = 0.85; // Don't go below 85% of original
  const maxScale = 1.25; // Don't go above 125% of original
  
  const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
  const scaledSize = size * clampedScale;
  
  // Use PixelRatio to ensure crisp text rendering
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * Get device category for more precise scaling
 * @returns {string} Device category
 */
export const getDeviceCategory = () => {
  const pixelDensity = PixelRatio.get();
  
  if (SCREEN_WIDTH < 350) {
    return 'small'; // iPhone SE, small Android phones
  } else if (SCREEN_WIDTH < 400) {
    return 'medium'; // iPhone 12 mini, standard phones
  } else if (SCREEN_WIDTH < 450) {
    return 'large'; // iPhone 12 Pro Max, large phones
  } else {
    return 'tablet'; // iPads, Android tablets
  }
};

/**
 * Advanced font scaling with device-specific adjustments
 * @param {number} size - Base font size
 * @param {Object} options - Scaling options
 * @returns {number} Scaled font size
 */
export const responsiveFont = (size, options = {}) => {
  const {
    minSize = size * 0.8,
    maxSize = size * 1.3,
    factor = 1,
  } = options;
  
  const deviceCategory = getDeviceCategory();
  
  // Device-specific scaling factors
  const deviceScales = {
    small: 0.9,   // Slightly smaller for small screens
    medium: 1.0,  // Base scale for medium screens
    large: 1.05,  // Slightly larger for large screens
    tablet: 1.1,  // Larger for tablets
  };
  
  const deviceScale = deviceScales[deviceCategory] || 1.0;
  const scaledSize = scaleFont(size * deviceScale * factor);
  
  // Clamp to min/max values
  return Math.max(minSize, Math.min(maxSize, scaledSize));
};

/**
 * Responsive typography scale
 * Pre-calculated responsive font sizes for common use cases
 */
export const responsiveTypography = {
  fontSize: {
    xs: responsiveFont(12, { minSize: 10, maxSize: 14 }),
    sm: responsiveFont(14, { minSize: 12, maxSize: 16 }),
    md: responsiveFont(16, { minSize: 14, maxSize: 18 }),
    lg: responsiveFont(18, { minSize: 16, maxSize: 20 }),
    xl: responsiveFont(20, { minSize: 18, maxSize: 22 }),
    '2xl': responsiveFont(24, { minSize: 20, maxSize: 28 }),
    '3xl': responsiveFont(30, { minSize: 24, maxSize: 36 }),
    '4xl': responsiveFont(36, { minSize: 28, maxSize: 44 }),
    '5xl': responsiveFont(48, { minSize: 36, maxSize: 56 }),
    '6xl': responsiveFont(60, { minSize: 44, maxSize: 72 }),
    '7xl': responsiveFont(72, { minSize: 52, maxSize: 88 }),
  },
  
  // Specific use cases
  button: {
    small: responsiveFont(14, { minSize: 12, maxSize: 16 }),
    medium: responsiveFont(16, { minSize: 14, maxSize: 18 }),
    large: responsiveFont(18, { minSize: 16, maxSize: 20 }),
  },
  
  heading: {
    h1: responsiveFont(32, { minSize: 24, maxSize: 40 }),
    h2: responsiveFont(28, { minSize: 22, maxSize: 34 }),
    h3: responsiveFont(24, { minSize: 20, maxSize: 28 }),
    h4: responsiveFont(20, { minSize: 18, maxSize: 24 }),
    h5: responsiveFont(18, { minSize: 16, maxSize: 20 }),
    h6: responsiveFont(16, { minSize: 14, maxSize: 18 }),
  },
  
  body: {
    small: responsiveFont(14, { minSize: 12, maxSize: 16 }),
    medium: responsiveFont(16, { minSize: 14, maxSize: 18 }),
    large: responsiveFont(18, { minSize: 16, maxSize: 20 }),
  },
  
  caption: {
    small: responsiveFont(12, { minSize: 10, maxSize: 14 }),
    medium: responsiveFont(14, { minSize: 12, maxSize: 16 }),
  },
};

/**
 * Debug information for font scaling
 * @returns {Object} Debug info
 */
export const getFontScalingDebugInfo = () => {
  return {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    deviceCategory: getDeviceCategory(),
    pixelRatio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
    scaleFactor: SCREEN_WIDTH / BASE_WIDTH,
    sampleScaling: {
      '16px becomes': responsiveFont(16),
      '20px becomes': responsiveFont(20),
      '24px becomes': responsiveFont(24),
    },
  };
};

export default {
  scaleFont,
  responsiveFont,
  responsiveTypography,
  getDeviceCategory,
  getFontScalingDebugInfo,
};
