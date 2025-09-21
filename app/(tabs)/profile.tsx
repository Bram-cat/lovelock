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
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase-client";
import { useProfile } from "../../contexts/ProfileContext";
import { DatePicker } from "../../components/ui";
import { useAlert } from "../../contexts/AlertContext";
import { useSubscription } from "../../hooks/useSubscription";
import PremiumSubscriptionCard from "../../components/PremiumSubscriptionCard";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    birth_date: "",
    birth_location: "",
    birth_time: "",
  });

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
    showAlert({
      title: "✨ Upgrade to Premium",
      description: "You'll be redirected to our secure web portal to manage your subscription. Your account will automatically sync once you upgrade.",
      variant: "default",
      actions: [
        {
          label: "Cancel",
          variant: "outline",
          onPress: () => {}
        },
        {
          label: "Continue to Web Portal",
          variant: "default",
          onPress: async () => {
            try {
              await openPricingPage();
            } catch (error) {
              showError("Redirect Failed", "Unable to open upgrade page. Please check your internet connection and try again.");
            }
          }
        }
      ]
    });
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

          <TouchableOpacity style={styles.option}>
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

          <TouchableOpacity style={styles.option}>
            <View style={styles.optionLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#667eea" />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Help & FAQ</Text>
                <Text style={styles.optionSubtext}>Get answers to common questions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#999",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#2C2C2E",
  },
  editButtonText: {
    color: "#E91E63",
    marginLeft: 4,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    color: "#999",
    marginLeft: 12,
    width: 100,
  },
  infoValue: {
    color: "#fff",
    flex: 1,
    marginLeft: 12,
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
  },
  optionText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  optionSubtext: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  appInfoText: {
    color: "#666",
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  modalCancelText: {
    color: "#E91E63",
    fontSize: 16,
  },
  modalSaveButton: {
    paddingHorizontal: 16,
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
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
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
    fontSize: 16,
  },
});