import { Stack } from "expo-router";
import React from "react";
import NumerologyAIChatScreen from "../screens/NumerologyAIChatScreen";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AIChatModal() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the parameters passed from the numerology screen
  const profile = params.profile ? JSON.parse(params.profile as string) : null;
  const lifePathInfo = params.lifePathInfo ? JSON.parse(params.lifePathInfo as string) : null;
  const predictions = params.predictions ? JSON.parse(params.predictions as string) : [];
  const characterAnalysis = params.characterAnalysis as string || "";
  const birthDate = params.birthDate as string || "";
  const name = params.name as string || "";
  const userId = params.userId as string || "";

  const handleBack = () => {
    router.dismiss();
  };

  if (!profile) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_bottom",
        }}
      />
      <NumerologyAIChatScreen
        profile={profile}
        lifePathInfo={lifePathInfo}
        predictions={predictions}
        characterAnalysis={characterAnalysis}
        onBack={handleBack}
        birthDate={birthDate}
        name={name}
        userId={userId}
      />
    </>
  );
}