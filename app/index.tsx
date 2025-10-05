import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import "react-native-reanimated"; // 👈 This must be at the top

export default function Index() {
  const { isSignedIn, isLoaded, user } = useUser();

  // Wait for Clerk to load
  if (!isLoaded) {
    return null; // or a loading screen
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(auth)/sign-in" />;
}
