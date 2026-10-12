import React from 'react';
import {Text} from 'react-native';

import {colors, fonts, ms, ScaledSheet} from '../theme';

/**
 * The single text primitive for the whole app.
 *
 *   <AppText variant="display" size={26}>TODAY'S TAT</AppText>
 *   <AppText variant="mono" size={10} color={colors.ink4}>SRA 09:12</AppText>
 *
 * variant:
 *   body     — Outfit Regular    (DM Sans in the reference design)
 *   display  — Outfit Bold, uppercase + tracking (Bebas Neue substitute)
 *   mono     — Outfit Medium + tracking          (JetBrains Mono substitute)
 */
const AppText = ({
  variant = 'body',
  size,
  weight,
  color,
  align,
  tracking,
  lineHeight,
  uppercase,
  style,
  children,
  ...rest
}) => {
  const base = styles[variant] || styles.body;

  return (
    <Text
      allowFontScaling={false}
      style={[
        base,
        size !== undefined && {fontSize: ms(size)},
        weight && {fontFamily: fonts[weight] || fonts.regular},
        color && {color},
        align && {textAlign: align},
        tracking !== undefined && {letterSpacing: ms(tracking)},
        lineHeight !== undefined && {lineHeight: ms(lineHeight)},
        uppercase && styles.uppercase,
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
};

const styles = ScaledSheet.create({
  body: {
    fontFamily: fonts.regular,
    fontSize: '13@ms',
    color: colors.ink,
  },
  display: {
    fontFamily: fonts.bold,
    fontSize: '26@ms',
    color: colors.greenDeep,
    letterSpacing: '1@ms',
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: fonts.medium,
    fontSize: '10@ms',
    color: colors.ink4,
    letterSpacing: '0.8@ms',
  },
  uppercase: {textTransform: 'uppercase'},
});

export default AppText;
