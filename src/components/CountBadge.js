import React from 'react';
import {View} from 'react-native';

import AppText from './AppText';
import {colors, ScaledSheet} from '../theme';

/** Counts above this read as noise; show "99+" instead. */
const MAX = 99;

/**
 * Small count pill pinned to the top-right of whatever it sits inside — the
 * notification bells and the tab bar icons.
 *
 * The parent must be `position: relative` (a plain View is, by default).
 * Renders nothing at zero, so callers can pass a count straight through.
 *
 * `ringColor` should match the surface behind the badge, since the ring is what
 * separates it from the icon underneath.
 */
const CountBadge = ({
  count = 0,
  tone = colors.crit,
  ringColor = colors.white,
  style,
}) => {
  if (!count || count < 1) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: tone, borderColor: ringColor},
        style,
      ]}>
      <AppText
        variant="mono"
        size={8.5}
        weight="extraBold"
        align="center"
        color={colors.white}>
        {count > MAX ? `${MAX}+` : count}
      </AppText>
    </View>
  );
};

const styles = ScaledSheet.create({
  badge: {
    position: 'absolute',
    top: '-4@vs',
    right: '-4@s',
    minWidth: '16@ms',
    paddingHorizontal: '5@s',
    paddingVertical: '1@vs',
    borderRadius: '8@ms',
    borderWidth: '1.5@ms',
  },
});

export default CountBadge;
