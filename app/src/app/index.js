import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "expo-router";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "./_layout";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useTheme } from "../shared/context/ThemeContext";
import modernTheme from "../shared/styles/modernTheme";

// Root index page with conditional redirect
export default function Index() {
  const auth = useAuth();
  const authContext = useContext(AuthContext);
  const { theme, isDarkMode } = useTheme();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [error, setError] = useState(null);

  // Get authentication state from both sources
  const isAuthenticated =
    auth.isAuthenticated || (authContext && authContext.isAuthenticated);
  const isLoading = auth.isLoading || (authContext && authContext.isLoading);
  const authError = auth.error || (authContext && authContext.error);

  // Check for specific errors in console logs
  useEffect(() => {
    // Listen for console errors (this is a workaround for the specific error we're seeing)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if the error is the one we're looking for
      const errorString = args.join(" ");
      if (errorString.includes("logout is not a function") && !error) {
        setError("Authentication error. Please log in again.");
        // Force redirect to auth page
        setTimeout(() => {
          setLoadingTimeout(true);
        }, 500);
      }
      originalConsoleError(...args);
    };

    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
    };
  }, []);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 8000); // 8 seconds timeout
    }

    if (authError && !error) {
      setError(authError);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, authError]);

  // Handle retry
  const handleRetry = () => {
    setLoadingTimeout(false);
    setError(null);

    // Use different reload methods for web vs native
    if (Platform.OS === "web") {
      window.location.reload();
    } else {
      // For React Native, we'll just reset the states
      // and force a re-render
      try {
        // If there was an error with auth, redirect to auth page
        if (error && error.includes("not a function")) {
          return <Redirect href="/(auth)/auth" />;
        }

        if (auth && auth.getProfile) {
          auth.getProfile();
        }
      } catch (e) {
        console.error("Error during retry:", e);
        // If retry fails, redirect to auth page
        return <Redirect href="/(auth)/auth" />;
      }
    }
  };

  // Show loading spinner while determining auth state
  if (isLoading && !loadingTimeout && !error) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.default },
        ]}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary[500]}
            style={styles.spinner}
          />
          <Text
            style={[styles.loadingText, { color: theme.colors.text.primary }]}
          >
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Show error or timeout message
  if (loadingTimeout || error) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.default },
        ]}
      >
        <View style={styles.errorContent}>
          {/* Error Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.error.light + "20" },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={theme.colors.error.main}
            />
          </View>

          {/* Error Title */}
          <Text
            style={[styles.errorTitle, { color: theme.colors.text.primary }]}
          >
            {loadingTimeout
              ? "Taking longer than expected"
              : "Connection Error"}
          </Text>

          {/* Error Message */}
          <Text
            style={[
              styles.errorMessage,
              { color: theme.colors.text.secondary },
            ]}
          >
            {loadingTimeout
              ? "We're having trouble connecting to the server. Please check your internet connection and try again."
              : error ||
                "An unexpected error occurred. Please try again or contact support if the problem persists."}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.primary[500] },
              ]}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={theme.colors.brandWhite}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: theme.colors.brandWhite },
                ]}
              >
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme.colors.secondary[500],
                  backgroundColor: "transparent",
                },
              ]}
              onPress={() => {
                setLoadingTimeout(false);
                setError(null);
                // Redirect to auth page
                return <Redirect href="/(auth)/auth" />;
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="log-in-outline"
                size={20}
                color={theme.colors.secondary[500]}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.secondary[500] },
                ]}
              >
                Go to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Redirect based on authentication state
  return isAuthenticated ? (
    <Redirect href="/(main)" />
  ) : (
    <Redirect href="/(auth)/auth" />
  );
}

// Styles following brand guidelines
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    marginBottom: 16,
  },

  loadingText: {
    fontFamily: modernTheme.typography.fontFamily.medium,
    fontSize: modernTheme.typography.fontSize.lg,
    fontWeight: modernTheme.typography.fontWeight.medium,
    textAlign: "center",
  },

  errorContent: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  errorTitle: {
    fontFamily: modernTheme.typography.fontFamily.bold,
    fontSize: modernTheme.typography.fontSize["2xl"],
    fontWeight: modernTheme.typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: modernTheme.typography.fontSize["2xl"] * 1.3,
  },

  errorMessage: {
    fontFamily: modernTheme.typography.fontFamily.regular,
    fontSize: modernTheme.typography.fontSize.md,
    fontWeight: modernTheme.typography.fontWeight.regular,
    textAlign: "center",
    lineHeight: modernTheme.typography.fontSize.md * 1.5,
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  buttonContainer: {
    width: "100%",
    gap: 16,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
    shadowColor: modernTheme.colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 56,
  },

  buttonIcon: {
    marginRight: 8,
  },

  primaryButtonText: {
    fontFamily: modernTheme.typography.fontFamily.semibold,
    fontSize: modernTheme.typography.fontSize.md,
    fontWeight: modernTheme.typography.fontWeight.semibold,
  },

  secondaryButtonText: {
    fontFamily: modernTheme.typography.fontFamily.semibold,
    fontSize: modernTheme.typography.fontSize.md,
    fontWeight: modernTheme.typography.fontWeight.semibold,
  },
});
