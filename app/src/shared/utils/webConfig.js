/**
 * Web Configuration Utilities
 * Handles web-specific configurations for fonts, styles, and compatibility
 */

import { Platform } from 'react-native';

/**
 * Load web fonts dynamically
 * Ensures Montserrat fonts are loaded on web platforms
 */
export const loadWebFonts = () => {
  if (Platform.OS !== 'web') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    // Check if fonts are already loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        console.log('Web fonts loaded successfully');
        resolve();
      });
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        console.log('Web fonts loaded (fallback)');
        resolve();
      }, 100);
    }
  });
};

/**
 * Inject CSS for web font loading
 * Adds the web fonts CSS to the document head
 */
export const injectWebFonts = () => {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  // Check if already injected
  if (document.getElementById('montserrat-fonts')) {
    return;
  }

  const link = document.createElement('link');
  link.id = 'montserrat-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap';
  link.onload = () => {
    console.log('Montserrat fonts loaded from Google Fonts');
  };
  
  document.head.appendChild(link);
};

/**
 * Get platform-specific font family
 * Returns appropriate font family based on platform
 */
export const getPlatformFontFamily = (weight = 'regular') => {
  if (Platform.OS === 'web') {
    return 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  }
  
  // Mobile font families
  const mobileFonts = {
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extrabold: 'Montserrat-ExtraBold',
    italic: 'Montserrat-Italic',
  };
  
  return mobileFonts[weight] || mobileFonts.regular;
};

/**
 * Get platform-specific font weight
 * Returns appropriate font weight based on platform
 */
export const getPlatformFontWeight = (weight = 'regular') => {
  const weights = {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  };
  
  return weights[weight] || weights.regular;
};

/**
 * Initialize web-specific configurations
 * Should be called during app initialization
 */
export const initializeWebConfig = async () => {
  if (Platform.OS !== 'web') {
    return;
  }

  try {
    // Inject font CSS
    injectWebFonts();
    
    // Wait for fonts to load
    await loadWebFonts();
    
    // Add CSS custom properties for brand colors
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --color-primary: #6FC935;
          --color-secondary: #003366;
          --color-tertiary: #000000;
          --color-white: #FFFFFF;
          --font-montserrat: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        body {
          font-family: var(--font-montserrat);
          font-weight: 400;
        }
      `;
      document.head.appendChild(style);
    }
    
    console.log('Web configuration initialized successfully');
  } catch (error) {
    console.error('Error initializing web configuration:', error);
  }
};

/**
 * Check if running on web platform
 */
export const isWeb = () => Platform.OS === 'web';

/**
 * Check if running on mobile platform
 */
export const isMobile = () => Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Get responsive breakpoints for web
 */
export const getBreakpoints = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return {
      isSmall: false,
      isMedium: true,
      isLarge: false,
      isTablet: false,
      isDesktop: false,
    };
  }

  const width = window.innerWidth;
  
  return {
    isSmall: width < 375,
    isMedium: width >= 375 && width < 768,
    isLarge: width >= 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
};

export default {
  loadWebFonts,
  injectWebFonts,
  getPlatformFontFamily,
  getPlatformFontWeight,
  initializeWebConfig,
  isWeb,
  isMobile,
  getBreakpoints,
};
