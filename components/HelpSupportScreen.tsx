import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HelpSupportScreen() {
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@lovelock.app');
  };



  const handleReportBug = () => {
    Linking.openURL('mailto:lovelock.bugs@gmail.com');
  };

  const HelpItem = ({ 
    title, 
    description, 
    icon, 
    onPress 
  }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <View style={styles.helpLeft}>
        <Ionicons name={icon as any} size={24} color="#667eea" />
        <View style={styles.helpText}>
          <Text style={styles.helpTitle}>{title}</Text>
          <Text style={styles.helpDescription}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
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
        
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>
          We&apos;re here to help you
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          


          <HelpItem
            title="Contact Support"
            description="Get in touch with our support team"
            icon="chatbubble-ellipses"
            onPress={handleContactSupport}
          />

          <HelpItem
            title="Report a Bug"
            description="Help us improve by reporting issues"
            icon="bug"
            onPress={handleReportBug}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.appName}>Lovelock</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.description}>
              Your personal numerology and compatibility companion. 
              Discover the power of numbers in love and relationships.
            </Text>
          </View>
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
  helpItem: {
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
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpText: {
    marginLeft: 15,
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
