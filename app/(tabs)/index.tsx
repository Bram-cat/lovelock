import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ThemedText from "../../components/ThemedText";
import { useTheme } from "../../contexts/ThemeContext";

const { width } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const { user } = useUser();
  const { theme } = useTheme();
  // Removed premium status - all features are free!
  const [numerologyCount, setNumerologyCount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const questionCount = await AsyncStorage.getItem(
        "numerologyQuestionCount"
      );
      setNumerologyCount(questionCount ? parseInt(questionCount) : 0);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Removed usage limits - all features are now unlimited and free!
  const checkUsageLimit = async (
    featureName: string,
    limit: number,
    currentCount: number
  ) => {
    return true; // Always allow access to all features
  };

  const handleNumerologyPress = async () => {
    // All numerology features are now free and unlimited!
    router.push("/numerology");
  };

  const handleTriviaPress = () => {
    router.push("/(tabs)/trivia");
  };

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  // Removed premium press handler - no longer needed!

  const handleCompatibilityPress = async () => {
    // Navigate to Love Match screen
    router.push("/(tabs)/love-match");
  };

  const handleDailyInsightPress = async () => {
    const canUse = await checkUsageLimit("Daily Insights", 1, 0);
    if (canUse) {
      Alert.alert(
        "Coming Soon",
        "Daily insights feature will be available soon!"
      );
    }
  };

  const handleLoveMatchPress = async () => {
    const canUse = await checkUsageLimit("Love Match", 2, 0);
    if (canUse) {
      Alert.alert("Coming Soon", "Love match feature will be available soon!");
    }
  };

  const getUserName = () => {
    return user?.firstName || "User";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header */}
      <LinearGradient
        colors={theme.gradient as [string, string, ...string[]]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="heart" size={28} color={theme.textOnPrimary} />
              <ThemedText type="onPrimary" style={styles.headerTitle}>Lovelock</ThemedText>
            </View>
            <ThemedText type="onPrimary" style={styles.welcomeSubtitle}>
              Welcome back, {getUserName()}!
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Ionicons name="person-circle" size={32} color={theme.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Discover Your Love Story
          </ThemedText>

          <View style={styles.quickActionsGrid}>
            {/* Numerology Card */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleNumerologyPress}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="calculator" size={32} color="white" />
                </View>
                <ThemedText type="onPrimary" style={styles.quickActionTitle}>
                  Numerology
                </ThemedText>
                <ThemedText type="onPrimary" style={styles.quickActionSubtitle}>
                  Discover your life path
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            {/* Trivia Card */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleTriviaPress}
            >
              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={32}
                    color="white"
                  />
                </View>
                <ThemedText type="onPrimary" style={styles.quickActionTitle}>
                  Love Trivia
                </ThemedText>
                <ThemedText type="onPrimary" style={styles.quickActionSubtitle}>
                  Test your love knowledge
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsGrid}>
            {/* Profile Card */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleProfilePress}
            >
              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="person-circle" size={32} color="white" />
                </View>
                <ThemedText type="onPrimary" style={styles.quickActionTitle}>Profile</ThemedText>
                <ThemedText type="onPrimary" style={styles.quickActionSubtitle}>
                  Manage your account
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            {/* All Features Free Card */}
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleCompatibilityPress}
            >
              <LinearGradient
                colors={["#ff9a9e", "#fecfef"]}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="heart" size={32} color="white" />
                </View>
                <ThemedText type="onPrimary" style={styles.quickActionTitle}>Love Match</ThemedText>
                <ThemedText type="onPrimary" style={styles.quickActionSubtitle}>
                  Find your compatibility
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <ThemedText type="title" style={styles.sectionTitle}>Featured for You</ThemedText>

          {/* Main Feature Card */}
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={handleNumerologyPress}
          >
            <LinearGradient
              colors={theme.gradient as [string, string, ...string[]]}
              style={styles.featuredCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featuredCardContent}>
                <View style={styles.featuredCardLeft}>
                  <View style={styles.featuredIcon}>
                    <Ionicons name="star" size={40} color="white" />
                  </View>
                  <View style={styles.featuredTextContainer}>
                    <ThemedText type="onPrimary" style={styles.featuredTitle}>
                      Personalized Reading
                    </ThemedText>
                    <ThemedText type="onPrimary" style={styles.featuredSubtitle}>
                      Get insights into your personality and relationship
                      compatibility
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.featuredArrow}>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Love Trivia Card */}
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={handleTriviaPress}
          >
            <LinearGradient
              colors={["#f093fb", "#f5576c"]}
              style={styles.featuredCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featuredCardContent}>
                <View style={styles.featuredCardLeft}>
                  <View style={styles.featuredIcon}>
                    <Ionicons name="game-controller" size={40} color="white" />
                  </View>
                  <View style={styles.featuredTextContainer}>
                    <ThemedText type="onPrimary" style={styles.featuredTitle}>
                      Couples Entertainment
                    </ThemedText>
                    <ThemedText type="onPrimary" style={styles.featuredSubtitle}>
                      Discover fun trivia, movies, and activities perfect for
                      couples
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.featuredArrow}>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  profileButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  quickActionsContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  quickActionIcon: {
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 5,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 16,
  },
  featuredSection: {
    marginBottom: 30,
  },
  featuredCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  featuredCardGradient: {
    padding: 20,
  },
  featuredCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featuredCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  featuredIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  featuredArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacing: {
    height: 30,
  },
  // Legacy styles for compatibility
  cardGradient: {
    padding: 25,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featureCardIcon: {
    width: 60,
    height: 60,
    marginRight: 15,
    position: "relative",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    color: "white",
    lineHeight: 24,
  },
  highlightText: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  featureCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
