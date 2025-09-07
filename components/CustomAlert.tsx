import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttons?: CustomAlertButton[];
  onDismiss?: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function CustomAlert({ 
  visible, 
  title, 
  message,
  icon,
  iconColor,
  buttons = [{ text: 'OK', style: 'primary' }],
  onDismiss,
  type = 'info'
}: CustomAlertProps) {
  // Static theme colors for consistency
  const theme = {
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    primary: '#667eea',
    secondary: '#764ba2'
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: icon || 'checkmark-circle',
          iconColor: iconColor || '#4CAF50',
        };
      case 'error':
        return {
          icon: icon || 'close-circle',
          iconColor: iconColor || '#F44336',
        };
      case 'warning':
        return {
          icon: icon || 'warning',
          iconColor: iconColor || '#FF9800',
        };
      default:
        return {
          icon: icon || 'information-circle',
          iconColor: iconColor || '#2196F3',
        };
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return {
          backgroundColor: '#FF4444',
          colors: ['#FF4444', '#CC3333']
        };
      case 'cancel':
        return {
          backgroundColor: 'rgba(0,0,0,0.1)',
          colors: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']
        };
      case 'primary':
        return {
          backgroundColor: '#FF6B9D',
          colors: ['#FF6B9D', '#C44569']
        };
      default:
        return {
          backgroundColor: theme.primary,
          colors: [theme.primary, theme.secondary || theme.primary]
        };
    }
  };

  const getButtonTextColor = (style?: string) => {
    switch (style) {
      case 'cancel':
        return theme.text;
      case 'primary':
        return 'white';
      default:
        return 'white';
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name={config.icon} size={32} color={config.iconColor} />
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>

          {/* Message */}
          {message && (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => {
              const buttonStyle = getButtonStyle(button.style);
              const textColor = getButtonTextColor(button.style);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttons.length === 1 && styles.singleButton
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    onDismiss?.();
                  }}
                >
                  <LinearGradient
                    colors={buttonStyle.colors}
                    style={styles.buttonGradient}
                  >
                    <Text style={[styles.buttonText, { color: textColor }]}>
                      {button.text}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleButton: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

// Utility hook for easy usage  
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<CustomAlertProps | null>(null);

  const showAlert = (config: Omit<CustomAlertProps, 'visible' | 'onDismiss'>) => {
    setAlertConfig({
      ...config,
      visible: true,
      onDismiss: () => setAlertConfig(null),
    });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  const AlertComponent = alertConfig ? (
    <CustomAlert
      {...alertConfig}
      visible={!!alertConfig}
      onDismiss={hideAlert}
    />
  ) : null;

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};
