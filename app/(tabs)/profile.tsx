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
import { StripeService } from "../../services/StripeService";
import { useAlert } from "../../contexts/AlertContext";
import { SubscriptionService } from "../../services/SubscriptionService";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    birth_date: '',
    birth_location: '',
    birth_time: ''
  });
  const [usageStats, setUsageStats] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  // Load usage statistics and subscription status
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (user?.id) {
        try {
          const [stats, subscription] = await Promise.all([
            SubscriptionService.getUsageStats(user.id),
            SubscriptionService.getSubscriptionStatus(user.id)
          ]);
          
          const resetDate = new Date(stats.numerology.resetsAt);
          const now = new Date();
          const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          setUsageStats({
            numerologyRemaining: stats.numerology.remaining,
            loveMatchRemaining: stats.loveMatch.remaining,
            trustAssessmentRemaining: stats.trustAssessment.remaining,
            daysUntilReset: Math.max(0, daysUntilReset),
            isPremium: stats.isPremium
          });
          
          setSubscriptionStatus(subscription);
        } catch (error) {
          console.error('Error loading subscription data:', error);
        }
      }
    };
    
    loadSubscriptionData();
  }, [user?.id]);

  useEffect(() => {
    if (profileData) {
      // Convert birth_date from YYYY-MM-DD (database) to MM/DD/YYYY (form display)
      let formattedBirthDate = '';
      if (profileData.birth_date) {
        try {
          console.log('🔄 Profile Form: Converting database birth_date:', profileData.birth_date);
          if (profileData.birth_date.includes('-') && profileData.birth_date.length === 10) {
            // Parse YYYY-MM-DD manually to avoid timezone issues
            const [year, month, day] = profileData.birth_date.split('-');
            if (year && month && day) {
              formattedBirthDate = `${month}/${day}/${year}`;
              console.log('🔄 Profile Form: Converted to MM/DD/YYYY:', formattedBirthDate);
            }
          } else {
            // Fallback to Date parsing for other formats
            const date = new Date(profileData.birth_date);
            if (!isNaN(date.getTime())) {
              formattedBirthDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
            }
          }
        } catch (error) {
          console.log('❌ Profile Form: Error formatting birth date:', error);
        }
      }

      setEditForm({
        full_name: profileData.full_name || '',
        birth_date: formattedBirthDate,
        birth_location: profileData.birth_location || '',
        birth_time: profileData.birth_time || ''
      });
    }
  }, [profileData]);


  const handleEditProfile = () => {
    // Ensure form is populated with latest data when opening modal
    if (profileData) {
      // Convert birth_date from YYYY-MM-DD (database) to MM/DD/YYYY (form display)
      let formattedBirthDate = '';
      if (profileData.birth_date) {
        try {
          console.log('🔄 Profile Edit Modal: Converting database birth_date:', profileData.birth_date);
          if (profileData.birth_date.includes('-') && profileData.birth_date.length === 10) {
            // Parse YYYY-MM-DD manually to avoid timezone issues
            const [year, month, day] = profileData.birth_date.split('-');
            if (year && month && day) {
              formattedBirthDate = `${month}/${day}/${year}`;
              console.log('🔄 Profile Edit Modal: Converted to MM/DD/YYYY:', formattedBirthDate);
            }
          } else {
            // Fallback to Date parsing for other formats
            const date = new Date(profileData.birth_date);
            if (!isNaN(date.getTime())) {
              formattedBirthDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
            }
          }
        } catch (error) {
          console.log('❌ Profile Edit Modal: Error formatting birth date:', error);
        }
      }

      setEditForm({
        full_name: profileData.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
        birth_date: formattedBirthDate,
        birth_location: profileData.birth_location || '',
        birth_time: profileData.birth_time || ''
      });
    } else {
      // Fallback to Clerk user data if no profile data available
      setEditForm({
        full_name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
        birth_date: '',
        birth_location: '',
        birth_time: ''
      });
    }
    
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!editForm.full_name.trim()) {
        showError('Error', 'Full name is required.');
        setLoading(false);
        return;
      }

      // Convert birth_date from MM/DD/YYYY (form) to YYYY-MM-DD (database)
      let databaseBirthDate = null;
      console.log('💾 Profile Save: editForm.birth_date:', editForm.birth_date);
      if (editForm.birth_date && editForm.birth_date.trim()) {
        try {
          const [month, day, year] = editForm.birth_date.trim().split('/');
          console.log('💾 Profile Save: Parsed components - Month:', month, 'Day:', day, 'Year:', year);
          if (month && day && year) {
            databaseBirthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            console.log('💾 Profile Save: Converted to database format:', databaseBirthDate);
          }
        } catch (error) {
          console.log('❌ Profile Save: Error converting birth date:', error);
        }
      }

      const updates = {
        full_name: editForm.full_name.trim(),
        birth_date: databaseBirthDate,
        birth_location: editForm.birth_location && editForm.birth_location.trim() ? editForm.birth_location.trim() : null,
        birth_time: editForm.birth_time && editForm.birth_time.trim() ? editForm.birth_time.trim() : null
      };

      console.log('📝 Saving profile with updates:', updates);
      console.log('👤 Current user ID:', user?.id);

      const success = await updateProfile(updates);
      
      if (success) {
        setShowEditModal(false);
        showSuccess('Success', 'Profile updated successfully!');
      } else {
        showError('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Error', 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  const handleUpgradeToPremium = async () => {
    try {
      if (!user) {
        showError('Error', 'Please sign in to upgrade to premium');
        return;
      }

      const result = await SubscriptionService.purchasePremiumSubscription(
        user.id,
        user.primaryEmailAddress?.emailAddress || ''
      );

      if (result.success) {
        showSuccess('Success', 'Payment successful! Your premium features are now active.');
        // Reload subscription data
        const [stats, subscription] = await Promise.all([
          SubscriptionService.getUsageStats(user.id),
          SubscriptionService.getSubscriptionStatus(user.id)
        ]);
        
        const resetDate = new Date(stats.numerology.resetsAt);
        const now = new Date();
        const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        setUsageStats({
          numerologyRemaining: stats.numerology.remaining,
          loveMatchRemaining: stats.loveMatch.remaining,
          trustAssessmentRemaining: stats.trustAssessment.remaining,
          daysUntilReset: Math.max(0, daysUntilReset),
          isPremium: stats.isPremium
        });
        
        setSubscriptionStatus(subscription);
      } else {
        showError('Error', result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      showError('Error', 'Something went wrong. Please try again.');
      console.error('Premium upgrade error:', error);
    }
  };

  const handleSignOut = async () => {
    showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        try {
          await signOut();
          router.replace('/(auth)/sign-in');
        } catch (error) {
          showError('Error', 'Failed to sign out. Please try again.');
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={64} color="#007AFF" />
          </View>
          <Text style={[styles.name, usageStats?.isPremium && styles.premiumName]}>
            {profileData?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
            {usageStats?.isPremium && <Text style={styles.premiumIcon}> ✨</Text>}
          </Text>
          <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
        </View>

        {/* Profile Information */}
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
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>
                {profileData?.full_name || user?.fullName || 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
            
            {profileData?.birth_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Birth Date</Text>
                <Text style={styles.infoValue}>{(() => {
                  try {
                    if (profileData.birth_date.includes('-') && profileData.birth_date.length === 10) {
                      // Parse YYYY-MM-DD manually to avoid timezone issues
                      const [year, month, day] = profileData.birth_date.split('-');
                      if (year && month && day) {
                        return `${month}/${day}/${year}`;
                      }
                    }
                    // Fallback to original format conversion for other formats
                    const date = new Date(profileData.birth_date);
                    if (!isNaN(date.getTime())) {
                      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                    }
                    return profileData.birth_date; // fallback to original if parsing fails
                  } catch (error) {
                    return profileData.birth_date; // fallback to original if parsing fails
                  }
                })()}</Text>
              </View>
            )}
            
            {profileData?.birth_location && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Birth Location</Text>
                <Text style={styles.infoValue}>{profileData.birth_location}</Text>
              </View>
            )}
            
            {profileData?.birth_time && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Birth Time</Text>
                <Text style={styles.infoValue}>{profileData.birth_time}</Text>
              </View>
            )}
            
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.option}>
            <View style={styles.optionLeft}>
              <Ionicons name="notifications-outline" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

        </View>

        {/* Subscription Section */}
        {subscriptionStatus?.isPremium ? (
          <View style={styles.section}>
            <View style={styles.premiumActiveSection}>
              <View style={styles.premiumActiveHeader}>
                <View style={styles.optionLeft}>
                  <Ionicons name="diamond" size={24} color="#FFD700" />
                  <View style={styles.premiumTextContainer}>
                    <Text style={styles.premiumActiveTitle}>Premium Active</Text>
                    <Text style={styles.premiumActiveSubtitle}>
                      {subscriptionStatus.expiryDate 
                        ? `Expires ${SubscriptionService.getTimeUntilExpiry(subscriptionStatus.expiryDate)}`
                        : 'Unlimited access'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              </View>
              
              {/* Premium Benefits */}
              <View style={styles.premiumBenefits}>
                <View style={styles.benefitRow}>
                  <Ionicons name="infinite" size={16} color="#34C759" />
                  <Text style={styles.benefitText}>Unlimited Numerology Readings</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Ionicons name="heart" size={16} color="#34C759" />
                  <Text style={styles.benefitText}>Unlimited Love Compatibility</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Ionicons name="shield-checkmark" size={16} color="#34C759" />
                  <Text style={styles.benefitText}>Unlimited Trust Assessments</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Usage Statistics - Only show for non-premium users */}
            {!usageStats?.isPremium && (
              <PremiumSubscriptionCard
                onUpgradePress={handleUpgradeToPremium}
                usageStats={usageStats}
              />
            )}
          </>
        )}

        {/* App Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.option}>
            <View style={styles.optionLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Help & Support</Text>
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
        <View style={styles.footer}>
          <Text style={styles.appVersion}>Lovelock v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={loading}
              style={[styles.modalSaveButton, loading && styles.disabledButton]}
            >
              <Text style={styles.modalSaveText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.full_name}
                onChangeText={(text) => setEditForm({ ...editForm, full_name: text })}
                placeholder="Enter your full name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.formSection}>
              <DatePicker
                label="Birth Date (MM/DD/YYYY)"
                value={editForm.birth_date ? (() => {
                  try {
                    console.log('📅 Profile DatePicker: Parsing birth_date:', editForm.birth_date);
                    if (editForm.birth_date.includes('/')) {
                      const [month, day, year] = editForm.birth_date.split('/');
                      if (month && day && year) {
                        // Use UTC to avoid timezone issues
                        const parsedDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12));
                        console.log('📅 Profile DatePicker: Parsed UTC date:', parsedDate);
                        console.log('📅 Profile DatePicker: Local display:', parsedDate.toLocaleDateString());
                        return parsedDate;
                      }
                    }
                    return undefined;
                  } catch (error) {
                    console.log('❌ Profile DatePicker: Error parsing birth_date:', error);
                    return undefined;
                  }
                })() : undefined}
                onSelect={(date) => {
                  const formattedDate = date 
                    ? `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`
                    : '';
                  console.log('📅 Profile DatePicker: Selected date formatted:', formattedDate);
                  setEditForm({ ...editForm, birth_date: formattedDate });
                }}
                placeholder="MM/DD/YYYY"
                maxDate={new Date()}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Birth Location</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.birth_location}
                onChangeText={(text) => setEditForm({ ...editForm, birth_location: text })}
                placeholder="City, State/Country"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Birth Time (HH:MM AM/PM)</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.birth_time}
                onChangeText={(text) => setEditForm({ ...editForm, birth_time: text })}
                placeholder="12:00 PM"
                placeholderTextColor="#8E8E93"
              />
            </View>


            <Text style={styles.formNote}>
              Your birth information helps provide more accurate numerology and astrology readings.
            </Text>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
  },
  editButtonText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  profileInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E91E63',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  formNote: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    lineHeight: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumName: {
    color: '#FFD700', // Gold color for premium users
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumIcon: {
    fontSize: 20,
    color: '#FFD700',
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#8E8E93',
  },
  premiumOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
  },
  premiumTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
  },
  premiumSubtitle: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  premiumActiveSection: {
    padding: 20,
  },
  premiumActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  premiumActiveTitle: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
  premiumActiveSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  premiumBenefits: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});