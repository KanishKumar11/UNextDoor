import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useAuth } from "../../../features/auth/context/AuthContext";
import {
  getUnviewedAchievements,
  checkAndAwardAchievements,
} from "../services/achievementService";
import AchievementNotification from "./AchievementNotification";

/**
 * Achievement Manager Component
 * Manages achievement notifications and checks for new achievements
 *
 * @param {Object} props - Component props
 * @param {boolean} props.checkOnMount - Whether to check for achievements on mount
 * @param {number} props.checkInterval - Interval in ms to check for achievements
 * @returns {JSX.Element} Achievement manager component
 */
const AchievementManager = ({
  checkOnMount = true,
  checkInterval = 60000, // 1 minute
}) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Check for unviewed achievements on mount
  useEffect(() => {
    if (user && checkOnMount) {
      fetchUnviewedAchievements();
    }
  }, [user]);

  // Set up interval to check for new achievements
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      checkForNewAchievements();
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [user, checkInterval]);

  // Display achievements one by one
  useEffect(() => {
    if (achievements.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievements[0]);
    }
  }, [achievements, currentAchievement]);

  // Fetch unviewed achievements
  const fetchUnviewedAchievements = async () => {
    try {
      const unviewedAchievements = await getUnviewedAchievements();
      if (unviewedAchievements && unviewedAchievements.length > 0) {
        setAchievements(unviewedAchievements);
      }
    } catch (error) {
      console.error("Error fetching unviewed achievements:", error);
    }
  };

  // Check for new achievements
  const checkForNewAchievements = async () => {
    try {
      const newAchievements = await checkAndAwardAchievements();
      if (newAchievements && newAchievements.length > 0) {
        setAchievements((prev) => [...prev, ...newAchievements]);
      }
    } catch (error) {
      console.error("Error checking for new achievements:", error);
    }
  };

  // Handle achievement notification dismiss
  const handleDismiss = () => {
    setCurrentAchievement(null);
    setAchievements((prev) => prev.slice(1));
  };

  // Handle achievement notification press
  const handlePress = (achievement) => {
    // Navigate to achievements screen or show achievement details
    console.log("Achievement pressed:", achievement);
  };

  if (!user || !currentAchievement) {
    return null;
  }

  return (
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 }}
    >
      <AchievementNotification
        achievement={currentAchievement}
        onPress={handlePress}
        onDismiss={handleDismiss}
      />
    </View>
  );
};

export default AchievementManager;
