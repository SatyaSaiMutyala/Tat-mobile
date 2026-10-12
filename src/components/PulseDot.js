import React, {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';

import {colors, alpha, ScaledSheet} from '../theme';

/** The slow-pulsing dot used on the hero eyebrow and the notification bell. */
const PulseDot = ({size = 7, color = colors.white, ring = true, style}) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
        },
        ring && styles.ring,
        style,
      ]}
    />
  );
};

const styles = ScaledSheet.create({
  dot: {},
  ring: {
    borderWidth: '3@ms',
    borderColor: alpha.white32,
  },
});

export default PulseDot;
