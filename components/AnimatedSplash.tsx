import React from "react";
import PairedSplashAnimation from "./PairedSplashAnimation";

export default function AnimatedSplash({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <PairedSplashAnimation 
      onComplete={onComplete}
      duration={3500}
    />
  );
}
