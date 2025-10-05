import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Text,
  Dimensions,
  Image,
} from "react-native";
import numberMeaning from "../data/numberMeaning.json";
import { getArchetypeIcon } from "../utils/archetypeIcons";

const { width } = Dimensions.get('window');

interface NumberDetailScreenProps {
  numberType: "LifePathNumber" | "DestinyNumber" | "SoulUrgeNumber";
  number: number | string;
  onBack: () => void;
}

export default function NumberDetailScreen({
  numberType,
  number,
  onBack,
}: NumberDetailScreenProps) {
  const numberData = numberMeaning[numberType];
  const impact = numberData?.impacts?.[number.toString()];

  if (!impact) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Number data not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getNumberTypeTitle = () => {
    switch (numberType) {
      case "LifePathNumber":
        return "Life Path";
      case "DestinyNumber":
        return "Destiny";
      case "SoulUrgeNumber":
        return "Soul Urge";
      default:
        return "Number";
    }
  };

  const getGradientColors = () => {
    switch (numberType) {
      case "LifePathNumber":
        return ["#667eea", "#764ba2"];
      case "DestinyNumber":
        return ["#f093fb", "#f5576c"];
      case "SoulUrgeNumber":
        return ["#4facfe", "#00f2fe"];
      default:
        return ["#667eea", "#764ba2"];
    }
  };


  const colors = getGradientColors();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: colors[0] }]}>
          <Text style={styles.heroNumber}>{number}</Text>
          <Text style={styles.heroTitle}>{getNumberTypeTitle()} Number</Text>
          {typeof impact === 'object' && impact.archetype && (
            <View style={styles.archetypeContainer}>
              <View style={styles.archetypeImageContainer}>
                <Image
                  source={getArchetypeIcon(number)}
                  style={styles.archetypeImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.archetypeText}>{impact.archetype}</Text>
              {impact.alternateArchetype && (
                <Text style={styles.archetypeAlt}>
                  aka {impact.alternateArchetype}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Meaning Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This Number Means</Text>
          <Text style={styles.meaningText}>{numberData.meaning}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            {typeof impact === 'object' ? impact.description : impact}
          </Text>
        </View>

        {/* Keywords (if available) */}
        {typeof impact === 'object' && impact.keywords && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Qualities</Text>
            <View style={styles.keywordsContainer}>
              {impact.keywords.map((keyword: string, index: number) => (
                <View key={index} style={styles.keywordBadge}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Life Lesson */}
        {typeof impact === 'object' && impact.lifeLesson && (
          <View style={[styles.insightCard, styles.lessonCard]}>
            <View style={styles.insightHeader}>
              <Ionicons name="school" size={24} color="white" />
              <Text style={styles.insightTitle}>Life Lesson</Text>
            </View>
            <Text style={styles.insightText}>{impact.lifeLesson}</Text>
          </View>
        )}

        {/* Soul Purpose */}
        {typeof impact === 'object' && impact.soulPurpose && (
          <View style={[styles.insightCard, styles.purposeCard]}>
            <View style={styles.insightHeader}>
              <Ionicons name="star" size={24} color="white" />
              <Text style={styles.insightTitle}>Soul Purpose</Text>
            </View>
            <Text style={styles.insightText}>{impact.soulPurpose}</Text>
          </View>
        )}

        {/* Shadow Side */}
        {typeof impact === 'object' && impact.shadow && (
          <View style={[styles.insightCard, styles.shadowCard]}>
            <View style={styles.insightHeader}>
              <Ionicons name="moon" size={24} color="white" />
              <Text style={styles.insightTitle}>Shadow to Watch For</Text>
            </View>
            <Text style={styles.insightText}>{impact.shadow}</Text>
          </View>
        )}

        {/* Talents (for Destiny) */}
        {typeof impact === 'object' && impact.talents && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Natural Talents</Text>
            <View style={styles.talentsList}>
              {impact.talents.map((talent: string, index: number) => (
                <View key={index} style={styles.talentItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.talentText}>{talent}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expression (for Destiny) */}
        {typeof impact === 'object' && impact.expression && (
          <View style={[styles.insightCard, styles.expressionCard]}>
            <View style={styles.insightHeader}>
              <Ionicons name="color-palette" size={24} color="white" />
              <Text style={styles.insightTitle}>How You Express Yourself</Text>
            </View>
            <Text style={styles.insightText}>{impact.expression}</Text>
          </View>
        )}

        {/* Desire (for Soul Urge) */}
        {typeof impact === 'object' && impact.desire && (
          <View style={[styles.insightCard, styles.desireCard]}>
            <View style={styles.insightHeader}>
              <Ionicons name="heart" size={24} color="white" />
              <Text style={styles.insightTitle}>Your Heart's Desire</Text>
            </View>
            <Text style={styles.insightText}>{impact.desire}</Text>
          </View>
        )}

        {/* Fulfillment (for Soul Urge) */}
        {typeof impact === 'object' && impact.fulfillment && (
          <View style={[styles.insightCard, styles.fulfillmentCard]}>
            <View style={styles.insightHeader}>
              <Ionicons name="sparkles" size={24} color="white" />
              <Text style={styles.insightTitle}>Path to Fulfillment</Text>
            </View>
            <Text style={styles.insightText}>{impact.fulfillment}</Text>
          </View>
        )}

        {/* Affirmation */}
        {typeof impact === 'object' && impact.affirmation && (
          <View style={[styles.affirmationCard, { backgroundColor: colors[0] }]}>
            <Text style={styles.affirmationLabel}>Daily Affirmation</Text>
            <Text style={styles.affirmationText}>"{impact.affirmation}"</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#000000",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  heroNumber: {
    fontSize: 72,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  archetypeContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  archetypeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  archetypeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  archetypeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  archetypeAlt: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  meaningText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#D1D1D6",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  descriptionCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#FFFFFF",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  keywordBadge: {
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  keywordText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  insightCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lessonCard: {
    backgroundColor: "#F59E0B",
  },
  purposeCard: {
    backgroundColor: "#8B5CF6",
  },
  shadowCard: {
    backgroundColor: "#6366F1",
  },
  expressionCard: {
    backgroundColor: "#10B981",
  },
  desireCard: {
    backgroundColor: "#EC4899",
  },
  fulfillmentCard: {
    backgroundColor: "#3B82F6",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  talentsList: {
    gap: 12,
  },
  talentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  talentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  affirmationCard: {
    borderRadius: 28,
    padding: 32,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  affirmationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  affirmationText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 18,
  },
  bottomSpacing: {
    height: 40,
  },
});
