import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut 
} from 'react-native-reanimated';

export interface AlertProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  visible: boolean;
  onClose: () => void;
  actions?: AlertAction[];
  autoClose?: boolean;
  duration?: number;
}

export interface AlertAction {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'default',
  visible,
  onClose,
  actions = [],
  autoClose = true,
  duration = 4000
}) => {
  React.useEffect(() => {
    if (visible && autoClose && actions.length === 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose, actions.length]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          iconColor: '#ef4444',
          iconName: 'alert-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'success':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          iconColor: '#22c55e',
          iconName: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          borderColor: 'rgba(234, 179, 8, 0.3)',
          iconColor: '#eab308',
          iconName: 'warning' as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          iconColor: '#3b82f6',
          iconName: 'information-circle' as keyof typeof Ionicons.glyphMap,
        };
    }
  };

  const getActionVariantStyles = (actionVariant: string = 'default') => {
    switch (actionVariant) {
      case 'destructive':
        return {
          backgroundColor: '#ef4444',
          color: '#ffffff',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: '#27272a',
          borderWidth: 1,
          color: '#f4f4f5',
        };
      default:
        return {
          backgroundColor: '#E91E63',
          color: '#ffffff',
        };
    }
  };

  if (!visible) return null;

  const variantStyles = getVariantStyles();

  return (
    <Animated.View 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(150)}
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={variantStyles.iconName} 
            size={20} 
            color={variantStyles.iconColor} 
          />
        </View>
        
        <View style={styles.textContainer}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>

        {/* Close button for non-action alerts */}
        {actions.length === 0 && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={16} color="#a1a1aa" />
          </Pressable>
        )}
      </View>

      {/* Action buttons */}
      {actions.length > 0 && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => {
            const actionStyles = getActionVariantStyles(action.variant);
            return (
              <Pressable
                key={index}
                onPress={action.onPress}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: actionStyles.backgroundColor,
                    borderColor: actionStyles.borderColor,
                    borderWidth: actionStyles.borderWidth || 0,
                  }
                ]}
              >
                <Text style={[styles.actionText, { color: actionStyles.color }]}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 12,
    borderWidth: 1,
    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4f4f5',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#d4d4d8',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginTop: -4,
    marginRight: -4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Alert;