import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Colors from '../constants/Colors';
import NotificationService, { NotificationPermissionStatus } from '../services/NotificationService';

const { width, height } = Dimensions.get('window');

interface NotificationPermissionPromptProps {
  visible: boolean;
  onClose: () => void;
  onPermissionGranted?: (status: NotificationPermissionStatus) => void;
  onPermissionDenied?: (status: NotificationPermissionStatus) => void;
}

export default function NotificationPermissionPrompt({
  visible,
  onClose,
  onPermissionGranted,
  onPermissionDenied,
}: NotificationPermissionPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const handleAllowNotifications = async () => {
    setIsLoading(true);
    
    try {
      const permissionStatus = await NotificationService.requestPermissions();
      
      if (permissionStatus.granted) {
        // Get push token for future use
        const pushToken = await NotificationService.getExpoPushToken();
        console.log('Push token obtained:', pushToken);
        
        // Send a welcome notification
        await NotificationService.scheduleTestNotification();
        
        Alert.alert(
          'Notifications Enabled! 🎉',
          'You\'ll now receive updates about new features, matches, and special promotions.',
          [{ text: 'Great!', style: 'default' }]
        );
        
        onPermissionGranted?.(permissionStatus);
      } else {
        onPermissionDenied?.(permissionStatus);
        
        if (!permissionStatus.canAskAgain) {
          Alert.alert(
            'Notifications Disabled',
            'To enable notifications later, please go to your device settings and allow notifications for Lovelock.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error requesting notifications:', error);
      Alert.alert(
        'Error',
        'Something went wrong while setting up notifications. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotNow = () => {
    onPermissionDenied?.({
      granted: false,
      canAskAgain: true,
      status: 'denied',
    });
    onClose();
  };

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary, Colors.tertiary]}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={60} color={Colors.text.white} />
              </View>
              <Text style={styles.title}>Stay Connected</Text>
              <Text style={styles.subtitle}>
                Get notified about new matches, special features, and exclusive promotions
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefit}>
                <Ionicons name="heart" size={24} color={Colors.text.white} />
                <Text style={styles.benefitText}>New match notifications</Text>
              </View>
              
              <View style={styles.benefit}>
                <Ionicons name="star" size={24} color={Colors.text.white} />
                <Text style={styles.benefitText}>Exclusive promotions & offers</Text>
              </View>
              
              <View style={styles.benefit}>
                <Ionicons name="flash" size={24} color={Colors.text.white} />
                <Text style={styles.benefitText}>New feature announcements</Text>
              </View>
              
              <View style={styles.benefit}>
                <Ionicons name="gift" size={24} color={Colors.text.white} />
                <Text style={styles.benefitText}>Special events & contests</Text>
              </View>
            </View>

            {/* Privacy Note */}
            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.privacyText}>
                We respect your privacy. You can change this anytime in settings.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Allow Button */}
              <TouchableOpacity
                style={[styles.allowButton, isLoading && styles.disabledButton]}
                onPress={handleAllowNotifications}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#ccc', '#999'] : [Colors.text.white, '#f0f0f0']}
                  style={styles.buttonGradient}
                >
                  <View style={styles.buttonContent}>
                    {isLoading && (
                      <Ionicons 
                        name="hourglass" 
                        size={20} 
                        color={Colors.primary} 
                        style={styles.buttonIcon} 
                      />
                    )}
                    <Text style={styles.allowButtonText}>
                      {isLoading ? 'Setting up...' : 'Allow Notifications'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Not Now Button */}
              <TouchableOpacity
                style={styles.notNowButton}
                onPress={handleNotNow}
                disabled={isLoading}
              >
                <Text style={styles.notNowButtonText}>Not Now</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradient: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.text.white,
    marginLeft: 12,
    flex: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  allowButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  allowButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  notNowButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  notNowButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});
