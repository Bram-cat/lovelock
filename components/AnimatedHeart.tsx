import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface AnimatedHeartProps {
  size?: number;
  color?: string;
  delay?: number;
  pulseIntensity?: number;
  style?: any;
}

export default function AnimatedHeart({
  size = 30,
  color = '#FF6B6B',
  delay = 0,
  pulseIntensity = 0.2,
  style
}: AnimatedHeartProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1 + pulseIntensity,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle rotation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    // Start animations with delay
    setTimeout(() => {
      pulseAnimation.start();
      rotationAnimation.start();
      glowAnimation.start();
    }, delay);

    return () => {
      pulseAnimation.stop();
      rotationAnimation.stop();
      glowAnimation.stop();
    };
  }, [delay, pulseIntensity]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.3, 0.8],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [4, 12],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { scale: scaleAnim },
            { rotate: rotation },
          ],
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.heart,
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
            shadowColor: color,
            shadowOpacity,
            shadowRadius,
          },
        ]}
      >
        {/* Heart shape using pseudo-elements */}
        <View
          style={[
            styles.heartBefore,
            {
              width: size * 0.52,
              height: size * 0.8,
              backgroundColor: color,
              borderRadius: size * 0.26,
              left: size * 0.26,
              top: 0,
            },
          ]}
        />
        <View
          style={[
            styles.heartAfter,
            {
              width: size * 0.52,
              height: size * 0.8,
              backgroundColor: color,
              borderRadius: size * 0.26,
              left: 0,
              top: 0,
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heart: {
    position: 'relative',
    transform: [{ rotate: '45deg' }],
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  heartBefore: {
    position: 'absolute',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heartAfter: {
    position: 'absolute',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});
