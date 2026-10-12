import React from 'react';
import {View, ActivityIndicator, StatusBar} from 'react-native';

import {AppText, BrandMark, RadialGlow} from '../components';
import {colors, alpha, shadow, ms, ScaledSheet} from '../theme';

/** Shown while the stored session is being restored on cold start. */
const SplashScreen = () => (
  <View style={styles.screen}>
    <StatusBar barStyle="light-content" backgroundColor={colors.authBg} />

    <RadialGlow size={ms(260)} color="0,180,154" opacity={0.55} style={styles.glow} />

    <View style={styles.center}>
      <BrandMark size={82} style={shadow.teal} />
      <AppText
        variant="display"
        size={36}
        tracking={4}
        align="center"
        color={colors.white}
        style={styles.title}>
        TRUST TAT
      </AppText>
      <ActivityIndicator size="small" color={colors.teal} style={styles.spinner} />
    </View>

    <AppText
      variant="mono"
      size={9}
      tracking={1.4}
      uppercase
      align="center"
      color={alpha.white35}
      style={styles.footer}>
      TrustLab Diagnostics
    </AppText>
  </View>
);

const styles = ScaledSheet.create({
  screen: {flex: 1, overflow: 'hidden', backgroundColor: colors.authBg},
  glow: {position: 'absolute', top: '-60@vs', right: '-80@s'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {marginTop: '22@vs', lineHeight: '44@ms'},
  spinner: {marginTop: '28@vs'},
  footer: {paddingBottom: '28@vs'},
});

export default SplashScreen;
