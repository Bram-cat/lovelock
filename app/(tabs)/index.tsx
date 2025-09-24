import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { useCustomAlert } from "../../components/CustomAlert";
import { NumerologyLoadingSkeleton } from "../../components/LoadingSkeletons";
import { DatePicker, ShadcnButton, ShadcnInput } from "../../components/ui";
import { DesignSystem } from "../../constants/DesignSystem";
import { useProfile } from "../../contexts/ProfileContext";
import NumerologyService from "../../services/NumerologyService";
import { RoxyNumerologyService } from "../../services/ProkeralaNumerologyService";
import SimpleAIService from "../../services/SimpleAIService";
import NumerologyReadingScreen from "../../screens/NumerologyReadingScreen";

export default function NumerologyScreen() {
  const { user } = useUser();
  const { profileData } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [lifePathInfo, setLifePathInfo] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [characterAnalysis, setCharacterAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const name = profileData?.full_name || user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    if (name && name !== "") {
      setFullName(name);
    }

    if (profileData?.birth_date) {
      let formattedDate = profileData.birth_date;
      if (profileData.birth_date.includes("-") && profileData.birth_date.length === 10) {
        const [year, month, day] = profileData.birth_date.split("-");
        formattedDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
      }
      setBirthDate(formattedDate);
    }
  }, [user, profileData]);

  const generateNumerology = async () => {
    if (!fullName.trim()) {
      showAlert("Error", "Please enter your full name");
      return;
    }

    if (!birthDate) {
      showAlert("Error", "Please enter your birth date");
      return;
    }

    const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!datePattern.test(birthDate)) {
      showAlert("Error", "Please enter birth date in MM/DD/YYYY format");
      return;
    }

    setLoading(true);

    try {
      const [month, day, year] = birthDate.split("/").map(Number);
      const numerologyProfile = await NumerologyService.calculateNumerology(fullName, birthDate);
      const roxyProfile = await RoxyNumerologyService.getNumerologyProfile(fullName, day, month, year);

      const lifePathDetails = NumerologyService.getLifePathDetails(numerologyProfile.lifePathNumber);

      const predictionsData = [
        { category: "Love & Relationships", icon: "heart", timeframe: "This Month", prediction: lifePathDetails.loveCompatibility },
        { category: "Career & Finance", icon: "briefcase", timeframe: "Next 3 Months", prediction: lifePathDetails.careerGuidance },
        { category: "Personal Growth", icon: "trending-up", timeframe: "This Year", prediction: lifePathDetails.personalGrowth },
      ];

      const analysis = await SimpleAIService.generateAllNumerologyInsights(fullName, roxyProfile, "character-only");

      setProfile(numerologyProfile);
      setLifePathInfo(lifePathDetails);
      setPredictions(predictionsData);
      setCharacterAnalysis(analysis.characterAnalysis);
      setShowInput(false);
    } catch (error) {
      console.error("Error generating numerology:", error);
      showAlert("Error", "Failed to generate numerology reading. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetReading = () => {
    setProfile(null);
    setLifePathInfo(null);
    setPredictions([]);
    setCharacterAnalysis("");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await generateNumerology();
    setRefreshing(false);
  };

  if (loading) {
    return <NumerologyLoadingSkeleton />;
  }

  if (profile && lifePathInfo) {
    return (
      <NumerologyReadingScreen
        profile={profile}
        lifePathInfo={lifePathInfo}
        predictions={predictions}
        characterAnalysis={characterAnalysis}
        onBack={resetReading}
        birthDate={birthDate}
        name={fullName}
        userId={user?.id}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AlertComponent />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9b59b6" />}
      >
        <View style={styles.header}>
          <Ionicons name="sparkles" size={48} color={DesignSystem.colors.primary.solidPurple} />
          <Text style={styles.title}>Numerology Reading</Text>
          <Text style={styles.description}>
            Discover your life path, destiny, and soul purpose through the ancient wisdom of numbers
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
              value={birthDate ? new Date(birthDate) : undefined}
              onChange={(date) => {
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