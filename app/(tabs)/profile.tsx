import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeSelector from "../../components/ThemeSelector";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, currentTheme, themeMetadata } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            await AsyncStorage.multiRemove(["user_session", "numerologyQuestionCount"]);
            await signOut();
            router.replace("/(auth)/sign-in");
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(word => word.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Simple Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {user ? getInitials(user.firstName || user.emailAddresses[0]?.emailAddress || "User") : "U"}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.firstName || "User"}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {user?.emailAddresses[0]?.emailAddress || "user@example.com"}
          </Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
          onPress={() => setShowThemeSelector(true)}
        >
          <Ionicons name="color-palette-outline" size={24} color={theme.text} />
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: theme.text }]}>Theme</Text>
            <Text style={[styles.menuSubtext, { color: theme.textSecondary }]}>
              {themeMetadata[currentTheme]?.name || 'Light'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff4757" />
          <Text style={[styles.menuText, { color: "#ff4757" }]}>
            {isLoading ? "Signing Out..." : "Sign Out"}
          </Text>
          {isLoading && <Ionicons name="hourglass-outline" size={20} color="#ff4757" />}
        </TouchableOpacity>
      </View>
      
      <ThemeSelector
        visible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
});
