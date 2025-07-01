import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

/**
 * ModernTabBar component
 * A modern, aesthetic tab bar with animated indicators and icon-only tabs
 * 
 * @param {Object} props - Component props
 * @param {Object} props.state - Navigation state
 * @param {Object} props.descriptors - Navigation descriptors
 * @param {Object} props.navigation - Navigation object
 */
const ModernTabBar = ({ state, descriptors, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate tab width based on screen width and number of tabs
  const TAB_WIDTH = width / state.routes.length;
  
  // Get active route index
  const activeIndex = state.index;
  
  // Animated style for the indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(activeIndex * TAB_WIDTH, {
            damping: 20,
            stiffness: 200,
          }),
        },
      ],
    };
  });
  
  return (
    <View 
      style={[
        styles.container, 
        {
          backgroundColor: isDarkMode 
            ? theme.colors.background.card 
            : theme.colors.background.paper,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          borderTopColor: isDarkMode 
            ? theme.colors.neutral[800] 
            : theme.colors.neutral[200],
        }
      ]}
    >
      <View style={styles.tabBarContainer}>
        {/* Animated indicator */}
        <Animated.View 
          style={[
            styles.indicator, 
            { 
              width: TAB_WIDTH,
              backgroundColor: isDarkMode 
                ? theme.colors.background.dark 
                : theme.colors.background.default,
            },
            indicatorStyle,
          ]}
        />
        
        {/* Tab buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          // Get icon name from options
          const iconName = options.tabBarIcon 
            ? options.tabBarIcon({ 
                color: 'transparent', 
                size: 24,
                focused: isFocused 
              }).props.name
            : 'help-circle-outline';
          
          // Handle tab press
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          
          // Handle tab long press
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused 
                    ? theme.colors.primary[500] 
                    : isDarkMode 
                      ? theme.colors.neutral[400] 
                      : theme.colors.neutral[500]
                  }
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 16,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
});

export default ModernTabBar;
