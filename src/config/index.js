/**
 * Environment / API configuration.
 *
 * Kept in one file so switching between the live server and a local Laravel
 * instance is a single edit.
 */

/** Live Trust TAT backend. */
export const PROD_API_BASE_URL = 'https://trusttat.mytrustlab.co.in/api/v1';

/**
 * Local Laravel dev server (`php artisan serve --host=0.0.0.0`). Must be the
 * machine's LAN IP — `localhost` on a phone points at the phone itself.
 * Cleartext HTTP to this host is allowed in debug builds only.
 */
export const DEV_API_BASE_URL = 'http://192.168.29.171:8777/api/v1';

/**
 * Debug builds hit the live server too. Set back to `false` to point a debug
 * build at the local Laravel above.
 */
const USE_PROD_API_IN_DEV = true;

export const API_BASE_URL =
  __DEV__ && !USE_PROD_API_IN_DEV ? DEV_API_BASE_URL : PROD_API_BASE_URL;

/** Milliseconds before a request is abandoned. */
export const API_TIMEOUT = 30000;

/**
 * Play Store identity, used by the force-update gate. Must match
 * `applicationId` in android/app/build.gradle.
 */
export const ANDROID_PACKAGE_ID = 'com.app.trusttat';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;

/** AsyncStorage keys. Namespaced so they never collide with library keys. */
export const STORAGE_KEYS = {
  TOKEN: '@tat/auth_token',
  USER: '@tat/auth_user',
  DEVICE_ID: '@tat/device_id',
};

/** Stable `code` values the API returns alongside 4xx responses. */
export const API_CODES = {
  ACCOUNT_SUSPENDED: 'account_suspended',
  ACCOUNT_INVITED: 'account_invited',
  PASSWORD_CHANGE_REQUIRED: 'password_change_required',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  STORAGE_KEYS,
  API_CODES,
  ANDROID_PACKAGE_ID,
  PLAY_STORE_URL,
};
