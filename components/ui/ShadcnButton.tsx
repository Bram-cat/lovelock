import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ViewStyle, 
  TextStyle,
  StyleSheet,
  ActivityIndicator,
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '../../constants/DesignSystem';
import ShadcnLoading from './ShadcnLoading';

interface ShadcnButtonProps {
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  startIcon?: keyof typeof Ionicons.glyphMap;
  endIcon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

export default function ShadcnButton({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
  startIcon,
  endIcon,
}: ShadcnButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: DesignSystem.colors.text.primary,
          borderColor: 'transparent',
        };
      case 'destructive':
        return {
          backgroundColor: DesignSystem.colors.semantic.error,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'transparent',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: DesignSystem.colors.text.primary,
          borderColor: 'transparent',
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'default':
        return DesignSystem.colors.backgrounds.dark;
      case 'destructive':
        return DesignSystem.colors.text.primary;
      case 'outline':
        return DesignSystem.colors.text.primary;
      case 'secondary':
        return DesignSystem.colors.text.primary;
      case 'ghost':
        return DesignSystem.colors.text.primary;
      case 'link':
        return DesignSystem.colors.primary.solidPurple;
      default:
        return DesignSystem.colors.backgrounds.dark;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: 12,
          borderRadius: 6,
          fontSize: DesignSystem.typography.sizes.sm,
        };
      case 'lg':
        return {
          height: 44,
          paddingHorizontal: 32,
          borderRadius: 8,
          fontSize: DesignSystem.typography.sizes.base,
        };
      case 'icon':
        return {
          height: 40,
          width: 40,
          paddingHorizontal: 0,
          borderRadius: 8,
          fontSize: DesignSystem.typography.sizes.base,
        };
      default:
        return {
          height: 40,
          paddingHorizontal: 16,
          borderRadius: 6,
          fontSize: DesignSystem.typography.sizes.sm,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        variantStyles,
        sizeStyles,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading && (
          <View style={styles.loader}>
            <ShadcnLoading 
              size="sm" 
              variant="spinner"
            />
          </View>
        )}
        
        {!loading && startIcon && (
          <Ionicons 
            name={startIcon} 
            size={sizeStyles.fontSize} 
            color={textColor} 
            style={styles.startIcon}
          />
        )}
        
        {children && (
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize: sizeStyles.fontSize },
              textStyle,
            ]}
          >
            {children}
          </Text>
        )}
        
        {!loading && endIcon && (
          <Ionicons 
            name={endIcon} 
            size={sizeStyles.fontSize} 
            color={textColor} 
            style={styles.endIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // Subtle shadow like Shadcn
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  loader: {
    marginRight: 8,
    height: 20,
    justifyContent: 'center',
  },
  startIcon: {
    marginRight: 8,
  },
  endIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});