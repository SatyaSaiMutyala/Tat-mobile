import React from 'react';
import {View} from 'react-native';

import {ScaledSheet} from '../theme';

/**
 * The coloured stripe down the left edge of a card.
 *
 * Rendered as an absolutely-positioned element rather than `borderLeftColor`,
 * which Android resolves inconsistently when `borderColor` is also set.
 *
 * `width` must be a resolved number (e.g. `ms(3)`) — ScaledSheet tokens like
 * '4@ms' are only interpreted inside `ScaledSheet.create`, not inline.
 */
const AccentBar = ({color, width}) => (
  <View
    style={[
      styles.bar,
      {backgroundColor: color},
      width !== undefined && {width},
    ]}
  />
);

const styles = ScaledSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4@ms',
    zIndex: 2,
  },
});

export default AccentBar;
