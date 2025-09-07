import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [numerologyReminders, setNumerologyReminders] = useState(true);
  const [compatibilityAlerts, setCompatibilityAlerts] = useState(false);
  const [premiumOffers, setPremiumOffers] = useState(true);

  const NotificationItem = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: string;
  }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        <Ionicons name={icon as any} size={24} color="#667eea" />
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#ccc', true: '#667eea' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>
          Manage your notification preferences
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          
          <NotificationItem
            title="Push Notifications"
            description="Receive push notifications on your device"
            value={pushNotifications}
            onValueChange={setPushNotifications}
            icon="notifications"
          />

          <NotificationItem
            title="Email Notifications"
            description="Receive notifications via email"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            icon="mail"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Features</Text>
          
          <NotificationItem
            title="Numerology Reminders"
            description="Daily reminders for numerology insights"
            value={numerologyReminders}
            onValueChange={setNumerologyReminders}
            icon="calculator"
          />

          <NotificationItem
            title="Compatibility Alerts"
            description="Notifications about compatibility matches"
            value={compatibilityAlerts}
            onValueChange={setCompatibilityAlerts}
            icon="heart"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing</Text>
          
          <NotificationItem
            title="Premium Offers"
            description="Special offers and premium features"
            value={premiumOffers}
            onValueChange={setPremiumOffers}
            icon="diamond"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 15,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
  },
});
