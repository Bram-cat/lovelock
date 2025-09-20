import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useRefreshAnimations = () => {
  const shadowOpacity = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const animateOnRefresh = () => {
    // Reset animations
    shadowOpacity.setValue(0);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);

    // Create staggered animations
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const animateOnMount = () => {
    // Initial mount animation
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shadowOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    animateOnMount();
  }, []);

  return {
    shadowOpacity,
    fadeAnim,
    scaleAnim,
    animateOnRefresh,
    animateOnMount,
  };
};