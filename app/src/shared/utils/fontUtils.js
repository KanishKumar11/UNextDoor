/**
 * Font utilities for loading and managing fonts
 * Web and mobile compatible
 */
import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { Platform } from "react-native";

// Define font names - Web compatible with individual mobile fonts
export const FONTS = {
  MONTSERRAT_LIGHT:
    Platform.OS === "web" ? "Montserrat, sans-serif" : "Montserrat-Light",
  MONTSERRAT_REGULAR:
    Platform.OS === "web" ? "Montserrat, sans-serif" : "Montserrat-Regular",
  MONTSERRAT_MEDIUM:
    Platform.OS === "web" ? "Montserrat, sans-serif" : "Montserrat-Medium",
  MONTSERRAT_SEMIBOLD:
    Platform.OS === "web" ? "Montserrat, sans-serif" : "Montserrat-SemiBold",
  MONTSERRAT_BOLD:
    Platform.OS === "web" ? "Montserrat, sans-serif" : "Montserrat-Bold",
  MONTSERRAT_EXTRABOLD:
    Platform.OS === "web" ? "Montserrat, sans-serif" : "Montserrat-ExtraBold",
  MONTSERRAT_ITALIC:
    Platform.OS === "web" ? "Montserrat, sans-serif" : "Montserrat-Italic",
};

/**
 * Load custom fonts - Web compatible
 * @returns {Promise<void>} - Promise that resolves when fonts are loaded
 */
export const loadFonts = async () => {
  try {
    // Skip font loading on web as fonts are loaded via CSS
    if (Platform.OS === "web") {
      console.log("Web platform detected - fonts loaded via CSS");
      return true;
    }

    await Font.loadAsync({
      // Load individual Montserrat font files for each weight
      "Montserrat-Light": require("../../assets/fonts/Montserrat-Light.ttf"),
      "Montserrat-Regular": require("../../assets/fonts/Montserrat-Regular.ttf"),
      "Montserrat-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
      "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
      "Montserrat-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
      "Montserrat-ExtraBold": require("../../assets/fonts/Montserrat-ExtraBold.ttf"),
      "Montserrat-Italic": require("../../assets/fonts/Montserrat-Italic.ttf"),
    });

    console.log("Fonts loaded successfully");
    return true;
  } catch (error) {
    console.error("Error loading fonts:", error);
    return false;
  }
};

/**
 * Custom hook to load fonts
 * @returns {Object} - Object containing loading state and error
 */
export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadCustomFonts = async () => {
      try {
        const success = await loadFonts();
        setFontsLoaded(success);
      } catch (err) {
        setError(err);
        console.error("Error in useFonts hook:", err);
      }
    };

    loadCustomFonts();
  }, []);

  return { fontsLoaded, error };
};

export default {
  FONTS,
  loadFonts,
  useFonts,
};
