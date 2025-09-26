import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCustomAlert } from "../../components/CustomAlert";
import { NumerologyLoadingSkeleton } from "../../components/LoadingSkeletons";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import { DesignSystem } from "../../constants/DesignSystem";
import { useProfile } from "../../contexts/ProfileContext";
import NumerologyReadingScreen from "../../screens/NumerologyReadingScreen";
import NumerologyAIChatScreen from "../../screens/NumerologyAIChatScreen";
import NumerologyService from "../../services/NumerologyService";
import { RoxyNumerologyService } from "../../services/ProkeralaNumerologyService";
import SimpleAIService from "../../services/SimpleAIService";

export default function NumerologyScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [showInput, setShowInput] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [lifePathInfo, setLifePathInfo] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [characterAnalysis, setCharacterAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  const displayName = useMemo(() => {
    if (profileData?.full_name) return profileData.full_name.split(" ")[0];
    if (user?.firstName) return user.firstName;
    if (user?.fullName) return user.fullName.split(" ")[0];
    return "Beautiful Soul";
  }, [profileData?.full_name, user?.firstName, user?.fullName]);

  useEffect(() => {
    const name =
      profileData?.full_name ||
      user?.fullName ||
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    if (name && name !== "") {
      setFullName(name);
      if (!profile) setShowInput(true);
    }

    if (profileData?.birth_date) {
      let formattedDate = profileData.birth_date;
      if (
        profileData.birth_date.includes("-") &&
        profileData.birth_date.length === 10
      ) {
        const [year, month, day] = profileData.birth_date.split("-");
        formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
      }
      setBirthDate(formattedDate);
    }
  }, [user, profileData, profile]);

  useEffect(() => {
    if (profile) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
    }
  }, [profile]);

  const generateNumerology = async () => {
    if (!fullName.trim()) {
      showAlert({ title: "Error", message: "Please enter your full name" });
      return;
    }

    if (!birthDate) {
      showAlert({ title: "Error", message: "Please enter your birth date" });
      return;
    }

    const datePattern =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!datePattern.test(birthDate)) {
      showAlert({
        title: "Error",
        message: "Please enter birth date in MM/DD/YYYY format",
      });
      return;
    }

    setLoading(true);

    try {
      const [month, day, year] = birthDate.split("/").map(Number);
      const numerologyProfile = NumerologyService.generateProfile(
        fullName,
        birthDate
      );
      const roxyProfile = await RoxyNumerologyService.getNumerologyReading(
        fullName.split(" ")[0] || "",
        fullName.split(" ").slice(1).join(" ") || "",
        birthDate,
        ""
      );

      const lifePathDetails = NumerologyService.getLifePathInfo(
        numerologyProfile.lifePathNumber
      );

      const predictionsData = [
        {
          category: "Love & Relationships",
          timeframe: "This Month",
          predictions: [lifePathDetails.loveCompatibility || "Your love life is influenced by your life path number."]
        },
        {
          category: "Career & Finance",
          timeframe: "Next 3 Months",
          predictions: [lifePathDetails.careerGuidance || "Your career path aligns with your numerological profile."]
        },
        {
          category: "Personal Growth",
          timeframe: "This Year",
          predictions: [lifePathDetails.lifeApproach || "Focus on personal development and growth."]
        },
      ];

      const analysis = await SimpleAIService.generateAllNumerologyInsights(
        fullName,
        numerologyProfile,
        "character-only"
      );

      // Create enhanced profile with Roxy data
      const enhancedProfile = {
        ...numerologyProfile,
        roxyInsights: roxyProfile ? {
          strengths: Array.isArray(roxyProfile.strengths) ? roxyProfile.strengths : [],
          challenges: Array.isArray(roxyProfile.challenges) ? roxyProfile.challenges : [],
          career: roxyProfile.career_guidance || "",
          relationship: roxyProfile.relationship_guidance || "",
          spiritual: roxyProfile.spiritual_guidance || "",
          luckyNumbers: Array.isArray(roxyProfile.lucky_numbers) ? roxyProfile.lucky_numbers : [],
          luckyColors: Array.isArray(roxyProfile.lucky_colors) ? roxyProfile.lucky_colors : [],
          lifePathDescription: roxyProfile.life_path_description || "",
          personalYear: roxyProfile.personal_year_number || (new Date().getFullYear() % 9) + 1,
        } : null
      };

      setProfile(enhancedProfile);
      setLifePathInfo(lifePathDetails);
      setPredictions(predictionsData);
      setCharacterAnalysis(analysis.characterAnalysis);
      setShowInput(false);
    } catch (error) {
      console.error("Error generating numerology:", error);
      showAlert({
        title: "Error",
        message: "Failed to generate numerology reading. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetReading = () => {
    setProfile(null);
    setLifePathInfo(null);
    setPredictions([]);
    setCharacterAnalysis("");
    setShowInput(true);
    setShowAIChat(false);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
  };

  const showAIChatScreen = () => {
    setShowAIChat(true);
  };

  const hideAIChatScreen = () => {
    setShowAIChat(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await generateNumerology();
    setRefreshing(false);
  };

  if (loading) {
    return <NumerologyLoadingSkeleton />;
  }

  if (showAIChat && profile && lifePathInfo) {
    return (
      <NumerologyAIChatScreen
        profile={profile}
        lifePathInfo={lifePathInfo}
        predictions={predictions}
        characterAnalysis={characterAnalysis}
        onBack={hideAIChatScreen}
        birthDate={birthDate}
        name={fullName}
        userId={user?.id}
      />
    );
  }

  if (profile && lifePathInfo) {
    return (
      <NumerologyReadingScreen
        profile={profile}
        lifePathInfo={lifePathInfo}
        predictions={predictions}
        characterAnalysis={characterAnalysis}
        onBack={resetReading}
        onShowAIChat={showAIChatScreen}
        birthDate={birthDate}
        name={fullName}
        userId={user?.id}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Alert component is now available via useCustomAlert hook */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9b59b6"
          />
        }
      >
        <View style={styles.header}>
          <Ionicons
            name="sparkles"
            size={48}
            color={DesignSystem.colors.primary.solidPurple}
          />
          <Text style={styles.title}>Numerology Reading</Text>
          <Text style={styles.description}>
            Discover your life path, destiny, and soul purpose through the
            ancient wisdom of numbers
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Your Information</Text>

          <View style={styles.inputContainer}>
            <ShadcnInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <DatePicker
              label="Birth Date (MM/DD/YYYY)"
              value={birthDate ? (() => {
                try {
                  // Handle MM/DD/YYYY format
                  if (birthDate.includes('/')) {
                    const [month, day, year] = birthDate.split('/');
                    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  }
                  // Handle YYYY-MM-DD format
                  if (birthDate.includes('-')) {
                    const [year, month, day] = birthDate.split('-');
                    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  }
                  return new Date(birthDate);
                } catch {
                  return undefined;
                }
              })() : undefined}
              onSelect={(date) => {
                if (date) {
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const year = date.getFullYear();
                  setBirthDate(`${month}/${day}/${year}`);
                }
              }}
              placeholder="Select your birth date"
            />
          </View>

          <ShadcnButton
            onPress={generateNumerology}
            disabled={loading || !fullName.trim() || !birthDate}
            loading={loading}
            variant="default"
            size="lg"
            endIcon="arrow-forward"
            style={styles.generateButton}
          >
            {loading ? "Generating..." : "Generate Reading"}
          </ShadcnButton>
        </View>
      </ScrollView>
      {AlertComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  generateButton: {
    marginTop: 16,
  },
});
