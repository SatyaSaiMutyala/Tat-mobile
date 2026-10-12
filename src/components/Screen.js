import React from 'react';
import {View, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors, ScaledSheet} from '../theme';

/**
 * Page shell — safe-area insets + status bar styling.
 * `barStyle` matches the reference design's light/dark status bar states.
 */
const Screen = ({
  children,
  backgroundColor = colors.paper,
  barStyle = 'dark-content',
  statusBarColor,
  edges = ['top'],
  style,
}) => (
  <SafeAreaView edges={edges} style={[styles.safe, {backgroundColor}]}>
    <StatusBar
      barStyle={barStyle}
      backgroundColor={statusBarColor || backgroundColor}
      translucent={false}
    />
    <View style={[styles.body, style]}>{children}</View>
  </SafeAreaView>
);

const styles = ScaledSheet.create({
  safe: {flex: 1},
  body: {flex: 1},
});

export default Screen;
