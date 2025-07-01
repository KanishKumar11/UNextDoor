import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/shared/services/store";
import AuthScreen from "./src/features/auth/screens/AuthScreen";
import HomeScreen from "./src/features/auth/screens/HomeScreen";
import { useAuth } from "./src/features/auth/hooks/useAuth";
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
  const { isAuthenticated } = useAuth();

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
