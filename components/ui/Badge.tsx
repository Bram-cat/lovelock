import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { DesignSystem } from '../../constants/DesignSystem';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'cosmic';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle
}: BadgeProps) {
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: 8,
          fontSize: 10,
        };
      case 'lg':
        return {
          paddingVertical: 6,
          paddingHorizontal: 16,
          fontSize: 14,
        };
      default: // md
        return {
          paddingVertical: 4,
          paddingHorizontal: 12,
          fontSize: 12,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const badgeVariant = DesignSystem.components.badge.variants[variant];

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: badgeVariant.backgroundColor,
        },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyles.fontSize,
            color: badgeVariant.color,
          },
          textStyle
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignSystem.borderRadius.md,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: DesignSystem.typography.weights.semibold,
    textAlign: 'center',
  },
});