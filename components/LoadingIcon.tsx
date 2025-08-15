import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, Image } from "react-native";

interface LoadingIconProps {
  size?: number;
  duration?: number;
}

export default function LoadingIcon({
  size = 80,
  duration = 1000,
}: LoadingIconProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: duration / 2,
              useNativeDriver: true,
              easing: Easing.out(Easing.back(1.2)),
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
              easing: Easing.out(Easing.quad),
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 0.9,
              duration: duration / 2,
              useNativeDriver: true,
              easing: Easing.in(Easing.back(1.2)),
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: duration / 2,
              useNativeDriver: true,
              easing: Easing.in(Easing.quad),
            }),
          ]),
        ])
      );
    };

    const createBounceAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.1,
            duration: duration * 0.3,
            useNativeDriver: true,
            easing: Easing.out(Easing.bounce),
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: duration * 0.7,
            useNativeDriver: true,
            easing: Easing.in(Easing.bounce),
          }),
        ])
      );
    };

    const createGlowAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: duration * 1.5,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: duration * 1.5,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ])
      );
    };

    const createShimmerAnimation = () => {
      return Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: duration * 2,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      );
    };

    const createRotation = () => {
      return Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 6,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      );
    };

    const createPulseRings = () => {
      const createPulse = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: duration * 2,
              useNativeDriver: true,
              easing: Easing.out(Easing.quad),
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      return Animated.parallel([
        createPulse(pulseAnim1, 0),
        createPulse(pulseAnim2, duration * 0.3),
        createPulse(pulseAnim3, duration * 0.6),
      ]);
    };

    const pulseAnimation = createPulseAnimation();
    const rotationAnimation = createRotation();
    const ringsAnimation = createPulseRings();
    const bounceAnimation = createBounceAnimation();
    const glowAnimation = createGlowAnimation();
    const shimmerAnimation = createShimmerAnimation();

    pulseAnimation.start();
    rotationAnimation.start();
    ringsAnimation.start();
    bounceAnimation.start();
    glowAnimation.start();
    shimmerAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotationAnimation.stop();
      ringsAnimation.stop();
      bounceAnimation.stop();
      glowAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [scaleAnim, opacityAnim, rotateAnim, pulseAnim1, pulseAnim2, pulseAnim3, bounceAnim, glowAnim, shimmerAnim, duration]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 2, size * 2],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      {/* Floating particles */}
      {Array.from({ length: 12 }, (_, index) => {
        const angle = index * 30 * (Math.PI / 180); // 30 degrees apart
        const radius = size * 0.8;
        const particleAnim = useRef(new Animated.Value(0)).current;
        
        useEffect(() => {
          const createParticleAnimation = () => {
            return Animated.loop(
              Animated.sequence([
                Animated.delay(index * 100),
                Animated.timing(particleAnim, {
                  toValue: 1,
                  duration: duration * 3,
                  useNativeDriver: true,
                  easing: Easing.out(Easing.quad),
                }),
                Animated.timing(particleAnim, {
                  toValue: 0,
                  duration: 0,
                  useNativeDriver: true,
                }),
              ])
            );
          };
          
          const animation = createParticleAnimation();
          animation.start();
          
          return () => animation.stop();
        }, []);
        
        const translateX = particleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * radius],
        });
        const translateY = particleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * radius],
        });
        const particleOpacity = particleAnim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, 1, 1, 0],
        });
        const particleScale = particleAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1.2, 0.3],
        });
        
        return (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale: particleScale },
                ],
                opacity: particleOpacity,
                backgroundColor: index % 3 === 0 ? '#FF6B6B' : index % 3 === 1 ? '#FF8E8E' : '#FFB3B3',
              },
            ]}
          />
        );
      })}

      {/* Enhanced pulse rings with different colors */}
      {[pulseAnim1, pulseAnim2, pulseAnim3].map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 3 + index * 0.5],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0.9, 0.6, 0.3, 0],
        });
        const colors = ['#FF6B6B', '#FF8E8E', '#FFB3B3'];
        return (
          <Animated.View
            key={`ring-${index}`}
            style={[
              styles.pulseRing,
              {
                width: size * 1.5,
                height: size * 1.5,
                borderRadius: size * 0.75,
                borderColor: colors[index],
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        );
      })}

      {/* Enhanced background glow with animation */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            width: size + 60,
            height: size + 60,
            borderRadius: (size + 60) / 2,
            transform: [{ scale: Animated.multiply(scaleAnim, glowScale) }],
            opacity: Animated.multiply(opacityAnim, glowOpacity),
          },
        ]}
      />

      {/* Secondary glow layer */}
      <Animated.View
        style={[
          styles.secondaryGlow,
          {
            width: size + 30,
            height: size + 30,
            borderRadius: (size + 30) / 2,
            transform: [{ scale: scaleAnim }],
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Main icon with enhanced effects */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            transform: [
              { scale: Animated.multiply(scaleAnim, bounceAnim) },
              { rotate: spin },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <Image
          source={require('../../assets/images/icon.png')}
          style={[
            styles.icon,
            {
              width: size,
              height: size,
            },
          ]}
          resizeMode="contain"
        />
        
        {/* Shimmer overlay effect */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              width: size,
              height: size,
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        />
        
        {/* Icon highlight for 3D effect */}
        <Animated.View
          style={[
            styles.iconHighlight,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              opacity: opacityAnim.interpolate({
                inputRange: [0.3, 1],
                outputRange: [0.2, 0.5],
              }),
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    overflow: 'hidden',
  },
  icon: {
    borderRadius: 20,
  },
  glowBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 8,
  },
  secondaryGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FFB3B3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 6,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FF6B6B',
    backgroundColor: 'transparent',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    opacity: 0.7,
  },
  iconHighlight: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
});
