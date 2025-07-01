import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text } from '../../../shared/components';
import modernTheme from '../../../shared/styles/modernTheme';

/**
 * LevelProgressBar component
 * Displays a user's level progress with animation
 * 
 * @param {Object} props - Component props
 * @param {number} props.level - Current level
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} props.xp - Current XP
 * @param {number} props.nextLevelXp - XP required for next level
 * @param {string} props.color - Progress bar color
 * @param {Object} props.style - Additional style for the container
 */
const LevelProgressBar = ({
  level = 1,
  progress = 0,
  xp = 0,
  nextLevelXp = 100,
  color = modernTheme.colors.primary[500],
  style,
}) => {
  const [progressAnim] = useState(new Animated.Value(0));
  const [displayedProgress, setDisplayedProgress] = useState(0);
  
  // Animate progress when it changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    
    // Update displayed progress for text
    const interval = setInterval(() => {
      progressAnim.getValue() !== progress && 
        setDisplayedProgress(Math.round(progressAnim.__getValue()));
    }, 50);
    
    return () => clearInterval(interval);
  }, [progress, progressAnim]);
  
  // Calculate width based on progress
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.levelInfo}>
        <Text weight="semibold">Level {level}</Text>
        <Text size="sm" color="neutral.600">
          {xp} / {nextLevelXp} XP ({displayedProgress}%)
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            { width: progressWidth, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: modernTheme.colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default LevelProgressBar;
