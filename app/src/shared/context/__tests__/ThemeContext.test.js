import React from "react";
import { render, act } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "../ThemeContext";
import lightTheme from "../../styles/modernTheme";
import darkTheme from "../../styles/darkTheme";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Test component that uses the theme context
const TestComponent = ({ onThemeChange }) => {
  const { theme, isDarkMode, toggleTheme, setThemeMode, THEME_MODE } =
    useTheme();

  return (
    <>
      <Text testID="theme-mode">{isDarkMode ? "dark" : "light"}</Text>
      <Text testID="primary-color">{theme.colors.primary[500]}</Text>
      <TouchableOpacity
        testID="toggle-theme"
        onPress={() => {
          toggleTheme();
          if (onThemeChange) onThemeChange();
        }}
      >
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="set-light"
        onPress={() => {
          setThemeMode(THEME_MODE.LIGHT);
          if (onThemeChange) onThemeChange();
        }}
      >
        <Text>Set Light</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="set-dark"
        onPress={() => {
          setThemeMode(THEME_MODE.DARK);
          if (onThemeChange) onThemeChange();
        }}
      >
        <Text>Set Dark</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="set-system"
        onPress={() => {
          setThemeMode(THEME_MODE.SYSTEM);
          if (onThemeChange) onThemeChange();
        }}
      >
        <Text>Set System</Text>
      </TouchableOpacity>
    </>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it("provides light theme by default", async () => {
    const { getByTestID } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for AsyncStorage to resolve
    await act(async () => {});

    expect(getByTestID("theme-mode").props.children).toBe("light");
    expect(getByTestID("primary-color").props.children).toBe(
      lightTheme.colors.primary[500]
    );
  });

  it("loads saved theme mode from AsyncStorage", async () => {
    AsyncStorage.getItem.mockResolvedValue("dark");

    const { getByTestID } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for AsyncStorage to resolve
    await act(async () => {});

    expect(getByTestID("theme-mode").props.children).toBe("dark");
    expect(getByTestID("primary-color").props.children).toBe(
      darkTheme.colors.primary[500]
    );
  });

  it("toggles between light and dark themes", async () => {
    const onThemeChangeMock = jest.fn();

    const { getByTestID } = render(
      <ThemeProvider>
        <TestComponent onThemeChange={onThemeChangeMock} />
      </ThemeProvider>
    );

    // Wait for AsyncStorage to resolve
    await act(async () => {});

    // Initially light theme
    expect(getByTestID("theme-mode").props.children).toBe("light");

    // Toggle to dark theme
    await act(async () => {
      getByTestID("toggle-theme").props.onPress();
    });

    expect(getByTestID("theme-mode").props.children).toBe("dark");
    expect(getByTestID("primary-color").props.children).toBe(
      darkTheme.colors.primary[500]
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@theme_mode", "dark");
    expect(onThemeChangeMock).toHaveBeenCalledTimes(1);

    // Toggle back to light theme
    await act(async () => {
      getByTestID("toggle-theme").props.onPress();
    });

    expect(getByTestID("theme-mode").props.children).toBe("light");
    expect(getByTestID("primary-color").props.children).toBe(
      lightTheme.colors.primary[500]
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@theme_mode", "light");
    expect(onThemeChangeMock).toHaveBeenCalledTimes(2);
  });

  it("sets theme mode directly", async () => {
    const onThemeChangeMock = jest.fn();

    const { getByTestID } = render(
      <ThemeProvider>
        <TestComponent onThemeChange={onThemeChangeMock} />
      </ThemeProvider>
    );

    // Wait for AsyncStorage to resolve
    await act(async () => {});

    // Set to dark theme
    await act(async () => {
      getByTestID("set-dark").props.onPress();
    });

    expect(getByTestID("theme-mode").props.children).toBe("dark");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@theme_mode", "dark");
    expect(onThemeChangeMock).toHaveBeenCalledTimes(1);

    // Set to light theme
    await act(async () => {
      getByTestID("set-light").props.onPress();
    });

    expect(getByTestID("theme-mode").props.children).toBe("light");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@theme_mode", "light");
    expect(onThemeChangeMock).toHaveBeenCalledTimes(2);

    // Set to system theme (which is 'light' in our test environment)
    await act(async () => {
      getByTestID("set-system").props.onPress();
    });

    expect(getByTestID("theme-mode").props.children).toBe("light");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@theme_mode", "system");
    expect(onThemeChangeMock).toHaveBeenCalledTimes(3);
  });
});
