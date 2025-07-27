import React, { createContext, useState, useContext, useEffect } from "react";
import { View, Share, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../auth/hooks/useAuth";
// import AchievementNotification from "../components/AchievementNotification"; // Removed to avoid duplicate displays
import AchievementPopup from "../components/AchievementPopup";
import * as achievementService from "../services/achievementService";

// Create context
const AchievementContext = createContext();

/**
 * Achievement context provider
 * @param {Object} props - Component props
 * @returns {JSX.Element} Achievement context provider component
 */
export const AchievementProvider = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  // const [notifications, setNotifications] = useState([]); // Removed to avoid duplicate displays
  const [checkingInterval, setCheckingInterval] = useState(null);

  // 🎉 NEW: Achievement Popup State
  const [currentPopupAchievement, setCurrentPopupAchievement] = useState(null);
  const [popupQueue, setPopupQueue] = useState([]);

  // Check for new achievements on mount - only if authenticated
  useEffect(() => {
    // Don't run if not authenticated or still loading
    if (!isAuthenticated || isLoading) {
      console.log("Skipping achievement check - not authenticated or loading");
      return;
    }

    console.log("Starting achievement checking for authenticated user");
    checkForNewAchievements();

    // Set up interval to check for new achievements
    const interval = setInterval(() => {
      checkForNewAchievements();
    }, 5 * 60 * 1000); // Check every 5 minutes

    setCheckingInterval(interval);

    // Clean up interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, isLoading]);

  // Check for new achievements
  const checkForNewAchievements = async () => {
    // Don't run if not authenticated
    if (!isAuthenticated) {
      console.log("Skipping achievement check - user not authenticated");
      return;
    }

    try {
      // Get unviewed achievements
      const unviewedAchievements =
        await achievementService.getUnviewedAchievements();

      if (unviewedAchievements.length > 0) {
        console.log(
          `🎉 Found ${unviewedAchievements.length} unviewed achievements`
        );

        // 🎉 NEW: Show popup for first achievement, queue others
        unviewedAchievements.forEach((achievement, index) => {
          if (index === 0) {
            showAchievementPopup(achievement);
          } else {
            setPopupQueue((prev) => [...prev, achievement]);
          }
        });

        // Skip adding to notifications queue to avoid duplicate displays

        // Mark as viewed
        const achievementIds = unviewedAchievements.map((a) => a.id);
        await achievementService.markAchievementsAsViewed(achievementIds);
      }
    } catch (error) {
      console.error("Error checking for new achievements:", error);
    }
  };

  // Manually check for achievements (e.g., after completing a conversation)
  const checkAchievements = async () => {
    // Don't run if not authenticated
    if (!isAuthenticated) {
      console.log("Skipping manual achievement check - user not authenticated");
      return [];
    }

    try {
      // Check and award achievements
      const newAchievements =
        await achievementService.checkAndAwardAchievements();

      if (newAchievements.length > 0) {
        console.log(`🎉 ${newAchievements.length} new achievements earned!`);

        // 🎉 NEW: Show popup for first achievement, queue others
        newAchievements.forEach((achievement, index) => {
          if (index === 0) {
            showAchievementPopup(achievement);
          } else {
            setPopupQueue((prev) => [...prev, achievement]);
          }
        });

        // Skip adding to notifications queue to avoid duplicate displays
      }

      return newAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  };

  // 🎉 NEW: Show achievement popup
  const showAchievementPopup = (achievement) => {
    console.log("🎉 Showing achievement popup:", achievement.title);

    if (currentPopupAchievement) {
      // If popup is already showing, add to queue
      setPopupQueue((prev) => [...prev, achievement]);
    } else {
      // Show popup immediately
      setCurrentPopupAchievement(achievement);
    }
  };

  // 🎉 NEW: Close achievement popup
  const closeAchievementPopup = () => {
    console.log("🔄 Closing achievement popup");

    setCurrentPopupAchievement(null);

    // Show next popup in queue if any
    setPopupQueue((prev) => {
      if (prev.length > 0) {
        const [nextAchievement, ...remaining] = prev;
        setCurrentPopupAchievement(nextAchievement);
        return remaining;
      }
      return prev;
    });
  };

  // 🎉 NEW: Share achievement
  const shareAchievement = async (achievement) => {
    try {
      console.log("📤 Sharing achievement:", achievement.title);

      const shareContent = {
        message: `🎉 I just unlocked the "${achievement.title}" achievement in UNextDoor Korean learning app! ${achievement.description} #KoreanLearning #Achievement`,
        title: `Achievement Unlocked: ${achievement.title}`,
      };

      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        console.log("✅ Achievement shared successfully");

        // Show success feedback
        Alert.alert(
          "Shared!",
          "Your achievement has been shared successfully!",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      console.error("❌ Error sharing achievement:", error);
      Alert.alert(
        "Share Failed",
        "Unable to share achievement. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  // Notification functions removed to avoid duplicate displays

  return (
    <AchievementContext.Provider
      value={{
        checkAchievements,
        showAchievementPopup,
        closeAchievementPopup,
        shareAchievement,
        currentPopupAchievement,
      }}
    >
      {children}

      {/* 🎉 NEW: Achievement Popup Modal */}
      <AchievementPopup
        visible={!!currentPopupAchievement}
        achievement={currentPopupAchievement}
        onClose={closeAchievementPopup}
        onShare={shareAchievement}
        showShareButton={true}
      />

      {/* Top notification removed to avoid duplicate achievement displays */}
    </AchievementContext.Provider>
  );
};

/**
 * Hook to use achievement context
 * @returns {Object} Achievement context
 */
export const useAchievements = () => {
  const context = useContext(AchievementContext);

  if (!context) {
    throw new Error(
      "useAchievements must be used within an AchievementProvider"
    );
  }

  return context;
};
