import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="company" />
      <Stack.Screen name="join-company" />
      <Stack.Screen name="create-company" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
