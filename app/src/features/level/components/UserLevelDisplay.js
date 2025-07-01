import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Heading, Spacer } from '../../../shared/components';
import modernTheme from '../../../shared/styles/modernTheme';
import { useUserLevel } from '../context/UserLevelContext';
import LevelProgressBar from './LevelProgressBar';

/**
 * UserLevelDisplay component
 * Displays the user's current level and progress
 * 
 * @param {Object} props - Component props
 * @param {Object} props.style - Additional style for the container
 */
const UserLevelDisplay = ({ style }) => {
  const { levelDetails, isLoading, error } = useUserLevel();
  
  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <ActivityIndicator size="small" color={modernTheme.colors.primary[500]} />
        <Spacer size="xs" />
        <Text>Loading level data...</Text>
      </View>
    );
  }
  
  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <Ionicons
          name="alert-circle-outline"
          size={24}
          color={modernTheme.colors.error[500]}
        />
        <Spacer size="xs" />
        <Text color="error.500">{error}</Text>
      </View>
    );
  }
  
  // No level data
  if (!levelDetails || !levelDetails.currentLevel) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text weight="bold" style={styles.levelNumber}>1</Text>
          </View>
          <View style={styles.levelInfo}>
            <Heading level="h4">Novice</Heading>
            <Text size="sm" color="neutral.600">
              Just starting your Korean language journey
            </Text>
          </View>
        </View>
        
        <Spacer size="sm" />
        
        <LevelProgressBar
          level={1}
          progress={0}
          xp={0}
          nextLevelXp={100}
        />
      </View>
    );
  }
  
  // Get level data
  const { currentLevel, nextLevel, xpPoints, levelProgress } = levelDetails;
  const nextLevelXp = nextLevel ? nextLevel.xpRequired : currentLevel.xpRequired + 1000;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.levelHeader}>
        <View style={styles.levelBadge}>
          <Text weight="bold" style={styles.levelNumber}>
            {currentLevel.level}
          </Text>
        </View>
        <View style={styles.levelInfo}>
          <Heading level="h4">{currentLevel.name}</Heading>
          <Text size="sm" color="neutral.600">
            {currentLevel.description}
          </Text>
        </View>
      </View>
      
      <Spacer size="sm" />
      
      <LevelProgressBar
        level={currentLevel.level}
        progress={levelProgress}
        xp={xpPoints}
        nextLevelXp={nextLevelXp}
        color={currentLevel.color || modernTheme.colors.primary[500]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    ...modernTheme.shadows.sm,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: modernTheme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 20,
    color: modernTheme.colors.primary[700],
  },
  levelInfo: {
    flex: 1,
  },
});

export default UserLevelDisplay;
