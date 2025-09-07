import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShadcnLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}

export default function ShadcnLoading({
  size = 'md',
  variant = 'spinner',
  text,
}: ShadcnLoadingProps) {
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (variant === 'spinner') {
      const spin = Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    }

    if (variant === 'pulse') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }

    if (variant === 'dots') {
      const animateDots = () => {
        const animations = dotAnimations.map((dot, index) =>
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );

        Animated.loop(
          Animated.stagger(100, animations)
        ).start();
      };
      
      animateDots();
    }
  }, [variant]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 20, height: 20 };
      case 'lg':
        return { width: 40, height: 40 };
      default:
        return { width: 24, height: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 16;
      default:
        return 14;
    }
  };

  const renderSpinner = () => {
    const spin = spinAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.spinner,
          getSizeStyles(),
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Ionicons 
          name="sync" 
          size={getSizeStyles().width} 
          color="#f4f4f5" 
        />
      </Animated.View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {dotAnimations.map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: dot,
                transform: [{
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderPulse = () => {
    return (
      <Animated.View
        style={[
          styles.pulse,
          getSizeStyles(),
          {
            opacity: pulseAnimation,
            transform: [{
              scale: pulseAnimation.interpolate({
                inputRange: [0.6, 1],
                outputRange: [1, 1.1],
              }),
            }],
          },
        ]}
      >
        <Ionicons 
          name="radio-button-on" 
          size={getSizeStyles().width} 
          color="#f4f4f5" 
        />
      </Animated.View>
    );
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loadingWrapper}>
        {renderLoader()}
      </View>
      {text && (
        <Text style={[styles.loadingText, { fontSize: getTextSize() }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

ShadcnLoading.displayName = 'ShadcnLoading';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    // Shadcn-style shadow
    backgroundColor: '#09090b', // background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a', // border
    padding: 12,
    // Enhanced shadow like Shadcn
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f4f4f5',
  },
  pulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#f4f4f5', // foreground
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
});