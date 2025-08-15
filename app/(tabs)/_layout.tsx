import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import ThemedText from "../../components/ThemedText";

const { width: screenWidth } = Dimensions.get("window");
const isIOS = Platform.OS === "ios";

// Tab configuration with theme-aware colors
const tabs = [
  {
    name: "index",
    route: "/",
    title: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "numerology",
    route: "/numerology",
    title: "Numbers",
    icon: "calculator-outline",
    activeIcon: "calculator",
  },
  {
    name: "trivia",
    route: "/trivia",
    title: "Trivia",
    icon: "bulb-outline",
    activeIcon: "bulb",
  },
  {
    name: "love-match",
    route: "/love-match",
    title: "Love Match",
    icon: "heart-outline",
    activeIcon: "heart",
  },
  {
    name: "profile",
    route: "/profile",
    title: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

function ThemedNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderTopColor: theme.border },
      ]}
    >
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.route;
        const isHovered = hoveredTab === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tabItem]}
            onPress={() => handleTabPress(tab.route)}
            onPressIn={() => setHoveredTab(tab.name)}
            onPressOut={() => setHoveredTab(null)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                isActive && {
                  backgroundColor: theme.primary + "20",
                  borderRadius: 12,
                  transform: [{ scale: 1.1 }],
                },
                isHovered &&
                  !isActive && {
                    backgroundColor: theme.primary + "10",
                    borderRadius: 8,
                    transform: [{ scale: 1.05 }],
                  },
              ]}
            >
              <Ionicons
                name={isActive ? (tab.activeIcon as any) : (tab.icon as any)}
                size={isActive ? 26 : 24}
                color={
                  isActive
                    ? theme.primary
                    : isHovered
                      ? theme.primary
                      : theme.textSecondary
                }
              />
            </Animated.View>
            <ThemedText
              type={isActive ? "default" : "secondary"}
              style={[
                styles.tabLabel,
                {
                  fontWeight: isActive ? "700" : isHovered ? "600" : "500",
                },
              ]}
            >
              {tab.title}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.layoutContainer, { backgroundColor: theme.background }]}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // Hide default tab bar
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="numerology" />
        <Tabs.Screen name="trivia" />
        <Tabs.Screen name="love-match" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <ThemedNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: isIOS ? 34 : 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});
