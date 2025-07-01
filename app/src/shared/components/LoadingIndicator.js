import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import modernTheme from '../styles/modernTheme';

/**
 * LoadingIndicator component
 * A customizable loading indicator with animations and optional text
 * 
 * @param {Object} props
 * @param {string} props.text - Optional text to display
 * @param {string} props.type - Type of loader ('spinner', 'dots', 'pulse', 'bar')
 * @param {string} props.size - Size of the loader ('small', 'medium', 'large')
 * @param {string} props.color - Color of the loader
 * @param {boolean} props.overlay - Whether to show as an overlay
 * @param {Object} props.style - Additional styles for the container
 */
const LoadingIndicator = ({
  text,
  type = 'spinner',
  size = 'medium',
  color = modernTheme.colors.primary[500],
  overlay = false,
  style,
}) => {
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const progress = useSharedValue(0);
  
  // Size values based on size prop
  const sizeValues = {
    small: { icon: 20, container: 40 },
    medium: { icon: 30, container: 60 },
    large: { icon: 40, container: 80 },
  };
  
  const iconSize = sizeValues[size]?.icon || sizeValues.medium.icon;
  const containerSize = sizeValues[size]?.container || sizeValues.medium.container;
  
  // Start animations when component mounts
  useEffect(() => {
    // Rotation animation for spinner
    if (type === 'spinner') {
      rotation.value = withRepeat(
        withTiming(360, { 
          duration: 1000, 
          easing: Easing.linear 
        }),
        -1, // Infinite repeat
        false // Don't reverse
      );
    }
    
    // Scale animation for pulse
    if (type === 'pulse') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { 
            duration: 700, 
            easing: Easing.inOut(Easing.ease) 
          }),
          withTiming(1, { 
            duration: 700, 
            easing: Easing.inOut(Easing.ease) 
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    }
    
    // Opacity animation for dots
    if (type === 'dots') {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { 
            duration: 600, 
            easing: Easing.inOut(Easing.ease) 
          }),
          withTiming(1, { 
            duration: 600, 
            easing: Easing.inOut(Easing.ease) 
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    }
    
    // Progress animation for bar
    if (type === 'bar') {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, { 
            duration: 1000, 
            easing: Easing.inOut(Easing.ease) 
          }),
          withTiming(0, { 
            duration: 1000, 
            easing: Easing.inOut(Easing.ease) 
          })
        ),
        -1, // Infinite repeat
        false // Don't reverse
      );
    }
  }, [type]);
  
  // Animated styles
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 2 - scale.value, // Fade out as it scales up
  }));
  
  const dotStyles = [
    useAnimatedStyle(() => ({ opacity: opacity.value })),
    useAnimatedStyle(() => ({ 
      opacity: withDelay(200, opacity.value) 
    })),
    useAnimatedStyle(() => ({ 
      opacity: withDelay(400, opacity.value) 
    })),
  ];
  
  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  
  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <Animated.View style={[styles.spinner, spinnerStyle]}>
            <Ionicons name="reload-outline" size={iconSize} color={color} />
          </Animated.View>
        );
        
      case 'pulse':
        return (
          <Animated.View style={[styles.pulse, pulseStyle, { width: containerSize, height: containerSize, borderRadius: containerSize / 2, backgroundColor: color }]} />
        );
        
      case 'dots':
        return (
          <View style={styles.dotsContainer}>
            {dotStyles.map((dotStyle, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.dot, 
                  dotStyle, 
                  { 
                    width: iconSize / 2, 
                    height: iconSize / 2, 
                    borderRadius: iconSize / 4,
                    backgroundColor: color,
                    marginHorizontal: iconSize / 6,
                  }
                ]} 
              />
            ))}
          </View>
        );
        
      case 'bar':
        return (
          <View style={styles.barContainer}>
            <Animated.View style={[styles.bar, barStyle, { backgroundColor: color }]} />
          </View>
        );
        
      default:
        return (
          <Animated.View style={spinnerStyle}>
            <Ionicons name="reload-outline" size={iconSize} color={color} />
          </Animated.View>
        );
    }
  };
  
  return (
    <View style={[
      styles.container, 
      overlay && styles.overlay,
      style
    ]}>
      <View style={[
        styles.loaderContainer,
        { width: containerSize, height: containerSize }
      ]}>
        {renderLoader()}
      </View>
      
      {text && (
        <Text style={[
          styles.text,
          { color: overlay ? '#fff' : modernTheme.colors.text.primary }
        ]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: modernTheme.spacing.md,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    opacity: 0.7,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    opacity: 0.7,
  },
  barContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  text: {
    marginTop: modernTheme.spacing.md,
    fontSize: modernTheme.typography.fontSize.sm,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
