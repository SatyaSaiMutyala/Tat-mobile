import React from 'react';
import {View, Switch, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppText from './AppText';
import {colors, alpha, ms, ScaledSheet} from '../theme';

/**
 * One settings line. Either a switch (`value` + `onValueChange`) or a tappable
 * row showing a current `hint` (`onPress`).
 */
const SettingRow = ({
  icon,
  label,
  caption,
  value,
  onValueChange,
  onPress,
  hint,
  disabled = false,
}) => {
  const isSwitch = typeof value === 'boolean';

  const body = (
    <View style={[styles.row, disabled && styles.disabled]}>
      {icon ? (
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={ms(17)} color={colors.tealDeep} />
        </View>
      ) : null}

      <View style={styles.text}>
        <AppText size={13.5} weight="bold" numberOfLines={1}>
          {label}
        </AppText>
        {caption ? (
          <AppText size={11.5} color={colors.ink3} style={styles.caption}>
            {caption}
          </AppText>
        ) : null}
      </View>

      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{false: colors.line, true: colors.teal}}
          thumbColor={colors.white}
        />
      ) : (
        <View style={styles.hintWrap}>
          {hint ? (
            <AppText variant="mono" size={11} weight="bold" color={colors.ink2}>
              {hint}
            </AppText>
          ) : null}
          <Ionicons name="chevron-forward" size={ms(15)} color={colors.ink4} />
        </View>
      )}
    </View>
  );

  if (isSwitch || !onPress) {
    return body;
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled}>
      {body}
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    marginBottom: '8@vs',
  },
  disabled: {opacity: 0.5},
  iconBox: {
    width: '34@ms',
    height: '34@ms',
    borderRadius: '10@ms',
    backgroundColor: alpha.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {flex: 1, minWidth: 0},
  caption: {marginTop: '2@vs'},
  hintWrap: {flexDirection: 'row', alignItems: 'center', gap: '6@s'},
});

export default SettingRow;
