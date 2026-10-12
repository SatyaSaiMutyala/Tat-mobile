import {Platform, PermissionsAndroid} from 'react-native';
// Modular API — the namespaced `messaging()` default export is deprecated and
// warns on every call.
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh as onFcmTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

import {
  registerDeviceRequest,
  unregisterDeviceRequest,
} from './notificationsApi';
import {getDeviceName} from './api';

/** Must match config('fcm.android_channel_id') on the server. */
const CHANNEL_ID = 'tat-alerts';

/**
 * Android 8+ drops notifications with no channel, so create it before any
 * message can arrive.
 */
export const ensureChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'TAT alerts',
    importance: AndroidImportance.HIGH,
  });
};

/**
 * Asks for notification permission.
 * Android 13+ needs the runtime POST_NOTIFICATIONS grant; older versions are
 * granted at install time.
 */
export const requestPushPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const status = await requestPermission(getMessaging());
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

/** Current FCM registration token, or null if permission was refused. */
export const getPushToken = async () => {
  try {
    return await getToken(getMessaging());
  } catch {
    return null;
  }
};

/**
 * Registers this install against the signed-in user. Safe to call on every
 * launch — the server upserts on the token.
 */
export const registerDevice = async () => {
  const granted = await requestPushPermission();
  if (!granted) {
    return null;
  }

  await ensureChannel();

  const token = await getPushToken();
  if (!token) {
    return null;
  }

  await registerDeviceRequest({
    token,
    platform: Platform.OS,
    device_name: await getDeviceName(),
  });

  return token;
};

/** Called on sign-out so this handset stops receiving that user's pushes. */
export const unregisterDevice = async () => {
  try {
    const token = await getPushToken();
    if (token) {
      await unregisterDeviceRequest(token);
    }
  } catch {
    // Best effort — signing out locally must succeed regardless.
  }
};

/**
 * Foreground messages are delivered silently by FCM, so display them with
 * notifee. Returns an unsubscribe function.
 */
export const onForegroundMessage = handler =>
  onMessage(getMessaging(), async remoteMessage => {
    await ensureChannel();

    await notifee.displayNotification({
      title: remoteMessage.notification?.title ?? 'Trust TAT',
      body: remoteMessage.notification?.body ?? '',
      data: remoteMessage.data,
      android: {
        channelId: CHANNEL_ID,
        pressAction: {id: 'default'},
        smallIcon: 'ic_launcher',
      },
    });

    handler?.(remoteMessage);
  });

/** Fires when a token is rotated by FCM; re-register so pushes keep arriving. */
export const onTokenRefresh = () =>
  onFcmTokenRefresh(getMessaging(), async token => {
    try {
      await registerDeviceRequest({
        token,
        platform: Platform.OS,
        device_name: await getDeviceName(),
      });
    } catch {
      // Retried on next launch.
    }
  });
