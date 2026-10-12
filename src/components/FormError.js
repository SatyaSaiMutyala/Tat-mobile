import React from 'react';
import {View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppText from './AppText';
import {colors, ms, ScaledSheet} from '../theme';

/** Server-side error banner for the dark auth screens. */
const FormError = ({message}) => {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.box}>
      <Ionicons name="alert-circle-outline" size={ms(18)} color={colors.crit} />
      <AppText size={12} lineHeight={17} color="#FFD9D5" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
};

const styles = ScaledSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '10@s',
    backgroundColor: 'rgba(200,54,42,0.18)',
    borderWidth: '1@ms',
    borderColor: 'rgba(200,54,42,0.55)',
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '11@vs',
    marginBottom: '14@vs',
  },
  text: {flex: 1},
});

export default FormError;
