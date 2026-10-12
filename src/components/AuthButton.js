import React from 'react';
import {TouchableOpacity, ActivityIndicator} from 'react-native';

import AppText from './AppText';
import {colors, shadow, ScaledSheet} from '../theme';

/** Full-width teal action button used on the auth screens. */
const AuthButton = ({label, onPress, loading = false, disabled = false, style}) => {
  const inactive = loading || disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={inactive}
      style={[styles.button, shadow.authButton, inactive && styles.disabled, style]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.greenDeep} />
      ) : (
        <AppText
          size={13}
          weight="extraBold"
          tracking={1.5}
          uppercase
          align="center"
          color={colors.greenDeep}>
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  button: {
    backgroundColor: colors.white,
    borderRadius: '14@ms',
    height: '52@vs',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '8@vs',
  },
  disabled: {opacity: 0.6},
});

export default AuthButton;
