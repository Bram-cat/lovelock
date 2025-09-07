import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ViewStyle, 
  TextStyle,
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem, createButtonStyle, gradients } from '../../constants/DesignSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'cosmic' | 'cta';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  gradientColors
}: ButtonProps) {
  const buttonStyle = createButtonStyle(variant, size);
  const isGradientButton = variant === 'primary' || variant === 'cosmic' || variant === 'cta';
  
  const getGradientColors = () => {
    if (gradientColors) return gradientColors;
    
    switch (variant) {
      case 'primary':
        return gradients.primary.colors;
      case 'cosmic':
        return gradients.cosmicHeart.colors;
      case 'cta':
        return gradients.cta.colors;
      default:
        return gradients.primary.colors;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'ghost':
        return '#7C3AED';
      case 'cta':
        return '#000000';
      default:
        return '#FFFFFF';
    }
  };

  const renderContent = () => (
    <>
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          style={styles.loader}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={DesignSystem.typography.sizes.lg} 
          color={getTextColor()} 
          style={styles.iconLeft}
        />
      )}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
      {!loading && icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={DesignSystem.typography.sizes.lg} 
          color={getTextColor()} 
          style={styles.iconRight}
        />
      )}
    </>
  );

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  if (isGradientButton) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[buttonStyle, DesignSystem.shadows.md]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        buttonStyle,
        DesignSystem.shadows.md,
        style,
        disabled && styles.disabled
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: DesignSystem.typography.sizes.base,
    fontWeight: DesignSystem.typography.weights.semibold,
    textAlign: 'center',
  },
  loader: {
    marginRight: DesignSystem.spacing.scale.sm,
  },
  iconLeft: {
    marginRight: DesignSystem.spacing.scale.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.scale.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});