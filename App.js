/**
 * Trust TAT — TrustLab Diagnostics mobile app
 *
 * @format
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';

import {Toast} from './src/components';
import RootNavigator from './src/navigation/RootNavigator';
import usePushNotifications from './src/hooks/usePushNotifications';
import store from './src/store';

/** Lives inside <Provider> so it can reach the store. */
const AppShell = () => {
  usePushNotifications();

  return (
    <View style={styles.root}>
      <RootNavigator />
      <Toast />
    </View>
  );
};

const App = () => (
  <GestureHandlerRootView style={styles.root}>
    <Provider store={store}>
      <SafeAreaProvider>
        <AppShell />
      </SafeAreaProvider>
    </Provider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: {flex: 1},
});

export default App;
