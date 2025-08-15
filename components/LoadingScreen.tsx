import React from 'react';
import { View, StyleSheet, ColorValue, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from './ThemedText';
import Colors from '../constants/Colors';

interface LoadingScreenProps {
  message?: string;
  iconSize?: number;
  backgroundColor?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  showMessage?: boolean;
}

export default function LoadingScreen({
  message = 'Loading...',
  iconSize = 80,
  backgroundColor = ['#FF6B6B', '#FF8E8E', '#FFB3B3'] as const,
  showMessage = true,
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundColor}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <ActivityIndicator 
            size="large" 
            color={Colors.text.white}
          />
          {showMessage && (
            <ThemedText style={styles.loadingText}>
              {message}
            </ThemedText>
          )}
          
          {/* App branding */}
          <View style={styles.brandingContainer}>
            <ThemedText style={styles.appName}>Love Lock</ThemedText>
            <ThemedText style={styles.tagline}>Finding love through connection</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 20,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  brandingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
