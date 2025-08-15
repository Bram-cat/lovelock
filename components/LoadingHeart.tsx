import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface LoadingHeartProps {
  size?: number;
  color?: string;
  duration?: number;
}

export default function LoadingHeart({
  size = 60,
  color = "#FF6B6B",
  duration = 1000,
}: LoadingHeartProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createHeartbeat = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: duration / 2,
              useNativeDriver: true,
              easing: Easing.out(Easing.quad),
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
              toValue: 0.8,
              duration: duration / 2,
              useNativeDriver: true,
              easing: Easing.in(Easing.quad),
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.4,
              duration: duration / 2,
              useNativeDriver: true,
              easing: Easing.in(Easing.quad),
            }),
          ]),
        ])
      );
    };

    const createRotation = () => {
      return Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 8,
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
            Animated.parallel([
              Animated.timing(animValue, {
                toValue: 1,
                duration: duration * 2,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
              }),
            ]),
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

    const heartbeatAnimation = createHeartbeat();
    const rotationAnimation = createRotation();
    const pulseAnimation = createPulseRings();

    heartbeatAnimation.start();
    rotationAnimation.start();
    pulseAnimation.start();

    return () => {
      heartbeatAnimation.stop();
      rotationAnimation.stop();
      pulseAnimation.stop();
    };
  }, [
    scaleAnim,
    opacityAnim,
    rotateAnim,
    pulseAnim1,
    pulseAnim2,
    pulseAnim3,
    duration,
  ]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Create floating particles animation
  const particleAnims = Array.from(
    { length: 8 },
    () => useRef(new Animated.Value(0)).current
  );

  useEffect(() => {
    const createParticleAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration * 3,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const particleAnimations = particleAnims.map((anim, index) =>
      createParticleAnimation(anim, index * (duration / 4))
    );

    particleAnimations.forEach((animation) => animation.start());

    return () => {
      particleAnimations.forEach((animation) => animation.stop());
    };
  }, [particleAnims, duration]);

  return (
    <View style={styles.container}>
      {/* Floating particles */}
      {particleAnims.map((anim, index) => {
        const angle = index * 45 * (Math.PI / 180); // 45 degrees apart
        const radius = size * 0.8;
        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * radius],
        });
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * radius],
        });
        const particleOpacity = anim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, 1, 1, 0],
        });
        const particleScale = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 0.3],
        });

        return (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                backgroundColor: color,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: particleScale },
                ],
                opacity: particleOpacity,
              },
            ]}
          />
        );
      })}

      {/* Enhanced pulse rings with different effects */}
      {[pulseAnim1, pulseAnim2, pulseAnim3].map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 3 + index * 0.5],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0.9, 0.6, 0.2, 0],
        });
        // Remove animated borderWidth as it's not supported by native driver
        const staticBorderWidth = 2;
        return (
          <Animated.View
            key={`ring-${index}`}
            style={[
              styles.pulseRing,
              {
                width: size * 1.2,
                height: size * 1.2,
                borderRadius: size * 0.6,
                borderColor: color,
                borderWidth: staticBorderWidth,
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
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim.interpolate({
              inputRange: [0.3, 1],
              outputRange: [0.1, 0.3],
            }),
          },
        ]}
      />

      {/* Main heart with enhanced animations */}
      <Animated.View
        style={[
          styles.heart,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleAnim }, { rotate: spin }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Create a clearer, more defined heart logo */}
        <Animated.View
          style={[
            styles.heartContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Main heart body */}
          <Animated.View
            style={[
              styles.heartBody,
              {
                backgroundColor: color,
                shadowColor: color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 12,
                elevation: 15,
              },
            ]}
          />

          {/* Left heart lobe */}
          <Animated.View
            style={[
              styles.heartLobeLeft,
              {
                backgroundColor: color,
                shadowColor: color,
                shadowOffset: { width: -1, height: 1 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 12,
              },
            ]}
          />

          {/* Right heart lobe */}
          <Animated.View
            style={[
              styles.heartLobeRight,
              {
                backgroundColor: color,
                shadowColor: color,
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 12,
              },
            ]}
          />

          {/* Heart highlight for 3D effect */}
          <Animated.View
            style={[
              styles.heartHighlight,
              {
                opacity: opacityAnim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.2, 0.6],
                }),
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  heart: {
    justifyContent: "center",
    alignItems: "center",
  },
  heartContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  heartBody: {
    width: "70%",
    height: "70%",
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    borderRadius: 12,
    top: "25%",
  },
  heartLobeLeft: {
    width: "45%",
    height: "45%",
    position: "absolute",
    left: "15%",
    top: "5%",
    borderRadius: 100,
  },
  heartLobeRight: {
    width: "45%",
    height: "45%",
    position: "absolute",
    right: "15%",
    top: "5%",
    borderRadius: 100,
  },
  heartHighlight: {
    width: "25%",
    height: "25%",
    position: "absolute",
    left: "20%",
    top: "15%",
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  glowBackground: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FF6B6B",
    backgroundColor: "transparent",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B6B",
  },
});
