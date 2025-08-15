import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback notification service for when expo-notifications is not installed
// This provides the same interface but with mock functionality

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export class NotificationService {
  private static readonly PERMISSION_ASKED_KEY = 'notification_permission_asked';
  private static readonly PERMISSION_STATUS_KEY = 'notification_permission_status';
  private static readonly PUSH_TOKEN_KEY = 'expo_push_token';

  /**
   * Check if the device supports push notifications
   */
  static isDeviceSupported(): boolean {
    return Platform.OS !== 'web';
  }

  /**
   * Get current notification permission status (mock implementation)
   */
  static async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const stored = await AsyncStorage.getItem(this.PERMISSION_STATUS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.log('Error getting stored permission status:', error);
    }

    // Default status
    return {
      granted: false,
      canAskAgain: true,
      status: 'undetermined',
    };
  }

  /**
   * Request notification permissions from the user (mock implementation)
   */
  static async requestPermissions(): Promise<NotificationPermissionStatus> {
    if (!this.isDeviceSupported()) {
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Enable Notifications',
        'Would you like to receive notifications about new matches, promotions, and app updates?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: async () => {
              const status: NotificationPermissionStatus = {
                granted: false,
                canAskAgain: true,
                status: 'denied',
              };
              
              await AsyncStorage.setItem(this.PERMISSION_STATUS_KEY, JSON.stringify(status));
              await AsyncStorage.setItem(this.PERMISSION_ASKED_KEY, 'true');
              resolve(status);
            },
          },
          {
            text: 'Allow',
            onPress: async () => {
              const status: NotificationPermissionStatus = {
                granted: true,
                canAskAgain: true,
                status: 'granted',
              };
              
              await AsyncStorage.setItem(this.PERMISSION_STATUS_KEY, JSON.stringify(status));
              await AsyncStorage.setItem(this.PERMISSION_ASKED_KEY, 'true');
              
              // Mock push token
              const mockToken = `ExponentPushToken[mock-${Date.now()}]`;
              await AsyncStorage.setItem(this.PUSH_TOKEN_KEY, mockToken);
              
              resolve(status);
            },
          },
        ]
      );
    });
  }

  /**
   * Get Expo push token for sending notifications (mock implementation)
   */
  static async getExpoPushToken(): Promise<string | null> {
    if (!this.isDeviceSupported()) {
      return null;
    }

    try {
      const { status } = await this.getPermissionStatus();
      
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return null;
      }

      // Check if we already have a token stored
      const storedToken = await AsyncStorage.getItem(this.PUSH_TOKEN_KEY);
      if (storedToken) {
        return storedToken;
      }

      // Generate mock token
      const mockToken = `ExponentPushToken[mock-${Date.now()}]`;
      await AsyncStorage.setItem(this.PUSH_TOKEN_KEY, mockToken);
      
      return mockToken;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  /**
   * Check if we've already asked for permission
   */
  static async hasAskedForPermission(): Promise<boolean> {
    try {
      const asked = await AsyncStorage.getItem(this.PERMISSION_ASKED_KEY);
      return asked === 'true';
    } catch (error) {
      console.error('Error checking permission asked status:', error);
      return false;
    }
  }

  /**
   * Get stored permission status
   */
  static async getStoredPermissionStatus(): Promise<NotificationPermissionStatus | null> {
    try {
      const stored = await AsyncStorage.getItem(this.PERMISSION_STATUS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting stored permission status:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification (mock implementation)
   */
  static async scheduleTestNotification(): Promise<void> {
    const { status } = await this.getPermissionStatus();
    
    if (status === 'granted') {
      Alert.alert(
        'Welcome to Lovelock! 💕',
        'Your love journey begins now. Discover your perfect match!\n\n(This is a mock notification - install expo-notifications for real notifications)',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }

  /**
   * Send promotional notification (mock implementation)
   */
  static async sendPromotionalNotification(title: string, body: string): Promise<void> {
    const { status } = await this.getPermissionStatus();
    
    if (status === 'granted') {
      Alert.alert(
        title,
        `${body}\n\n(This is a mock notification - install expo-notifications for real notifications)`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }

  /**
   * Clear all stored notification data (for testing/reset)
   */
  static async clearStoredData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.PERMISSION_ASKED_KEY,
        this.PERMISSION_STATUS_KEY,
        this.PUSH_TOKEN_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing notification data:', error);
    }
  }
}

export default NotificationService;
