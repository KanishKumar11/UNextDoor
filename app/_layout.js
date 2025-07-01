import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/shared/services/store";
import { ThemeProvider } from "../src/shared/context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
