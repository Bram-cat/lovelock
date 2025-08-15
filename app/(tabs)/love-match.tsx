import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import ThemedText from "../../components/ThemedText";
import { useTheme } from "../../contexts/ThemeContext";

// Comprehensive numerology calculations
const reduceToSingleDigit = (num: number): number => {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return num;
};

const calculateLifePath = (birthday: string) => {
  const [month, day, year] = birthday.split('/').map(Number);
  const sum = month + day + year;
  return reduceToSingleDigit(sum);
};

const calculateNameNumber = (name: string) => {
  const letterValues: { [key: string]: number } = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
  };
  
  const sum = name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((acc, letter) => {
    return acc + (letterValues[letter] || 0);
  }, 0);
  
  return reduceToSingleDigit(sum);
};

const calculateSoulUrge = (name: string) => {
  const vowels = 'AEIOU';
  const letterValues: { [key: string]: number } = {
    A: 1, E: 5, I: 9, O: 6, U: 3
  };
  
  const sum = name.toUpperCase().split('').reduce((acc, letter) => {
    return vowels.includes(letter) ? acc + (letterValues[letter] || 0) : acc;
  }, 0);
  
  return reduceToSingleDigit(sum);
};

const calculatePersonality = (name: string) => {
  const vowels = 'AEIOU';
  const letterValues: { [key: string]: number } = {
    B: 2, C: 3, D: 4, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4,
    N: 5, P: 7, Q: 8, R: 9, S: 1, T: 2, V: 4, W: 5, X: 6, Y: 7, Z: 8
  };
  
  const sum = name.toUpperCase().split('').reduce((acc, letter) => {
    return !vowels.includes(letter) && letter.match(/[A-Z]/) ? acc + (letterValues[letter] || 0) : acc;
  }, 0);
  
  return reduceToSingleDigit(sum);
};

const calculateBirthDay = (birthday: string) => {
  const [, day] = birthday.split('/').map(Number);
  return reduceToSingleDigit(day);
};

const isValidDate = (dateString: string) => {
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const [month, day, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const getCompatibilityScore = (num1: number, num2: number) => {
  // Compatibility matrix based on numerology principles
  const compatibilityMatrix: { [key: number]: { [key: number]: number } } = {
    1: { 1: 85, 2: 70, 3: 90, 4: 60, 5: 95, 6: 75, 7: 65, 8: 80, 9: 85 },
    2: { 1: 70, 2: 80, 3: 75, 4: 85, 5: 60, 6: 95, 7: 70, 8: 75, 9: 80 },
    3: { 1: 90, 2: 75, 3: 85, 4: 65, 5: 80, 6: 70, 7: 75, 8: 60, 9: 95 },
    4: { 1: 60, 2: 85, 3: 65, 4: 80, 5: 70, 6: 80, 7: 85, 8: 90, 9: 70 },
    5: { 1: 95, 2: 60, 3: 80, 4: 70, 5: 85, 6: 65, 7: 90, 8: 75, 9: 80 },
    6: { 1: 75, 2: 95, 3: 70, 4: 80, 5: 65, 6: 85, 7: 75, 8: 70, 9: 85 },
    7: { 1: 65, 2: 70, 3: 75, 4: 85, 5: 90, 6: 75, 7: 80, 8: 65, 9: 90 },
    8: { 1: 80, 2: 75, 3: 60, 4: 90, 5: 75, 6: 70, 7: 65, 8: 85, 9: 75 },
    9: { 1: 85, 2: 80, 3: 95, 4: 70, 5: 80, 6: 85, 7: 90, 8: 75, 9: 90 }
  };
  
  return compatibilityMatrix[num1]?.[num2] || 50;
};

const getCompatibilityDescription = (score: number): string => {
  if (score >= 90) return "Exceptional harmony and deep understanding";
  if (score >= 80) return "Strong connection with great potential";
  if (score >= 70) return "Good compatibility with mutual growth";
  if (score >= 60) return "Moderate compatibility requiring effort";
  return "Challenging match needing significant work";
};

// Generate compatible birth dates (month/day combinations)
const generateCompatibleBirthDates = (userLifePath: number): string[] => {
  const compatibleDates: string[] = [];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Find dates that would create compatible life path numbers
  const compatibleLifePaths = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(num => ({ num, score: getCompatibilityScore(userLifePath, num) }))
    .filter(item => item.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.num);
  
  // Ensure we get one date from each month
  for (let month = 1; month <= 12; month++) {
    let foundDateForMonth = false;
    
    // Try to find a compatible date for this month
    for (let day = 1; day <= daysInMonth[month - 1] && !foundDateForMonth; day++) {
      const currentYear = new Date().getFullYear();
      const testDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${currentYear}`;
      const lifePath = calculateLifePath(testDate);
      
      if (compatibleLifePaths.includes(lifePath)) {
        const monthName = monthNames[month - 1];
        const dayStr = day.toString();
        compatibleDates.push(`${monthName} ${dayStr}`);
        foundDateForMonth = true;
      }
    }
    
    // If no compatible date found, use a moderately compatible one
    if (!foundDateForMonth) {
      // Find a date with at least 60% compatibility
      for (let day = 1; day <= daysInMonth[month - 1] && !foundDateForMonth; day++) {
        const currentYear = new Date().getFullYear();
        const testDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${currentYear}`;
        const lifePath = calculateLifePath(testDate);
        const score = getCompatibilityScore(userLifePath, lifePath);
        
        if (score >= 60) {
          const monthName = monthNames[month - 1];
          const dayStr = day.toString();
          compatibleDates.push(`${monthName} ${dayStr}`);
          foundDateForMonth = true;
        }
      }
    }
    
    // If still no date found, just use the 15th of the month
    if (!foundDateForMonth) {
      const monthName = monthNames[month - 1];
      compatibleDates.push(`${monthName} 15`);
    }
  }
  
  return compatibleDates;
};

const generateCompatibilityReport = (userNumbers: any) => {
  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const compatibilityData = allNumbers.map(num => ({
    number: num,
    score: getCompatibilityScore(userNumbers.lifePath, num),
    description: getCompatibilityDescription(getCompatibilityScore(userNumbers.lifePath, num))
  }));
  return compatibilityData.sort((a, b) => b.score - a.score);
};

export default function LoveMatchScreen() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleBirthdayChange = (text: string, setter: (value: string) => void) => {
    // Auto-format birthday input with slashes
    let formatted = text.replace(/\D/g, ''); // Remove non-digits
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
    }
    setter(formatted);
  };

  const generateLoveMatch = async () => {
    if (!name.trim() || !birthday.trim()) {
      Alert.alert('Error', 'Please fill in your name and birthday');
      return;
    }

    if (!isValidDate(birthday)) {
      Alert.alert('Error', 'Please enter a valid date in MM/DD/YYYY format');
      return;
    }

    setLoading(true);

    try {
      // Calculate all numerology numbers for the user
      const userNumbers = {
        lifePath: calculateLifePath(birthday),
        expression: calculateNameNumber(name),
        soulUrge: calculateSoulUrge(name),
        personality: calculatePersonality(name),
        birthDay: calculateBirthDay(birthday),
      };

      // Generate compatibility report for all numbers 1-9
      const compatibilityReport = [];
      for (let i = 1; i <= 9; i++) {
        const score = getCompatibilityScore(userNumbers.lifePath, i);
        const description = getCompatibilityDescription(score);
        compatibilityReport.push({
          number: i,
          score,
          description,
        });
      }

      // Sort by compatibility score (highest first)
      compatibilityReport.sort((a, b) => b.score - a.score);

      // Generate compatible birth dates
      const compatibleDates = generateCompatibleBirthDates(userNumbers.lifePath);

      setResult({
        name,
        birthday,
        userNumbers,
        compatibilityReport,
        compatibleDates,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate love match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setBirthday('');
    setResult(null);
    setLoading(false);
  };

  const getCompatibilityColor = (rating: number) => {
    if (rating >= 90) return "#4CAF50"; // Green
    if (rating >= 75) return "#8BC34A"; // Light Green
    if (rating >= 60) return "#FFC107"; // Yellow
    if (rating >= 45) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  const getCompatibilityText = (rating: number) => {
    if (rating >= 90) return "Excellent Match";
    if (rating >= 75) return "Great Match";
    if (rating >= 60) return "Good Match";
    if (rating >= 45) return "Fair Match";
    return "Challenging Match";
  };

  // Results Screen
  if (result) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient
            colors={["#ff9a9e", "#fecfef"] as const}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={resetForm}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Your Love Match Profile</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Complete numerological analysis
            </ThemedText>
          </LinearGradient>

          {/* Your Numbers */}
          <View style={[styles.numbersCard, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
              {result.name}
            </ThemedText>
            <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Born: {result.birthday}
            </ThemedText>
            <View style={styles.numbersGrid}>
              <View style={styles.numberItem}>
                <ThemedText style={[styles.numberLabel, { color: theme.textSecondary }]}>
                  Life Path
                </ThemedText>
                <ThemedText style={[styles.numberValue, { color: theme.text }]}>
                  {result.userNumbers.lifePath}
                </ThemedText>
              </View>
              <View style={styles.numberItem}>
                <ThemedText style={[styles.numberLabel, { color: theme.textSecondary }]}>
                  Expression
                </ThemedText>
                <ThemedText style={[styles.numberValue, { color: theme.text }]}>
                  {result.userNumbers.expression}
                </ThemedText>
              </View>
              <View style={styles.numberItem}>
                <ThemedText style={[styles.numberLabel, { color: theme.textSecondary }]}>
                  Soul Urge
                </ThemedText>
                <ThemedText style={[styles.numberValue, { color: theme.text }]}>
                  {result.userNumbers.soulUrge}
                </ThemedText>
              </View>
              <View style={styles.numberItem}>
                <ThemedText style={[styles.numberLabel, { color: theme.textSecondary }]}>
                  Personality
                </ThemedText>
                <ThemedText style={[styles.numberValue, { color: theme.text }]}>
                  {result.userNumbers.personality}
                </ThemedText>
              </View>
              <View style={styles.numberItem}>
                <ThemedText style={[styles.numberLabel, { color: theme.textSecondary }]}>
                  Birth Day
                </ThemedText>
                <ThemedText style={[styles.numberValue, { color: theme.text }]}>
                  {result.userNumbers.birthDay}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Compatibility Report */}
          <View style={[styles.compatibleCard, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
              Compatible Life Path Numbers
            </ThemedText>
            {result.compatibilityReport.slice(0, 5).map((item: any, index: number) => (
              <View key={index} style={[styles.compatibilityItem, { borderBottomColor: theme.border }]}>
                <View style={styles.compatibilityHeader}>
                  <View style={[styles.numberChip, { backgroundColor: theme.background }]}>
                    <ThemedText style={[styles.numberChipText, { color: theme.text }]}>
                      {item.number}
                    </ThemedText>
                  </View>
                  <View style={styles.scoreContainer}>
                    <ThemedText style={[styles.scoreText, { color: getCompatibilityColor(item.score) }]}>
                      {item.score}%
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.compatibilityDescription, { color: theme.textSecondary }]}>
                  {item.description}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Compatible Birth Dates */}
          <View style={[styles.compatibleCard, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>
              Compatible Partner Birth Dates
            </ThemedText>
            <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              People born on these dates would be most compatible with you
            </ThemedText>
            <View style={styles.datesGrid}>
              {result.compatibleDates.map((date: string, index: number) => (
                <View key={index} style={[styles.dateChip, { backgroundColor: theme.background }]}>
                  <ThemedText style={[styles.dateText, { color: theme.text }]}>
                    {date}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText style={[styles.datesHint, { color: theme.textSecondary }]}>
              These are month/day combinations that create the most compatible life path numbers
            </ThemedText>
          </View>

          {/* Try Again Button */}
          <TouchableOpacity style={styles.tryAgainButton} onPress={resetForm}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.tryAgainGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <ThemedText style={styles.tryAgainText}>Try Again</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Input Screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={["#ff9a9e", "#fecfef"]}
          style={styles.header}
        >
          <Ionicons name="heart" size={40} color="white" style={styles.headerIcon} />
          <ThemedText style={styles.headerTitle}>Love Match</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Discover your numerological compatibility
          </ThemedText>
        </LinearGradient>

        {/* Your Info Form */}
        <View style={styles.formContainer}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Your Information
          </ThemedText>
          
          <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
              Your Name
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
            <ThemedText style={[styles.inputLabel, { color: theme.text }]}>
              Your Birthday
            </ThemedText>
            <View style={[
              styles.birthdayInputContainer,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}>
              <Ionicons 
                name="calendar" 
                size={20} 
                color={theme.textSecondary} 
                style={styles.birthdayIcon}
              />
              <TextInput
                style={[
                  styles.birthdayInput,
                  { color: theme.text },
                ]}
                value={birthday}
                onChangeText={(text) => handleBirthdayChange(text, setBirthday)}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <ThemedText style={[styles.birthdayHint, { color: theme.textSecondary }]}>
              Format: MM/DD/YYYY (e.g., 03/15/1990)
            </ThemedText>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={generateLoveMatch}
            disabled={loading}
          >
            <LinearGradient
              colors={["#ff9a9e", "#fecfef"]}
              style={styles.actionGradient}
            >
              {loading ? (
                <ThemedText style={styles.actionText}>Generating...</ThemedText>
              ) : (
                <>
                  <Ionicons name="heart" size={20} color="white" />
                  <ThemedText style={styles.actionText}>Generate Love Match</ThemedText>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle" size={24} color={theme.primary} />
          <ThemedText style={[styles.infoTitle, { color: theme.text }]}>
            How It Works
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
            Enter your information to check compatibility with a specific partner, or find your most compatible life path numbers based on numerological principles.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerIcon: {
    marginBottom: 10,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  inputCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginTop: 8,
  },
  birthdayInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  birthdayIcon: {
    marginRight: 8,
  },
  birthdayInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  birthdayHint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    padding: 20,
    gap: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  // Results screen styles
  scoreCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreCircle: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  scoreDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  numbersCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  numbersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  numbersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  numberItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 12,
    minWidth: "30%",
  },
  numberLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  numberValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  compatibilityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  compatibilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  numberChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  numberChipText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  compatibilityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  datesHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  compatibleCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compatibleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 16,
    justifyContent: "center",
  },
  compatibleChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  compatibleNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  compatibleHint: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  tryAgainButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  tryAgainGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  tryAgainText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
