import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, Linking, Platform} from 'react-native';
import VersionCheck from 'react-native-version-check';

import {ANDROID_PACKAGE_ID, PLAY_STORE_URL} from '../config';

/**
 * Force-update gate.
 *
 * Reads the version published on the Play Store listing and compares it with
 * the installed build's `versionName`. When the store is ahead, the caller
 * shows a dialog with no dismiss path.
 *
 * • Release builds only — a debug build is never blocked.
 * • Fails open: any error (offline, listing markup changed, app not yet
 *   published) leaves the gate shut, so a flaky check can't lock users out.
 * • Re-checks on every return to the foreground, which covers the user who
 *   opens the Play Store, doesn't actually update, and comes back.
 *
 * Each release MUST bump `versionName` in android/app/build.gradle — raising
 * only `versionCode` leaves the two versions comparing equal and the gate
 * never fires.
 */
const useForceUpdate = () => {
  const [storeVersion, setStoreVersion] = useState(null);
  const inFlight = useRef(false);

  const check = useCallback(async () => {
    // iOS has no store listing to read until the app ships there; add an
    // App Store id here when it does.
    if (__DEV__ || Platform.OS !== 'android' || inFlight.current) {
      return;
    }
    inFlight.current = true;
    try {
      // `needUpdate()` swallows its own errors and resolves `undefined` when
      // the lookup fails, so a missing result must never read as "update
      // needed".
      const result = await VersionCheck.needUpdate();
      if (result && result.isNeeded) {
        setStoreVersion(result.latestVersion);
      }
    } catch (e) {
      // Never block on a failed check.
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    check();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        check();
      }
    });
    return () => sub.remove();
  }, [check]);

  const openStore = useCallback(() => {
    // `market://` hands straight to the Play Store app. Deliberately no
    // `canOpenURL()` guard — on Android 11+ that returns false unless the
    // scheme is declared in <queries>, which would strand the user behind a
    // dialog they cannot dismiss. Try it, then fall back to the browser.
    Linking.openURL(`market://details?id=${ANDROID_PACKAGE_ID}`).catch(() => {
      Linking.openURL(PLAY_STORE_URL).catch(() => {});
    });
  }, []);

  return {updateRequired: storeVersion !== null, storeVersion, openStore};
};

export default useForceUpdate;
