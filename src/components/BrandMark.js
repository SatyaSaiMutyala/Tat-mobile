import React from 'react';
import {View, Image} from 'react-native';

import {colors, ms, ScaledSheet} from '../theme';

/**
 * Brand mark for the splash and auth screens: the app logo on the original
 * teal tile.
 *
 * The logo asset has the artwork's own darker teal lifted out, so it sits on
 * `colors.teal` here rather than bringing a second, clashing green with it.
 */
const BrandMark = ({size = 82, style}) => (
  <View
    style={[
      styles.tile,
      {width: ms(size), height: ms(size), borderRadius: ms(size * 0.24)},
      style,
    ]}>
    <Image
      source={require('../../assets/logo-mark.png')}
      style={{width: ms(size * 0.74), height: ms(size * 0.74)}}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Trust TAT"
    />
  </View>
);

const styles = ScaledSheet.create({
  tile: {
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BrandMark;
