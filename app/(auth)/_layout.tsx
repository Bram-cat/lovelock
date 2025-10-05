import { Stack } from "expo-router";
import "react-native-reanimated"; // 👈 This must be at the top

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
