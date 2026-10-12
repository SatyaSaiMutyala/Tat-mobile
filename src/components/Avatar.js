import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

import AppText from './AppText';
import {colors, gradients, ms, ScaledSheet} from '../theme';

/** Circular initials badge. `variant`: 'teal' (default) | 'yellow'. */
const Avatar = ({initials, size = 42, fontSize = 13, variant = 'teal', style}) => {
  const dimension = {
    width: ms(size),
    height: ms(size),
    borderRadius: ms(size / 2),
  };

  if (variant === 'yellow') {
    return (
      <LinearGradient
        colors={[colors.yellow, colors.yellow]}
        style={[styles.base, dimension, style]}>
        <AppText size={fontSize} weight="extraBold" color={colors.greenDeep} tracking={0.5}>
          {initials}
        </AppText>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradients.avatar}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.base, dimension, style]}>
      <AppText size={fontSize} weight="extraBold" color={colors.white} tracking={0.5}>
        {initials}
      </AppText>
    </LinearGradient>
  );
};

const styles = ScaledSheet.create({
  base: {alignItems: 'center', justifyContent: 'center'},
});

export default Avatar;
