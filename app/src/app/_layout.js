import React, { useEffect, useState, createContext } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { Provider } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text } from "react-native";
import { store } from "../shared/services/store";
import { useAuth } from "../features/auth/hooks/useAuth";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { AchievementProvider } from "../features/achievements/context/AchievementContext";
import { UserLevelProvider } from "../features/level/context/UserLevelContext";
import { NotificationProvider } from "../shared/context/NotificationContext";
import { setupAuthInterceptors } from "../shared/utils/authUtils";
import { ThemeProvider } from "../shared/context/ThemeContext";
import { NetworkWrapper } from "../shared/components/NetworkWrapper";
import { loadFonts } from "../shared/utils/fontUtils";

export const AuthContext = createContext(null);

// Auth context wrapper to handle protected routes
function AuthContextProvider({ children }) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, error, isInitialized } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [redirected, setRedirected] = useState(false);

  // Set navigation ready after first render
  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  // Handle authentication errors
  useEffect(() => {
    if (error && error.includes("session has expired") && !redirected) {
      setRedirected(true);
      router.replace("/auth");
    }
  }, [error, redirected]);

  // Monitor for auth state and current route to handle protected routes
  useEffect(() => {
    // Skip this effect when still loading auth state or navigation is not ready
    if (isLoading || !isNavigationReady || !isInitialized) {
      console.log("Skipping navigation effect - not ready yet", {
        isLoading,
        isNavigationReady,
        isInitialized,
      });
      return;
    }

    // Reset redirected state when auth state changes
    setRedirected(false);

    // Define which segments need authentication
    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedGroup =
      segments[0] === "(main)" || segments[0] === undefined;

    console.log("Auth state changed:", {
      isAuthenticated,
      inAuthGroup,
      inProtectedGroup,
      currentSegment: segments[0],
    });

    // Check if we have a token even if isAuthenticated is false
    const checkTokenAndRedirect = async () => {
      try {
        // Use the authUtils to get the token for consistency
        const token = await AsyncStorage.getItem("accessToken");
        console.log("Token exists in layout check:", !!token);

        // Only redirect if we're in the auth group and have a token
        // But don't redirect if we're already authenticated
        if (token && !isAuthenticated && inAuthGroup) {
          // We have a token but isAuthenticated is false
          // This could be a token validation issue, so let's not redirect automatically
          // Instead, let the auth flow handle it properly
          console.log(
            "Token exists but not authenticated yet, staying on auth screen"
          );
          return false;
        }
        return false;
      } catch (error) {
        console.error("Error checking token:", error);
        return false;
      }
    };

    const handleNavigation = async () => {
      // First check if we have a token that should make us authenticated
      const redirectedDueToToken = await checkTokenAndRedirect();
      if (redirectedDueToToken) return;

      // Normal navigation logic
      if (!isAuthenticated && inProtectedGroup) {
        // Redirect to auth screen if not authenticated and trying to access protected routes
        console.log("Redirecting to auth screen - not authenticated");
        router.replace("/auth");
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to home if authenticated and trying to access auth routes
        console.log("Redirecting to home - already authenticated");
        router.replace("/");
      }
    };

    handleNavigation();
  }, [isAuthenticated, isLoading, segments, isNavigationReady, isInitialized]);

  // Provide auth state to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Inner layout component that uses the Redux store
function InnerLayout() {
  return (
    <AuthContextProvider>
      <AuthProvider>
        <AchievementProvider>
          <UserLevelProvider>
            <NotificationProvider>
              <NetworkWrapper>
                <Slot />
              </NetworkWrapper>
            </NotificationProvider>
          </UserLevelProvider>
        </AchievementProvider>
      </AuthProvider>
    </AuthContextProvider>
  );
}

// Root layout component
// @expo/router-fix
export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(null);

  // Load fonts and initialize auth interceptors on app start
  useEffect(() => {
    // Disabled to prevent conflicts with auth service
    // setupAuthInterceptors();
    console.log("Auth interceptors disabled to prevent conflicts");

    // Load custom fonts
    const loadAppFonts = async () => {
      try {
        const success = await loadFonts();
        setFontsLoaded(success);
        if (success) {
          console.log("Fonts loaded successfully");
        } else {
          console.warn("Failed to load fonts");
          setFontError("Failed to load fonts");
        }
      } catch (error) {
        console.error("Error loading fonts:", error);
        setFontError(error.message);
      }
    };

    loadAppFonts();
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  // Show error screen if fonts failed to load
  if (fontError) {
    console.warn("Continuing without custom fonts due to error:", fontError);
  }

  // Ensure the layout always renders a Slot first
  return (
    <Provider store={store}>
      <ThemeProvider>
        <InnerLayout />
      </ThemeProvider>
    </Provider>
  );
}
