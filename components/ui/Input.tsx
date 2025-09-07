import React, { useState } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  TextInputProps,
  ViewStyle,
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem, createInputStyle } from '../../constants/DesignSystem';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'glass';
}

export default function Input({
  label,
  error,
  icon,
  containerStyle,
  variant = 'default',
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: any) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    onBlur?.(e);
  };

  const inputStyle = createInputStyle(focused);

  const getContainerStyle = () => {
    if (variant === 'glass') {
      return [
        inputStyle,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderColor: focused 
            ? 'rgba(124, 58, 237, 0.5)' 
            : 'rgba(255, 255, 255, 0.2)',
        }
      ];
    }
    return inputStyle;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={[getContainerStyle(), error && styles.errorBorder]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={DesignSystem.typography.sizes.xl}
            color={focused ? '#7C3AED' : 'rgba(255, 255, 255, 0.6)'}
            style={styles.icon}
          />
        )}
        
        <TextInput
          {...props}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            style
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={DesignSystem.components.input.placeholder.color}
        />
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing.scale.lg,
  },
  label: {
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.scale.sm,
  },
  input: {
    flex: 1,
    fontSize: DesignSystem.typography.sizes.base,
    color: DesignSystem.colors.text.primary,
    padding: 0, // Remove default padding
  },
  inputWithIcon: {
    marginLeft: DesignSystem.spacing.scale.md,
  },
  icon: {
    marginRight: DesignSystem.spacing.scale.md,
  },
  errorBorder: {
    borderColor: DesignSystem.colors.semantic.error,
  },
  errorText: {
    fontSize: DesignSystem.typography.sizes.xs,
    color: DesignSystem.colors.semantic.error,
    marginTop: DesignSystem.spacing.scale.xs,
  },
});