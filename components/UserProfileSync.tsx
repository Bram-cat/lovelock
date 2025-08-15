import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../convex/_generated/api";

export default function UserProfileSync() {
  const { user, isLoaded } = useUser();
  const createOrUpdateUserProfile = useMutation(
    api.userProfiles.createOrUpdateUserProfile
  );

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user profile with Convex
      const syncUserProfile = async () => {
        try {
          await createOrUpdateUserProfile({
            email: user.emailAddresses[0]?.emailAddress || "",
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              "Anonymous",
            photoURL: user.imageUrl || undefined,
          });
          console.log("✅ User profile synced with Convex:", user.id);
        } catch (error) {
          console.error("❌ Failed to sync user profile with Convex:", error);
        }
      };

      syncUserProfile();
    }
  }, [isLoaded, user, createOrUpdateUserProfile]);

  return null; // This component doesn't render anything
}
