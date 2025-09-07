import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

// Shimmer loading effect similar to shadcn
export const ShimmerSkeleton = ({ width, height, borderRadius = 8 }: {
  width: number | string;
  height: number;
  borderRadius?: number;
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
      ]}
    />
  );
};

// Numerology Reading Loading Skeleton
export const NumerologyLoadingSkeleton = () => (
  <View style={styles.container}>
    {/* Header Skeleton */}
    <View style={styles.headerSkeleton}>
      <ShimmerSkeleton width="60%" height={24} borderRadius={12} />
      <View style={styles.actionsSkeleton}>
        <ShimmerSkeleton width={80} height={36} borderRadius={18} />
        <ShimmerSkeleton width={36} height={36} borderRadius={18} />
        <ShimmerSkeleton width={36} height={36} borderRadius={18} />
      </View>
    </View>

    {/* Profile Card Skeleton */}
    <View style={styles.profileCardSkeleton}>
      <View style={styles.profileHeaderSkeleton}>
        <ShimmerSkeleton width={72} height={72} borderRadius={36} />
        <View style={styles.profileInfoSkeleton}>
          <ShimmerSkeleton width="70%" height={22} borderRadius={11} />
          <ShimmerSkeleton width="40%" height={16} borderRadius={8} />
        </View>
      </View>
      
      <View style={styles.numbersGridSkeleton}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={styles.numberItemSkeleton}>
            <ShimmerSkeleton width={32} height={32} borderRadius={16} />
            <ShimmerSkeleton width={50} height={12} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>

    {/* Content Sections Skeleton */}
    <View style={styles.sectionSkeleton}>
      <ShimmerSkeleton width="40%" height={20} borderRadius={10} />
      <View style={styles.cardsSkeleton}>
        <ShimmerSkeleton width="100%" height={120} borderRadius={16} />
        <ShimmerSkeleton width="100%" height={120} borderRadius={16} />
      </View>
    </View>
  </View>
);

// Love Match Loading Skeleton
export const LoveMatchLoadingSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.headerSkeleton}>
      <ShimmerSkeleton width="50%" height={24} borderRadius={12} />
      <ShimmerSkeleton width={36} height={36} borderRadius={18} />
    </View>

    <View style={styles.profileCardSkeleton}>
      <ShimmerSkeleton width="60%" height={20} borderRadius={10} />
      <View style={styles.numbersRowSkeleton}>
        {[...Array(3)].map((_, i) => (
          <ShimmerSkeleton key={i} width={60} height={80} borderRadius={12} />
        ))}
      </View>
    </View>

    {/* Partners Skeleton */}
    <View style={styles.sectionSkeleton}>
      <ShimmerSkeleton width="60%" height={20} borderRadius={10} />
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.partnerCardSkeleton}>
          <View style={styles.partnerHeaderSkeleton}>
            <View style={styles.partnerNumbersSkeleton}>
              {[...Array(3)].map((_, j) => (
                <ShimmerSkeleton key={j} width={24} height={24} borderRadius={12} />
              ))}
            </View>
            <ShimmerSkeleton width="25%" height={16} borderRadius={8} />
          </View>
          <ShimmerSkeleton width="100%" height={60} borderRadius={8} />
        </View>
      ))}
    </View>
  </View>
);

// Trust Assessment Loading Skeleton
export const TrustAssessmentLoadingSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.headerSkeleton}>
      <ShimmerSkeleton width="55%" height={24} borderRadius={12} />
      <ShimmerSkeleton width={36} height={36} borderRadius={18} />
    </View>

    {/* Assessment Form Skeleton */}
    <View style={styles.sectionSkeleton}>
      <ShimmerSkeleton width="40%" height={20} borderRadius={10} />
      <View style={styles.formSkeleton}>
        <ShimmerSkeleton width="100%" height={50} borderRadius={12} />
        <ShimmerSkeleton width="100%" height={50} borderRadius={12} />
        <View style={styles.relationshipTypesSkeleton}>
          {[...Array(6)].map((_, i) => (
            <ShimmerSkeleton key={i} width={80} height={40} borderRadius={20} />
          ))}
        </View>
      </View>
    </View>

    {/* Results Skeleton */}
    <View style={styles.sectionSkeleton}>
      <ShimmerSkeleton width="50%" height={20} borderRadius={10} />
      <ShimmerSkeleton width="100%" height={200} borderRadius={16} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#2C2C2E',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
    gap: 24,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  actionsSkeleton: {
    flexDirection: 'row',
    gap: 12,
  },
  profileCardSkeleton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    gap: 24,
  },
  profileHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileInfoSkeleton: {
    flex: 1,
    gap: 8,
  },
  numbersGridSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberItemSkeleton: {
    alignItems: 'center',
    gap: 8,
  },
  numbersRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  sectionSkeleton: {
    gap: 16,
  },
  cardsSkeleton: {
    gap: 16,
  },
  partnerCardSkeleton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  partnerHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerNumbersSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  formSkeleton: {
    gap: 16,
  },
  relationshipTypesSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});