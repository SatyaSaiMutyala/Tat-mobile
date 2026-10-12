import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';

import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectIsAuthenticated} from '../store/slices/authSlice';
import {
  fetchNotifications,
  selectNotifications,
} from '../store/slices/notificationsSlice';
import {registerDevice, onForegroundMessage, onTokenRefresh} from '../services/push';

/**
 * Ties push messaging to the session:
 *  - registers this install's FCM token once signed in
 *  - keeps it current when FCM rotates the token
 *  - refreshes the stored notification list when a push lands in foreground
 *
 * Mounted once, at the app root.
 */
export const usePushNotifications = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const {status} = useAppSelector(selectNotifications);

  // Register after sign-in — the token must be attached to a known user.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    registerDevice().catch(() => {
      // Permission refused or Firebase unavailable; the in-app list still works.
    });

    dispatch(fetchNotifications({refresh: true}));
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }
    const unsubscribe = onTokenRefresh();
    return () => unsubscribe?.();
  }, [isAuthenticated]);

  // A push arriving while the app is open should update the badge immediately.
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const unsubscribe = onForegroundMessage(() => {
      if (status !== 'loading') {
        dispatch(fetchNotifications({refresh: true}));
      }
    });

    return () => unsubscribe?.();
  }, [dispatch, isAuthenticated, status]);

  // A push that arrives while the app is backgrounded is handled by the OS, not
  // by JS, so the store knows nothing about it. Without this the unread badge
  // stays stale until the next cold start — the tab screens all stay mounted,
  // so simply opening Alerts does not refetch either.
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const sub = AppState.addEventListener('change', next => {
      const resumed = appState.current.match(/inactive|background/) && next === 'active';
      appState.current = next;

      if (resumed) {
        dispatch(fetchNotifications({refresh: true}));
      }
    });

    return () => sub.remove();
  }, [dispatch, isAuthenticated]);
};

export default usePushNotifications;
