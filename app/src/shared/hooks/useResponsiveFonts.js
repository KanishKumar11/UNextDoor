import { useMemo } from 'react';
import { 
  responsiveFont, 
  responsiveTypography, 
  getDeviceCategory,
  getFontScalingDebugInfo 
} from '../utils/responsiveFonts';

/**
 * Hook for responsive font sizing
 * Provides easy access to responsive font utilities
 * 
 * @returns {Object} Responsive font utilities
 */
export const useResponsiveFonts = () => {
  const deviceCategory = useMemo(() => getDeviceCategory(), []);
  
  const fonts = useMemo(() => ({
    // Direct scaling function
    scale: responsiveFont,
    
    // Pre-calculated responsive sizes
    sizes: responsiveTypography.fontSize,
    
    // Specific use cases
    button: responsiveTypography.button,
    heading: responsiveTypography.heading,
    body: responsiveTypography.body,
    caption: responsiveTypography.caption,
    
    // Device info
    deviceCategory,
    
    // Debug info (useful for development)
    debug: getFontScalingDebugInfo(),
    
    // Helper functions
    getButtonSize: (variant = 'medium') => responsiveTypography.button[variant],
    getHeadingSize: (level = 'h2') => responsiveTypography.heading[level],
    getBodySize: (size = 'medium') => responsiveTypography.body[size],
    getCaptionSize: (size = 'medium') => responsiveTypography.caption[size],
    
    // Custom scaling with options
    scaleWithOptions: (size, options) => responsiveFont(size, options),
  }), [deviceCategory]);
  
  return fonts;
};

/**
 * Hook for responsive font styles
 * Returns complete style objects for common text elements
 * 
 * @returns {Object} Style objects with responsive fonts
 */
export const useResponsiveFontStyles = () => {
  const fonts = useResponsiveFonts();
  
  const styles = useMemo(() => ({
    // Heading styles
    h1: {
      fontSize: fonts.heading.h1,
      fontFamily: 'Montserrat-Bold',
      lineHeight: fonts.heading.h1 * 1.2,
    },
    h2: {
      fontSize: fonts.heading.h2,
      fontFamily: 'Montserrat-Bold',
      lineHeight: fonts.heading.h2 * 1.2,
    },
    h3: {
      fontSize: fonts.heading.h3,
      fontFamily: 'Montserrat-SemiBold',
      lineHeight: fonts.heading.h3 * 1.3,
    },
    h4: {
      fontSize: fonts.heading.h4,
      fontFamily: 'Montserrat-SemiBold',
      lineHeight: fonts.heading.h4 * 1.3,
    },
    h5: {
      fontSize: fonts.heading.h5,
      fontFamily: 'Montserrat-Medium',
      lineHeight: fonts.heading.h5 * 1.4,
    },
    h6: {
      fontSize: fonts.heading.h6,
      fontFamily: 'Montserrat-Medium',
      lineHeight: fonts.heading.h6 * 1.4,
    },
    
    // Body text styles
    bodyLarge: {
      fontSize: fonts.body.large,
      fontFamily: 'Montserrat-Regular',
      lineHeight: fonts.body.large * 1.5,
    },
    bodyMedium: {
      fontSize: fonts.body.medium,
      fontFamily: 'Montserrat-Regular',
      lineHeight: fonts.body.medium * 1.5,
    },
    bodySmall: {
      fontSize: fonts.body.small,
      fontFamily: 'Montserrat-Regular',
      lineHeight: fonts.body.small * 1.5,
    },
    
    // Button styles
    buttonLarge: {
      fontSize: fonts.button.large,
      fontFamily: 'Montserrat-SemiBold',
    },
    buttonMedium: {
      fontSize: fonts.button.medium,
      fontFamily: 'Montserrat-SemiBold',
    },
    buttonSmall: {
      fontSize: fonts.button.small,
      fontFamily: 'Montserrat-Medium',
    },
    
    // Caption styles
    captionLarge: {
      fontSize: fonts.caption.medium,
      fontFamily: 'Montserrat-Regular',
      lineHeight: fonts.caption.medium * 1.4,
    },
    captionSmall: {
      fontSize: fonts.caption.small,
      fontFamily: 'Montserrat-Regular',
      lineHeight: fonts.caption.small * 1.4,
    },
    
    // Special styles
    label: {
      fontSize: fonts.sizes.sm,
      fontFamily: 'Montserrat-Medium',
      lineHeight: fonts.sizes.sm * 1.3,
    },
    overline: {
      fontSize: fonts.sizes.xs,
      fontFamily: 'Montserrat-SemiBold',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
  }), [fonts]);
  
  return styles;
};

export default useResponsiveFonts;
