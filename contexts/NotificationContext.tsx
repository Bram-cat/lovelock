import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NotificationService, { NotificationPermissionStatus } from '../services/NotificationServiceFallback';

interface NotificationContextType {
  permissionStatus: NotificationPermissionStatus | null;
  showPermissionPrompt: boolean;
  hasAskedForPermission: boolean;
  expoPushToken: string | null;
  setShowPermissionPrompt: (show: boolean) => void;
  requestPermissions: () => Promise<NotificationPermissionStatus>;
  refreshPermissionStatus: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  isDeviceSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [hasAskedForPermission, setHasAskedForPermission] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isDeviceSupported] = useState(NotificationService.isDeviceSupported());

  // Initialize notification status when the app starts
  useEffect(() => {
    initializeNotificationStatus();
  }, []);

  // Handle app state changes to refresh permission status
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshPermissionStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const initializeNotificationStatus = async () => {
    try {
      // Check if we've already asked for permission
      const hasAsked = await NotificationService.hasAskedForPermission();
      setHasAskedForPermission(hasAsked);

      // Get current permission status
      const currentStatus = await NotificationService.getPermissionStatus();
      setPermissionStatus(currentStatus);

      // Get stored push token if permissions are granted
      if (currentStatus.granted) {
        const token = await NotificationService.getExpoPushToken();
        setExpoPushToken(token);
      }

      // Show permission prompt if:
      // 1. Device supports notifications
      // 2. We haven't asked for permission yet
      // 3. Current status is undetermined
      if (
        isDeviceSupported &&
        !hasAsked &&
        currentStatus.status === 'undetermined'
      ) {
        // Delay showing the prompt to let the app fully load
        setTimeout(() => {
          setShowPermissionPrompt(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error initializing notification status:', error);
    }
  };

  const refreshPermissionStatus = async () => {
    try {
      const currentStatus = await NotificationService.getPermissionStatus();
      setPermissionStatus(currentStatus);

      if (currentStatus.granted && !expoPushToken) {
        const token = await NotificationService.getExpoPushToken();
        setExpoPushToken(token);
      }
    } catch (error) {
      console.error('Error refreshing permission status:', error);
    }
  };

  const requestPermissions = async (): Promise<NotificationPermissionStatus> => {
    try {
      const status = await NotificationService.requestPermissions();
      setPermissionStatus(status);
      setHasAskedForPermission(true);

      if (status.granted) {
        const token = await NotificationService.getExpoPushToken();
        setExpoPushToken(token);
      }

      return status;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      const errorStatus: NotificationPermissionStatus = {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
      setPermissionStatus(errorStatus);
      return errorStatus;
    }
  };

  const sendTestNotification = async () => {
    try {
      await NotificationService.scheduleTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const contextValue: NotificationContextType = {
    permissionStatus,
    showPermissionPrompt,
    hasAskedForPermission,
    expoPushToken,
    setShowPermissionPrompt,
    requestPermissions,
    refreshPermissionStatus,
    sendTestNotification,
    isDeviceSupported,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
