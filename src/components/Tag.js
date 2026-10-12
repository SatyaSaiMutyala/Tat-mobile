import React from 'react';
import {View} from 'react-native';

import AppText from './AppText';
import {colors, alpha, ScaledSheet} from '../theme';

const PALETTE = {
  crit: {bg: colors.crit, fg: colors.white},
  stat: {bg: colors.greenDeep, fg: colors.white},
  rout: {bg: colors.paper2, fg: colors.ink3},
  aged: {bg: colors.crit, fg: colors.white},
  stale: {bg: '#6F211B', fg: colors.white},
  branch: {bg: colors.paper2, fg: colors.ink2},
  sla: {bg: alpha.tealTint, fg: colors.tealDeep},
};

/**
 * Priority / branch / SLA pill.
 * `size`: 'sm' (list cards) | 'md' (detail hero).
 */
const Tag = ({label, tone = 'rout', size = 'sm', style}) => {
  const palette = PALETTE[tone] || PALETTE.rout;

  return (
    <View
      style={[
        styles.tag,
        size === 'md' ? styles.md : styles.sm,
        {backgroundColor: palette.bg},
        style,
      ]}>
      <AppText
        variant="mono"
        size={size === 'md' ? 10 : 8.5}
        weight="extraBold"
        tracking={size === 'md' ? 0.5 : 0.6}
        color={palette.fg}>
        {label}
      </AppText>
    </View>
  );
};

const styles = ScaledSheet.create({
  tag: {alignSelf: 'flex-start'},
  sm: {
    paddingHorizontal: '6@s',
    paddingVertical: '2@vs',
    borderRadius: '4@ms',
  },
  md: {
    paddingHorizontal: '9@s',
    paddingVertical: '4@vs',
    borderRadius: '5@ms',
  },
});

export default Tag;
