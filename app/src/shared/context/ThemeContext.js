import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import lightTheme from "../styles/modernTheme";
import darkTheme from "../styles/darkTheme";

// Theme mode constants
const THEME_MODE_KEY = "@theme_mode";
const THEME_MODE = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

// Create theme context
const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  themeMode: THEME_MODE.SYSTEM,
  toggleTheme: () => {},
  setThemeMode: () => {},
  setCustomTheme: () => {},
});

/**
 * ThemeProvider component
 * Provides theme context to the app
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Get device color scheme
  const systemColorScheme = useColorScheme();

  // State for theme mode (light, dark, system)
  const [themeMode, setThemeModeState] = useState(THEME_MODE.SYSTEM);

  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");

  // State for custom theme
  const [customTheme, setCustomTheme] = useState(null);

  // Load saved theme mode from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (savedThemeMode) {
          setThemeModeState(savedThemeMode);

          // If not using system theme, set dark mode based on saved theme
          if (savedThemeMode !== THEME_MODE.SYSTEM) {
            setIsDarkMode(savedThemeMode === THEME_MODE.DARK);
          }
        }
      } catch (error) {
        console.error("Failed to load theme mode:", error);
      }
    };

    loadThemeMode();
  }, []);

  // Update dark mode when system color scheme changes (if using system theme)
  useEffect(() => {
    if (themeMode === THEME_MODE.SYSTEM) {
      setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode]);

  // Listen for appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === THEME_MODE.SYSTEM) {
        setIsDarkMode(colorScheme === "dark");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [themeMode]);

  // Set theme mode and save to storage
  const setThemeMode = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
      setThemeModeState(mode);

      // Update dark mode based on new theme mode
      if (mode === THEME_MODE.SYSTEM) {
        setIsDarkMode(systemColorScheme === "dark");
      } else {
        setIsDarkMode(mode === THEME_MODE.DARK);
      }
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newMode = isDarkMode ? THEME_MODE.LIGHT : THEME_MODE.DARK;
    setThemeMode(newMode);
  };

  // Get current theme based on dark mode
  const theme = customTheme || (isDarkMode ? darkTheme : lightTheme);

  // Context value
  const contextValue = {
    theme,
    isDarkMode,
    themeMode,
    toggleTheme,
    setThemeMode,
    setCustomTheme,
    THEME_MODE,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme hook
 * Hook to access theme context
 *
 * @returns {Object} Theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default ThemeContext;
