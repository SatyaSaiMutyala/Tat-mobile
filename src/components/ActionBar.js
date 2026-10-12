import React from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppText from './AppText';
import {colors, shadow, ms, ScaledSheet} from '../theme';

/** Wide primary action button (yellow escalate / green report). */
export const PrimaryAction = ({
  label,
  onPress,
  tone = 'yellow',
  loading = false,
  disabled = false,
  style,
}) => {
  const inactive = loading || disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={inactive}
      style={[
        styles.primary,
        tone === 'yellow' ? styles.primaryYellow : styles.primaryOk,
        tone === 'yellow' && shadow.yellow,
        inactive && styles.primaryInactive,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={tone === 'yellow' ? colors.greenDeep : colors.white}
        />
      ) : (
        <AppText
          size={12.5}
          weight="extraBold"
          tracking={1.2}
          uppercase
          align="center"
          color={tone === 'yellow' ? colors.greenDeep : colors.white}>
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

/** Round icon button — WhatsApp / call. */
export const CircleAction = ({icon, family = 'feather', tone, onPress}) => {
  const Icon = family === 'mci' ? MCIcon : Feather;
  const bg =
    tone === 'wa' ? '#25D366' : tone === 'call' ? colors.tealDeep : colors.paper2;
  const fg = tone ? colors.white : colors.ink2;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.circle, {backgroundColor: bg}]}>
      <Icon name={icon} size={ms(18)} color={fg} />
    </TouchableOpacity>
  );
};

/** Sticky bottom action bar on the sample detail screen. */
const ActionBar = ({children}) => <View style={styles.bar}>{children}</View>;

const styles = ScaledSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
    paddingHorizontal: '16@s',
    paddingTop: '12@vs',
    paddingBottom: '16@vs',
    borderTopWidth: '1@ms',
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  primary: {
    flex: 1,
    paddingVertical: '14@vs',
    borderRadius: '14@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryYellow: {backgroundColor: colors.yellow},
  primaryOk: {backgroundColor: colors.ok},
  primaryInactive: {opacity: 0.55},
  circle: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ActionBar;
