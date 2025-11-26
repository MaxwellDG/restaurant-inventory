import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { Provider, useSelector } from "react-redux";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { get, getSecure, STORAGE_KEYS } from "@/redux/auth/secureStorage";
import { setCredentials } from "@/redux/auth/slice";
import { AuthUser } from "@/redux/auth/types";
import rootStore, { RootState } from "@/redux/store";

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

// Navigation component that conditionally renders based on auth state
function Navigation() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const router = useRouter();
  const segments = useSegments();

  // Automatically redirect when auth is cleared
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inTabsGroup) {
      // User logged out while on authenticated screen - redirect to login
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    // Authenticated user routes
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen name="company" options={{ headerShown: false }} />
        <Stack.Screen name="join-company" options={{ headerShown: false }} />
        <Stack.Screen name="create-company" options={{ headerShown: false }} />
        {/* Hide auth routes from authenticated users */}
        <Stack.Screen name="(auth)" options={{ href: null }} />
      </Stack>
    );
  } else {
    // Unauthenticated user routes
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* Hide authenticated routes from unauthenticated users */}
        <Stack.Screen name="(tabs)" options={{ href: null }} />
        <Stack.Screen name="modal" options={{ href: null }} />
      </Stack>
    );
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={rootStore}>
      <AuthRehydrator>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Navigation />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthRehydrator>
    </Provider>
  );
}
