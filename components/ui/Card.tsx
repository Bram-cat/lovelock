import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem, createCardStyle, gradients } from '../../constants/DesignSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'glassmorphism' | 'gradient' | 'cosmic' | 'elevated';
  gradientType?: keyof typeof gradients;
  style?: ViewStyle;
  onPress?: () => void;
}

export default function Card({ 
  children, 
  variant = 'cosmic', 
  gradientType = 'glass',
  style,
  onPress 
}: CardProps) {
  const cardStyle = createCardStyle(variant);
  
  if (variant === 'gradient') {
    return (
      <LinearGradient
        {...gradients[gradientType]}
        style={[cardStyle, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Additional custom styles if needed
});