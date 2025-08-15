import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PairedSplashAnimationProps {
  onComplete: () => void;
  duration?: number;
}

const { width, height } = Dimensions.get('window');

export default function PairedSplashAnimation({ 
  onComplete, 
  duration = 3500 
}: PairedSplashAnimationProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const heartScale1 = useRef(new Animated.Value(0)).current;
  const heartScale2 = useRef(new Animated.Value(0)).current;
  const heartOpacity1 = useRef(new Animated.Value(0)).current;
  const heartOpacity2 = useRef(new Animated.Value(0)).current;
  const connectingLine = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const backgroundGradient = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Phase 1: Background gradient fade in
      Animated.timing(backgroundGradient, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),

      // Phase 2: Logo appears with bounce
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // Phase 3: Hearts appear from sides
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(heartOpacity1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(heartScale1, {
              toValue: 1,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(heartOpacity2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(heartScale2, {
              toValue: 1,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      // Phase 4: Connecting line animation
      Animated.timing(connectingLine, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),

      // Phase 5: Title appears
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),

      // Phase 6: Hold for a moment
      Animated.delay(800),
    ]);

    // Continuous animations
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );



    // Start animations
    sequence.start(() => {
      setTimeout(onComplete, 500);
    });

    pulseAnimation.start();

    return () => {
      sequence.stop();
      pulseAnimation.stop();
    };
  }, [onComplete, backgroundGradient, logoOpacity, logoScale, heartOpacity1, heartScale1, heartOpacity2, heartScale2, connectingLine, titleOpacity, titleSlide, pulseAnim]);



  const connectingLineWidth = connectingLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.4],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={styles.gradientContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E', '#FFB3B3', '#d14fa7']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>



      {/* Main content */}
      <View style={styles.content}>
        {/* Left heart */}
        <Animated.View
          style={[
            styles.heartContainer,
            styles.leftHeart,
            {
              opacity: heartOpacity1,
              transform: [
                { scale: heartScale1 },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <View style={[styles.heart, styles.heartLeft]} />
        </Animated.View>

        {/* Connecting line */}
        <Animated.View
          style={[
            styles.connectingLineContainer,
            {
              width: connectingLineWidth,
            },
          ]}
        >
          <LinearGradient
            colors={['#FF6B6B', '#d14fa7', '#FF6B6B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.connectingLine}
          />
          <View style={styles.connectionDot} />
        </Animated.View>

        {/* Right heart */}
        <Animated.View
          style={[
            styles.heartContainer,
            styles.rightHeart,
            {
              opacity: heartOpacity2,
              transform: [
                { scale: heartScale2 },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <View style={[styles.heart, styles.heartRight]} />
        </Animated.View>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleSlide }],
            },
          ]}
        >
          <Animated.Text style={styles.appTitle}>Love Lock</Animated.Text>
          <Animated.Text style={styles.appSubtitle}>
            Finding love through connection
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: width * 0.8,
    height: height * 0.6,
  },
  heartContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftHeart: {
    left: 0,
    top: '40%',
  },
  rightHeart: {
    right: 0,
    top: '40%',
  },
  heart: {
    width: 30,
    height: 30,
    borderRadius: 15,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  heartLeft: {
    backgroundColor: '#FF6B6B',
  },
  heartRight: {
    backgroundColor: '#d14fa7',
  },
  connectingLineContainer: {
    position: 'absolute',
    top: '42%',
    height: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  connectionDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    shadowColor: '#d14fa7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  logoContainer: {
    position: 'absolute',
    top: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  titleContainer: {
    position: 'absolute',
    bottom: '20%',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
