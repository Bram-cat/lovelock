import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationTestPanel() {
  const {
    permissionStatus,
    expoPushToken,
    setShowPermissionPrompt,
    sendTestNotification,
    refreshPermissionStatus,
    isDeviceSupported,
  } = useNotifications();

  const handleShowPermissionPrompt = () => {
    setShowPermissionPrompt(true);
  };

  const handleSendTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent! Check your notification panel.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const [, ] = React.useState<string | null>(null);

  const handleRefreshStatus = async () => {
    await refreshPermissionStatus();
    Alert.alert('Refreshed', 'Notification status has been refreshed.');
  };

  const getStatusColor = () => {
    if (!permissionStatus) return '#999';
    switch (permissionStatus.status) {
      case 'granted': return '#4CAF50';
      case 'denied': return '#F44336';
      case 'undetermined': return '#FF9800';
      default: return '#999';
    }
  };

  const getStatusText = () => {
    if (!permissionStatus) return 'Loading...';
    switch (permissionStatus.status) {
      case 'granted': return 'Granted ✅';
      case 'denied': return 'Denied ❌';
      case 'undetermined': return 'Not Asked Yet ⏳';
      default: return 'Unknown';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <Ionicons name="notifications" size={40} color={Colors.text.white} />
        <Text style={styles.headerTitle}>Notification Test Panel</Text>
        <Text style={styles.headerSubtitle}>Test your notification system</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Device Support Status */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Device Support</Text>
          <View style={styles.statusRow}>
            <Ionicons 
              name={isDeviceSupported ? "checkmark-circle" : "close-circle"} 
              size={24} 
              color={isDeviceSupported ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.statusText}>
              {isDeviceSupported ? 'Supported' : 'Not Supported'}
            </Text>
          </View>
        </View>

        {/* Permission Status */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Permission Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          {permissionStatus && (
            <Text style={styles.subText}>
              Can ask again: {permissionStatus.canAskAgain ? 'Yes' : 'No'}
            </Text>
          )}
        </View>

        {/* Push Token Status */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Push Token</Text>
          <View style={styles.statusRow}>
            <Ionicons 
              name={expoPushToken ? "key" : "key-outline"} 
              size={24} 
              color={expoPushToken ? "#4CAF50" : "#999"} 
            />
            <Text style={styles.statusText}>
              {expoPushToken ? 'Available' : 'Not Available'}
            </Text>
          </View>
          {expoPushToken && (
            <Text style={styles.tokenText} numberOfLines={2}>
              {expoPushToken.substring(0, 50)}...
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShowPermissionPrompt}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.buttonGradient}
            >
              <Ionicons name="hand-right" size={20} color={Colors.text.white} />
              <Text style={styles.buttonText}>Show Permission Prompt</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSendTestNotification}
            disabled={!permissionStatus?.granted}
          >
            <LinearGradient
              colors={permissionStatus?.granted ? [Colors.card.purple, Colors.tertiary] : ['#ccc', '#999']}
              style={styles.buttonGradient}
            >
              <Ionicons name="send" size={20} color={Colors.text.white} />
              <Text style={styles.buttonText}>Send Test Notification</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefreshStatus}
          >
            <LinearGradient
              colors={[Colors.card.red, '#ff6b9d']}
              style={styles.buttonGradient}
            >
              <Ionicons name="refresh" size={20} color={Colors.text.white} />
              <Text style={styles.buttonText}>Refresh Status</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Test:</Text>
          <Text style={styles.instructionText}>
            1. Tap &quot;Show Permission Prompt&quot; to see the permission dialog
          </Text>
          <Text style={styles.instructionText}>
            2. Grant permissions when prompted
          </Text>
          <Text style={styles.instructionText}>
            3. Tap &quot;Send Test Notification&quot; to test notifications
          </Text>
          <Text style={styles.instructionText}>
            4. Use &quot;Refresh Status&quot; if you change permissions in device settings
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: Colors.text.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  subText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  tokenText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginLeft: 8,
  },
  instructionsCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
