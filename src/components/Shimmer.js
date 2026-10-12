import React, {useEffect, useRef, useState} from 'react';
import {View, Animated, Easing, StyleSheet, AccessibilityInfo} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {colors, ms} from '../theme';

const BASE = '#E7EDEA';
const HIGHLIGHT = 'rgba(255,255,255,0.85)';
const SWEEP_MS = 1150;

/**
 * The shimmer primitive — a placeholder block with a highlight sweeping across
 * it. Everything else in this file is composed from it.
 *
 *   <Shimmer width="60%" height={14} />
 *   <Shimmer width={44} height={44} radius={22} />
 *
 * Width may be a number or a percentage string; the sweep distance is measured
 * on layout, so percentages work. Honours the OS "reduce motion" setting by
 * falling back to a static block.
 */
export const Shimmer = ({width = '100%', height = 12, radius, style}) => {
  const translate = useRef(new Animated.Value(0)).current;
  const [measured, setMeasured] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (alive) {
        setReduceMotion(Boolean(enabled));
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!measured || reduceMotion) {
      return undefined;
    }

    translate.setValue(0);
    const loop = Animated.loop(
      Animated.timing(translate, {
        toValue: 1,
        duration: SWEEP_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [measured, reduceMotion, translate]);

  const borderRadius = radius !== undefined ? ms(radius) : ms(6);

  return (
    <View
      onLayout={e => setMeasured(e.nativeEvent.layout.width)}
      style={[
        styles.block,
        {width, height: ms(height), borderRadius},
        style,
      ]}>
      {measured > 0 && !reduceMotion ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                {
                  translateX: translate.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-measured, measured],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={['transparent', HIGHLIGHT, 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

/** A shimmer sized like a line of text. */
export const ShimmerLine = ({width = '100%', height = 12, style}) => (
  <Shimmer width={width} height={height} radius={4} style={style} />
);

/** A circular shimmer, for avatars and timeline dots. */
export const ShimmerCircle = ({size = 40, style}) => (
  <Shimmer width={ms(size)} height={size} radius={size / 2} style={style} />
);

/** A card-shaped shimmer surface that can wrap real skeleton content. */
export const ShimmerCard = ({height, radius = 14, style, children}) => {
  if (children) {
    return <View style={[styles.card, {borderRadius: ms(radius)}, style]}>{children}</View>;
  }
  return <Shimmer width="100%" height={height} radius={radius} style={style} />;
};

const styles = StyleSheet.create({
  block: {backgroundColor: BASE, overflow: 'hidden'},
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
});

export default Shimmer;
