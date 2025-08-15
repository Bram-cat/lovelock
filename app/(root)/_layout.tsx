import { Stack } from "expo-router/stack";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Layout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return <Redirect href="../(auth)/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
