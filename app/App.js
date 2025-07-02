import React, { useEffect } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/shared/services/store";
import AuthScreen from "./src/features/auth/screens/AuthScreen";
import HomeScreen from "./src/features/auth/screens/HomeScreen";
import { useAuth } from "./src/features/auth/hooks/useAuth";
import { initializeAuth } from "./src/utils/authInitializer";
import theme from "./src/shared/styles/theme";

// Main App component wrapper with providers
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

// App content with access to Redux and UI providers
function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Debug authentication state
  useEffect(() => {
    console.log('🔍 App authentication state:', {
      isAuthenticated,
      hasUser: !!user,
      isLoading,
      userEmail: user?.email
    });
  }, [isAuthenticated, user, isLoading]);

  // Initialize authentication services when app starts
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await initializeAuth();
        console.log('Authentication services initialized:', result);
      } catch (error) {
        console.error('Failed to initialize authentication services:', error);
      }
    };

    initAuth();
  }, []);

  // Show loading state while authentication is being determined
  if (isLoading) {
    console.log('⏳ App is loading, showing loading state');
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        {/* You can add a loading spinner here if needed */}
      </SafeAreaView>
    );
  }

  console.log('🎯 App rendering:', isAuthenticated ? 'HomeScreen' : 'AuthScreen');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {isAuthenticated ? <HomeScreen /> : <AuthScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
