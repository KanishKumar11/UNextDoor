import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Box, Text, HStack, VStack, Progress } from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";

/**
 * Achievement card component
 * @param {Object} props - Component props
 * @param {Object} props.achievement - Achievement data
 * @param {Function} props.onPress - Function to call when card is pressed
 * @param {boolean} props.showProgress - Whether to show progress bar
 * @returns {JSX.Element} Achievement card component
 */
const AchievementCard = ({ achievement, onPress, showProgress = true }) => {
  const {
    title,
    description,
    iconUrl,
    color = modernTheme.colors.primary[500],
    earned = false,
    progress = 0,
    isSecret = false,
  } = achievement;

  // Determine icon to use
  const iconName = iconUrl || (earned ? "trophy" : "trophy-outline");

  return (
    <TouchableOpacity onPress={() => onPress && onPress(achievement)}>
      <Box
        bg={earned ? "white" : modernTheme.colors.secondary[100]}
        borderRadius={12}
        p={16}
        mb={12}
        style={[styles.card, earned && { borderColor: color, borderWidth: 2 }]}
      >
        <HStack space={12} alignItems="center">
          <Box
            bg={earned ? color : modernTheme.colors.secondary[200]}
            borderRadius={50}
            p={12}
            style={styles.iconContainer}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={earned ? "white" : modernTheme.colors.secondary[500]}
            />
          </Box>

          <VStack flex={1}>
            <Text
              fontWeight="bold"
              fontSize={16}
              color={earned ? "black" : modernTheme.colors.secondary[500]}
            >
              {isSecret && !earned ? "Secret Achievement" : title}
            </Text>

            <Text
              fontSize={14}
              color={
                earned
                  ? modernTheme.colors.secondary[700]
                  : modernTheme.colors.secondary[400]
              }
              mt={4}
            >
              {isSecret && !earned
                ? "Complete a hidden challenge to unlock"
                : description}
            </Text>

            {showProgress && (
              <Box mt={8}>
                <Progress
                  value={earned ? 100 : progress}
                  size="sm"
                  colorScheme={earned ? "success" : "primary"}
                />
                <Text
                  fontSize={12}
                  color={modernTheme.colors.secondary[500]}
                  alignSelf="flex-end"
                  mt={2}
                >
                  {earned ? "Completed" : `${progress}%`}
                </Text>
              </Box>
            )}
          </VStack>

          {earned && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={modernTheme.colors.success[500]}
            />
          )}
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AchievementCard;
