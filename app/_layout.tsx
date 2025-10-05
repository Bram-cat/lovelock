import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache, publishableKey } from "../lib/clerk";
import { LogBox } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import "react-native-reanimated"; // 👈 This must be at the top

// Ignore specific warnings during development
LogBox.ignoreLogs(["Warning: ..."]); // Add any specific warnings you want to ignore

const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51QTl3jHWBv8ZV13Ng8e9mLFGSHhEsT8KQrKNcO1NWfwRDhwJUQ0AY2eJQ6VTkfYhLYKYa8J4mKqWa8J4mKqWa8J4mKqWa";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <StripeProvider
        publishableKey={stripePublishableKey}
        merchantIdentifier="merchant.com.lovelock.app"
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="light" />
      </StripeProvider>
    </ClerkProvider>
  );
}
