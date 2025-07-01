import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAchievements } from "../../features/achievements/context/AchievementContext";
import { curriculumService } from "../../features/curriculum/services/curriculumService";

// Storage keys for notification read states
const STORAGE_KEYS = {
  READ_NOTIFICATIONS: "@notifications_read_state",
};

/**
 * Notification Context
 * Manages global notification state and unread count with persistent read states
 */
const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  hasUnreadNotifications: false,
  loadNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { notifications: achievementNotifications } = useAchievements();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [readNotifications, setReadNotifications] = useState(new Set());

  // Helper functions for managing read state persistence
  const loadReadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(
        STORAGE_KEYS.READ_NOTIFICATIONS
      );
      if (stored) {
        const readIds = JSON.parse(stored);
        setReadNotifications(new Set(readIds));
        return new Set(readIds);
      }
    } catch (error) {
      console.error("Error loading read notifications:", error);
    }
    return new Set();
  }, []);

  const saveReadNotifications = useCallback(async (readIds) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.READ_NOTIFICATIONS,
        JSON.stringify(Array.from(readIds))
      );
    } catch (error) {
      console.error("Error saving read notifications:", error);
    }
  }, []);

  // Clean up old read notifications (keep only last 100)
  const cleanupReadNotifications = useCallback(async () => {
    try {
      if (readNotifications.size > 100) {
        const currentNotificationIds = new Set(notifications.map((n) => n.id));
        const relevantReadIds = new Set(
          Array.from(readNotifications).filter((id) =>
            currentNotificationIds.has(id)
          )
        );
        setReadNotifications(relevantReadIds);
        await saveReadNotifications(relevantReadIds);
        console.log(
          `🧹 Cleaned up read notifications: ${readNotifications.size} -> ${relevantReadIds.size}`
        );
      }
    } catch (error) {
      console.error("Error cleaning up read notifications:", error);
    }
  }, [readNotifications, notifications, saveReadNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnreadNotifications = unreadCount > 0;

  // Load notifications function
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load persistent read state
      const currentReadIds = await loadReadNotifications();

      // 🏆 ACHIEVEMENT NOTIFICATIONS
      const achievementNotifs = achievementNotifications.map((achievement) => {
        const notificationId = `achievement-${achievement.id}`;
        return {
          id: notificationId,
          title: "🏆 Achievement Unlocked!",
          message: `You earned "${achievement.title}" - ${achievement.description}`,
          type: "achievement",
          read: currentReadIds.has(notificationId),
          timestamp: new Date(),
          achievementId: achievement.id,
          category: achievement.category || "milestone",
          xpReward: achievement.xpReward,
        };
      });

      // 📊 PROGRESS NOTIFICATIONS
      let progressNotifications = [];
      let userProgress = null;

      try {
        const progressData = await curriculumService.getUserProgress();
        userProgress = progressData.data?.progress || progressData.data;

        if (userProgress) {
          const totalXP = Number(userProgress.totalExperience) || 0;
          const streak = userProgress.streak?.current || 0;

          // XP milestone notifications
          if (totalXP > 0 && totalXP % 500 === 0) {
            const notificationId = `xp-milestone-${totalXP}`;
            progressNotifications.push({
              id: notificationId,
              title: "🌟 XP Milestone Reached!",
              message: `Congratulations! You've earned ${totalXP} XP total.`,
              type: "progress",
              category: "xp",
              read: currentReadIds.has(notificationId),
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
            });
          }

          // Streak notifications
          if (streak >= 3) {
            const notificationId = `streak-${streak}`;
            progressNotifications.push({
              id: notificationId,
              title: "🔥 Streak Achievement!",
              message: `Amazing! You're on a ${streak}-day learning streak!`,
              type: "streak",
              category: "streak",
              read: currentReadIds.has(notificationId),
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            });
          }
        }
      } catch (error) {
        console.warn("⚠️ Could not fetch progress notifications:", error);
      }

      // 🎯 LESSON COMPLETION NOTIFICATIONS
      const lessonNotifications = [];
      if (userProgress && userProgress.modules) {
        userProgress.modules.forEach((module, moduleIndex) => {
          if (module.lessons) {
            module.lessons.forEach((lesson, lessonIndex) => {
              if (lesson.completed) {
                const notificationId = `lesson-${module.id}-${lesson.id}`;
                lessonNotifications.push({
                  id: notificationId,
                  title: "📚 Lesson Completed!",
                  message: `Great job finishing "${
                    lesson.title || `Lesson ${lessonIndex + 1}`
                  }" in ${module.title || `Module ${moduleIndex + 1}`}!`,
                  type: "lesson",
                  category: "completion",
                  read: currentReadIds.has(notificationId) || true, // Default to read for past completions
                  timestamp: new Date(
                    lesson.completedAt ||
                      Date.now() - 1000 * 60 * 60 * Math.random() * 24
                  ),
                });
              }
            });
          }
        });
      }

      // 🔔 SYSTEM NOTIFICATIONS
      const systemNotifications = [];
      const userAge = user.createdAt
        ? Date.now() - new Date(user.createdAt).getTime()
        : 0;
      const isNewUser = userAge < 7 * 24 * 60 * 60 * 1000; // 7 days

      if (isNewUser) {
        const notificationId = "welcome";
        systemNotifications.push({
          id: notificationId,
          title: "🎉 Welcome to Korean Learning!",
          message:
            "Start your journey with our AI tutor and interactive lessons.",
          type: "system",
          category: "welcome",
          read: currentReadIds.has(notificationId),
          timestamp: new Date(user.createdAt || Date.now() - 1000 * 60 * 60),
        });
      }

      // Combine and sort notifications
      const allNotifications = [
        ...achievementNotifs,
        ...progressNotifications,
        ...lessonNotifications,
        ...systemNotifications,
      ].sort((a, b) => b.timestamp - a.timestamp);

      setNotifications(allNotifications);

      console.log(
        `📱 Loaded ${allNotifications.length} notifications, ${
          allNotifications.filter((n) => !n.read).length
        } unread`
      );
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, achievementNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      console.log(`📖 Marking notification as read: ${notificationId}`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // Update persistent storage
      const newReadIds = new Set([...readNotifications, notificationId]);
      setReadNotifications(newReadIds);
      await saveReadNotifications(newReadIds);
    },
    [readNotifications, saveReadNotifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    console.log("📖 Marking all notifications as read");

    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Update persistent storage
    const allNotificationIds = new Set(notifications.map((n) => n.id));
    setReadNotifications(allNotificationIds);
    await saveReadNotifications(allNotificationIds);
  }, [notifications, saveReadNotifications]);

  // Load read notifications on mount
  useEffect(() => {
    loadReadNotifications();
  }, [loadReadNotifications]);

  // Load notifications when dependencies change
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Cleanup old read notifications periodically
  useEffect(() => {
    if (notifications.length > 0) {
      cleanupReadNotifications();
    }
  }, [notifications.length, cleanupReadNotifications]);

  const value = {
    notifications,
    unreadCount,
    hasUnreadNotifications,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
