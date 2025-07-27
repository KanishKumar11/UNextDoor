/**
 * Color Mapping Utility
 * Centralized system to map backend colors to our Miles-inspired BRAND_COLORS palette
 * This ensures 100% consistency across the app regardless of what colors the backend sends
 */

import { BRAND_COLORS } from '../constants/colors';

// Comprehensive color mapping to override backend colors with our Miles-inspired palette
const COLOR_MAPPING = {
  // Map old green colors to Explorer Teal
  "#6FC935": BRAND_COLORS.EXPLORER_TEAL,
  "#6fc935": BRAND_COLORS.EXPLORER_TEAL,
  "#5BC4B3": BRAND_COLORS.EXPLORER_TEAL,
  "#5bc4b3": BRAND_COLORS.EXPLORER_TEAL,
  "#28a745": BRAND_COLORS.EXPLORER_TEAL,
  "#2ecc71": BRAND_COLORS.EXPLORER_TEAL,
  
  // Map blue colors to Ocean Blue
  "#007bff": BRAND_COLORS.OCEAN_BLUE,
  "#0056b3": BRAND_COLORS.OCEAN_BLUE,
  "#36798A": BRAND_COLORS.OCEAN_BLUE,
  "#36798a": BRAND_COLORS.OCEAN_BLUE,
  "#3498db": BRAND_COLORS.OCEAN_BLUE,
  "#3498DB": BRAND_COLORS.OCEAN_BLUE,
  
  // Map light blue colors to Sky Aqua
  "#17a2b8": BRAND_COLORS.SKY_AQUA,
  "#138496": BRAND_COLORS.SKY_AQUA,
  "#A3E8DC": BRAND_COLORS.SKY_AQUA,
  "#a3e8dc": BRAND_COLORS.SKY_AQUA,
  
  // Map orange/coral/red colors to Warm Coral
  "#fd7e14": BRAND_COLORS.WARM_CORAL,
  "#e83e8c": BRAND_COLORS.WARM_CORAL,
  "#e74c3c": BRAND_COLORS.WARM_CORAL,
  "#E74C3C": BRAND_COLORS.WARM_CORAL,
  "#e67e22": BRAND_COLORS.WARM_CORAL,
  "#FF6B6B": BRAND_COLORS.WARM_CORAL,
  "#ff6b6b": BRAND_COLORS.WARM_CORAL,
  
  // Map brown colors to Rucksack Brown
  "#6f4e37": BRAND_COLORS.RUCKSACK_BROWN,
  "#8b4513": BRAND_COLORS.RUCKSACK_BROWN,
  "#A46E3E": BRAND_COLORS.RUCKSACK_BROWN,
  "#a46e3e": BRAND_COLORS.RUCKSACK_BROWN,
  
  // Map purple colors to Deep Purple
  "#6f42c1": BRAND_COLORS.DEEP_PURPLE,
  "#563d7c": BRAND_COLORS.DEEP_PURPLE,
  "#9b59b6": BRAND_COLORS.DEEP_PURPLE,
  "#9B59B6": BRAND_COLORS.DEEP_PURPLE,
  "#8B5A96": BRAND_COLORS.DEEP_PURPLE,
  "#8b5a96": BRAND_COLORS.DEEP_PURPLE,
  
  // Map yellow colors to Golden Amber
  "#ffc107": BRAND_COLORS.GOLDEN_AMBER,
  "#e0a800": BRAND_COLORS.GOLDEN_AMBER,
  "#FFD700": BRAND_COLORS.GOLDEN_AMBER,
  "#ffd700": BRAND_COLORS.GOLDEN_AMBER,
};

/**
 * Maps backend colors to our brand colors
 * @param {string} backendColor - Color from backend (hex code)
 * @param {string} fallbackColor - Fallback color if no mapping found
 * @returns {string} Mapped brand color
 */
export const mapBackendColor = (backendColor, fallbackColor = BRAND_COLORS.EXPLORER_TEAL) => {
  if (!backendColor) return fallbackColor;
  
  // Normalize the color (trim whitespace, ensure lowercase for comparison)
  const normalizedColor = backendColor.trim();
  
  // Check if we have a direct mapping (case-sensitive first, then case-insensitive)
  if (COLOR_MAPPING[normalizedColor]) {
    return COLOR_MAPPING[normalizedColor];
  }
  
  // Check case-insensitive
  const lowerColor = normalizedColor.toLowerCase();
  if (COLOR_MAPPING[lowerColor]) {
    return COLOR_MAPPING[lowerColor];
  }
  
  // Check if it's already a BRAND_COLOR
  const brandColorValues = Object.values(BRAND_COLORS);
  if (brandColorValues.includes(normalizedColor)) {
    return normalizedColor;
  }
  
  // For any other color, map to our palette based on hue analysis
  const colorLower = normalizedColor.toLowerCase();
  
  // Green hues
  if (colorLower.includes('green') || 
      colorLower.match(/#[0-9a-f]*[6-7][0-9a-f]*[c-f][0-9a-f]*/) ||
      colorLower.match(/#[0-9a-f]*[2-3][0-9a-f]*[c-e][0-9a-f]*/)) {
    return BRAND_COLORS.EXPLORER_TEAL;
  }
  
  // Blue hues
  if (colorLower.includes('blue') || 
      colorLower.match(/#[0-3][0-9a-f]*[7-9][0-9a-f]*[8-a][0-9a-f]*/) ||
      colorLower.match(/#[0-3][0-9a-f]*[4-9][0-9a-f]*[8-d][0-9a-f]*/)) {
    return BRAND_COLORS.OCEAN_BLUE;
  }
  
  // Light blue/aqua hues
  if (colorLower.includes('aqua') || colorLower.includes('cyan') ||
      colorLower.match(/#[a-f][0-9a-f]*[e-f][0-9a-f]*[d-f][0-9a-f]*/)) {
    return BRAND_COLORS.SKY_AQUA;
  }
  
  // Red/orange/coral hues
  if (colorLower.includes('red') || colorLower.includes('orange') || 
      colorLower.includes('coral') || 
      colorLower.match(/#[e-f][0-9a-f]*[4-7][0-9a-f]*[0-4][0-9a-f]*/) ||
      colorLower.match(/#[f][0-9a-f]*[6-7][0-9a-f]*[0-6][0-9a-f]*/)) {
    return BRAND_COLORS.WARM_CORAL;
  }
  
  // Purple hues
  if (colorLower.includes('purple') || colorLower.includes('violet') ||
      colorLower.match(/#[8-9][0-9a-f]*[5-6][0-9a-f]*[9-a][0-9a-f]*/) ||
      colorLower.match(/#[6-9][0-9a-f]*[4-5][0-9a-f]*[2-c][0-9a-f]*/)) {
    return BRAND_COLORS.DEEP_PURPLE;
  }
  
  // Brown hues
  if (colorLower.includes('brown') || 
      colorLower.match(/#[a-f][0-9a-f]*[4-6][0-9a-f]*[3-e][0-9a-f]*/) ||
      colorLower.match(/#[6-8][0-9a-f]*[4-f][0-9a-f]*[3-e][0-9a-f]*/)) {
    return BRAND_COLORS.RUCKSACK_BROWN;
  }
  
  // Yellow/gold hues
  if (colorLower.includes('yellow') || colorLower.includes('gold') || 
      colorLower.includes('amber') ||
      colorLower.match(/#[f][0-9a-f]*[d-f][0-9a-f]*[0-7][0-9a-f]*/) ||
      colorLower.match(/#[e-f][0-9a-f]*[0-a][0-9a-f]*[8-a][0-9a-f]*/)) {
    return BRAND_COLORS.GOLDEN_AMBER;
  }
  
  // Default fallback
  return fallbackColor;
};

/**
 * Maps an array of backend colors to brand colors
 * @param {string[]} colors - Array of backend colors
 * @param {string} fallbackColor - Fallback color for unmapped colors
 * @returns {string[]} Array of mapped brand colors
 */
export const mapBackendColors = (colors, fallbackColor = BRAND_COLORS.EXPLORER_TEAL) => {
  if (!Array.isArray(colors)) return [];
  return colors.map(color => mapBackendColor(color, fallbackColor));
};

/**
 * Maps colors in an object recursively
 * @param {Object} obj - Object that may contain color properties
 * @param {string[]} colorKeys - Array of keys that contain colors (default: ['color', 'backgroundColor'])
 * @param {string} fallbackColor - Fallback color for unmapped colors
 * @returns {Object} Object with mapped colors
 */
export const mapObjectColors = (obj, colorKeys = ['color', 'backgroundColor'], fallbackColor = BRAND_COLORS.EXPLORER_TEAL) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const mapped = { ...obj };
  
  // Map direct color properties
  colorKeys.forEach(key => {
    if (mapped[key]) {
      mapped[key] = mapBackendColor(mapped[key], fallbackColor);
    }
  });
  
  // Recursively map nested objects
  Object.keys(mapped).forEach(key => {
    if (typeof mapped[key] === 'object' && mapped[key] !== null && !Array.isArray(mapped[key])) {
      mapped[key] = mapObjectColors(mapped[key], colorKeys, fallbackColor);
    }
  });
  
  return mapped;
};

export default {
  mapBackendColor,
  mapBackendColors,
  mapObjectColors,
  COLOR_MAPPING,
};
