import React from 'react';
import {View, StatusBar} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import AppText from './AppText';
import BrandMark from './BrandMark';
import RadialGlow from './RadialGlow';
import {colors, alpha, shadow, ms, ScaledSheet} from '../theme';

/**
 * Shared dark shell for the pre-dashboard screens (sign in, change password) —
 * brand mark, title, ambient glows and a keyboard-aware body.
 */
const AuthLayout = ({title, tagline, footer, children}) => (
  <View style={styles.screen}>
    <StatusBar barStyle="light-content" backgroundColor={colors.authBg} />

    <RadialGlow size={ms(260)} color="0,180,154" opacity={0.55} style={styles.glowTeal} />
    <RadialGlow size={ms(220)} color="240,180,41" opacity={0.35} style={styles.glowYellow} />

    <KeyboardAwareScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <BrandMark size={82} style={shadow.teal} />
        <AppText
          variant="display"
          size={40}
          tracking={4}
          align="center"
          color={colors.white}
          style={styles.title}>
          {title}
        </AppText>
        {tagline ? (
          <AppText
            variant="mono"
            size={10}
            tracking={2.2}
            uppercase
            align="center"
            color={colors.teal}
            style={styles.tagline}>
            {tagline}
          </AppText>
        ) : null}
      </View>

      <View style={styles.body}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </KeyboardAwareScrollView>
  </View>
);

const styles = ScaledSheet.create({
  screen: {flex: 1, overflow: 'hidden', backgroundColor: colors.authBg},
  glowTeal: {position: 'absolute', top: '-80@vs', right: '-80@s'},
  glowYellow: {position: 'absolute', bottom: '-100@vs', left: '-60@s'},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: '32@s',
    paddingTop: '40@vs',
    paddingBottom: '24@vs',
  },
  head: {alignItems: 'center', paddingTop: '24@vs'},
  title: {marginTop: '22@vs', lineHeight: '48@ms'},
  tagline: {marginTop: '8@vs'},
  body: {flex: 1, justifyContent: 'center', marginTop: '28@vs'},
  footer: {paddingTop: '20@vs'},
});

export const authAlpha = alpha;

export default AuthLayout;
