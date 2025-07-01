import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import modernTheme from "../../../shared/styles/modernTheme";
import { Box, HStack } from "@gluestack-ui/themed";

const { width } = Dimensions.get("window");

/**
 * Achievement notification component
 * @param {Object} props - Component props
 * @param {Object} props.achievement - Achievement data
 * @param {Function} props.onPress - Function to call when notification is pressed
 * @param {Function} props.onDismiss - Function to call when notification is dismissed
 * @param {number} props.duration - Duration to show notification in ms (default: 5000)
 * @returns {JSX.Element} Achievement notification component
 */
const AchievementNotification = ({
  achievement,
  onPress,
  onDismiss,
  duration = 5000,
}) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  // Dismiss notification
  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  // Handle press
  const handlePress = () => {
    if (onPress) {
      onPress(achievement);
    }
    dismiss();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress}>
        <Box
          bg="white"
          borderRadius={12}
          p={16}
          style={styles.notification}
          borderColor={achievement.color || modernTheme.colors.primary[500]}
          borderWidth={2}
        >
          <HStack alignItems="center" space={12}>
            <Box
              bg={achievement.color || modernTheme.colors.primary[500]}
              borderRadius={50}
              p={12}
              style={styles.iconContainer}
            >
              <Ionicons
                name={achievement.iconUrl || "trophy"}
                size={24}
                color="white"
              />
            </Box>

            <Box flex={1}>
              <Text fontSize={12} color={modernTheme.colors.secondary[500]}>
                Achievement Unlocked!
              </Text>
              <Text fontWeight="bold" fontSize={16}>
                {achievement.title}
              </Text>
              <Text fontSize={14} color={modernTheme.colors.secondary[700]}>
                {achievement.description}
              </Text>
            </Box>

            <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={20}
                color={modernTheme.colors.secondary[500]}
              />
            </TouchableOpacity>
          </HStack>
        </Box>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 16,
  },
  notification: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    padding: 4,
  },
});

export default AchievementNotification;
