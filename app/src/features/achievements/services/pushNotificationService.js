import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Push Notification Service for Achievements
 * Handles achievement unlock notifications
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permissions were granted
 */
export const requestNotificationPermissions = async () => {
  try {
    console.log("📱 Requesting notification permissions...");
    
    if (!Device.isDevice) {
      console.warn("⚠️ Push notifications don't work on simulator");
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn("⚠️ Notification permissions not granted");
      return false;
    }

    console.log("✅ Notification permissions granted");
    return true;
  } catch (error) {
    console.error("❌ Error requesting notification permissions:", error);
    return false;
  }
};

/**
 * Get push notification token
 * @returns {Promise<string|null>} Push token or null if failed
 */
export const getPushToken = async () => {
  try {
    if (!Device.isDevice) {
      console.warn("⚠️ Push tokens don't work on simulator");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'e67a5de1-a3ec-46f1-8f31-9b09c26bc330', // Your EAS project ID
    });

    console.log("📱 Push token obtained:", token.data);
    return token.data;
  } catch (error) {
    console.error("❌ Error getting push token:", error);
    return null;
  }
};

/**
 * Schedule local achievement notification
 * @param {Object} achievement - Achievement object
 * @returns {Promise<string|null>} Notification ID or null if failed
 */
export const scheduleAchievementNotification = async (achievement) => {
  try {
    console.log("🔔 Scheduling achievement notification:", achievement.title);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🏆 Achievement Unlocked!",
        body: `You earned "${achievement.title}" - ${achievement.description}`,
        data: {
          type: 'achievement',
          achievementId: achievement.id,
          achievement: achievement,
        },
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Show immediately
    });

    console.log("✅ Achievement notification scheduled:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("❌ Error scheduling achievement notification:", error);
    return null;
  }
};

/**
 * Send push notification for achievement unlock
 * @param {Object} achievement - Achievement object
 * @param {string} pushToken - User's push token
 * @returns {Promise<boolean>} Whether notification was sent successfully
 */
export const sendAchievementPushNotification = async (achievement, pushToken) => {
  try {
    if (!pushToken) {
      console.warn("⚠️ No push token available for achievement notification");
      return false;
    }

    console.log("📤 Sending achievement push notification:", achievement.title);

    const message = {
      to: pushToken,
      sound: 'default',
      title: '🏆 Achievement Unlocked!',
      body: `You earned "${achievement.title}" - ${achievement.description}`,
      data: {
        type: 'achievement',
        achievementId: achievement.id,
        achievement: achievement,
      },
      badge: 1,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data && result.data.status === 'ok') {
      console.log("✅ Achievement push notification sent successfully");
      return true;
    } else {
      console.error("❌ Failed to send achievement push notification:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending achievement push notification:", error);
    return false;
  }
};

/**
 * Handle notification received while app is running
 * @param {Function} onAchievementNotification - Callback for achievement notifications
 * @returns {Function} Cleanup function
 */
export const setupNotificationListeners = (onAchievementNotification) => {
  console.log("🔔 Setting up notification listeners...");

  // Handle notifications received while app is running
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log("🔔 Notification received:", notification);
    
    const { data } = notification.request.content;
    if (data && data.type === 'achievement') {
      console.log("🏆 Achievement notification received:", data.achievement);
      if (onAchievementNotification) {
        onAchievementNotification(data.achievement);
      }
    }
  });

  // Handle notification tapped while app is running
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log("👆 Notification tapped:", response);
    
    const { data } = response.notification.request.content;
    if (data && data.type === 'achievement') {
      console.log("🏆 Achievement notification tapped:", data.achievement);
      if (onAchievementNotification) {
        onAchievementNotification(data.achievement);
      }
    }
  });

  // Return cleanup function
  return () => {
    console.log("🧹 Cleaning up notification listeners");
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};

/**
 * Clear all achievement notifications
 * @returns {Promise<void>}
 */
export const clearAchievementNotifications = async () => {
  try {
    console.log("🧹 Clearing achievement notifications...");
    
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    console.log("✅ Achievement notifications cleared");
  } catch (error) {
    console.error("❌ Error clearing achievement notifications:", error);
  }
};

/**
 * Get notification settings
 * @returns {Promise<Object>} Notification settings
 */
export const getNotificationSettings = async () => {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    const token = await getPushToken();
    
    return {
      permissions: permissions.status,
      token,
      canSendNotifications: permissions.status === 'granted' && !!token,
    };
  } catch (error) {
    console.error("❌ Error getting notification settings:", error);
    return {
      permissions: 'undetermined',
      token: null,
      canSendNotifications: false,
    };
  }
};

/**
 * Initialize push notifications for achievements
 * @param {Function} onAchievementNotification - Callback for achievement notifications
 * @returns {Promise<Object>} Initialization result
 */
export const initializeAchievementNotifications = async (onAchievementNotification) => {
  try {
    console.log("🚀 Initializing achievement notifications...");
    
    // Request permissions
    const hasPermissions = await requestNotificationPermissions();
    if (!hasPermissions) {
      return {
        success: false,
        error: "Notification permissions not granted",
      };
    }
    
    // Get push token
    const pushToken = await getPushToken();
    
    // Setup listeners
    const cleanup = setupNotificationListeners(onAchievementNotification);
    
    console.log("✅ Achievement notifications initialized successfully");
    
    return {
      success: true,
      pushToken,
      cleanup,
    };
  } catch (error) {
    console.error("❌ Error initializing achievement notifications:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  requestNotificationPermissions,
  getPushToken,
  scheduleAchievementNotification,
  sendAchievementPushNotification,
  setupNotificationListeners,
  clearAchievementNotifications,
  getNotificationSettings,
  initializeAchievementNotifications,
};
