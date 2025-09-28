import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Dimensions,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase-client";
import { useProfile } from "../../contexts/ProfileContext";
import { DatePicker } from "../../components/ui";
import { useAlert } from "../../contexts/AlertContext";
import { useSubscription } from "../../hooks/useSubscription";
import { useSecureAuth } from "../../services/SecureAuthService";
import PremiumSubscriptionCard from "../../components/PremiumSubscriptionCard";
import { SubscriptionService, UsageStats } from "../../services/SubscriptionService";

interface UserProfile {
  id?: string;
  user_id: string;
  email: string;
  full_name: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  wants_premium?: boolean;
  wants_notifications?: boolean;
  agreed_to_terms?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { profileData, updateProfile, loading: profileLoading } = useProfile();
  const { showSuccess, showError, showConfirm } = useAlert();
  const { subscription, openPricingPage } = useSubscription();
  const { redirectToWebApp } = useSecureAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    birth_date: "",
    birth_location: "",
    birth_time: "",
  });

  // Load usage statistics
  const loadUsageStats = async () => {
    if (!user?.id) return;

    try {
      setLoadingUsage(true);
      const stats = await SubscriptionService.getUsageStats(user.id);
      setUsageStats(stats);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => {
    if (profileData) {
      // Convert birth_date from YYYY-MM-DD (database) to MM/DD/YYYY (form display)
      let formattedBirthDate = "";
      if (profileData.birth_date) {
        try {
          if (profileData.birth_date.includes("-") && profileData.birth_date.length === 10) {
            const [year, month, day] = profileData.birth_date.split("-");
            formattedBirthDate = `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
          }
        } catch (error) {
          console.error("Error formatting birth date:", error);
          formattedBirthDate = profileData.birth_date;
        }
      }

      setEditForm({
        full_name: profileData.full_name || "",
        birth_date: formattedBirthDate,
        birth_location: profileData.birth_location || "",
        birth_time: profileData.birth_time || "",
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (user?.id) {
      loadUsageStats();
    }
  }, [user?.id]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.full_name.trim()) {
      showError("Name is required", "Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      // Convert birth_date from MM/DD/YYYY (form) to YYYY-MM-DD (database)
      let formattedBirthDate = editForm.birth_date;
      if (editForm.birth_date && editForm.birth_date.includes("/")) {
        const [month, day, year] = editForm.birth_date.split("/");
        if (month && day && year && year.length === 4) {
          formattedBirthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }

      const updatedData = {
        full_name: editForm.full_name.trim(),
        birth_date: formattedBirthDate || null,
        birth_location: editForm.birth_location.trim() || null,
        birth_time: editForm.birth_time.trim() || null,
      };

      const success = await updateProfile(updatedData);
      if (success) {
        setShowEditModal(false);
        showSuccess("Profile Updated", "Your profile has been saved successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Update Failed", "Unable to update your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    showConfirm(
      "Sign Out",
      "Are you sure you want to sign out?",
      () => signOut(),
      () => {} // onCancel - do nothing
    );
  };

  const handleUpgrade = async () => {
    try {
      const websiteUrl = 'https://lovelock.it.com';
      const canOpen = await Linking.canOpenURL(websiteUrl);
      if (canOpen) {
        await Linking.openURL(websiteUrl);
      } else {
        await Linking.openURL(websiteUrl);
      }
    } catch (error) {
      console.error('Subscription redirect error:', error);
    }
  };

  const handleBillingHistory = async () => {
    try {
      const websiteUrl = 'https://lovelock.it.com';
      const canOpen = await Linking.canOpenURL(websiteUrl);
      if (canOpen) {
        await Linking.openURL(websiteUrl);
      } else {
        await Linking.openURL(websiteUrl);
      }
    } catch (error) {
      console.error('Billing redirect error:', error);
    }
  };

  const handlePrivacyPolicy = async () => {
    try {
      const websiteUrl = 'https://lovelock.it.com';
      const canOpen = await Linking.canOpenURL(websiteUrl);
      if (canOpen) {
        await Linking.openURL(websiteUrl);
      } else {
        await Linking.openURL(websiteUrl);
      }
    } catch (error) {
      console.error('Privacy policy redirect error:', error);
    }
  };

  const handleHelpFAQ = async () => {
    try {
      // Redirect to Lovelock Reddit community for FAQ and questions
      const redditUrl = "https://www.reddit.com/r/Lovelock/";

      const canOpen = await Linking.canOpenURL(redditUrl);
      if (canOpen) {
        await Linking.openURL(redditUrl);
      } else {
        throw new Error('Cannot open Reddit URL');
      }
    } catch (error) {
      console.error('Reddit FAQ redirect error:', error);
      showError("Redirect Failed", "Unable to open FAQ page. Please check your internet connection and try again.");
    }
  };

  const handleRateApp = async () => {
    try {
      // For iOS App Store
      const iosAppStoreUrl = 'https://apps.apple.com/app/lovelock/id[YOUR_APP_ID]';
      // For Google Play Store
      const androidPlayStoreUrl = 'https://play.google.com/store/apps/details?id=com.lovelock.app';

      const storeUrl = Platform.OS === 'ios' ? iosAppStoreUrl : androidPlayStoreUrl;

      const canOpen = await Linking.canOpenURL(storeUrl);
      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else {
        throw new Error('Cannot open app store URL');
      }
    } catch (error) {
      showError("Redirect Failed", "Unable to open app store. Please search for 'Lovelock' in your app store.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]?.toUpperCase() || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profileData?.full_name || "Welcome"}</Text>
              <Text style={styles.email}>{user?.emailAddresses?.[0]?.emailAddress}</Text>
            </View>
          </View>
        </View>

        {/* Subscription Status - Only show for non-premium users */}
        {subscription && !subscription.hasPremiumPlan && (
          <View style={styles.section}>
            <PremiumSubscriptionCard
              onUpgradePress={handleUpgrade}
            />
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
              <Ionicons name="pencil" size={18} color="#E91E63" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{profileData?.full_name || "Not set"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Birth Date</Text>
              <Text style={styles.infoValue}>{profileData?.birth_date || "Not set"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Birth Location</Text>
              <Text style={styles.infoValue}>{profileData?.birth_location || "Not set"}</Text>
            </View>
          </View>
        </View>

        {/* Usage Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Usage Statistics</Text>
            <TouchableOpacity onPress={loadUsageStats} style={styles.editButton}>
              <Ionicons name="refresh" size={18} color="#E91E63" />
              <Text style={styles.editButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loadingUsage ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading usage statistics...</Text>
            </View>
          ) : usageStats ? (
            <View style={styles.usageStatsContainer}>
              {/* Subscription Status */}
              <View style={styles.usageHeader}>
                <View style={styles.subscriptionBadge}>
                  <Ionicons
                    name={subscription?.hasUnlimitedPlan ? "infinite" : subscription?.hasPremiumPlan ? "diamond" : "star-outline"}
                    size={16}
                    color={subscription?.hasUnlimitedPlan ? "#FF9500" : subscription?.hasPremiumPlan ? "#FFD700" : "#8E8E93"}
                  />
                  <Text style={[
                    styles.subscriptionText,
                    subscription?.hasUnlimitedPlan && styles.unlimitedText,
                    subscription?.hasPremiumPlan && !subscription?.hasUnlimitedPlan && styles.premiumText
                  ]}>
                    {subscription?.hasUnlimitedPlan ? "Unlimited" : subscription?.hasPremiumPlan ? "Premium" : "Free Plan"}
                  </Text>
                </View>
                <Text style={styles.monthlyUsageText}>This Month</Text>
              </View>

              {/* Usage Cards */}
              <View style={styles.usageGrid}>
                <View style={styles.usageCard}>
                  <View style={styles.usageCardHeader}>
                    <Ionicons name="calculator" size={20} color="#667eea" />
                    <Text style={styles.usageCardTitle}>Numerology</Text>
                  </View>
                  <View style={styles.usageProgressContainer}>
                    <View style={styles.usageProgressBar}>
                      <View
                        style={[
                          styles.usageProgressFill,
                          { width: `${Math.min((Math.min(usageStats.numerology.used, usageStats.numerology.limit) / usageStats.numerology.limit) * 100, 100)}%` },
                          { backgroundColor: usageStats.numerology.used >= usageStats.numerology.limit ? "#FF3B30" : "#667eea" }
                        ]}
                      />
                    </View>
                    <Text style={styles.usageText}>
                      {Math.min(usageStats.numerology.used, usageStats.numerology.limit)} / {usageStats.numerology.limit}
                    </Text>
                  </View>
                </View>

                <View style={styles.usageCard}>
                  <View style={styles.usageCardHeader}>
                    <Ionicons name="heart" size={20} color="#E91E63" />
                    <Text style={styles.usageCardTitle}>Love Match</Text>
                  </View>
                  <View style={styles.usageProgressContainer}>
                    <View style={styles.usageProgressBar}>
                      <View
                        style={[
                          styles.usageProgressFill,
                          { width: `${Math.min((Math.min(usageStats.loveMatch.used, usageStats.loveMatch.limit) / usageStats.loveMatch.limit) * 100, 100)}%` },
                          { backgroundColor: usageStats.loveMatch.used >= usageStats.loveMatch.limit ? "#FF3B30" : "#E91E63" }
                        ]}
                      />
                    </View>
                    <Text style={styles.usageText}>
                      {Math.min(usageStats.loveMatch.used, usageStats.loveMatch.limit)} / {usageStats.loveMatch.limit}
                    </Text>
                  </View>
                </View>

                <View style={styles.usageCard}>
                  <View style={styles.usageCardHeader}>
                    <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                    <Text style={styles.usageCardTitle}>Trust Check</Text>
                  </View>
                  <View style={styles.usageProgressContainer}>
                    <View style={styles.usageProgressBar}>
                      <View
                        style={[
                          styles.usageProgressFill,
                          { width: `${Math.min((Math.min(usageStats.trustAssessment.used, usageStats.trustAssessment.limit) / usageStats.trustAssessment.limit) * 100, 100)}%` },
                          { backgroundColor: usageStats.trustAssessment.used >= usageStats.trustAssessment.limit ? "#FF3B30" : "#34C759" }
                        ]}
                      />
                    </View>
                    <Text style={styles.usageText}>
                      {Math.min(usageStats.trustAssessment.used, usageStats.trustAssessment.limit)} / {usageStats.trustAssessment.limit}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Upgrade Suggestion */}
              {!subscription?.hasPremiumPlan && !subscription?.hasUnlimitedPlan && (
                <View style={styles.upgradeHint}>
                  <Ionicons name="information-circle" size={16} color="#FF9500" />
                  <Text style={styles.upgradeHintText}>
                    Upgrade to Premium for more readings or Unlimited for endless access
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Unable to load usage statistics</Text>
            </View>
          )}
        </View>

        {/* Payment Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Management</Text>
          </View>

          <TouchableOpacity
            style={styles.option}
            onPress={handleUpgrade}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="card-outline" size={24} color="#9333EA" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Subscription</Text>
                <Text style={styles.optionSubtext}>
                  {subscription?.hasUnlimitedPlan ? "Manage your unlimited subscription" :
                   subscription?.hasPremiumPlan ? "Manage your premium subscription" :
                   "Upgrade to premium features"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          {(subscription?.hasPremiumPlan || subscription?.hasUnlimitedPlan) && (
            <TouchableOpacity
              style={styles.option}
              onPress={handleBillingHistory}
            >
              <View style={styles.optionLeft}>
                <Ionicons name="receipt-outline" size={24} color="#34c759" />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>Billing History</Text>
                  <Text style={styles.optionSubtext}>View your payment history</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <TouchableOpacity style={styles.option}>
            <View style={styles.optionLeft}>
              <Ionicons name="notifications-outline" size={24} color="#667eea" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Notifications</Text>
                <Text style={styles.optionSubtext}>Daily insights & reminders</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handlePrivacyPolicy}>
            <View style={styles.optionLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#34c759" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Privacy Policy</Text>
                <Text style={styles.optionSubtext}>How we protect your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Support</Text>
          </View>

          <TouchableOpacity style={styles.option} onPress={handleHelpFAQ}>
            <View style={styles.optionLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#667eea" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Help & FAQ</Text>
                <Text style={styles.optionSubtext}>Join our Reddit community for help</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleRateApp}>
            <View style={styles.optionLeft}>
              <Ionicons name="star-outline" size={24} color="#ffa726" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Rate the App</Text>
                <Text style={styles.optionSubtext}>Share your experience</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Lovelock v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for cosmic connections</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={loading}
              style={[styles.modalSaveButton, loading && styles.modalSaveButtonDisabled]}
            >
              <Text style={styles.modalSaveText}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={editForm.full_name}
                onChangeText={(text) => setEditForm({ ...editForm, full_name: text })}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Date</Text>
              <DatePicker
                value={editForm.birth_date ? (() => {
                  try {
                    // If it's in MM/DD/YYYY format, convert to Date object
                    if (editForm.birth_date.includes('/')) {
                      const [month, day, year] = editForm.birth_date.split('/');
                      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    }
                    // Otherwise try to parse as is
                    return new Date(editForm.birth_date);
                  } catch {
                    return undefined;
                  }
                })() : undefined}
                onSelect={(date) => {
                  if (date) {
                    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                    setEditForm({ ...editForm, birth_date: formattedDate });
                  } else {
                    setEditForm({ ...editForm, birth_date: '' });
                  }
                }}
                placeholder="MM/DD/YYYY"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Location</Text>
              <TextInput
                style={styles.input}
                value={editForm.birth_location}
                onChangeText={(text) => setEditForm({ ...editForm, birth_location: text })}
                placeholder="City, State/Province, Country"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Time (Optional)</Text>
              <TextInput
                style={styles.input}
                value={editForm.birth_time}
                onChangeText={(text) => setEditForm({ ...editForm, birth_time: text })}
                placeholder="HH:MM AM/PM"
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: isSmallScreen ? 16 : 20,
    paddingTop: 10,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: isSmallScreen ? 50 : 60,
    height: isSmallScreen ? 50 : 60,
    borderRadius: isSmallScreen ? 25 : 30,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: isSmallScreen ? 14 : 16,
    color: "#999",
  },
  section: {
    marginHorizontal: isSmallScreen ? 12 : 20,
    marginBottom: isSmallScreen ? 16 : 20,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "600",
    color: "#fff",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isSmallScreen ? 8 : 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#2C2C2E",
  },
  editButtonText: {
    color: "#E91E63",
    marginLeft: 4,
    fontWeight: "500",
    fontSize: isSmallScreen ? 13 : 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    color: "#999",
    marginLeft: 12,
    width: isSmallScreen ? 80 : 100,
    fontSize: isSmallScreen ? 13 : 14,
  },
  infoValue: {
    color: "#fff",
    flex: 1,
    marginLeft: 12,
    fontSize: isSmallScreen ? 13 : 14,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  optionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: "#fff",
    fontWeight: "500",
  },
  optionSubtext: {
    fontSize: isSmallScreen ? 12 : 14,
    color: "#999",
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  signOutText: {
    color: "#FF3B30",
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 30,
  },
  appInfoText: {
    color: "#666",
    fontSize: isSmallScreen ? 12 : 14,
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  modalTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "600",
    color: "#fff",
  },
  modalCancelText: {
    color: "#E91E63",
    fontSize: isSmallScreen ? 14 : 16,
  },
  modalSaveButton: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E91E63",
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: isSmallScreen ? 14 : 16,
  },
  modalContent: {
    flex: 1,
    padding: isSmallScreen ? 16 : 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: isSmallScreen ? 14 : 16,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: isSmallScreen ? 14 : 16,
  },
  // Usage Statistics Styles
  usageStatsContainer: {
    gap: 16,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  subscriptionText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
  },
  premiumText: {
    color: "#FFD700",
  },
  unlimitedText: {
    color: "#FF9500",
  },
  monthlyUsageText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  usageGrid: {
    gap: 12,
  },
  usageCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
  },
  usageCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  usageCardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  usageProgressContainer: {
    gap: 8,
  },
  usageProgressBar: {
    height: 6,
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
    overflow: "hidden",
  },
  usageProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  usageText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
  },
  upgradeHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  upgradeHintText: {
    color: "#FF9500",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#8E8E93",
    fontSize: 14,
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
  },
  noDataText: {
    color: "#8E8E93",
    fontSize: 14,
    textAlign: "center",
  },
});