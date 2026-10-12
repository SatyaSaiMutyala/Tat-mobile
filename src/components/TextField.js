import React, {useState} from 'react';
import {View, TextInput} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import AppText from './AppText';
import {colors, alpha, fonts, ms, ScaledSheet} from '../theme';

/**
 * Text input in two tones:
 *   'dark'  (default) — translucent, for the sign-in / set-password screens
 *   'light'           — bordered, for screens inside the app
 *
 * Either a `prefix` (e.g. "+91") or an `icon` sits on the left.
 */
const TextField = ({prefix, icon, tone = 'dark', style, ...rest}) => {
  const [focused, setFocused] = useState(false);
  const light = tone === 'light';

  return (
    <View
      style={[
        styles.field,
        light && styles.fieldLight,
        focused && (light ? styles.focusedLight : styles.focused),
        style,
      ]}>
      {prefix ? (
        <AppText
          variant="mono"
          size={13}
          weight="bold"
          color={light ? colors.tealDeep : colors.teal}
          style={[styles.prefix, light && styles.prefixLight]}>
          {prefix}
        </AppText>
      ) : null}

      {icon ? (
        <Feather
          name={icon}
          size={ms(16)}
          color={light ? colors.ink3 : alpha.white55}
          style={styles.icon}
        />
      ) : null}

      <TextInput
        style={[styles.input, light && styles.inputLight]}
        placeholderTextColor={light ? colors.ink3 : alpha.white35}
        allowFontScaling={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
    </View>
  );
};

const styles = ScaledSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    backgroundColor: alpha.white06,
    borderWidth: '1.5@ms',
    borderColor: alpha.white14,
    borderRadius: '14@ms',
    paddingHorizontal: '18@s',
    paddingVertical: '14@vs',
    marginBottom: '12@vs',
  },
  fieldLight: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  focused: {
    borderColor: colors.teal,
    backgroundColor: alpha.tealField,
  },
  focusedLight: {
    borderColor: colors.tealDeep,
    backgroundColor: colors.white,
  },
  prefix: {
    paddingRight: '10@s',
    borderRightWidth: '1@ms',
    borderRightColor: alpha.white15,
  },
  prefixLight: {borderRightColor: colors.line},
  icon: {marginRight: '-4@s'},
  input: {
    flex: 1,
    padding: 0,
    fontFamily: fonts.medium,
    fontSize: '14@ms',
    letterSpacing: '0.5@ms',
    color: colors.white,
  },
  inputLight: {color: colors.ink},
});

export default TextField;
