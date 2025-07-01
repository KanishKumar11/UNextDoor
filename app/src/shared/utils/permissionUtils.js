/**
 * Permission utilities for the app
 * This file provides helper functions for handling permissions
 */

import { Platform, Alert, Linking } from "react-native";
import { mediaDevices } from "@daily-co/react-native-webrtc";

/**
 * Check if microphone permission is granted
 * @returns {Promise<boolean>} - Promise resolving to true if granted, false otherwise
 */
export const checkMicrophonePermission = async () => {
  try {
    // Use WebRTC directly for permission check
    const devices = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    // If we get here without error, permission is granted
    // Clean up the stream
    if (devices && devices.getTracks) {
      devices.getTracks().forEach((track) => track.stop());
    }

    return true;
  } catch (error) {
    console.error("Error checking microphone permission:", error);
    return false;
  }
};

/**
 * Request microphone permission
 * @returns {Promise<boolean>} - Promise resolving to true if granted, false otherwise
 */
export const requestMicrophonePermission = async () => {
  try {
    // Use WebRTC directly for permission request
    const devices = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    // If we get here without error, permission is granted
    // Clean up the stream
    if (devices && devices.getTracks) {
      devices.getTracks().forEach((track) => track.stop());
    }

    return true;
  } catch (error) {
    console.error("Error requesting microphone permission:", error);

    // Show permission denied alert
    Alert.alert(
      "Microphone Permission Required",
      "This feature requires microphone access to function properly. Please grant microphone permission in your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );

    return false;
  }
};

/**
 * Open app settings
 * This is useful when permission is denied and canAskAgain is false
 * @returns {Promise<void>}
 */
export const openAppSettings = async () => {
  try {
    // await Permissions.openSettings();
  } catch (error) {
    console.error("Error opening app settings:", error);
    throw error;
  }
};

/**
 * Handle permission denied
 * Shows an alert with options to retry or open settings
 * @param {string} permissionType - Type of permission (e.g., 'microphone')
 * @param {boolean} canAskAgain - Whether the permission can be asked again
 * @param {Function} retryFn - Function to call when retry is pressed
 * @returns {Promise<void>}
 */
export const handlePermissionDenied = async (
  permissionType,
  canAskAgain,
  retryFn
) => {
  if (Platform.OS === "ios" && !canAskAgain) {
    // On iOS, if permission was denied and can't ask again, direct to settings
    Alert.alert(
      `${
        permissionType.charAt(0).toUpperCase() + permissionType.slice(1)
      } Permission Required`,
      `Please enable ${permissionType} access in your device settings to use this feature.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: openAppSettings },
      ]
    );
  } else if (canAskAgain) {
    // If can ask again, show retry option
    Alert.alert(
      `${
        permissionType.charAt(0).toUpperCase() + permissionType.slice(1)
      } Permission Required`,
      `This feature requires ${permissionType} access. Would you like to grant permission?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Retry", onPress: retryFn },
      ]
    );
  } else {
    // On Android, if permission was denied and can't ask again, show message
    Alert.alert(
      `${
        permissionType.charAt(0).toUpperCase() + permissionType.slice(1)
      } Permission Denied`,
      `You have denied ${permissionType} access. This feature requires ${permissionType} access to function properly.`,
      [{ text: "OK" }]
    );
  }
};

/**
 * Check if camera permission is granted
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const checkCameraPermission = async () => {
  try {
    // return await Permissions.askAsync(Permissions.CAMERA);
  } catch (error) {
    console.error("Error checking camera permission:", error);
    throw error;
  }
};

/**
 * Request camera permission
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const requestCameraPermission = async () => {
  try {
    // return await Permissions.askAsync(Permissions.CAMERA);
  } catch (error) {
    console.error("Error requesting camera permission:", error);
    throw error;
  }
};

/**
 * Check if location permission is granted
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const checkLocationPermission = async () => {
  try {
    // return await Permissions.askAsync(Permissions.LOCATION);
  } catch (error) {
    console.error("Error checking location permission:", error);
    throw error;
  }
};

/**
 * Request location permission
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const requestLocationPermission = async () => {
  try {
    // return await Permissions.askAsync(Permissions.LOCATION);
  } catch (error) {
    console.error("Error requesting location permission:", error);
    throw error;
  }
};

/**
 * Check if notifications permission is granted
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const checkNotificationsPermission = async () => {
  try {
    // return await Permissions.askAsync(Permissions.NOTIFICATIONS);
  } catch (error) {
    console.error("Error checking notifications permission:", error);
    throw error;
  }
};

/**
 * Request notifications permission
 * @returns {Promise<Object>} - Promise resolving to { status, canAskAgain, granted }
 */
export const requestNotificationsPermission = async () => {
  try {
    // return await Permissions.askAsync(Permissions.NOTIFICATIONS);
  } catch (error) {
    console.error("Error requesting notifications permission:", error);
    throw error;
  }
};
