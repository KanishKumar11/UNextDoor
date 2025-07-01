import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Box,
  Text,
  HStack,
  VStack,
  Heading,
  Button,
  ButtonText,
} from "@gluestack-ui/themed";
import { Ionicons } from "@expo/vector-icons";
import AchievementCard from "./AchievementCard";
import * as achievementService from "../services/achievementService";
import modernTheme from "../../../shared/styles/modernTheme";

/**
 * Achievement list component
 * @param {Object} props - Component props
 * @param {Function} props.onAchievementPress - Function to call when an achievement is pressed
 * @param {string} props.category - Category filter
 * @returns {JSX.Element} Achievement list component
 */
const AchievementList = ({ onAchievementPress, category }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(category || "all");

  // Categories for filter buttons
  const categories = [
    { id: "all", label: "All", icon: "grid-outline" },
    { id: "streak", label: "Streaks", icon: "flame-outline" },
    { id: "skill", label: "Skills", icon: "school-outline" },
    { id: "completion", label: "Completion", icon: "checkmark-circle-outline" },
    { id: "milestone", label: "Milestones", icon: "flag-outline" },
  ];

  // Load achievements
  useEffect(() => {
    loadAchievements();
  }, [activeCategory]);

  // Load achievements from API
  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user achievements
      const userAchievements = await achievementService.getUserAchievements();

      // Filter by category if needed
      const filteredAchievements =
        activeCategory === "all"
          ? userAchievements
          : userAchievements.filter((a) => a.category === activeCategory);

      setAchievements(filteredAchievements);
    } catch (error) {
      console.error("Error loading achievements:", error);
      setError("Failed to load achievements. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadAchievements();
  };

  // Render category filter button
  const renderCategoryButton = (cat) => (
    <Button
      key={cat.id}
      variant={activeCategory === cat.id ? "solid" : "outline"}
      size="sm"
      mr={8}
      onPress={() => setActiveCategory(cat.id)}
    >
      <HStack alignItems="center" space={4}>
        <Ionicons
          name={cat.icon}
          size={16}
          color={
            activeCategory === cat.id
              ? "white"
              : modernTheme.colors.primary[500]
          }
        />
        <ButtonText>{cat.label}</ButtonText>
      </HStack>
    </Button>
  );

  // Render achievement item
  const renderAchievement = ({ item }) => (
    <AchievementCard achievement={item} onPress={onAchievementPress} />
  );

  // Render empty state (only when no achievements are loaded from API)
  const renderEmptyState = () => (
    <Box flex={1} justifyContent="center" alignItems="center" p={24} mt={40}>
      <Ionicons
        name="trophy-outline"
        size={64}
        color={modernTheme.colors.secondary[300]}
      />
      <Heading size="md" mt={16} color={modernTheme.colors.secondary[500]}>
        No Achievements Available
      </Heading>
      <Text textAlign="center" mt={8} color={modernTheme.colors.secondary[400]}>
        Please check your connection and try again.
      </Text>
    </Box>
  );

  return (
    <VStack flex={1}>
      {/* Category filter */}
      <Box mb={16}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </Box>

      {/* Achievement list */}
      {loading && !refreshing ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator
            size="large"
            color={modernTheme.colors.primary[500]}
          />
        </Box>
      ) : error ? (
        <Box flex={1} justifyContent="center" alignItems="center" p={24}>
          <Text color="red.500">{error}</Text>
          <Button mt={16} onPress={loadAchievements}>
            <ButtonText>Try Again</ButtonText>
          </Button>
        </Box>
      ) : (
        <FlatList
          data={achievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[modernTheme.colors.primary[500]]}
            />
          }
        />
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default AchievementList;
