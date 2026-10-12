import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import AppText from './AppText';
import {colors, ScaledSheet} from '../theme';

/** The red "N pending past release date" banner on Past Overdue. */
const CarryBanner = ({children}) => (
  <LinearGradient
    colors={[colors.critTint, colors.warnTint]}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
    style={styles.banner}>
    <View style={styles.icon}>
      <AppText size={20} weight="extraBold" color={colors.white}>
        !
      </AppText>
    </View>
    <View style={styles.text}>{children}</View>
  </LinearGradient>
);

const styles = ScaledSheet.create({
  banner: {
    borderWidth: '1@ms',
    borderColor: colors.crit,
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    marginHorizontal: '14@s',
    marginTop: '12@vs',
    marginBottom: '6@vs',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
  },
  icon: {
    width: '38@ms',
    height: '38@ms',
    borderRadius: '19@ms',
    backgroundColor: colors.crit,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {flex: 1},
});

export default CarryBanner;
