import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppText from './AppText';
import {colors, ms, ScaledSheet} from '../theme';

/** Failed-to-load block with a retry action. */
const ErrorState = ({
  title = 'Could not load',
  message,
  onRetry,
  retryLabel = 'Try again',
}) => (
  <View style={styles.wrap}>
    <View style={styles.icon}>
      <Ionicons name="cloud-offline-outline" size={ms(30)} color={colors.crit} />
    </View>

    <AppText variant="display" size={19} tracking={1.2} align="center" color={colors.ink} style={styles.title}>
      {title}
    </AppText>
    <AppText size={12.5} align="center" lineHeight={19} color={colors.ink3}>
      {message}
    </AppText>

    {onRetry ? (
      <TouchableOpacity activeOpacity={0.85} onPress={onRetry} style={styles.button}>
        <AppText size={12} weight="extraBold" tracking={1} uppercase color={colors.white}>
          {retryLabel}
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = ScaledSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: '28@s',
    paddingVertical: '48@vs',
  },
  icon: {
    width: '64@ms',
    height: '64@ms',
    borderRadius: '32@ms',
    backgroundColor: colors.critTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14@vs',
  },
  title: {marginBottom: '6@vs'},
  button: {
    marginTop: '18@vs',
    backgroundColor: colors.greenDeep,
    paddingHorizontal: '22@s',
    paddingVertical: '11@vs',
    borderRadius: '999@ms',
  },
});

export default ErrorState;
