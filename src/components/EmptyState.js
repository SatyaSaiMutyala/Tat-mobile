import React from 'react';
import {View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import AppText from './AppText';
import {colors, ms, ScaledSheet} from '../theme';

/** Centred "nothing here" block with a tinted circular icon. */
const EmptyState = ({
  icon = 'check',
  title,
  message,
  tone = 'ok',
  compact = false,
}) => {
  const fg = tone === 'ok' ? colors.ok : colors.ink4;
  const bg = tone === 'ok' ? colors.okTint : colors.paper2;

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={[styles.icon, {backgroundColor: bg}]}>
        <Feather name={icon} size={ms(32)} color={fg} />
      </View>
      <AppText
        variant="display"
        size={20}
        tracking={1.5}
        align="center"
        color={tone === 'ok' ? colors.ok : colors.ink3}
        style={styles.title}>
        {title}
      </AppText>
      <AppText size={12} align="center" color={colors.ink4} lineHeight={18}>
        {message}
      </AppText>
    </View>
  );
};

const styles = ScaledSheet.create({
  wrap: {
    paddingHorizontal: '30@s',
    paddingVertical: '60@vs',
    alignItems: 'center',
  },
  compact: {paddingVertical: '30@vs', paddingHorizontal: '20@s'},
  icon: {
    width: '72@ms',
    height: '72@ms',
    borderRadius: '36@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16@vs',
  },
  title: {marginBottom: '6@vs'},
});

export default EmptyState;
