import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '../../constants/DesignSystem';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  tint?: 'light' | 'dark' | 'cosmic';
}

export default function GlassCard({ 
  children, 
  style,
  intensity = 'medium',
  tint = 'light'
}: GlassCardProps) {
  
  const getGlassColors = () => {
    const intensityMap = {
      light: { opacity: 0.05, borderOpacity: 0.1 },
      medium: { opacity: 0.1, borderOpacity: 0.2 },
      strong: { opacity: 0.15, borderOpacity: 0.3 }
    };
    
    const tintMap = {
      light: 'rgba(255, 255, 255, ',
      dark: 'rgba(0, 0, 0, ',
      cosmic: 'rgba(124, 58, 237, '
    };
    
    const { opacity, borderOpacity } = intensityMap[intensity];
    const colorBase = tintMap[tint];
    
    return {
      backgroundColor: `${colorBase}${opacity})`,
      borderColor: `${colorBase}${borderOpacity})`,
    };
  };

  const glassColors = getGlassColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: glassColors.backgroundColor,
          borderColor: glassColors.borderColor,
        },
        DesignSystem.shadows.lg,
        style
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

GlassCard.displayName = "GlassCard";

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignSystem.borderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.scale.lg,
  },
  gradient: {
    padding: DesignSystem.spacing.scale.xl,
    minHeight: 60,
  },
});