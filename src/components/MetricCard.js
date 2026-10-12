import React from 'react';
import {TouchableOpacity} from 'react-native';

import AppText from './AppText';
import {colors, ScaledSheet} from '../theme';

const VALUE_COLOR = {
  default: colors.greenDeep,
  warn: colors.warn,
  crit: colors.crit,
};

/** Small stat tile used in the Home metric row. */
const MetricCard = ({label, value, caption, tone = 'default', onPress, style}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.card, style]}>
    <AppText
      variant="mono"
      size={9}
      tracking={1}
      uppercase
      weight="bold"
      style={styles.label}>
      {label}
    </AppText>
    <AppText
      variant="display"
      size={26}
      tracking={1}
      color={VALUE_COLOR[tone] || VALUE_COLOR.default}
      style={styles.value}>
      {value}
    </AppText>
    <AppText size={10.5} color={colors.ink3} lineHeight={14} style={styles.caption}>
      {caption}
    </AppText>
  </TouchableOpacity>
);

const styles = ScaledSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '14@ms',
    paddingHorizontal: '15@s',
    paddingVertical: '13@vs',
  },
  label: {marginBottom: '3@vs'},
  value: {lineHeight: '30@ms'},
  caption: {marginTop: '2@vs'},
});

export default MetricCard;
