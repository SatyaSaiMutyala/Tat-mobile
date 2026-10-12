/**
 * @format
 */
import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import App from './App';
import {name as appName} from './app.json';

/**
 * Background/quit-state messages. Must be registered outside the component
 * tree — the app may not be running when one arrives.
 *
 * FCM displays the notification itself for background messages, so there is
 * nothing to draw here; the list refreshes when the app is next opened.
 */
setBackgroundMessageHandler(getMessaging(), async () => {});

AppRegistry.registerComponent(appName, () => App);
