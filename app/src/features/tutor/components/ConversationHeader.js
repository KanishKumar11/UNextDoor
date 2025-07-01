import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { Text, Box, HStack, Heading } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp
} from 'react-native-reanimated';
import modernTheme from '../../../shared/styles/modernTheme';

/**
 * ConversationHeader component
 * A modern header for the conversation screen with animated hints
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Conversation title
 * @param {string} props.subtitle - Optional subtitle (e.g., difficulty level)
 * @param {Array} props.hints - Array of hint strings to display
 * @param {Function} props.onBack - Function to call when back button is pressed
 * @param {Object} props.style - Additional styles to apply
 */
const ConversationHeader = ({
  title,
  subtitle,
  hints = [],
  onBack,
  style
}) => {
  const [showHints, setShowHints] = useState(false);
  const hintsHeight = useSharedValue(0);
  const bulbRotation = useSharedValue(0);
  
  // Toggle hints visibility
  const toggleHints = () => {
    setShowHints(!showHints);
    hintsHeight.value = withTiming(showHints ? 0 : 1, { duration: 300 });
    bulbRotation.value = withSpring(showHints ? 0 : 1, { 
      damping: 10, 
      stiffness: 100 
    });
  };
  
  // Animated styles
  const hintsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: hintsHeight.value,
      height: hintsHeight.value === 0 ? 0 : 'auto',
      overflow: 'hidden',
    };
  });
  
  const bulbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${bulbRotation.value * 30}deg` },
        { scale: 1 + (bulbRotation.value * 0.1) }
      ],
    };
  });
  
  return (
    <Animated.View 
      entering={SlideInDown.duration(300)}
      style={[styles.container, style]}
    >
      <HStack alignItems="center" justifyContent="space-between" style={styles.headerRow}>
        <TouchableOpacity 
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={modernTheme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Heading size="sm" style={styles.title}>{title}</Heading>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        <TouchableOpacity 
          onPress={toggleHints}
          style={styles.hintsButton}
          activeOpacity={0.7}
        >
          <Animated.View style={bulbAnimatedStyle}>
            <Ionicons
              name={showHints ? "bulb" : "bulb-outline"}
              size={24}
              color={modernTheme.colors.accent[500]}
            />
          </Animated.View>
        </TouchableOpacity>
      </HStack>
      
      {hints.length > 0 && (
        <Animated.View style={[styles.hintsContainer, hintsAnimatedStyle]}>
          <Box 
            mt={modernTheme.spacing.sm} 
            p={modernTheme.spacing.md} 
            bg={modernTheme.colors.accent[50]} 
            borderRadius={modernTheme.borderRadius.md}
          >
            <Text style={styles.hintsTitle}>
              Helpful Phrases:
            </Text>
            {hints.map((hint, index) => (
              <Text key={index} style={styles.hintText}>
                • {hint}
              </Text>
            ))}
          </Box>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: modernTheme.colors.background.paper,
    paddingTop: Platform.OS === 'ios' ? 50 : modernTheme.spacing.md,
    paddingBottom: modernTheme.spacing.sm,
    paddingHorizontal: modernTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: modernTheme.spacing.xs,
    borderRadius: modernTheme.borderRadius.full,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: modernTheme.typography.fontSize.lg,
    color: modernTheme.colors.text.primary,
    fontWeight: modernTheme.typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: modernTheme.typography.fontSize.xs,
    color: modernTheme.colors.text.secondary,
    marginTop: 2,
  },
  hintsButton: {
    padding: modernTheme.spacing.xs,
    borderRadius: modernTheme.borderRadius.full,
  },
  hintsContainer: {
    marginTop: modernTheme.spacing.xs,
  },
  hintsTitle: {
    fontSize: modernTheme.typography.fontSize.sm,
    fontWeight: modernTheme.typography.fontWeight.semibold,
    color: modernTheme.colors.text.primary,
    marginBottom: modernTheme.spacing.xs,
  },
  hintText: {
    fontSize: modernTheme.typography.fontSize.sm,
    color: modernTheme.colors.text.primary,
    marginBottom: modernTheme.spacing.xs,
    lineHeight: modernTheme.typography.lineHeight.md * modernTheme.typography.fontSize.sm,
  },
});

export default ConversationHeader;
