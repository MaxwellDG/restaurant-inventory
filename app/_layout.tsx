import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { Provider } from "react-redux";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { get, getSecure, STORAGE_KEYS } from "@/redux/auth/secureStorage";
import { setCredentials } from "@/redux/auth/slice";
import { AuthUser } from "@/redux/auth/types";
import rootStore from "@/redux/store";

import "@/i18n";

// Component to handle auth rehydration
function AuthRehydrator({ children }: { children: React.ReactNode }) {
  const [isRehydrating, setIsRehydrating] = useState(true);

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        // Load persisted auth data
        const [token, refreshToken, userDataStr] = await Promise.all([
          get(STORAGE_KEYS.ACCESS_TOKEN),
          getSecure(STORAGE_KEYS.REFRESH_TOKEN),
          get(STORAGE_KEYS.USER_DATA),
        ]);

        // Parse user data
        const user: AuthUser | null = userDataStr
          ? JSON.parse(userDataStr)
          : null;

        // If we have auth data, restore it to Redux
        if (token && user) {
          rootStore.dispatch(
            setCredentials({
              user,
              token,
              refresh_token: refreshToken || undefined,
            })
          );
          console.log("Auth state rehydrated from storage");
        } else {
          console.log("No persisted auth data found");
        }
      } catch (error) {
        console.error("Error rehydrating auth state:", error);
      } finally {
        setIsRehydrating(false);
      }
    };

    rehydrateAuth();
  }, []);

  // Show loading screen while rehydrating
  if (isRehydrating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={rootStore}>
      <AuthRehydrator>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="company" options={{ headerShown: false }} />
            <Stack.Screen
              name="create-company"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="forgot-password"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="reset-password"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthRehydrator>
    </Provider>
  );
}
