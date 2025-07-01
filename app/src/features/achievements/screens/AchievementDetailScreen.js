import React, { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Box,
  Text,
  HStack,
  VStack,
  Heading,
  Button,
  ButtonText,
  ScrollView,
  Progress,
} from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import * as achievementService from "../services/achievementService";
import modernTheme from "../../../shared/styles/modernTheme";

/**
 * Achievement detail screen
 * @returns {JSX.Element} Achievement detail screen component
 */
const AchievementDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load achievement details
  useEffect(() => {
    if (params.id) {
      loadAchievement(params.id);
    } else {
      setError("Achievement ID is required");
      setLoading(false);
    }
  }, [params.id]);

  // Load achievement details from API
  const loadAchievement = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Get all user achievements
      const achievements = await achievementService.getUserAchievements();

      // Find the achievement with the matching ID
      const found = achievements.find((a) => a.id === id);

      if (found) {
        setAchievement(found);
      } else {
        setError("Achievement not found");
      }
    } catch (error) {
      console.error("Error loading achievement:", error);
      setError("Failed to load achievement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Text>Loading...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Box flex={1} justifyContent="center" alignItems="center" p={24}>
          <Text color="red.500">{error}</Text>
          <Button mt={16} onPress={() => router.back()}>
            <ButtonText>Go Back</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    );
  }

  // Render achievement details
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Box p={16}>
          <HStack alignItems="center" mb={24}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Heading size="lg" ml={16}>
              Achievement Details
            </Heading>
          </HStack>

          {achievement && (
            <VStack alignItems="center">
              <Box
                bg={achievement.color || modernTheme.colors.primary[500]}
                borderRadius={50}
                p={24}
                mb={24}
              >
                <Ionicons
                  name={achievement.iconUrl || "trophy"}
                  size={64}
                  color="white"
                />
              </Box>

              <Heading size="xl" mb={8} textAlign="center">
                {achievement.title}
              </Heading>

              <Text
                textAlign="center"
                mb={24}
                fontSize={16}
                color={modernTheme.colors.secondary[700]}
              >
                {achievement.description}
              </Text>

              {achievement.earned ? (
                <Box
                  bg={modernTheme.colors.success[100]}
                  p={16}
                  borderRadius={12}
                  width="100%"
                  mb={24}
                >
                  <HStack alignItems="center" space={12}>
                    <Ionicons
                      name="checkmark-circle"
                      size={32}
                      color={modernTheme.colors.success[500]}
                    />
                    <VStack>
                      <Text
                        fontWeight="bold"
                        fontSize={18}
                        color={modernTheme.colors.success[700]}
                      >
                        Achievement Earned
                      </Text>
                      <Text
                        fontSize={16}
                        color={modernTheme.colors.success[600]}
                      >
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ) : (
                <Box
                  bg={modernTheme.colors.secondary[100]}
                  p={16}
                  borderRadius={12}
                  width="100%"
                  mb={24}
                >
                  <VStack>
                    <HStack alignItems="center" space={12} mb={8}>
                      <Ionicons
                        name="time-outline"
                        size={32}
                        color={modernTheme.colors.secondary[500]}
                      />
                      <Text
                        fontWeight="bold"
                        fontSize={18}
                        color={modernTheme.colors.secondary[700]}
                      >
                        In Progress
                      </Text>
                    </HStack>

                    <Progress
                      value={achievement.progress}
                      size="md"
                      colorScheme="primary"
                    />

                    <Text
                      fontSize={16}
                      color={modernTheme.colors.secondary[600]}
                      alignSelf="flex-end"
                      mt={8}
                    >
                      {achievement.progress}% complete
                    </Text>
                  </VStack>
                </Box>
              )}

              <Box
                bg={modernTheme.colors.secondary[50]}
                p={16}
                borderRadius={12}
                width="100%"
                mb={24}
              >
                <Text fontWeight="bold" fontSize={18} mb={8}>
                  Reward
                </Text>
                <HStack alignItems="center" space={8}>
                  <Ionicons
                    name="star"
                    size={24}
                    color={modernTheme.colors.warning[500]}
                  />
                  <Text fontSize={16}>{achievement.xpReward} XP</Text>
                </HStack>
              </Box>

              <Box
                bg={modernTheme.colors.secondary[50]}
                p={16}
                borderRadius={12}
                width="100%"
              >
                <Text fontWeight="bold" fontSize={18} mb={8}>
                  Category
                </Text>
                <HStack alignItems="center" space={8}>
                  <Ionicons
                    name={getCategoryIcon(achievement.category)}
                    size={24}
                    color={modernTheme.colors.secondary[500]}
                  />
                  <Text fontSize={16} textTransform="capitalize">
                    {achievement.category}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  switch (category) {
    case "streak":
      return "flame-outline";
    case "skill":
      return "school-outline";
    case "completion":
      return "checkmark-circle-outline";
    case "milestone":
      return "flag-outline";
    case "special":
      return "star-outline";
    default:
      return "trophy-outline";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default AchievementDetailScreen;
