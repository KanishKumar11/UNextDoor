/**
 * Permissions Initializer
 * Handles requesting all necessary permissions at app startup
 */

import { Platform, Alert, Linking } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as Camera from "expo-camera";
import * as ExpoAudio from "expo-audio";

/**
 * Request all necessary permissions at app startup
 * @returns {Promise<Object>} - Object containing permission statuses
 */
export const requestInitialPermissions = async () => {
  try {
    const permissionResults = {};

    // Request microphone permission
    const microphonePermission = await ExpoAudio.requestPermissionsAsync();
    permissionResults.microphone = microphonePermission.status;

    // Request media library permission
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    permissionResults.mediaLibrary = mediaLibraryPermission.status;

    // Log permission results
    console.log("Initial permission results:", permissionResults);

    // Check if any critical permissions were denied
    const deniedPermissions = Object.entries(permissionResults)
      .filter(([_, status]) => status !== "granted")
      .map(([permission]) => permission);

    if (deniedPermissions.length > 0) {
      console.warn("Some permissions were denied:", deniedPermissions);

      // Show alert for denied permissions
      if (Platform.OS === "ios") {
        Alert.alert(
          "Permissions Required",
          `Some features may not work properly without ${deniedPermissions.join(
            ", "
          )} permissions. You can enable them in your device settings.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openURL("app-settings:"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Permissions Required",
          `Some features may not work properly without ${deniedPermissions.join(
            ", "
          )} permissions. You can enable them in your device settings.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    }

    return permissionResults;
  } catch (error) {
    console.error("Error requesting initial permissions:", error);
    return { error: error.message };
  }
};

/**
 * Check if a specific permission is granted
 * @param {string} permissionType - Type of permission to check
 * @returns {Promise<boolean>} - Whether the permission is granted
 */
export const isPermissionGranted = async (permissionType) => {
  try {
    let status;

    switch (permissionType) {
      case "microphone":
        const audioPermission = await ExpoAudio.getPermissionsAsync();
        status = audioPermission.status;
        break;
      case "camera":
        const cameraPermission = await Camera.getCameraPermissionsAsync();
        status = cameraPermission.status;
        break;
      case "mediaLibrary":
        const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync();
        status = mediaLibraryPermission.status;
        break;
      case "location":
        const locationPermission =
          await Location.getForegroundPermissionsAsync();
        status = locationPermission.status;
        break;
      default:
        console.warn(`Unknown permission type: ${permissionType}`);
        return false;
    }

    return status === "granted";
  } catch (error) {
    console.error(`Error checking ${permissionType} permission:`, error);
    return false;
  }
};

export default {
  requestInitialPermissions,
  isPermissionGranted,
};
