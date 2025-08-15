import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import NotificationPermissionPrompt from './NotificationPermissionPrompt';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationPermissionStatus } from '../services/NotificationServiceFallback';

export default function NotificationManager() {
  const { user } = useUser();
  const {
    showPermissionPrompt,
    setShowPermissionPrompt,
    requestPermissions,
    permissionStatus,
  } = useNotifications();

  const handlePermissionGranted = (status: NotificationPermissionStatus) => {
    console.log('Notification permissions granted:', status);
    
    // You can add analytics tracking here
    // Analytics.track('notification_permission_granted');
    
    // You can also sync the permission status with your backend
    // syncNotificationPreferences(user?.id, status);
  };

  const handlePermissionDenied = (status: NotificationPermissionStatus) => {
    console.log('Notification permissions denied:', status);
    
    // You can add analytics tracking here
    // Analytics.track('notification_permission_denied', { canAskAgain: status.canAskAgain });
  };

  const handleClose = () => {
    setShowPermissionPrompt(false);
  };

  // Only show the prompt if user is authenticated and we need to ask for permissions
  const shouldShowPrompt = user && showPermissionPrompt;

  return (
    <NotificationPermissionPrompt
      visible={!!shouldShowPrompt}
      onClose={handleClose}
      onPermissionGranted={handlePermissionGranted}
      onPermissionDenied={handlePermissionDenied}
    />
  );
}
