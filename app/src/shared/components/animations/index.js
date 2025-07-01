import React, { useRef, useEffect } from 'react';
import { Animated, Easing, ViewStyle, StyleProp } from 'react-native';

/**
 * FadeIn component
 * Animates children with a fade-in effect
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} props.duration - Animation duration in ms
 * @param {number} props.delay - Animation delay in ms
 * @param {StyleProp<ViewStyle>} props.style - Additional styles
 */
export const FadeIn = ({
  children,
  duration = 300,
  delay = 0,
  style,
  ...props
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [opacity, duration, delay]);
  
  return (
    <Animated.View
      style={[
        { opacity },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * SlideIn component
 * Animates children with a slide-in effect
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} props.duration - Animation duration in ms
 * @param {number} props.delay - Animation delay in ms
 * @param {string} props.direction - Slide direction ('up', 'down', 'left', 'right')
 * @param {number} props.distance - Slide distance in pixels
 * @param {StyleProp<ViewStyle>} props.style - Additional styles
 */
export const SlideIn = ({
  children,
  duration = 300,
  delay = 0,
  direction = 'up',
  distance = 50,
  style,
  ...props
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(
    direction === 'left' ? distance : direction === 'right' ? -distance : 0
  )).current;
  const translateY = useRef(new Animated.Value(
    direction === 'up' ? distance : direction === 'down' ? -distance : 0
  )).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [opacity, translateX, translateY, duration, delay]);
  
  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
          ],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * ScaleIn component
 * Animates children with a scale-in effect
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} props.duration - Animation duration in ms
 * @param {number} props.delay - Animation delay in ms
 * @param {number} props.initialScale - Initial scale value
 * @param {StyleProp<ViewStyle>} props.style - Additional styles
 */
export const ScaleIn = ({
  children,
  duration = 300,
  delay = 0,
  initialScale = 0.9,
  style,
  ...props
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(initialScale)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
  }, [opacity, scale, duration, delay, initialScale]);
  
  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ scale }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Stagger component
 * Animates children with a staggered effect
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} props.staggerDelay - Delay between each child animation
 * @param {string} props.animation - Animation type ('fade', 'slide', 'scale')
 * @param {Object} props.animationProps - Props to pass to the animation component
 * @param {StyleProp<ViewStyle>} props.style - Additional styles
 */
export const Stagger = ({
  children,
  staggerDelay = 100,
  animation = 'fade',
  animationProps = {},
  style,
  ...props
}) => {
  // Get animation component based on type
  const getAnimationComponent = (type) => {
    switch (type) {
      case 'slide':
        return SlideIn;
      case 'scale':
        return ScaleIn;
      case 'fade':
      default:
        return FadeIn;
    }
  };
  
  const AnimationComponent = getAnimationComponent(animation);
  
  // Clone children with staggered delay
  const staggeredChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    return (
      <AnimationComponent
        {...animationProps}
        delay={(animationProps.delay || 0) + index * staggerDelay}
      >
        {child}
      </AnimationComponent>
    );
  });
  
  return (
    <Animated.View style={style} {...props}>
      {staggeredChildren}
    </Animated.View>
  );
};
