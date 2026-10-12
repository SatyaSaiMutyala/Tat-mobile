import React from 'react';
import {View, TouchableOpacity} from 'react-native';

import AccentBar from './AccentBar';
import AppText from './AppText';
import {colors, ScaledSheet} from '../theme';

/**
 * Compact sample row for the "Most urgent" preview on Home.
 * Left-border colour keys off whether the deadline has passed.
 */
const MiniItem = ({
  code,
  title,
  meta,
  timeLabel,
  timeSuffix,
  tone = 'crit',
  onPress,
}) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.item}>
    <AccentBar color={tone === 'warn' ? colors.warn : colors.crit} />

    <View style={styles.left}>
      <AppText variant="mono" size={11.5} weight="semiBold" color={colors.ink3} tracking={0.3}>
        {code}
      </AppText>
      <AppText size={12.5} weight="bold" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="mono"
        size={9.5}
        tracking={0.3}
        numberOfLines={1}
        style={styles.meta}>
        {meta}
      </AppText>
    </View>

    <View style={styles.right}>
      <AppText
        variant="mono"
        size={12}
        weight="extraBold"
        align="right"
        color={tone === 'warn' ? colors.warn : colors.crit}>
        {timeLabel}
      </AppText>
      <AppText
        variant="mono"
        size={8.5}
        weight="bold"
        align="right"
        tracking={0.5}
        color={tone === 'warn' ? colors.warn : colors.crit}
        style={styles.suffix}>
        {timeSuffix}
      </AppText>
    </View>
  </TouchableOpacity>
);

const styles = ScaledSheet.create({
  item: {
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    overflow: 'hidden',
    paddingLeft: '18@s',
    paddingRight: '14@s',
    paddingVertical: '12@vs',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12@s',
    marginBottom: '8@vs',
  },
  left: {flex: 1, minWidth: 0},
  title: {marginTop: '2@vs', lineHeight: '15@ms'},
  meta: {marginTop: '3@vs'},
  right: {alignItems: 'flex-end'},
  suffix: {marginTop: '1@vs', opacity: 0.75},
});

export default MiniItem;
