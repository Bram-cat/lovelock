import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn, isLoaded, user } = useUser();

  console.log('📍 Index route - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'user:', !!user);

  // Wait for Clerk to load
  if (!isLoaded) {
    return null; // or a loading screen
  }

  if (isSignedIn) {
    console.log('✅ User is signed in, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  }

  console.log('❌ User not signed in, redirecting to sign-in');
  return <Redirect href="/(auth)/sign-in" />;
}