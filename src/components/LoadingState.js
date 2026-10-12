import React from 'react';
import {View, ActivityIndicator} from 'react-native';

import AppText from './AppText';
import {colors, ScaledSheet} from '../theme';

/** Centred spinner for a screen's first load. */
const LoadingState = ({label = 'Loading…'}) => (
  <View style={styles.wrap}>
    <ActivityIndicator size="large" color={colors.tealDeep} />
    <AppText variant="mono" size={10} tracking={1.4} uppercase style={styles.label}>
      {label}
    </AppText>
  </View>
);

const styles = ScaledSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '60@vs',
  },
  label: {marginTop: '14@vs'},
});

export default LoadingState;
