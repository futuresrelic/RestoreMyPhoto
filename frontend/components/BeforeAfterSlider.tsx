/**
 * Before/After image comparison slider component
 */
import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../utils/theme';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  width?: number;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  width = SCREEN_WIDTH - spacing.lg * 2,
  height = 400,
}) => {
  const [sliderPosition, setSliderPosition] = useState(width / 2);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(width, gestureState.moveX - spacing.lg));
      setSliderPosition(newPosition);
    },
  });

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Before image (full) */}
      <Image
        source={{ uri: beforeImage }}
        style={[styles.image, { width, height }]}
        resizeMode="cover"
      />

      {/* After image (clipped) */}
      <View
        style={[
          styles.afterImageContainer,
          { width: sliderPosition, height },
        ]}
      >
        <Image
          source={{ uri: afterImage }}
          style={[styles.image, { width, height }]}
          resizeMode="cover"
        />
      </View>

      {/* Slider handle */}
      <View
        style={[styles.sliderHandle, { left: sliderPosition - 2 }]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.8)']}
          style={styles.sliderLine}
        >
          <View style={styles.sliderCircle}>
            <View style={styles.sliderArrows}>
              <View style={styles.arrowLeft} />
              <View style={styles.arrowRight} />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Labels */}
      <View style={styles.labelContainer}>
        <View style={styles.label}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
            style={styles.labelBackground}
          >
            <Text style={styles.labelText}>Before</Text>
          </LinearGradient>
        </View>

        <View style={[styles.label, styles.labelRight]}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.8)', 'rgba(212, 175, 55, 0.6)']}
            style={styles.labelBackground}
          >
            <Text style={styles.labelText}>After</Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  afterImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sliderLine: {
    width: 4,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderArrows: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.background,
  },
  arrowRight: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.background,
  },
  labelContainer: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  label: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  labelRight: {
    alignSelf: 'flex-end',
  },
  labelBackground: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  labelText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

import { Text } from 'react-native';

export default BeforeAfterSlider;
